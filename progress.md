# 志凡焊材网站项目进度与交接记录

更新时间：2026-06-26
项目目录：`C:\Users\Ning Sun\Documents\Codex\2026-06-23\new-chat\outputs\welding-distributor-site`
当前本地 HEAD：`b33b1b9 补充产品数据并优化问答搜索响应式`
远程仓库：`https://github.com/LuckyOverlord98/Zhifan.git`
线上域名：`zhifanwelding.com.cn`
ECS：`121.196.211.59`，凭据只在安全上下文中使用，不写入仓库。

## 项目目标

宁波志凡焊材有限公司企业官网，面向船厂、钢结构、机械、压力容器、电力、石化等 B2B 客户。核心表达是：焊材经销备货量大、品类全、响应快、能提供原厂质保书和项目保供。

当前架构已经从静态页升级为 React + Node.js + MongoDB：

- 首页负责品牌形象、产品分类入口、行业方案、焊接知识、资质服务和联系表单。
- 产品中心使用 MongoDB/JSON 数据源，不把产品写死在 React。
- 产品路径是：首页产品分类卡片 -> 分类清单页 -> 型号详情页。
- 焊接知识路径是：首页知识入口 -> 八大类问题列表 -> 单篇问答页面。
- 咨询表单写入 MongoDB，支持客户位置字段。

## 强制开发与编译要求

以后默认使用 PowerShell 7 编译和运行，不使用 Windows PowerShell 5：

```powershell
& 'C:\Users\Ning Sun\Documents\Codex\2026-06-23\new-chat\.tools\PowerShell\7\pwsh.exe'
```

常用命令必须在项目目录执行：

```powershell
cd 'C:\Users\Ning Sun\Documents\Codex\2026-06-23\new-chat\outputs\welding-distributor-site'
npm.cmd run preflight
npm.cmd run build
npm.cmd run dev
npm.cmd run server
```

每次准备 push 或 ECS 部署前，必须先跑：

```powershell
npm.cmd run preflight
git status --short
```

只有 preflight 通过、没有意外未提交文件时，再 commit/push/deploy。若沙盒阻止 Vite/esbuild 写缓存，使用带权限的方式重跑本地验证。

所有中文文件和脚本保持 UTF-8 无 BOM。不要用 `cat > file`、重定向或不确定编码的 shell 写入中文文件；手工改代码用 `apply_patch`，批量机械处理可用脚本，但要校验编码。

## 技术栈

- 前端：React 19、Vite 6、原生 CSS。
- 后端：Node.js、Express、Mongoose。
- 数据库：MongoDB，默认库名 `zhifan_welding`。
- 缓存：目前是服务端内存缓存，TTL 约 2 分钟；暂未引入 Redis。
- 部署：ECS + Node 服务 + Nginx 反代，线上要检查 `/api/health` 和 `/styles.css` MIME。
- 静态文章：`public/articles`，构建后进入 `dist/articles`。

## 目录结构重点

```text
data/jinqiao-products.json              产品数据主文件，含金桥与上海东风等产品
server/index.js                         Express API、Mongo schema、搜索、缓存、静态资源服务
src/App.jsx                             页面主结构、路由、详情页、知识页
src/components/ProductSearch.jsx        首页/全局产品搜索组件
src/data/productCatalog.js              8 大产品分类配置
scripts/preflight.cjs                   本地质量闸门
scripts/seed-products.js                产品导入 MongoDB
scripts/import-dongfeng-products.py     上海东风 PDF 产品导入
scripts/enrich-jinqiao-content.py       金桥产品介绍和适用场景补充
public/articles                         焊接知识静态文章
styles.css                              主样式
public/styles.css                       静态文章样式同步输出
dist                                    Vite 构建产物
```

## 数据结构

### Product

核心字段：

```js
{
  slug,
  manufacturer,
  categorySlug,
  categoryName,
  model,
  name,
  standard,
  standards,
  summary,
  introduction,
  applications,
  composition,
  depositedMetal,
  dimensions,
  certifications,
  notes,
  source
}
```

索引重点：

- `slug` 唯一索引。
- `manufacturer`、`categorySlug`、`model` 普通索引。
- 文本/模糊搜索覆盖 `model`、`name`、`summary`、`standard`、`standards`、`categoryName`、`manufacturer`。
- 组合索引：`categorySlug + manufacturer + model`。

### Inquiry

核心字段：

