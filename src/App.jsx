import { useEffect, useMemo, useRef, useState } from "react";
import ProductSearch from "./components/ProductSearch.jsx";
import OptimizedImage from "./components/OptimizedImage.jsx";
import { products, manufacturerTabs, categoryMeta } from "./data/productCatalog.js";
import { knowledgeQaArticles, knowledgeQaCategories } from "./data/knowledgeQa.js";

const navItems = [
  ["/#strength", "资质与服务"],
  ["/products", "产品中心"],
  ["/#solutions", "案例及相关业绩"],
  ["/knowledge", "焊接材料问答Q&A"],
  ["/team-vision", "团队与愿景"],
  ["/#contact", "联系我们"]
];

const customerLocationOptions = ["海曙","鄞州","江北","镇海","北仑","余姚","慈溪","奉化","宁海","象山县","新昌","嵊州上虞","浙江","上海","江苏","其他","海外"];

const caseCards = [
  ["船舶制造", "舟山区域大型船舶制造客户", "年度供货规模：千吨级。配套实芯焊丝、药芯焊丝、埋弧焊丝焊剂及结构钢焊条。"],
  ["船舶修造", "宁波及周边船舶客户群", "年度供货规模：500吨以上。按生产计划进行多品牌焊材组合与分批配送。"],
  ["机械制造", "浙江装备制造客户", "年度供货规模：数百吨级。以碳钢实芯焊丝、低合金焊材和配套辅材为主。"],
  ["钢材贸易", "区域工程配套客户", "年度供货规模：200吨以上。提供常用焊条、实芯焊丝和品牌替代建议。"]
];


const certificates = [
  {
    title: "\u5929\u6d25\u91d1\u6865\u6388\u6743\u9500\u552e\u3001\u670d\u52a1\u7ecf\u9500\u5546",
    issuer: "\u5929\u6d25\u5e02\u91d1\u6865\u710a\u6750\u96c6\u56e2\u9500\u552e\u6709\u9650\u516c\u53f8",
    period: "2026",
    image: "/assets/certificates/jinqiao-authorization-2026.png"
  },
  {
    title: "\u4e0a\u6d77\u4e1c\u98ce\u6388\u6743\u8bc1\u4e66",
    issuer: "\u4e0a\u6d77\u710a\u63a5\u5668\u6750\u6709\u9650\u516c\u53f8",
    period: "2026",
    image: "/assets/certificates/dongfeng-authorization-2026.jpg"
  },
  {
    title: "\u4e0a\u6d77\u5927\u897f\u6d0b\u7ecf\u9500\u5546\u6388\u6743\u4e66",
    issuer: "\u4e0a\u6d77\u5927\u897f\u6d0b\u710a\u63a5\u6750\u6599\u6709\u9650\u8d23\u4efb\u516c\u53f8",
    period: "2026",
    image: "/assets/certificates/atlantic-authorization-2026.png"
  },
  {
    title: "ITW \u710a\u63a5\u4ea7\u54c1\u6388\u6743\u8bc1\u4e66",
    issuer: "ITW Welding Greater China",
    period: "2026",
    image: "/assets/certificates/itw-tiantai-authorization-2026.png"
  }
];


const defaultSeo = {
  title: "宁波志凡焊材有限公司 | 焊材一级经销与现货保供服务",
  description: "宁波志凡焊材有限公司位于宁波市鄞州区富宁路119号，专业批发焊材近二十八年，系金桥、大西洋、东风、天泰、孚尔姆、运河、亚泰等品牌全国一级经销商。年供货量数万吨，常备库存数千吨，全系列覆盖实芯气保焊丝、药芯气保焊丝、埋弧焊丝焊剂、不锈钢及铝焊材，并配套焊割配件与五金工具。主营服务江浙沪及周边船厂、机械厂、钢结构、压力容器、电力工程（火/风/水/核电）及石化项目，提供一站式配货、原厂质保书、项目跟单及专属保供服务，现货充足，宁波48小时、浙江96小时高效送达。",
  keywords: "宁波焊材批发,浙江焊材供应商,江浙沪焊材供应,船用焊材,钢结构焊材,压力容器焊材,NB/T 47018标准焊材,金桥焊材,大西洋焊材,上海东风焊材,天泰焊材,J422碳钢焊条,J507低合金钢焊条,ER50-6气体保护焊丝,E71T-1药芯焊丝,A102不锈钢焊条,H08MnA埋弧焊丝,SJ101烧结焊剂,焊材质量证明书,焊材现货供应,焊材急件配送"
};

function setMetaAttribute(selector, identity, values) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(identity).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  Object.entries(values).forEach(([key, value]) => element.setAttribute(key, value));
}

function usePageMeta(meta) {
  useEffect(() => {
    if (!meta) return undefined;
    const pageMeta = { ...defaultSeo, ...meta };
    document.title = pageMeta.title;
    setMetaAttribute('meta[name="description"]', { name: "description" }, { content: pageMeta.description });
    setMetaAttribute('meta[name="keywords"]', { name: "keywords" }, { content: pageMeta.keywords });
    setMetaAttribute('meta[property="og:title"]', { property: "og:title" }, { content: pageMeta.title });
    setMetaAttribute('meta[property="og:description"]', { property: "og:description" }, { content: pageMeta.description });
  }, [meta?.title, meta?.description, meta?.keywords]);
}

const heroVideoSources = {
  desktop: "/assets/videos/hero-welding-loop.mp4",
  mobile: "/assets/videos/hero-mobile-welding-loop.mp4"
};

function getHeroVideoSource() {
  if (typeof window !== "undefined" && window.matchMedia?.("(max-width: 820px)").matches) {
    return heroVideoSources.mobile;
  }
  return heroVideoSources.desktop;
}

function useHeroVideoPlayback() {
  const videoRef = useRef(null);
  const [videoSource, setVideoSource] = useState(getHeroVideoSource);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const media = window.matchMedia?.("(max-width: 820px)");

    const prepareInlinePlayback = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("autoplay", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "true");
      video.setAttribute("x5-playsinline", "true");
      video.setAttribute("x5-video-player-type", "h5");
      video.setAttribute("x5-video-player-fullscreen", "false");
    };

    const tryPlay = () => {
      prepareInlinePlayback();
      const playPromise = video.play?.();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => video.classList.remove("video-fallback"))
          .catch(() => video.classList.add("video-fallback"));
      }
    };

    const syncSource = () => {
      const nextSource = media?.matches ? heroVideoSources.mobile : heroVideoSources.desktop;
      setVideoSource((currentSource) => (currentSource === nextSource ? currentSource : nextSource));
      if (video.getAttribute("src") !== nextSource) {
        video.classList.remove("video-fallback");
        video.setAttribute("src", nextSource);
        video.load();
      }
      tryPlay();
    };

    const retryVisiblePlayback = () => {
      if (!document.hidden) tryPlay();
    };

    prepareInlinePlayback();
    syncSource();
    media?.addEventListener?.("change", syncSource);
    media?.addListener?.(syncSource);
    video.addEventListener("loadedmetadata", tryPlay);
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    document.addEventListener("visibilitychange", retryVisiblePlayback);
    document.addEventListener("touchstart", tryPlay, { once: true, passive: true });

    return () => {
      media?.removeEventListener?.("change", syncSource);
      media?.removeListener?.(syncSource);
      video.removeEventListener("loadedmetadata", tryPlay);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", retryVisiblePlayback);
      document.removeEventListener("touchstart", tryPlay);
    };
  }, []);

  return { videoRef, videoSource };
}

