export const FACET_KEYS = ["A", "B", "C", "D", "E", "F"];

/** 明亮展厅配色：天青、青花、淡金、釉灰 */
export const facets = {
  A: {
    name: "器用功能",
    role: "主分类轴",
    short: "功能",
    color: "#b8954a",
    line: "rgba(184,149,74,0.45)",
    fill: "rgba(255,252,248,0.92)",
    description:
      "以器物用途作为进入体系的第一检索入口，稳定承载饮食、盛储、礼仪、宗教、明器、文房、陈设等基本功能类型。",
    categories: [
      { code: "A0", name: "信息不详" },
      { code: "A1", name: "饮食器" },
      { code: "A2", name: "盛储器" },
      { code: "A3", name: "礼仪器" },
      { code: "A4", name: "宗教器" },
      { code: "A5", name: "明器/冥器" },
      { code: "A6", name: "文房器" },
      { code: "A7", name: "陈设器" },
      { code: "A8", name: "建筑构件" },
      { code: "A99", name: "其他" },
    ],
  },
  B: {
    name: "年代",
    role: "辅助分面",
    short: "年代",
    color: "#4a8f9a",
    line: "rgba(74,143,154,0.35)",
    fill: "rgba(248,252,252,0.9)",
    description: "补充器物的历史时间坐标，支持跨时代比较和按文化史阶段聚合。",
    categories: [
      { code: "B0", name: "年代不详" },
      { code: "B1", name: "史前时期" },
      { code: "B2", name: "夏商周时期" },
      { code: "B3", name: "秦汉时期" },
      { code: "B4", name: "魏晋南北朝时期" },
      { code: "B5", name: "隋唐五代时期" },
      { code: "B6", name: "宋辽金西夏时期" },
      { code: "B7", name: "元代" },
      { code: "B8", name: "明代" },
      { code: "B9", name: "清代" },
      { code: "B10", name: "近现代文物陶瓷" },
    ],
  },
  C: {
    name: "胎釉品类",
    role: "辅助分面",
    short: "胎釉",
    color: "#6d8f86",
    line: "rgba(109,143,134,0.32)",
    fill: "rgba(252,254,253,0.92)",
    description: "记录胎体、釉色与彩绘类型，体现材料属性和陶瓷技术谱系。",
    categories: [
      { code: "C0", name: "信息不详" },
      { code: "C1", name: "素陶/素胎" },
      { code: "C2", name: "彩陶" },
      { code: "C3", name: "灰/黑陶" },
      { code: "C4", name: "铅釉陶" },
      { code: "C5", name: "三彩/琉璃器" },
      { code: "C6", name: "青瓷" },
      { code: "C7", name: "白瓷" },
      { code: "C8", name: "黑釉/酱釉" },
      { code: "C9", name: "青白瓷" },
      { code: "C10", name: "青花瓷" },
      { code: "C11", name: "釉里红" },
      { code: "C12", name: "釉上彩瓷" },
      { code: "C13", name: "颜色釉" },
      { code: "C14", name: "紫砂器" },
      { code: "C15", name: "釉下彩瓷" },
      { code: "C16", name: "绞胎陶/绞胎器" },
      { code: "C99", name: "其他" },
    ],
  },
  D: {
    name: "窑口/产地",
    role: "辅助分面",
    short: "窑口",
    color: "#3d6ea5",
    line: "rgba(61,110,165,0.3)",
    fill: "rgba(248,250,255,0.92)",
    description: "描述窑口或产地归属，支持地域技术传统、名窑谱系与产地比较。",
    categories: [
      { code: "D0", name: "不详" },
      { code: "D1", name: "越窑" },
      { code: "D2", name: "邢窑" },
      { code: "D3", name: "定窑" },
      { code: "D4", name: "汝窑" },
      { code: "D5", name: "官窑/南宋官窑" },
      { code: "D6", name: "哥窑" },
      { code: "D7", name: "钧窑" },
      { code: "D8", name: "磁州窑" },
      { code: "D9", name: "耀州窑" },
      { code: "D10", name: "龙泉窑" },
      { code: "D11", name: "建窑" },
      { code: "D12", name: "吉州窑" },
      { code: "D13", name: "景德镇窑" },
      { code: "D14", name: "德化窑" },
      { code: "D15", name: "宜兴窑" },
      { code: "D16", name: "长沙窑" },
      { code: "D17", name: "巩义窑/巩县窑" },
      { code: "D18", name: "瓯窑" },
      { code: "D19", name: "婺州窑" },
      { code: "D20", name: "密县窑" },
      { code: "D21", name: "寿州窑" },
      { code: "D22", name: "鲁山窑" },
      { code: "D23", name: "辽代窑" },
      { code: "D24", name: "醴陵窑" },
      { code: "D99", name: "其他" },
    ],
  },
  E: {
    name: "工艺技法",
    role: "辅助分面",
    short: "工艺",
    color: "#c17d4a",
    line: "rgba(193,125,74,0.32)",
    fill: "rgba(255,251,246,0.92)",
    description: "记录制作、成型、装饰、烧成等技术手段，支持技术史与工艺组合检索。",
    categories: [
      { code: "E0", name: "信息不详" },
      { code: "E1", name: "手制/组装" },
      { code: "E2", name: "轮制" },
      { code: "E3", name: "模制" },
      { code: "E4", name: "拉坯" },
      { code: "E5", name: "刻花" },
      { code: "E6", name: "划花" },
      { code: "E7", name: "印花/戳印/模印" },
      { code: "E8", name: "剔花" },
      { code: "E9", name: "堆塑/贴塑" },
      { code: "E10", name: "镂雕" },
      { code: "E11", name: "釉下彩" },
      { code: "E12", name: "彩绘" },
      { code: "E13", name: "釉上彩" },
      { code: "E14", name: "绞胎/绞釉" },
      { code: "E15", name: "窑变" },
      { code: "E16", name: "低温釉烧/铅釉" },
      { code: "E17", name: "贴花" },
      { code: "E18", name: "浮雕" },
      { code: "E99", name: "其他实验工艺" },
    ],
  },
  F: {
    name: "纹饰题材",
    role: "辅助分面",
    short: "纹饰",
    color: "#7d8f6e",
    line: "rgba(125,143,110,0.3)",
    fill: "rgba(252,253,249,0.92)",
    description: "表达图像内容与装饰主题，支持题材、象征意义和装饰谱系检索。",
    categories: [
      { code: "F0", name: "纹饰不详" },
      { code: "F1", name: "几何纹" },
      { code: "F2", name: "植物纹" },
      { code: "F3", name: "动物纹" },
      { code: "F4", name: "人物纹" },
      { code: "F5", name: "山水楼阁纹" },
      { code: "F6", name: "文字纹" },
      { code: "F7", name: "宗教纹饰" },
      { code: "F8", name: "吉祥纹饰" },
      { code: "F9", name: "素面无纹" },
      { code: "F99", name: "其他" },
    ],
  },
};