```js
{
  name,
  phone,
  company,
  customerLocation,
  message,
  status,
  source,
  ip,
  userAgent,
  createdAt,
  updatedAt
}
```

索引重点：

- `createdAt`
- `status + createdAt`
- `customerLocation + createdAt`

### 8 大产品分类

8 个大类暂定不许随意更改：

1. 碳钢焊条
2. 实芯气保及氩弧焊丝
3. 药芯气保焊丝
4. 不锈钢焊材
5. 碳钢埋弧焊丝焊剂
6. 铝焊丝
7. 特种焊材
8. 设备配件与工具

分类规则注意：

- 上海东风：非合金钢及细晶粒钢药芯焊丝归为药芯气保焊丝。
- 上海东风：其他药芯归为特种焊材。
- 上海东风：非合金钢及细晶粒钢焊条归为碳钢焊条。
- 上海东风：其他焊条归为特种焊材。
- NB/T 标准产品需要补充 `NB/T 47018 承压产品`。
- 粗细统一使用 `Φ`，不允许出现 `?` 代替直径符号。
- 粗细信息放在 `dimensions` tile，不要混入熔敷金属。
- 熔敷金属 tile 不要显示任何粗细数据。

## 已完成的重要修改

### 视觉与首页

- 首页首屏换成楼体实景方向，文案改为“宁波 最专业的焊材服务商”“专注焊材领域，精通行标与工况”。
- 26 年统一改为 28 年，并加入 `Founded in 1998`。
- 主色保持蓝色，但减少大面积浅蓝，更多使用白底、浅灰线和蓝色点缀。
- Header 增加滚动后的 contrast 过渡。
- 首页产品中心 7 个/8 个分类入口保持焊材类型，不堆型号。
- 按行业、工艺和标准快速匹配焊材与焊接操作两个 section 已有合并优化方向。
- Tile 风格朝工业 B2B：轻阴影、低透明背景图、渐变遮罩、统一圆角和间距。

### 品牌与资质

- 授权品牌排序要求：上海东风、天津金桥、上海大西洋、天泰、舜鑫，其他品牌随意。
- 已加入多个品牌 logo：东风、金桥、大西洋、天泰、隆兴、上海通用、长城精工、舜鑫、铁锚、捷科、上海泰昌等。
- 品牌超过 5 个时需要半隐藏或折叠，避免首页过长。
- 授权证书增加 slider，支持自动滚动、手动按钮、点击预览。
- 证书图片必须完整显示，不能只露上半截，使用 `object-fit: contain`。

### 产品中心

- 首页产品卡片跳转到分类清单页。
- 分类页支持一级产品大类筛选和厂家筛选，筛选应快速出结果，不应强制跳转。
- 产品搜索支持 like term，覆盖型号、产品名、标准号、厂家和分类。
- 搜索 dropdown 需要跟随搜索框宽度和位置，按 viewport 返回 3-5 个最接近结果，不被 tile 裁切。
- 超过 15 个产品自动分页，并有上一页/下一页按钮。
- 产品详情页已拆成标准、介绍、适用场景、成分、熔敷金属、粗细、认证等 tile。
- 有认证字段的产品显示认证 tile。

### 金桥产品

- 使用 `1_2024产品手册_extracted.txt/md` 和 PDF 提取内容补充金桥产品。
- `scripts/enrich-jinqiao-content.py` 只大范围改动金桥产品的 `introduction` 和 `applications`。
- 金桥产品已大批量按手册补充介绍和适用场景，Word 待补表也已回填。
- `JQ.CE71T-1` 已按手册补充：
  - 产品介绍：氧化钛型气体保护药芯焊丝方向。
  - 适用场景：490MPa 结构钢，船舶、桥梁、工程机械、海洋工程等。
  - 化学成分：包含 C、Mn、Si、P、S 等。
  - 力学性能：包含抗拉强度等。
  - 认证：CCS、LR、BV、ABS、DNV、NK、KR、RINA、CE、TüV。

原待人工补充的金桥型号已按 Word 表回填，保留该 Word 作为来源记录：

`金桥待补充产品介绍与适用场景.docx`

本次已补充/修正的型号包括：

