# Q&A Content Protection Implementation Plan

Goal: Update four designated Q&A articles from 更新.docx, highlight them with purple marquee tiles, and add practical content protection plus screenshot watermarking to Q&A and product pages.

Architecture: Keep existing data-driven Q&A structure. Update src/data/knowledgeQa.js as source of truth, regenerate the four static Q&A HTML pages, add a shared /content-protection.js that enables copy/context-menu/drag/key blocking only on /knowledge, /products, and /articles/qa paths, and use CSS body classes for watermark overlays and purple designated cards.

Tasks:
- Update QA 05, 21, 22, and 25 data while preserving existing slugs/URLs.
- Update the matching four static article HTML files with short answer, long answer, generated tables, metadata, and protection script reference.
- Add featuredTone/designated label support in App.jsx card class rendering for index and homepage Q&A cards.
- Add CSS for purple marquee highlight, protected page watermark, and article card emphasis.
- Add public/content-protection.js and include it from index.html and static Q&A pages.
- Run preflight/build verification.
