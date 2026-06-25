import { useEffect, useMemo, useState } from "react";
import ProductSearch from "./components/ProductSearch.jsx";
import OptimizedImage from "./components/OptimizedImage.jsx";
import { products, manufacturerTabs, categoryMeta } from "./data/productCatalog.js";
import { knowledgeQaArticles, knowledgeQaCategories } from "./data/knowledgeQa.js";

const navItems = [
  ["/#products", "产品中心"],
  ["/#solutions", "案例及相关业绩"],
  ["/#knowledge", "焊接操作"],
  ["/#strength", "资质与服务"],
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

function productCategorySeo(meta) {
  const title = meta.title || "产品中心";
  return {
    title: `${title} | 产品中心 | 宁波志凡焊材有限公司`,
    description: `${title}现货产品清单，支持按厂家筛选金桥、大西洋、上海东风、天泰及其他品牌型号，适配船厂、钢结构、压力容器、机械厂、电力工程和石化项目焊材采购。`,
    keywords: [title, meta.eyebrow, "宁波焊材批发", "浙江焊材供应商", "焊材现货供应", "焊材质量证明书", "焊材急件配送", "金桥焊材", "大西洋焊材", "上海东风焊材", "天泰焊材"].filter(Boolean).join(",")
  };
}

function productDetailSeo(product) {
  if (!product) return {
    title: "产品详情 | 宁波志凡焊材有限公司",
    description: "查看焊材型号、执行标准、化学成分、熔敷金属力学性能与规格信息。",
    keywords: "焊材型号,执行标准,化学成分,熔敷金属,宁波焊材批发"
  };
  const title = `${product.manufacturer || ""} ${product.model || product.name} | ${product.categoryName || "焊材"}`;
  const description = `${product.manufacturer || "品牌"}${product.model || ""}${product.name ? " " + product.name : ""}产品详情，包含执行标准、适用场景、化学成分、熔敷金属力学性能与规格信息，支持宁波、浙江及江浙沪项目现货保供。`;
  const keywords = [product.model, product.name, product.manufacturer, product.categoryName, product.standard, ...(product.standards || []), "焊材现货供应", "焊材质量证明书", "熔敷金属化学成分", "焊材力学性能", "宁波焊材批发"].filter(Boolean).join(",");
  return { title: `${title} | 宁波志凡焊材有限公司`, description, keywords };
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
      ".certificate-slider"
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
    }, { rootMargin: "0px 0px -10%", threshold: 0.12 });

    revealTargets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
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
            <OptimizedImage src={item.image} alt={item.title} loading={index === 0 ? "eager" : "lazy"} />
          </figure>
        ))}
      </div>
      <div className="certificate-dots" role="tablist" aria-label="certificate selector">
        {certificates.map((item, index) => (
          <button key={item.image} type="button" className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={"view " + item.title} aria-selected={index === active} />
        ))}
      </div>
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
            <a href="/#products">{"\u4ea7\u54c1\u4e2d\u5fc3"}</a>
            <a href="/products/carbon-steel-electrodes">{"\u78b3\u94a2\u710a\u6761"}</a>
            <a href="/#knowledge">{"\u710a\u63a5\u64cd\u4f5c"}</a>
            <a href="/#contact">{"\u8054\u7cfb\u6211\u4eec"}</a>
          </nav>
        </div>
      </footer>
    </>
  );
}