- `JQ.TH500-NQ-II`
- `JQ.TH550-NQ-II`
- `JQ.TH650EW-II`
- `JQ.SAl1070`
- `JQ.SAl1100`
- `JQ.SAl2319`
- `JQ.SAl4043`
- `JQ.SAl4047`
- `JQ.SAl5087`
- `JQ.SAl5183`
- `JQ.SAl5356`
- `JQ.SAl5554`
- `JQ.SAl5556`
- `JQ.SAl5A06`
- `JQ.H08MnMoTiB(H08C)`
- `JQ.H08MnNiTiB(H08D)`
- `JQ.H08MnSiCuCrNi-II`
- `JQ.MG70S-3`
- `JQ.MG50-G-1`

### 上海东风产品

- 已导入上海东风产品，preflight 要求数量不少于 200。
- 已加入分类校验样例：
  - `SH.J422` -> 碳钢焊条
  - `SH.J507` -> 碳钢焊条
  - `SH.Y71T-1` -> 药芯气保焊丝
  - `SH.Y81K2` -> 特种焊材
  - `SH.S50-6` -> 实芯气保及氩弧焊丝
  - `SH.M08MnA` -> 碳钢埋弧焊丝焊剂
  - `SH.S308L` -> 不锈钢焊材
- 后续仍需继续以 PDF 为准核对所有型号、标准、成分、力学性能和适用场景。

### 焊接知识

- 知识文章来自 80 篇问答素材。
- 八大类显示应使用数字加标题，例如 `1. 焊材基础知识`，不要显示异常符号。
- 单篇页面结构要求：
  - 问题 tile 下只放编辑日期。
  - 短答案只显示在短答案 tile。
  - 长答案单独 tile。
  - 不要在问题 tile 下重复短答案。
- 二级/三级页面都要有：
  - 返回上级按钮
  - 同级上一篇/下一篇
  - 联系填单找业务按钮
- 已有 preflight 检查至少 80 篇静态文章、UTF-8 内容和 QA 样式。

### SEO

Meta Description 采用：

```text
宁波志凡焊材有限公司位于宁波市鄞州区富宁路119号，专业批发焊材近二十八年，系金桥、大西洋、东风、天泰、孚尔姆、运河、亚泰等品牌全国一级经销商。年供货量数万吨，常备库存数千吨，全系列覆盖实芯气保焊丝、药芯气保焊丝、埋弧焊丝焊剂、不锈钢及铝焊材，并配套焊割配件与五金工具。主营服务江浙沪及周边船厂、机械厂、钢结构、压力容器、电力工程（火/风/水/核电）及石化项目，提供一站式配货、原厂质保书、项目跟单及专属保供服务，现货充足，宁波48小时、浙江96小时高效送达。
```

所有产品页面、焊接知识页面需要按页面内容生成针对性 metadata、description 和关键词，重点覆盖：

- 宁波焊材批发、浙江焊材供应商、江浙沪焊材配送。
- 船厂焊材、钢结构焊材、压力容器焊材、电力工程焊材、石化焊材。
- 碳钢焊条、气保焊丝、药芯焊丝、埋弧焊丝焊剂、不锈钢焊材、铝焊丝。
- J422、J507、ER50-6、E71T-1、H08MnA、SJ101 等型号词。
- NB/T 47018、AWS、GB/T、ISO、船级社认证、质保书、复验合格等信任词。

## 常见报错与解决方法

### 1. 白屏：React 运行时报错

典型问题：

```text
Uncaught ReferenceError: scrolled is not defined
```

处理：

- 先看浏览器 Console，不要猜 CSS。
- 检查 React state/hook 是否在组件作用域内定义。
- 修复后跑 `npm.cmd run preflight`。

### 2. JS/CSS MIME 错误

典型问题：

```text
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/css".
Refused to apply style ... MIME type ('text/html') is not a supported stylesheet MIME type.
```

处理：

- 检查 Nginx root/try_files 是否把 JS/CSS 请求回退到了 HTML。
- 检查 `/styles.css` 是否返回 `Content-Type: text/css`。
- 线上部署后必须验证：

```powershell
curl -I http://zhifanwelding.com.cn/styles.css
curl -I http://zhifanwelding.com.cn/assets/index-*.js
```

### 3. UTF-8 乱码

症状：

- 中文显示 `???` 或 `�`。
- 静态文章无法正常渲染。

处理：

- VS Code 设置 `"files.encoding": "utf8"`。
- PowerShell 7 profile 设置 UTF-8 输出。
- CMD 临时使用 `chcp 65001`。
- Git Bash 使用 `export LANG=zh_CN.UTF-8`。
- preflight 已检查 `public/articles` 是否出现明显乱码标记。

