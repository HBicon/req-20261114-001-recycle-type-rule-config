#!/usr/bin/env python3
"""Verify the v1.1 attribution prototype with a real browser."""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urljoin

from playwright.sync_api import Browser, Page, sync_playwright


BASE_URL = "http://127.0.0.1:4188/"
PROTOTYPE_URL = urljoin(BASE_URL, "prototype.html")
DOCUMENT_URL = urljoin(BASE_URL, "order-attribution-product-document.html")

VIEWS = {
    "overview": "治理总览",
    "labels": "业务标签",
    "categories": "标签分类",
    "attribution": "订单归属",
    "rules": "标签规则",
    "runtime": "运行与权限",
    "approvals": "审核与发布",
    "simulator": "规则试算",
    "trace": "订单追溯",
}


@dataclass
class Result:
    checks: list[str] = field(default_factory=list)
    failures: list[str] = field(default_factory=list)
    console: list[str] = field(default_factory=list)

    def check(self, condition: bool, label: str) -> None:
        if condition:
            self.checks.append(label)
        else:
            self.failures.append(label)

    def equal(self, actual, expected, label: str) -> None:
        self.check(
            actual == expected,
            f"{label}：期望 {expected!r}，实际 {actual!r}",
        )


def attach_observers(page: Page, result: Result) -> None:
    page.on(
        "console",
        lambda message: result.console.append(f"console.{message.type}: {message.text}")
        if message.type in {"error", "warning"}
        else None,
    )
    page.on("pageerror", lambda error: result.console.append(f"pageerror: {error}"))
    page.on(
        "requestfailed",
        lambda request: result.console.append(
            f"requestfailed: {request.method} {request.url} {request.failure}"
        ),
    )


def assert_no_page_overflow(page: Page, result: Result, label: str) -> None:
    dimensions = page.evaluate(
        """() => ({
          viewport: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth
        })"""
    )
    result.check(
        dimensions["documentWidth"] <= dimensions["viewport"] + 1
        and dimensions["bodyWidth"] <= dimensions["viewport"] + 1,
        f"{label} 无页面级横向溢出：{dimensions}",
    )


def verify_views(browser: Browser, result: Result) -> None:
    for width, height in ((1440, 1000), (760, 1000), (390, 844), (320, 720)):
        context = browser.new_context(viewport={"width": width, "height": height})
        page = context.new_page()
        attach_observers(page, result)

        page.goto(BASE_URL, wait_until="networkidle")
        result.equal(
            page.locator("h1").first.inner_text(),
            "订单业务标签统一配置\n与订单归属自动扭转",
            f"{width}px 首页标题",
        )
        assert_no_page_overflow(page, result, f"{width}px 首页")

        page.goto(DOCUMENT_URL, wait_until="networkidle")
        result.check(page.get_by_role("heading", name="订单归属统一配置、审核与自动扭转 PRD").is_visible(), f"{width}px 专题文档标题")
        assert_no_page_overflow(page, result, f"{width}px 专题文档")

        for view, expected_label in VIEWS.items():
            page.goto(f"{PROTOTYPE_URL}#{view}", wait_until="networkidle")
            page.locator("#view-root .view").wait_for()
            result.equal(page.locator("#admin-header-title").inner_text(), expected_label, f"{width}px {view} 顶栏")
            result.equal(page.locator('.admin-menu-item[aria-current="page"]').count(), 1, f"{width}px {view} 唯一选中态")
            result.check(
                expected_label in page.locator("#breadcrumb").inner_text(),
                f"{width}px {view} 面包屑同步",
            )
            assert_no_page_overflow(page, result, f"{width}px #${view}")

        if width <= 760:
            trigger = page.locator("#admin-sidebar-trigger")
            trigger.click()
            result.check(page.locator("#admin-sider").get_attribute("aria-hidden") != "true", f"{width}px 移动菜单可打开")
            page.keyboard.press("Escape")
            result.check(page.locator("#admin-sider").get_attribute("aria-hidden") == "true", f"{width}px Escape 关闭移动菜单")
        context.close()


def reset_demo(page: Page) -> None:
    page.goto(PROTOTYPE_URL, wait_until="networkidle")
    page.evaluate("localStorage.clear()")
    page.reload(wait_until="networkidle")


