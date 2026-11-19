(() => {
  'use strict';

  const STORAGE_KEY = 'business-label-governance-v5';

  const DEPARTMENTS = [
    { id: 'self', name: '自营', originalLabel: '闪回-闪回成交', color: 'green' },
    { id: 'eco', name: '生态', aliases: ['buyer'], originalLabel: '买家-买家成交', color: 'blue' },
    { id: 'shared', name: '两部门共用', originalLabel: '—', color: 'amber' }
  ];

  const CONDITION_FIELDS = [
    { id: 'dealMethod', name: '成交方式' },
    { id: 'robotSource', name: '机器人来源' },
    { id: 'businessType', name: '业务类型' },
    { id: 'channel', name: '渠道' },
    { id: 'phoneGroup', name: '手机号群组' },
    { id: 'ownershipEvent', name: '物权 / 售后事件' }
  ];

  const CONDITION_VALUES = {
    dealMethod: [
      { id: 'manual', name: '人工成交' },
      { id: 'robot', name: '机器人成交' },
      { id: 'fallback', name: '闲鱼兜底成交' }
    ],
    robotSource: [
      { id: 'self_multi', name: '多个自营机器人' },
      { id: 'eco_no_quote', name: '生态无人报价' },
      { id: 'eco_platform', name: '生态平台兜底' },
      { id: 'buyer_package', name: '买家包销机器人' }
    ],
    businessType: [
      { id: 'normal', name: '普通回收' },
      { id: 'value_trade', name: '保值换新' },
      { id: 'enterprise_purchase', name: '企业购' },
      { id: 'platform_fallback', name: '平台兜底业务' }
    ],
    channel: [
      { id: 'normal', name: '普通渠道' },
      { id: 'service_channel', name: '指定售后渠道（脱敏）' },
      { id: 'eco_channel', name: '生态合作渠道（脱敏）' }
    ],
    phoneGroup: [
      { id: 'none', name: '未命中指定群组' },
      { id: 'self_bu', name: '自营 BU 群组' },
      { id: 'eco_bu', name: '生态 BU 群组' }
    ],
    ownershipEvent: [
      { id: 'deal_only', name: '仅成交，无后续物权事件' },
      { id: 'none_after_sale', name: '成交后未发起售后' },
      { id: 'after_sale_effective', name: '售后物权已生效' }
    ]
  };

  const VIEW_META = {
    overview: { label: '治理总览', group: '工作台', code: 'OVERVIEW' },
    labels: { label: '业务标签', group: '配置', code: 'LABELS' },
    categories: { label: '标签分类', group: '配置', code: 'TAXONOMY' },
    rules: { label: '标签规则', group: '规则与事件', code: 'RULES' },
    runtime: { label: '运行与权限', group: '规则与事件', code: 'RUNTIME' },
    approvals: { label: '审核与发布', group: '规则与事件', code: 'APPROVALS' },
    simulator: { label: '规则试算', group: '验证与追溯', code: 'SIMULATOR' },
    trace: { label: '订单追溯', group: '验证与追溯', code: 'TRACE' }
  };

  const ui = {
    view: 'overview',
    labelQuery: '',
    labelDepartment: 'all',
    labelStatus: 'all',
    ruleDepartment: 'all',
    ruleStatus: 'all',
    approvalStatus: 'pending',
    activeTrace: 'TC202611190108',
    simulatorDepartment: 'self'
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function createDefaultState() {
    const source = window.BUSINESS_LABEL_DEFAULT_STATE;
    if (!source) throw new Error('默认业务标签配置未加载');
    return clone(source);
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return createDefaultState();
      const parsed = JSON.parse(saved);
      if (!parsed || parsed.version !== 5 || !Array.isArray(parsed.labels)) return createDefaultState();
      return parsed;
    } catch (error) {
      return createDefaultState();
    }
  }

  let state = loadState();

  const viewRoot = document.getElementById('view-root');
  const reviewRail = document.getElementById('review-rail');
  const breadcrumb = document.getElementById('breadcrumb');
  const contextRuleCount = document.getElementById('context-rule-count');
  const appDialog = document.getElementById('app-dialog');
  const dialogContent = document.getElementById('dialog-content');
  const toastRegion = document.getElementById('toast-region');
  const roleSwitcher = document.getElementById('role-switcher');
  const userName = document.getElementById('admin-user-name');
  const userAvatar = document.getElementById('admin-avatar');

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      showToast('本地保存失败', '浏览器限制了本地存储，刷新后将恢复演示数据。', true);
    }
  }

  function nowLabel() {
    const date = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function nowTime() {
    return new Date().toLocaleTimeString('zh-CN', { hour12: false });
  }

  function normalizeDepartment(value) {
    return value === 'buyer' ? 'eco' : value;
  }

  function departmentMeta(value) {
    const id = normalizeDepartment(value);
    return DEPARTMENTS.find((item) => item.id === id) || { id, name: id || '未设置', originalLabel: '—', color: 'gray' };
  }

  function departmentName(value) {
    return departmentMeta(value).name;
  }

  function currentRole() {
    return state.roles.find((role) => role.id === state.currentRoleId) || state.roles[0];
  }

  function hasCapability(capability) {
    const role = currentRole();
    if (!role) return false;
    if (role.id === 'platform_admin' || role.capabilities.includes(capability)) return true;
    if (capability.endsWith(':all')) return role.capabilities.includes(capability.replace(':all', ':self'));
    return false;
  }

  function canManageDepartment(department) {
    const normalized = normalizeDepartment(department);
    const role = currentRole();
    if (!role) return false;
    if (role.id === 'platform_admin') return true;
    if (role.id === 'self_author') return normalized === 'self';
    if (role.id === 'eco_author') return normalized === 'eco';
    return false;
  }

  function canViewDepartment(department) {
    const normalized = normalizeDepartment(department);
    const role = currentRole();
    if (!role) return false;
    if (['platform_admin', 'ops_exception', 'viewer'].includes(role.id)) return true;
    if (role.id.startsWith('self_')) return ['self', 'shared'].includes(normalized);
    if (role.id.startsWith('eco_')) return ['eco', 'shared'].includes(normalized);
    return false;
  }

  function canApproveDepartment(department) {
    const normalized = normalizeDepartment(department);
    const role = currentRole();
    if (normalized === 'self' && role.id === 'self_reviewer') return true;
    if (normalized === 'eco' && role.id === 'eco_reviewer') return true;
    return false;
  }

  function approvalRolesFor(item) {
    if (Array.isArray(item.requiredApprovals) && item.requiredApprovals.length) return item.requiredApprovals;
    return [normalizeDepartment(item.department) === 'self' ? '自营审核人' : '生态审核人'];
  }

  function approvalRoleKey(role) {
    return role.includes('自营') ? 'self' : 'eco';
  }

  function categoryMeta(id) {
    return state.categories.find((item) => item.id === id) || { name: '未分类', code: 'UNSET' };
  }

  function findLabel(id) {
    return [...state.baseLabels, ...state.labels].find((item) => item.id === id);
  }

  function findRule(id) {
    return state.rules.find((item) => item.id === id);
  }

  function findApproval(id) {
    return state.approvals.find((item) => item.id === id);
  }

  function findTrace(orderNo) {
    return state.traces.find((item) => item.orderNo === orderNo);
  }

  function restoreRoleName() {
    const role = currentRole();
    state.currentUser = role.name;
    if (userName) userName.textContent = role.name;
    if (userAvatar) userAvatar.textContent = role.name.slice(0, 1);
  }

  function statusChip(status, customLabel = '') {
    const statusMap = {
      enabled: ['green', '生效中'],
      active: ['green', '生效中'],
      pending: ['amber', '待审核'],
      approved: ['blue', '已通过'],
      rejected: ['red', '已驳回'],
      draft: ['gray', '草稿'],
      disabled: ['gray', '已停用'],
      failed: ['red', '处理失败']
    };
    const normalized = status === 'seller' ? 'enabled' : status;
    const [tone, label] = statusMap[normalized] || ['gray', status || '未知'];
    return `<span class="status-chip is-${tone}"><i aria-hidden="true"></i>${escapeHtml(customLabel || label)}</span>`;
  }

  function departmentChip(value) {
    const meta = departmentMeta(value);
    return `<span class="department-chip is-${meta.color}">${escapeHtml(meta.name)}</span>`;
  }

  function labelChip(label, muted = false) {
    if (!label) return '<span class="text-muted">未设置</span>';
    return `<span class="label-chip ${muted ? 'is-muted' : ''}">${escapeHtml(label.name)}</span>`;
  }

  function conditionFieldName(field) {
    return CONDITION_FIELDS.find((item) => item.id === field)?.name || field;
  }

  function conditionValueName(field, value) {
    return CONDITION_VALUES[field]?.find((item) => item.id === value)?.name || value;
  }

  function conditionsText(conditions = []) {
    if (!conditions.length) return '无条件，默认命中';
    return conditions.map((item) => `${conditionFieldName(item.field)}为「${conditionValueName(item.field, item.value)}」`).join(' 且 ');
  }

  function conditionsChips(conditions = []) {
    if (!conditions.length) return '<span class="condition-chip is-empty">无条件</span>';
    return conditions.map((item) => `<span class="condition-chip">${escapeHtml(conditionFieldName(item.field))}：${escapeHtml(conditionValueName(item.field, item.value))}</span>`).join('');
  }

  function labelRules(labelId) {
    return state.rules.filter((rule) => rule.targetLabelId === labelId);
  }

  function conditionOverlap(first = [], second = []) {
    const sharedFields = first.filter((condition) => second.some((other) => other.field === condition.field));
    return sharedFields.every((condition) => second.some((other) => other.field === condition.field && other.value === condition.value));
  }

  function conflictsForRule(department, priority, targetLabelId, conditions, ignoreId = '') {
    return state.rules.filter((rule) => {
      return rule.id !== ignoreId
        && normalizeDepartment(rule.department) === normalizeDepartment(department)
        && Number(rule.priority) === Number(priority)
        && rule.targetLabelId !== targetLabelId
        && !['disabled', 'rejected'].includes(rule.status)
        && conditionOverlap(rule.conditions, conditions);
    });
  }

  function allActiveConflicts() {
    const active = state.rules.filter((rule) => rule.status === 'enabled');
    const conflicts = [];
    active.forEach((rule, index) => {
      active.slice(index + 1).forEach((other) => {
        if (normalizeDepartment(rule.department) === normalizeDepartment(other.department)
          && Number(rule.priority) === Number(other.priority)
          && rule.targetLabelId !== other.targetLabelId
          && conditionOverlap(rule.conditions, other.conditions)) {
          conflicts.push([rule, other]);
        }
      });
    });
    return conflicts;
  }

  function ruleMatches(rule, facts) {
    if (rule.status !== 'enabled') return false;
    if (normalizeDepartment(rule.department) !== normalizeDepartment(facts.department)) return false;
    return rule.conditions.every((condition) => String(facts[condition.field] || '') === String(condition.value));
  }

  function simulate(facts, eventType = 'ORDER_WON') {
    const department = normalizeDepartment(facts.department);
    const baseLabel = state.baseLabels.find((label) => normalizeDepartment(label.department) === department);
    const candidates = state.rules
      .filter((rule) => normalizeDepartment(rule.department) === department)
      .map((rule) => ({
        rule,
        matches: ruleMatches(rule, { ...facts, department }),
        reasons: rule.conditions
          .filter((condition) => String(facts[condition.field] || '') !== String(condition.value))
          .map((condition) => `${conditionFieldName(condition.field)}不匹配`)
      }))
      .sort((first, second) => Number(second.rule.priority) - Number(first.rule.priority));
    const matched = candidates.filter((item) => item.matches);
    const topPriority = matched.length ? Number(matched[0].rule.priority) : null;
    const topRules = topPriority === null ? [] : matched.filter((item) => Number(item.rule.priority) === topPriority);
    const conflict = topRules.length > 1 && new Set(topRules.map((item) => item.rule.targetLabelId)).size > 1;
    const winner = conflict ? null : topRules[0]?.rule || null;
    const targetLabel = winner ? findLabel(winner.targetLabelId) : baseLabel;
    return {
      department,
      eventType,
      eventId: `EVT-${Date.now().toString().slice(-8)}`,
      matchedAt: nowLabel(),
      originalLabel: baseLabel?.name || '—',
      currentLabel: targetLabel?.name || baseLabel?.name || '—',
      winner,
      candidates,
      conflict,
      conflictRules: conflict ? topRules.map((item) => item.rule) : []
    };
  }

  function activeViewFromHash() {
    const view = window.location.hash.replace(/^#/, '') || 'overview';
    return VIEW_META[view] ? view : 'overview';
  }

  function updateShell() {
    ui.view = activeViewFromHash();
    const meta = VIEW_META[ui.view];
    document.querySelectorAll('.admin-menu-item[data-nav]').forEach((item) => {
      const active = item.dataset.nav === ui.view;
      item.classList.toggle('is-active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
    document.getElementById('admin-header-title').textContent = meta.label;
    document.title = `${meta.label}｜业务标签治理台`;
    breadcrumb.innerHTML = `<span>订单业务标签</span><span>${escapeHtml(meta.group)}</span><b>${escapeHtml(meta.label)}</b>`;
    contextRuleCount.textContent = `${state.rules.filter((rule) => rule.status === 'enabled').length} ACTIVE RULES`;
    if (roleSwitcher) {
      roleSwitcher.innerHTML = state.roles.map((role) => `<option value="${escapeHtml(role.id)}" ${role.id === state.currentRoleId ? 'selected' : ''}>${escapeHtml(role.title)} · ${escapeHtml(role.name)}</option>`).join('');
    }
    restoreRoleName();
  }

  function pageHeader(code, title, description, actions = '') {
    return `
      <header class="page-head">
        <div class="page-head-copy">
          <div class="eyebrow">${escapeHtml(code)}</div>
          <h1>${title}</h1>
          <p>${description}</p>
        </div>
        ${actions ? `<div class="head-actions">${actions}</div>` : ''}
      </header>
    `;
  }

  function reviewPanel(title, description, groups) {
    return `
      <div class="review-panel-head">
        <span>G2 REVIEW NOTE</span>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(description)}</p>
      </div>
      <div class="review-panel-groups">
        ${groups.map((group) => `
          <section class="review-group">
            <h3>${escapeHtml(group.title)}</h3>
            ${group.items.map((item) => `<div class="review-item"><i aria-hidden="true"></i><p>${item}</p></div>`).join('')}
          </section>
        `).join('')}
      </div>
      <div class="review-panel-foot">
        <strong>本轮评审状态</strong>
        <span>${statusChip('pending', 'G2 待确认')}</span>
        <p>当前材料用于确认业务规则与交互；通过后再固化可研发规格。</p>
      </div>
    `;
  }

  function render() {
    updateShell();
    const renderer = {
      overview: renderOverview,
      labels: renderLabels,
      categories: renderCategories,
      rules: renderRules,
      runtime: renderRuntime,
      approvals: renderApprovals,
      simulator: renderSimulator,
      trace: renderTrace
    }[ui.view] || renderOverview;
    const output = renderer();
    viewRoot.innerHTML = output.body;
    reviewRail.innerHTML = output.review;
    restoreRoleName();
  }

  function goTo(view) {
    if (!VIEW_META[view]) return;
    if (activeViewFromHash() === view) render();
    else window.location.hash = view;
  }

  function renderOverview() {
    const pendingApprovals = state.approvals.filter((item) => item.status === 'pending');
    const activeLabels = state.labels.filter((label) => label.status === 'enabled');
    const activeRules = state.rules.filter((rule) => rule.status === 'enabled');
    const failedTags = state.traces.filter((trace) => trace.status === '待人工修复');
    const recentEvents = state.traces.slice(0, 3);
    const conflicts = allActiveConflicts();
    const latestApproval = pendingApprovals[0];
    const body = `
      <div class="view">
        ${pageHeader(
          'WORKBENCH / G2',
          '订单标签，一处定义，<em>可追溯地自动更新</em>',
          '为自营与生态提供统一的业务标签定义、规则发布和订单执行入口。原始标签永久保留，当前标签按已审核规则更新。',
          `<button class="button button-secondary" data-action="go-view" data-view="simulator">规则试算</button><button class="button button-primary" data-action="go-view" data-view="approvals">处理待审核 ${pendingApprovals.length}</button>`
        )}

        <section class="summary-grid" aria-label="标签治理概况">
          <article class="summary-card">
            <div class="summary-card-top"><span>生效业务标签</span><span class="summary-trend">当前口径</span></div>
            <strong>${activeLabels.length}</strong>
            <p>覆盖 ${new Set(activeLabels.map((label) => normalizeDepartment(label.department))).size} 个业务域，基础标签另计。</p>
          </article>
          <article class="summary-card">
            <div class="summary-card-top"><span>生效标签规则</span><span class="summary-trend">v1.4</span></div>
            <strong>${activeRules.length}</strong>
            <p>${conflicts.length ? `${conflicts.length} 组同优先级冲突需处理` : '当前无同优先级发布阻断'}</p>
          </article>
          <article class="summary-card is-warning">
            <div class="summary-card-top"><span>待审核事项</span><span class="summary-trend">需要决策</span></div>
            <strong>${pendingApprovals.length}</strong>
            <p>${latestApproval ? `最早提交：${escapeHtml(latestApproval.title)}` : '当前无待处理事项'}</p>
          </article>
          <article class="summary-card is-danger">
            <div class="summary-card-top"><span>待修复订单</span><span class="summary-trend">不阻断成交</span></div>
            <strong>${failedTags.length}</strong>
            <p>人工修复必须审批，原始标签始终不变。</p>
          </article>
        </section>

        <section class="overview-columns">
          <article class="content-panel">
            <div class="panel-heading">
              <div><h2>待评审与待处理</h2><p>按风险优先展示，进入事项可查看配置差异和确认进度。</p></div>
              <button class="text-button" data-action="go-view" data-view="approvals">查看全部</button>
            </div>
            <div class="approval-preview-list">
              ${pendingApprovals.slice(0, 3).map((item) => `
                <button class="approval-preview" type="button" data-action="open-approval" data-id="${escapeHtml(item.id)}">
                  <span class="approval-type is-${escapeHtml(item.type)}">${item.type === 'label' ? '标签' : item.type === 'rule' ? '规则' : '修复'}</span>
                  <span class="approval-preview-copy">
                    <strong>${escapeHtml(item.title)}</strong>
                    <small>${escapeHtml(item.summary)}</small>
                  </span>
                  <span class="approval-review-progress">${item.approvals.length}/${approvalRolesFor(item).length} 已确认</span>
                  <span class="row-arrow" aria-hidden="true">›</span>
                </button>
              `).join('') || '<div class="empty-state"><strong>暂无待审核事项</strong><p>所有标签、规则和人工修复均已处理。</p></div>'}
            </div>
          </article>

          <aside class="content-panel system-panel">
            <div class="panel-heading"><div><h2>运行时健康</h2><p>只展示会影响标签口径的关键信号。</p></div></div>
            <div class="health-list">
              <div><span>规则命中服务</span><strong class="text-success"><i></i>正常</strong></div>
              <div><span>订单事件积压</span><strong>12 <small>条</small></strong></div>
              <div><span>今天失败任务</span><strong class="text-danger">1 <small>条</small></strong></div>
              <div><span>当前配置版本</span><strong>${escapeHtml(state.ruleVersion)}</strong></div>
            </div>
            <button class="button button-secondary button-block" data-action="go-view" data-view="runtime">查看运行边界与权限</button>
          </aside>
        </section>

        <section class="content-panel">
          <div class="panel-heading">
            <div><h2>最近订单标签事件</h2><p>展示原始标签、当前标签与实际命中依据。</p></div>
            <button class="text-button" data-action="go-view" data-view="trace">进入订单追溯</button>
          </div>
          <div class="table-scroll">
            <div class="data-table overview-trace-table">
              <div class="data-table-head">
                <span>订单</span><span>部门</span><span>原始标签</span><span>当前标签</span><span>命中依据</span><span>处理结果</span><span></span>
              </div>
              ${recentEvents.map((trace) => `
                <button class="data-table-row trace-preview-row" type="button" data-action="select-trace" data-order="${escapeHtml(trace.orderNo)}">
                  <span class="mono-cell">${escapeHtml(trace.orderNo)}</span>
                  <span>${departmentChip(trace.department)}</span>
                  <span>${labelChip({ name: trace.originalLabel }, true)}</span>
                  <span>${labelChip({ name: trace.currentLabel })}</span>
                  <span class="cell-secondary">${escapeHtml(trace.matchedRule)} · ${escapeHtml(trace.ruleVersion)}</span>
                  <span>${trace.status === '待人工修复' ? statusChip('failed', '待修复') : statusChip('enabled', trace.status)}</span>
                  <span class="row-arrow" aria-hidden="true">›</span>
                </button>
              `).join('')}
            </div>
          </div>
        </section>

        <section class="decision-band">
          <div class="decision-band-head"><span>已确认的 4 条产品硬约束</span><strong>本轮不再重开</strong></div>
          <div class="decision-band-grid">
            <div><b>唯一当前标签</b><p>一个订单任一时刻只允许一个当前业务标签。</p></div>
            <div><b>原始标签不可变</b><p>部门在成交时写入后永久保留。</p></div>
            <div><b>默认不追溯</b><p>规则仅影响新订单与后续事件。</p></div>
            <div><b>人工变更需审批</b><p>异常修复和重算都走审核。</p></div>
          </div>
        </section>
      </div>
    `;
    return {
      body,
      review: reviewPanel('总览：先判断治理是否闭环', '本页用于确认系统是否覆盖“定义、发布、执行、追溯”四个环节，以及待处理事项是否按风险呈现。', [
        { title: '数据来源', items: ['生效标签和规则来自当前发布版本。', '待审核数量来自标签、规则与人工修复统一队列。', '失败订单来自标签处理任务，不影响订单成交结果。'] },
        { title: '交互检查', items: ['点击待审核事项直接打开审核详情。', '点击表内订单进入订单追溯场景。', '所有演示操作只写入浏览器本地状态。'] },
        { title: '本页待确认', items: ['首页统计指标是否为首期必需。', '待审核默认按提交时间还是风险等级排序。'] }
      ])
    };
  }

  function renderLabels() {
    const query = ui.labelQuery.trim().toLowerCase();
    const visible = state.labels.filter((label) => {
      const departmentVisible = canViewDepartment(label.department);
      const departmentMatch = ui.labelDepartment === 'all' || normalizeDepartment(label.department) === ui.labelDepartment;
      const statusMatch = ui.labelStatus === 'all' || label.status === ui.labelStatus;
      const text = `${label.name} ${label.code} ${label.description} ${label.owner}`.toLowerCase();
      return departmentVisible && departmentMatch && statusMatch && (!query || text.includes(query));
    });

    const body = `
      <div class="view">
        ${pageHeader(
          'CONFIGURATION / 01',
          '业务标签定义',
          '编码是稳定业务标识，名称负责展示。基础标签受系统保护，业务标签需经过审核后才能被规则引用。',
          `<button class="button button-primary" data-action="open-label" ${hasCapability('label:submit') ? '' : 'disabled title="当前角色无提交权限"'}>新增业务标签</button>`
        )}

        <section class="protected-label-grid">
          ${state.baseLabels.map((label) => `
            <article class="protected-label-card">
              <div class="protected-label-head">
                <span><i aria-hidden="true"></i>系统基础标签</span>
                ${statusChip('enabled')}
              </div>
              <div class="protected-label-main">
                <div>
                  <h2>${escapeHtml(label.name)}</h2>
                  <code>${escapeHtml(label.code)}</code>
                </div>
                ${departmentChip(label.department)}
              </div>
              <p>${escapeHtml(label.description)}</p>
              <div class="protected-label-foot"><span>订单成交时写入</span><strong>不可编辑 · 不可覆盖</strong></div>
            </article>
          `).join('')}
        </section>

        <section class="filter-toolbar">
          <div class="filter-toolbar-row">
            <div class="segmented-filters" aria-label="按部门筛选">
              ${[['all', '全部'], ['self', '自营'], ['eco', '生态'], ['shared', '两部门共用']].map(([value, label]) => `
                <button class="${ui.labelDepartment === value ? 'is-active' : ''}" type="button" data-action="label-filter-department" data-value="${value}">${label}</button>
              `).join('')}
            </div>
            <label class="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              <input id="label-search" value="${escapeHtml(ui.labelQuery)}" placeholder="搜索名称、编码或责任人" autocomplete="off" />
            </label>
          </div>
          <div class="filter-toolbar-row is-secondary">
            <div class="segmented-filters is-small">
              ${[['all', '全部状态'], ['enabled', '生效中'], ['pending', '待审核'], ['draft', '草稿'], ['disabled', '已停用']].map(([value, label]) => `
                <button class="${ui.labelStatus === value ? 'is-active' : ''}" type="button" data-action="label-filter-status" data-value="${value}">${label}</button>
              `).join('')}
            </div>
            <span class="result-count">共 <b>${visible.length}</b> 个业务标签</span>
          </div>
        </section>

        <section class="data-panel">
          <div class="data-table label-data-table">
            <div class="data-table-head">
              <span>标签名称 / 编码</span><span>部门 / 分类</span><span>业务说明</span><span>引用规则</span><span>状态</span><span>操作</span>
            </div>
            ${visible.map((label) => {
              const references = labelRules(label.id);
              return `
                <div class="data-table-row">
                  <div class="primary-cell">
                    <button class="name-link" data-action="open-label-detail" data-id="${escapeHtml(label.id)}">${escapeHtml(label.name)}</button>
                    <span class="mono-cell">${escapeHtml(label.code)} · ${escapeHtml(label.version)}</span>
                  </div>
                  <div class="stack-cell">${departmentChip(label.department)}<span>${escapeHtml(categoryMeta(label.categoryId).name)}</span></div>
                  <div class="description-cell" title="${escapeHtml(label.description)}">${escapeHtml(label.description)}</div>
                  <div class="stack-cell"><b>${references.length} 条</b><span>${references.filter((rule) => rule.status === 'enabled').length} 条生效</span></div>
                  <div>${statusChip(label.status)}</div>
                  <div class="row-actions">
                    <button class="text-button" data-action="open-label-detail" data-id="${escapeHtml(label.id)}">详情</button>
                    <button class="text-button" data-action="edit-label" data-id="${escapeHtml(label.id)}" ${canManageDepartment(label.department) ? '' : 'disabled'}>编辑</button>
                    ${label.status === 'enabled' ? `<button class="text-button is-danger" data-action="disable-label" data-id="${escapeHtml(label.id)}" ${canManageDepartment(label.department) ? '' : 'disabled'}>停用</button>` : ''}
                  </div>
                </div>
              `;
            }).join('') || '<div class="empty-state is-inline"><strong>没有匹配的业务标签</strong><p>调整部门、状态或搜索条件后重试。</p></div>'}
          </div>
        </section>

        <section class="rule-callout">
          <span class="callout-icon">i</span>
          <div><strong>发布与停用规则</strong><p>编辑生效标签会生成新版本；提交后原版本继续生效。被生效规则引用的标签不能直接停用。</p></div>
        </section>
      </div>
    `;

    return {
      body,
      review: reviewPanel('标签定义：编码稳定，名称可变', '本场景验证自营、生态、共用标签的字段、状态与权限边界。', [
        { title: '关键规则', items: ['标签编码全局唯一，发布后不可修改。', '同名标签允许在不同部门存在，系统以编码识别。', '基础标签没有编辑、停用和覆盖入口。'] },
        { title: '角色差异', items: [`当前角色为「${currentRole().title}」。`, hasCapability('label:submit') ? '可以新增、编辑和提交停用申请。' : '新增、编辑和停用按钮被禁用。'] },
        { title: '异常状态', items: ['编码重复时阻止保存并定位字段。', '标签被生效规则引用时阻止停用。', '共用标签发布前必须获得双方确认。'] }
      ])
    };
  }

  function renderCategories() {
    const body = `
      <div class="view">
        ${pageHeader(
          'CONFIGURATION / 02',
          '标签分类与口径字典',
          '分类用于配置导航、筛选和运营分析，不直接决定订单标签结果。订单快照保存标签编码，分类改名不会破坏历史追溯。'
        )}

        <section class="taxonomy-summary">
          <div><span>分类数</span><strong>${state.categories.length}</strong><small>覆盖成交、渠道、企业、售后等业务域</small></div>
          <div><span>业务标签</span><strong>${state.labels.length}</strong><small>${state.labels.filter((label) => label.status === 'enabled').length} 个已生效</small></div>
          <div><span>未分类</span><strong>${state.labels.filter((label) => !state.categories.some((category) => category.id === label.categoryId)).length}</strong><small>发布前必须完成分类</small></div>
        </section>

        <div class="taxonomy-grid">
          ${state.categories.map((category, index) => {
            const labels = state.labels.filter((label) => label.categoryId === category.id && canViewDepartment(label.department));
            const enabled = labels.filter((label) => label.status === 'enabled').length;
            return `
              <article class="taxonomy-card">
                <div class="taxonomy-card-head">
                  <span class="taxonomy-index">${String(index + 1).padStart(2, '0')}</span>
                  <code>${escapeHtml(category.code)}</code>
                </div>
                <h2>${escapeHtml(category.name)}</h2>
                <p>${escapeHtml(category.description)}</p>
                <div class="taxonomy-label-list">
                  ${labels.length ? labels.map((label) => `<button class="taxonomy-label" data-action="open-label-detail" data-id="${escapeHtml(label.id)}">${departmentChip(label.department)}<span>${escapeHtml(label.name)}</span>${statusChip(label.status)}</button>`).join('') : '<span class="text-muted">暂无绑定标签</span>'}
                </div>
                <div class="taxonomy-card-foot"><span>${enabled}/${labels.length} 个生效</span><button class="text-button" data-action="filter-category-labels" data-category="${escapeHtml(category.id)}">查看标签</button></div>
              </article>
            `;
          }).join('')}
        </div>

        <section class="content-panel">
          <div class="panel-heading"><div><h2>业务字段字典</h2><p>规则只能引用下列受控字段，不允许输入任意表达式、SQL 或脚本。</p></div></div>
          <div class="dictionary-table">
            ${CONDITION_FIELDS.map((field) => `
              <div class="dictionary-row">
                <div><strong>${escapeHtml(field.name)}</strong><code>${escapeHtml(field.id)}</code></div>
                <p>${(CONDITION_VALUES[field.id] || []).map((value) => `<span>${escapeHtml(value.name)}</span>`).join('')}</p>
                <span class="dictionary-source">订单事实字段</span>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
    return {
      body,
      review: reviewPanel('标签分类：只影响组织方式', '分类不是标签命中条件，评审重点是字段字典是否足以表达现存业务规则。', [
        { title: '数据来源', items: ['分类和字段选项来自统一配置字典。', '分类编码发布后保持稳定。', '字段值由订单事实按事件版本提供。'] },
        { title: '交互检查', items: ['点击分类中的标签可查看标签详情。', '点击“查看标签”会携带分类筛选进入标签列表。', '分类变更不会触发订单重算。'] },
        { title: '待确认', items: ['Q-001：存量标签的部门、编码与数据来源。', '字段字典是否需要支持枚举值级权限控制。'] }
      ])
    };
  }

  function renderRules() {
    const visible = state.rules.filter((rule) => {
      const departmentVisible = canViewDepartment(rule.department);
      const departmentMatch = ui.ruleDepartment === 'all' || normalizeDepartment(rule.department) === ui.ruleDepartment;
      const statusMatch = ui.ruleStatus === 'all' || rule.status === ui.ruleStatus;
      return departmentVisible && departmentMatch && statusMatch;
    });
    const active = state.rules.filter((rule) => rule.status === 'enabled');
    const conflicts = allActiveConflicts();
    const body = `
      <div class="view">
        ${pageHeader(
          'RULE ENGINE / 03',
          '标签规则与优先级',
          '规则消费已审核生效标签。命中多条时按优先级降序选择唯一胜出规则；同优先级冲突必须在发布前阻断。',
          `<button class="button button-primary" data-action="open-rule" ${hasCapability('rule:submit') ? '' : 'disabled title="当前角色无提交权限"'}>新建规则</button>`
        )}

        <section class="rule-meter-grid">
          <article><span>生效规则</span><strong>${active.length}</strong><small>仅这些规则参与订单计算</small></article>
          <article><span>待审核规则</span><strong>${state.rules.filter((rule) => rule.status === 'pending').length}</strong><small>不参与当前订单计算</small></article>
          <article class="${conflicts.length ? 'is-danger' : ''}"><span>同优先级冲突</span><strong>${conflicts.length}</strong><small>${conflicts.length ? '必须处理后才能发布' : '目前无阻断'}</small></article>
          <article><span>当前规则版本</span><strong>${escapeHtml(state.ruleVersion)}</strong><small>每次发布生成独立只读版本</small></article>
        </section>

        <section class="filter-toolbar">
          <div class="segmented-filters">
            ${[['all', '全部部门'], ['self', '自营'], ['eco', '生态']].map(([value, label]) => `<button class="${ui.ruleDepartment === value ? 'is-active' : ''}" data-action="rule-filter-department" data-value="${value}">${label}</button>`).join('')}
          </div>
          <div class="segmented-filters is-small">
            ${[['all', '全部状态'], ['enabled', '生效中'], ['pending', '待审核'], ['disabled', '已停用']].map(([value, label]) => `<button class="${ui.ruleStatus === value ? 'is-active' : ''}" data-action="rule-filter-status" data-value="${value}">${label}</button>`).join('')}
          </div>
        </section>

        <section class="data-panel">
          <div class="data-table rule-data-table">
            <div class="data-table-head">
              <span>优先级</span><span>规则名称</span><span>适用部门</span><span>命中条件</span><span>输出标签</span><span>状态 / 版本</span><span>操作</span>
            </div>
            ${visible.sort((first, second) => Number(second.priority) - Number(first.priority)).map((rule) => {
              const conflicting = conflicts.some(([first, second]) => first.id === rule.id || second.id === rule.id);
              return `
                <div class="data-table-row ${conflicting ? 'has-conflict' : ''}">
                  <span class="priority-cell">${rule.priority}</span>
                  <div class="primary-cell"><strong>${escapeHtml(rule.name)}</strong><span class="mono-cell">${escapeHtml(rule.id)}</span></div>
                  <span>${departmentChip(rule.department)}</span>
                  <div class="condition-list">${conditionsChips(rule.conditions)}</div>
                  <span>${labelChip(findLabel(rule.targetLabelId))}</span>
                  <div class="stack-cell">${statusChip(rule.status)}<span>${escapeHtml(rule.version)} · ${escapeHtml(rule.updatedAt)}</span></div>
                  <div class="row-actions"><button class="text-button" data-action="open-rule-detail" data-id="${escapeHtml(rule.id)}">查看</button></div>
                </div>
              `;
            }).join('') || '<div class="empty-state is-inline"><strong>没有匹配规则</strong><p>调整筛选条件后重试。</p></div>'}
          </div>
        </section>

        <section class="conflict-explainer">
          <div class="conflict-explainer-copy"><span>冲突判定示例</span><h3>同部门 + 同优先级 + 条件可重叠 + 目标标签不同</h3><p>例：两条生态规则均为优先级 270；一条命中平台兜底业务，另一条仅命中机器人成交。两条件可同时满足且输出不同标签，因此禁止发布。</p></div>
          <div class="conflict-formula"><code>department = eco</code><code>priority = 270</code><code>conditions ∩ ≠ ∅</code><code>target A ≠ B</code></div>
        </section>
      </div>
    `;
    return {
      body,
      review: reviewPanel('标签规则：发布前解决冲突', '本场景确认条件表达、优先级、版本与试算入口是否足以支撑两个部门独立配置。', [
        { title: '执行顺序', items: ['读取订单事实与所属部门。', '筛选该部门已审核、已生效且事件范围允许的规则。', '按优先级降序选择唯一胜出规则。', '无规则命中时保留原始标签。'] },
        { title: '发布边界', items: ['同优先级冲突禁止提交审核。', '规则提交后不立即生效。', '规则发布只影响新订单及后续事件。'] },
        { title: '操作权限', items: [`当前角色为「${currentRole().title}」。`, hasCapability('rule:submit') ? '可创建规则并提交审核。' : '新建规则按钮被禁用。'] }
      ])
    };
  }

  function renderApprovals() {
    const accessible = state.approvals.filter((item) => canViewDepartment(item.department));
    const visible = accessible.filter((item) => ui.approvalStatus === 'all' || item.status === ui.approvalStatus);
    const pending = accessible.filter((item) => item.status === 'pending').length;
    const body = `
      <div class="view">
        ${pageHeader(
          'GOVERNANCE / 04',
          '审核与发布',
          '标签、规则与人工修复共用审核入口。提交人不能审核自己的事项，共用标签必须获得自营、生态双方确认。',
          `<span class="header-summary">${pending} 项待处理</span>`
        )}

        <section class="approval-flow">
          ${[
            ['01', '提交变更', '生成版本与字段差异'],
            ['02', '自动体检', '编码、冲突、引用影响'],
            ['03', '独立审核', '双方确认与驳回意见'],
            ['04', '发布生效', '记录版本与审计流水']
          ].map(([no, title, copy], index) => `
            <div class="approval-flow-step"><b>${no}</b><strong>${title}</strong><span>${copy}</span></div>
            ${index < 3 ? '<i class="approval-flow-arrow" aria-hidden="true">→</i>' : ''}
          `).join('')}
        </section>

        <section class="filter-toolbar">
          <div class="segmented-filters">
            ${[['pending', '待处理'], ['approved', '已通过'], ['rejected', '已驳回'], ['all', '全部']].map(([value, label]) => `<button class="${ui.approvalStatus === value ? 'is-active' : ''}" data-action="approval-filter" data-value="${value}">${label}</button>`).join('')}
          </div>
          <span class="current-role-hint">当前视角：${escapeHtml(currentRole().title)} · ${escapeHtml(currentRole().name)}</span>
        </section>

        <section class="approval-list">
          ${visible.map((item) => {
            const required = approvalRolesFor(item);
            const complete = required.filter((role) => item.approvals.some((approval) => approval.role === role));
            return `
              <article class="approval-card">
                <div class="approval-card-primary">
                  <div class="approval-card-title">
                    <span class="approval-type is-${escapeHtml(item.type)}">${item.type === 'label' ? '标签变更' : item.type === 'rule' ? '规则变更' : '异常修复'}</span>
                    ${statusChip(item.status)}
                  </div>
                  <h2>${escapeHtml(item.title)}</h2>
                  <p>${escapeHtml(item.summary)}</p>
                  <div class="approval-card-meta">
                    <span>${departmentChip(item.department)}</span>
                    <span>提交人 ${escapeHtml(item.submitter)}</span>
                    <span>${escapeHtml(item.submittedAt)}</span>
                    <span>${item.conflicts ? `${item.conflicts} 个冲突` : '自动体检通过'}</span>
                  </div>
                </div>
                <div class="approval-card-review">
                  <div class="review-progress-title"><span>审核进度</span><b>${complete.length}/${required.length}</b></div>
                  <div class="review-role-list">
                    ${required.map((role) => {
                      const record = item.approvals.find((approval) => approval.role === role);
                      return `<span class="${record ? 'is-done' : ''}"><i>${record ? '✓' : '·'}</i>${escapeHtml(role)}${record ? `<small>${escapeHtml(record.at)}</small>` : ''}</span>`;
                    }).join('')}
                  </div>
                  <button class="button button-secondary button-block" data-action="open-approval" data-id="${escapeHtml(item.id)}">${item.status === 'pending' ? '查看并处理' : '查看详情'}</button>
                </div>
              </article>
            `;
          }).join('') || '<div class="empty-state"><strong>当前筛选下没有事项</strong><p>切换审核状态查看历史记录。</p></div>'}
        </section>
      </div>
    `;
    return {
      body,
      review: reviewPanel('审核发布：权限分离可验证', '切换顶部“评审视角”，可验证提交人、部门审核人和平台管理员的按钮差异。', [
        { title: '审核规则', items: ['提交人不能审核本人事项。', '自营、生态标签分别由本部门审核人确认。', '共用标签必须完成两次独立确认。', '审计日志记录确认人、角色、时间与版本。'] },
        { title: '状态变化', items: ['所有变更先进入待审核，不直接修改生产配置。', '驳回后回到草稿，已生效版本不受影响。', '审核通过后仍需记录发布版本和生效时间。'] },
        { title: '演示方式', items: ['切换为“生态审核人”并打开共用标签，可完成其中一侧确认；再切换自营审核人完成另一侧。', '当前事项由本人提交时，系统会明确提示不能自审。'] }
      ])
    };
  }

  function renderSimulator() {
    const forms = `
      <form id="simulation-form" class="simulation-form">
        <div class="form-section-head"><div><h2>构造订单事实</h2><p>试算只读取当前已生效规则，不写入订单。</p></div><span class="environment-tag">DEMO</span></div>
        <div class="form-grid form-grid-2">
          <label class="field"><span>业务部门</span><select class="select" name="department"><option value="self" ${ui.simulatorDepartment === 'self' ? 'selected' : ''}>自营</option><option value="eco" ${ui.simulatorDepartment === 'eco' ? 'selected' : ''}>生态</option></select></label>
          <label class="field"><span>触发事件</span><select class="select" name="eventType">${state.eventCatalog.map((event) => `<option value="${escapeHtml(event.id)}">${escapeHtml(event.name)}</option>`).join('')}</select></label>
          <label class="field"><span>成交方式</span><select class="select" name="dealMethod">${CONDITION_VALUES.dealMethod.map((value) => `<option value="${escapeHtml(value.id)}">${escapeHtml(value.name)}</option>`).join('')}</select></label>
          <label class="field"><span>机器人来源</span><select class="select" name="robotSource"><option value="none">不涉及机器人</option>${CONDITION_VALUES.robotSource.map((value) => `<option value="${escapeHtml(value.id)}">${escapeHtml(value.name)}</option>`).join('')}</select></label>
          <label class="field"><span>业务类型</span><select class="select" name="businessType">${CONDITION_VALUES.businessType.map((value) => `<option value="${escapeHtml(value.id)}">${escapeHtml(value.name)}</option>`).join('')}</select></label>
          <label class="field"><span>渠道</span><select class="select" name="channel">${CONDITION_VALUES.channel.map((value) => `<option value="${escapeHtml(value.id)}">${escapeHtml(value.name)}</option>`).join('')}</select></label>
          <label class="field"><span>手机号群组</span><select class="select" name="phoneGroup">${CONDITION_VALUES.phoneGroup.map((value) => `<option value="${escapeHtml(value.id)}">${escapeHtml(value.name)}</option>`).join('')}</select></label>
          <label class="field"><span>物权 / 售后事件</span><select class="select" name="ownershipEvent">${CONDITION_VALUES.ownershipEvent.map((value) => `<option value="${escapeHtml(value.id)}">${escapeHtml(value.name)}</option>`).join('')}</select></label>
        </div>
        <div class="preset-row">
          <span>快速场景</span>
          <button type="button" data-action="preset" data-preset="self-robot">自营多机器人</button>
          <button type="button" data-action="preset" data-preset="eco-enterprise">生态企业购</button>
          <button type="button" data-action="preset" data-preset="eco-after-sale">生态售后退货</button>
          <button type="button" data-action="preset" data-preset="no-hit">无规则命中</button>
        </div>
        <button class="button button-primary button-block" type="submit">运行规则试算</button>
        <div class="form-footnote"><span>i</span>试算结果仅用于配置评审，不产生订单标签变更。</div>
      </form>
    `;

    const result = state.lastSimulation ? simulationResultMarkup(state.lastSimulation) : `
      <div class="simulation-empty">
        <div class="simulation-empty-graphic"><span>原始标签</span><i>→</i><span>规则匹配</span><i>→</i><span>当前标签</span></div>
        <h2>选择一组订单事实开始试算</h2>
        <p>结果将说明原始标签、全部命中候选、胜出规则、冲突状态与最终当前标签。</p>
      </div>
    `;

    const body = `
      <div class="view">
        ${pageHeader(
          'VALIDATION / 05',
          '规则试算与结果解释',
          '试算模拟一次订单事件，展示全部候选规则和唯一输出。它不追溯历史订单，也不修改订单当前标签。'
        )}
        <div class="simulator-layout">
          ${forms}
          <section class="simulation-result-panel">${result}</section>
        </div>

        <section class="coverage-grid">
          <article><span>已覆盖场景</span><strong>8 / 10</strong><p>覆盖机器人、企业购、渠道、手机号与售后物权事件。</p></article>
          <article><span>待补场景</span><strong>2</strong><p>存量未归类标签、跨部门共用规则仍需业务确认。</p></article>
          <article><span>执行边界</span><strong>只读</strong><p>试算不产生标签版本、事件流水或订单写入。</p></article>
        </section>
      </div>
    `;
    return {
      body,
      review: reviewPanel('规则试算：解释为什么命中', '本场景用于确认业务人员能理解“命中哪条、为什么胜出、为什么没命中”。', [
        { title: '结果结构', items: ['原始标签来自订单部门，不参与规则竞争。', '候选规则同时展示命中与未命中原因。', '最高优先级唯一规则胜出；冲突时不输出新标签。'] },
        { title: '关键验证', items: ['推荐依次运行“自营多机器人”“生态企业购”“生态售后退货”“无规则命中”四个预设。', '无命中时必须保留原始标签。', '试算记录只保存在浏览器中。'] },
        { title: '待确认', items: ['Q-002：除成交、渠道修正和物权生效外，哪些事件允许重新计算标签。', '规则冲突时的告警接收人尚未确定。'] }
      ])
    };
  }

  function simulationResultMarkup(result) {
    const winner = result.winner;
    return `
      <div class="result-header">
        <div><span>SIMULATION RESULT</span><h2>${result.conflict ? '检测到同优先级冲突' : winner ? '规则命中' : '未命中规则'}</h2></div>
        ${statusChip(result.conflict ? 'failed' : 'enabled', result.conflict ? '冲突阻断' : winner ? '可更新' : '保留原始')}
      </div>
      <div class="result-label-path">
        <div><span>原始业务标签</span><strong>${escapeHtml(result.originalLabel)}</strong><small>不可变</small></div>
        <i aria-hidden="true">→</i>
        <div class="is-current"><span>当前业务标签</span><strong>${escapeHtml(result.currentLabel)}</strong><small>${winner ? `${escapeHtml(winner.id)} · ${escapeHtml(winner.version)}` : '未命中，沿用原始标签'}</small></div>
      </div>
      <div class="result-facts">
        <span><b>事件</b>${escapeHtml(state.eventCatalog.find((event) => event.id === result.eventType)?.name || result.eventType)}</span>
        <span><b>部门</b>${escapeHtml(departmentName(result.department))}</span>
        <span><b>事件 ID</b>${escapeHtml(result.eventId)}</span>
        <span><b>试算时间</b>${escapeHtml(result.matchedAt)}</span>
      </div>
      <div class="candidate-list">
        <div class="candidate-list-head"><span>规则候选</span><span>优先级</span><span>匹配判断</span></div>
        ${result.candidates.length ? result.candidates.map(({ rule, matches, reasons }, index) => `
          <div class="candidate-row ${matches && index === 0 && !result.conflict ? 'is-winner' : ''}">
            <div><strong>${escapeHtml(rule.name)}</strong><small>${escapeHtml(rule.id)} → ${escapeHtml(findLabel(rule.targetLabelId)?.name || '未知标签')}</small></div>
            <span>${rule.priority}</span>
            <div>${matches ? '<span class="result-badge is-pass">条件全部满足</span>' : `<span class="result-badge">${escapeHtml(reasons.join('；') || '未生效')}</span>`}</div>
          </div>
        `).join('') : '<div class="empty-state is-inline"><strong>该部门暂无生效规则</strong><p>当前标签保持原始标签。</p></div>'}
      </div>
      <div class="result-note ${result.conflict ? 'is-danger' : ''}">
        <span>${result.conflict ? '!' : 'i'}</span>
        <p>${result.conflict ? `优先级 ${result.conflictRules[0]?.priority || '—'} 命中多条目标不同的规则：${result.conflictRules.map((rule) => rule.id).join('、')}。系统阻断该次更新并保留原当前标签。` : winner ? `系统选择最高优先级规则 ${escapeHtml(winner.id)}，输出唯一当前业务标签，并保存规则版本 ${escapeHtml(winner.version)}。` : '没有生效规则命中，当前标签回退为原始业务标签；订单成交和处理结果均正常。'}</p>
      </div>
    `;
  }

  function renderTrace() {
    const active = findTrace(ui.activeTrace) || state.traces[0];
    if (active) ui.activeTrace = active.orderNo;
    const pendingRepair = state.approvals.find((item) => item.type === 'manual' && item.subjectId === active?.orderNo && item.status === 'pending');
    const body = `
      <div class="view">
        ${pageHeader(
          'AUDIT / 06',
          '订单标签追溯',
          '同时查看原始标签、当前标签、全部命中候选和事件流水。人工修复只能创建审批事项，不能直接改写订单。'
        )}
        <div class="trace-layout">
          <aside class="trace-order-list">
            <div class="trace-order-head"><span>订单事件</span><b>${state.traces.length}</b></div>
            ${state.traces.map((trace) => `
              <button class="trace-order ${trace.orderNo === active?.orderNo ? 'is-active' : ''}" data-action="select-trace-detail" data-order="${escapeHtml(trace.orderNo)}">
                <span class="mono-cell">${escapeHtml(trace.orderNo)}</span>
                <strong>${escapeHtml(trace.currentLabel)}</strong>
                <small>${escapeHtml(trace.departmentName)} · ${escapeHtml(trace.status)} · ${escapeHtml(trace.updatedAt)}</small>
              </button>
            `).join('')}
          </aside>
          <section class="trace-detail">
            ${active ? `
              <div class="trace-detail-head">
                <div>
                  <div class="trace-order-title"><span class="mono-cell">${escapeHtml(active.orderNo)}</span>${departmentChip(active.department)}${active.status === '待人工修复' ? statusChip('failed', active.status) : statusChip('enabled', active.status)}</div>
                  <h2>${escapeHtml(active.currentLabel)}</h2>
                  <p>最近更新 ${escapeHtml(active.updatedAt)} · 原始标签永久保留</p>
                </div>
                ${active.status === '待人工修复' && !pendingRepair
                  ? `<button class="button button-primary" data-action="open-repair" data-order="${escapeHtml(active.orderNo)}" ${hasCapability('manual:submit') ? '' : 'disabled title="当前角色无异常修复权限"'}>发起异常修复</button>`
                  : pendingRepair ? `<span class="pending-repair-note">修复审批中 · ${escapeHtml(pendingRepair.id)}</span>` : ''}
              </div>
              <div class="trace-label-compare">
                <div><span>原始业务标签</span><strong>${escapeHtml(active.originalLabel)}</strong><small>成交时写入 · 不可变</small></div>
                <i>≠?</i>
                <div class="is-current"><span>当前业务标签</span><strong>${escapeHtml(active.currentLabel)}</strong><small>页面与报表使用值</small></div>
              </div>
              <div class="trace-context">
                <div><span>命中规则</span><strong>${escapeHtml(active.matchedRule)}</strong></div>
                <div><span>规则版本</span><strong>${escapeHtml(active.ruleVersion)}</strong></div>
                <div><span>处理状态</span><strong>${escapeHtml(active.status)}</strong></div>
              </div>
              <div class="trace-facts-panel">
                <h3>本次订单事实</h3>
                <div class="fact-chip-list">${active.facts.map((fact) => `<span>${escapeHtml(fact)}</span>`).join('')}</div>
              </div>
              <div class="trace-columns">
                <section class="timeline-panel">
                  <div class="panel-heading"><div><h3>事件时间线</h3><p>每次变化保留变更前后值和来源。</p></div></div>
                  <div class="label-timeline">
                    ${active.entries.map((entry, index) => `
                      <div class="timeline-item">
                        <div class="timeline-time">${escapeHtml(entry.time)}</div>
                        <span class="timeline-dot" aria-hidden="true"></span>
                        <div class="timeline-content">
                          <strong>${escapeHtml(entry.title)}</strong>
                          <p>${escapeHtml(entry.description)}</p>
                          <div class="timeline-change"><span>${escapeHtml(entry.before)}</span><i>→</i><b>${escapeHtml(entry.after)}</b></div>
                          <small>${escapeHtml(entry.source)}</small>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </section>
                <section class="candidate-panel">
                  <div class="panel-heading"><div><h3>未胜出 / 未命中原因</h3><p>用于解释为什么最终是当前标签。</p></div></div>
                  <div class="unmatched-list">
                    ${active.unmatched.length ? active.unmatched.map((item) => `
                      <div><span class="priority-cell is-small">${item.priority}</span><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.id)}</small><p>${escapeHtml(item.reason)}</p></div></div>
                    `).join('') : '<div class="empty-state is-inline"><strong>无其他候选规则</strong><p>该事件仅命中当前规则。</p></div>'}
                  </div>
                </section>
              </div>
            ` : '<div class="empty-state"><strong>暂无订单事件</strong><p>成交事件进入后可在此追溯。</p></div>'}
          </section>
        </div>
      </div>
    `;
    return {
      body,
      review: reviewPanel('订单追溯：证明结果从何而来', '本场景验证业务人员能否解释当前标签，并确认人工修复没有绕过审批。', [
        { title: '数据来源', items: ['原始标签来自部门成交事件。', '当前标签来自唯一胜出规则或经审批的人工修复。', '时间线保存事件 ID、规则 ID、版本与前后值。'] },
        { title: '操作边界', items: [`当前角色为「${currentRole().title}」。`, hasCapability('manual:submit') ? '可发起异常修复审批，但不会直接修改订单。' : '异常修复入口被禁用。', '已有待审批修复时不可重复提交。'] },
        { title: '待确认', items: ['Q-004：报表如何标识新旧口径切换时间。', 'Q-005：异常修复由谁发起、审核和执行。'] }
      ])
    };
  }

  function renderRuntime() {
    const roleRows = [
      ['自营配置人', '自营标签与规则', '创建草稿、提交审核、查看追溯', '可编辑'],
      ['生态配置人', '生态标签与规则', '创建草稿、提交审核、查看追溯', '可编辑'],
      ['自营 / 生态审核人', '本部门待审事项', '确认或驳回本部门事项', '不可审核本人提交内容'],
      ['平台管理员', '编码、共用标签、全局冲突', '复核共用标签与全局规则', '仍需遵守提交人分离'],
      ['运营异常处理人', '异常订单', '发起修复或重算申请', '不可直接修改标签'],
      ['业务只读', '标签、规则与订单追溯', '查看和筛选', '全部写操作隐藏或禁用']
    ];
    const body = `
      <div class="view">
        ${pageHeader(
          'RUNTIME / 07',
          '运行边界、状态与权限',
          '页面将业务硬约束、事件契约、异常兜底和角色权限放在同一评审场景，避免实现阶段重新猜测系统行为。'
        )}

        <section class="policy-grid">
          ${state.governancePolicies.map((policy) => `
            <article class="policy-card"><span>${escapeHtml(policy.id)}</span><h2>${escapeHtml(policy.title)}</h2><p>${escapeHtml(policy.detail)}</p><b>${escapeHtml(policy.level)}</b></article>
          `).join('')}
        </section>

        <section class="runtime-columns">
          <article class="content-panel">
            <div class="panel-heading"><div><h2>触发事件契约</h2><p>只有正式登记的事件可触发标签更新。</p></div></div>
            <div class="event-contract-list">
              ${state.eventCatalog.map((event) => `
                <div><code>${escapeHtml(event.id)}</code><div><strong>${escapeHtml(event.name)}</strong><p>${escapeHtml(event.description)}</p></div><span>${escapeHtml(event.scope)}</span></div>
              `).join('')}
            </div>
          </article>
          <article class="content-panel">
            <div class="panel-heading"><div><h2>订单处理状态</h2><p>标签处理失败不阻断成交。</p></div></div>
            <div class="state-machine">
              <div><span>01</span><strong>待处理</strong><p>事件已接收，尚未计算。</p></div>
              <i>→</i>
              <div><span>02</span><strong>计算中</strong><p>读取版本并匹配规则。</p></div>
              <i>→</i>
              <div class="is-success"><span>03</span><strong>已更新</strong><p>写入唯一当前标签。</p></div>
              <i>↘</i>
              <div class="is-danger"><span>04</span><strong>处理失败</strong><p>保留当前值并进入重试。</p></div>
              <i>→</i>
              <div class="is-warning"><span>05</span><strong>待修复</strong><p>运营提交审批修复。</p></div>
            </div>
          </article>
        </section>

        <section class="content-panel">
          <div class="panel-heading"><div><h2>角色权限矩阵</h2><p>写操作按身份与数据范围双重控制。</p></div><span class="current-role-hint">当前：${escapeHtml(currentRole().title)}</span></div>
          <div class="table-scroll">
            <div class="permission-table">
              <div class="permission-head"><span>角色</span><span>可见范围</span><span>允许操作</span><span>限制</span></div>
              ${roleRows.map((row) => `<div>${row.map((cell) => `<span>${escapeHtml(cell)}</span>`).join('')}</div>`).join('')}
            </div>
          </div>
        </section>

        <section class="content-panel">
          <div class="panel-heading"><div><h2>异常与审计流水</h2><p>业务异常与配置操作均进入可追溯记录。</p></div></div>
          <div class="table-scroll">
            <div class="data-table audit-table">
              <div class="data-table-head"><span>时间</span><span>操作者</span><span>动作</span><span>对象</span><span>结果</span></div>
              ${state.audits.map((audit) => `<div class="data-table-row"><span class="mono-cell">${escapeHtml(audit.time)}</span><span>${escapeHtml(audit.actor)}</span><span>${escapeHtml(audit.action)}</span><span>${escapeHtml(audit.object)}</span><span>${escapeHtml(audit.result)}</span></div>`).join('')}
            </div>
          </div>
        </section>
      </div>
    `;
    return {
      body,
      review: reviewPanel('运行与权限：实现不能自行补规则', '本场景用于研发和测试确认事件范围、异常兜底、幂等与权限边界。', [
        { title: '阻塞项', items: ['Q-002：成交后哪些事件允许重算。', 'Q-003：审核岗位与共用标签双审顺序。', 'Q-005：异常修复的发起、审核和执行责任人。'] },
        { title: '建议实现', items: ['幂等键：订单号 + 事件类型 + 事件 ID。', '配置发布与订单事件按事件发生时间取版本。', '标签服务失败只影响标签任务，不回滚订单成交。'] },
        { title: '待验证', items: ['重复事件是否能保持幂等。', '权限变化后已打开页面是否及时失效。', '规则回滚是否只影响未来事件。'] }
      ])
    };
  }

  function openDialog({ title, kicker, description = '', body, footer, size = '' }) {
    dialogContent.innerHTML = `
      <div class="dialog-shell ${size ? `is-${size}` : ''}">
        <div class="dialog-head">
          <div><span>${escapeHtml(kicker)}</span><h2>${escapeHtml(title)}</h2>${description ? `<p>${escapeHtml(description)}</p>` : ''}</div>
          <button class="dialog-close" type="button" data-dialog-close aria-label="关闭">×</button>
        </div>
        <div class="dialog-body">${body}</div>
        ${footer ? `<div class="dialog-foot">${footer}</div>` : ''}
      </div>
    `;
    if (!appDialog.open) appDialog.showModal();
  }

  function closeDialog() {
    if (appDialog.open) appDialog.close();
  }

  function showToast(title, message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'is-error' : ''}`;
    toast.innerHTML = `<span>${isError ? '!' : '✓'}</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p></div>`;
    toastRegion.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3600);
  }

  function openLabelDetail(labelId) {
    const label = findLabel(labelId);
    if (!label) return;
    const rules = labelRules(label.id);
    const body = `
      <div class="detail-summary">
        <div class="detail-title-row"><h3>${escapeHtml(label.name)}</h3>${statusChip(label.status)}</div>
        <code>${escapeHtml(label.code)}</code>
        <p>${escapeHtml(label.description)}</p>
      </div>
      <dl class="detail-grid">
        <div><dt>适用部门</dt><dd>${departmentChip(label.department)}</dd></div>
        <div><dt>标签分类</dt><dd>${escapeHtml(categoryMeta(label.categoryId).name)}</dd></div>
        <div><dt>责任人</dt><dd>${escapeHtml(label.owner || '待确认')}</dd></div>
        <div><dt>当前版本</dt><dd>${escapeHtml(label.version || '基础标签')}</dd></div>
        <div><dt>最近更新</dt><dd>${escapeHtml(label.updatedAt || '系统初始化')}</dd></div>
        <div><dt>规则引用</dt><dd>${rules.length} 条</dd></div>
      </dl>
      <section class="dialog-section"><h3>引用该标签的规则</h3>
        ${rules.length ? rules.map((rule) => `<div class="dialog-list-row"><span class="priority-cell is-small">${rule.priority}</span><div><strong>${escapeHtml(rule.name)}</strong><small>${escapeHtml(rule.id)} · ${escapeHtml(rule.version)}</small></div>${statusChip(rule.status)}</div>`).join('') : '<div class="empty-state is-inline"><strong>暂无规则引用</strong><p>标签审核通过后可被规则引用。</p></div>'}
      </section>
    `;
    openDialog({ title: '业务标签详情', kicker: 'LABEL DETAIL', description: '标签定义、状态与规则引用关系。', body, size: 'medium' });
  }

  function openLabelDialog(label = null) {
    if (!hasCapability('label:submit')) {
      showToast('无操作权限', `当前角色「${currentRole().title}」不能提交标签配置。`, true);
      return;
    }
    if (label && !canManageDepartment(label.department)) {
      showToast('超出数据范围', `当前角色「${currentRole().title}」只能维护本部门业务标签。`, true);
      return;
    }
    const editing = Boolean(label);
    const departmentOptions = DEPARTMENTS.filter((department) => canManageDepartment(department.id));
    const selectedDepartment = label?.department || departmentOptions[0]?.id || 'self';
    const body = `
      <form id="label-form" class="dialog-form" ${editing ? `data-id="${escapeHtml(label.id)}"` : ''}>
        <div class="form-grid form-grid-2">
          <label class="field"><span>标签名称 <b>*</b></span><input class="input" name="name" required maxlength="30" value="${escapeHtml(label?.name || '')}" placeholder="例如：买家-企业购" /></label>
          <label class="field"><span>标签编码 <b>*</b></span><input class="input mono" name="code" required maxlength="49" value="${escapeHtml(label?.code || '')}" placeholder="例如：BUYER_ENTERPRISE_PURCHASE" ${editing ? 'readonly' : ''} /></label>
          <label class="field"><span>适用部门 <b>*</b></span><select class="select" name="department">${departmentOptions.map((department) => `<option value="${department.id}" ${normalizeDepartment(selectedDepartment) === department.id ? 'selected' : ''}>${escapeHtml(department.name)}</option>`).join('')}</select></label>
          <label class="field"><span>标签分类 <b>*</b></span><select class="select" name="categoryId">${state.categories.map((category) => `<option value="${escapeHtml(category.id)}" ${label?.categoryId === category.id ? 'selected' : ''}>${escapeHtml(category.name)}</option>`).join('')}</select></label>
          <label class="field field-full"><span>责任人 <b>*</b></span><input class="input" name="owner" required maxlength="30" value="${escapeHtml(label?.owner || currentRole().title.replace('配置人', '运营'))}" placeholder="负责日常维护与异常响应" /></label>
          <label class="field field-full"><span>业务说明 <b>*</b></span><textarea class="textarea" name="description" required maxlength="200" placeholder="说明业务含义、适用边界和不适用场景">${escapeHtml(label?.description || '')}</textarea></label>
        </div>
        <div class="notice is-info"><span>i</span><p>标签编码发布后不可修改。提交后生成待审核版本，原生效版本继续使用。</p></div>
        <label class="checkbox-line"><input type="checkbox" checked disabled /><span>我确认该标签不替代原始业务标签，也不会直接修改历史订单。</span></label>
      </form>
    `;
    openDialog({
      title: editing ? '编辑业务标签' : '新增业务标签',
      kicker: 'LABEL CONFIGURATION',
      description: '所有字段将进入审核版本与审计记录。',
      body,
      footer: `<span class="dialog-foot-note">提交人：${escapeHtml(currentRole().name)} · ${escapeHtml(currentRole().title)}</span><div class="dialog-actions"><button class="button button-secondary" data-dialog-close>取消</button><button class="button button-primary" form="label-form" type="submit">提交审核</button></div>`,
      size: 'medium'
    });
  }

  function submitLabel(form) {
    const formData = new FormData(form);
    const editingId = form.dataset.id || '';
    const code = String(formData.get('code') || '').trim().toUpperCase();
    if (!/^[A-Z][A-Z0-9_]{3,48}$/.test(code)) {
      showToast('编码格式不正确', '请使用 4～49 位大写字母、数字和下划线，并以字母开头。', true);
      return;
    }
    const duplicate = [...state.baseLabels, ...state.labels].find((label) => label.code === code && label.id !== editingId);
    if (duplicate) {
      showToast('标签编码已存在', `与“${duplicate.name}”冲突，请更换编码。`, true);
      return;
    }
    const department = String(formData.get('department'));
    if (!canManageDepartment(department)) {
      showToast('超出数据范围', '当前角色不能维护该部门业务标签。', true);
      return;
    }
    const categoryId = String(formData.get('categoryId'));
    const previous = editingId ? findLabel(editingId) : null;
    const label = {
      id: editingId || `tag_${Date.now()}`,
      code,
      name: String(formData.get('name')).trim(),
      department,
      categoryId,
      description: String(formData.get('description')).trim(),
      owner: String(formData.get('owner')).trim(),
      status: 'pending',
      version: previous ? incrementVersion(previous.version) : 'v0.1',
      updatedAt: nowLabel(),
      ruleIds: previous?.ruleIds || []
    };
    if (editingId) {
      const index = state.labels.findIndex((item) => item.id === editingId);
      state.labels[index] = label;
    } else {
      state.labels.unshift(label);
    }
    state.approvals.unshift({
      id: nextApprovalId(),
      type: 'label',
      title: label.name,
      subjectId: label.id,
      department,
      submitter: currentRole().name,
      submitterRole: currentRole().title,
      submittedAt: nowLabel(),
      status: 'pending',
      summary: editingId ? `修改业务标签定义并提交 ${label.version}。` : `新增业务标签 ${label.code}。`,
      impact: '审核通过后仅允许新规则引用；不修改历史订单标签。',
      conflicts: 0,
      requiredApprovals: department === 'shared' ? ['自营审核人', '生态审核人'] : [department === 'self' ? '自营审核人' : '生态审核人'],
      approvals: []
    });
    saveState();
    closeDialog();
    render();
    showToast('已提交审核', `${label.name} 已进入审核与发布队列。`);
  }

  function incrementVersion(version) {
    const match = String(version || 'v1.0').match(/v(\d+)\.(\d+)/);
    return match ? `v${match[1]}.${Number(match[2]) + 1}` : 'v1.1';
  }

  function nextApprovalId() {
    return `AP-${String(state.approvals.length + 1).padStart(3, '0')}`;
  }

  function openDisableDialog(label) {
    if (!label) return;
    const references = state.rules.filter((rule) => rule.targetLabelId === label.id && rule.status === 'enabled');
    if (references.length) {
      showToast('不能直接停用', `该标签仍被 ${references.length} 条生效规则引用，请先处理规则。`, true);
      return;
    }
    openDialog({
      title: '提交标签停用申请',
      kicker: 'CHANGE REQUEST',
      description: '停用不会改写历史订单，审核通过后才停止新引用。',
      body: `<div class="notice is-warning"><span>!</span><p><strong>${escapeHtml(label.name)}</strong><br />停用后不能继续被新规则引用；已有订单快照和历史报表保持不变。</p></div>`,
      footer: `<span class="dialog-foot-note">提交后进入统一审核队列。</span><div class="dialog-actions"><button class="button button-secondary" data-dialog-close>取消</button><button class="button button-danger" data-action="confirm-disable" data-id="${escapeHtml(label.id)}">提交停用审核</button></div>`,
      size: 'small'
    });
  }

  function submitDisable(labelId) {
    const label = findLabel(labelId);
    if (!label) return;
    state.approvals.unshift({
      id: nextApprovalId(),
      type: 'label',
      title: `停用：${label.name}`,
      subjectId: label.id,
      department: label.department,
      submitter: currentRole().name,
      submitterRole: currentRole().title,
      submittedAt: nowLabel(),
      status: 'pending',
      summary: `停用业务标签 ${label.code}。`,
      impact: '历史订单保持不变；停用后不再允许新规则引用。',
      conflicts: 0,
      requiredApprovals: normalizeDepartment(label.department) === 'shared' ? ['自营审核人', '生态审核人'] : [normalizeDepartment(label.department) === 'self' ? '自营审核人' : '生态审核人'],
      approvals: [],
      operation: 'disable'
    });
    saveState();
    closeDialog();
    render();
    showToast('停用申请已提交', '审核通过后标签才会停止使用。');
  }

  function fieldOptions(field, selected = '') {
    return (CONDITION_VALUES[field] || []).map((value) => `<option value="${escapeHtml(value.id)}" ${value.id === selected ? 'selected' : ''}>${escapeHtml(value.name)}</option>`).join('');
  }

  function targetLabelOptions(department, selected = '') {
    const normalized = normalizeDepartment(department);
    return state.labels
      .filter((label) => ['enabled', 'pending'].includes(label.status))
      .filter((label) => normalizeDepartment(label.department) === normalized || normalizeDepartment(label.department) === 'shared')
      .map((label) => `<option value="${escapeHtml(label.id)}" ${label.id === selected ? 'selected' : ''}>${escapeHtml(label.name)} · ${escapeHtml(label.code)} · ${escapeHtml(departmentName(label.department))}</option>`)
      .join('');
  }

  function openRuleDialog() {
    if (!hasCapability('rule:submit')) {
      showToast('无操作权限', `当前角色「${currentRole().title}」不能提交规则。`, true);
      return;
    }
    const departmentOptions = ['self', 'eco'].filter((department) => canManageDepartment(department));
    const initialDepartment = departmentOptions[0] || 'self';
    const body = `
      <form id="rule-form" class="dialog-form">
        <div class="form-grid form-grid-3">
          <label class="field field-span-2"><span>规则名称 <b>*</b></span><input class="input" name="name" required maxlength="40" placeholder="例如：生态平台兜底成交" /></label>
          <label class="field"><span>优先级 <b>*</b></span><input class="input mono" name="priority" type="number" min="1" max="999" value="250" required /></label>
          <label class="field"><span>适用部门 <b>*</b></span><select class="select" name="department">${departmentOptions.map((department) => `<option value="${department}" ${department === initialDepartment ? 'selected' : ''}>${escapeHtml(departmentName(department))}</option>`).join('')}</select></label>
          <label class="field field-span-2"><span>目标业务标签 <b>*</b></span><select class="select" name="targetLabelId">${targetLabelOptions(initialDepartment)}</select></label>
        </div>
        <section class="condition-builder">
          <div class="condition-builder-head"><div><h3>命中条件</h3><p>条件之间为“且”。首期每条规则最多 3 个受控条件。</p></div><span>ALL CONDITIONS</span></div>
          <div class="condition-row">
            <select class="select" name="condition1Field">${CONDITION_FIELDS.map((field) => `<option value="${field.id}">${escapeHtml(field.name)}</option>`).join('')}</select>
            <select class="select" name="condition1Value" data-condition-value="condition1Field">${fieldOptions('dealMethod', 'robot')}</select>
            <span>必填</span>
          </div>
          <div class="condition-row">
            <select class="select" name="condition2Field"><option value="">不添加条件</option>${CONDITION_FIELDS.map((field) => `<option value="${field.id}">${escapeHtml(field.name)}</option>`).join('')}</select>
            <select class="select" name="condition2Value" data-condition-value="condition2Field"><option value="">请选择</option>${fieldOptions('robotSource', 'self_multi')}</select>
            <span>可选</span>
          </div>
          <div class="condition-row">
            <select class="select" name="condition3Field"><option value="">不添加条件</option>${CONDITION_FIELDS.map((field) => `<option value="${field.id}">${escapeHtml(field.name)}</option>`).join('')}</select>
            <select class="select" name="condition3Value" data-condition-value="condition3Field"><option value="">请选择</option>${fieldOptions('businessType', 'normal')}</select>
            <span>可选</span>
          </div>
        </section>
        <div class="live-rule-check" id="live-rule-check">
          <span>LIVE CHECK</span><strong>选择配置后实时检查冲突</strong><p>同部门、同优先级且条件可重叠时，目标标签不同将阻止提交。</p>
        </div>
        <label class="checkbox-line"><input type="checkbox" checked disabled /><span>规则发布后仅影响新订单及后续事件，不回溯计算历史订单。</span></label>
      </form>
    `;
    openDialog({
      title: '新建标签规则',
      kicker: 'RULE BUILDER',
      description: '规则进入审核队列后不会立即生效。',
      body,
      footer: `<span class="dialog-foot-note">提交后执行编码、冲突和标签状态检查。</span><div class="dialog-actions"><button class="button button-secondary" data-dialog-close>取消</button><button class="button button-primary" type="submit" form="rule-form">提交规则审核</button></div>`,
      size: 'large'
    });
  }

  function selectedRuleConditions(form) {
    const data = new FormData(form);
    const conditions = [];
    for (let index = 1; index <= 3; index += 1) {
      const field = String(data.get(`condition${index}Field`) || '');
      const value = String(data.get(`condition${index}Value`) || '');
      if (field && value) conditions.push({ field, value });
    }
    return conditions;
  }

  function updateRuleCheck(form) {
    const data = new FormData(form);
    const department = String(data.get('department') || 'self');
    const priority = Number(data.get('priority') || 0);
    const targetLabelId = String(data.get('targetLabelId') || '');
    const conditions = selectedRuleConditions(form);
    const conflicts = conditions.length ? conflictsForRule(department, priority, targetLabelId, conditions) : [];
    const target = findLabel(targetLabelId);
    const targetValid = target && ['enabled', 'pending'].includes(target.status)
      && [normalizeDepartment(department), 'shared'].includes(normalizeDepartment(target.department));
    const panel = document.getElementById('live-rule-check');
    if (!panel) return;
    panel.classList.toggle('has-conflict', conflicts.length > 0 || !targetValid);
    panel.innerHTML = `<span>LIVE CHECK</span><strong>${escapeHtml(departmentName(department))} · 优先级 ${priority || '—'} → ${escapeHtml(target?.name || '未选择标签')}</strong><p>${conditions.length ? escapeHtml(conditionsText(conditions)) : '尚未设置完整条件'}</p><div class="${conflicts.length || !targetValid ? 'is-danger' : 'is-success'}">${!targetValid ? '目标标签不可用或不属于该部门，请重新选择' : conflicts.length ? `发现 ${conflicts.length} 条冲突：${conflicts.map((rule) => rule.id).join('、')}` : '冲突检查通过，可继续提交审核'}</div>`;
  }

  function updateRuleTargetOptions(form) {
    const department = String(form.elements.department?.value || 'self');
    const targetSelect = form.elements.targetLabelId;
    if (!targetSelect) return;
    const previous = targetSelect.value;
    targetSelect.innerHTML = targetLabelOptions(department, previous);
  }

  function submitRule(form) {
    const data = new FormData(form);
    const department = String(data.get('department'));
    const priority = Number(data.get('priority'));
    const targetLabelId = String(data.get('targetLabelId'));
    const conditions = selectedRuleConditions(form);
    const target = findLabel(targetLabelId);
    if (!canManageDepartment(department)) {
      showToast('超出数据范围', '当前角色不能维护该部门规则。', true);
      return;
    }
    if (!target || !['enabled', 'pending'].includes(target.status)
      || ![normalizeDepartment(department), 'shared'].includes(normalizeDepartment(target.department))) {
      showToast('目标标签不可用', '目标标签必须已生效或待审核，并且属于当前部门或为两部门共用标签。', true);
      return;
    }
    if (!conditions.length) {
      showToast('条件不完整', '至少设置一个完整命中条件。', true);
      return;
    }
    const conflicts = conflictsForRule(department, priority, targetLabelId, conditions);
    if (conflicts.length) {
      showToast('冲突阻断', `同优先级冲突：${conflicts.map((rule) => rule.id).join('、')}`, true);
      return;
    }
    const ruleId = `R-NEW-${String(state.rules.length + 1).padStart(2, '0')}`;
    const rule = {
      id: ruleId,
      name: String(data.get('name')).trim(),
      department,
      targetLabelId,
      priority,
      status: 'pending',
      version: 'v0.1',
      updatedAt: nowLabel(),
      conditions
    };
    state.rules.unshift(rule);
    state.approvals.unshift({
      id: nextApprovalId(),
      type: 'rule',
      title: rule.name,
      subjectId: rule.id,
      department,
      submitter: currentRole().name,
      submitterRole: currentRole().title,
      submittedAt: nowLabel(),
      status: 'pending',
      summary: `新增规则并输出“${findLabel(targetLabelId)?.name || targetLabelId}”。`,
      impact: '审核通过后仅影响新订单及后续事件。',
      conflicts: 0,
      requiredApprovals: [department === 'self' ? '自营审核人' : '生态审核人'],
      approvals: []
    });
    saveState();
    closeDialog();
    render();
    showToast('规则已提交', `${rule.name} 已进入审核与发布队列。`);
  }

  function openRuleDetail(ruleId) {
    const rule = findRule(ruleId);
    if (!rule) return;
    const body = `
      <div class="detail-summary">
        <div class="detail-title-row"><h3>${escapeHtml(rule.name)}</h3>${statusChip(rule.status)}</div>
        <code>${escapeHtml(rule.id)} · ${escapeHtml(rule.version)}</code>
        <p>${escapeHtml(conditionsText(rule.conditions))}</p>
      </div>
      <div class="rule-detail-flow">
        <div><span>适用部门</span><strong>${escapeHtml(departmentName(rule.department))}</strong></div>
        <i>→</i>
        <div><span>优先级</span><strong>${rule.priority}</strong></div>
        <i>→</i>
        <div><span>输出标签</span><strong>${escapeHtml(findLabel(rule.targetLabelId)?.name || '未知')}</strong></div>
      </div>
      <section class="dialog-section"><h3>命中条件</h3><div class="condition-list">${conditionsChips(rule.conditions)}</div></section>
      <dl class="detail-grid">
        <div><dt>状态</dt><dd>${statusChip(rule.status)}</dd></div>
        <div><dt>版本</dt><dd>${escapeHtml(rule.version)}</dd></div>
        <div><dt>最近更新</dt><dd>${escapeHtml(rule.updatedAt)}</dd></div>
        <div><dt>生效范围</dt><dd>新订单及后续登记事件</dd></div>
      </dl>
    `;
    openDialog({ title: '标签规则详情', kicker: 'RULE DETAIL', description: '规则定义与当前发布状态。', body, size: 'medium' });
  }

  function openApproval(approvalId) {
    const item = findApproval(approvalId);
    if (!item) return;
    const required = approvalRolesFor(item);
    const pendingRoles = required.filter((role) => !item.approvals.some((approval) => approval.role === role));
    const isOwnSubmission = item.submitter === currentRole().name;
    const approvableRoles = pendingRoles.filter((role) => {
      if (isOwnSubmission) return false;
      return canApproveDepartment(approvalRoleKey(role));
    });
    const typeName = item.type === 'label' ? '标签配置' : item.type === 'rule' ? '规则配置' : '订单异常修复';
    const body = `
      <div class="approval-detail-hero">
        <div><span class="approval-type is-${escapeHtml(item.type)}">${typeName}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p></div>
        ${statusChip(item.status)}
      </div>
      <div class="approval-detail-meta">
        <div><span>适用部门</span>${departmentChip(item.department)}</div>
        <div><span>提交人</span><strong>${escapeHtml(item.submitter)}${item.submitterRole ? ` · ${escapeHtml(item.submitterRole)}` : ''}</strong></div>
        <div><span>提交时间</span><strong>${escapeHtml(item.submittedAt)}</strong></div>
        <div><span>影响范围</span><strong>${escapeHtml(item.impact)}</strong></div>
      </div>
      <section class="dialog-section">
        <h3>审核确认进度</h3>
        <div class="approval-role-timeline">
          ${required.map((role) => {
            const record = item.approvals.find((approval) => approval.role === role);
            return `<div class="${record ? 'is-done' : ''}"><span>${record ? '✓' : '·'}</span><div><strong>${escapeHtml(role)}</strong><p>${record ? `${escapeHtml(record.user)} 于 ${escapeHtml(record.at)} 确认` : '等待独立确认'}</p></div></div>`;
          }).join('')}
        </div>
      </section>
      <section class="dialog-section">
        <h3>发布检查</h3>
        <div class="check-list">
          <div><span>✓</span><p>编码与配置格式检查通过</p></div>
          <div><span>✓</span><p>${item.conflicts ? `${item.conflicts} 条冲突，发布被阻断` : '同优先级规则冲突检查通过'}</p></div>
          <div><span>✓</span><p>默认不追溯历史订单，仅影响新订单及后续事件</p></div>
          <div><span>✓</span><p>操作将记录提交、审核、发布和前后版本差异</p></div>
        </div>
      </section>
      ${item.submitter === currentRole().name ? '<div class="notice is-warning"><span>!</span><p>当前事项由你提交，系统禁止审核本人事项。请切换为独立审核人。</p></div>' : ''}
    `;
    const actionButtons = item.status === 'pending'
      ? `<button class="button button-danger" data-action="reject-approval" data-id="${escapeHtml(item.id)}" ${approvableRoles.length ? '' : 'disabled'}>驳回</button>${approvableRoles.map((role) => `<button class="button button-primary" data-action="approve-approval" data-id="${escapeHtml(item.id)}" data-role="${escapeHtml(role)}">以${escapeHtml(role.replace('审核人', ''))}身份同意</button>`).join('') || `<button class="button button-primary" disabled>当前角色不可审核</button>`}`
      : '<button class="button button-secondary" data-dialog-close>关闭</button>';
    openDialog({
      title: '审核事项详情',
      kicker: `${escapeHtml(item.id)} / REVIEW`,
      description: '确认差异、影响范围与独立审核进度后再决定是否发布。',
      body,
      footer: `<span class="dialog-foot-note">当前视角：${escapeHtml(currentRole().title)}</span><div class="dialog-actions">${actionButtons}</div>`,
      size: 'large'
    });
  }

  function approveApproval(itemId, role) {
    const item = findApproval(itemId);
    if (!item || item.status !== 'pending') return;
    if (item.submitter === currentRole().name) {
      showToast('禁止自审', '提交人不能审核本人提交的事项。', true);
      return;
    }
    if (!approvalRolesFor(item).includes(role)) {
      showToast('审核角色不匹配', '该事项不需要当前审核角色确认。', true);
      return;
    }
    if (!canApproveDepartment(approvalRoleKey(role))) {
      showToast('权限不足', '当前角色不能替代本部门审核人确认。', true);
      return;
    }
    if (item.approvals.some((approval) => approval.role === role)) {
      showToast('已完成确认', '该审核角色已确认，无需重复操作。');
      return;
    }
    item.approvals.push({ role, user: currentRole().name, at: nowLabel() });
    const complete = approvalRolesFor(item).every((requiredRole) => item.approvals.some((approval) => approval.role === requiredRole));
    if (complete) {
      item.status = 'approved';
      publishApprovalSubject(item);
      showToast('审核完成并发布', `${item.title} 已完成全部确认，自本次发布后生效。`);
    } else {
      showToast('本部门确认已记录', '还需完成其他部门的独立确认。');
    }
    state.audits.unshift({ id: `AU-${1049 + state.audits.length}`, time: nowLabel(), actor: currentRole().name, action: '审核确认', object: `${item.id} · ${item.title}`, result: complete ? '已发布' : `${role}已确认` });
    saveState();
    closeDialog();
    render();
  }

  function publishApprovalSubject(item) {
    if (item.type === 'rule') {
      const rule = findRule(item.subjectId);
      if (rule) {
        rule.status = 'enabled';
        rule.version = incrementVersion(rule.version);
        rule.updatedAt = nowLabel();
      }
    }
    if (item.type === 'label') {
      const label = state.labels.find((candidate) => candidate.id === item.subjectId);
      if (label) {
        label.status = item.operation === 'disable' ? 'disabled' : 'enabled';
        label.updatedAt = nowLabel();
      }
    }
    if (item.type === 'manual') {
      const trace = findTrace(item.subjectId);
      if (trace) {
        trace.currentLabel = item.targetLabel || '多个机器人';
        trace.matchedRule = `人工修复 · ${item.repairSource || 'R-001'}`;
        trace.ruleVersion = item.repairVersion || 'v1.2';
        trace.status = '已修复';
        trace.updatedAt = nowLabel();
        trace.entries.push({ time: nowTime(), title: '人工修复生效', description: '审批完成，仅更新当前业务标签。', before: trace.originalLabel, after: trace.currentLabel, source: `${item.id} · 审批通过` });
      }
    }
  }

  function rejectApproval(itemId) {
    const item = findApproval(itemId);
    if (!item || item.status !== 'pending') return;
    if (item.submitter === currentRole().name) {
      showToast('禁止自审', '提交人不能驳回本人提交的事项。', true);
      return;
    }
    const canReject = approvalRolesFor(item)
      .filter((role) => !item.approvals.some((approval) => approval.role === role))
      .some((role) => canApproveDepartment(approvalRoleKey(role)));
    if (!canReject) {
      showToast('权限不足', '当前角色不能驳回该事项。', true);
      return;
    }
    item.status = 'rejected';
    item.rejectedBy = currentRole().name;
    item.rejectedAt = nowLabel();
    if (item.type === 'rule') {
      const rule = findRule(item.subjectId);
      if (rule) rule.status = 'draft';
    }
    if (item.type === 'label' && item.operation !== 'disable') {
      const label = state.labels.find((candidate) => candidate.id === item.subjectId);
      if (label) label.status = 'draft';
    }
    state.audits.unshift({ id: `AU-${1049 + state.audits.length}`, time: nowLabel(), actor: currentRole().name, action: '驳回审核', object: `${item.id} · ${item.title}`, result: '退回草稿' });
    saveState();
    closeDialog();
    render();
    showToast('已驳回', `${item.title} 已退回修改，原生效版本不受影响。`);
  }

  function openRepairDialog(trace) {
    if (!trace || !hasCapability('manual:submit')) {
      showToast('无操作权限', '当前角色不能发起异常修复。', true);
      return;
    }
    const body = `
      <div class="repair-order-summary">
        <span class="mono-cell">${escapeHtml(trace.orderNo)}</span>
        <strong>${escapeHtml(trace.currentLabel)}</strong>
        <p>${trace.facts.map((fact) => escapeHtml(fact)).join(' · ')}</p>
      </div>
      <form id="repair-form" data-order="${escapeHtml(trace.orderNo)}" class="dialog-form">
        <label class="field"><span>目标当前业务标签 <b>*</b></span><select class="select" name="targetLabelId">${state.labels.filter((label) => label.status === 'enabled' && normalizeDepartment(label.department) === normalizeDepartment(trace.department)).map((label) => `<option value="${escapeHtml(label.id)}">${escapeHtml(label.name)} · ${escapeHtml(label.code)}</option>`).join('')}</select></label>
        <label class="field"><span>修复原因 <b>*</b></span><textarea class="textarea" name="reason" required minlength="8" maxlength="200" placeholder="说明异常原因、证据与修复依据"></textarea></label>
        <div class="notice is-warning"><span>!</span><p>原始标签 <strong>${escapeHtml(trace.originalLabel)}</strong> 不会被修改。审批通过后仅更新当前业务标签并记录审批编号。</p></div>
      </form>
    `;
    openDialog({
      title: '发起异常修复',
      kicker: 'MANUAL REPAIR',
      description: '人工变更必须经过独立审核，提交后订单保持原值。',
      body,
      footer: `<span class="dialog-foot-note">提交人：${escapeHtml(currentRole().name)}</span><div class="dialog-actions"><button class="button button-secondary" data-dialog-close>取消</button><button class="button button-primary" form="repair-form" type="submit">提交修复审批</button></div>`,
      size: 'medium'
    });
  }

  function submitRepair(form) {
    const trace = findTrace(form.dataset.order);
    if (!trace) return;
    const data = new FormData(form);
    const targetLabel = findLabel(String(data.get('targetLabelId')));
    const reason = String(data.get('reason')).trim();
    const approvalId = nextApprovalId();
    state.approvals.unshift({
      id: approvalId,
      type: 'manual',
      title: `${trace.orderNo} 异常修复`,
      subjectId: trace.orderNo,
      department: trace.department,
      submitter: currentRole().name,
      submitterRole: currentRole().title,
      submittedAt: nowLabel(),
      status: 'pending',
      summary: `将当前业务标签从“${trace.currentLabel}”修复为“${targetLabel?.name || '目标标签'}”。`,
      impact: `仅修改该订单当前标签；原始标签“${trace.originalLabel}”保持不变。`,
      conflicts: 0,
      requiredApprovals: [normalizeDepartment(trace.department) === 'self' ? '自营审核人' : '生态审核人'],
      approvals: [],
      targetLabel: targetLabel?.name,
      targetLabelId: targetLabel?.id,
      repairSource: 'R-001',
      repairVersion: 'v1.2',
      reason
    });
    trace.status = '待审批修复';
    trace.updatedAt = nowLabel();
    trace.entries.push({ time: nowTime(), title: '提交异常修复', description: reason, before: trace.currentLabel, after: trace.currentLabel, source: `${approvalId} · 待审核` });
    saveState();
    closeDialog();
    render();
    showToast('修复申请已提交', '审批通过前，订单当前标签保持不变。');
  }

  function openResetDialog() {
    openDialog({
      title: '重置演示数据',
      kicker: 'DEMO RESET',
      description: '仅清除当前浏览器中的评审操作。',
      body: '<div class="notice is-warning"><span>!</span><p>新增标签、规则、审核结果和修复事项将恢复为初始脱敏数据。</p></div>',
      footer: '<span class="dialog-foot-note">不连接真实业务系统。</span><div class="dialog-actions"><button class="button button-secondary" data-dialog-close>取消</button><button class="button button-danger" data-action="confirm-reset">确认重置</button></div>',
      size: 'small'
    });
  }

  function applyPreset(preset) {
    const form = document.getElementById('simulation-form');
    if (!form) return;
    const presets = {
      'self-robot': { department: 'self', eventType: 'ORDER_WON', dealMethod: 'robot', robotSource: 'self_multi', businessType: 'normal', channel: 'normal', phoneGroup: 'none', ownershipEvent: 'deal_only' },
      'eco-enterprise': { department: 'eco', eventType: 'ORDER_WON', dealMethod: 'manual', robotSource: 'none', businessType: 'enterprise_purchase', channel: 'normal', phoneGroup: 'none', ownershipEvent: 'deal_only' },
      'eco-after-sale': { department: 'eco', eventType: 'OWNERSHIP_EFFECTIVE', dealMethod: 'manual', robotSource: 'none', businessType: 'normal', channel: 'normal', phoneGroup: 'none', ownershipEvent: 'after_sale_effective' },
      'no-hit': { department: 'self', eventType: 'ORDER_WON', dealMethod: 'manual', robotSource: 'none', businessType: 'normal', channel: 'normal', phoneGroup: 'none', ownershipEvent: 'deal_only' }
    };
    const values = presets[preset];
    Object.entries(values).forEach(([name, value]) => {
      if (form.elements[name]) form.elements[name].value = value;
    });
    ui.simulatorDepartment = values.department;
    showToast('场景已载入', '点击“运行规则试算”查看最终结果。');
  }

  function handleClick(element) {
    const action = element.dataset.action;
    if (action === 'go-view') goTo(element.dataset.view);
    if (action === 'open-label') openLabelDialog();
    if (action === 'edit-label') openLabelDialog(findLabel(element.dataset.id));
    if (action === 'open-label-detail') openLabelDetail(element.dataset.id);
    if (action === 'disable-label') openDisableDialog(findLabel(element.dataset.id));
    if (action === 'confirm-disable') submitDisable(element.dataset.id);
    if (action === 'label-filter-department') { ui.labelDepartment = element.dataset.value; ui.labelStatus = 'all'; render(); }
    if (action === 'label-filter-status') { ui.labelStatus = element.dataset.value; render(); }
    if (action === 'filter-category-labels') { ui.labelDepartment = 'all'; ui.labelStatus = 'all'; ui.labelQuery = ''; goTo('labels'); }
    if (action === 'rule-filter-department') { ui.ruleDepartment = element.dataset.value; render(); }
    if (action === 'rule-filter-status') { ui.ruleStatus = element.dataset.value; render(); }
    if (action === 'open-rule') openRuleDialog();
    if (action === 'open-rule-detail') openRuleDetail(element.dataset.id);
    if (action === 'approval-filter') { ui.approvalStatus = element.dataset.value; render(); }
    if (action === 'open-approval') openApproval(element.dataset.id);
    if (action === 'approve-approval') approveApproval(element.dataset.id, element.dataset.role);
    if (action === 'reject-approval') rejectApproval(element.dataset.id);
    if (action === 'select-trace') { ui.activeTrace = element.dataset.order; goTo('trace'); }
    if (action === 'select-trace-detail') { ui.activeTrace = element.dataset.order; render(); }
    if (action === 'open-repair') openRepairDialog(findTrace(element.dataset.order));
    if (action === 'preset') applyPreset(element.dataset.preset);
    if (action === 'reset-demo') openResetDialog();
    if (action === 'confirm-reset') {
      state = createDefaultState();
      saveState();
      closeDialog();
      render();
      showToast('演示数据已重置', '已恢复初始脱敏配置。');
    }
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-dialog-close]')) {
      closeDialog();
      return;
    }
    const actionElement = event.target.closest('[data-action]');
    if (actionElement && !actionElement.disabled) {
      event.preventDefault();
      handleClick(actionElement);
    }
  });

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (form.id === 'label-form') {
      event.preventDefault();
      submitLabel(form);
    }
    if (form.id === 'rule-form') {
      event.preventDefault();
      submitRule(form);
    }
    if (form.id === 'simulation-form') {
      event.preventDefault();
      const facts = Object.fromEntries(new FormData(form).entries());
      ui.simulatorDepartment = facts.department;
      state.lastSimulation = simulate(facts, facts.eventType);
      saveState();
      render();
      document.querySelector('.simulation-result-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (form.id === 'repair-form') {
      event.preventDefault();
      submitRepair(form);
    }
  });

  document.addEventListener('input', (event) => {
    if (event.target.id === 'label-search') {
      ui.labelQuery = event.target.value;
      const cursor = event.target.selectionStart;
      render();
      const input = document.getElementById('label-search');
      if (input) {
        input.focus();
        input.setSelectionRange(cursor, cursor);
      }
    }
  });

  document.addEventListener('change', (event) => {
    if (event.target.id === 'role-switcher') {
      state.currentRoleId = event.target.value;
      saveState();
      render();
      showToast('评审视角已切换', `当前身份：${currentRole().title} · ${currentRole().name}`);
    }
    if (event.target.matches('#rule-form [name="department"]')) {
      updateRuleTargetOptions(event.target.form);
    }
    if (event.target.matches('[data-condition-value]')) {
      const valueSelect = event.target;
      const fieldName = valueSelect.dataset.conditionValue;
      const fieldSelect = valueSelect.form?.elements[fieldName];
      if (!fieldSelect) return;
      const selectedField = fieldSelect.value;
      const previous = valueSelect.value;
      valueSelect.innerHTML = selectedField
        ? `${fieldOptions(selectedField, previous)}`
        : '<option value="">请选择</option>';
    }
    if (event.target.closest('#rule-form')) updateRuleCheck(event.target.closest('#rule-form'));
  });

  appDialog.addEventListener('click', (event) => {
    if (event.target === appDialog) closeDialog();
  });

  window.addEventListener('hashchange', render);

  render();
})();