### 4. 端口占用

Vite 默认 `5173`，Node 默认 `3000`。若 `127.0.0.1:5173` 拒绝连接：

```powershell
netstat -ano | findstr :5173
netstat -ano | findstr :3000
```

必要时换端口或结束旧进程。不要同时开多个旧 Vite 实例。

### 5. 沙盒阻止 build/preflight

症状：

- Vite/esbuild 缓存或 node_modules 写入被限制。
- sandbox 里 build 失败，但不是代码错误。

处理：

- 先识别是否是权限/沙盒问题。
- 对需要写缓存或网络的命令使用提权执行。
- 代码错误和沙盒错误要分开，不要混为一谈。

### 6. PowerShell 管道字符误解析

在 PowerShell 的 `-Command` 字符串里使用 `rg "a|b|c"` 容易被错误解析。处理：

- 使用单引号包裹 pattern。
- 或把复杂搜索拆开。
- 或用 `rg -e 'a|b|c'`。

### 7. 搜索 dropdown 被裁切

原因：

- 父级 tile 使用了 `overflow: hidden`。
- dropdown 定位没有脱离卡片上下文。

处理：

- 搜索建议层使用 floating 定位。
- 宽度跟随搜索框。
- 结果数量按 viewport 限制在 3-5 或最多 5-8。
- 搜索中显示“搜索中”，无结果再显示“暂无匹配型号”。

### 8. 图片/证书显示不完整

证书必须完整可读：

- 使用 `object-fit: contain`。
- 容器高度响应式，不用强裁剪。
- 点击证书打开预览 modal。

仓库和工业图片用于背景或 tile 背景时：

- 加蓝色/深色渐变遮罩。
- 图片不要像图库贴片一样孤立。
- 移动端避免文字压在复杂区域上。

## 数据核验规则

本地 preflight 当前会检查：

- `server/index.js` 语法。
- `scripts/sync-static-css.cjs` 语法。
- Vite build。
- `public/styles.css` 和 `dist/styles.css` 存在。
- QA 页面样式、分页样式、搜索浮层样式、证书预览样式存在。
- 产品搜索支持标准号和 like term。
- 8 大产品分类存在。
- 产品详情认证 tile 存在。
- `/styles.css` 缓存和 MIME 相关服务逻辑存在。
- `public/articles` 至少 80 篇。
- 文章没有明显 UTF-8 乱码。
- Mongo seed 脚本存在并含多厂家清理逻辑。
- 东风导入脚本含 PDF 提取和产品行识别。
- 金桥通用占位介绍和适用场景已清零，后续只做手册级交叉核对。
- `J422`、`J507`、`JQ.CE71T-1` 有手册来源内容。
- `JQ.CE71T-1` 有认证、化学成分和力学性能。
- 上海东风产品不少于 200。
- 若型号含 NB/T，必须有 `NB/T 47018 承压产品`。
- 粗细字段不允许出现 `?`，必须用 `Φ`。
- `git diff --check` 无空白错误。

## 版本管理记录

最近关键提交：

```text
8928a22 Enrich Jinqiao product content from manuals
5b2d496 Import Dongfeng product catalog
58aa805 Fix Jinqiao product category mapping
68e0f5e Fix product search and filters
42d47ad Refine industrial tile styling
```

推荐提交节奏：

1. 完成一个明确功能或数据批次。
2. 跑 `npm.cmd run preflight`。
3. 确认 `git status --short`。
4. `git add` 相关文件。
5. `git commit -m "..."`
6. 交给 Confucius 或部署流程 push + ECS 部署 + 校验。

不要把临时提取文件、密码、服务器凭据写入 commit。PDF/Word 原始资料如果不属于站点运行必要文件，优先放在 `source-docs` 或工作区外，只提交整理后的结构化数据和必要脚本。

## ECS 部署后必须校验

部署后至少检查：

```powershell
curl -I http://zhifanwelding.com.cn/
curl -I http://zhifanwelding.com.cn/styles.css
curl http://zhifanwelding.com.cn/api/health
curl "http://zhifanwelding.com.cn/api/products?search=JQ.CE71T-1"
curl "http://zhifanwelding.com.cn/api/products?search=NB/T%2047018"
```

还要浏览器验证：

