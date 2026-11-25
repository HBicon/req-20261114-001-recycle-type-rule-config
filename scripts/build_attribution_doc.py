#!/usr/bin/env python3
"""Build the standalone review HTML for the attribution PRD."""

from __future__ import annotations

import html
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "order-attribution-product-document.md"
OUTPUT = ROOT / "order-attribution-product-document.html"


def slugify(text: str, index: int) -> str:
    cleaned = re.sub(r"[^\w\u4e00-\u9fff]+", "-", text).strip("-")
    return cleaned or f"section-{index}"


def inline(text: str) -> str:
    escaped = html.escape(text, quote=False)
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        lambda match: f'<a href="{html.escape(match.group(2))}">{match.group(1)}</a>',
        escaped,
    )
    return escaped


def split_table_row(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def render_markdown(markdown: str) -> tuple[str, str, list[tuple[str, str]]]:
    lines = markdown.splitlines()
    title = ""
    blocks: list[str] = []
    toc: list[tuple[str, str]] = []
    paragraph: list[str] = []
    in_code = False
    code_lines: list[str] = []
    list_type: str | None = None
    list_items: list[str] = []
    table_lines: list[str] = []
    section_index = 0

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            blocks.append(f"<p>{inline(' '.join(paragraph))}</p>")
            paragraph = []

    def flush_list() -> None:
        nonlocal list_type, list_items
        if list_items and list_type:
            tag = "ol" if list_type == "ol" else "ul"
            blocks.append(f"<{tag}>" + "".join(f"<li>{inline(item)}</li>" for item in list_items) + f"</{tag}>")
        list_type = None
        list_items = []

    def flush_table() -> None:
        nonlocal table_lines
        if not table_lines:
            return
        rows = [split_table_row(line) for line in table_lines]
        table_lines = []
        if len(rows) < 2:
            return
        headings = rows[0]
        body_rows = rows[2:] if all(re.fullmatch(r":?-{3,}:?", cell) for cell in rows[1]) else rows[1:]
        markup = ["<div class=\"table-wrap\"><table><thead><tr>"]
        markup.extend(f"<th>{inline(cell)}</th>" for cell in headings)
        markup.append("</tr></thead><tbody>")
        for row in body_rows:
            padded = row + [""] * (len(headings) - len(row))
            markup.append("<tr>" + "".join(f"<td>{inline(cell)}</td>" for cell in padded[: len(headings)]) + "</tr>")
        markup.append("</tbody></table></div>")
        blocks.append("".join(markup))

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```"):
            flush_paragraph()
            flush_list()
            flush_table()
            if in_code:
                blocks.append(f"<pre><code>{html.escape(chr(10).join(code_lines))}</code></pre>")
                code_lines = []
                in_code = False
            else:
                in_code = True
            continue
        if in_code:
            code_lines.append(line)
            continue
        if stripped.startswith("|") and stripped.endswith("|"):
            flush_paragraph()
            flush_list()
            table_lines.append(stripped)
            continue
        flush_table()
        if not stripped:
            flush_paragraph()
            flush_list()
            continue
        if stripped == "---":
            flush_paragraph()
            flush_list()
            continue
        if stripped.startswith("# "):
            flush_paragraph()
            flush_list()
            title = stripped[2:].strip()
            continue
        if stripped.startswith("### "):
            flush_paragraph()
            flush_list()
            text = stripped[4:].strip()
            blocks.append(f"<h3>{inline(text)}</h3>")
            continue
        if stripped.startswith("## "):
            flush_paragraph()
            flush_list()
            section_index += 1
            text = stripped[3:].strip()
            section_id = slugify(text, section_index)
            toc.append((section_id, text))
            label = f"{section_index:02d}"
            blocks.append(
                f'<section id="{section_id}" class="doc-section">'
                f'<div class="section-kicker">{label} / SECTION</div>'
                f"<h2>{inline(text)}</h2>"
            )
            blocks.append("<!-- SECTION_CONTENT -->")
            continue
        if stripped.startswith(">"):
            flush_paragraph()
            flush_list()
            blocks.append(f"<blockquote>{inline(stripped[1:].strip())}</blockquote>")
            continue
        unordered = re.match(r"^[-*]\s+(.+)$", stripped)
        ordered = re.match(r"^\d+\.\s+(.+)$", stripped)
        if unordered or ordered:
            flush_paragraph()
            next_type = "ol" if ordered else "ul"
            if list_type and list_type != next_type:
                flush_list()
            list_type = next_type
            list_items.append((ordered or unordered).group(1))
            continue
        paragraph.append(stripped)

    flush_paragraph()
    flush_list()
    flush_table()
    rendered = "\n".join(blocks)
    # Close each section after every H2 boundary.
    parts = rendered.split("<!-- SECTION_CONTENT -->")
    if len(parts) > 1:
        joined = parts[0]
        for index, part in enumerate(parts[1:]):
            next_section = part.find('<section id="')
            if next_section >= 0:
                joined += part[:next_section] + "</section>" + part[next_section:]
            else:
                joined += part + "</section>"
        rendered = joined
    return title, rendered, toc


def build() -> None:
    markdown = SOURCE.read_text(encoding="utf-8")
    title, content, toc = render_markdown(markdown)
    toc_links = "".join(f'<a href="#{target}">{html.escape(label)}</a>' for target, label in toc)
    output = f"""<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#ffffff" />
    <meta name="description" content="订单归属统一配置、审核与自动扭转产品需求文档 v1.1。" />
    <title>{html.escape(title)}｜v1.1</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%2314785b'/%3E%3Cpath d='M16 18h32v8H16zm0 10h19v8H16zm23 0h9v8h-9zM16 38h32v8H16z' fill='%23fff'/%3E%3C/svg%3E" />
    <link rel="stylesheet" href="./assets/docs.css?v=20261125-1" />
    <style>
      .doc-section {{ scroll-margin-top: 82px; }}
      .doc-content h3 {{ margin: 28px 0 10px; font-size: 18px; }}
      .doc-content > .doc-section:first-child {{ padding-top: 36px; }}
      .doc-content p {{ color: var(--ink-2); }}
      .doc-content ul, .doc-content ol {{ margin: 14px 0 20px; padding-left: 23px; color: var(--ink-2); }}
      .doc-content li + li {{ margin-top: 6px; }}
      .doc-content blockquote {{
        margin: 18px 0;
        padding: 14px 17px;
        color: var(--ink-2);
        background: var(--green-soft);
        border-left: 3px solid var(--green);
      }}
      .doc-content blockquote p {{ margin: 0; }}
      .doc-content pre {{
        overflow: auto;
        margin: 18px 0;
        padding: 17px;
        color: #dcefe8;
        background: #172a25;
        border-radius: 6px;
        font: 12px/1.75 var(--mono);
      }}
      .doc-content code {{
        padding: 1px 4px;
        color: var(--green-dark);
        background: var(--green-soft);
        border-radius: 3px;
        font: 0.9em var(--mono);
      }}
      .doc-content pre code {{ padding: 0; color: inherit; background: none; font: inherit; }}
      .doc-content a {{ color: var(--green); text-decoration: underline; text-underline-offset: 3px; }}
      .doc-content table {{ width: 100%; min-width: 680px; border-collapse: collapse; font-size: 12px; }}
      .doc-content th, .doc-content td {{ padding: 10px 12px; border: 1px solid var(--line); text-align: left; vertical-align: top; }}
      .doc-content th {{ color: var(--ink); background: var(--paper-soft); font-weight: 650; }}
      .status-note {{ margin-top: 18px; color: var(--amber); font-weight: 600; }}
      @media (max-width: 760px) {{
        .doc-nav {{ display: none; }}
        .doc-hero {{ grid-template-columns: 1fr; gap: 28px; }}
        .doc-layout {{ grid-template-columns: 1fr; gap: 0; }}
        .doc-toc {{ position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-bottom: 20px; }}
        .doc-toc > span {{ grid-column: 1 / -1; }}
      }}
    </style>
  </head>
  <body>
    <a class="skip-link" href="#document">跳到 PRD 正文</a>
    <header class="doc-header">
      <a class="doc-brand" href="./index.html" aria-label="返回评审首页">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h16M4 11h9M4 17h16"/><path d="M15 9h5v5h-5z"/></svg>
        </span>
        <span><strong>订单归属配置</strong><small>PRODUCT REQUIREMENTS</small></span>
      </a>
      <nav class="doc-nav" aria-label="文档导航">
        <a href="#结论先行">方案摘要</a>
        <a href="#核心模型">核心模型</a>
        <a href="#触发条件与优先级">优先级</a>
        <a href="#页面与交互要求">原型交互</a>
        <a href="#验收标准">验收</a>
        <a href="./prototype.html#attribution">交互原型</a>
      </nav>
      <div class="header-status"><span>G2 评审中</span><a class="button button-primary" href="./prototype.html#attribution">打开原型</a></div>
    </header>
    <main>
      <section class="doc-hero">
        <div class="doc-hero-main">
          <div class="doc-meta-line"><span>REQ-20261114-001</span><i></i><span>PRD v1.1</span><i></i><span>2026-11-25</span></div>
          <h1>{html.escape(title)}</h1>
          <p>按需求方最新 Axure 方案重构：买家中标默认归生态，非买家中标默认归自营；订单跨部门最多扭转一次，完成后冻结；唯一当前业务标签与部门归属分开保存。</p>
          <div class="hero-actions">
            <a class="button button-primary" href="./prototype.html#attribution">评审订单归属配置</a>
            <a class="button button-secondary" href="./order-attribution-product-document.md">查看 Markdown 原文</a>
            <a class="button button-secondary" href="./index.html">返回 PRD 首页</a>
          </div>
        </div>
        <aside class="doc-hero-side">
          <div class="hero-side-head"><span>当前状态</span><strong>G2 待确认</strong></div>
          <dl>
            <div><dt>原标签范围</dt><dd class="is-success">G1 已通过</dd></div>
            <div><dt>补充范围</dt><dd>待确认</dd></div>
            <div><dt>研发放行</dt><dd>否</dd></div>
            <div><dt>更新时间</dt><dd>2026-11-25</dd></div>
          </dl>
          <p>本文为业务与交互评审稿，不构成研发执行依据。</p>
        </aside>
      </section>
      <div class="doc-layout">
        <aside class="doc-toc" aria-label="目录"><span>目录</span>{toc_links}</aside>
        <article class="doc-content" id="document">{content}</article>
      </div>
    </main>
  </body>
</html>
"""
    OUTPUT.write_text(output, encoding="utf-8")
    print(f"generated {OUTPUT}")


if __name__ == "__main__":
    build()
