《依据》文件夹说明
==================

本文件夹为数字展厅项目的唯一资料来源，请勿从项目外其它路径引用 Word 作为“正式依据”。

应包含（文件名可略有出入，但需满足关键词匹配）：

1. 中国陶瓷文物分类体系汇报表（或名称中含「汇报」「体系」的 Word）
   - 提供 63 件器物的序号、名称、板块、完整编码 CR-A-B-C-D-E-F 及分面列。
   - 运行：npm run data:from-yiju
   - 生成：src/data/rawObjects.json

2. 陶瓷器物图片分类卡片版（名称中含「分类卡片」的 Word）
   - 提供 1–63 与器物一一对应的嵌入图；单元格内可有「原图序号：N」文案，若无则脚本按 Word 图属性 name="Picture N" 对应序号。
   - 运行：npm run images:from-yiju
   - 更新：public/images/relics/ 与 src/data/relicImageFiles.json

说明：上述 .doc 文件须为 Word 2007+ OOXML 格式（文件头为 PK，即 zip），旧版二进制 .doc 无法被脚本读取。
