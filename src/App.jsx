import { useMemo, useState } from "react";

const navItems = [
  ["#products", "产品中心"],
  ["#solutions", "案例及相关业绩"],
  ["#knowledge", "焊接操作"],
  ["#strength", "资质与服务"],
  ["#contact", "联系我们"]
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
        <a className="brand" href="#home" aria-label="宁波志凡焊材有限公司首页" onClick={() => setOpen(false)}>
          <span className="brand-mark">志</span>
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
            <a key={href} className={href === "#contact" ? "nav-cta" : undefined} href={href} onClick={() => setOpen(false)}>{label}</a>
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
function App() {
  const isAdminPage = window.location.pathname === "/admin" || window.location.pathname === "/admin/";
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const visibleArticles = useMemo(() => (knowledgeOpen ? knowledgeArticles : knowledgeArticles.slice(0, 5)), [knowledgeOpen]);

  if (isAdminPage) return <AdminDashboard />;

  return (
    <>
      <Header />
      <main>
        <section className="hero" id="home">
          <div className="hero-copy-wrap">
            <p className="eyebrow">宁波 · 焊材一级经销与保供服务</p>
            <h1>把焊材采购做得简单、稳定、及时。</h1>
            <p className="hero-copy">近26年焊接材料批发经验，常备焊材2600-3200吨，服务江浙沪及周边项目采购。</p>
            <div className="hero-actions"><a className="primary-btn" href="#contact">立即咨询</a><a className="secondary-btn" href="#products">查看产品</a></div>
          </div>
          <div className="hero-visual" aria-label="焊材仓储与工业焊接场景"><img src="/assets/hero-welding.png" alt="焊材仓储与工业焊接场景" /></div>
          <dl className="hero-metrics" aria-label="核心数据"><div><dt>26年</dt><dd>专业批发经验</dd></div><div><dt>省内领先</dt><dd>供货规模</dd></div><div><dt>96小时</dt><dd>浙江区域正常送达</dd></div></dl>
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
          <div className="section-split"><div className="section-heading"><p className="eyebrow">Products</p><h2>产品中心</h2><p>高频品类常备库存，按品牌、规格和项目计划进行保供。图片风格参考实仓库存：桶装焊丝、焊条纸箱、焊剂袋与托盘膜包装。</p></div><figure className="section-image"><img src="/assets/sections/products-shelves.png" alt="货架上的焊丝、焊条与焊剂库存" /></figure></div>
          <div className="product-grid">{products.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
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
          <div className="strength-hero"><div><p className="eyebrow">Capability</p><h2>资质与服务</h2><p>一级经销资源、充足现货库存和区域物流能力，共同支撑稳定交付。仓库背景采用实景参考与蓝色渐变处理，突出真实库存能力。</p></div></div>
          <div className="credential-panel"><div><strong>26年</strong><span>焊材专业批发经验</span></div><div><strong>省内领先</strong><span>浙江省内供货规模</span></div><div><strong>3200吨</strong><span>常备焊材库存上限</span></div><div><strong>一级</strong><span>多品牌全国经销商</span></div></div>
          <div className="service-grid"><article><span>服务</span><h4>全过程技术支持</h4><p>技术工程师与客户经理配合，提供参数说明、现场指导、调试和使用问题处理。</p></article><article><span>响应</span><h4>质量问题快速处理</h4><p>质保期内质量问题立即响应，48小时内派专人到现场，并按要求配合更换。</p></article><article><span>预案</span><h4>紧急保供机制</h4><p>安全库存、备选货品、多元物流和快速响应小组，应对突发订单与运输异常。</p></article></div>
          <div className="stock-gallery" aria-label="仓储实景素材"><figure><img src="/assets/sections/warehouse-ai-shelves-3.png" alt="仓库货架实景" /></figure><figure><img src="/assets/sections/warehouse-ai-stock-2.png" alt="焊丝焊条托盘库存实景" /></figure><figure><img src="/assets/sections/warehouse-ai-overview-1.png" alt="仓库整体库存实景" /></figure></div>
        </section>

        <section className="section contact" id="contact">
          <div><p className="eyebrow">Contact</p><h2>联系我们</h2><p>提供品牌、型号、数量、收货地址和到货时间，我们将安排专门负责小组对接库存、报价和配送。</p><figure className="contact-image"><img src="/assets/sections/contact.png" alt="焊材采购咨询与配送安排" /></figure><div className="contact-info"><a href="tel:0574-89007658">公司电话：0574-89007658</a><a href="tel:13805890268">手机联系：13805890268</a><span>地址：宁波市鄞州区富宁路119号</span><span>配送：宁波地区正常48小时内，浙江全区域正常96小时内</span></div></div>
          <ContactForm />
        </section>
      </main>
      <footer className="footer"><p>© 2026 宁波志凡焊材有限公司</p><a href="#top">返回顶部</a></footer>
    </>
  );
}

export default App;
