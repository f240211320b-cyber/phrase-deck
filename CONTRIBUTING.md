# 贡献指南

感谢愿意补一条素材或改一处代码。这个项目刻意保持「小」：没有依赖、
没有构建产物入库、没有格式化工具链。所以流程也很短。

## 提交流程

```bash
git clone https://github.com/OWNER/REPO.git
cd REPO
git checkout -b feat/add-phrases

# 1. 改数据 / 改代码
# 2. 本地自检
python tools/test_build.py
python tools/build.py --check

# 3. 提交
git add -A
git commit -m "feat: 新增 2 条关于独处的素材"
git push origin feat/add-phrases
```

然后在 GitHub 上开 Pull Request。CI 会自动跑测试与构建校验，
两个都绿了就可以合。

## 新增素材的两条硬规则

1. **`id` 必须以所属话题带代码开头**，并且全局唯一（`A5`、`J5` …）。
   校验器会拦下 `id 应以话题带代码 A 开头` 这类问题。
2. **一条只讲一个观点**。情感类内容最常见的翻车是「一条里讲了三个道理」，
   观众一个都记不住——这也是 `key` 里 ①②③ 只拆语法、不拆观点的原因。

## 什么算「合规」的一条

- `en`：地道、可朗读、能在 3 秒内被听懂，不要生僻词堆砌；
- `zh`：是**再创作**的中文，不是逐字直译；
- `key`：拆句法、拆搭配、拆语气，1–3 点，用 ①②③ 编号；
- `hook`：一句话，能直接当标题或封面文案；
- 不出现明确的「他 / 她」性别指向，用「有人」「对方」「那个人」替代
  （`bands[].note` 里对每个带的风险有具体说明）。

## 代码约定

- `assets/app.js` 用 ES5 语法 + IIFE，保证任何浏览器直接打开都能跑；
- `tools/build.py` 只用标准库，新增功能请不要引入 `requirements.txt`；
- 改 `tools/build.py` 时同步补 `tools/test_build.py` 的用例；
- 生成的 `dist/` 不入库（已在 `.gitignore` 里）。

## 提交信息

用 `feat:` / `fix:` / `docs:` / `refactor:` / `test:` 前缀，
后面一句中文说明这次改了什么、为什么这么改。
