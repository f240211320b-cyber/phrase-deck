#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""双语金句素材库 · 零依赖构建脚本

只使用 Python 标准库，不需要 pip install，也不需要 Node / 打包工具。

用法：
    python tools/build.py              # 校验数据 + 生成 dist/
    python tools/build.py --check      # 只校验，不生成文件
    python tools/build.py --out 目录   # 指定输出目录

产物（dist/）：
    phrases.json        完整数据（含 meta / bands / items）
    phrases.csv         适合 Excel 打开的表格（UTF-8 BOM）
    双语金句素材库.html  可打印 / 可另存 PDF 的单文件页
    双语金句素材库.docx  Word 文档（手写 OOXML，无第三方库）
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
import zipfile
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "phrases.js"
DEFAULT_OUT = ROOT / "dist"

REQUIRED_ITEM_FIELDS = ("id", "band", "en", "zh")
OPTIONAL_ITEM_FIELDS = ("form", "key", "hook")
FORMS = ("A", "B", "C", "D")


# --------------------------------------------------------------------------
# 读取数据
# --------------------------------------------------------------------------

def load_data(path: Path = DATA_FILE) -> dict:
    """从 data/phrases.js 中取出 window.PHRASES 的 JSON 载荷。

    文件里可能有多处 window.PHRASES 字样（例如注释），因此逐个尝试
    raw_decode，取第一个能解析成对象的。
    """
    text = path.read_text(encoding="utf-8")
    marker = "window.PHRASES"
    decoder = json.JSONDecoder()

    for match in re.finditer(re.escape(marker), text):
        start = text.find("{", match.end())
        if start == -1:
            continue
        try:
            obj, _ = decoder.raw_decode(text, start)
        except json.JSONDecodeError:
            continue
        if isinstance(obj, dict):
            return obj

    raise ValueError(f"{path} 中找不到可解析的 window.PHRASES 对象")


# --------------------------------------------------------------------------
# 校验
# --------------------------------------------------------------------------

CJK_RE = re.compile(r"[\u4e00-\u9fff]")
LATIN_RE = re.compile(r"[A-Za-z]")


def validate(data: dict) -> list[str]:
    """返回问题列表；空列表表示通过。"""
    errors: list[str] = []

    if not isinstance(data, dict):
        return ["数据根节点必须是对象"]

    for key in ("meta", "bands", "items"):
        if key not in data:
            errors.append(f"缺少顶层字段：{key}")
    if errors:
        return errors

    bands = data["bands"]
    items = data["items"]

    if not isinstance(bands, list) or not bands:
        errors.append("bands 必须是非空数组")
        bands = []
    if not isinstance(items, list) or not items:
        errors.append("items 必须是非空数组")
        items = []

    seen_band: set[str] = set()
    for i, band in enumerate(bands):
        where = f"bands[{i}]"
        code = band.get("code")
        if not code:
            errors.append(f"{where} 缺少 code")
            continue
        if code in seen_band:
            errors.append(f"{where} code 重复：{code}")
        seen_band.add(code)
        for field in ("name", "note", "form", "risk"):
            if not str(band.get(field, "")).strip():
                errors.append(f"{where}({code}) 缺少 {field}")

    seen_id: set[str] = set()
    seen_en: dict[str, str] = {}

    for i, item in enumerate(items):
        where = f"items[{i}]"
        if not isinstance(item, dict):
            errors.append(f"{where} 必须是对象")
            continue

        for field in REQUIRED_ITEM_FIELDS:
            if not str(item.get(field, "")).strip():
                errors.append(f"{where} 缺少字段 {field}")

        item_id = str(item.get("id", "")).strip()
        if item_id:
            where = f"items[{i}]({item_id})"
            if item_id in seen_id:
                errors.append(f"{where} id 重复")
            seen_id.add(item_id)

            band_code = str(item.get("band", "")).strip()
            if band_code and not item_id.startswith(band_code):
                errors.append(f"{where} id 应以话题带代码 {band_code} 开头")

        band_code = str(item.get("band", "")).strip()
        if band_code and band_code not in seen_band:
            errors.append(f"{where} band 不存在：{band_code}")

        form = str(item.get("form", "")).strip()
        if form and form not in FORMS:
            errors.append(f"{where} form 只能是 {'/'.join(FORMS)}，当前为 {form}")

        en = str(item.get("en", "")).strip()
        zh = str(item.get("zh", "")).strip()

        if en and not LATIN_RE.search(en):
            errors.append(f"{where} en 里没有英文字母")
        if zh and not CJK_RE.search(zh):
            errors.append(f"{where} zh 里没有中文字符")
        if en and "  " in en:
            errors.append(f"{where} en 中存在连续空格")
        if en:
            key = en.lower()
            if key in seen_en:
                errors.append(f"{where} 与 {seen_en[key]} 的英文句子重复")
            else:
                seen_en[key] = item_id or where

        for field in OPTIONAL_ITEM_FIELDS:
            value = item.get(field)
            if value is not None and not isinstance(value, str):
                errors.append(f"{where} {field} 必须是字符串")

    return errors