def choose_attribution_trigger(page: Page, trigger: str) -> None:
    form = page.locator("#attribution-form")
    form.locator('select[name="triggerType"]').select_option(trigger)
    page.wait_for_timeout(80)


def verify_attribution_interactions(browser: Browser, result: Result) -> None:
    context = browser.new_context(viewport={"width": 1440, "height": 1000})
    page = context.new_page()
    attach_observers(page, result)
    reset_demo(page)
    page.locator('.admin-menu-item[data-nav="attribution"]').click()
    page.locator("table.attribution-config-table tbody tr").first.wait_for()

    rows = page.locator(".attribution-config-table tbody tr")
    result.equal(rows.count(), 7, "订单归属配置默认 7 条")
    priorities = page.locator('.attribution-config-table td[data-label="业务优先级"] .priority-cell').all_inner_texts()
    result.equal(priorities, ["700", "600", "500", "400", "300", "300", "300"], "订单归属固定优先级")

    channel_row = rows.filter(has_text="按渠道").first
    result.check(channel_row.count() == 1, "渠道配置存在且使用固定最高优先级")
    result.check("生态" in channel_row.inner_text() and "生态-生态渠道" in channel_row.inner_text(), "渠道配置最终部门与关联回收类型一致")

    page.locator('[data-action="open-attribution-config"]').click()
    trigger_inputs = {
        "channel": 'select[name="triggerValue"]',
        "phone": 'input[name="triggerValue"][type="text"]',
        "robot": 'select[name="triggerValue"]',
        "valueTrade": "#attribution-form .attribution-form-condition .notice",
        "enterprise": "#attribution-form .attribution-form-condition .notice",
        "afterSaleRefund": "#attribution-form .attribution-form-condition .notice",
        "preSaleCancel": "#attribution-form .attribution-form-condition .notice",
    }
    for trigger, selector in trigger_inputs.items():
        choose_attribution_trigger(page, trigger)
        result.equal(page.locator(selector).count(), 1, f"{trigger} 条件输入联动")

    choose_attribution_trigger(page, "valueTrade")
    form = page.locator("#attribution-form")
    form.locator('input[name="name"]').fill("重复保值换新")
    form.locator('textarea[name="description"]').fill("验证同部门非录入项不得重复配置")
    page.locator('button[form="attribution-form"]').click()
    result.check(page.locator(".toast.is-error", has_text="配置冲突").last.is_visible(), "同部门非录入项重复配置被阻断")
    page.locator("[data-dialog-close]").first.click()

    page.locator('[data-action="open-attribution-config"]').click()
    choose_attribution_trigger(page, "phone")
    form = page.locator("#attribution-form")
    form.locator('input[name="name"]').fill("多手机号归自营")
    form.locator('input[name="triggerValue"]').fill("13711112222,13833334444")
    form.locator('textarea[name="description"]').fill("验证多个指定手机号提交、脱敏和审核发布")
    page.locator('button[form="attribution-form"]').click()
    result.check(page.locator(".toast", has_text="已提交审核").is_visible(), "订单归属配置可提交审核")
    result.check(
        page.locator(".attribution-config-table tbody tr", has_text="137****2222、138****4444").count() == 1,
        "多个手机号统一脱敏展示",
    )
    result.check(
        page.locator(
            ".attribution-config-table tbody tr",
            has_text="137****2222、138****4444",
        )
        .inner_text()
        .find("待审核")
        >= 0,
        "新配置提交后保持待审核状态",
    )

    page.locator('.admin-menu-item[data-nav="approvals"]').click()
    own_card = page.locator(".approval-card", has_text="新增：多手机号归自营")
    own_card.locator('[data-action="open-approval"]').click()
    result.check(page.get_by_text("当前事项由你提交，系统禁止审核本人事项").is_visible(), "提交人不能自审")
    page.locator("[data-dialog-close]").first.click()

    page.locator("#role-switcher").select_option("self_reviewer")
    review_card = page.locator(".approval-card", has_text="新增：多手机号归自营")
    review_card.locator('[data-action="open-approval"]').click()
    detail = page.locator("#app-dialog")
    result.check("137****2222、138****4444" in detail.inner_text(), "审核详情展示手机号脱敏值")
    detail.locator('[data-action="approve-approval"]').click()
    result.check(page.locator(".toast", has_text="审核完成并发布").is_visible(), "部门审核通过后发布配置")

    page.locator('.admin-menu-item[data-nav="attribution"]').click()
    published = page.locator(".attribution-config-table tbody tr", has_text="137****2222、138****4444")
    result.check("生效中" in published.inner_text(), "审核通过后配置进入生效状态")
    published_state = page.evaluate(
        """() => {
          const state = JSON.parse(localStorage.getItem("business-label-governance-v13"));
          return state.attributionConfigs.find((item) => item.name === "多手机号归自营");
        }"""
    )
    result.equal(published_state.get("version") if published_state else None, "v0.2", "审核通过后配置版本递增")

    page.locator("#role-switcher").select_option("self_author")
    page.locator('[data-action="open-attribution-config"]').click()
    choose_attribution_trigger(page, "phone")
    form = page.locator("#attribution-form")
    form.locator('input[name="name"]').fill("重复手机号")
    form.locator('input[name="triggerValue"]').fill("13711112222")
    form.locator('textarea[name="description"]').fill("验证同一手机号不得同时绑定多个配置")
    page.locator('button[form="attribution-form"]').click()
    result.check(page.locator(".toast.is-error", has_text="配置冲突").last.is_visible(), "同一手机号重复配置被阻断")
    page.locator("[data-dialog-close]").first.click()

    page.locator('.admin-menu-item[data-nav="simulator"]').click()
    presets = {
        "buyer-won": ("买家-买家成交", "买家中标默认生态"),
        "non-buyer-won": ("闪回-闪回成交", "非买家中标默认自营"),
        "self-to-eco": ("生态-生态渠道", "渠道场景完成自营转生态"),
        "eco-to-self": ("闪回-保值换新", "保值换新场景完成生态转自营"),
    }
    for preset, (expected_label, label) in presets.items():
        page.locator(f'[data-action="preset"][data-preset="{preset}"]').click()
        page.locator("#simulation-form").locator('button[type="submit"]').click()
        panel = page.locator(".simulation-result-panel")
        result.check(expected_label in panel.inner_text(), f"{label}：{expected_label}")
        if preset in {"self-to-eco", "eco-to-self"}:
            result.check("扭转后冻结" in panel.inner_text(), f"{label}：扭转后冻结")
        if preset == "buyer-won":
            result.check("生态" in panel.inner_text(), f"{label}：结果当前部门为生态")
        if preset == "non-buyer-won":
            result.check("自营" in panel.inner_text(), f"{label}：结果当前部门为自营")

    page.locator('.admin-menu-item[data-nav="trace"]').click()
    trace_text = page.locator(".trace-detail").inner_text()
    result.check("原始业务标签" in trace_text and "当前业务标签" in trace_text, "订单追溯同时展示原始与当前标签")
    result.check(
        "事件时间线" in trace_text and "未胜出 / 未命中原因" in trace_text,
        "订单追溯包含事件时间线与候选解释",
    )

    context.close()


