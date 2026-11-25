#!/usr/bin/env python3
"""Build the public HTML for the two-solution comparison."""

from __future__ import annotations

import html
from pathlib import Path

from build_attribution_doc import render_markdown


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "order-label-scheme-comparison.md"
OUTPUT = ROOT / "order-label-scheme-comparison.html"


def build() -> None:
    markdown = SOURCE.read_text(encoding="utf-8")
    title, content, toc = render_markdown(markdown)
    toc_links = "".join(
        f'<a href="#{target}">{html.escape(label)}</a>' for target, label in toc
    )
    output = f"""<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#ffffff" />
    <meta name="description" content="Axure 最终业务方案与已确认规则收敛方案的逐项对比和合并建议。" />
    <title>{html.escape(title)}｜G2 评审</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%2314785b'/%3E%3Cpath d='M14 18h15v8H14zm21 0h15v8H35zM14 38h15v8H14zm21 0h15v8H35zM31 24h2v18h-2z' fill='%23fff'/%3E%3C/svg%3E" />
    <link rel="stylesheet" href="./assets/docs.css?v=20261125-3" />
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
      .doc-content table {{ width: 100%; min-width: 720px; border-collapse: collapse; font-size: 12px; }}
      .doc-content th, .doc-content td {{ padding: 10px 12px; border: 1px solid var(--line); text-align: left; vertical-align: top; }}
      .doc-content th {{ color: var(--ink); background: var(--paper-soft); font-weight: 650; }}
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
    <a class="skip-link" href="#document">跳到对比正文</a>
    <header class="doc-header">
      <a class="doc-brand" href="./index.html" aria-label="返回评审首页">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h16M4 11h9M4 17h16"/><path d="M15 9h5v5h-5z"/></svg>
        </span>
        <span><strong>双方案对比</strong><small>SOLUTION REVIEW</small></span>
      </a>
      <nav class="doc-nav" aria-label="文档导航">
        <a href="#1-对比结论">对比结论</a>
        <a href="#3-核心差异总表">差异总表</a>
        <a href="#5-关键冲突">关键冲突</a>
        <a href="#7-推荐合并方案">合并方案</a>
        <a href="#9-G2-需要拍板的三项">待拍板</a>
      </nav>
      <div class="header-status"><span>G2 评审中</span><a class="button button-primary" href="./order-label-prototype-product-proposal.html">查看收敛方案</a></div>
    </header>
    <main>
      <section class="doc-hero">
        <div class="doc-hero-main">
          <div class="doc-meta-line"><span>REQ-20261114-001</span><i></i><span>SCHEME COMPARISON</span><i></i><span>2026-11-25</span></div>
          <h1>Axure 最终业务方案<br />与已确认规则收敛方案</h1>
          <p>两套方案共同采用“成交初始化、最多一次跨部门扭转、扭转后冻结”的主模型。分歧集中在七类还是五类触发，以及固定数值优先级是否适用于机器人和手机号。</p>
          <div class="hero-actions">
            <a class="button button-primary" href="#7-推荐合并方案">查看合并建议</a>
            <a class="button button-secondary" href="./order-label-prototype-product-proposal.html">阅读收敛方案</a>
            <a class="button button-secondary" href="./order-attribution-product-document.html">阅读 Axure 派生 PRD</a>
          </div>
        </div>
        <aside class="doc-hero-side">
          <div class="hero-side-head"><span>当前建议</span><strong>合并采用</strong></div>
          <dl>
            <div><dt>页面骨架</dt><dd class="is-success">Axure</dd></div>
            <div><dt>执行规则</dt><dd class="is-success">收敛方案</dd></div>
            <div><dt>本期触发</dt><dd>已确认 5 类</dd></div>
            <div><dt>扩展条件</dt><dd>待确认</dd></div>
          </dl>
          <p>本次比对是 G2 决策材料，不构成研发执行结论。</p>
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


if __name__ == "__main__":
    build()
