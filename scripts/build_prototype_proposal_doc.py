#!/usr/bin/env python3
"""Build the public review HTML for the Axure-based product proposal."""

from __future__ import annotations

import html
from pathlib import Path

from build_attribution_doc import inline, render_markdown


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "order-label-prototype-product-proposal.md"
OUTPUT = ROOT / "order-label-prototype-product-proposal.html"


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
    <meta name="description" content="基于 Axure 原型输出的订单标签与部门扭转产品方案 v0.4，G2 评审草案。" />
    <title>{html.escape(title)}｜v0.4</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%2314785b'/%3E%3Cpath d='M17 18h30v8H17zm0 11h18v8H17zm21 0h9v8h-9zM17 40h30v8H17z' fill='%23fff'/%3E%3C/svg%3E" />
    <link rel="stylesheet" href="./assets/docs.css?v=20261125-2" />
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
      .doc-content table {{ width: 100%; min-width: 680px; border-collapse: collapse; font-size: 12px; }}
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
    <a class="skip-link" href="#document">跳到方案正文</a>
    <header class="doc-header">
      <a class="doc-brand" href="./index.html" aria-label="返回评审首页">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h16M4 11h9M4 17h16"/><path d="M15 9h5v5h-5z"/></svg>
        </span>
        <span><strong>原型产品方案</strong><small>PRODUCT PROPOSAL</small></span>
      </a>
      <nav class="doc-nav" aria-label="文档导航">
        <a href="#1-背景与问题">背景</a>
        <a href="#4-本期范围与明确不做">范围</a>
        <a href="#5-核心业务规则">核心规则</a>
        <a href="#6-产品信息架构与页面方案">页面方案</a>
        <a href="#10-原型差异与待确认">待确认</a>
        <a href="#11-产品验收场景">验收</a>
      </nav>
      <div class="header-status"><span>G2 评审中</span><a class="button button-primary" href="./index.html">返回 PRD 首页</a></div>
    </header>
    <main>
      <section class="doc-hero">
        <div class="doc-hero-main">
          <div class="doc-meta-line"><span>REQ-20261114-001</span><i></i><span>PROPOSAL v0.4</span><i></i><span>2026-11-25</span></div>
          <h1>{html.escape(title)}</h1>
          <p>成交时按中标方生成自营或生态初始标签；命中五类受控触发条件后，允许完成一次跨部门更新并冻结。原型展示的扩展业务和优先级作为差异项单独评审。</p>
          <div class="hero-actions">
            <a class="button button-primary" href="#5-核心业务规则">阅读核心规则</a>
            <a class="button button-secondary" href="./order-label-prototype-product-proposal.md">查看 Markdown 原文</a>
            <a class="button button-secondary" href="./prototype.html#attribution">查看交互原型</a>
          </div>
        </div>
        <aside class="doc-hero-side">
          <div class="hero-side-head"><span>当前交付状态</span><strong>G2 待确认</strong></div>
          <dl>
            <div><dt>初始标签</dt><dd class="is-success">自营 / 生态</dd></div>
            <div><dt>本期触发</dt><dd>5 类</dd></div>
            <div><dt>更新次数</dt><dd>最多 1 次</dd></div>
            <div><dt>研发放行</dt><dd>否</dd></div>
          </dl>
          <p>在线页面使用脱敏评审数据，不连接真实业务系统。</p>
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