- 首页不白屏。
- 产品中心默认进入碳钢焊条搜索/筛选界面。
- 搜索型号、厂家、标准号能返回结果。
- 产品分类分页有上一页/下一页。
- 产品详情页标准、成分、熔敷金属、粗细、认证 tile 排版正常。
- 焊接知识二级和三级页面能正常渲染，手机端不溢出。
- 授权证书完整显示并能点击预览。
- 联系表单可选客户位置并成功提交。

## 待办事项

高优先级：

- 继续按 2025/2024 手册交叉核对金桥产品介绍、适用场景、标准、成分和力学性能。
- 继续核对上海东风产品与 `2019焊材样本(2)(1).pdf`，确保分类、标准、成分、力学性能、应用与 PDF 一致。
- 产品搜索继续实测：型号、标准号、厂家、分类词都要能搜。
- 焊接知识二级页面手机端渲染问题要继续验证。
- 产品分页上一页/下一页需要浏览器实测。
- 每次部署后检查 `/styles.css` MIME，防止静态文章页面样式失效。

中优先级：

- 图片资源按屏幕尺寸继续优化，减少移动端加载压力。
- 首页 tile 融合感继续统一：字号、间距、背景图透明度、渐变方向。
- 证书 slider 在移动端做横向滑动体验优化。
- AMap 高德地图在联系我们中定位新仓库。
- 管理后台增加登录、访问日志和咨询状态管理。

低优先级：

- 如产品和搜索量明显上升，再考虑 Redis。当前 Mongo 索引 + API 轻缓存足够。
- 如全文搜索复杂度提高，可评估 Elasticsearch/Meilisearch，但现阶段不建议先引入。
- 可逐步拆分 `App.jsx`：`HomePage`、`ProductCategoryPage`、`ProductDetailPage`、`KnowledgePage`、`Header`、`Footer`、`ProductSearch`。

## 成功经验

- 产品内容不要靠 React 静态写死，使用结构化数据源更方便持续导入。
- 大批量数据修改必须写脚本，并把关键样例放进 preflight。
- 手册内容导入时，只改目标字段，避免无意覆盖标准、成分、力学性能等已核验字段。
- 对中文站点，UTF-8 无 BOM、PowerShell 7、preflight 是减少乱码和白屏的关键组合。
- 搜索体验优先用 Mongo 索引、like term、前端防抖和小结果集，不急着引 Redis。
- 线上问题先查 Console、Network、MIME、Nginx try_files，再查业务代码。
- 图片不要直接堆在页面上，作为背景融合到 section/tile 中更适合工业企业站。
- 证书、产品详情、知识文章这种内容页，要先保证完整可读，再做动画和视觉效果。

## Confucius 部署专员说明

已有 subagent：`019f036b-5644-72c2-a0f9-d8d069994253`，昵称 Confucius。

职责：

- GitHub push。
- ECS 部署。
- 部署后校验。
- 失败时诊断 Nginx、Node、Mongo、MIME、日志和回滚方案。

约束：

- 不改主线业务代码。
- 不输出或记录服务器密码。
- 部署前确认本地 commit 和 preflight 状态。
- 部署后返回 commit、URL、状态码、API 和日志结果。


## 开发复盘与防错清单

这一节专门记录前面开发中反复出现、容易拖慢进度的问题。后续每次改动前、改动后、准备压缩上下文前，都按这里走一遍。

### 反复出现的问题类型

1. 需求写反或理解反
   - 典型表现：用户要求“显示生成时间”，页面却继续显示短答案；用户要求“8 个产品类型全显示”，CSS 仍半隐藏后几个 tile。
   - 根因：只改了数据或组件的一处，没有按用户原句逐条核对 DOM 实际位置。
   - 固定做法：对用户提到的 XPath、选择器、具体文案，必须在浏览器里查真实 DOM 文本；不能只看源码。

2. 产品分类搞错
   - 典型表现：`CE71T`、`Y71T` 等药芯焊丝被归到碳钢焊条；非合金钢/细晶粒钢焊条和特种焊条混在一起。
   - 根因：只按型号前缀猜分类，没有结合 PDF 章节名、产品类型和厂家规则。
   - 固定做法：产品大类只能使用既定 8 类；遇到模糊型号先查 PDF 所属章节，仍不确定就整理给用户确认，不要硬猜。