function productCardStyle(slug) {
  const base = `/assets/products/cards/${slug}.webp`;
  const optimizedBase = `/assets/optimized/products__cards__${slug}`;
  return {
    "--product-card-bg": `url('${base}')`,
    "--product-card-bg-set": `image-set(url('${optimizedBase}-480.webp') 1x, url('${optimizedBase}-768.webp') 2x, url('${base}') 3x)`
  };
}
const productRegionKeywords = ["宁波", "舟山", "浙江", "绍兴", "新昌", "江浙沪", "宁波焊材", "舟山焊材", "浙江焊材供应商", "绍兴焊材", "新昌焊材", "江浙沪焊材供应"];
const productServiceKeywords = ["焊材现货供应", "焊材质量证明书", "焊材厂家授权经销商", "焊材技术选型支持", "焊材急件配送"];
const productIndustryKeywords = ["船厂焊材", "钢结构焊材", "压力容器焊材", "机械厂焊材", "电力工程焊材", "石化项目焊材"];
const productBrandKeywords = ["金桥焊材", "大西洋焊材", "上海东风焊材", "天泰焊材"];
const categorySeoKeywordMap = {
  "carbon-steel-electrodes": ["碳钢焊条", "低合金钢焊条", "J422碳钢焊条", "J507低合金钢焊条", "Q235焊条", "Q345焊条", "手工电弧焊焊条"],
  "solid-wires": ["实芯气保焊丝", "氩弧焊填充焊丝", "ER50-6气体保护焊丝", "CO₂气体保护焊丝", "钢结构CO₂焊丝", "汽车车身焊丝"],
  "flux-cored-wires": ["药芯气保焊丝", "E71T-1药芯焊丝", "船用药芯焊丝", "非合金钢药芯焊丝", "工程机械药芯焊丝"],
  "stainless-materials": ["不锈钢焊材", "不锈钢焊条", "不锈钢焊丝", "ER308L焊丝", "ER316L焊丝", "A102不锈钢焊条", "A132不锈钢焊条"],
  "submerged-arc": ["碳钢埋弧焊丝焊剂", "埋弧焊焊丝焊剂", "H08MnA埋弧焊丝", "H10Mn2埋弧焊丝", "SJ101烧结焊剂", "HJ431熔炼焊剂"],
  "aluminum-wires": ["铝焊丝", "铝合金焊丝", "铝镁合金焊丝", "铝硅合金焊丝", "船用铝合金焊丝"],
  "special-materials": ["特种焊材", "耐磨焊条", "堆焊焊条", "耐热钢焊条", "低温钢焊条", "镍基合金焊丝", "异种钢焊材"],
  "equipment-accessories": ["焊割配件", "电焊机", "割炬", "焊接工具", "五金工具", "设备配件与工具"]
};

function uniqueSeoTerms(terms) {
  return [...new Set(terms.flatMap((term) => String(term || "").split(/[，,、/]+/)).map((term) => term.trim()).filter(Boolean))].join(",");
}

function limitSeoText(text, max = 155) {
  const normalized = String(text || "").replace(/\s+/g, "").replace(/。{2,}/g, "。");
  return normalized.length > max ? normalized.slice(0, max - 1) + "。" : normalized;
}

function firstProductText(...values) {
  for (const value of values) {
    const text = Array.isArray(value) ? value.filter(Boolean).join("；") : String(value || "");
    const cleaned = text.replace(/\s+/g, "").trim();
    if (cleaned) return cleaned.split(/[。；;]/)[0];
  }
  return "支持按执行标准、成分和熔敷金属力学性能进行选型";
}

function normalizeStandards(product) {
  return [...new Set([...(product?.standards || []), product?.standard].flatMap((item) => String(item || "").split(/\s*\/\s*/)).map((item) => item.trim()).filter(Boolean))];
}

function productCategorySeo(meta, categorySlug = "", manufacturer = "全部") {
  const title = meta.title || "产品中心";
  const activeManufacturer = manufacturer && manufacturer !== "全部" ? manufacturer : "";
  const manufacturerText = activeManufacturer ? `${activeManufacturer} ` : "";
  const categoryKeywords = categorySeoKeywordMap[categorySlug] || products.map((item) => item.title);
  const description = limitSeoText(`${manufacturerText}${title}现货产品清单，${meta.description || "支持按分类与厂家挑选焊材"}。服务宁波、舟山、浙江、绍兴、新昌及江浙沪客户，适配船厂、钢结构、压力容器、机械厂、电力工程和石化项目采购。`);
  const keywords = uniqueSeoTerms([
    manufacturerText + title,
    title,
    activeManufacturer && `${activeManufacturer}焊材`,
    meta.eyebrow,
    categoryKeywords,
    productRegionKeywords,
    productServiceKeywords,
    productIndustryKeywords,
    productBrandKeywords
  ]);
  return {
    title: `${manufacturerText}${title}现货清单 | 宁波舟山浙江焊材供应 | 宁波志凡焊材有限公司`,
    description,
    keywords
  };
}

function productDetailSeo(product) {
  if (!product) return {
    title: "产品详情 | 宁波志凡焊材有限公司",
    description: "查看焊材型号、执行标准、化学成分、熔敷金属力学性能与规格信息，服务宁波、舟山、浙江、绍兴、新昌及江浙沪焊材采购。",
    keywords: uniqueSeoTerms(["焊材型号", "执行标准", "化学成分", "熔敷金属", productRegionKeywords, productServiceKeywords])
  };
  const manufacturer = product.manufacturer || "焊材品牌";
  const model = product.model || product.name || "焊材型号";
  const category = product.categoryName || "焊材";
  const standards = normalizeStandards(product);
  const categoryKeywords = categorySeoKeywordMap[product.categorySlug] || [category];
  const useCase = firstProductText(product.applications, product.summary, product.introduction);
  const standardText = standards.length ? `执行标准：${standards.slice(0, 4).join("、")}。` : "执行标准按厂家资料确认。";
  const stockText = product.inStock ? "仓内现货产品，" : "";
  const description = limitSeoText(`${manufacturer}${model}${product.name ? " " + product.name : ""}，${category}详情页。${useCase}。${standardText}可查看成分、熔敷金属力学性能与规格，${stockText}服务宁波、舟山、浙江、绍兴、新昌及江浙沪项目采购。`);
  const keywords = uniqueSeoTerms([
    `${manufacturer}${model}`,
    `${model}${category}`,
    product.name,
    product.model,
    manufacturer,
    `${manufacturer}焊材`,
    category,
    categoryKeywords,
    standards,
    product.inStock && "仓内现货产品",
    productRegionKeywords,
    productServiceKeywords,
    "熔敷金属化学成分",
    "焊材力学性能"
  ]);
  return {
    title: `${manufacturer} ${model} ${category} | 标准 成分 熔敷金属 | 宁波志凡焊材有限公司`,
    description,
    keywords
  };
}

const knowledgeArticles = [
  ["01", "焊材选型通用原则：先定母材，再定工艺，再定牌号", "先定母材，再定工艺，再定牌号，避免只按品牌或单一型号采购。", "/articles/selection-principles.html"],
  ["02", "最常见碳钢类、不锈钢类匹配表", "适合快速沟通常用母材、焊材类型和替代方向。", "/articles/matching-table.html"],
  ["03", "典型行业场景的金桥焊材推荐", "围绕钢结构、工程机械、桥梁、水电、储罐等场景建立选型入口。", "/articles/industry-recommendations.html"],
  ["04", "实心焊丝焊材匹配：碳钢和低合金钢的主力方案", "碳钢和低合金钢的主力方案，是高频采购与库存备货基础。", "/articles/solid-wire-matching.html"],
  ["05", "药芯焊丝焊材匹配：从强度、保护气体和焊接位置选", "从强度、保护气体和焊接位置判断，兼顾效率与成形。", "/articles/flux-cored-wire-matching.html"],
  ["06", "埋弧焊材基础：焊丝和焊剂必须成套看", "焊丝和焊剂必须成套看，适合厚板、长焊缝和大型构件。", "/articles/submerged-arc-basics.html"],
  ["07", "不锈钢焊材匹配：304、316L、双相钢和异种钢", "覆盖304、316L、双相钢和异种钢，重点关注耐蚀与裂纹风险。", "/articles/stainless-welding-materials.html"],
  ["08", "高强钢和耐候钢实心焊丝匹配", "强调强度、韧性、预热及施工工况的综合匹配。", "/articles/high-strength-weathering-steel.html"],
  ["09", "焊材烘干、保管与现场发放", "减少受潮、错发和现场缺陷，是仓储与施工管理的基础。", "/articles/drying-storage-issue.html"],
  ["10", "常见气保焊焊接缺陷与解决", "从气孔、成形、飞溅、裂纹等问题定位保护气体和参数原因。", "/articles/gas-shielded-defects.html"],
  ["11", "药芯焊丝使用要点：气体、干伸长、电压和层间温度", "重点看气体、干伸长、电压和层间温度。", "/articles/flux-cored-operation.html"],
  ["12", "埋弧焊丝匹配：风电、水电、桥梁、储罐的常用组合", "适用于风电、水电、桥梁、储罐等常用组合判断。", "/articles/submerged-arc-combinations.html"],
  ["13", "常见埋弧焊焊接缺陷与解决", "围绕焊剂状态、坡口、焊速和热输入排查。", "/articles/submerged-arc-defects.html"],
  ["14", "不锈钢焊接缺陷与工艺控制", "关注晶间腐蚀、热裂纹、气孔与层间温度。", "/articles/stainless-defects.html"],
  ["15", "焊接是什么：把两块金属变成一个可靠接头", "用通俗方式解释可靠接头形成过程，适合作为入门基础。", "/articles/what-is-welding.html"]
];

