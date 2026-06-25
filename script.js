const toggle = document.querySelector(".menu-toggle");
const links = document.querySelector(".nav-links");

toggle?.addEventListener("click", () => {
  const isOpen = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});

links?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    links.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  }
});

const knowledgeToggle = document.querySelector("#knowledgeToggle");
const knowledgeList = document.querySelector("#knowledgeList");

knowledgeToggle?.addEventListener("click", () => {
  const isCollapsed = knowledgeList.classList.toggle("collapsed");
  knowledgeToggle.setAttribute("aria-expanded", String(!isCollapsed));
  knowledgeToggle.textContent = isCollapsed ? "查看更多 10 篇" : "收起文章";
});
