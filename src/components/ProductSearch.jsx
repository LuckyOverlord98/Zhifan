import { useEffect, useRef, useState } from "react";

function getVisibleLimit() {
  const height = window.innerHeight || 720;
  const width = window.innerWidth || 1024;
  if (height < 620 || width < 520) return 3;
  if (height < 780 || width < 900) return 4;
  return 5;
}

function ProductSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [dropdown, setDropdown] = useState({ left: 0, top: 0, width: 320, maxHeight: 360, limit: 6 });
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  function updateDropdown() {
    const element = inputRef.current || rootRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const gutter = 12;
    const limit = getVisibleLimit();
    const width = Math.min(rect.width, window.innerWidth - gutter * 2);
    const left = Math.max(gutter, Math.min(rect.left, window.innerWidth - width - gutter));
    const spaceBelow = window.innerHeight - rect.bottom - gutter;
    const spaceAbove = rect.top - gutter;
    const showAbove = spaceBelow < 240 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(180, Math.min(showAbove ? spaceAbove : spaceBelow, limit * 72 + 16));
    const top = showAbove ? Math.max(gutter, rect.top - maxHeight - 8) : rect.bottom + 8;
    setDropdown({ left, top, width, maxHeight, limit });
  }

  useEffect(() => {
    const keyword = query.trim();
    if (!keyword) {
      setResults([]);
      setStatus("idle");
      return undefined;
    }
    setStatus("loading");
    setOpen(true);
    updateDropdown();
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/products?search=" + encodeURIComponent(keyword), { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "search failed");
        setResults(data.items || []);
        setStatus("ready");
        setOpen(true);
        updateDropdown();
      } catch (error) {
        if (error.name !== "AbortError") {
          setResults([]);
          setStatus("error");
        }
      }
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    updateDropdown();
    window.addEventListener("resize", updateDropdown);
    window.addEventListener("scroll", updateDropdown, true);
    return () => {
      window.removeEventListener("resize", updateDropdown);
      window.removeEventListener("scroll", updateDropdown, true);
    };
  }, [open, query]);

  return (
    <div className="product-search" role="search" ref={rootRef}>
      <label htmlFor="productSearch">{"\u4ea7\u54c1\u641c\u7d22"}</label>
      <input
        id="productSearch"
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          setOpen(true);
          updateDropdown();
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 140)}
        placeholder={"\u641c\u7d22\u578b\u53f7 / \u6807\u51c6\u53f7\uff0c\u5982 J507 / AWS A5.1"}
      />
      {open && query.trim() && (
        <div
          className="product-search-results product-search-results-floating"
          style={{ left: dropdown.left, top: dropdown.top, width: dropdown.width, maxHeight: dropdown.maxHeight }}
        >
          {status === "loading" ? (
            <p className="search-status">{"\u641c\u7d22\u4e2d..."}</p>
          ) : status === "error" ? (
            <p className="search-status">{"\u641c\u7d22\u6682\u65f6\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5"}</p>
          ) : results.length === 0 ? (
            <p>{"\u6682\u65e0\u5339\u914d\u578b\u53f7"}</p>
          ) : results.slice(0, dropdown.limit).map((item) => (
            <a key={item.slug} href={"/products/" + item.slug}>
              <strong>{item.model}</strong>
              <span>{[item.manufacturer, item.categoryName, item.standard].filter(Boolean).join(" / ")}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductSearch;