3. 数据字段放错 tile
   - 典型表现：粗细数据混进熔敷金属；熔敷金属性能混进规格粗细；标准号挤在一行看不清。
   - 根因：导入脚本按字符串拼接，没有对字段语义做分桶。
   - 固定做法：`dimensions` 只放规格/直径，必须使用 `Φ`；`depositedMetal` 只放力学性能；`composition` 只放化学成分；标准按 GB/T、AWS、ISO、NB/T 等分行展示。

4. 未验证就继续下一步
   - 典型表现：以为 build 通过就代表浏览器正常，结果线上或本地白屏；以为改了 CSS，实际页面还在跑旧 bundle。
   - 根因：只运行命令，没有用浏览器验证目标页面和目标选择器。
   - 固定做法：每次声明完成前必须有新鲜证据：`npm.cmd run preflight`、浏览器页面、Console、Network/API 结果至少覆盖本次改动点。

5. 静态资源 MIME 和挂载错误
   - 典型表现：`styles.css` 返回 `text/html`；JS 模块返回 CSS/HTML；静态文章样式丢失。
   - 根因：Nginx `try_files`、Express 静态目录、Vite `dist` 路径或部署目录错位。
   - 固定做法：部署后必须验证 `/styles.css` 的 `Content-Type: text/css`，验证 `/assets/*.js` 是 JS，验证静态文章页面不是被 SPA fallback 错误接管。

6. 新代码没有被加载
   - 典型表现：本地文件已经改了，但浏览器还是旧效果；搜索 dropdown 位置仍是旧逻辑。
   - 根因：Vite HMR 没刷新、旧 Node 服务没重启、浏览器缓存或线上 PM2/Nginx 仍跑旧构建。
   - 固定做法：关键改动前先停旧服务，改完后重新启动服务，再用带版本参数的 URL 验证，例如 `/?v=verify-YYYYMMDD-HHMM`。

7. 多开端口导致测试对象错误
   - 典型表现：5173 打开的不是当前代码；3000 仍是旧 Express；测试了一半才发现服务不是本轮启动的。
   - 根因：旧 Vite/Node 进程未关闭，或多个终端同时运行。
   - 固定做法：改动前检查并释放端口；本地标准端口固定为 Vite `5173`、Node `3000`。测试结束后确认端口释放，避免下一轮误测。

8. 转换和编码错误
   - 典型表现：中文变乱码、直径符号变 `?`、Word/PDF 提取后行列错位。
   - 根因：PowerShell 5、非 UTF-8、PDF 表格提取断行、脚本直接覆盖字段。
   - 固定做法：全部使用 PowerShell 7；中文文件保持 UTF-8 无 BOM；提取表格后先抽样核对 3-5 个产品，再批量导入；直径符号统一修正为 `Φ`。

9. 数据加载失败但页面只显示空状态
   - 典型表现：产品中心显示“产品数据暂时读取失败”；Mongo 不可用时前台无产品。
   - 根因：API 没 fallback、Mongo 连接失败、种子数据没加载、字段名和前端读取不一致。
   - 固定做法：本地和线上都保留 JSON seed fallback；API 错误要看 `/api/health` 和服务器日志；搜索接口返回必要字段，详情页再查完整数据。

10. 搜索 dropdown 被 CSS 容器裁切
    - 典型表现：手机上 dropdown 被图片挡住，电脑上不在搜索框正下方，结果被 tile 限制高度。
    - 根因：dropdown 放在 card 内部，父级 `overflow` 或背景图层盖住。
    - 固定做法：搜索建议层用 portal/fixed；位置由输入框 `getBoundingClientRect()` 计算；z-index 高于图片；按 viewport 控制 3-5 个结果。

11. 权限提升判断不及时
    - 典型表现：build、git、ssh、curl、npm、ECS 部署在沙盒里失败后才返工。
    - 根因：没有提前区分“代码错误”和“沙盒/网络/远程权限错误”。
    - 固定做法：涉及 Vite/esbuild 缓存、git index/refs、网络请求、SSH、ECS、Mongo、npm registry 的命令，优先判断是否需要提权；提权理由要具体。

12. 线上验证不完整
    - 典型表现：GitHub push 成功但 ECS 仍是旧版本；首页能开但 API、CSS、文章页错误。
    - 根因：只验证首页，没有验证 API、静态资源、详情页、知识页和 MIME。
    - 固定做法：部署后至少验证首页、`/api/health`、`/styles.css`、一个产品搜索、一个产品详情页、一个 Q&A 页面。

