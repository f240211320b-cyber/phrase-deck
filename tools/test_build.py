#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""tools/build.py 的单元测试（标准库 unittest，无需 pytest）

运行：
    python tools/test_build.py
"""

from __future__ import annotations

import copy
import csv
import io
import json
import shutil
import sys
import unittest
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import build  # noqa: E402

# 用工程目录内的临时目录，避免部分受限环境无法读删系统 TEMP
TMP_ROOT = build.ROOT / ".tmp-test"


def make_tmp(name: str) -> Path:
    path = TMP_ROOT / name
    shutil.rmtree(path, ignore_errors=True)
    path.mkdir(parents=True, exist_ok=True)
    return path


class LoadAndValidateTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.data = build.load_data()

    def test_load_returns_expected_shape(self) -> None:
        self.assertIn("meta", self.data)
        self.assertIn("bands", self.data)
        self.assertIn("items", self.data)
        self.assertEqual(len(self.data["bands"]), 10)
        self.assertEqual(len(self.data["items"]), 36)

    def test_load_finds_json_inside_js_wrapper(self) -> None:
        self.assertEqual(self.data["meta"]["title"], "双语金句素材库")

    def test_shipped_data_is_valid(self) -> None:
        self.assertEqual(build.validate(self.data), [])

    def test_all_item_ids_unique_and_prefixed(self) -> None:
        ids = [item["id"] for item in self.data["items"]]
        self.assertEqual(len(ids), len(set(ids)))
        for item in self.data["items"]:
            self.assertTrue(item["id"].startswith(item["band"]))

    def test_missing_required_field_is_reported(self) -> None:
        broken = copy.deepcopy(self.data)
        broken["items"][0].pop("zh")
        errors = build.validate(broken)
        self.assertTrue(any("缺少字段 zh" in e for e in errors), errors)

    def test_duplicate_id_is_reported(self) -> None:
        broken = copy.deepcopy(self.data)
        broken["items"][1]["id"] = broken["items"][0]["id"]
        self.assertTrue(any("id 重复" in e for e in build.validate(broken)))

    def test_unknown_band_is_reported(self) -> None:
        broken = copy.deepcopy(self.data)
        broken["items"][0]["band"] = "Z"
        self.assertTrue(any("band 不存在" in e for e in build.validate(broken)))

    def test_english_sentence_without_latin_is_reported(self) -> None:
        broken = copy.deepcopy(self.data)
        broken["items"][0]["en"] = "这句话里没有英文"
        self.assertTrue(any("没有英文字母" in e for e in build.validate(broken)))

    def test_duplicate_english_is_reported(self) -> None:
        broken = copy.deepcopy(self.data)
        broken["items"][1]["en"] = broken["items"][0]["en"]
        self.assertTrue(any("英文句子重复" in e for e in build.validate(broken)))

    def test_invalid_form_is_reported(self) -> None:
        broken = copy.deepcopy(self.data)
        broken["items"][0]["form"] = "Z"
        self.assertTrue(any("form 只能是" in e for e in build.validate(broken)))


class BuildOutputTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.out = make_tmp("build")
        cls.data = build.load_data()
        build.build(cls.out)

    @classmethod
    def tearDownClass(cls) -> None:
        shutil.rmtree(TMP_ROOT, ignore_errors=True)

    def test_all_artifacts_exist(self) -> None:
        for name in ("phrases.json", "phrases.csv", "双语金句素材库.html", "双语金句素材库.docx"):
            self.assertTrue((self.out / name).is_file(), name)

    def test_json_roundtrip(self) -> None:
        exported = json.loads((self.out / "phrases.json").read_text(encoding="utf-8"))
        self.assertEqual(len(exported["items"]), len(self.data["items"]))
        self.assertEqual(exported["items"][0]["id"], self.data["items"][0]["id"])

    def test_csv_has_bom_and_all_rows(self) -> None:
        raw = (self.out / "phrases.csv").read_bytes()
        self.assertTrue(raw.startswith(b"\xef\xbb\xbf"), "CSV 应带 UTF-8 BOM")
        rows = list(csv.reader(io.StringIO(raw.decode("utf-8-sig"))))
        self.assertEqual(rows[0][0], "id")
        self.assertEqual(len(rows), len(self.data["items"]) + 1)

    def test_docx_is_valid_package(self) -> None:
        path = self.out / "双语金句素材库.docx"
        with zipfile.ZipFile(path) as zf:
            names = set(zf.namelist())
            for part in (
                "[Content_Types].xml",
                "_rels/.rels",
                "word/document.xml",
                "word/styles.xml",
                "word/_rels/document.xml.rels",
            ):
                self.assertIn(part, names)
            for part in ("word/document.xml", "word/styles.xml", "[Content_Types].xml"):
                ET.fromstring(zf.read(part))  # 解析失败会直接抛异常

    def test_docx_contains_item_text(self) -> None:
        path = self.out / "双语金句素材库.docx"
        with zipfile.ZipFile(path) as zf:
            xml = zf.read("word/document.xml").decode("utf-8")
        sample = self.data["items"][0]
        self.assertIn(sample["en"][:20], xml)
        self.assertIn(sample["zh"][:6], xml)

    def test_print_html_is_standalone(self) -> None:
        html = (self.out / "双语金句素材库.html").read_text(encoding="utf-8")
        self.assertIn("<style>", html)
        self.assertNotIn("<script", html)
        self.assertIn("@page", html)
        self.assertEqual(html.count('<section class="band">'), len(self.data["bands"]))


class CliTests(unittest.TestCase):
    def test_check_mode_returns_zero(self) -> None:
        self.assertEqual(build.main(["--check"]), 0)

    def test_bad_data_returns_one(self) -> None:
        original = build.load_data

        def broken_loader(path=None):  # noqa: ANN001
            data = copy.deepcopy(original())
            data["items"][0].pop("en")
            return data

        build.load_data = broken_loader
        try:
            tmp = make_tmp("cli")
            self.assertEqual(build.main(["--out", str(tmp)]), 1)
        finally:
            build.load_data = original
            shutil.rmtree(TMP_ROOT, ignore_errors=True)


if __name__ == "__main__":
    unittest.main(verbosity=2)
