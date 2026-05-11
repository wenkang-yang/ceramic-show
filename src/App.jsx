import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Braces,
  Compass,
  Database,
  Gem,
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  Sparkles,
  X,
  ZoomIn,
} from "lucide-react";
import relicImageFiles from "./data/relicImageFiles.json";
import rawObjects from "./data/rawObjects.json";
import {
  FACET_KEYS,
  facets,
  labelForCode,
  makeEmptySelection,
  objectFacetLabels,
  parseClassificationCode,
  polar,
  relicImageUrl,
  truncate,
} from "./lib/facets.js";

const facetAngles = { A: -90, B: -30, C: 30, D: 90, E: 150, F: 210 };
const HERO_FEATURE_IDS = ["obj-034", "obj-037", "obj-044", "obj-021", "obj-057"];
const CHART_MUTED = ["#7eb8c3", "#6b93c4", "#c4a574", "#9aaf8c", "#8a9aaa"];

function deriveKeywords(item) {
  const segs = item.description.split("；").filter(Boolean);
  const out = new Set();
  out.add(item.name.replace(/（[^）]*）/g, "").trim());
  segs.forEach((s) => {
    if (s.length < 24) out.add(s);
  });
  return Array.from(out).slice(0, 8);
}

function buildRelicRecords() {
  return rawObjects.map((item) => {
    const parsed = parseClassificationCode(item.code);
    const file = relicImageFiles[item.serial - 1];
    const labels = Object.fromEntries(
      FACET_KEYS.map((key) => [key, parsed[key].map((c) => labelForCode(c))])
    );
    const facetsObj = Object.fromEntries(FACET_KEYS.map((k) => [k, parsed[k]]));
    return {
      ...item,
      facets: facetsObj,
      ...parsed,
      labels,
      image: relicImageUrl(file),
      imageFile: file ?? null,
      keywords: deriveKeywords(item),
    };
  });
}