# --------------------------------------------------------------------------
# 导出：JSON / CSV
# --------------------------------------------------------------------------

def write_json(data: dict, out_dir: Path) -> Path:
    path = out_dir / "phrases.json"
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return path


def write_csv(data: dict, out_dir: Path) -> Path:
    band_name = {b["code"]: b for b in data["bands"]}
    path = out_dir / "phrases.csv"
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\r\n")
    writer.writerow(["id", "band", "band_name", "form", "risk", "en", "zh", "key", "hook"])
    for item in data["items"]:
        band = band_name.get(item["band"], {})
        writer.writerow([
            item["id"], item["band"], band.get("name", ""),
            item.get("form", ""), band.get("risk", ""),
            item["en"], item["zh"], item.get("key", ""), item.get("hook", ""),
        ])
    # 加 BOM，Excel 直接双击不会乱码
    path.write_text("\ufeff" + buffer.getvalue(), encoding="utf-8")
    return path


# --------------------------------------------------------------------------
# 导出：可打印 HTML
# --------------------------------------------------------------------------

PRINT_CSS = """
@page { size: A4; margin: 16mm 14mm; }
* { box-sizing: border-box; }
body {
  margin: 0; background: #fff; color: #1c1b19;
  font: 10.5pt/1.7 system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
}
h1 { font-size: 20pt; margin: 0 0 4px; letter-spacing: .01em; }
.sub { color: #6b6760; font-size: 9pt; margin: 0 0 20px; }
.band { margin: 0 0 18px; break-inside: auto; }
h2 {
  font-size: 11pt; margin: 18px 0 8px; padding-bottom: 4px;
  border-bottom: 1px solid #cfcac0; break-after: avoid;
}
h2 small { font-weight: 400; color: #6b6760; font-size: 8.5pt; margin-left: 6px; }
ol { margin: 0; padding: 0; list-style: none; }
li {
  margin: 0 0 12px; padding: 8px 10px; border: 1px solid #e3e0d8;
  border-radius: 6px; break-inside: avoid; page-break-inside: avoid;
}
.en { font-family: Georgia, "Times New Roman", serif; font-size: 11pt; margin: 0 0 3px; }
.zh { margin: 0 0 4px; color: #3a3733; }
.key { margin: 0; color: #6b6760; font-size: 8.5pt; line-height: 1.65; }
.hook { margin: 4px 0 0; color: #b4532a; font-size: 9pt; }
.id { color: #a49e94; font-size: 8pt; margin-left: 4px; }
.tip {
  position: fixed; right: 16px; bottom: 16px; background: #1c1b19; color: #fff;
  padding: 8px 12px; border-radius: 999px; font-size: 9pt; box-shadow: 0 4px 14px rgba(0,0,0,.25);
}
@media print { .tip { display: none; } }
"""