export function parseClassificationCode(code) {
  const parts = code.trim().split("-").filter(Boolean);
  const startIdx = parts[0]?.toUpperCase() === "CR" ? 1 : 0;
  const payload = parts.slice(startIdx);
  const parsed = { resource: "CR" };
  FACET_KEYS.forEach((key, index) => {
    const segment = (payload[index] || `${key}0`).trim();
    parsed[key] = segment
      .split("+")
      .map((item) => item.trim())
      .filter(Boolean);
  });
  return parsed;
}

function buildCodeIndex() {
  const index = {};
  Object.values(facets).forEach((facet) => {
    facet.categories.forEach((category) => {
      index[category.code] = category.name;
    });
  });
  return index;
}

export const codeIndex = buildCodeIndex();

export function labelForCode(code) {
  return codeIndex[code] || code;
}

export function objectFacetLabels(object, facetKey) {
  return object[facetKey].map((code) => `${code} ${labelForCode(code)}`).join(" · ");
}

export function makeEmptySelection() {
  return Object.fromEntries(FACET_KEYS.map((key) => [key, []]));
}

export function polar(cx, cy, radius, degree) {
  const rad = (degree * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * radius, y: cy + Math.sin(rad) * radius };
}

export function truncate(text, length = 28) {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

export function relicImageUrl(filename) {
  if (!filename) return null;
  return `/images/relics/${encodeURIComponent(filename)}`;
}