function relatedRelics(target, objects, n = 6) {
  return objects
    .filter((o) => o.id !== target.id)
    .map((o) => ({
      o,
      score:
        (o.section === target.section ? 3 : 0) +
        FACET_KEYS.reduce(
          (acc, k) => acc + o[k].filter((c) => target[k].includes(c)).length,
          0
        ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.o);
}

function aggregateSection(objects) {
  const m = {};
  objects.forEach((o) => {
    m[o.section] = (m[o.section] || 0) + 1;
  });
  return Object.entries(m).map(([label, value]) => ({ label, value }));
}

function aggregateFacetTop(objects, facetKey, top = 10) {
  const m = {};
  objects.forEach((o) => {
    o[facetKey].forEach((code) => {
      m[code] = (m[code] || 0) + 1;
    });
  });
  return Object.entries(m)
    .map(([code, value]) => ({
      label: `${code} ${labelForCode(code)}`,
      value,
      code,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, top);
}

function CountUp({ value, duration = 1100, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const to = Number(value) || 0;
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(to * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

function MuseumBackdrop() {
  const particles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: `${(i * 41) % 100}%`,
        top: `${(i * 67) % 100}%`,
        delay: `${(i % 10) * 0.8}s`,
        duration: `${14 + (i % 8)}s`,
        opacity: 0.08 + (i % 4) * 0.02,
      })),
    []
  );
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-[#f5f2eb]">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% -10%, rgba(186, 220, 224, 0.45), transparent 55%),
            radial-gradient(ellipse 70% 50% at 100% 30%, rgba(232, 236, 244, 0.7), transparent 50%),
            radial-gradient(ellipse 60% 45% at 0% 70%, rgba(255, 248, 235, 0.85), transparent 45%),
            linear-gradient(180deg, #faf8f4 0%, #f2f5f7 48%, #eef3f5 100%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(90, 120, 130, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(90, 120, 130, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="ceramic-sheen absolute inset-0 opacity-40" />
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle absolute h-1 w-1 rounded-full bg-[#8fb8c0]"
          style={{
            left: p.left,
            top: p.top,
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

function HeroSection({ objects, filteredCount }) {
  const featured = useMemo(() => {
    const byId = Object.fromEntries(objects.map((o) => [o.id, o]));
    return HERO_FEATURE_IDS.map((id) => byId[id]).filter(Boolean);
  }, [objects]);

  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 px-8 py-10 shadow-[0_20px_80px_rgba(55,90,100,0.08)] backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#c5e4e8]/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-[#f0e6d4]/50 blur-3xl" />

      <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-[#5a7d82]">
            <Sparkles size={14} className="text-[#b8954a]" />
            Digital Ceramic Gallery · Faceted Knowledge Graph
          </div>
          <h1 className="mt-4 font-['Noto_Serif_SC',serif] text-3xl font-semibold tracking-[0.06em] text-[#1e2d30] md:text-4xl lg:text-[2.75rem]">
            中国陶瓷文物分类体系
          </h1>
          <p className="mt-2 font-['Playfair_Display',serif] text-lg italic tracking-[0.06em] text-[#4a6670]">
            Chinese Ceramic Relic Classification System
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#4d5f63]">
            基于<strong className="font-medium text-[#2a3f44]">「主类列举 + 分面组配」</strong>
            的陶瓷文物知识组织系统：以器用功能为主轴，年代、胎釉、窑口、工艺与纹饰多维标引，支持检索、统计与图像档案浏览。
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "样本", value: 63, suffix: " 件", icon: Database },
              { label: "分面", value: 6, suffix: " 个", icon: Layers },
              { label: "编码", value: "CR", mono: true, icon: Braces },
              { label: "主轴", value: "A", sub: "器用", icon: Compass },
              { label: "当前展陈", value: filteredCount, suffix: " 件", icon: Gem },
              { label: "辅助", value: "B–F", sub: "多维", icon: Layers },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
                className="rounded-2xl border border-white/80 bg-white/70 px-3 py-3 shadow-[0_8px_32px_rgba(40,70,80,0.06)]"
              >
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#6a858a]">
                  <m.icon size={12} className="text-[#b8954a]" />
                  {m.label}
                </div>
                <div className="mt-1.5 font-mono text-lg font-semibold text-[#1e2d30]">
                  {m.mono ? (
                    <span className="text-base tracking-wider">CR-A…F</span>
                  ) : typeof m.value === "number" ? (
                    <CountUp value={m.value} suffix={m.suffix || ""} />
                  ) : (
                    <>
                      {m.value}
                      {m.sub && <span className="ml-1 text-xs font-normal text-[#5c7378]">{m.sub}</span>}
                      {m.suffix}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative hidden min-h-[220px] md:block">
          <div className="absolute inset-0 flex items-center justify-center">
            {featured.map((obj, i) => (
              <motion.figure
                key={obj.id}
                initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: (i - 2) * 3 }}
                transition={{ delay: 0.35 + i * 0.1, duration: 0.65, ease: "easeOut" }}
                className="absolute w-[38%] max-w-[200px] overflow-hidden rounded-2xl border border-white/90 bg-white/90 shadow-[0_16px_48px_rgba(50,80,90,0.12)]"
                style={{
                  left: `${8 + i * 16}%`,
                  top: `${i % 2 === 0 ? 4 : 18}%`,
                  zIndex: featured.length - i,
                }}
              >
                <div className="aspect-[4/5] w-full bg-[#f0f4f5]">
                  {obj.image ? (
                    <img
                      src={obj.image}
                      alt={obj.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain p-2"
                    />
                  ) : null}
                </div>
                <figcaption className="border-t border-[#e8eef0] bg-white/95 px-2 py-1.5 text-center text-[10px] leading-snug text-[#3d5256]">
                  {truncate(obj.name, 16)}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function FacetFilterPanel({
  selectedCodes,
  setSelectedCodes,
  categoryCounts,
  activeFacet,
  setActiveFacet,
  searchTerm,
  setSearchTerm,
  clearFilters,
  expandAll,
  collapseAll,
}) {
  const toggleCategory = (facetKey, category) => {
    setSelectedCodes((prev) => {
      const nextSet = new Set(prev[facetKey]);
      if (nextSet.has(category.code)) nextSet.delete(category.code);
      else nextSet.add(category.code);
      return { ...prev, [facetKey]: Array.from(nextSet) };
    });
    setActiveFacet(facetKey);
  };

  return (
    <aside className="rounded-[1.75rem] border border-white/80 bg-white/50 p-4 shadow-[0_12px_48px_rgba(50,80,90,0.07)] backdrop-blur-xl xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto xl:pr-1 custom-scrollbar-light">
      <div className="flex items-center justify-between gap-2 border-b border-[#dfe9ea] pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#6a858a]">Facet Retrieval</div>
          <h2 className="mt-1 font-['Noto_Serif_SC',serif] text-lg text-[#1e2d30]">分面检索</h2>
        </div>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-full border border-[#dce7e8] bg-white/80 p-2 text-[#5a7378] transition hover:border-[#b8954a]/40 hover:text-[#1e2d30]"
          title="清空筛选"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#e4ecee] bg-white/80 px-3 py-2.5 shadow-inner">
        <Search size={16} className="shrink-0 text-[#6a9096]" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索名称、编码、窑口、工艺…"
          className="w-full bg-transparent text-sm text-[#1e2d30] outline-none placeholder:text-[#8a9da1]"
        />
        {searchTerm && (
          <button type="button" onClick={() => setSearchTerm("")} className="text-[#8a9da1] hover:text-[#1e2d30]">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={expandAll}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-[#e4ecee] bg-white/70 py-2 text-xs text-[#4d5f63] transition hover:border-[#b8954a]/35"
        >
          <Maximize2 size={13} /> 全部展开
        </button>
        <button
          type="button"
          onClick={collapseAll}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-[#e4ecee] bg-white/70 py-2 text-xs text-[#4d5f63] transition hover:border-[#b8954a]/35"
        >
          <Minimize2 size={13} /> 全部收起
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {FACET_KEYS.map((facetKey) => {
          const facet = facets[facetKey];
          const isActive = activeFacet === facetKey;
          const selectedCount = selectedCodes[facetKey].length;
          return (
            <section
              key={facetKey}
              className={`rounded-2xl border px-3 py-3 transition ${
                isActive
                  ? "border-[#b8954a]/35 bg-[#fffdf8] shadow-[0_4px_24px_rgba(184,149,74,0.08)]"
                  : "border-[#e8eef0] bg-white/60"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveFacet(facetKey);
                }}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <span>
                  <span className="font-mono text-sm font-semibold" style={{ color: facet.color }}>
                    {facetKey}
                  </span>
                  <span className="ml-2 text-sm font-medium text-[#2a3f44]">{facet.name}</span>
                  <span className="ml-2 rounded-full bg-[#eef5f6] px-2 py-0.5 text-[10px] text-[#5c7378]">
                    {facet.role}
                  </span>
                </span>
                <span className="text-xs text-[#7a9196]">
                  {selectedCount ? `${selectedCount} 选中` : `${facet.categories.length} 类`}
                </span>
              </button>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {facet.categories.map((category) => {
                  const selected = selectedCodes[facetKey].includes(category.code);
                  const count = categoryCounts[facetKey]?.[category.code] || 0;
                  return (
                    <button
                      key={category.code}
                      type="button"
                      onClick={() => toggleCategory(facetKey, category)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                        selected
                          ? "border-[#b8954a]/55 bg-[#fdf6e8] text-[#6b5420] shadow-[0_0_0_1px_rgba(184,149,74,0.15)]"
                          : "border-[#e4ecee] bg-white/80 text-[#4d5f63] hover:border-[#c5d9dc]"
                      }`}
                    >
                      <span className="font-mono">{category.code}</span> {category.name}
                      <span className="ml-1 text-[#8a9da1]">{count}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}

function GlassNodeLabel({ children, x, y, small }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      className={small ? "fill-[#4d5f63] text-[10px]" : "fill-[#1e2d30] text-[13px] font-medium"}
      style={{ fontFamily: "Noto Sans SC, Inter, sans-serif" }}
    >
      {children}
    </text>
  );
}

function KnowledgeGraph({
  objects,
  filteredObjects,
  selectedCodes,
  activeFacet,
  setActiveFacet,
  expandedFacets,
  setExpandedFacets,
  setSelectedCodes,
}) {
  const center = { x: 500, y: 280 };
  const facetRadius = 128;
  const categoryRadius = 268;

  const toggleFacetExpansion = (facetKey) => {
    setExpandedFacets((prev) => {
      const next = new Set(prev);
      if (next.has(facetKey)) next.delete(facetKey);
      else next.add(facetKey);
      return next;
    });
    setActiveFacet(facetKey);
  };

  const toggleCategory = (facetKey, category) => {
    setSelectedCodes((prev) => {
      const nextSet = new Set(prev[facetKey]);
      if (nextSet.has(category.code)) nextSet.delete(category.code);
      else nextSet.add(category.code);
      return { ...prev, [facetKey]: Array.from(nextSet) };
    });
    setActiveFacet(facetKey);
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/45 p-5 shadow-[0_16px_64px_rgba(50,80,90,0.07)] backdrop-blur-xl">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.26em] text-[#6a858a]">Faceted Knowledge Graph</div>
          <h3 className="font-['Noto_Serif_SC',serif] text-xl text-[#1e2d30]">分面知识图谱</h3>
          <p className="mt-1 text-xs text-[#5c7378]">点击分面瓷片展开类目；点击类目联动下方器物展墙。当前筛选命中 {filteredObjects.length} 件。</p>
        </div>
        <button
          type="button"
          onClick={() => document.getElementById("relic-gallery-wall")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="rounded-full border border-[#e4ecee] bg-white/80 px-4 py-1.5 text-xs text-[#4d5f63] transition hover:border-[#b8954a]/35"
        >
          浏览器物展墙
        </button>
      </div>

      <svg viewBox="0 0 1000 560" className="h-[min(520px,56vw)] w-full">
        <defs>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#3a5060" floodOpacity="0.08" />
          </filter>
          <linearGradient id="centerTile" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#e8f4f5" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d4e8ea" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="lineSoft" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#b8954a" stopOpacity="0.25" />
            <stop offset="0.5" stopColor="#7eb8c3" stopOpacity="0.35" />
            <stop offset="1" stopColor="#6b93c4" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {[72, 148, 230, 318].map((r, i) => (
          <circle
            key={r}
            cx={center.x}
            cy={center.y}
            r={r}
            fill="none"
            stroke="rgba(90,130,140,0.08)"
            strokeDasharray={i % 2 ? "2 10" : "1 12"}
          />
        ))}

        {FACET_KEYS.map((facetKey) => {
          const angle = facetAngles[facetKey];
          const pos = polar(center.x, center.y, facetRadius, angle);
          const isFocused = activeFacet === facetKey;
          const dim = activeFacet && !isFocused;
          return (
            <g key={`ln-${facetKey}`} opacity={dim ? 0.35 : 1}>
              <motion.path
                d={`M ${center.x} ${center.y} L ${pos.x} ${pos.y}`}
                fill="none"
                stroke="url(#lineSoft)"
                strokeWidth={facetKey === "A" ? 1.4 : 1}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: dim ? 0.35 : 0.85 }}
                transition={{ duration: 1.1, delay: 0.1 }}
                className="knowledge-line-light"
              />
            </g>
          );
        })}

        <motion.g
          style={{ transformOrigin: `${center.x}px ${center.y}px` }}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85 }}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
          filter="url(#softShadow)"
        >
          <rect
            x={center.x - 56}
            y={center.y - 56}
            width={112}
            height={112}
            rx={22}
            fill="url(#centerTile)"
            stroke="rgba(184,149,74,0.35)"
            strokeWidth={1.5}
          />
          <GlassNodeLabel x={center.x} y={center.y - 10}>
            CR
          </GlassNodeLabel>
          <text
            x={center.x}
            y={center.y + 18}
            textAnchor="middle"
            className="fill-[#4d5f63] text-[11px] tracking-[0.12em]"
          >
            陶瓷文物
          </text>
        </motion.g>

        {FACET_KEYS.map((facetKey, facetIndex) => {
          const facet = facets[facetKey];
          const angle = facetAngles[facetKey];
          const pos = polar(center.x, center.y, facetRadius, angle);
          const isFocused = activeFacet === facetKey;
          const dim = activeFacet && !isFocused;
          const expanded = expandedFacets.has(facetKey);
          const w = facetKey === "A" ? 76 : 64;
          const h = facetKey === "A" ? 76 : 64;
          return (
            <motion.g
              key={facetKey}
              style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: dim ? 0.45 : 1, scale: isFocused ? 1.04 : 1 }}
              transition={{ duration: 0.65, delay: 0.2 + facetIndex * 0.08 }}
              whileHover={{ scale: 1.06 }}
              onClick={() => toggleFacetExpansion(facetKey)}
              className="cursor-pointer"
              filter="url(#softShadow)"
            >
              <rect
                x={pos.x - w / 2}
                y={pos.y - h / 2}
                width={w}
                height={h}
                rx={16}
                fill={facet.fill}
                stroke={facet.color}
                strokeOpacity={facetKey === "A" ? 0.55 : 0.38}
                strokeWidth={facetKey === "A" ? 2 : 1.2}
              />
              {isFocused && (
                <rect
                  x={pos.x - w / 2 - 6}
                  y={pos.y - h / 2 - 6}
                  width={w + 12}
                  height={h + 12}
                  rx={20}
                  fill="none"
                  stroke={facet.color}
                  strokeOpacity="0.2"
                  className="pulse-ring-light"
                />
              )}
              <GlassNodeLabel x={pos.x} y={pos.y - 8}>
                {facetKey}
              </GlassNodeLabel>
              <text x={pos.x} y={pos.y + 14} textAnchor="middle" className="fill-[#5c7378] text-[10px]">
                {facet.short}
              </text>
              {expanded && (
                <text x={pos.x} y={pos.y + 28} textAnchor="middle" className="fill-[#8a9da1] text-[9px]">
                  {facet.categories.length} 类
                </text>
              )}
            </motion.g>
          );
        })}

        {FACET_KEYS.map((facetKey) => {
          if (!expandedFacets.has(facetKey)) return null;
          const facet = facets[facetKey];
          const angle = facetAngles[facetKey];
          const facetPos = polar(center.x, center.y, facetRadius, angle);
          const categories = facet.categories;
          const spread = facetKey === "D" ? 5.2 : facetKey === "E" ? 5.6 : facetKey === "C" ? 7.2 : 8.2;
          const dim = activeFacet && activeFacet !== facetKey;

          return categories.map((category, index) => {
            const localAngle = angle + (index - (categories.length - 1) / 2) * spread;
            const radius = categoryRadius + (facetKey === "A" ? 14 : 0) + (index % 2) * 8;
            const pos = polar(center.x, center.y, radius, localAngle);
            const selected = selectedCodes[facetKey].includes(category.code);
            const count = objects.filter((o) => o[facetKey].includes(category.code)).length;
            const rw = selected ? 52 : 44;
            const rh = selected ? 40 : 34;
            return (
              <g key={`${facetKey}-${category.code}`} opacity={dim ? 0.22 : 1}>
                <motion.path
                  d={`M ${facetPos.x} ${facetPos.y} L ${pos.x} ${pos.y}`}
                  fill="none"
                  stroke={selected ? facet.line : "rgba(120,150,155,0.22)"}
                  strokeWidth={selected ? 1.2 : 0.65}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: selected ? 0.75 : 0.3 }}
                  transition={{ duration: 0.75, delay: 0.45 + index * 0.015 }}
                  className="knowledge-line-light"
                />
                <motion.g
                  style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                  initial={{ opacity: 0, scale: 0.72 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.02 }}
                  whileHover={{ scale: 1.08 }}
                  onClick={() => toggleCategory(facetKey, category)}
                  className="cursor-pointer"
                  filter="url(#softShadow)"
                >
                  <rect
                    x={pos.x - rw / 2}
                    y={pos.y - rh / 2}
                    width={rw}
                    height={rh}
                    rx={10}
                    fill={selected ? "#fffdf8" : "rgba(255,255,255,0.92)"}
                    stroke={facet.color}
                    strokeOpacity={selected ? 0.65 : 0.28}
                    strokeWidth={selected ? 1.4 : 0.9}
                  />
                  <GlassNodeLabel x={pos.x} y={pos.y - 6} small>
                    {category.code}
                  </GlassNodeLabel>
                  <text x={pos.x} y={pos.y + 8} textAnchor="middle" className="fill-[#8a9da1] text-[8px]">
                    {count}
                  </text>
                  <text x={pos.x} y={pos.y + 22} textAnchor="middle" className="fill-[#6a858a] text-[8px]">
                    {truncate(category.name, 6)}
                  </text>
                </motion.g>
              </g>
            );
          });
        })}
      </svg>
    </section>
  );
}

function RelicGalleryCard({ obj, index, onOpen }) {
  const era = obj.labels.B?.[0] ?? "—";
  const glaze = obj.labels.C?.slice(0, 2).join(" · ") ?? "—";
  const kiln = obj.labels.D?.[0] ?? "—";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, delay: Math.min(index, 20) * 0.025 }}
      className="group break-inside-avoid"
    >
      <button
        type="button"
        onClick={() => onOpen(obj)}
        className="relative w-full overflow-hidden rounded-[1.35rem] border border-white/90 bg-white/80 text-left shadow-[0_12px_40px_rgba(50,80,90,0.07)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(50,80,90,0.11)]"
      >
        <div className="relative aspect-[4/5] w-full bg-gradient-to-b from-[#f4f7f8] to-[#eef3f5]">
          {obj.image ? (
            <img
              src={obj.image}
              alt={obj.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain p-3 transition duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-xs text-[#8a9da1]">图像路径待关联 · {obj.imageFile || "—"}</div>
          )}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-gradient-to-t from-white/85 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex flex-wrap gap-1 px-3 pb-3">
              <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] text-[#3d6ea5] shadow-sm">{kiln}</span>
              <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] text-[#6d8f86] shadow-sm">{glaze}</span>
              <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] text-[#4a8f9a] shadow-sm">{era}</span>
            </div>
          </div>
        </div>
        <div className="space-y-1.5 border-t border-[#eef3f5] px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-['Noto_Serif_SC',serif] text-sm font-medium leading-snug text-[#1e2d30]">{obj.name}</h4>
            <span className="shrink-0 font-mono text-[10px] text-[#b8954a]">#{String(obj.serial).padStart(2, "0")}</span>
          </div>
          <p className="text-[11px] text-[#6a858a]">{obj.section}</p>
          <p className="break-all font-mono text-[10px] leading-relaxed text-[#5c7378]">{obj.code}</p>
        </div>
      </button>
    </motion.article>
  );
}

function RelicGallery({ objects, onOpen }) {
  return (
    <section
      id="relic-gallery-wall"
      className="rounded-[2rem] border border-white/80 bg-white/40 p-6 shadow-[0_16px_64px_rgba(50,80,90,0.06)] backdrop-blur-xl scroll-mt-24"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e4ecee] pb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.26em] text-[#6a858a]">Relic Image Archive</div>
          <h3 className="font-['Noto_Serif_SC',serif] text-2xl text-[#1e2d30]">器物图像展墙</h3>
          <p className="mt-2 max-w-2xl text-sm text-[#5c7378]">
            器物清单与编码以项目根目录《依据》内汇报表为准；图像以《依据》内《陶瓷器物图片分类卡片版》为准，按「原图序号」1–63 与序号、分面标引一致。统一展陈比例，支持懒加载与展签式详情。
          </p>
        </div>
        <div className="rounded-full border border-[#e4ecee] bg-white/80 px-4 py-2 text-sm text-[#4d5f63]">
          展陈 <span className="font-mono font-semibold text-[#1e2d30]">{objects.length}</span> 件
        </div>
      </div>

      <LayoutGroup>
        <motion.div layout className="gallery-masonry mt-6">
          <AnimatePresence mode="popLayout">
            {objects.map((obj, index) => (
              <RelicGalleryCard key={obj.id} obj={obj} index={index} onOpen={onOpen} />
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </section>
  );
}

function CodeBreakdown({ code }) {
  const p = parseClassificationCode(code);
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {FACET_KEYS.map((k) => (
        <div key={k} className="rounded-xl border border-[#e8eef0] bg-white/70 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-[#8a9da1]">
            {k} {facets[k].short}
          </div>
          <div className="mt-1 font-mono text-xs text-[#1e2d30]">
            {p[k].join(" + ")}
          </div>
          <div className="mt-0.5 text-[11px] text-[#5c7378]">{p[k].map((c) => labelForCode(c)).join(" · ")}</div>
        </div>
      ))}
    </div>
  );
}

function ExhibitDetailModal({ object, objects, onClose, onOpenRelated }) {
  const [lightbox, setLightbox] = useState(false);
  const related = useMemo(() => (object ? relatedRelics(object, objects, 8) : []), [object, objects]);

  useEffect(() => {
    setLightbox(false);
  }, [object?.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (lightbox) setLightbox(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, lightbox]);

  if (!object) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a3f44]/25 px-4 py-8 backdrop-blur-[2px]"
      onClick={onClose}
    >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/90 bg-[#fdfcfa]/95 shadow-[0_32px_100px_rgba(30,50,55,0.18)] backdrop-blur-2xl lg:max-h-[90vh] lg:flex-row"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full border border-[#e4ecee] bg-white/90 p-2 text-[#5c7378] hover:bg-white"
          >
            <X size={18} />
          </button>

          <div className="relative flex min-h-[280px] flex-[1.1] items-center justify-center bg-gradient-to-br from-[#eef5f6] to-[#e4eef0] p-6 lg:min-h-0">
            {object.image ? (
              <button
                type="button"
                onClick={() => setLightbox(true)}
                className="group relative max-h-[min(72vh,640px)] w-full"
              >
                <img
                  src={object.image}
                  alt={object.name}
                  className="mx-auto max-h-[min(72vh,640px)] w-auto max-w-full object-contain drop-shadow-[0_12px_40px_rgba(40,60,70,0.15)]"
                />
                <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] text-[#4d5f63] opacity-0 shadow transition group-hover:opacity-100">
                  <ZoomIn size={14} /> 放大查看
                </span>
              </button>
            ) : (
              <p className="text-sm text-[#8a9da1]">暂无图像文件</p>
            )}
          </div>

          <div className="custom-scrollbar-light flex max-h-[50vh] flex-1 flex-col overflow-y-auto border-t border-[#e8eef0] p-6 lg:max-h-none lg:border-l lg:border-t-0">
            <div className="mb-1 font-mono text-xs text-[#b8954a]">{object.id}</div>
            <h2 className="font-['Noto_Serif_SC',serif] text-2xl font-semibold text-[#1e2d30]">{object.name}</h2>
            <div className="mt-2 inline-flex w-fit rounded-full border border-[#d4e4e6] bg-white/80 px-3 py-1 text-xs text-[#4a6670]">
              {object.section}
            </div>
            <p className="mt-4 text-sm leading-7 text-[#4d5f63]">{object.description}</p>

            <div className="mt-5 rounded-2xl border border-[#e8eef0] bg-white/70 p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#8a9da1]">完整编码</div>
              <div className="mt-2 break-all font-mono text-sm text-[#1e2d30]">{object.code}</div>
            </div>

            <div className="mt-4">
              <div className="mb-2 text-xs font-medium text-[#5c7378]">编码拆解</div>
              <CodeBreakdown code={object.code} />
            </div>

            <div className="mt-6">
              <div className="mb-2 text-xs font-medium text-[#5c7378]">分面标引</div>
              <dl className="space-y-2 text-sm">
                {FACET_KEYS.map((k) => (
                  <div key={k} className="flex gap-3 border-b border-[#eef3f5] py-2 last:border-0">
                    <dt className="w-24 shrink-0 font-mono text-xs text-[#6a858a]">
                      {k} {facets[k].short}
                    </dt>
                    <dd className="text-[#2a3f44]">{objectFacetLabels(object, k)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {related.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 text-xs font-medium text-[#5c7378]">同类与关联器物</div>
                <div className="flex flex-wrap gap-2">
                  {related.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onOpenRelated(r)}
                      className="rounded-xl border border-[#e4ecee] bg-white/80 px-3 py-2 text-left text-xs text-[#2a3f44] transition hover:border-[#b8954a]/45"
                    >
                      <div className="font-medium">{r.name}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-[#8a9da1]">{r.code}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

      <AnimatePresence>
        {lightbox && object.image ? (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-white/95 p-6 backdrop-blur-md"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(false);
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(false);
              }}
              className="absolute right-6 top-6 rounded-full border border-[#e4ecee] bg-white p-2"
            >
              <X size={22} />
            </button>
            <img
              src={object.image}
              alt={object.name}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function StatBarsLight({ title, data, accent }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <section className="rounded-2xl border border-[#e8eef0] bg-white/70 p-4 shadow-[0_8px_32px_rgba(50,80,90,0.05)]">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#1e2d30]">
        <BarChart3 size={16} style={{ color: accent }} />
        {title}
      </div>
      <div className="space-y-2.5">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between gap-2 text-[11px] text-[#5c7378]">
              <span className="truncate">{item.label}</span>
              <span className="shrink-0 font-mono text-[#1e2d30]">
                <CountUp value={item.value} />
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#eef3f5]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${accent}55, ${accent})` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionRechartsLight({ data }) {
  return (
    <section className="rounded-2xl border border-[#e8eef0] bg-white/70 p-4 shadow-[0_8px_32px_rgba(50,80,90,0.05)]">
      <div className="mb-2 text-sm font-medium text-[#1e2d30]">板块器物分布</div>
      <div className="h-[220px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 4 }} barCategoryGap={12}>
            <CartesianGrid strokeDasharray="4 8" stroke="rgba(90,130,140,0.12)" horizontal={false} />
            <XAxis type="number" stroke="#9db5b9" tick={{ fill: "#5c7378", fontSize: 10 }} />
            <YAxis type="category" dataKey="label" width={118} stroke="#9db5b9" tick={{ fill: "#4d5f63", fontSize: 10 }} />
            <Tooltip
              cursor={{ fill: "rgba(184,149,74,0.06)" }}
              contentStyle={{
                background: "rgba(253,252,250,0.96)",
                border: "1px solid #e4ecee",
                borderRadius: 12,
                fontSize: 12,
                color: "#1e2d30",
              }}
              formatter={(v) => [`${v} 件`, "数量"]}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={16}>
              {data.map((entry, i) => (
                <Cell key={entry.label} fill={CHART_MUTED[i % CHART_MUTED.length]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function EncodingAndStats({ objects }) {
  const sectionData = useMemo(() => aggregateSection(objects), [objects]);
  const eraData = useMemo(() => aggregateFacetTop(objects, "B", 11), [objects]);
  const kilnData = useMemo(() => aggregateFacetTop(objects, "D", 12), [objects]);
  const functionData = useMemo(() => aggregateFacetTop(objects, "A", 12), [objects]);
  const glazeData = useMemo(() => aggregateFacetTop(objects, "C", 12), [objects]);

  return (
    <footer className="grid gap-6 rounded-[2rem] border border-white/80 bg-white/50 p-6 shadow-[0_16px_64px_rgba(50,80,90,0.06)] backdrop-blur-xl lg:grid-cols-[minmax(280px,1fr)_2fr]">
      <section className="rounded-2xl border border-[#e8eef0] bg-[#fdfcfa]/80 p-5">
        <div className="text-[10px] uppercase tracking-[0.28em] text-[#6a858a]">Encoding</div>
        <h3 className="mt-2 font-['Noto_Serif_SC',serif] text-xl text-[#1e2d30]">分类编码 CR-A-B-C-D-E-F</h3>
        <p className="mt-3 text-sm leading-7 text-[#4d5f63]">
          <strong className="text-[#2a3f44]">CR</strong> 为陶瓷文物资源标识；<strong className="text-[#2a3f44]">A</strong> 为主分类轴（器用功能），<strong className="text-[#2a3f44]">B–F</strong> 为辅助分面，分别承载年代、胎釉、窑口、工艺与纹饰。
        </p>
        <ul className="mt-4 space-y-2 text-xs leading-6 text-[#5c7378]">
          <li>
            <span className="font-mono text-[#b8954a]">+</span> 同一分面多值并存，如 C6+C13。
          </li>
          <li>
            <span className="font-mono text-[#b8954a]">0</span> 信息不详（如 D0、E0、F0）。
          </li>
          <li>
            <span className="font-mono text-[#b8954a]">99</span> 扩展类目，用于新材料、新窑口或新工艺。
          </li>
        </ul>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {FACET_KEYS.map((key) => (
            <div key={key} className="rounded-xl border border-[#e8eef0] bg-white/80 px-3 py-2 text-xs">
              <span className="font-mono font-semibold" style={{ color: facets[key].color }}>
                {key}
              </span>
              <span className="ml-2 text-[#4d5f63]">{facets[key].name}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SectionRechartsLight data={sectionData} />
        <StatBarsLight title="器用功能 A" data={functionData} accent="#b8954a" />
        <StatBarsLight title="胎釉品类 C" data={glazeData} accent="#6d8f86" />
        <StatBarsLight title="年代 B" data={eraData} accent="#4a8f9a" />
        <StatBarsLight title="窑口 / 产地 D" data={kilnData} accent="#3d6ea5" />
      </div>
    </footer>
  );
}

export default function App() {
  const objects = useMemo(() => buildRelicRecords(), []);
  const [selectedCodes, setSelectedCodes] = useState(makeEmptySelection);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFacet, setActiveFacet] = useState(null);
  const [expandedFacets, setExpandedFacets] = useState(() => new Set(FACET_KEYS));
  const [detailObject, setDetailObject] = useState(null);

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(FACET_KEYS.map((key) => [key, {}]));
    objects.forEach((object) => {
      FACET_KEYS.forEach((key) => {
        object[key].forEach((code) => {
          counts[key][code] = (counts[key][code] || 0) + 1;
        });
      });
    });
    return counts;
  }, [objects]);

  const filteredObjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return objects.filter((object) => {
      const facetMatch = FACET_KEYS.every((key) => {
        const selected = selectedCodes[key];
        if (!selected.length) return true;
        return selected.some((code) => object[key].includes(code));
      });
      if (!facetMatch) return false;
      if (!query) return true;
      const haystack = [
        object.name,
        object.section,
        object.code,
        object.description,
        ...FACET_KEYS.flatMap((key) => object[key]),
        ...FACET_KEYS.flatMap((key) => object.labels[key]),
        ...(object.keywords || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [objects, selectedCodes, searchTerm]);

  const clearFilters = useCallback(() => {
    setSelectedCodes(makeEmptySelection());
    setSearchTerm("");
    setActiveFacet(null);
  }, []);

  const expandAll = useCallback(() => {
    setExpandedFacets(new Set(FACET_KEYS));
    setActiveFacet(null);
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedFacets(new Set());
    setActiveFacet(null);
  }, []);

  return (
    <div className="min-h-screen text-[#1e2d30] selection:bg-[#c5e4e8]/50 selection:text-[#1e2d30]">
      <MuseumBackdrop />
      <style>{`
        :root { color-scheme: light; }
        .ceramic-sheen {
          background: linear-gradient(125deg, transparent 0%, rgba(255,255,255,0.5) 40%, transparent 58%),
            radial-gradient(circle at 70% 20%, rgba(186, 220, 224, 0.15), transparent 45%);
          animation: sheenDrift 22s ease-in-out infinite alternate;
        }
        @keyframes sheenDrift {
          0% { transform: translate3d(-1%, 0, 0); opacity: 0.55; }
          100% { transform: translate3d(1.5%, 0.5%, 0); opacity: 0.85; }
        }
        .particle {
          animation-name: particleDrift;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
        }
        @keyframes particleDrift {
          0% { transform: translate3d(0,0,0); }
          100% { transform: translate3d(12px,-18px,0); }
        }
        .knowledge-line-light {
          stroke-dasharray: 6 14;
          animation: lineFlowLight 12s linear infinite;
        }
        @keyframes lineFlowLight {
          to { stroke-dashoffset: -80; }
        }
        .pulse-ring-light {
          transform-origin: center;
          animation: pulseRingLight 2.8s ease-out infinite;
        }
        @keyframes pulseRingLight {
          0% { opacity: 0.35; transform: scale(0.96); }
          100% { opacity: 0; transform: scale(1.15); }
        }
        .gallery-masonry {
          column-count: 1;
          column-gap: 1.25rem;
        }
        @media (min-width: 640px) { .gallery-masonry { column-count: 2; } }
        @media (min-width: 1024px) { .gallery-masonry { column-count: 3; } }
        @media (min-width: 1536px) { .gallery-masonry { column-count: 4; } }
        .custom-scrollbar-light::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-light::-webkit-scrollbar-thumb { background: rgba(90,130,140,0.22); border-radius: 999px; }
        .custom-scrollbar-light::-webkit-scrollbar-track { background: rgba(230,238,240,0.6); border-radius: 999px; }
      `}</style>

      <div className="relative z-10 mx-auto flex w-full max-w-[1920px] flex-col gap-8 px-4 py-6 md:px-6 lg:py-8">
        <HeroSection objects={objects} filteredCount={filteredObjects.length} />

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[300px_1fr]">
          <FacetFilterPanel
            selectedCodes={selectedCodes}
            setSelectedCodes={setSelectedCodes}
            categoryCounts={categoryCounts}
            activeFacet={activeFacet}
            setActiveFacet={setActiveFacet}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clearFilters={clearFilters}
            expandAll={expandAll}
            collapseAll={collapseAll}
          />

          <div className="flex flex-col gap-8">
            <KnowledgeGraph
              objects={objects}
              filteredObjects={filteredObjects}
              selectedCodes={selectedCodes}
              activeFacet={activeFacet}
              setActiveFacet={setActiveFacet}
              expandedFacets={expandedFacets}
              setExpandedFacets={setExpandedFacets}
              setSelectedCodes={setSelectedCodes}
            />
            <RelicGallery objects={filteredObjects} onOpen={setDetailObject} />
          </div>
        </div>

        <EncodingAndStats objects={objects} />
      </div>

      <AnimatePresence>
        {detailObject ? (
          <ExhibitDetailModal
            key={detailObject.id}
            object={detailObject}
            objects={objects}
            onClose={() => setDetailObject(null)}
            onOpenRelated={(o) => setDetailObject(o)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