def write_print_html(data: dict, out_dir: Path) -> Path:
    meta = data["meta"]
    bands = data["bands"]
    by_band: dict[str, list[dict]] = {}
    for item in data["items"]:
        by_band.setdefault(item["band"], []).append(item)

    parts: list[str] = [
        "<!DOCTYPE html>",
        '<html lang="zh-CN">',
        "<head>",
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        f'<title>{xml_escape(meta["title"])}</title>',
        f"<style>{PRINT_CSS}</style>",
        "</head>",
        "<body>",
        f'<h1>{xml_escape(meta["title"])}</h1>',
        f'<p class="sub">{xml_escape(meta.get("titleEn", ""))} · '
        f'{len(data["items"])} 条 · {len(bands)} 个话题带 · 生成于 {date.today().isoformat()}</p>',
    ]

    for band in bands:
        items = by_band.get(band["code"], [])
        if not items:
            continue
        parts.append('<section class="band">')
        parts.append(
            f'<h2>{xml_escape(band["code"])} · {xml_escape(band["name"])}'
            f'<small>{xml_escape(band.get("form", ""))} · 商用风险 {xml_escape(band.get("risk", ""))}</small></h2>'
        )
        parts.append("<ol>")
        for item in items:
            parts.append("<li>")
            parts.append(
                f'<p class="en">{xml_escape(item["en"])}'
                f'<span class="id">{xml_escape(item["id"])}</span></p>'
            )
            parts.append(f'<p class="zh">{xml_escape(item["zh"])}</p>')
            if item.get("key"):
                parts.append(f'<p class="key">{xml_escape(item["key"])}</p>')
            if item.get("hook"):
                parts.append(f'<p class="hook">↳ {xml_escape(item["hook"])}</p>')
            parts.append("</li>")
        parts.append("</ol>")
        parts.append("</section>")

    parts.append('<p class="tip">Ctrl / ⌘ + P 另存为 PDF</p>')
    parts.append("</body></html>")

    path = out_dir / "双语金句素材库.html"
    path.write_text("\n".join(parts) + "\n", encoding="utf-8")
    return path


# --------------------------------------------------------------------------
# 导出：DOCX（手写 OOXML，标准库 zipfile）
# --------------------------------------------------------------------------

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""

ROOT_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

DOC_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

STYLES = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="{W_NS}">
  <w:docDefaults>
    <w:rPrDefault><w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Microsoft YaHei" w:cs="Calibri"/>
      <w:sz w:val="21"/><w:szCs w:val="21"/>
    </w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="80" w:line="288" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/><w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="120"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="44"/><w:szCs w:val="44"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle">
    <w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr>
    <w:rPr><w:color w:val="6B6760"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>
    <w:pPr><w:keepNext/><w:spacing w:before="320" w:after="120"/>
      <w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="CFCAC0"/></w:pBdr>
    </w:pPr>
    <w:rPr><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr>
  </w:style>