function useIndustrialMotion(deps = []) {
  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = Array.from(document.querySelectorAll([
      ".section-heading",
      ".section-image",
      ".intro-text",
      ".intro > p",
      ".hero-metrics div",
      ".product-home-card",
      ".stock-proof-strip article",
      ".case-list article",
      ".case-data-grid article",
      ".delivery-card",
      ".seo-keyword-grid article",
      ".knowledge-card",
      ".strength-hero",
      ".credential-panel > div",
      ".service-grid article",
      ".stock-gallery figure",
      ".contact > div",
      ".amap-card",
      ".contact-form",
      ".product-row",
      ".detail-card",
      ".spec-table-card",
      ".detail-summary",
      ".certificate-slider",
      ".team-vision-hero",
      ".qa-index-hero",
      ".qa-index-card"
    ].join(",")));

    revealTargets.forEach((element, index) => {
      element.dataset.reveal = element.dataset.reveal || "true";
      element.style.setProperty("--reveal-order", String(index % 6));
      if (reduceMotion) element.classList.add("is-visible");
    });

    if (reduceMotion) return undefined;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -18%", threshold: 0.18 });

    revealTargets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, deps);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const media = window.matchMedia?.("(max-width: 760px)");
    if (reduceMotion || !media?.matches) return undefined;

    const selectors = ".hero-metrics, .credential-panel, .stock-proof-strip, .case-list.compact-list";
    const scrollers = Array.from(document.querySelectorAll(selectors)).filter((element) => element.scrollWidth > element.clientWidth + 12);
    if (!scrollers.length) return undefined;

    const paused = new WeakSet();
    const timers = new WeakMap();
    const cleanups = [];
    let frame = 0;
    let lastTime = performance.now();

    const pauseTemporarily = (element, delay = 1400) => {
      paused.add(element);
      window.clearTimeout(timers.get(element));
      timers.set(element, window.setTimeout(() => paused.delete(element), delay));
    };

    scrollers.forEach((element) => {
      element.classList.add("mobile-auto-marquee");
      const pause = () => pauseTemporarily(element);
      const hold = () => paused.add(element);
      const release = () => paused.delete(element);
      element.addEventListener("pointerdown", pause, { passive: true });
      element.addEventListener("wheel", pause, { passive: true });
      element.addEventListener("touchstart", pause, { passive: true });
      element.addEventListener("focusin", hold);
      element.addEventListener("focusout", release);
      cleanups.push(() => {
        element.classList.remove("mobile-auto-marquee");
        element.removeEventListener("pointerdown", pause);
        element.removeEventListener("wheel", pause);
        element.removeEventListener("touchstart", pause);
        element.removeEventListener("focusin", hold);
        element.removeEventListener("focusout", release);
        window.clearTimeout(timers.get(element));
      });
    });

    const tick = (time) => {
      const delta = Math.min(34, time - lastTime);
      lastTime = time;
      scrollers.forEach((element) => {
        if (paused.has(element)) return;
        const maxScroll = element.scrollWidth - element.clientWidth;
        if (maxScroll <= 4) return;
        element.scrollLeft += delta * 0.026;
        if (element.scrollLeft >= maxScroll - 1) element.scrollLeft = 0;
      });
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, deps);
  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;
    const hero = document.querySelector(".hero");
    if (!hero) return undefined;

    let ticking = false;
    const update = () => {
      const shift = Math.min(24, Math.max(0, window.scrollY * 0.035));
      hero.style.setProperty("--hero-shift", shift.toFixed(1) + "px");
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

function CountNumber({ value, suffix = "" }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setCurrent(value);
      return undefined;
    }

    let frame = 0;
    let started = false;
    const element = document.querySelector('[data-count-value="' + value + '"]');
    const run = () => {
      const start = performance.now();
      const duration = 760;
      const tick = (time) => {
        const progress = Math.min(1, (time - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(Math.round(value * eased));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      if (!started && entries.some((entry) => entry.isIntersecting)) {
        started = true;
        run();
        observer.disconnect();
      }
    }, { threshold: 0.4 });

    if (element) observer.observe(element);
    else run();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span data-count-value={value}>{current}{suffix}</span>;
}

function CertificateSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [preview, setPreview] = useState(null);

  const move = (direction) => {
    setActive((current) => (current + direction + certificates.length) % certificates.length);
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduceMotion) return undefined;
    const timer = window.setInterval(() => move(1), 4500);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div className="certificate-slider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="certificate-copy">
        <p className="eyebrow">Certificates</p>
        <h3>{"\u6388\u6743\u8bc1\u4e66"}</h3>
        <p>{"\u6838\u5fc3\u54c1\u724c\u6388\u6743\u6587\u4ef6\u96c6\u4e2d\u5c55\u793a\uff0c\u652f\u6301\u9879\u76ee\u6295\u6807\u3001\u4f9b\u8d27\u8d44\u8d28\u5ba1\u6838\u4e0e\u552e\u540e\u8d44\u6599\u914d\u5408\u3002"}</p>
        <div className="certificate-current">
          <strong>{certificates[active].title}</strong>
          <span>{certificates[active].issuer} - {certificates[active].period}</span>
        </div>
        <div className="certificate-controls" aria-label="certificate carousel controls">
          <button type="button" onClick={() => move(-1)} aria-label="previous certificate">{"<"}</button>
          <button type="button" onClick={() => move(1)} aria-label="next certificate">{">"}</button>
        </div>
      </div>
      <div className="certificate-stage" aria-live="polite">
        {certificates.map((item, index) => (
          <figure className={"certificate-slide" + (index === active ? " active" : "")} key={item.image} aria-hidden={index !== active}>
            <button type="button" className="certificate-preview-trigger" onClick={() => setPreview(item)} aria-label={"preview " + item.title}>
              <OptimizedImage src={item.image} alt={item.title} loading={index === 0 ? "eager" : "lazy"} />
            </button>
          </figure>
        ))}
      </div>
      <div className="certificate-dots" role="tablist" aria-label="certificate selector">
        {certificates.map((item, index) => (
          <button key={item.image} type="button" className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={"view " + item.title} aria-selected={index === active} />
        ))}
      </div>
      {preview && (
        <div className="certificate-modal" role="dialog" aria-modal="true" aria-label={preview.title} onClick={() => setPreview(null)}>
          <div className="certificate-modal-inner" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="certificate-modal-close" onClick={() => setPreview(null)}>{"\u5173\u95ed"}</button>
            <OptimizedImage src={preview.image} alt={preview.title} loading="eager" sizes="100vw" />
            <p>{preview.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 16);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`} id="top">
      <nav className="nav" aria-label="主导航">
        <a className="brand" href="/#home" aria-label="宁波志凡焊材有限公司首页" onClick={() => setOpen(false)}>
          <OptimizedImage className="brand-logo" src="/assets/site/zhifan-logo.png" alt="志凡焊材 logo" />
          <span>
            <strong>宁波志凡焊材有限公司</strong>
            <small>ZhiFan Welding Materials</small>
          </span>
        </a>
        <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="navLinks" aria-label="打开菜单" onClick={() => setOpen((value) => !value)}>
          <span></span><span></span><span></span>
        </button>
        <div className={`nav-links ${open ? "open" : ""}`} id="navLinks">
          {navItems.map(([href, label]) => (
            <a key={href} className={href.endsWith("#contact") ? "nav-cta" : undefined} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
        </div>
      </nav>
    </header>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", company: "", customerLocation: "", message: "" });
  const [status, setStatus] = useState({ type: "idle", text: "" });
  const disabled = status.type === "loading";

  async function submitInquiry(event) {
    event.preventDefault();
    setStatus({ type: "loading", text: "正在提交咨询..." });

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "提交失败");
      setStatus({ type: "success", text: "已收到咨询，我们会尽快联系您。" });
      setForm({ name: "", phone: "", company: "", customerLocation: "", message: "" });
    } catch (error) {
      setStatus({ type: "error", text: error.message || "提交失败，请稍后再试。" });
    }
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <form className="contact-form" onSubmit={submitInquiry}>
      <label>姓名<input type="text" name="name" value={form.name} onChange={updateField} placeholder="请输入联系人姓名" required /></label>
      <label>电话<input type="tel" name="phone" value={form.phone} onChange={updateField} placeholder="请输入联系电话" required /></label>
      <label>公司<input type="text" name="company" value={form.company} onChange={updateField} placeholder="请输入公司名称（选填）" /></label>
      <label>客户位置
        <select name="customerLocation" value={form.customerLocation} onChange={updateField}>
          <option value="">请选择客户位置（选填）</option>
          {customerLocationOptions.map((location) => <option key={location} value={location}>{location}</option>)}
        </select>
      </label>
      <label>需求说明<textarea name="message" rows="5" value={form.message} onChange={updateField} placeholder="例如：金桥 ER50-6 1.2mm，20吨，发往宁波鄞州，需合格证和材质证明" required></textarea></label>
      <button type="submit" disabled={disabled}>{disabled ? "提交中..." : "提交咨询"}</button>
      {status.text && <p className={`form-status ${status.type}`}>{status.text}</p>}
    </form>
  );
}

function AdminDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem("zhifanAdminToken") || "");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState({ type: "idle", text: "" });

  async function loadInquiries(event) {
    event?.preventDefault();
    setStatus({ type: "loading", text: "正在读取咨询数据..." });

    try {
      const response = await fetch("/api/inquiries", {
        headers: { "x-admin-token": token }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "读取失败");
      localStorage.setItem("zhifanAdminToken", token);
      setItems(result.items || []);
      setStatus({ type: "success", text: `已读取 ${result.items?.length || 0} 条咨询。` });
    } catch (error) {
      setItems([]);
      setStatus({ type: "error", text: error.message || "读取失败，请检查后台 token。" });
    }
  }

  function formatTime(value) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-heading">
          <a href="/" className="admin-back">返回网站</a>
          <p className="eyebrow">Admin</p>
          <h1>客户咨询后台</h1>
          <p>输入服务器环境变量中的 ADMIN_TOKEN，查看 MongoDB 中保存的客户咨询数据。</p>
        </div>

        <form className="admin-login" onSubmit={loadInquiries}>
          <label>
            后台 Token
            <input type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="请输入 ADMIN_TOKEN" required />
          </label>
          <button type="submit">读取咨询</button>
        </form>

        {status.text && <p className={`form-status ${status.type}`}>{status.text}</p>}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>提交时间</th>
                <th>联系人</th>
                <th>电话</th>
                <th>公司</th>
                <th>客户位置</th>
                <th>需求说明</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan="7" className="admin-empty">暂无数据，或尚未读取。</td></tr>
              ) : items.map((item) => (
                <tr key={item._id}>
                  <td>{formatTime(item.createdAt)}</td>
                  <td>{item.name || "-"}</td>
                  <td>{item.phone || "-"}</td>
                  <td>{item.company || "-"}</td>
                  <td>{item.customerLocation || "-"}</td>
                  <td>{item.message || "-"}</td>
                  <td>{item.status || "new"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}



function ProductPageShell({ children }) {
  return (
    <>
      <Header />
      {children}
      <footer className="footer site-footer product-footer">
        <div className="footer-main">
          <div>
            <strong>{"\u5b81\u6ce2\u5fd7\u51e1\u710a\u6750\u6709\u9650\u516c\u53f8"}</strong>
            <p>{"\u8425\u4e1a\u65f6\u95f4\uff1a\u5468\u4e00\u81f3\u5468\u516d 8:00-16:30\uff0c\u5468\u65e5\u4f11\u606f"}</p>
            <p>{"\u5730\u5740\uff1a\u5b81\u6ce2\u5e02\u911e\u5dde\u533a\u5bcc\u5b81\u8def119\u53f7"}</p>
          </div>
          <nav className="footer-links" aria-label="product footer links">
            <a href="/products">{"\u4ea7\u54c1\u4e2d\u5fc3"}</a>
            <a href="/products/carbon-steel-electrodes">{"\u78b3\u94a2\u710a\u6761"}</a>
            <a href="/knowledge">{"焊接材料问答Q&A"}</a>
            <a href="/team-vision">团队与愿景</a>
            <a href="/#contact">{"\u8054\u7cfb\u6211\u4eec"}</a>
          </nav>
        </div>
      </footer>
    </>
  );
}

function TeamVisionPage() {
  usePageMeta({
    title: "团队与愿景 | 宁波志凡焊材有限公司",
    description: "宁波志凡焊材有限公司团队与愿景页面正在建设中。",
    keywords: "宁波志凡焊材有限公司,团队与愿景,焊材服务团队,焊材供应链服务"
  });
  useIndustrialMotion([]);

  return (
    <ProductPageShell>
      <main className="product-page team-vision-page">
        <section className="team-vision-hero" data-reveal="true">
          <div className="team-vision-copy">
            <span className="breadcrumb">团队与愿景</span>
            <p className="eyebrow">Team & Vision</p>
            <h1>团队与愿景</h1>
            <p className="team-vision-status">施工中</p>
            <div className="product-page-actions">
              <a className="secondary-btn" href="/#home">返回首页</a>
              <a className="primary-btn" href="/#contact">联系业务</a>
            </div>
          </div>
          <figure className="team-vision-visual">
            <OptimizedImage src="/assets/sections/team-vision.png" alt="志凡焊材团队与愿景建设中" sizes="(max-width: 760px) 100vw, 48vw" />
          </figure>
        </section>
      </main>
    </ProductPageShell>
  );
}

function getPaginationPages(totalPages, currentPage, maxVisible = 5) {
  const total = Math.max(1, Number(totalPages) || 1);
  const current = Math.min(Math.max(1, Number(currentPage) || 1), total);
  const visible = Math.max(1, Math.min(maxVisible, total));
  let start = current - Math.floor(visible / 2);
  let end = start + visible - 1;
  if (start < 1) {
    start = 1;
    end = visible;
  }
  if (end > total) {
    end = total;
    start = Math.max(1, end - visible + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function ProductCategoryPage({ categorySlug }) {
  const allManufacturersLabel = "全部";
  const availabilityTabs = [
    { value: "all", label: "全部" },
    { value: "in-stock", label: "仓内现货" },
    { value: "order", label: "可订货" },
  ];
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || "");
  useIndustrialMotion([selectedCategory]);
  const meta = categoryMeta[selectedCategory] || {
    title: "产品中心",
    eyebrow: "Products",
    description: "根据分类与厂家挑选焊材",
  };
  const [manufacturer, setManufacturer] = useState(allManufacturersLabel);
  const [availability, setAvailability] = useState("all");
  const [submittedSearch, setSubmittedSearch] = useState({ active: false, query: "" });
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [searchResetKey, setSearchResetKey] = useState(0);
  usePageMeta(productCategorySeo(meta, selectedCategory, manufacturer));
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    setSelectedCategory(categorySlug || "");
  }, [categorySlug]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, manufacturer, availability, listRefreshKey]);

  function applyAvailabilityFilter(list) {
    if (availability === "in-stock") return list.filter((item) => item.inStock);
    if (availability === "order") return list.filter((item) => !item.inStock);
    return list;
  }

  function resetSubmittedSearch(refresh = false) {
    setSubmittedSearch({ active: false, query: "" });
    if (refresh) setListRefreshKey((value) => value + 1);
  }

  function resetAllProductFilters() {
    setSelectedCategory(categorySlug || "");
    setManufacturer(allManufacturersLabel);
    setAvailability("all");
    setSubmittedSearch({ active: false, query: "" });
    setPage(1);
    setListRefreshKey((value) => value + 1);
    setSearchResetKey((value) => value + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (manufacturer !== allManufacturersLabel) params.set("manufacturer", manufacturer);
    const query = params.toString();
    fetch("/api/products" + (query ? "?" + query : ""), { signal: controller.signal })
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || "read failed");
        setItems(applyAvailabilityFilter(data.items || []));
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setItems([]);
          setStatus("error");
        }
      });
    return () => controller.abort();
  }, [selectedCategory, manufacturer, availability, listRefreshKey]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visiblePageNumbers = getPaginationPages(totalPages, safePage, 5);
  const pagedItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <ProductPageShell>
      <main className="product-page category-page">
        <section className="product-page-hero">
          <div>
            <a className="breadcrumb" href="/#products">{"产品中心"}</a>
            <p className="eyebrow">{meta.eyebrow}</p>
            <h1>{meta.title}</h1>
            <p>{meta.description}</p>
          </div>
          <div className="product-page-actions">
            <a className="secondary-btn" href="/#home">{"返回首页"}</a>
            <a className="primary-btn" href="/#contact">{"联系业务找型号"}</a>
          </div>
          <ProductSearch resetSignal={searchResetKey} onSearchSubmit={({ query, items }) => {
            setSubmittedSearch({ active: true, query });
            setItems(applyAvailabilityFilter(items));
            setStatus("ready");
            setPage(1);
          }} />
        </section>

        <section className="product-browser">
          <div className="product-filter-grid product-filter-grid-single">
            <div className="product-filter-card combined-filter-card">
              <div className="product-procurement-head">
                <span>采购筛选工具</span>
                <p>按大类、厂家、型号或标准号快速缩小范围；重复点击已选筛选项可取消。</p>
              </div>
              <div className="filter-group product-toolbar-search">
                <div className="filter-group-title-row">
                  <h2>{"型号 / 标准搜索"}</h2>
                  <button className="filter-reset-btn" type="button" onClick={resetAllProductFilters}>重置筛选</button>
                </div>
                <div className="product-search-control-row">
                  <ProductSearch
                    resetSignal={searchResetKey}
                    extraParams={{ category: selectedCategory, manufacturer: manufacturer !== allManufacturersLabel ? manufacturer : "" }}
                    onSearchSubmit={({ query, items }) => {
                      setSubmittedSearch({ active: true, query });
                      setItems(applyAvailabilityFilter(items));
                      setStatus("ready");
                      setPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="filter-group product-category-filter">
                <h2>{"产品大类"}</h2>
                <div className="category-tabs" role="tablist" aria-label="product category filter">
                  {products.map((item) => (
                    <button
                      key={item.slug}
                      type="button"
                      className={selectedCategory === item.slug ? "active" : ""}
                      onClick={() => { resetSubmittedSearch(); setSelectedCategory((current) => current === item.slug ? "" : item.slug); }}
                    >
                      <strong>{item.number}</strong>
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-group product-manufacturer-filter">
                <h2>{"厂家筛选"}</h2>
                <div className="manufacturer-tabs" role="tablist" aria-label="manufacturer filter">
                  {manufacturerTabs.map((name) => (
                    <button key={name} type="button" className={manufacturer === name ? "active" : ""} onClick={() => { resetSubmittedSearch(); setManufacturer((current) => current === name ? allManufacturersLabel : name); }}>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-group product-availability-filter">
                <h2>{"现货 / 订货"}</h2>
                <div className="stock-filter-tabs" role="tablist" aria-label="stock availability filter">
                  {availabilityTabs.map((tab) => (
                    <button key={tab.value} type="button" className={availability === tab.value ? "active" : ""} onClick={() => { resetSubmittedSearch(); setAvailability((current) => current === tab.value ? "all" : tab.value); }}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {status === "loading" && <p className="product-state">{"正在读取产品型号..."}</p>}
          {status === "error" && <p className="product-state">{"产品数据暂时读取失败，请稍后刷新。"}</p>}
          {status === "ready" && items.length === 0 && <p className="product-state">{"该筛选条件下型号正在整理中，可取消筛选或联系业务确认。"}</p>}
          {submittedSearch.active && (
            <div className="product-list-meta search-result-meta">
              <span>{"搜索：" + submittedSearch.query}</span>
              <button type="button" onClick={() => resetSubmittedSearch(true)}>清除搜索</button>
            </div>
          )}
          {status === "ready" && items.length > 0 && (
            <div className="product-list-meta">
              <span>{"共 " + items.length + " 个型号"}</span>
              {items.length > pageSize && <span>{"第 " + safePage + " / " + totalPages + " 页，每页 15 个"}</span>}
            </div>
          )}

          <div className="product-list">
            {pagedItems.map((item) => (
              <a className={"product-row" + (item.inStock ? " in-stock-product" : "")} key={item.slug} href={"/products/" + item.slug}>
                {item.inStock && <span className="stock-label product-stock-label">仓内现货产品</span>}
                <span className="model-badge">{item.model}</span>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.summary}</p>
                  <small>{[item.manufacturer, item.categoryName, item.standard].filter(Boolean).join(" / ")}</small>
                </div>
              </a>
            ))}
          </div>

          {status === "ready" && items.length > pageSize && (
            <nav className="pagination" aria-label="产品列表分页">
              <button type="button" onClick={() => setPage(1)} disabled={safePage === 1}>首页</button>
              <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={safePage === 1}>
                上一页
              </button>
              {visiblePageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={safePage === pageNumber ? "active" : ""}
                  onClick={() => setPage(pageNumber)}
                  aria-current={safePage === pageNumber ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              ))}
              <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={safePage === totalPages}>
                下一页
              </button>
              <button type="button" onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>尾页</button>
            </nav>
          )}
        </section>
      </main>
    </ProductPageShell>
  );
}

function getStandardGroup(standard) {
  const value = String(standard || "").trim();
  if (/^(GB|NB\/T|JB|HG|CB)/i.test(value)) return "国标 / 行标";
  if (/^AWS/i.test(value)) return "美标 AWS";
  if (/^(ISO|EN ISO)/i.test(value)) return "国际标 ISO";
  if (/^EN/i.test(value)) return "欧标 EN";
  return "其他标准";
}

function groupStandards(standards = []) {
  const groups = [];
  for (const standard of standards.filter(Boolean)) {
    const label = getStandardGroup(standard);
    let group = groups.find((item) => item.label === label);
    if (!group) {
      group = { label, values: [] };
      groups.push(group);
    }
    group.values.push(standard);
  }
  return groups;
}

function DataTable({ title, rows }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="spec-table-card">
      <h3>{title}</h3>
      <table className="spec-table">
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th>{row.name}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductDetailPage({ slug }) {
  useIndustrialMotion([slug]);
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [siblings, setSiblings] = useState([]);
  const clickTrackedRef = useRef("");

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetch("/api/products/" + encodeURIComponent(slug), { signal: controller.signal })
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || "read failed");
        setProduct(data.item);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!product?.categorySlug) {
      setSiblings([]);
      return undefined;
    }
    const controller = new AbortController();
    fetch("/api/products?category=" + encodeURIComponent(product.categorySlug), { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setSiblings(data.items || []))
      .catch((error) => {
        if (error.name !== "AbortError") setSiblings([]);
      });
    return () => controller.abort();
  }, [product?.categorySlug]);

  useEffect(() => {
    if (!slug || clickTrackedRef.current === slug) return undefined;
    clickTrackedRef.current = slug;
    fetch("/api/products/" + encodeURIComponent(slug) + "/click", { method: "POST" }).catch(() => {});
    return undefined;
  }, [slug]);
  usePageMeta(productDetailSeo(product));

  if (status === "loading") return <ProductPageShell><main className="product-page"><p className="product-state">{"\u6b63\u5728\u8bfb\u53d6\u4ea7\u54c1\u8be6\u60c5..."}</p></main></ProductPageShell>;
  if (status === "error" || !product) return <ProductPageShell><main className="product-page"><p className="product-state">{"\u672a\u627e\u5230\u8be5\u4ea7\u54c1\u578b\u53f7\u3002"}</p><a className="secondary-btn" href="/products/carbon-steel-electrodes">{"\u8fd4\u56de\u4ea7\u54c1\u5217\u8868"}</a></main></ProductPageShell>;

  const siblingIndex = siblings.findIndex((item) => item.slug === product.slug);
  const prevProduct = siblingIndex > 0 ? siblings[siblingIndex - 1] : null;
  const nextProduct = siblingIndex >= 0 && siblingIndex < siblings.length - 1 ? siblings[siblingIndex + 1] : null;
  const certifications = Array.isArray(product.certifications) ? product.certifications.filter(Boolean) : [];

  return (
    <ProductPageShell>
      <main className="product-page detail-page">
        <section className={"product-detail-hero" + (product.inStock ? " in-stock-detail" : "")}>
          {product.inStock && <span className="stock-label detail-stock-label">仓内现货产品</span>}
          <div>
            <a className="breadcrumb" href={"/products/" + product.categorySlug}>{product.categoryName}</a>
            <p className="eyebrow">{product.manufacturer}</p>
            <h1>{product.model}</h1>
            <p>{product.name}</p>
          </div>
          <div className="detail-summary">
            <span>{"\u6267\u884c\u6807\u51c6"}</span>
            {product.standards?.length > 0 ? (
              <div className="standard-groups">{groupStandards(product.standards).map((group) => (
                <div className="standard-group" key={group.label}>
                  <b>{group.label}</b>
                  <ul>{group.values.map((standard) => <li key={standard}>{standard}</li>)}</ul>
                </div>
              ))}</div>
            ) : <strong>{product.standard || "\u6309\u5382\u5bb6\u8d44\u6599"}</strong>}
            <p>{product.summary}</p>
          </div>
        </section>

        <section className="product-detail-grid">
          <article className="detail-card wide">
            <h2>{"\u4ea7\u54c1\u4ecb\u7ecd"}</h2>
            <p>{product.introduction}</p>
          </article>
          <article className="detail-card">
            <h2>{"\u9002\u7528\u573a\u666f"}</h2>
            <ul>{(product.applications || []).map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <DataTable title={"\u5316\u5b66\u6210\u5206\u53c2\u8003"} rows={product.composition} />
          <DataTable title={"\u7194\u6577\u91d1\u5c5e\u529b\u5b66\u6027\u80fd"} rows={product.depositedMetal} />
          <DataTable title={"规格/焊丝粗细"} rows={product.dimensions} />
          {certifications.length > 0 && (
            <article className="detail-card certification-card">
              <h2>{"认证情况"}</h2>
              <p>{certifications.join("、")}</p>
            </article>
          )}
          <article className="detail-card wide note-card">
            <h2>{"\u4f7f\u7528\u63d0\u793a"}</h2>
            <p>{product.notes}</p>
            <div className="detail-actions detail-nav-actions">
              <a className="secondary-btn" href={"/products/" + product.categorySlug}>{"\u8fd4\u56de\u578b\u53f7\u5217\u8868"}</a>
              {prevProduct && <a className="secondary-btn" href={"/products/" + prevProduct.slug}>{"\u4e0a\u4e00\u578b\u53f7"}</a>}
              {nextProduct && <a className="secondary-btn" href={"/products/" + nextProduct.slug}>{"\u4e0b\u4e00\u578b\u53f7"}</a>}
              <a className="primary-btn" href="/#contact">{"\u8054\u7cfb\u4e1a\u52a1\u54a8\u8be2"}</a>
            </div>
          </article>
        </section>
      </main>
    </ProductPageShell>
  );
}

function formatKnowledgeCategoryTitle(title, index) {
  const clean = String(title || "").replace(/^[一二三四五六七八九十]+[、.．]\s*/, "");
  return (index + 1) + ". " + clean;
}



const knowledgePageSize = 12;

function getKnowledgeViews(article) {
  return Number(article?.views ?? article?.viewCount ?? article?.clickCount ?? article?.readCount ?? 0) || 0;
}

function getKnowledgePublishDate(article) {
  return article?.publishedAt || article?.generatedAt || "2026-06-26";
}

function sortKnowledgeArticles(items) {
  return [...items].sort((a, b) => {
    const viewDiff = getKnowledgeViews(b) - getKnowledgeViews(a);
    if (viewDiff) return viewDiff;
    const dateDiff = String(getKnowledgePublishDate(b)).localeCompare(String(getKnowledgePublishDate(a)));
    if (dateDiff) return dateDiff;
    return Number(a.number || 0) - Number(b.number || 0);
  });
}

function KnowledgeIndexPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);
  const categoryTabs = useMemo(() => ([{
    slug: "all",
    title: "全部问答",
    count: knowledgeQaArticles.length
  }, ...knowledgeQaCategories]), []);
  const filteredArticles = useMemo(() => {
    const source = activeCategory === "all"
      ? knowledgeQaArticles
      : knowledgeQaArticles.filter((article) => article.categorySlug === activeCategory);
    return sortKnowledgeArticles(source);
  }, [activeCategory]);
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / knowledgePageSize));
  const pagedArticles = useMemo(() => {
    const start = (page - 1) * knowledgePageSize;
    return filteredArticles.slice(start, start + knowledgePageSize);
  }, [filteredArticles, page]);

  useEffect(() => setPage(1), [activeCategory]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  usePageMeta({
    title: "焊接材料问答Q&A | 宁波志凡焊材有限公司",
    description: "焊材基础知识、常见选型、行业应用、现场缺陷和储存烘干等 80 篇焊接材料问答Q&A，按问题类型分类浏览。",
    keywords: "焊接材料问答Q&A,焊材选型,焊条选型,气保焊丝,药芯焊丝,不锈钢焊材,焊接缺陷,焊材烘干,宁波焊材批发"
  });
  useIndustrialMotion([activeCategory, page]);

  return (
    <ProductPageShell>
      <main className="product-page qa-index-page">
        <section className="qa-index-hero" data-reveal="true">
          <div>
            <a className="breadcrumb" href="/#home">返回首页</a>
            <p className="eyebrow">Welding Q&A</p>
            <h1>焊接材料问答Q&A</h1>
            <p>按问题类型整理 80 篇知识文章，便于业务报价、项目资料沟通和现场焊工快速确认。</p>
            <div className="product-page-actions">
              <a className="secondary-btn" href="/#products">查看产品中心</a>
              <a className="primary-btn" href="/#contact">联系业务找型号</a>
            </div>
          </div>
          <figure className="qa-index-visual">
            <OptimizedImage src="/assets/sections/knowledge-operation.png" alt="焊接材料问答Q&A" sizes="(max-width: 760px) 100vw, 42vw" />
          </figure>
        </section>

        <section className="qa-index-panel detail-card wide" aria-label="焊接材料问答Q&A文章分类">
          <div className="knowledge-category-tabs qa-index-tabs" role="tablist" aria-label="问题类型筛选">
            {categoryTabs.map((category, index) => (
              <button key={category.slug} type="button" className={activeCategory === category.slug ? "active" : ""} onClick={() => setActiveCategory(category.slug)}>
                <span>{category.slug === "all" ? category.title : formatKnowledgeCategoryTitle(category.title, index - 1)}</span>
                <small>{category.count} 篇</small>
              </button>
            ))}
          </div>

          <div className="qa-index-grid">
            {pagedArticles.map((article) => {
              const globalIndex = filteredArticles.findIndex((item) => item.href === article.href);
              const isCommon = globalIndex >= 0 && globalIndex < 3;
              const views = getKnowledgeViews(article);
              return (
                <a className={`knowledge-card qa-knowledge-card qa-index-card ${isCommon ? "is-common" : ""} ${article.featuredTone === "purple" ? "is-designated-purple" : ""}`} href={article.href} key={article.href}>
                  <div className="qa-card-meta">
                    <span>{article.number}</span>
                    {article.featuredLabel && <em className="designated-label">{article.featuredLabel}</em>}
                    {!article.featuredLabel && isCommon && <em>常问</em>}
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                  <div className="qa-card-footer">
                    <small>发布日期：{getKnowledgePublishDate(article)}</small>
                    <small>点击：{views}</small>
                  </div>
                </a>
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav className="pagination qa-pagination" aria-label="焊接材料问答Q&A文章分页">
              <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>上一页</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                <button key={number} type="button" className={page === number ? "active" : ""} onClick={() => setPage(number)}>{number}</button>
              ))}
              <button type="button" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>下一页</button>
            </nav>
          )}
        </section>
      </main>
    </ProductPageShell>
  );
}

const quickMatchGroups = [
  {
    label: "行业",
    title: "按客户工况先定方向",
    text: "船厂、钢结构、压力容器、汽车制造、电力工程和石化项目，先匹配母材、等级、检测和质保要求。",
    chips: ["船厂焊材", "钢结构焊材", "压力容器", "风电塔筒", "石化管道"],
    href: "/articles/qa/qa-51-steel-structure.html"
  },
  {
    label: "工艺",
    title: "按焊接方法缩小范围",
    text: "手工电弧焊、气保焊、氩弧焊和埋弧焊，分别对应焊条、实芯焊丝、药芯焊丝、焊剂组合。",
    chips: ["气保焊丝", "药芯焊丝", "埋弧焊丝焊剂", "氩弧焊填丝"],
    href: "/articles/qa/qa-07-wire-solid-flux-cored.html"
  },
  {
    label: "标准",
    title: "按标准和资料确认采购",
    text: "重点核对 GB、AWS、ISO、NB/T 47018、船级社认证、质保书、批次号和熔敷金属性能。",
    chips: ["GB 标准", "AWS 标准", "NB/T 47018", "船级社认证", "质保书"],
    href: "/articles/qa/qa-10-standard.html"
  }
];

function App() {
  const { videoRef: heroVideoRef, videoSource: heroVideoSource } = useHeroVideoPlayback();
  const currentPath = window.location.pathname;
  const isAdminPage = currentPath === "/admin" || currentPath === "/admin/";
  const isTeamVisionPage = currentPath === "/team-vision" || currentPath === "/team-vision/";
  const isKnowledgePage = currentPath === "/knowledge" || currentPath === "/knowledge/";
  const isProductsIndexPage = currentPath === "/products" || currentPath === "/products/";
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [activeKnowledgeCategory, setActiveKnowledgeCategory] = useState(knowledgeQaCategories[0]?.slug || "all");
  const currentKnowledgeArticles = useMemo(() => {
    if (activeKnowledgeCategory === "all") return knowledgeQaArticles;
    return knowledgeQaArticles.filter((article) => article.categorySlug === activeKnowledgeCategory);
  }, [activeKnowledgeCategory]);
  const visibleArticles = useMemo(() => (knowledgeOpen ? currentKnowledgeArticles : currentKnowledgeArticles.slice(0, 5)), [knowledgeOpen, currentKnowledgeArticles]);

  usePageMeta(isAdminPage || currentPath.startsWith("/products") || isTeamVisionPage || isKnowledgePage ? null : defaultSeo);
  useIndustrialMotion([knowledgeOpen, activeKnowledgeCategory, currentPath]);

  if (isAdminPage) return <AdminDashboard />;
  if (isTeamVisionPage) return <TeamVisionPage />;
  if (isKnowledgePage) return <KnowledgeIndexPage />;
  if (isProductsIndexPage) return <ProductCategoryPage categorySlug="" />;
  if (currentPath.startsWith("/products/")) {
    const productPath = decodeURIComponent(currentPath.replace("/products/", "").replace(/\/$/, ""));
    if (categoryMeta[productPath]) return <ProductCategoryPage categorySlug={productPath} />;
    return <ProductDetailPage slug={productPath} />;
  }

  return (
    <>
      <Header />
      <main>
        <section className="hero hero-video-shell" id="home">
          <video ref={heroVideoRef} className="hero-bg-video" src={heroVideoSource} autoPlay muted loop playsInline preload="auto" poster="/assets/optimized/sections__hero-building-zhifan-1280.webp" webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5" x5-video-player-fullscreen="false" aria-hidden="true" />
          <div className="hero-copy-wrap">
            <p className="eyebrow">{"\u5b81\u6ce2 \u6700\u4e13\u4e1a\u7684\u710a\u6750\u670d\u52a1\u5546"}</p>
            <h1>{"\u4e13\u6ce8\u710a\u6750\u9886\u57df\uff0c\u7cbe\u901a\u884c\u6807\u4e0e\u5de5\u51b5\u3002"}</h1>
            <p className="hero-copy">{"\u8fd128\u5e74\u710a\u63a5\u6750\u6599\u6279\u53d1\u7ecf\u9a8c\uff0c\u5e38\u5907\u710a\u67502600-3200\u5428\uff0c\u670d\u52a1\u6c5f\u6d59\u6caa\u53ca\u5468\u8fb9\u9879\u76ee\u91c7\u8d2d\u3002"}</p>
            <p className="founded-note">Founded in 1998</p>
            <div className="hero-actions"><a className="primary-btn" href="#contact">{"\u7acb\u5373\u54a8\u8be2"}</a><a className="secondary-btn" href="#products">{"\u67e5\u770b\u4ea7\u54c1"}</a></div>
          </div>
          <div className="hero-visual" aria-label="焊材仓储与工业焊接场景"><OptimizedImage src="/assets/hero-welding.png" alt="焊材仓储与工业焊接场景" /></div>
          <dl className="hero-metrics" aria-label="core data"><div><dt><CountNumber value={28} suffix={"\u5e74"} /></dt><dd>{"\u4e13\u4e1a\u6279\u53d1\u7ecf\u9a8c"}</dd></div><div><dt>{"\u7701\u5185\u9886\u5148"}</dt><dd>{"\u4f9b\u8d27\u89c4\u6a21"}</dd></div><div><dt><CountNumber value={96} suffix={"\u5c0f\u65f6"} /></dt><dd>{"\u6d59\u6c5f\u533a\u57df\u6b63\u5e38\u9001\u8fbe"}</dd></div></dl>
        </section>

        <section className="section intro intro-strength-lead soft" aria-label="公司简介">
          <div className="intro-text"><p className="eyebrow">About</p><h2>焊材、设备、配件辅料与五金工具，一站式配齐。</h2></div>
          <p>宁波志凡焊材有限公司位于宁波市鄞州区富宁路119号，代理天津金桥、上海大西洋、上海东风、天泰、常州运河、亚泰、隆兴割炬、上海通用电焊机等品牌。</p>
        </section>

        <section className="section soft strength-section strength-after-intro" id="strength">
          <div className="strength-hero"><div><p className="eyebrow">Capability</p><h2>{"\u8d44\u8d28\u4e0e\u670d\u52a1"}</h2><p>{"\u4e00\u7ea7\u7ecf\u9500\u8d44\u6e90\u3001\u5145\u8db3\u73b0\u8d27\u5e93\u5b58\u548c\u533a\u57df\u7269\u6d41\u80fd\u529b\uff0c\u5171\u540c\u652f\u6491\u7a33\u5b9a\u4ea4\u4ed8\u3002"}</p></div></div>
          <div className="credential-panel"><div><strong>28{"\u5e74"}</strong><span>{"\u710a\u6750\u4e13\u4e1a\u6279\u53d1\u7ecf\u9a8c"}</span></div><div><strong>省内领先</strong><span>浙江省内供货规模</span></div><div><strong>3200吨</strong><span>常备焊材库存上限</span></div><div><strong>一级</strong><span>多品牌全国经销商</span></div></div>
          <div className="service-grid"><article><span>服务</span><h4>全过程技术支持</h4><p>技术工程师与客户经理配合，提供参数说明、现场指导、调试和使用问题处理。</p></article><article><span>响应</span><h4>质量问题快速处理</h4><p>质保期内质量问题立即响应，48小时内派专人到现场，并按要求配合更换。</p></article><article><span>预案</span><h4>紧急保供机制</h4><p>安全库存、备选货品、多元物流和快速响应小组，应对突发订单与运输异常。</p></article></div>
          <div className="stock-gallery" aria-label="stock warehouse video gallery">
            <figure>
              <video className="stock-gallery-video" src="/assets/videos/stock-gallery-shelves.mp4" poster="/assets/sections/warehouse-ai-shelves-3.png" autoPlay muted loop playsInline preload="metadata" aria-label="warehouse shelves and welding consumables stock video" />
            </figure>
            <figure>
              <video className="stock-gallery-video" src="/assets/videos/stock-gallery-loading.mp4" poster="/assets/sections/warehouse-ai-stock-2.png" autoPlay muted loop playsInline preload="metadata" aria-label="welding wire and electrode pallet stock video" />
            </figure>
            <figure>
              <video className="stock-gallery-video" src="/assets/videos/stock-gallery-overview.mp4" poster="/assets/sections/warehouse-ai-overview-1.png" autoPlay muted loop playsInline preload="metadata" aria-label="warehouse stock overview video" />
            </figure>
          </div>
        </section>

        <section className="section brand-strip" aria-label="授权品牌">
          <div className="section-heading compact-heading"><p className="eyebrow">Authorized Brands</p><h2>授权品牌</h2><p>主流焊材、焊机、割炬、衬垫与工具品牌集中配套，支持现货供应、资料配合与项目保供。</p></div>
          <div className="brand-logo-grid featured-brands">
            <article><OptimizedImage src="/assets/brands/shanghai-dongfeng.png" alt="上海东风焊材 logo" /><span>上海东风焊材</span></article>
            <article><OptimizedImage src="/assets/brands/jinqiao.png" alt="天津金桥焊材 logo" /><span>天津金桥焊材</span></article>
            <article><OptimizedImage src="/assets/brands/atlantic.png" alt="上海大西洋焊材 logo" /><span>上海大西洋焊材</span></article>
            <article><OptimizedImage src="/assets/brands/tiantai.png" alt="天泰焊材 logo" /><span>天泰焊材</span></article>
            <article><OptimizedImage src="/assets/brands/shunxin.png" alt="舜鑫焊材 logo" /><span>舜鑫焊材</span></article>
          </div>
          <details className="brand-more">
            <summary>查看更多合作品牌</summary>
            <div className="brand-logo-grid brand-logo-grid-small">
              <article className="mobile-only-brand"><OptimizedImage src="/assets/brands/tiantai.png" alt={"\u5929\u6cf0\u710a\u6750 logo"} /><span>{"\u5929\u6cf0\u710a\u6750"}</span></article>
              <article><OptimizedImage src="/assets/brands/longxing.png" alt="隆兴割炬 logo" /><span>隆兴割炬</span></article>
              <article><OptimizedImage src="/assets/brands/tayor.png" alt="上海通用重工集团 logo" /><span>上海通用电焊机</span></article>
              <article><OptimizedImage src="/assets/brands/great-wall-precision.png" alt="长城精工 logo" /><span>长城精工</span></article>
              <article><OptimizedImage src="/assets/brands/tiemao.png" alt="铁锚焊材 logo" /><span>铁锚焊材</span></article>
              <article><OptimizedImage src="/assets/brands/taichang.png" alt="上海泰昌衬垫 logo" /><span>上海泰昌衬垫</span></article>
              <article><OptimizedImage src="/assets/brands/jetech.png" alt="上海捷科工具 logo" /><span>上海捷科工具</span></article>
            </div>
            <div className="brand-cloud secondary-brands"><span>力易得工具</span><span>田岛工具</span><span>沙龙衬垫</span><span>常州运河焊材</span><span>亚泰焊材</span></div>
          </details>
          <CertificateSlider />
        </section>

        <section className="section" id="products">
          <div className="section-split"><div className="section-heading"><p className="eyebrow">Products</p><h2>{"\u4ea7\u54c1\u4e2d\u5fc3"}</h2><p>{"\u9ad8\u9891\u54c1\u7c7b\u5e38\u5907\u5e93\u5b58\uff0c\u6309\u54c1\u724c\u3001\u89c4\u683c\u548c\u9879\u76ee\u8ba1\u5212\u8fdb\u884c\u4fdd\u4f9b\u3002"}</p><ProductSearch /></div><figure className="section-image"><OptimizedImage src="/assets/sections/products-shelves.png" alt="货架上的焊丝、焊条与焊剂库存" /></figure></div>
          <div className="stock-proof-strip" aria-label="核心供应能力"><article><strong>备货量大</strong><span>常备焊材 2600-3200 吨，高频规格提前锁库。</span></article><article><strong>品类全</strong><span>8 大焊材与设备配件分类，按厂家和型号快速筛选。</span></article><article><strong>响应快</strong><span>宁波 48 小时、浙江 96 小时正常送达。</span></article></div>
          <div className="product-grid">
  {products.map((item) => (
    <a
      className="product-home-card"
      key={item.number}
      href={"/products/" + item.slug}
      style={productCardStyle(item.slug)}
    >
      <span>{item.number}</span>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </a>
  ))}
</div>
        </section>

        <section className="section soft" id="solutions">
          <div className="section-split"><div className="section-heading"><p className="eyebrow">Cases</p><h2>案例及相关业绩</h2><p>深耕浙江市场28年，合作客户逾千家，其中上市企业超8家。服务网络覆盖省内各大知名船厂、钢结构工程公司、汽车主机厂及零部件企业、压力容器制造单位，并深度参与多项桥梁工程及基础设施建设项目，以稳定品质和高效保供赢得客户长期信赖。</p></div><figure className="section-image"><OptimizedImage src="/assets/sections/cases-handover.png" alt="仓库客户提货与交付沟通场景" /></figure></div>
          <div className="case-list compact-list"><article><h3>工程项目保供</h3><p>提前锁定常用规格，专门小组跟进库存、发货、资料和异常响应。</p></article><article><h3>区域快速配送</h3><p>宁波地区正常48小时内，浙江全区域正常96小时内送达。</p></article><article><h3>跨省发运</h3><p>覆盖江浙沪及周边省区，可按需发往指定地点或偏远省区。</p></article></div>
          <div className="case-data-grid">{caseCards.map(([tag, title, text]) => <article key={title}><span>{tag}</span><h4>{title}</h4><p>{text}</p></article>)}</div>
          <div className="delivery-scene-grid" aria-label="焊材配送场景素材"><article className="delivery-card steel"><span>钢结构工厂</span><strong>整托焊丝、焊条到厂交付</strong></article><article className="delivery-card shipyard"><span>船厂项目</span><strong>按批次保障船体与分段焊接</strong></article><article className="delivery-card auto"><span>汽车制造</span><strong>产线耗材稳定补给</strong></article><article className="delivery-card machinery"><span>机械制造</span><strong>设备构件焊材快速响应</strong></article></div>
        </section>


        <section className="section knowledge-hub" id="knowledge">
          <div className="knowledge-hub-hero">
            <div className="section-heading">
              <p className="eyebrow">Selection Guide</p>
              <h2>按行业、工艺和标准快速匹配焊材</h2>
              <p>把采购沟通先压缩成三步：客户行业判断工况，焊接工艺确定产品类型，执行标准确认质保资料。下方 80 篇问答围绕焊材基础、常见选型、行业应用、现场缺陷和储存烘干整理，按采购和现场沟通频率分类浏览。</p>
            </div>
            <figure className="section-image knowledge-hub-image">
              <OptimizedImage src="/assets/sections/knowledge-operation.png" alt="焊接材料问答Q&A" sizes="(max-width: 760px) 100vw, 38vw" />
            </figure>
          </div>
          <div className="quick-match-grid" aria-label="焊材快速匹配入口">
            {quickMatchGroups.map((group) => (
              <a className="quick-match-card" href={group.href} key={group.label}>
                <span>{group.label}</span>
                <h3>{group.title}</h3>
                <p>{group.text}</p>
                <div>{group.chips.map((chip) => <em key={chip}>{chip}</em>)}</div>
              </a>
            ))}
          </div>
          <div className="knowledge-library-panel">
            <div className="knowledge-library-copy">
              <p className="eyebrow">80 Q&A</p>
              <h3>焊接材料问答Q&A</h3>
              <p>优先展示当前分类前 5 篇，剩余内容半隐藏，需要时展开。适合业务报价、项目资料沟通和现场焊工快速确认。</p>
            </div>
            <div className="knowledge-category-tabs" role="tablist" aria-label="welding knowledge categories">
              {knowledgeQaCategories.map((category, index) => (
                <button key={category.slug} type="button" className={activeKnowledgeCategory === category.slug ? "active" : ""} onClick={() => { setActiveKnowledgeCategory(category.slug); setKnowledgeOpen(false); }}>
                  <span>{formatKnowledgeCategoryTitle(category.title, index)}</span><small>{category.count}{" 篇"}</small>
                </button>
              ))}
            </div>
            <div className={`knowledge-list qa-knowledge-list ${knowledgeOpen ? "" : "collapsed"}`} id="knowledgeList">
              {visibleArticles.map((article) => <a className={`knowledge-card qa-knowledge-card ${article.featuredTone === "purple" ? "is-designated-purple" : ""}`} key={article.href} href={article.href}><span>{article.number}</span>{article.featuredLabel && <em className="designated-label">{article.featuredLabel}</em>}<h3>{article.title}</h3><p>{article.summary}</p><strong>阅读全文</strong></a>)}
            </div>
            {currentKnowledgeArticles.length > 5 && <div className="knowledge-more"><button type="button" aria-expanded={knowledgeOpen} aria-controls="knowledgeList" onClick={() => setKnowledgeOpen((value) => !value)}>{knowledgeOpen ? "收起文章" : "查看更多 " + (currentKnowledgeArticles.length - 5) + " 篇"}</button></div>}
          </div>
        </section>

        <section className="section seo-entry-section soft" aria-label="行业地域与标准快速入口">
          <div className="section-heading compact-heading">
            <p className="eyebrow">Fast Match</p>
            <h2>按行业、地区和标准快速沟通焊材需求</h2>
            <p>面向宁波、舟山、浙江、绍兴、新昌及江浙沪项目客户，先用行业场景和执行标准确认方向，再由业务协助核对厂家、型号、库存和质保资料。</p>
          </div>
          <div className="seo-keyword-grid geo-entry-grid">
            <article><span>行业</span><h3>船厂 / 钢结构 / 压力容器</h3><p>覆盖船用焊材、钢结构焊材、压力容器焊材、机械制造和石化项目常用选型。</p><a href="/knowledge">查看选型问答</a></article>
            <article><span>地区</span><h3>宁波、舟山、浙江、绍兴、新昌</h3><p>围绕江浙沪客户的现货、资料、配送和项目跟单需求，支持区域快速响应。</p><a href="#contact">提交采购位置</a></article>
            <article><span>标准</span><h3>GB / AWS / ISO / NB/T 47018</h3><p>按执行标准、熔敷金属、化学成分、认证和质保书要求核对产品资料。</p><a href="/products">按标准查型号</a></article>
            <article><span>常用型号</span><h3>J422、J507、ER50-6、E71T-1</h3><p>高频型号可从产品中心直接搜索，现货标签用于优先识别仓内可供应产品。</p><a href="/products">进入产品中心</a></article>
          </div>
        </section>
        <section className="section contact" id="contact">
          <div><p className="eyebrow">Contact</p><h2>联系我们</h2><p>提供品牌、型号、数量、收货地址和到货时间，我们将安排专门负责小组对接库存、报价和配送。</p><figure className="contact-image"><OptimizedImage src="/assets/sections/contact.png" alt="焊材采购咨询与配送安排" /></figure><div className="contact-info"><a href="tel:057489007658" aria-label="拨打公司座机 0574-89007658">公司电话：0574-89007658</a><span>地址：宁波市鄞州区富宁路119号</span><span>配送：宁波地区正常48小时内，浙江全区域正常96小时内</span><span>营业时间：周一至周六 8:00-16:30，周日休息</span></div></div>
          <div className="amap-card map-card"><div><strong>现场志凡焊材（新仓库）</strong><span>{"\u5730\u56fe\u5b9a\u4f4d\uff1a\u5b81\u6ce2\u5e02\u911e\u5dde\u533a\u5bcc\u5b81\u8def119\u53f7"}</span></div><div className="map-actions"><a href="https://j.map.baidu.com/9e/TTsM" target="_blank" rel="noreferrer">打开百度地图</a><a href="https://uri.amap.com/search?keyword=%E5%AE%81%E6%B3%A2%E5%BF%97%E5%87%A1%E7%84%8A%E6%9D%90%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8%20%E5%AF%8C%E5%AE%81%E8%B7%AF119%E5%8F%B7&city=%E5%AE%81%E6%B3%A2&src=zhifan-site&callnative=1" target="_blank" rel="noreferrer">打开高德地图</a></div></div>
          <ContactForm />
        </section>
      </main>
      <footer className="footer site-footer">
        <div className="footer-main">
          <div>
            <strong>宁波志凡焊材有限公司</strong>
            <p>营业时间：周一至周六 8:00-16:30，周日休息</p>
            <p>地址：宁波市鄞州区富宁路119号</p>
          </div>
          <nav className="footer-links" aria-label="底部主要链接">
            <a href="#home">首页</a>
            <a href="#strength">资质与服务</a>
            <a href="#products">产品中心</a>
            <a href="#solutions">案例及相关业绩</a>
            <a href="/knowledge">焊接材料问答Q&A</a>
            <a href="/team-vision">团队与愿景</a>
            <a href="#contact">联系我们</a>
            <a href="/admin">后台</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© 2026 宁波志凡焊材有限公司</p>
          <a href="#top">返回顶部</a>
        </div>
      </footer>
    </>
  );
}

export default App;