13. Windows 临时脚本和沙盒路径反复踩坑
    - 典型表现：写入 `C:\tmp` 被当前权限挡住；PowerShell 里用 bash 风格 heredoc（例如 `python - <<'PY'`）直接报语法错；图片或脚本路径被沙盒拦截后仍反复尝试同一路径。
    - 根因：把 Linux/bash 习惯带到 PowerShell 7；没有优先使用项目可写目录；沙盒路径失败后没有及时换路径。
    - 固定做法：临时脚本默认放项目内 `tmp/` 或当前工作区可写临时目录，用完立即删除；PowerShell 7 中需要多行 Python 时写入临时 `.py` 再执行，简单逻辑才用 `python -c`；如果 `C:\tmp`、`.codex/generated_images` 或其他外部路径被沙盒拦截，不要反复试，先复制/移动到项目 `public/assets` 或工作区内再处理。

### 每次改动前必须做

```powershell
cd 'C:\Users\Ning Sun\Documents\Codex\2026-06-23\new-chat\outputs\welding-distributor-site'
git status --short
Get-NetTCPConnection -LocalPort 3000,5173 -State Listen -ErrorAction SilentlyContinue
```

- 确认当前工作区有哪些文件已经被改动。
- 确认是否有旧的 3000/5173 服务。
- 如果要做前端或 API 验证，先停旧服务，再重新启动，避免跑旧代码。
- 如果 Confucius 正在 push/deploy，不要同时改同一批部署文件；需要继续主线时只做文档或互不冲突文件。

### 每次改动后必须做

```powershell
npm.cmd run preflight
```

然后按改动类型增加专项验证：

- 改 React/CSS：首页、对应 section、移动端和桌面端都要看。
- 改搜索：验证“搜索中”、有结果、无结果、标准号 like term、手机 dropdown 位置。
- 改产品数据：抽查分类页、详情页、成分、熔敷金属、粗细、认证 tile。
- 改 Q&A：抽查列表页、单篇页、短答案 tile、生成时间、上一篇/下一篇。
- 改部署配置：验证 MIME、API health、Nginx/PM2 日志。

### 本地服务重启规则

关键原则：改动前后都重启服务再测试，不在旧服务/HMR 半更新状态下下结论。

推荐流程：

```powershell
# 1. 查占用
Get-NetTCPConnection -LocalPort 3000,5173 -State Listen -ErrorAction SilentlyContinue

# 2. 停旧服务。只停止确认属于本项目的 Node/Vite 进程，不要误杀其他程序。

# 3. 构建和预检
npm.cmd run preflight

# 4. 启动后端预览
npm.cmd run server

# 5. 如需 Vite 开发态，再单独启动
npm.cmd run dev
```

浏览器验证时加 cache-busting 参数：

```text
http://localhost:3000/?v=local-verify-20260626
http://localhost:5173/?v=local-verify-20260626
```

### 部署前后固定流程

部署前：

1. `npm.cmd run preflight`
2. `git status --short`
3. 确认没有密码、临时缓存、大 PDF、错误提取文件进入提交。
4. commit。
5. push GitHub。

部署后：

```powershell
curl -I http://zhifanwelding.com.cn/
curl -I http://zhifanwelding.com.cn/styles.css
curl http://zhifanwelding.com.cn/api/health
curl "http://zhifanwelding.com.cn/api/products?search=J507"
curl "http://zhifanwelding.com.cn/api/products?search=AWS%20A5.1"
curl http://zhifanwelding.com.cn/articles/qa/qa-12-j507-electrode.html
```

必须确认：

- 首页不是白屏。
- CSS MIME 是 `text/css`。
- API health 正常。
- 搜索能返回产品。
- Q&A 页面包含生成时间。
- 如果启用 HTTPS，HTTP/HTTPS 都要检查跳转和证书状态。

### 上下文压缩前交接模板

每次快压缩上下文前，都要用这个格式写一段交接，方便下一轮直接续上：

```markdown
## 当前状态

- 当前目录：
- 当前分支/HEAD：
- 最近一次用户要求：
- 已完成：
- 未完成：

## 最近修改

- 文件：
- 关键逻辑：
- 数据来源：

## 验证证据

- 命令：
- 结果：
- 浏览器检查：
- 线上检查：

## 已知风险

- 编码/乱码：
- MIME/部署：
- 数据核验：
- 响应式：
- 搜索/API：

## 下一步建议

1.
2.
3.
```

不要只写“已完成”或“继续”，必须写清楚目录、文件、验证结果和风险。