</w:styles>"""


def _p(text: str = "", *, style: str | None = None, bold: bool = False,
       italic: bool = False, size: int | None = None, color: str | None = None,
       align: str | None = None, after: int | None = None, indent: int | None = None) -> str:
    """生成一个 <w:p> 段落。size 单位是半磅（half-point）。"""
    ppr: list[str] = []
    if style:
        ppr.append(f'<w:pStyle w:val="{style}"/>')
    if align:
        ppr.append(f'<w:jc w:val="{align}"/>')
    if after is not None:
        ppr.append(f'<w:spacing w:after="{after}"/>')
    if indent is not None:
        ppr.append(f'<w:ind w:left="{indent}"/>')

    rpr: list[str] = []
    if bold:
        rpr.append("<w:b/>")
    if italic:
        rpr.append("<w:i/>")
    if color:
        rpr.append(f'<w:color w:val="{color}"/>')
    if size:
        rpr.append(f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/>')

    p_open = f"<w:p><w:pPr>{''.join(ppr)}</w:pPr>" if ppr else "<w:p>"
    if rpr:
        run = f'<w:r><w:rPr>{"".join(rpr)}</w:rPr><w:t xml:space="preserve">{xml_escape(text)}</w:t></w:r>'
    elif text:
        run = f'<w:r><w:t xml:space="preserve">{xml_escape(text)}</w:t></w:r>'
    else:
        run = ""
    return f"{p_open}{run}</w:p>"


def build_document_xml(data: dict) -> str:
    meta = data["meta"]
    bands = data["bands"]
    by_band: dict[str, list[dict]] = {}
    for item in data["items"]:
        by_band.setdefault(item["band"], []).append(item)

    body: list[str] = [
        _p(meta["title"], style="Title"),
        _p(f'{meta.get("titleEn", "")} · {len(data["items"])} 条 · {len(bands)} 个话题带',
           style="Subtitle"),
        _p(f'生成日期：{date.today().isoformat()}　　数据源：data/phrases.js　　许可：{meta.get("license", "MIT")}',
           align="center", size=16, color="6B6760", after=320),
    ]

    for band in bands:
        items = by_band.get(band["code"], [])
        if not items:
            continue
        heading = f'{band["code"]} · {band["name"]}'
        body.append(_p(heading, style="Heading1"))
        body.append(_p(
            f'{band.get("form", "")} · 商用风险 {band.get("risk", "")} · {band.get("note", "")}',
            size=16, color="6B6760", after=160,
        ))
        for item in items:
            body.append(_p(f'{item["en"]}　[{item["id"]}]', size=24, bold=True, after=40))
            body.append(_p(item["zh"], size=21, after=40))
            if item.get("key"):
                body.append(_p(item["key"], size=16, color="6B6760", after=40))
            if item.get("hook"):
                body.append(_p(f'↳ {item["hook"]}', size=17, italic=True, color="B4532A", after=200))

    sect = (
        '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
        '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" '
        'w:header="567" w:footer="567" w:gutter="0"/></w:sectPr>'
    )

    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        f'<w:document xmlns:w="{W_NS}"><w:body>'
        + "".join(body) + sect +
        "</w:body></w:document>"
    )


def write_docx(data: dict, out_dir: Path) -> Path:
    path = out_dir / "双语金句素材库.docx"
    document = build_document_xml(data)
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", CONTENT_TYPES)
        zf.writestr("_rels/.rels", ROOT_RELS)
        zf.writestr("word/_rels/document.xml.rels", DOC_RELS)
        zf.writestr("word/styles.xml", STYLES)
        zf.writestr("word/document.xml", document)
    return path


# --------------------------------------------------------------------------
# 主流程
# --------------------------------------------------------------------------

def build(out_dir: Path = DEFAULT_OUT, check_only: bool = False) -> dict:
    data = load_data()
    errors = validate(data)
    if errors:
        raise ValueError("数据校验失败：\n  - " + "\n  - ".join(errors))

    if check_only:
        return {"items": len(data["items"]), "bands": len(data["bands"])}

    out_dir.mkdir(parents=True, exist_ok=True)
    outputs = [
        write_json(data, out_dir),
        write_csv(data, out_dir),
        write_print_html(data, out_dir),
        write_docx(data, out_dir),
    ]
    return {
        "items": len(data["items"]),
        "bands": len(data["bands"]),
        "outputs": outputs,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="校验数据并导出 JSON / CSV / HTML / DOCX")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="输出目录，默认 dist/")
    parser.add_argument("--check", action="store_true", help="只校验数据，不生成文件")
    args = parser.parse_args(argv)

    try:
        result = build(args.out, check_only=args.check)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    print(f"✓ 校验通过：{result['items']} 条素材 / {result['bands']} 个话题带")
    for path in result.get("outputs", []):
        size = path.stat().st_size
        print(f"  · {path.relative_to(ROOT)}  ({size:,} 字节)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
