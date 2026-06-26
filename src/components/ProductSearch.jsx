import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
    const availableSpace = Math.max(170, Math.min(showAbove ? spaceAbove : spaceBelow, limit * 70 + 14));
    const top = showAbove ? Math.max(gutter, rect.top - availableSpace - 8) : Math.min(rect.bottom + 8, window.innerHeight - availableSpace - gutter);
    setDropdown({ left, top, width, maxHeight: availableSpace, limit });
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
  }, [query]);

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
    <div
      className="product-search-results product-search-results-floating"
      style={{ left: dropdown.left, top: dropdown.top, width: dropdown.width, maxHeight: dropdown.maxHeight }}
    >
      {status === "loading" ? (
        <p className="search-status">{"搜索中..."}</p>
      ) : status === "error" ? (
        <p className="search-status">{"搜索暂时失败，请稍后重试"}</p>
      ) : results.length === 0 ? (
        <p>{"暂无匹配型号"}</p>
      ) : results.slice(0, dropdown.limit).map((item) => (
        <a key={item.slug} href={"/products/" + item.slug}>
          <strong>{item.model}</strong>
          <span>{[item.manufacturer, item.categoryName, item.standard].filter(Boolean).join(" / ")}</span>
        </a>
      ))}
    </div>,
    document.body
  ) : null;

  return (
    <div className="product-search" role="search" ref={rootRef}>
      <label htmlFor="productSearch">{"产品搜索"}</label>
      <input
        id="productSearch"
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          setOpen(true);
          updateDropdown();
          window.setTimeout(updateDropdown, 80);
          window.setTimeout(updateDropdown, 260);
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 180)}
        placeholder={"搜索型号 / 标准号，如 J507 / AWS A5.1"}
      />
      {dropdownNode}
    </div>
  );
}

export default ProductSearch;
