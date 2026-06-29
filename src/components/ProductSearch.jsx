import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function getVisibleLimit() {
  const height = window.innerHeight || 720;
  const width = window.innerWidth || 1024;
  if (height < 620 || width < 520) return 5;
  if (height < 820 || width < 900) return 6;
  return 7;
}

function buildSearchUrl(keyword, limit, extraParams = {}) {
  const params = new URLSearchParams();
  params.set("search", keyword);
  params.set("limit", String(limit));
  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim()) params.set(key, String(value));
  });
  return "/api/products?" + params.toString();
}

function ProductSearch({ onSearchSubmit, extraParams = {}, submitLimit = 200 }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [dropdown, setDropdown] = useState({ left: 0, top: 0, width: 320, maxHeight: 360, limit: 5 });
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
    const showAbove = spaceBelow < 220 && spaceAbove > spaceBelow;
    const availableSpace = Math.max(260, Math.min(showAbove ? spaceAbove : spaceBelow, limit * 70 + 14));
    const top = showAbove ? Math.max(gutter, rect.top - availableSpace - 8) : Math.min(rect.bottom + 8, window.innerHeight - availableSpace - gutter);
    setDropdown({ left, top, width, maxHeight: availableSpace, limit });
  }

  async function fetchResults(keyword, limit, signal) {
    const response = await fetch(buildSearchUrl(keyword, limit, extraParams), { signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "search failed");
    return data.items || [];
  }

  async function submitSearch() {
    const keyword = query.trim();
    if (!keyword) return;
    setStatus("loading");
    setOpen(true);
    updateDropdown();
    try {
      const items = await fetchResults(keyword, submitLimit);
      setResults(items.slice(0, 20));
      setStatus("ready");
      setOpen(false);
      onSearchSubmit?.({ query: keyword, items });
    } catch {
      setResults([]);
      setStatus("error");
      onSearchSubmit?.({ query: keyword, items: [] });
    }
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
        const items = await fetchResults(keyword, 20, controller.signal);
        setResults(items.slice(0, 20));
        setStatus("ready");
        setOpen(true);
        updateDropdown();
        window.setTimeout(updateDropdown, 80);
        window.setTimeout(updateDropdown, 260);
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
  }, [query, JSON.stringify(extraParams)]);

  useEffect(() => {
    if (!open) return undefined;
    let frame = 0;
    const anchorDropdown = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = inputRef.current?.getBoundingClientRect();
        if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) {
          setOpen(false);
          return;
        }
        updateDropdown();
      });
    };
    anchorDropdown();
    window.addEventListener("resize", anchorDropdown);
    window.addEventListener("scroll", anchorDropdown, true);
    window.visualViewport?.addEventListener("resize", anchorDropdown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", anchorDropdown);
      window.removeEventListener("scroll", anchorDropdown, true);
      window.visualViewport?.removeEventListener("resize", anchorDropdown);
    };
  }, [open, query]);

  const dropdownNode = open && query.trim() && typeof document !== "undefined" ? createPortal(
    <div className="product-search-results product-search-results-floating" style={{ left: dropdown.left, top: dropdown.top, width: dropdown.width, maxHeight: dropdown.maxHeight }}>
      {status === "loading" ? (
        <p className="search-status">{"\u641c\u7d22\u4e2d..."}</p>
      ) : status === "error" ? (
        <p className="search-status">{"\u641c\u7d22\u6682\u65f6\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5"}</p>
      ) : results.length === 0 ? (
        <p>{"\u6682\u65e0\u5339\u914d\u578b\u53f7"}</p>
      ) : results.map((item) => (
        <a key={item.slug} href={"/products/" + item.slug}>
          <strong>{item.model}{item.inStock && <span className="search-stock-label">{"\u4ed3\u5185\u73b0\u8d27\u4ea7\u54c1"}</span>}</strong>
          <span>{[item.manufacturer, item.categoryName, item.standard].filter(Boolean).join(" / ")}</span>
        </a>
      ))}
    </div>,
    document.body
  ) : null;

  return (
    <div className="product-search" role="search" ref={rootRef}>
      <label htmlFor="productSearch">{"\u4ea7\u54c1\u641c\u7d22"}</label>
      <input
        id="productSearch"
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submitSearch();
          }
        }}
        onFocus={() => {
          setOpen(true);
          updateDropdown();
          window.setTimeout(updateDropdown, 80);
          window.setTimeout(updateDropdown, 260);
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 180)}
        placeholder={"\u641c\u7d22\u578b\u53f7 / \u6807\u51c6\u53f7\uff0c\u5982 J507 / AWS A5.1"}
      />
      {dropdownNode}
    </div>
  );
}

export default ProductSearch;