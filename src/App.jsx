import { useEffect, useMemo, useState } from "react";

const navItems = [
  ["/#products", "产品中心"],
  ["/#solutions", "案例及相关业绩"],
  ["/#knowledge", "焊接操作"],
  ["/#strength", "资质与服务"],
  ["/#contact", "联系我们"]
];

const products = [
  ["01", "实芯气保焊丝", "约1500吨常备，适用于钢结构、装备制造和连续焊接产线。"],
  ["02", "药芯气保焊丝", "约800吨常备，兼顾效率、成形质量和现场适应性。"],
  ["03", "埋弧焊丝焊剂", "约600吨常备，服务厚板、筒体、管道和大型构件。"],
  ["04", "不锈钢焊材", "约250吨常备，覆盖常见不锈钢焊接与耐腐蚀工况。"],
  ["05", "铝焊丝与特种焊材", "铝焊丝约30吨常备，并配套耐磨、耐热、异种钢材料。"],
  ["06", "设备配件与工具", "电焊机、割炬、辅料、配件及常用五金手动工具。"]
];

const caseCards = [
  ["船舶制造", "舟山区域大型船舶制造客户", "年度供货规模：千吨级。配套实芯焊丝、药芯焊丝、埋弧焊丝焊剂及结构钢焊条。"],
  ["船舶修造", "宁波及周边船舶客户群", "年度供货规模：500吨以上。按生产计划进行多品牌焊材组合与分批配送。"],
  ["机械制造", "浙江装备制造客户", "年度供货规模：数百吨级。以碳钢实芯焊丝、低合金焊材和配套辅材为主。"],
  ["钢材贸易", "区域工程配套客户", "年度供货规模：200吨以上。提供常用焊条、实芯焊丝和品牌替代建议。"]
];

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

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header" id="top">
      <nav className="nav" aria-label="主导航">
        <a className="brand" href="/#home" aria-label="宁波志凡焊材有限公司首页" onClick={() => setOpen(false)}>
          <img className="brand-logo" src="/assets/site/zhifan-logo.png" alt="志凡焊材 logo" />
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
  const [form, setForm] = useState({ name: "", phone: "", company: "", message: "" });
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
      setForm({ name: "", phone: "", company: "", message: "" });
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
                <th>需求说明</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan="6" className="admin-empty">暂无数据，或尚未读取。</td></tr>
              ) : items.map((item) => (
                <tr key={item._id}>
                  <td>{formatTime(item.createdAt)}</td>
                  <td>{item.name || "-"}</td>
                  <td>{item.phone || "-"}</td>
                  <td>{item.company || "-"}</td>
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


const manufacturerTabs = ["\u91d1\u6865", "\u5927\u897f\u6d0b", "\u4e1c\u98ce", "\u5929\u6cf0", "\u5176\u4ed6"];
const categoryMeta = {
  "solid-wires": {
    title: "\u5b9e\u82af\u6c14\u4fdd\u710a\u4e1d",
    eyebrow: "Product Catalog",
    description: "\u9002\u7528\u4e8e\u94a2\u7ed3\u6784\u3001\u88c5\u5907\u5236\u9020\u548c\u81ea\u52a8\u5316\u710a\u63a5\u4ea7\u7ebf\uff0c\u540e\u7eed\u53ef\u6309\u5382\u5bb6\u5bfc\u5165 ER50-6 \u7b49\u5e38\u7528\u578b\u53f7\u3002"
  },
  "flux-cored-wires": {
    title: "\u836f\u82af\u6c14\u4fdd\u710a\u4e1d",
    eyebrow: "Product Catalog",
    description: "\u517c\u987e\u6548\u7387\u3001\u6210\u5f62\u548c\u73b0\u573a\u9002\u5e94\u6027\uff0c\u9002\u5408\u4e2d\u539a\u677f\u3001\u8239\u8236\u548c\u5de5\u7a0b\u6784\u4ef6\u7b49\u573a\u666f\u3002"
  },
  "submerged-arc": {
    title: "\u57cb\u5f27\u710a\u4e1d\u710a\u5242",
    eyebrow: "Product Catalog",
    description: "\u56f4\u7ed5\u539a\u677f\u957f\u710a\u7f1d\u548c\u5927\u578b\u6784\u4ef6\uff0c\u6309\u710a\u4e1d\u3001\u710a\u5242\u6210\u5957\u65b9\u5f0f\u7ba1\u7406\u578b\u53f7\u3002"
  },
  "stainless-materials": {
    title: "\u4e0d\u9508\u94a2\u710a\u6750",
    eyebrow: "Product Catalog",
    description: "\u9762\u5411 304\u3001316L\u3001\u53cc\u76f8\u94a2\u548c\u5f02\u79cd\u94a2\u7b49\u710a\u63a5\u573a\u666f\uff0c\u6309\u5382\u5bb6\u9884\u7559\u578b\u53f7\u6e05\u5355\u3002"
  },
  "special-materials": {
    title: "\u94dd\u710a\u4e1d\u4e0e\u7279\u79cd\u710a\u6750",
    eyebrow: "Product Catalog",
    description: "\u7528\u4e8e\u94dd\u5408\u91d1\u3001\u8010\u78e8\u3001\u8010\u70ed\u548c\u5f02\u79cd\u94a2\u7b49\u7279\u6b8a\u710a\u63a5\u5de5\u51b5\u3002"
  },
  "equipment-accessories": {
    title: "\u8bbe\u5907\u914d\u4ef6\u4e0e\u5de5\u5177",
    eyebrow: "Product Catalog",
    description: "\u5305\u542b\u710a\u673a\u3001\u5272\u70ac\u3001\u914d\u4ef6\u3001\u8f85\u6599\u548c\u4e94\u91d1\u5de5\u5177\uff0c\u4fbf\u4e8e\u4e0e\u710a\u6750\u4e00\u5e76\u914d\u9001\u3002"
  },
  "carbon-steel-electrodes": {
    title: "\u78b3\u94a2\u710a\u6761",
    eyebrow: "Jinqiao Catalog",
    description: "\u9002\u7528\u4e8e\u4f4e\u78b3\u94a2\u548c 490MPa \u7ea7\u7ed3\u6784\u710a\u63a5\uff0c\u8986\u76d6\u901a\u7528\u7ed3\u6784\u3001\u4e2d\u539a\u677f\u3001\u73b0\u573a\u7ef4\u4fee\u4e0e\u91cd\u8981\u627f\u8f7d\u6784\u4ef6\u3002"
  }
};

function ProductSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const keyword = query.trim();
    if (!keyword) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/products?search=" + encodeURIComponent(keyword), { signal: controller.signal });
        const data = await response.json();
        setResults(data.items || []);
        setOpen(true);
      } catch (error) {
        if (error.name !== "AbortError") setResults([]);
      }
    }, 220);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="product-search" role="search">
      <label htmlFor="productSearch">{"\u4ea7\u54c1\u641c\u7d22"}</label>
      <input id="productSearch" type="search" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setOpen(true)} placeholder={"\u641c\u7d22\u578b\u53f7\uff0c\u5982 J422 / J507"} />
      {open && query.trim() && (
        <div className="product-search-results">
          {results.length === 0 ? (
            <p>{"\u6682\u65e0\u5339\u914d\u578b\u53f7"}</p>
          ) : results.slice(0, 6).map((item) => (
            <a key={item.slug} href={"/products/" + item.slug}>
              <strong>{item.model}</strong>
              <span>{item.manufacturer} ? {item.categoryName}</span>
            </a>
          ))}
        </div>
      )}
    </div>
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
  const meta = categoryMeta[categorySlug] || { title: "\u4ea7\u54c1\u4e2d\u5fc3", eyebrow: "Products", description: "\u6309\u5382\u5bb6\u548c\u578b\u53f7\u67e5\u770b\u4ea7\u54c1\u89c4\u683c\u3002" };
  const [manufacturer, setManufacturer] = useState("\u91d1\u6865");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetch("/api/products?category=" + encodeURIComponent(categorySlug) + "&manufacturer=" + encodeURIComponent(manufacturer), { signal: controller.signal })
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

          <div className="product-list">
            {items.map((item) => (
              <a className="product-row" key={item.slug} href={"/products/" + item.slug}>
                <span className="model-badge">{item.model}</span>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.summary}</p>
                  <small>{item.manufacturer} ? {item.categoryName} ? {item.standard}</small>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </ProductPageShell>
  );
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
            <strong>{product.standard || "\u6309\u5382\u5bb6\u8d44\u6599"}</strong>
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
  const visibleArticles = useMemo(() => (knowledgeOpen ? knowledgeArticles : knowledgeArticles.slice(0, 5)), [knowledgeOpen]);

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
          <div className="hero-visual" aria-label="焊材仓储与工业焊接场景"><img src="/assets/hero-welding.png" alt="焊材仓储与工业焊接场景" /></div>
          <dl className="hero-metrics" aria-label="core data"><div><dt>28{"\u5e74"}</dt><dd>{"\u4e13\u4e1a\u6279\u53d1\u7ecf\u9a8c"}</dd></div><div><dt>{"\u7701\u5185\u9886\u5148"}</dt><dd>{"\u4f9b\u8d27\u89c4\u6a21"}</dd></div><div><dt>96{"\u5c0f\u65f6"}</dt><dd>{"\u6d59\u6c5f\u533a\u57df\u6b63\u5e38\u9001\u8fbe"}</dd></div></dl>
        </section>

        <section className="section intro" aria-label="公司简介">
          <div className="intro-text"><p className="eyebrow">About</p><h2>焊材、设备、配件辅料与五金工具，一站式配齐。</h2></div>
          <p>宁波志凡焊材有限公司位于宁波市鄞州区富宁路119号，代理天津金桥、上海大西洋、上海东风、天泰、常州运河、亚泰、隆兴割炬、上海通用电焊机等品牌。</p>
        </section>

        <section className="section brand-strip" aria-label="授权品牌">
          <div className="section-heading compact-heading"><p className="eyebrow">Authorized Brands</p><h2>授权品牌</h2><p>长期代理主流焊材与焊接设备品牌，支持现货供应、资料配合与项目保供。</p></div>
          <div className="brand-logo-grid">
            <article><img src="/assets/brands/jinqiao.png" alt="天津金桥焊材 logo" /><span>天津金桥焊材</span></article>
            <article><img src="/assets/brands/atlantic.png" alt="上海大西洋焊材 logo" /><span>上海大西洋焊材</span></article>
            <article><img src="/assets/brands/shanghai-dongfeng.png" alt="上海东风焊材 logo" /><span>上海东风焊材</span></article>
            <article><img src="/assets/brands/tiantai.png" alt="天泰焊材 logo" /><span>天泰焊材</span></article>
          </div>
          <div className="brand-cloud secondary-brands"><span>常州运河焊材</span><span>亚泰焊材</span><span>隆兴割炬</span><span>上海通用电焊机</span></div>
        </section>

        <section className="section" id="products">
          <div className="section-split"><div className="section-heading"><p className="eyebrow">Products</p><h2>{"\u4ea7\u54c1\u4e2d\u5fc3"}</h2><p>{"\u9ad8\u9891\u54c1\u7c7b\u5e38\u5907\u5e93\u5b58\uff0c\u6309\u54c1\u724c\u3001\u89c4\u683c\u548c\u9879\u76ee\u8ba1\u5212\u8fdb\u884c\u4fdd\u4f9b\u3002"}</p><ProductSearch /></div><figure className="section-image"><img src="/assets/sections/products-shelves.png" alt="货架上的焊丝、焊条与焊剂库存" /></figure></div>
          <div className="product-grid">{products.map((item) => <a className="product-home-card" key={item.number} href={"/products/" + item.slug}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></a>)}<a className="product-category-card" href="/products/carbon-steel-electrodes"><span>07</span><h3>{"\u78b3\u94a2\u710a\u6761"}</h3><p>{"\u9002\u7528\u4e8e\u4f4e\u78b3\u94a2\u548c 490MPa \u7ea7\u7ed3\u6784\u710a\u63a5\uff0c\u8986\u76d6\u901a\u7528\u7ed3\u6784\u3001\u4e2d\u539a\u677f\u3001\u73b0\u573a\u7ef4\u4fee\u4e0e\u91cd\u8981\u627f\u8f7d\u6784\u4ef6\u3002"}</p></a></div>
        </section>

        <section className="section soft" id="solutions">
          <div className="section-split"><div className="section-heading"><p className="eyebrow">Cases</p><h2>案例及相关业绩</h2><p>客户名称和精确吨位已脱敏，仅保留行业、供应规模和服务方式。</p></div><figure className="section-image"><img src="/assets/sections/cases-handover.png" alt="仓库客户提货与交付沟通场景" /></figure></div>
          <div className="case-list compact-list"><article><h3>工程项目保供</h3><p>提前锁定常用规格，专门小组跟进库存、发货、资料和异常响应。</p></article><article><h3>区域快速配送</h3><p>宁波地区正常48小时内，浙江全区域正常96小时内送达。</p></article><article><h3>跨省发运</h3><p>覆盖江浙沪及周边省区，可按需发往指定地点或偏远省区。</p></article></div>
          <div className="case-data-grid">{caseCards.map(([tag, title, text]) => <article key={title}><span>{tag}</span><h4>{title}</h4><p>{text}</p></article>)}</div>
        </section>

        <section className="section" id="knowledge">
          <div className="section-split"><div className="section-heading"><p className="eyebrow">Knowledge</p><h2>焊接操作</h2><p>根据采购、选型和现场问题的重要程度排序，优先展示能最快帮助客户明确型号、工艺和风险的内容。</p></div><figure className="section-image"><img src="/assets/sections/knowledge-operation.png" alt="焊材选型与焊接操作准备" /></figure></div>
          <div className={`knowledge-list ${knowledgeOpen ? "" : "collapsed"}`} id="knowledgeList">
            {visibleArticles.map(([number, title, text, href]) => <a className="knowledge-card" key={href} href={href}><span>{number}</span><h3>{title}</h3><p>{text}</p><strong>阅读全文</strong></a>)}
          </div>
          <div className="knowledge-more"><button type="button" aria-expanded={knowledgeOpen} aria-controls="knowledgeList" onClick={() => setKnowledgeOpen((value) => !value)}>{knowledgeOpen ? "收起文章" : "查看更多 10 篇"}</button></div>
        </section>

        <section className="section soft strength-section" id="strength">
          <div className="strength-hero"><div><p className="eyebrow">Capability</p><h2>{"\u8d44\u8d28\u4e0e\u670d\u52a1"}</h2><p>{"\u4e00\u7ea7\u7ecf\u9500\u8d44\u6e90\u3001\u5145\u8db3\u73b0\u8d27\u5e93\u5b58\u548c\u533a\u57df\u7269\u6d41\u80fd\u529b\uff0c\u5171\u540c\u652f\u6491\u7a33\u5b9a\u4ea4\u4ed8\u3002"}</p></div></div>
          <div className="credential-panel"><div><strong>28{"\u5e74"}</strong><span>{"\u710a\u6750\u4e13\u4e1a\u6279\u53d1\u7ecf\u9a8c"}</span></div><div><strong>省内领先</strong><span>浙江省内供货规模</span></div><div><strong>3200吨</strong><span>常备焊材库存上限</span></div><div><strong>一级</strong><span>多品牌全国经销商</span></div></div>
          <div className="service-grid"><article><span>服务</span><h4>全过程技术支持</h4><p>技术工程师与客户经理配合，提供参数说明、现场指导、调试和使用问题处理。</p></article><article><span>响应</span><h4>质量问题快速处理</h4><p>质保期内质量问题立即响应，48小时内派专人到现场，并按要求配合更换。</p></article><article><span>预案</span><h4>紧急保供机制</h4><p>安全库存、备选货品、多元物流和快速响应小组，应对突发订单与运输异常。</p></article></div>
          <div className="stock-gallery" aria-label="仓储实景素材"><figure><img src="/assets/sections/warehouse-ai-shelves-3.png" alt="仓库货架实景" /></figure><figure><img src="/assets/sections/warehouse-ai-stock-2.png" alt="焊丝焊条托盘库存实景" /></figure><figure><img src="/assets/sections/warehouse-ai-overview-1.png" alt="仓库整体库存实景" /></figure></div>
        </section>

        <section className="section contact" id="contact">
          <div><p className="eyebrow">Contact</p><h2>联系我们</h2><p>提供品牌、型号、数量、收货地址和到货时间，我们将安排专门负责小组对接库存、报价和配送。</p><figure className="contact-image"><img src="/assets/sections/contact.png" alt="焊材采购咨询与配送安排" /></figure><div className="contact-info"><a href="tel:0574-89007658">公司电话：0574-89007658</a><a href="tel:13805890268">手机联系：13805890268</a><span>地址：宁波市鄞州区富宁路119号</span><span>配送：宁波地区正常48小时内，浙江全区域正常96小时内</span><span>营业时间：周一至周六 8:00-16:30，周日休息</span></div></div>
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
