import { useEffect, useState } from "react";

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
              <span>{item.manufacturer}{" ? "}{item.categoryName}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductSearch;