function ProductCategoryPage({ categorySlug }) {
  useIndustrialMotion([categorySlug]);
  const meta = categoryMeta[categorySlug] || { title: "\u4ea7\u54c1\u4e2d\u5fc3", eyebrow: "Products", description: "\u6309\u5382\u5bb6\u548c\u578b\u53f7\u67e5\u770b\u4ea7\u54c1\u89c4\u683c\u3002" };
  usePageMeta(productCategorySeo(meta));
  const [manufacturer, setManufacturer] = useState("\u5168\u90e8");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    setPage(1);
  }, [categorySlug, manufacturer]);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    const manufacturerQuery = manufacturer === "\u5168\u90e8" ? "" : "&manufacturer=" + encodeURIComponent(manufacturer);
    fetch("/api/products?category=" + encodeURIComponent(categorySlug) + manufacturerQuery, { signal: controller.signal })
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || "read failed");
        setItems(data.items || []);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setItems([]);
          setStatus("error");
        }
      });
    return () => controller.abort();
  }, [categorySlug, manufacturer]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <ProductPageShell>
      <main className="product-page category-page">
        <section className="product-page-hero">
          <div>
            <a className="breadcrumb" href="/#products">{"\u4ea7\u54c1\u4e2d\u5fc3"}</a>
            <p className="eyebrow">{meta.eyebrow}</p>
            <h1>{meta.title}</h1>
            <p>{meta.description}</p>
          </div>
          <ProductSearch />
        </section>

        <section className="product-browser">
          <div className="manufacturer-tabs" role="tablist" aria-label="manufacturer filter">
            {manufacturerTabs.map((name) => (
              <button key={name} type="button" className={manufacturer === name ? "active" : ""} onClick={() => setManufacturer(name)}>{name}</button>
            ))}
          </div>

          {status === "loading" && <p className="product-state">{"\u6b63\u5728\u8bfb\u53d6\u4ea7\u54c1\u578b\u53f7..."}</p>}
          {status === "error" && <p className="product-state">{"\u4ea7\u54c1\u6570\u636e\u6682\u65f6\u8bfb\u53d6\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u5237\u65b0\u3002"}</p>}
          {status === "ready" && items.length === 0 && <p className="product-state">{"\u8be5\u5382\u5bb6\u578b\u53f7\u6b63\u5728\u6574\u7406\u4e2d\uff0c\u5df2\u9884\u7559\u5206\u7c7b\u5165\u53e3\u3002"}</p>}
          {status === "ready" && items.length > 0 && (
            <div className="product-list-meta">
              <span>{"\u5171 " + items.length + " \u4e2a\u578b\u53f7"}</span>
              {items.length > pageSize && <span>{"\u7b2c " + safePage + " / " + totalPages + " \u9875\uff0c\u6bcf\u9875 15 \u4e2a"}</span>}
            </div>
          )}

          <div className="product-list">
            {pagedItems.map((item) => (
              <a className="product-row" key={item.slug} href={"/products/" + item.slug}>
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
              <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={safePage === 1}>上一页</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
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
              <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={safePage === totalPages}>下一页</button>
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

  usePageMeta(productDetailSeo(product));

  if (status === "loading") return <ProductPageShell><main className="product-page"><p className="product-state">{"\u6b63\u5728\u8bfb\u53d6\u4ea7\u54c1\u8be6\u60c5..."}</p></main></ProductPageShell>;
  if (status === "error" || !product) return <ProductPageShell><main className="product-page"><p className="product-state">{"\u672a\u627e\u5230\u8be5\u4ea7\u54c1\u578b\u53f7\u3002"}</p><a className="secondary-btn" href="/products/carbon-steel-electrodes">{"\u8fd4\u56de\u4ea7\u54c1\u5217\u8868"}</a></main></ProductPageShell>;

  return (
    <ProductPageShell>
      <main className="product-page detail-page">
        <section className="product-detail-hero">
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
          <article className="detail-card wide note-card">
            <h2>{"\u4f7f\u7528\u63d0\u793a"}</h2>
            <p>{product.notes}</p>
            <div className="detail-actions">
              <a className="primary-btn" href="/#contact">{"\u54a8\u8be2\u5e93\u5b58\u4e0e\u62a5\u4ef7"}</a>
              <a className="secondary-btn" href={"/products/" + product.categorySlug}>{"\u8fd4\u56de\u578b\u53f7\u5217\u8868"}</a>
            </div>
          </article>
        </section>
      </main>
    </ProductPageShell>
  );
}

function App() {
  const currentPath = window.location.pathname;
  const isAdminPage = currentPath === "/admin" || currentPath === "/admin/";
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [activeKnowledgeCategory, setActiveKnowledgeCategory] = useState(knowledgeQaCategories[0]?.slug || "all");
  const currentKnowledgeArticles = useMemo(() => {
    if (activeKnowledgeCategory === "all") return knowledgeQaArticles;
    return knowledgeQaArticles.filter((article) => article.categorySlug === activeKnowledgeCategory);
  }, [activeKnowledgeCategory]);
  const visibleArticles = useMemo(() => (knowledgeOpen ? currentKnowledgeArticles : currentKnowledgeArticles.slice(0, 5)), [knowledgeOpen, currentKnowledgeArticles]);

  usePageMeta(isAdminPage || currentPath.startsWith("/products/") ? null : defaultSeo);
  useIndustrialMotion([knowledgeOpen, activeKnowledgeCategory, currentPath]);

  if (isAdminPage) return <AdminDashboard />;
  if (currentPath.startsWith("/products/")) {
    const productPath = decodeURIComponent(currentPath.replace("/products/", "").replace(/\/$/, ""));
    if (categoryMeta[productPath]) return <ProductCategoryPage categorySlug={productPath} />;
    return <ProductDetailPage slug={productPath} />;
  }

  return (
    <>
      <Header />
      <main>
        <section className="hero" id="home">
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

        <section className="section intro" aria-label="公司简介">
          <div className="intro-text"><p className="eyebrow">About</p><h2>焊材、设备、配件辅料与五金工具，一站式配齐。</h2></div>
          <p>宁波志凡焊材有限公司位于宁波市鄞州区富宁路119号，代理天津金桥、上海大西洋、上海东风、天泰、常州运河、亚泰、隆兴割炬、上海通用电焊机等品牌。</p>
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
          <div className="stock-proof-strip" aria-label="核心供应能力"><article><strong>备货量大</strong><span>常备焊材 2600-3200 吨，高频规格提前锁库。</span></article><article><strong>品类全</strong><span>7 大焊材与设备配件分类，按厂家和型号快速筛选。</span></article><article><strong>响应快</strong><span>宁波 48 小时、浙江 96 小时正常送达。</span></article></div>
          <div className="product-grid">{products.map((item) => <a className="product-home-card" key={item.number} href={"/products/" + item.slug}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></a>)}</div>
        </section>

        <section className="section soft" id="solutions">
          <div className="section-split"><div className="section-heading"><p className="eyebrow">Cases</p><h2>案例及相关业绩</h2><p>客户名称和精确吨位已脱敏，仅保留行业、供应规模和服务方式。</p></div><figure className="section-image"><OptimizedImage src="/assets/sections/cases-handover.png" alt="仓库客户提货与交付沟通场景" /></figure></div>
          <div className="case-list compact-list"><article><h3>工程项目保供</h3><p>提前锁定常用规格，专门小组跟进库存、发货、资料和异常响应。</p></article><article><h3>区域快速配送</h3><p>宁波地区正常48小时内，浙江全区域正常96小时内送达。</p></article><article><h3>跨省发运</h3><p>覆盖江浙沪及周边省区，可按需发往指定地点或偏远省区。</p></article></div>
          <div className="case-data-grid">{caseCards.map(([tag, title, text]) => <article key={title}><span>{tag}</span><h4>{title}</h4><p>{text}</p></article>)}</div>
          <div className="delivery-scene-grid" aria-label="焊材配送场景素材"><article className="delivery-card steel"><span>钢结构工厂</span><strong>整托焊丝、焊条到厂交付</strong></article><article className="delivery-card shipyard"><span>船厂项目</span><strong>按批次保障船体与分段焊接</strong></article><article className="delivery-card auto"><span>汽车制造</span><strong>产线耗材稳定补给</strong></article><article className="delivery-card machinery"><span>机械制造</span><strong>设备构件焊材快速响应</strong></article></div>
        </section>


        <section className="section seo-keywords" aria-label="焊材应用与采购关键词覆盖">
          <div className="section-heading"><p className="eyebrow">Application Keywords</p><h2>按行业、工艺和标准快速匹配焊材</h2><p>面向船厂、钢结构、压力容器、汽车制造、电建火电风电水电核电、石化项目等客户，围绕焊材采购、焊材批发、焊材供应商、焊材现货供应和技术选型支持建立一站式入口。</p></div>
          <div className="seo-keyword-grid">
            <article><h3>行业场景</h3><p>船用焊材、船厂专用焊丝、船级社认证焊材、钢结构焊接材料、压力容器焊材、锅炉焊条、汽车焊接材料、风电塔筒焊丝、核电焊材、石化管道焊条。</p></article>
            <article><h3>产品与工艺</h3><p>碳钢焊条、低合金钢焊条、实芯焊丝、药芯焊丝、埋弧焊丝焊剂、氩弧焊填充焊丝、手工电弧焊焊条、自动焊焊接材料、复合板焊接材料。</p></article>
            <article><h3>材质体系</h3><p>铬钼耐热钢焊条、奥氏体不锈钢焊丝、双相不锈钢焊条、镍基合金焊丝、低温镍钢焊条、耐候钢焊材、耐磨堆焊合金焊条、铝镁合金焊丝。</p></article>
            <article><h3>标准与质保</h3><p>CCS、ABS、DNV、LR、BV、NK船级社认证焊材，NB/T 47018标准焊材、AWS标准焊条、焊材质量证明书、焊材质保书、熔敷金属化学成分与冲击韧性报告。</p></article>
            <article><h3>常用型号</h3><p>J422、J506、J507、ER50-6、ER50-G、E71T-1、E308-16、E309-16、E316-16、ER316L、H08MnA、H10Mn2、SJ101、HJ431、R307、A102、A132。</p></article>
            <article><h3>工程采购</h3><p>海上平台焊接材料、桥梁钢结构焊材、LNG储罐焊材、高压管道焊条、锅炉受热面焊材、风电基础焊接材料、换热器焊接材料、宁波焊材配送上门。</p></article>
          </div>
        </section>

        <section className="section" id="knowledge">
          <div className="section-split"><div className="section-heading"><p className="eyebrow">Knowledge</p><h2>{"\u710a\u63a5\u64cd\u4f5c"}</h2><p>{"\u56f4\u7ed5\u710a\u6750\u57fa\u7840\u3001\u5e38\u89c1\u9009\u578b\u3001\u884c\u4e1a\u5e94\u7528\u3001\u73b0\u573a\u7f3a\u9677\u548c\u50a8\u5b58\u70d8\u5e72\u6574\u7406 80 \u7bc7\u95ee\u7b54\uff0c\u6309\u91c7\u8d2d\u548c\u73b0\u573a\u6c9f\u901a\u9891\u7387\u5206\u7c7b\u6d4f\u89c8\u3002"}</p></div><figure className="section-image"><OptimizedImage src="/assets/sections/knowledge-operation.png" alt={"\u710a\u6750\u9009\u578b\u4e0e\u710a\u63a5\u64cd\u4f5c\u51c6\u5907"} sizes="(max-width: 760px) 100vw, 46vw" /></figure></div>
          <div className="knowledge-category-tabs" role="tablist" aria-label="welding knowledge categories">
            {knowledgeQaCategories.map((category) => (
              <button key={category.slug} type="button" className={activeKnowledgeCategory === category.slug ? "active" : ""} onClick={() => { setActiveKnowledgeCategory(category.slug); setKnowledgeOpen(false); }}>
                <span>{category.title.replace(/^\S+?/, "")}</span><small>{category.count}{" \u7bc7"}</small>
              </button>
            ))}
          </div>
          <div className={`knowledge-list qa-knowledge-list ${knowledgeOpen ? "" : "collapsed"}`} id="knowledgeList">
            {visibleArticles.map((article) => <a className="knowledge-card qa-knowledge-card" key={article.href} href={article.href}><span>{article.number}</span><h3>{article.title}</h3><p>{article.summary}</p><strong>{"\u9605\u8bfb\u5168\u6587"}</strong></a>)}
          </div>
          {currentKnowledgeArticles.length > 5 && <div className="knowledge-more"><button type="button" aria-expanded={knowledgeOpen} aria-controls="knowledgeList" onClick={() => setKnowledgeOpen((value) => !value)}>{knowledgeOpen ? "\u6536\u8d77\u6587\u7ae0" : "\u67e5\u770b\u66f4\u591a " + (currentKnowledgeArticles.length - 5) + " \u7bc7"}</button></div>}
        </section>

        <section className="section soft strength-section" id="strength">
          <div className="strength-hero"><div><p className="eyebrow">Capability</p><h2>{"\u8d44\u8d28\u4e0e\u670d\u52a1"}</h2><p>{"\u4e00\u7ea7\u7ecf\u9500\u8d44\u6e90\u3001\u5145\u8db3\u73b0\u8d27\u5e93\u5b58\u548c\u533a\u57df\u7269\u6d41\u80fd\u529b\uff0c\u5171\u540c\u652f\u6491\u7a33\u5b9a\u4ea4\u4ed8\u3002"}</p></div></div>
          <div className="credential-panel"><div><strong>28{"\u5e74"}</strong><span>{"\u710a\u6750\u4e13\u4e1a\u6279\u53d1\u7ecf\u9a8c"}</span></div><div><strong>省内领先</strong><span>浙江省内供货规模</span></div><div><strong>3200吨</strong><span>常备焊材库存上限</span></div><div><strong>一级</strong><span>多品牌全国经销商</span></div></div>
          <div className="service-grid"><article><span>服务</span><h4>全过程技术支持</h4><p>技术工程师与客户经理配合，提供参数说明、现场指导、调试和使用问题处理。</p></article><article><span>响应</span><h4>质量问题快速处理</h4><p>质保期内质量问题立即响应，48小时内派专人到现场，并按要求配合更换。</p></article><article><span>预案</span><h4>紧急保供机制</h4><p>安全库存、备选货品、多元物流和快速响应小组，应对突发订单与运输异常。</p></article></div>
          <div className="stock-gallery" aria-label="仓储实景素材"><figure><OptimizedImage src="/assets/sections/warehouse-ai-shelves-3.png" alt="仓库货架实景" /></figure><figure><OptimizedImage src="/assets/sections/warehouse-ai-stock-2.png" alt="焊丝焊条托盘库存实景" /></figure><figure><OptimizedImage src="/assets/sections/warehouse-ai-overview-1.png" alt="仓库整体库存实景" /></figure></div>
        </section>

        <section className="section contact" id="contact">
          <div><p className="eyebrow">Contact</p><h2>联系我们</h2><p>提供品牌、型号、数量、收货地址和到货时间，我们将安排专门负责小组对接库存、报价和配送。</p><figure className="contact-image"><OptimizedImage src="/assets/sections/contact.png" alt="焊材采购咨询与配送安排" /></figure><div className="contact-info"><a href="tel:0574-89007658">公司电话：0574-89007658</a><a href="tel:13805890268">手机联系：13805890268</a><span>地址：宁波市鄞州区富宁路119号</span><span>配送：宁波地区正常48小时内，浙江全区域正常96小时内</span><span>营业时间：周一至周六 8:00-16:30，周日休息</span></div></div>
          <div className="amap-card"><div><strong>现场志凡焊材（新仓库）</strong><span>高德地图定位：宁波市鄞州区富宁路119号</span></div><a href="https://uri.amap.com/marker?position=121.6359,29.8325&name=%E5%BF%97%E5%87%A1%E7%84%8A%E6%9D%90%EF%BC%88%E6%96%B0%E4%BB%93%E5%BA%93%EF%BC%89&src=zhifan-site&callnative=1" target="_blank" rel="noreferrer">打开高德地图</a></div>
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
            <a href="#products">产品中心</a>
            <a href="#solutions">案例及相关业绩</a>
            <a href="#knowledge">焊接操作</a>
            <a href="#strength">资质与服务</a>
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