def verify_source_hygiene(result: Result) -> None:
    root = Path(__file__).resolve().parents[1]
    public_files = [
        root / "index.html",
        root / "prototype.html",
        root / "prd.md",
        root / "order-attribution-product-document.md",
        root / "assets" / "state-v2.js",
    ]
    forbidden_patterns = [
        "/var/folders/",
        "/private/tmp/",
        "goodjob.shanhs.com/ax-files",
        "Bearer ",
        "BEGIN PRIVATE KEY",
        "ghp_",
    ]
    for path in public_files:
        text = path.read_text(encoding="utf-8")
        for pattern in forbidden_patterns:
            result.check(pattern not in text, f"公网文本不含敏感路径或凭证片段：{path.name} / {pattern}")


def main() -> int:
    result = Result()
    verify_source_hygiene(result)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        verify_views(browser, result)
        verify_attribution_interactions(browser, result)
        browser.close()

    console_errors = [entry for entry in result.console if "favicon" not in entry]
    result.check(not console_errors, "浏览器控制台、页面脚本与网络请求无错误")
    summary = {
        "passed": len(result.checks),
        "failed": len(result.failures),
        "console": console_errors,
        "failures": result.failures,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if result.failures:
        print("\n失败项：", file=sys.stderr)
        for failure in result.failures:
            print(f"- {failure}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
