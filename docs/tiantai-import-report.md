# 天泰产品导入报告

- 来源文件：`C:\Users\Ning Sun\Documents\Codex\2026-06-27\implement-this-ui-in-the-current-6\outputs\天泰产品分类表_新版PDF_三模型交叉复核_4x表格增强版.xlsx`
- 导入厂家：天泰
- 新版表格有效产品：188 个
- ??????115 ????????????
- ?????73 ????????????
- ???????????80 ????????????
- 当前天泰总产品：268 个
- 跳过空牌号行：0
- 重复型号合并：17 组

## 新版来源分类数量

- 不锈钢焊材: 99
- 实芯气保及氩弧焊丝: 9
- 特种焊材: 55
- 碳钢埋弧焊丝焊剂: 2
- 碳钢焊条: 12
- 药芯气保焊丝: 11

## 当前天泰库内分类数量

- 不锈钢焊材: 133
- 实芯气保及氩弧焊丝: 10
- 特种焊材: 85
- 碳钢埋弧焊丝焊剂: 2
- 碳钢焊条: 26
- 药芯气保焊丝: 12

## 新版来源缺失字段统计

- 介绍: 52
- 适用场景: 95
- 执行标准: 0
- 成分: 1
- 熔敷金属: 7

## 数据清洗说明

- 同型号按去除空格、点号、连字符、括号后的统一 key 匹配，保留 -II 等后缀的实际字母信息。
- 新表已有同型号覆盖天泰旧记录，但保留现货标识、点击量等站内运营字段。
- 成分使用表格中 `化学C` 至 `化学N` 的结构化列，熔敷金属使用力学性能列，规格粗细单独存入 dimensions。

## 合并的重复型号示例

- TIG-50 / TIG-50
- TF-210 / TF-210
- TF-210 / TF-210
- MIG-1CM / MIG-1CM
- MIG-2CM / MIG-2CM
- TIG-1CM / TIG-1CM
- TIG-2CM / TIG-2CM
- TF-250 / TF-250
- TF-210 / TF-210
- TF-250 / TF-250
- TS-308L / TS308L
- TFS-300 / TFS-300
- TFS-300 / TFS-300
- TFS-300 / TFS-300
- TFS-300NB / TFS-300NB
- TFS-300NB / TFS-300NB
- TFS-330 / TFS-330

## 清洗异常值

- TIG-52 Mn: suspicious chemistry value 0.560.0100.0080.0030.0150.0090.123
- TF-250 S: suspicious chemistry value 1.080.0180.0020.0120.0150.046
- TF-250API P: suspicious chemistry value 1.590.0140.0040.140.21
- TF-210 P: suspicious chemistry value 1.550.011 0.0020.480.98
- TF-210 Si: suspicious chemistry value 0.0650.431.550.018 0.002 0.4692.510.378
- TR-717 Mn: suspicious chemistry value 0.580.200.0090.008
- TIG-9CB Mn: suspicious chemistry value 0.090.630.250.0070.0020.57
- TF-250 Cu: suspicious chemistry value 0.0060.0060.0090.027
- TFS-300 Si: suspicious chemistry value 0.470.0230.005
- MIG-61 Mn: suspicious chemistry value 64.2
- MIG-82 Cu: suspicious chemistry value 73.0
- TGS-NI1 Ni: suspicious chemistry value 95.10
- TGS-61 Ni: suspicious chemistry value 64.4
- TGS-82 Cu: suspicious chemistry value 73.0
- TFS-340 Ni: suspicious chemistry value 59.8515.490.040.0423.670.02
