(function () {
  var path = window.location.pathname || "";
  var shouldProtect = /^(\/knowledge\/?|\/products(?:\/|$)|\/articles\/qa\/)/.test(path);
  if (!shouldProtect && !document.body.classList.contains("qa-article-page")) return;
  document.documentElement.classList.add("protected-content-root");
  document.body.classList.add("protected-content-page");
  var allowEditable = function (target) { return Boolean(target && target.closest && target.closest("input, textarea, select, [contenteditable='true']")); };
  document.addEventListener("contextmenu", function (event) { if (!allowEditable(event.target)) event.preventDefault(); }, true);
  document.addEventListener("copy", function (event) { if (allowEditable(event.target)) return; if (event.clipboardData) event.clipboardData.setData("text/plain", "宁波志凡焊材版权所有，请通过官网联系业务获取资料。"); event.preventDefault(); }, true);
  document.addEventListener("cut", function (event) { if (!allowEditable(event.target)) event.preventDefault(); }, true);
  document.addEventListener("dragstart", function (event) { if (!allowEditable(event.target)) event.preventDefault(); }, true);
  document.addEventListener("keydown", function (event) {
    if (allowEditable(event.target)) return;
    var key = String(event.key || "").toLowerCase();
    if ((event.ctrlKey || event.metaKey) && ["c", "x", "s", "u", "p", "a"].includes(key)) event.preventDefault();
    if (key === "f12" || ((event.ctrlKey || event.metaKey) && event.shiftKey && ["i", "j", "c"].includes(key))) event.preventDefault();
  }, true);
})();
