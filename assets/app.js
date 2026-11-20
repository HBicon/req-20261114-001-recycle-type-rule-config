(() => {
  'use strict';

  const STORAGE_KEY = 'business-label-governance-v12';

  const DEPARTMENTS = [
    { id: 'self', name: '自营', originalLabel: '闪回-闪回成交', color: 'green' },
    { id: 'eco', name: '生态', aliases: ['buyer'], originalLabel: '买家-买家成交', color: 'blue' }
  ];

  const LABEL_DEPARTMENT_OPTIONS = DEPARTMENTS.filter((department) => ['self', 'eco'].includes(department.id));

  const CONDITION_FIELDS = [
    { id: 'dealMethod', name: '成交方式' },
    { id: 'robotSource', name: '机器人来源' },
    { id: 'businessType', name: '业务类型' },
    { id: 'channel', name: '渠道' },
    { id: 'phoneGroup', name: '手机号群组' },
    { id: 'ownershipEvent', name: '物权 / 售后事件' },
    { id: 'statisticsMode', name: '订单统计模式' },
    { id: 'currentOwner', name: '当前货物归属' }
  ];

  const STATISTICS_MODES = [
    {
      id: 'buyer_won',
      name: '买家中标订单',
      description: '成交归属与当前货物归属一致，且中标方为买家。',
      tone: 'blue',
      priority: '基础归因'
    },
    {
      id: 'non_buyer_won',
      name: '非买家中标订单',
      description: '成交归属与当前货物归属一致，且中标方不是买家。',
      tone: 'green',
      priority: '基础归因'
    },
    {
      id: 'self_to_eco',
      name: '自营扭转为生态',
      description: '成交归属或初始货物归属为自营，当前货物归属已变为生态。',
      tone: 'amber',
      priority: '扭转优先'
    },
    {
      id: 'eco_to_self',
      name: '生态扭转为自营',
      description: '成交归属或初始货物归属为生态，当前货物归属已变为自营。',
      tone: 'green',
      priority: '扭转优先'
    }
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
      { id: 'after_sale_effective', name: '售后物权已生效' },
      { id: 'active_transfer', name: '货物归属主动转移生效' }
    ],
    statisticsMode: STATISTICS_MODES.map((mode) => ({ id: mode.id, name: mode.name })),
    currentOwner: [
      { id: 'self', name: '自营' },
      { id: 'eco', name: '生态' }
    ]
  };

  const ORDER_TYPE_PARAMETERS = [
    { code: '9', name: '闪回-小米售后', parentCode: '', value2: '闪回-小米售后', group: '售后与流转' },
    { code: '4', name: '买家-企业购', parentCode: '', value2: '买家', group: '业务成交' },
    { code: '37', name: '闪回-华强北', parentCode: '', value2: '自营BU', group: '渠道成交' },
    { code: '33', name: '闪回-闲鱼竞价', parentCode: '', value2: '自营BU', group: '渠道成交' },
    { code: '31', name: '买家-转自营', parentCode: '', value2: '生态BU', group: '售后与流转' },
    { code: '3', name: '买家-企业版', parentCode: '', value2: '买家', group: '业务成交' },
    { code: '29', name: '生态-无人报价', parentCode: '', value2: '生态BU', group: '机器人成交' },
    { code: '28', name: '生态-售后退货', parentCode: '', value2: '生态BU', group: '售后与流转' },
    { code: '27', name: '闪回-线上竞价', parentCode: '', value2: '自营BU', group: '渠道成交' },
    { code: '26', name: '闪回-自报价', parentCode: '', value2: '自营BU', group: '业务成交' },
    { code: '25', name: '闪回-8号机器人', parentCode: '', value2: '自营BU', group: '机器人成交' },
    { code: '24', name: '闪回-AI代报价', parentCode: '', value2: '自营BU', group: '机器人成交' },
    { code: '23', name: '生态-平台兜底', parentCode: '', value2: '生态BU', group: '机器人成交' },
    { code: '22', name: '闪回-卖场-买家', parentCode: '', value2: '自营BU', group: '业务成交' },
    { code: '21', name: '闪回-卖场-换新', parentCode: '', value2: '自营BU', group: '业务成交' },
    { code: '18', name: '闪回-ZB机器人', parentCode: '', value2: '自营BU', group: '机器人成交' },
    { code: '17', name: '闪回-报价单', parentCode: '', value2: '自营BU', group: '业务成交' },
    { code: '16', name: '闪回-指定机器人', parentCode: '', value2: '自营BU', group: '机器人成交' },
    { code: '15', name: '闪回-包销机器人', parentCode: '', value2: '自营BU', group: '机器人成交' },
    { code: '14', name: '闪回-精准机器人', parentCode: '', value2: '自营BU', group: '机器人成交' },
    { code: '13', name: '买家-AI报价', parentCode: '', value2: '买家', group: '机器人成交' },
    { code: '12', name: '买家-保值换新', parentCode: '', value2: '买家', group: '业务成交' },
    { code: '11', name: '闪回-保值换新', parentCode: '', value2: '闪回-保值换新', group: '业务成交' },
    { code: '10', name: '闪回-兜底机器人', parentCode: '', value2: '自营BU', group: '机器人成交' },
    { code: '2', name: '买家-买家成交', parentCode: '', value2: '买家', group: '成交默认' },
    { code: '1', name: '闪回-闪回成交', parentCode: '', value2: '自营BU', group: '成交默认' },
    { code: '0', name: '生态-生态渠道', parentCode: '38', value2: '生态BU', group: '渠道成交' },
    { code: '34', name: '闪回-指定手机号', parentCode: '', value2: '自营BU', group: '演示待配置', isDemo: true },
    { code: '35', name: '买家-指定手机号', parentCode: '', value2: '生态BU', group: '演示待配置', isDemo: true }
  ];

  const LABEL_SYSTEM_CODE_BY_ID = {
    'BASE-SELF': '1',
    'BASE-BUYER': '2',
    tag_multi_robot: '25',
    tag_eco_no_quote: '29',
    tag_eco_platform: '23',
    tag_flash_value: '11',
    tag_eco_channel: '0',
    tag_flash_xiaomi: '9',
    tag_self_custom: '34',
    tag_eco_custom: '35',
    tag_buyer_enterprise_purchase: '4',
    tag_buyer_value: '12',
    tag_buyer_ai: '13',
    tag_buyer_to_self: '31',
    tag_eco_return: '28'
  };

  const CHANNEL_CATALOG = [
    { code: 'CH-60001', name: '线下合作渠道 A', group: '线下渠道' },
    { code: 'CH-60002', name: '上门回收渠道 B', group: '线下渠道' },
    { code: 'CH-60003', name: '门店成交渠道 C', group: '线下渠道' },
    { code: 'CH-50001', name: '闲鱼通知渠道（脱敏）', group: '线上渠道' },
    { code: 'CH-50002', name: '支付宝合作渠道（脱敏）', group: '线上渠道' },
    { code: 'CH-50003', name: '生态平台渠道（脱敏）', group: '线上渠道' }
  ];

  const LABEL_CATEGORY_FIELDS = {
    cat_channel: {
      key: 'channel',
      label: '选择渠道',
      type: 'picker',
      options: CHANNEL_CATALOG.map((channel) => ({ id: channel.code, name: channel.name }))
    },
    cat_robot: {
      key: 'robotSource',
      label: '选择机器人',
      type: 'select',
      options: CONDITION_VALUES.robotSource
    },
    cat_phone: {
      key: 'phone',
      label: '录入手机号',
      type: 'tel',
      placeholder: '请输入 11 位手机号'
    }
  };

  const SINGLE_CONFIG_CATEGORIES = new Set(['cat_enterprise', 'cat_value']);

  const VIEW_RESPONSIBILITIES = {
    labels: {
      title: '业务标签负责“标签是什么”',
      copy: '维护系统编码、归属部门、分类明细、责任人、状态与审核版本，形成可被规则引用的标签目录。',
      primary: '定义标签',
      secondary: '解决：名称、编码、部门、分类和绑定值'
    },
    rules: {
      title: '标签规则负责“订单何时变成该标签”',
      copy: '从已审核标签目录中选择目标标签，配置受控条件与优先级，决定成交或后续事件是否更新当前标签。',
      primary: '定义生效条件',
      secondary: '解决：条件、优先级、冲突与版本'
    }
  };

  const VIEW_META = {
    overview: { label: '治理总览', group: '工作台', code: 'OVERVIEW' },
    labels: { label: '业务标签', group: '配置', code: 'LABELS' },
    categories: { label: '标签分类', group: '配置', code: 'TAXONOMY' },
    attribution: { label: '归属与统计', group: '配置', code: 'ATTRIBUTION' },
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
      if (!parsed || parsed.version !== 12 || !Array.isArray(parsed.labels)) return createDefaultState();
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

  function statisticsModeMeta(id) {
    return STATISTICS_MODES.find((mode) => mode.id === id) || {
      id: id || 'unset',
      name: '待归因',
      description: '订单归属事实不足，暂不能生成统计模式。',
      tone: 'gray',
      priority: '待确认'
    };
  }

  function statisticsModeFor(facts = {}) {
    const source = normalizeDepartment(facts.department);
    const currentOwner = normalizeDepartment(facts.currentOwner || facts.department);
    if (source === 'self' && currentOwner === 'eco') return 'self_to_eco';
    if (source === 'eco' && currentOwner === 'self') return 'eco_to_self';
    return facts.bidderParty === 'buyer' ? 'buyer_won' : 'non_buyer_won';
  }

  function statisticsModeChip(id) {
    const mode = statisticsModeMeta(id);
    return `<span class="statistics-mode-chip is-${escapeHtml(mode.tone)}">${escapeHtml(mode.name)}</span>`;
  }

  function ownershipTransitionText(sourceDepartment, currentOwner) {
    const source = normalizeDepartment(sourceDepartment);
    const owner = normalizeDepartment(currentOwner || sourceDepartment);
    return source === owner ? `${departmentName(owner)}内持有` : `${departmentName(source)} → ${departmentName(owner)}`;
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

  function defaultLabelDepartment() {
    return currentRole()?.id === 'eco_author' ? 'eco' : 'self';
  }

  function canViewDepartment(department) {
    const normalized = normalizeDepartment(department);
    const role = currentRole();
    if (!role) return false;
    if (['platform_admin', 'ops_exception', 'viewer'].includes(role.id)) return true;
    if (role.id.startsWith('self_')) return normalized === 'self';
    if (role.id.startsWith('eco_')) return normalized === 'eco';
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

  function categoryBindingText(label) {
    return label?.categoryConfig?.name || '';
  }

  function categoryBindingFieldName(categoryId) {
    return LABEL_CATEGORY_FIELDS[categoryId]?.label || '分类绑定';
  }

  function systemCodeForLabel(label) {
    return String(label?.systemCode || LABEL_SYSTEM_CODE_BY_ID[label?.id] || '');
  }

  function systemParameterByCode(code) {
    return ORDER_TYPE_PARAMETERS.find((parameter) => parameter.code === String(code));
  }

  function labelsUsingSystemCode(code, excludeId = '') {
    return [...state.baseLabels, ...state.labels].filter((label) => label.id !== excludeId && systemCodeForLabel(label) === String(code));
  }

  function systemCodeStatus(code, excludeId = '') {
    const parameter = systemParameterByCode(code);
    if (!parameter) return { available: false, label: null, text: '参数不存在' };
    const owner = labelsUsingSystemCode(code, excludeId)[0] || null;
    return {
      available: !owner,
      label: owner,
      parameter,
      text: owner ? `已由「${owner.name}」占用` : parameter.isDemo ? '可用 · 演示占位参数' : '可用'
    };
  }

  function uniquenessRule(categoryId) {
    if (SINGLE_CONFIG_CATEGORIES.has(categoryId)) {
      return {
        type: 'single',
        tag: '同部门唯一',
        title: '该非录入分类在同一部门只允许一个配置',
        description: '已生效或待审核配置均占用该分类，必须调整、停用或等待现有配置结束。'
      };
    }
    if (LABEL_CATEGORY_FIELDS[categoryId]?.type) {
      return {
        type: 'binding',
        tag: '绑定值唯一',
        title: '同一渠道、手机号或机器人只能绑定一个生效标签',
        description: '唯一性跨部门校验；待审核配置可并存，但发布时会再次检查已生效绑定。'
      };
    }
    return null;
  }

  function normalizedCategoryValue(categoryId, value) {
    const normalized = String(value || '').trim();
    return categoryId === 'cat_phone' ? normalized.replace(/\D/g, '') : normalized;
  }

  function labelUniquenessConflicts(candidate) {
    if (!candidate?.categoryId) return [];
    const rule = uniquenessRule(candidate.categoryId);
    if (!rule) return [];
    const candidateValue = normalizedCategoryValue(candidate.categoryId, candidate.categoryConfig?.value);
    if (rule.type === 'binding' && !candidateValue) return [];
    return state.labels.filter((label) => {
      if (label.id === candidate.id || label.categoryId !== candidate.categoryId) return false;
      if (rule.type === 'single') {
        if (!['enabled', 'pending'].includes(label.status)) return false;
        return normalizeDepartment(label.department) === normalizeDepartment(candidate.department);
      }
      if (label.status !== 'enabled') return false;
      return normalizedCategoryValue(label.categoryId, label.categoryConfig?.value) === candidateValue;
    });
  }

  function maskPhone(value) {
    const phone = String(value || '').replace(/\D/g, '');
    return /^1[3-9]\d{9}$/.test(phone) ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : String(value || '');
  }

  function categoryFieldMarkup(categoryId, label = null) {
    const field = LABEL_CATEGORY_FIELDS[categoryId];
    if (!field) return '';
    const currentValue = label?.categoryConfig?.value || '';
    const selectedOption = field.options?.find((option) => option.id === currentValue);
    const usedLabels = field.type === 'select'
      ? state.labels.filter((item) => item.id !== label?.id
        && item.categoryId === categoryId
        && item.status === 'enabled'
        && item.categoryConfig?.value)
      : [];
    const input = field.type === 'select'
      ? `<select class="select" name="categoryValue" required>
          <option value="">请选择${escapeHtml(field.label.replace('选择', ''))}</option>
          ${field.options.map((option) => {
            const owner = usedLabels.find((item) => item.categoryConfig.value === option.id);
            return `<option value="${escapeHtml(option.id)}" ${option.id === currentValue ? 'selected' : ''} ${owner && option.id !== currentValue ? 'disabled' : ''}>${escapeHtml(option.name)}${owner ? ` · 已由「${escapeHtml(owner.name)}」生效` : ''}</option>`;
          }).join('')}
        </select>`
      : field.type === 'picker'
        ? `<input type="hidden" name="categoryValue" value="${escapeHtml(currentValue)}" />
          <button class="channel-select-trigger ${currentValue ? 'has-value' : ''}" type="button" data-action="open-channel-picker">
            <span>${currentValue ? escapeHtml(selectedOption?.name || currentValue) : '请选择渠道'}</span>
            <small>${currentValue ? `渠道 ID：${escapeHtml(currentValue)}` : '按名称或渠道 ID 查找'}</small>
            <b>选择</b>
          </button>`
        : `<input class="input mono" type="tel" inputmode="numeric" name="categoryValue" required maxlength="11" value="${escapeHtml(currentValue)}" placeholder="${escapeHtml(field.placeholder)}" pattern="1[3-9][0-9]{9}" title="请输入 11 位手机号" />`;
    const helpText = field.type === 'tel'
      ? '手机号用于配置消费和审计，列表与详情中按脱敏形式展示。'
      : field.type === 'picker'
        ? '渠道来自统一系统字典。支持按名称或渠道 ID 查找，已被其他生效标签占用的渠道不可添加。'
        : '该选择将写入标签定义、审核记录和后续规则配置。';
    return `
      <label class="field field-full" data-category-field="${escapeHtml(categoryId)}">
        <span>${escapeHtml(field.label)} <b>*</b></span>
        ${input}
        <small class="field-help">${helpText}</small>
      </label>
    `;
  }

  function updateLabelCategoryField(form) {
    const container = form?.querySelector('#label-category-attribute');
    if (!container) return;
    const categoryId = String(form.elements.categoryId?.value || '');
    const label = form.dataset.id ? findLabel(form.dataset.id) : null;
    const relevantLabel = label?.categoryId === categoryId ? label : null;
    container.innerHTML = categoryFieldMarkup(categoryId, relevantLabel);
    updateLabelUniquenessCheck(form);
  }

  function updateLabelUniquenessCheck(form) {
    const panel = form?.querySelector('#label-uniqueness-check');
    if (!panel) return;
    const categoryId = String(form.elements.categoryId?.value || '');
    const rule = uniquenessRule(categoryId);
    if (!rule) {
      panel.innerHTML = '';
      panel.className = 'label-uniqueness-check';
      syncLabelSubmitState(form);
      return;
    }
    const department = String(new FormData(form).get('department') || '');
    const rawValue = String(form.elements.categoryValue?.value || '').trim();
    const editingId = form.dataset.id || '';
    const systemCode = String(form.elements.systemCode?.value || '');
    const codeStatus = systemCode ? systemCodeStatus(systemCode, editingId) : { available: true, text: '待选择系统编码' };
    const conflicts = labelUniquenessConflicts({
      id: editingId,
      department,
      categoryId,
      categoryConfig: rawValue ? { value: rawValue } : null
    });
    const pendingBindings = rule.type === 'binding' && rawValue
      ? state.labels.filter((label) => label.id !== editingId
        && label.categoryId === categoryId
        && label.status === 'pending'
        && normalizedCategoryValue(label.categoryId, label.categoryConfig?.value) === normalizedCategoryValue(categoryId, rawValue))
      : [];
    const selectedOption = LABEL_CATEGORY_FIELDS[categoryId]?.options?.find((option) => option.id === rawValue);
    const bindingText = rawValue
      ? categoryId === 'cat_phone' ? maskPhone(rawValue) : (selectedOption?.name || rawValue)
      : '待选择';
    const availabilityText = rule.type === 'binding'
      ? (LABEL_CATEGORY_FIELDS[categoryId]?.options || []).map((option) => ({
        ...option,
        owner: state.labels.find((label) => label.id !== editingId
          && label.categoryId === categoryId
          && label.status === 'enabled'
          && label.categoryConfig?.value === option.id)
      })).filter((option) => !option.owner)
      : [];
    panel.className = `label-uniqueness-check ${conflicts.length || !codeStatus.available ? 'has-conflict' : ''}`;
    panel.innerHTML = `
      <div class="label-uniqueness-head">
        <div><span>UNIQUENESS CHECK</span><h3>配置唯一性</h3></div>
        <b>${escapeHtml(rule.tag)}</b>
      </div>
      <p><strong>${escapeHtml(rule.title)}</strong>${escapeHtml(rule.description)}</p>
      <div class="label-uniqueness-meta">
        <span>标签编码</span><strong>${systemCode ? `REC_ORD_TYP ${escapeHtml(systemCode)} · ${escapeHtml(codeStatus.text)}` : '尚未选择系统编码'}</strong>
      </div>
      <div class="label-uniqueness-meta">
        <span>校验范围</span><strong>${rule.type === 'single' ? `${escapeHtml(departmentName(department))} · ${escapeHtml(categoryMeta(categoryId).name)}` : `${escapeHtml(categoryMeta(categoryId).name)} · ${escapeHtml(bindingText)}`}</strong>
      </div>
      ${rule.type === 'binding' ? `<div class="label-binding-availability"><span>当前可用</span>${availabilityText.length ? availabilityText.map((option) => `<b>${escapeHtml(option.name)}</b>`).join('') : '<strong>无可用绑定值</strong>'}</div>` : ''}
      <div class="label-uniqueness-result ${conflicts.length ? 'is-danger' : 'is-success'}">
        ${conflicts.length
          ? `<span>!</span><div><strong>发现 ${conflicts.length} 个重复配置</strong><p>${conflicts.map((label) => `${escapeHtml(label.name)}（${label.status === 'enabled' ? '生效中' : '待审核'}）`).join('、')}</p></div>`
          : `<span>✓</span><div><strong>${rule.type === 'binding' && !rawValue ? '选择绑定值后完成检查' : '当前配置未发现重复'}</strong><p>${pendingBindings.length ? `${pendingBindings.map((label) => escapeHtml(label.name)).join('、')} 使用同一绑定值但尚未生效，发布时仍需复查。` : '提交与发布时还会由服务端再次校验。'}</p></div>`}
      </div>
    `;
    syncLabelSubmitState(form);
  }

  function syncLabelSubmitState(form) {
    if (!form) return;
    const button = document.querySelector('button[form="label-form"][type="submit"]');
    if (!button) return;
    const categoryId = String(form.elements.categoryId?.value || '');
    const rule = uniquenessRule(categoryId);
    const rawValue = String(form.elements.categoryValue?.value || '').trim();
    const conflicts = labelUniquenessConflicts({
      id: form.dataset.id || '',
      department: String(new FormData(form).get('department') || ''),
      categoryId,
      categoryConfig: rawValue ? { value: rawValue } : null
    });
    const systemCode = String(form.elements.systemCode?.value || '');
    const codeStatus = systemCode ? systemCodeStatus(systemCode, form.dataset.id || '') : { available: false };
    const blocked = !systemCode || !codeStatus.available || Boolean(rule && conflicts.length);
    button.disabled = blocked;
    button.title = blocked ? (!systemCode ? '请先选择系统标签编码' : !codeStatus.available ? '系统标签编码已被占用' : '存在重复配置，请先调整分类或绑定值') : '';
  }

  function channelOwner(code, excludeLabelId = '') {
    return state.labels.find((label) => label.id !== excludeLabelId
      && label.categoryId === 'cat_channel'
      && label.status === 'enabled'
      && label.categoryConfig?.value === code);
  }

  function channelPickerMarkup(form, nameQuery = '', codeQuery = '') {
    const layer = document.getElementById('channel-picker-layer');
    const selectedCode = String(layer?.dataset.selected || form.elements.categoryValue?.value || '');
    const selected = CHANNEL_CATALOG.find((channel) => channel.code === selectedCode);
    const editingId = form.dataset.id || '';
    const normalizedName = nameQuery.trim().toLowerCase();
    const normalizedCode = codeQuery.trim().toLowerCase();
    const filtered = CHANNEL_CATALOG.filter((channel) => {
      const nameMatch = !normalizedName || channel.name.toLowerCase().includes(normalizedName);
      const codeMatch = !normalizedCode || channel.code.toLowerCase().includes(normalizedCode);
      return nameMatch && codeMatch;
    });
    const groups = [...new Set(filtered.map((channel) => channel.group))];
    return `
      <div class="picker-shell" aria-labelledby="channel-picker-title">
        <div class="picker-head">
          <div><span>SYSTEM CHANNEL DICTIONARY</span><h2 id="channel-picker-title">选择渠道</h2><p>支持按渠道名称和渠道 ID 搜索，保留批量入口与分组列表；当前业务标签按单选执行。</p></div>
          <button type="button" class="dialog-close" data-action="close-channel-picker" aria-label="关闭渠道选择">×</button>
        </div>
        <div class="channel-picker-selected">
          <div><span>已选渠道</span>${selected ? `<b>${escapeHtml(selected.name)}</b><small>${escapeHtml(selected.code)}</small>` : '<strong>尚未选择渠道</strong>'}</div>
          <button type="button" class="button button-quiet button-small" data-action="clear-channel-picker">清空已选</button>
        </div>
        <div class="picker-search-tools">
          <input class="input" id="channel-picker-name-search" value="${escapeHtml(nameQuery)}" placeholder="输入名称进行添加" autocomplete="off" autofocus />
          <input class="input mono" id="channel-picker-code-search" value="${escapeHtml(codeQuery)}" placeholder="输入渠道 ID 添加" autocomplete="off" />
          <button type="button" class="button button-primary button-small" disabled title="当前业务标签只允许绑定一个渠道">批量选择</button>
          <button type="button" class="button button-secondary button-small" disabled title="公网评审版不执行批量导入">批量导入</button>
          <button type="button" class="button button-quiet button-small" disabled title="单个渠道配置无需模板">模板</button>
          <span class="picker-search-count">可添加 ${filtered.filter((channel) => !channelOwner(channel.code, editingId)).length} / ${CHANNEL_CATALOG.length}</span>
        </div>
        <div class="channel-picker-list">
          ${groups.length ? groups.map((group) => `
            <section class="channel-group">
              <div class="channel-group-head"><span><i aria-hidden="true">⌄</i>${escapeHtml(group)}</span><small>${filtered.filter((channel) => channel.group === group).length} 个渠道</small></div>
              ${filtered.filter((channel) => channel.group === group).map((channel) => {
                const owner = channelOwner(channel.code, editingId);
                const isSelected = channel.code === selectedCode;
                return `
                  <div class="channel-option ${isSelected ? 'is-selected' : ''}">
                    <div><span class="channel-expand" aria-hidden="true">›</span><code>${escapeHtml(channel.code)}</code><strong>${escapeHtml(channel.name)}</strong>${owner ? `<small>已由“${escapeHtml(owner.name)}”生效</small>` : '<small>未绑定生效标签</small>'}</div>
                    <button type="button" class="button button-small ${isSelected ? 'button-secondary' : 'button-primary'}" data-action="select-channel" data-code="${escapeHtml(channel.code)}" ${owner ? 'disabled' : ''}>${isSelected ? '已选' : owner ? '已占用' : '添加'}</button>
                  </div>
                `;
              }).join('')}
            </section>
          `).join('') : '<div class="empty-state is-inline"><strong>没有匹配的渠道</strong><p>调整渠道名称或 ID 后重试。</p></div>'}
        </div>
        <div class="picker-foot">
          <span>批量入口仅保留现有系统交互位置；当前标签配置只允许选择一个渠道。</span>
          <div><button type="button" class="button button-secondary" data-action="close-channel-picker">关闭</button><button type="button" class="button button-primary" data-action="save-channel-picker" ${selected ? '' : 'disabled'}>保存</button></div>
        </div>
      </div>
    `;
  }

  function renderChannelPicker(form, nameQuery = '', codeQuery = '') {
    let layer = document.getElementById('channel-picker-layer');
    if (!layer) {
      layer = document.createElement('dialog');
      layer.id = 'channel-picker-layer';
      layer.className = 'app-dialog picker-dialog';
      layer.dataset.selected = String(form.elements.categoryValue?.value || '');
      layer.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeChannelPicker();
      });
      layer.addEventListener('click', (event) => {
        if (event.target === layer) closeChannelPicker();
      });
      document.body.appendChild(layer);
    }
    layer.innerHTML = channelPickerMarkup(form, nameQuery, codeQuery);
    if (typeof layer.showModal === 'function' && !layer.open) layer.showModal();
    if (!nameQuery && !codeQuery) window.setTimeout(() => layer.querySelector('#channel-picker-name-search')?.focus(), 20);
  }

  function openChannelPicker(form) {
    if (!form) return;
    const layer = document.getElementById('channel-picker-layer');
    if (layer?.open) layer.close();
    layer?.remove();
    renderChannelPicker(form);
  }

  function closeChannelPicker() {
    const layer = document.getElementById('channel-picker-layer');
    if (!layer) return;
    if (layer.open) layer.close();
    layer.remove();
  }

  function saveChannelPicker(form) {
    const layer = document.getElementById('channel-picker-layer');
    const code = String(layer?.dataset.selected || '');
    const channel = CHANNEL_CATALOG.find((item) => item.code === code);
    if (!form || !channel) return;
    form.elements.categoryValue.value = code;
    const container = form.querySelector('#label-category-attribute');
    if (container) {
      container.innerHTML = categoryFieldMarkup('cat_channel', {
        id: form.dataset.id || '',
        categoryConfig: { value: channel.code, name: channel.name }
      });
    }
    updateLabelUniquenessCheck(form);
    closeChannelPicker();
  }

  function systemCodePickerMarkup(form, query = '') {
    const layer = document.getElementById('system-code-picker-layer');
    const systemCode = String(layer?.dataset.selected || form.elements.systemCode?.value || '');
    const selected = systemParameterByCode(systemCode);
    const editingId = form.dataset.id || '';
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = ORDER_TYPE_PARAMETERS.filter((parameter) => !normalizedQuery
      || parameter.code.toLowerCase().includes(normalizedQuery)
      || parameter.name.toLowerCase().includes(normalizedQuery)
      || parameter.value2.toLowerCase().includes(normalizedQuery));
    const groups = [...new Set(filtered.map((parameter) => parameter.group))];
    return `
      <div class="picker-shell system-code-picker-shell" aria-labelledby="system-code-picker-title">
        <div class="picker-head">
          <div><span>SYSTEM PARAMETER / REC_ORD_TYP</span><h2 id="system-code-picker-title">选择标签编码</h2><p>编码只读系统参数表，不从页面手工录入。每个系统编码只能绑定一个业务标签。</p></div>
          <button type="button" class="dialog-close" data-action="close-system-code-picker" aria-label="关闭标签编码选择">×</button>
        </div>
        <div class="system-code-selected">
          <span>已选系统参数</span>
          ${selected ? `<div><b>${escapeHtml(selected.code)}</b><strong>${escapeHtml(selected.name)}</strong><small>值2：${escapeHtml(selected.value2)} · 上级编码：${escapeHtml(selected.parentCode || '—')}</small></div>` : '<strong>尚未选择标签编码</strong>'}
        </div>
        <div class="picker-search-tools">
          <label class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <input id="system-code-search" value="${escapeHtml(query)}" placeholder="搜索 code、值或值2" autocomplete="off" autofocus />
          </label>
          <span class="picker-search-count">参数 ${ORDER_TYPE_PARAMETERS.length} 个 · 当前结果可用 ${filtered.filter((parameter) => systemCodeStatus(parameter.code, editingId).available).length} 个</span>
        </div>
        <div class="system-code-table">
          <div class="system-code-table-head"><span>类型</span><span>code</span><span>上级 code</span><span>值</span><span>值2</span><span>占用状态</span><span>操作</span></div>
          ${groups.length ? groups.map((group) => `
            <div class="system-code-group-title"><span>${escapeHtml(group)}</span><small>${filtered.filter((parameter) => parameter.group === group).length} 个参数</small></div>
            ${filtered.filter((parameter) => parameter.group === group).map((parameter) => {
              const status = systemCodeStatus(parameter.code, editingId);
              const isSelected = parameter.code === systemCode;
              return `
                <div class="system-code-row ${isSelected ? 'is-selected' : ''}">
                  <span class="mono-cell">REC_ORD_TYP</span>
                  <code>${escapeHtml(parameter.code)}</code>
                  <span>${escapeHtml(parameter.parentCode || '—')}</span>
                  <strong>${escapeHtml(parameter.name)}</strong>
                  <span>${escapeHtml(parameter.value2)}</span>
                  <span class="system-code-status ${status.available ? 'is-free' : 'is-used'}">${escapeHtml(status.text)}</span>
                  <button type="button" class="text-button" data-action="select-system-code" data-code="${escapeHtml(parameter.code)}" ${status.available ? '' : 'disabled'}>${isSelected ? '已选' : status.available ? '选择' : '不可用'}</button>
                </div>
              `;
            }).join('')}
          `).join('') : '<div class="empty-state is-inline"><strong>没有匹配的系统参数</strong><p>调整 code、值或值2 后重试。</p></div>'}
        </div>
        <div class="picker-foot">
          <span>标注“演示待配置”的参数不代表生产 REC_ORD_TYP 已配置，进入研发前由系统负责人补齐。</span>
          <div><button type="button" class="button button-secondary" data-action="close-system-code-picker">取消</button><button type="button" class="button button-primary" data-action="save-system-code-picker" ${selected ? '' : 'disabled'}>保存编码</button></div>
        </div>
      </div>
    `;
  }

  function renderSystemCodePicker(form, query = '') {
    let layer = document.getElementById('system-code-picker-layer');
    if (!layer) {
      layer = document.createElement('dialog');
      layer.id = 'system-code-picker-layer';
      layer.className = 'app-dialog picker-dialog is-wide';
      layer.dataset.selected = String(form.elements.systemCode?.value || '');
      layer.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeSystemCodePicker();
      });
      layer.addEventListener('click', (event) => {
        if (event.target === layer) closeSystemCodePicker();
      });
      document.body.appendChild(layer);
    }
    layer.innerHTML = systemCodePickerMarkup(form, query);
    if (typeof layer.showModal === 'function' && !layer.open) layer.showModal();
    if (!query) window.setTimeout(() => layer.querySelector('#system-code-search')?.focus(), 20);
  }

  function openSystemCodePicker(form) {
    if (!form || form.dataset.id) return;
    const layer = document.getElementById('system-code-picker-layer');
    if (layer?.open) layer.close();
    layer?.remove();
    renderSystemCodePicker(form);
  }

  function closeSystemCodePicker() {
    const layer = document.getElementById('system-code-picker-layer');
    if (!layer) return;
    if (layer.open) layer.close();
    layer.remove();
  }

  function updateSystemCodePreview(form) {
    const preview = form?.querySelector('#label-system-code-preview');
    if (!preview) return;
    const code = String(form.elements.systemCode?.value || '');
    const parameter = systemParameterByCode(code);
    const status = systemCodeStatus(code, form.dataset.id || '');
    preview.className = `system-code-preview ${parameter && status.available ? 'has-value' : ''} ${parameter && !status.available ? 'has-conflict' : ''}`;
    preview.innerHTML = parameter
      ? `<span>系统编码</span><strong>${escapeHtml(parameter.code)}</strong><div><b>${escapeHtml(parameter.name)}</b><small>值2：${escapeHtml(parameter.value2)} · ${escapeHtml(status.text)}</small></div>`
      : '<span>系统编码</span><strong>—</strong><div><b>尚未选择</b><small>编码来自系统参数 REC_ORD_TYP</small></div>';
  }

  function saveSystemCodePicker(form) {
    const layer = document.getElementById('system-code-picker-layer');
    const code = String(layer?.dataset.selected || '');
    const parameter = systemParameterByCode(code);
    if (!form || !parameter) return;
    const status = systemCodeStatus(code, form.dataset.id || '');
    if (!status.available) {
      showToast('标签编码已被占用', status.text, true);
      return;
    }
    form.elements.systemCode.value = code;
    updateSystemCodePreview(form);
    updateLabelUniquenessCheck(form);
    closeSystemCodePicker();
  }

  function departmentRadioGroup(selectedDepartment) {
    return `
      <div class="field">
        <span id="label-department-label">适用部门 <b>*</b></span>
        <div class="radio-card-group" role="radiogroup" aria-labelledby="label-department-label">
          ${LABEL_DEPARTMENT_OPTIONS.map((department) => `
            <label class="radio-card">
              <input type="radio" name="department" value="${department.id}" ${normalizeDepartment(selectedDepartment) === department.id ? 'checked' : ''} required />
              <span>
                <b>${escapeHtml(department.name)}</b>
                <small>成交原始标签：${escapeHtml(department.originalLabel)}</small>
              </span>
            </label>
          `).join('')}
        </div>
        <small class="field-help">单选且必填。一个业务标签只能归属自营或生态之一，审核按归属部门自动路由。</small>
      </div>
    `;
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
    const sourceDepartment = normalizeDepartment(facts.department);
    const currentOwner = normalizeDepartment(facts.currentOwner || facts.department);
    const statisticsMode = statisticsModeFor({ ...facts, currentOwner });
    const normalizedFacts = { ...facts, department: currentOwner, currentOwner, statisticsMode };
    const baseLabel = state.baseLabels.find((label) => normalizeDepartment(label.department) === sourceDepartment);
    const candidates = state.rules
      .filter((rule) => normalizeDepartment(rule.department) === currentOwner)
      .map((rule) => ({
        rule,
        matches: ruleMatches(rule, normalizedFacts),
        reasons: rule.conditions
          .filter((condition) => String(normalizedFacts[condition.field] || '') !== String(condition.value))
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
      department: currentOwner,
      sourceDepartment,
      currentOwner,
      statisticsMode,
      bidderParty: facts.bidderParty || 'other',
      ownershipChange: sourceDepartment === currentOwner ? 'none' : `${sourceDepartment}_to_${currentOwner}`,
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

  function responsibilityBand(view) {
    const current = VIEW_RESPONSIBILITIES[view];
    if (!current) return '';
    const otherView = view === 'labels' ? 'rules' : 'labels';
    const other = VIEW_RESPONSIBILITIES[otherView];
    return `
      <section class="responsibility-band" aria-label="菜单职责说明">
        <article class="is-current">
          <span>CURRENT MENU</span>
          <div><h2>${escapeHtml(current.title)}</h2><p>${escapeHtml(current.copy)}</p></div>
          <b>${escapeHtml(current.primary)}</b>
          <small>${escapeHtml(current.secondary)}</small>
        </article>
        <div class="responsibility-link" aria-hidden="true">→</div>
        <article>
          <span>${view === 'labels' ? 'NEXT MENU' : 'UPSTREAM MENU'}</span>
          <div><h2>${escapeHtml(other.title)}</h2><p>${escapeHtml(other.copy)}</p></div>
          <button class="text-button" type="button" data-action="go-view" data-view="${otherView}">前往${otherView === 'labels' ? '业务标签' : '标签规则'} →</button>
        </article>
      </section>
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
      attribution: renderAttribution,
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
            <div><h2>最近订单标签事件</h2><p>展示成交归属、当前货物归属、统计模式与标签命中依据。</p></div>
            <button class="text-button" data-action="go-view" data-view="trace">进入订单追溯</button>
          </div>
          <div class="table-scroll">
            <div class="data-table overview-trace-table">
              <div class="data-table-head">
                <span>订单</span><span>货物归属</span><span>统计模式</span><span>原始标签</span><span>当前标签</span><span>命中依据</span><span>结果</span><span></span>
              </div>
              ${recentEvents.map((trace) => `
                <button class="data-table-row trace-preview-row" type="button" data-action="select-trace" data-order="${escapeHtml(trace.orderNo)}">
                  <span class="mono-cell">${escapeHtml(trace.orderNo)}</span>
                  <span class="ownership-cell">${departmentChip(trace.currentOwner)}<small>成交 ${escapeHtml(departmentName(trace.department))}</small></span>
                  <span>${statisticsModeChip(trace.statisticsMode)}</span>
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
        { title: '本页待确认', items: ['首页统计指标是否为首期必需。', '待审核默认按提交时间还是风险等级排序。', 'Q-007：扭转模式是否优先于买卖家中标模式。'] }
      ])
    };
  }

  function renderLabels() {
    const query = ui.labelQuery.trim().toLowerCase();
    const visible = state.labels.filter((label) => {
      const departmentMatch = ui.labelDepartment === 'all' || normalizeDepartment(label.department) === ui.labelDepartment;
      const statusMatch = ui.labelStatus === 'all' || label.status === ui.labelStatus;
      const text = `${label.name} ${systemCodeForLabel(label)} ${label.description} ${label.owner}`.toLowerCase();
      return departmentMatch && statusMatch && (!query || text.includes(query));
    });

    const body = `
      <div class="view">
        ${pageHeader(
          'CONFIGURATION / 01',
          '业务标签定义',
          '标签编码只从系统参数 REC_ORD_TYP 选择，编码全局唯一；业务标签审核发布后，才能被标签规则引用。',
          `<button class="button button-primary" data-action="open-label" ${hasCapability('label:submit') ? '' : 'disabled title="当前角色无提交权限"'}>新增业务标签</button>`
        )}

        ${responsibilityBand('labels')}

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
                  <code>REC_ORD_TYP · ${escapeHtml(systemCodeForLabel(label))}</code>
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
              ${[['all', '全部'], ['self', '自营'], ['eco', '生态']].map(([value, label]) => `
                <button class="${ui.labelDepartment === value ? 'is-active' : ''}" type="button" data-action="label-filter-department" data-value="${value}">${label}</button>
              `).join('')}
            </div>
            <label class="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              <input id="label-search" value="${escapeHtml(ui.labelQuery)}" placeholder="搜索名称、REC_ORD_TYP 编码或责任人" autocomplete="off" />
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
                    <span class="mono-cell">REC_ORD_TYP · ${escapeHtml(systemCodeForLabel(label))} / ${escapeHtml(label.version)}</span>
                  </div>
                  <div class="stack-cell">${departmentChip(label.department)}<span>${escapeHtml(categoryMeta(label.categoryId).name)}${categoryBindingText(label) ? ` · ${escapeHtml(categoryBindingText(label))}` : ''}</span></div>
                  <div class="description-cell" title="${escapeHtml(label.description)}">${escapeHtml(label.description)}</div>
                  <div class="stack-cell"><b>${references.length} 条</b><span>${references.filter((rule) => rule.status === 'enabled').length} 条生效</span></div>
                  <div>${statusChip(label.status)}</div>
                  <div class="row-actions">
                    <button class="text-button" data-action="open-label-detail" data-id="${escapeHtml(label.id)}">详情</button>
                    <button class="text-button" data-action="edit-label" data-id="${escapeHtml(label.id)}" ${hasCapability('label:submit') ? '' : 'disabled'}>编辑</button>
                    ${label.status === 'enabled' ? `<button class="text-button is-danger" data-action="disable-label" data-id="${escapeHtml(label.id)}" ${hasCapability('label:submit') ? '' : 'disabled'}>停用</button>` : ''}
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
      review: reviewPanel('业务标签定义“标签是什么”', '本页只管理系统编码、归属部门、分类明细、状态与审核版本；订单何时命中该标签由“标签规则”负责。', [
        { title: '菜单职责', items: ['业务标签定义标签目录和唯一系统编码。', '标签规则定义条件、优先级和目标标签。', '两页分离后，标签可被多条规则引用，但编码不会重复定义。'] },
        { title: '关键规则', items: ['新建标签只能在自营、生态中选择一个部门。', '标签编码只读取 REC_ORD_TYP，不能手工填写，且全局只能绑定一个业务标签。', '非录入分类同部门唯一；渠道、手机号、机器人绑定值全局唯一。'] },
        { title: '分类联动', items: ['机器人成交必须选择机器人。', '渠道成交通过大弹窗从渠道字典选择，当前配置只允许一个渠道。', '指定手机号必须录入合法手机号并按脱敏形式展示。'] },
        { title: '角色差异', items: [`当前角色为「${currentRole().title}」。`, hasCapability('label:submit') ? '可提交自营或生态标签，审核按归属部门自动路由。' : '新增、编辑和停用按钮被禁用。'] }
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
          <div><span>分类数</span><strong>${state.categories.length}</strong><small>覆盖机器人、渠道、指定手机号、企业购与售后等业务域</small></div>
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
                  <div><code>${escapeHtml(category.code)}</code>${category.uniqueness ? `<span class="taxonomy-uniqueness">${category.uniqueness === 'single' ? '同部门唯一' : '绑定值唯一'}</span>` : ''}</div>
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

        <section class="content-panel system-parameter-panel">
          <div class="panel-heading">
            <div><h2>标签编码系统参数 · REC_ORD_TYP</h2><p>标签弹窗只能从下列参数中选择编码；已绑定基础标签或业务标签的编码不可重复选择。</p></div>
            <span class="parameter-source-badge">系统参数主数据</span>
          </div>
          <div class="system-parameter-table">
            <div class="system-parameter-head"><span>code</span><span>上级 code</span><span>值</span><span>值2</span><span>占用状态</span></div>
            ${ORDER_TYPE_PARAMETERS.map((parameter) => {
              const status = systemCodeStatus(parameter.code);
              return `
                <div class="system-parameter-row ${parameter.isDemo ? 'is-demo' : ''}">
                  <code>${escapeHtml(parameter.code)}</code>
                  <span>${escapeHtml(parameter.parentCode || '—')}</span>
                  <strong>${escapeHtml(parameter.name)}</strong>
                  <span>${escapeHtml(parameter.value2)}</span>
                  <span class="system-code-status ${status.available ? 'is-free' : 'is-used'}">${escapeHtml(status.text)}</span>
                </div>
              `;
            }).join('')}
          </div>
          <div class="notice is-warning"><span>!</span><p>编码 34、35 及名称“买家 / 生态”等映射用于脱敏演示，上线前由系统负责人补齐正式 REC_ORD_TYP 参数；同步后仍须保持 code 全局唯一。</p></div>
        </section>

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
      review: reviewPanel('分类与编码：受控字典决定可选范围', '分类负责组织标签并约束绑定唯一性；REC_ORD_TYP 负责提供唯一标签编码。两者都不直接决定订单命中。', [
        { title: '数据来源', items: ['分类和字段选项来自统一配置字典。', '标签编码只读取系统参数 REC_ORD_TYP，不从页面输入。', '自定义业务分类不再提供。'] },
        { title: '编码唯一', items: ['基础标签占用编码 1 和 2。', '业务标签一旦绑定系统编码，其他标签不可重复选择。', '编辑标签时系统编码锁定，避免已发布口径漂移。'] },
        { title: '唯一性', items: ['保值换新、企业购在同部门只允许一个启用或待审核配置。', '同一渠道、手机号、机器人不能绑定多个生效标签。'] },
        { title: '交互检查', items: ['点击分类中的标签可查看标签详情。', '点击“查看标签”会携带分类筛选进入标签列表。', '分类变更不会触发订单重算。'] },
        { title: '待确认', items: ['Q-001：存量标签的部门、编码与数据来源。', '字段字典是否需要支持枚举值级权限控制。'] }
      ])
    };
  }

  function renderAttribution() {
    const transitionTraces = state.traces.filter((trace) => normalizeDepartment(trace.currentOwner) !== normalizeDepartment(trace.department));
    const buyerWon = state.traces.filter((trace) => trace.statisticsMode === 'buyer_won').length;
    const nonBuyerWon = state.traces.filter((trace) => trace.statisticsMode === 'non_buyer_won').length;
    const body = `
      <div class="view">
        ${pageHeader(
          'ATTRIBUTION / 01',
          '订单归属与统计模式',
          '成交归属决定不可变原始标签，当前货物归属决定统计模式；两个部门之间的实际扭转优先归入“自营扭转为生态”或“生态扭转为自营”。'
        )}

        <section class="statistics-mode-grid" aria-label="四个统计模式">
          ${STATISTICS_MODES.map((mode, index) => `
            <article class="statistics-mode-card is-${escapeHtml(mode.tone)}">
              <div><span>0${index + 1}</span><b>${escapeHtml(mode.priority)}</b></div>
              <h2>${escapeHtml(mode.name)}</h2>
              <p>${escapeHtml(mode.description)}</p>
              <small>${
                mode.id === 'buyer_won' ? `${buyerWon} 个演示订单`
                  : mode.id === 'non_buyer_won' ? `${nonBuyerWon} 个演示订单`
                    : mode.id === 'self_to_eco' ? `${transitionTraces.filter((trace) => trace.statisticsMode === mode.id).length} 个扭转订单`
                      : `${transitionTraces.filter((trace) => trace.statisticsMode === mode.id).length} 个扭转订单`
              }</small>
            </article>
          `).join('')}
        </section>

        <section class="attribution-model-panel">
          <div class="panel-heading">
            <div><h2>订单归属事实与标签口径</h2><p>一个订单同时保留不可变成交归属和可变化的当前货物归属，订单标签仍然只输出一个当前值。</p></div>
            <span class="parameter-source-badge">统计模型 · 受控派生</span>
          </div>
          <div class="attribution-flow">
            <div><span>成交归属</span><strong>自营 / 生态</strong><small>写入不可变原始标签</small></div>
            <i>+</i>
            <div><span>当前货物归属</span><strong>自营 / 生态</strong><small>由实际归属事件更新</small></div>
            <i>+</i>
            <div><span>中标方</span><strong>买家 / 非买家</strong><small>仅用于无扭转时区分</small></div>
            <i>→</i>
            <div class="is-result"><span>统计模式</span><strong>四选一</strong><small>扭转方向优先判定</small></div>
            <i>→</i>
            <div class="is-result"><span>当前业务标签</span><strong>唯一值</strong><small>规则按当前归属匹配</small></div>
          </div>
        </section>

        <section class="content-panel">
          <div class="panel-heading"><div><h2>统计模式判定规则</h2><p>建议按“先判扭转、再判中标方”的顺序生成互斥统计模式，避免同一订单被重复统计。</p></div></div>
          <div class="table-scroll">
            <table class="attribution-rule-table">
              <thead><tr><th>优先级</th><th>成交归属</th><th>当前货物归属</th><th>中标方</th><th>统计模式</th><th>原始标签处理</th></tr></thead>
              <tbody>
                <tr>
                  <td data-label="优先级"><b>01</b></td>
                  <td data-label="成交归属">自营</td>
                  <td data-label="当前货物归属">生态</td>
                  <td data-label="中标方">不限</td>
                  <td data-label="统计模式">${statisticsModeChip('self_to_eco')}</td>
                  <td data-label="原始标签处理">保持“闪回-闪回成交”</td>
                </tr>
                <tr>
                  <td data-label="优先级"><b>02</b></td>
                  <td data-label="成交归属">生态</td>
                  <td data-label="当前货物归属">自营</td>
                  <td data-label="中标方">不限</td>
                  <td data-label="统计模式">${statisticsModeChip('eco_to_self')}</td>
                  <td data-label="原始标签处理">保持“买家-买家成交”</td>
                </tr>
                <tr>
                  <td data-label="优先级"><b>03</b></td>
                  <td data-label="成交归属">与当前归属一致</td>
                  <td data-label="当前货物归属">自营或生态</td>
                  <td data-label="中标方">买家</td>
                  <td data-label="统计模式">${statisticsModeChip('buyer_won')}</td>
                  <td data-label="原始标签处理">保持成交时原始标签</td>
                </tr>
                <tr>
                  <td data-label="优先级"><b>04</b></td>
                  <td data-label="成交归属">与当前归属一致</td>
                  <td data-label="当前货物归属">自营或生态</td>
                  <td data-label="中标方">非买家</td>
                  <td data-label="统计模式">${statisticsModeChip('non_buyer_won')}</td>
                  <td data-label="原始标签处理">保持成交时原始标签</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="notice is-warning"><span>!</span><b>待业务确认 · Q-007</b><p>扭转订单是否必须先归入两种扭转模式、不再计入买卖家中标订单；以及“中标方”枚举中渠道、平台、审单等事实如何归为非买家。</p></div>
        </section>

        <section class="content-panel">
          <div class="panel-heading"><div><h2>订单归因样例</h2><p>标签与统计模式分开追溯；发生部门扭转时，原始标签保持不变。</p></div><button class="text-button" data-action="go-view" data-view="trace">进入订单追溯</button></div>
          <div class="attribution-order-list">
            ${state.traces.slice(0, 6).map((trace) => `
              <button class="attribution-order-card" type="button" data-action="select-trace" data-order="${escapeHtml(trace.orderNo)}">
                <div><code>${escapeHtml(trace.orderNo)}</code>${statisticsModeChip(trace.statisticsMode)}</div>
                <strong>${escapeHtml(trace.currentLabel)}</strong>
                <p>${escapeHtml(ownershipTransitionText(trace.department, trace.currentOwner))} · 中标方：${escapeHtml(trace.bidderParty === 'buyer' ? '买家' : '非买家')}</p>
                <small>原始标签：${escapeHtml(trace.originalLabel)}</small>
              </button>
            `).join('')}
          </div>
        </section>
      </div>
    `;
    return {
      body,
      review: reviewPanel('归属与统计：先确认货物归谁，再解释标签', '本页新增统计模式评审场景。统计归因不回写原始标签；规则按事件发生时的当前货物归属匹配。', [
        { title: '核心变化', items: ['订单同时保存成交归属和当前货物归属。', '自营与生态双向扭转成为独立统计模式。', '无扭转时按买家 / 非买家中标方分类。'] },
        { title: '标签边界', items: ['成交归属用于生成不可变原始标签。', '当前业务标签仍只允许一个值。', '统计模式变化不等于人工修改标签。'] },
        { title: '待确认', items: ['Q-007：扭转模式是否优先于买卖家中标模式。', 'Q-008：货物归属以哪个事件和数据源为生效依据。'] }
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

        ${responsibilityBand('rules')}

        <section class="rule-meter-grid">
          <article><span>生效规则</span><strong>${active.length}</strong><small>仅这些规则参与订单计算</small></article>
          <article><span>待审核规则</span><strong>${state.rules.filter((rule) => rule.status === 'pending').length}</strong><small>不参与当前订单计算</small></article>
          <article class="${conflicts.length ? 'is-danger' : ''}"><span>同优先级冲突</span><strong>${conflicts.length}</strong><small>${conflicts.length ? '必须处理后才能发布' : '目前无阻断'}</small></article>
          <article><span>当前规则版本</span><strong>${escapeHtml(state.ruleVersion)}</strong><small>每次发布生成独立只读版本</small></article>
        </section>

        <section class="priority-guide">
          <div class="priority-guide-intro">
            <span>EXECUTION ORDER</span>
            <h2>优先级为 1～999，数值越大越先执行</h2>
            <p>示例：优先级 300 的规则先于 250 参与胜出判断；只有最高优先级规则输出当前业务标签。</p>
          </div>
          <div class="priority-guide-scale" aria-label="优先级方向">
            <span>低优先</span><b>1</b><i></i><b>999</b><span>高优先</span>
          </div>
          <div class="priority-guide-risk">
            <span>同优先级</span>
            <strong>条件可同时满足且目标标签不同</strong>
            <small>系统阻止发布，要求调整优先级或条件</small>
          </div>
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
              <span>优先级</span><span>规则名称</span><span>当前货物归属</span><span>命中条件</span><span>输出标签</span><span>状态 / 版本</span><span>操作</span>
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
      review: reviewPanel('标签规则定义“何时命中”', '本页只从已审核标签目录选择目标标签，再配置条件、优先级和事件范围；标签名称与系统编码在业务标签页维护。', [
        { title: '菜单职责', items: ['业务标签维护“标签是什么”及其唯一系统编码。', '标签规则维护“订单何时变成该标签”。', '分离后同一业务标签可被多条规则引用，规则也不复制标签定义。'] },
        { title: '执行顺序', items: ['读取订单事实与所属部门。', '筛选该部门已审核、已生效且事件范围允许的规则。', '优先级数值越大越先执行，最高唯一规则胜出。', '无规则命中时保留原始标签。'] },
        { title: '配置入口', items: ['点击“新建规则”打开执行优先级配置区。', '输入 1～999、使用滑块或按 10 调整。', '排列预览实时显示新规则在本部门的执行位置。'] },
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
          '标签、规则与人工修复共用审核入口。提交人不能审核自己的事项；标签和规则按归属部门由对应审核人独立确认。',
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
        { title: '审核规则', items: ['提交人不能审核本人事项。', '自营、生态标签分别由本部门审核人确认。', '平台管理员不能替代部门审核人。', '审计日志记录确认人、角色、时间与版本。'] },
        { title: '状态变化', items: ['所有变更先进入待审核，不直接修改生产配置。', '驳回后回到草稿，已生效版本不受影响。', '审核通过后仍需记录发布版本和生效时间。'] },
        { title: '演示方式', items: ['切换为对应部门审核人，可确认或驳回本部门待审事项。', '当前事项由本人提交时，系统会明确提示不能自审。'] }
      ])
    };
  }

  function renderSimulator() {
    const forms = `
      <form id="simulation-form" class="simulation-form">
        <div class="form-section-head"><div><h2>构造订单事实</h2><p>试算只读取当前已生效规则，不写入订单。</p></div><span class="environment-tag">DEMO</span></div>
        <div class="form-grid form-grid-2">
          <label class="field"><span>成交归属（写入原始标签）</span><select class="select" name="department"><option value="self" ${ui.simulatorDepartment === 'self' ? 'selected' : ''}>自营</option><option value="eco" ${ui.simulatorDepartment === 'eco' ? 'selected' : ''}>生态</option></select></label>
          <label class="field"><span>当前货物归属</span><select class="select" name="currentOwner"><option value="self">自营</option><option value="eco">生态</option></select><small class="field-help">与成交归属不一致时进入双向扭转模式。</small></label>
          <label class="field"><span>中标方</span><select class="select" name="bidderParty"><option value="buyer">买家</option><option value="self" selected>自营 / 平台</option><option value="other">其他非买家</option></select><small class="field-help">仅在未发生部门扭转时区分买家中标和非买家中标。</small></label>
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
          <button type="button" data-action="preset" data-preset="buyer-won">买家中标</button>
          <button type="button" data-action="preset" data-preset="non-buyer-won">非买家中标</button>
          <button type="button" data-action="preset" data-preset="self-to-eco">自营转生态</button>
          <button type="button" data-action="preset" data-preset="eco-to-self">生态转自营</button>
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
        <p>结果将说明成交归属、当前货物归属、统计模式、全部命中候选、胜出规则与最终当前标签。</p>
      </div>
    `;

    const body = `
      <div class="view">
        ${pageHeader(
          'VALIDATION / 05',
          '规则试算与结果解释',
          '试算模拟一次订单事件，先展示货物归属与统计模式，再展示全部候选规则和唯一标签输出。它不追溯历史订单，也不修改订单当前标签。'
        )}
        <div class="simulator-layout">
          ${forms}
          <section class="simulation-result-panel">${result}</section>
        </div>

        <section class="coverage-grid">
          <article><span>已覆盖场景</span><strong>12 / 14</strong><p>覆盖买家中标、非买家中标、双向部门扭转、机器人、企业购与渠道。</p></article>
          <article><span>待补场景</span><strong>2</strong><p>存量未归类标签和生产 REC_ORD_TYP 参数仍需业务确认。</p></article>
          <article><span>执行边界</span><strong>只读</strong><p>试算不产生标签版本、事件流水或订单写入。</p></article>
        </section>
      </div>
    `;
    return {
      body,
      review: reviewPanel('规则试算：解释为什么命中', '本场景用于确认业务人员能理解“命中哪条、为什么胜出、为什么没命中”。', [
        { title: '结果结构', items: ['原始标签来自订单部门，不参与规则竞争。', '候选规则同时展示命中与未命中原因。', '最高优先级唯一规则胜出；冲突时不输出新标签。'] },
        { title: '关键验证', items: ['依次运行买家中标、非买家中标、自营转生态和生态转自营四个预设。', '扭转模式优先于买卖家中标模式；原始标签始终不变。', '无命中时必须保留原始标签，试算记录只保存在浏览器中。'] },
        { title: '待确认', items: ['Q-002：除成交、渠道修正和归属变更外，哪些事件允许重新计算标签。', 'Q-007：四个统计模式是否必须互斥。'] }
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
      <div class="simulation-attribution">
        <div><span>统计模式</span>${statisticsModeChip(result.statisticsMode)}</div>
        <div><span>成交归属</span><strong>${escapeHtml(departmentName(result.sourceDepartment))}</strong></div>
        <div><span>当前货物归属</span><strong>${escapeHtml(departmentName(result.currentOwner))}</strong></div>
        <div><span>归属路径</span><strong>${escapeHtml(ownershipTransitionText(result.sourceDepartment, result.currentOwner))}</strong></div>
      </div>
      <div class="result-label-path">
        <div><span>原始业务标签</span><strong>${escapeHtml(result.originalLabel)}</strong><small>不可变</small></div>
        <i aria-hidden="true">→</i>
        <div class="is-current"><span>当前业务标签</span><strong>${escapeHtml(result.currentLabel)}</strong><small>${winner ? `${escapeHtml(winner.id)} · ${escapeHtml(winner.version)}` : '未命中，沿用原始标签'}</small></div>
      </div>
      <div class="result-facts">
        <span><b>事件</b>${escapeHtml(state.eventCatalog.find((event) => event.id === result.eventType)?.name || result.eventType)}</span>
        <span><b>规则归属</b>${escapeHtml(departmentName(result.department))}</span>
        <span><b>中标方</b>${escapeHtml(result.bidderParty === 'buyer' ? '买家' : '非买家')}</span>
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
                <small>${escapeHtml(statisticsModeMeta(trace.statisticsMode).name)} · ${escapeHtml(trace.status)} · ${escapeHtml(trace.updatedAt)}</small>
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
              <div class="trace-attribution-panel">
                <div><span>成交归属</span><strong>${escapeHtml(departmentName(active.department))}</strong><small>决定原始标签</small></div>
                <i>→</i>
                <div><span>当前货物归属</span><strong>${escapeHtml(departmentName(active.currentOwner))}</strong><small>${escapeHtml(ownershipTransitionText(active.department, active.currentOwner))}</small></div>
                <i>→</i>
                <div class="is-statistics"><span>统计模式</span>${statisticsModeChip(active.statisticsMode)}<small>中标方：${escapeHtml(active.bidderParty === 'buyer' ? '买家' : '非买家')}</small></div>
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
        { title: '数据来源', items: ['原始标签来自成交归属事件。', '当前货物归属来自已生效的物权或归属变更事件。', '统计模式由成交归属、当前货物归属和中标方派生。', '当前标签来自唯一胜出规则或经审批的人工修复。'] },
        { title: '操作边界', items: [`当前角色为「${currentRole().title}」。`, hasCapability('manual:submit') ? '可发起异常修复审批，但不会直接修改订单。' : '异常修复入口被禁用。', '已有待审批修复时不可重复提交。'] },
        { title: '待确认', items: ['Q-004：报表如何标识新旧口径切换时间。', 'Q-007：扭转模式是否优先于买卖家中标模式。', 'Q-008：货物当前归属以哪个业务事件为最终依据。'] }
      ])
    };
  }

  function renderRuntime() {
    const roleRows = [
      ['自营配置人', '全局标签定义、自营规则与追溯', '提交自营或生态标签；维护自营规则', '不能审核本人事项'],
      ['生态配置人', '全局标签定义、生态规则与追溯', '提交自营或生态标签；维护生态规则', '不能审核本人事项'],
      ['自营 / 生态审核人', '本部门待审事项', '确认或驳回本部门事项', '不可审核本人提交内容'],
      ['平台管理员', '全局标签、系统编码、冲突与规则', '复核系统参数与全局冲突', '不能替代部门审核'],
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
          <div class="panel-heading"><div><h2>角色权限矩阵</h2><p>标签定义可统一查看和提交，审核权限按标签归属部门隔离。</p></div><span class="current-role-hint">当前：${escapeHtml(currentRole().title)}</span></div>
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
        { title: '阻塞项', items: ['Q-002：成交后哪些事件允许重算。', 'Q-003：审核岗位及部门审核顺序。', 'Q-005：异常修复的发起、审核和执行责任人。'] },
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
    closeChannelPicker();
    closeSystemCodePicker();
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
        <code>REC_ORD_TYP · ${escapeHtml(systemCodeForLabel(label))} · ${escapeHtml(systemParameterByCode(systemCodeForLabel(label))?.name || '未匹配参数')}</code>
        <p>${escapeHtml(label.description)}</p>
      </div>
      <dl class="detail-grid">
        <div><dt>系统标签编码</dt><dd class="mono-cell">${escapeHtml(systemCodeForLabel(label))} · ${escapeHtml(systemParameterByCode(systemCodeForLabel(label))?.value2 || '—')}</dd></div>
        <div><dt>适用部门</dt><dd>${departmentChip(label.department)}</dd></div>
        <div><dt>标签分类</dt><dd>${escapeHtml(categoryMeta(label.categoryId).name)}</dd></div>
        ${categoryBindingText(label) ? `<div><dt>${escapeHtml(categoryBindingFieldName(label.categoryId))}</dt><dd>${escapeHtml(categoryBindingText(label))}</dd></div>` : ''}
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
    const editing = Boolean(label);
    const selectedDepartment = label?.department || defaultLabelDepartment();
    const selectedSystemCode = systemCodeForLabel(label);
    const selectedParameter = systemParameterByCode(selectedSystemCode);
    const body = `
      <form id="label-form" class="dialog-form" ${editing ? `data-id="${escapeHtml(label.id)}"` : ''}>
        <div class="form-grid form-grid-2">
          <label class="field"><span>标签名称 <b>*</b></span><input class="input" name="name" required maxlength="30" value="${escapeHtml(label?.name || '')}" placeholder="例如：买家-企业购" /></label>
          <label class="field"><span>标签编码 <b>*</b></span><input type="hidden" name="systemCode" value="${escapeHtml(selectedSystemCode)}" /><button class="system-code-trigger ${selectedSystemCode ? 'has-value' : ''}" type="button" data-action="open-system-code-picker" ${editing ? 'disabled title="编辑时锁定系统编码"' : ''}><span>${selectedSystemCode ? `REC_ORD_TYP · ${escapeHtml(selectedSystemCode)}` : '请选择系统参数编码'}</span><small>${selectedSystemCode ? escapeHtml(selectedParameter?.name || '参数待同步') : '编码来自系统参数，不允许手工输入'}</small><b>${editing ? '已锁定' : '选择'}</b></button><small class="field-help">系统编码唯一绑定业务标签，发布后不可修改。</small></label>
          <div class="field-full system-code-preview ${selectedSystemCode ? 'has-value' : ''}" id="label-system-code-preview"><span>系统编码</span><strong>${escapeHtml(selectedSystemCode || '—')}</strong><div><b>${escapeHtml(selectedParameter?.name || '尚未选择')}</b><small>${selectedSystemCode ? `值2：${escapeHtml(selectedParameter?.value2 || '—')} · ${escapeHtml(systemCodeStatus(selectedSystemCode, label?.id || '').text)}` : '编码来自系统参数 REC_ORD_TYP'}</small></div></div>
          ${departmentRadioGroup(selectedDepartment)}
          <label class="field"><span>标签分类 <b>*</b></span><select class="select" name="categoryId" required>${state.categories.map((category) => `<option value="${escapeHtml(category.id)}" ${label?.categoryId === category.id ? 'selected' : ''}>${escapeHtml(category.name)}</option>`).join('')}</select><small class="field-help">分类决定下方需要补充的业务明细。</small></label>
          <div class="field-full" id="label-category-attribute">${categoryFieldMarkup(label?.categoryId || state.categories[0]?.id, label)}</div>
          <div class="field-full label-uniqueness-check" id="label-uniqueness-check" aria-live="polite"></div>
          <label class="field field-full"><span>责任人 <b>*</b></span><input class="input" name="owner" required maxlength="30" value="${escapeHtml(label?.owner || currentRole().title.replace('配置人', '运营'))}" placeholder="负责日常维护与异常响应" /></label>
          <label class="field field-full"><span>业务说明 <b>*</b></span><textarea class="textarea" name="description" required maxlength="200" placeholder="说明业务含义、适用边界和不适用场景">${escapeHtml(label?.description || '')}</textarea></label>
        </div>
        <div class="notice is-info"><span>i</span><p>标签编码只来自 REC_ORD_TYP，新建时只能选择未被占用的编码，编辑时锁定。提交后生成待审核版本，原生效版本继续使用。</p></div>
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
    updateLabelUniquenessCheck(document.getElementById('label-form'));
  }

  function submitLabel(form) {
    const formData = new FormData(form);
    const editingId = form.dataset.id || '';
    const systemCode = String(formData.get('systemCode') || '').trim();
    const systemParameter = systemParameterByCode(systemCode);
    if (!systemParameter) {
      showToast('请选择标签编码', '标签编码只允许从系统参数 REC_ORD_TYP 中选择。', true);
      return;
    }
    const systemCodeConflicts = labelsUsingSystemCode(systemCode, editingId);
    if (systemCodeConflicts.length) {
      showToast('标签编码已被占用', `编码 ${systemCode} 已绑定“${systemCodeConflicts.map((label) => label.name).join('、')}”，每个系统编码只能使用一次。`, true);
      return;
    }
    const department = String(formData.get('department'));
    const previous = editingId ? findLabel(editingId) : null;
    const validDepartment = ['self', 'eco'].includes(department);
    if (!validDepartment) {
      showToast('请选择适用部门', '新增业务标签只能在自营、生态中选择一个部门。', true);
      return;
    }
    const categoryId = String(formData.get('categoryId'));
    const categoryField = LABEL_CATEGORY_FIELDS[categoryId];
    const rawCategoryValue = String(formData.get('categoryValue') || '').trim();
    if (categoryField && !rawCategoryValue) {
      showToast('请补充分类信息', `${categoryField.label}为必填项。`, true);
      return;
    }
    if (categoryId === 'cat_phone' && !/^1[3-9]\d{9}$/.test(rawCategoryValue)) {
      showToast('手机号格式不正确', '请输入 11 位中国大陆手机号。', true);
      return;
    }
    if (categoryField?.type === 'select' && !categoryField.options.some((option) => option.id === rawCategoryValue)) {
      showToast('请选择有效分类明细', `${categoryField.label}的值不在受控选项中。`, true);
      return;
    }
    let categoryConfig = null;
    if (categoryField) {
      const selected = categoryField.options?.find((option) => option.id === rawCategoryValue);
      categoryConfig = {
        value: rawCategoryValue,
        name: categoryId === 'cat_phone' ? maskPhone(rawCategoryValue) : (selected?.name || rawCategoryValue)
      };
    }
    const uniquenessConflicts = labelUniquenessConflicts({
      id: editingId,
      department,
      categoryId,
      categoryConfig
    });
    if (uniquenessConflicts.length) {
      const rule = uniquenessRule(categoryId);
      const message = rule.type === 'single'
        ? `同一部门已有“${uniquenessConflicts.map((item) => item.name).join('、')}”，该非录入分类只能保留一个有效或待审核配置。`
        : `“${categoryConfig?.name || rawCategoryValue}”已绑定生效标签“${uniquenessConflicts.map((item) => item.name).join('、')}”，同一绑定值不能同时生效多个配置。`;
      showToast('配置唯一性冲突', message, true);
      updateLabelUniquenessCheck(form);
      return;
    }
    const labelId = editingId || `tag_${Date.now()}`;
    const label = {
      id: labelId,
      code: previous?.code || `ORDER_TYPE_${systemCode}`,
      systemCode,
      name: String(formData.get('name')).trim(),
      department,
      categoryId,
      categoryConfig,
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
      summary: `${editingId ? '修改' : '新增'}业务标签 REC_ORD_TYP ${systemCode}（${systemParameter.name}）；归属${departmentName(department)}；分类为${categoryMeta(categoryId).name}${categoryConfig ? `，${categoryBindingFieldName(categoryId)}：${categoryConfig.name}` : ''}。`,
      impact: '审核通过后仅允许新规则引用；不修改历史订单标签。',
      conflicts: 0,
      requiredApprovals: [department === 'self' ? '自营审核人' : '生态审核人'],
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
      summary: `停用业务标签 REC_ORD_TYP ${systemCodeForLabel(label)}（${label.name}）。`,
      impact: '历史订单保持不变；停用后不再允许新规则引用。',
      conflicts: 0,
      requiredApprovals: [normalizeDepartment(label.department) === 'self' ? '自营审核人' : '生态审核人'],
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
      .filter((label) => normalizeDepartment(label.department) === normalized)
      .map((label) => `<option value="${escapeHtml(label.id)}" ${label.id === selected ? 'selected' : ''}>${escapeHtml(label.name)} · REC_ORD_TYP ${escapeHtml(systemCodeForLabel(label))} · ${escapeHtml(departmentName(label.department))}</option>`)
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
        <div class="form-grid form-grid-2">
          <label class="field field-full"><span>规则名称 <b>*</b></span><input class="input" name="name" required maxlength="40" placeholder="例如：生态平台兜底成交" /></label>
          <label class="field"><span>适用当前货物归属 <b>*</b></span><select class="select" name="department">${departmentOptions.map((department) => `<option value="${department}" ${department === initialDepartment ? 'selected' : ''}>${escapeHtml(departmentName(department))}</option>`).join('')}</select><small class="field-help">按事件发生时的当前货物归属匹配规则。</small></label>
          <label class="field"><span>目标业务标签 <b>*</b></span><select class="select" name="targetLabelId">${targetLabelOptions(initialDepartment)}</select></label>
        </div>
        <section class="priority-config">
          <div class="priority-config-head">
            <div><span>EXECUTION PRIORITY</span><h3>执行优先级</h3><p>同一订单被多条规则命中时，数值大的规则先执行并作为胜出候选。</p></div>
            <strong>1～999</strong>
          </div>
          <div class="priority-editor">
            <div class="priority-number-control">
              <button type="button" class="priority-step-button" data-action="priority-adjust" data-delta="-10" aria-label="优先级降低 10">−10</button>
              <label>
                <span>当前值</span>
                <input class="input mono" name="priority" type="number" min="1" max="999" step="1" value="250" required aria-label="执行优先级数值" />
              </label>
              <button type="button" class="priority-step-button" data-action="priority-adjust" data-delta="10" aria-label="优先级提高 10">+10</button>
            </div>
            <div class="priority-slider">
              <span>低</span>
              <input type="range" min="1" max="999" step="1" value="250" data-priority-range aria-label="执行优先级滑块" />
              <span>高</span>
            </div>
          </div>
          <div class="priority-ranking" id="priority-ranking" aria-live="polite"></div>
        </section>
        <section class="condition-builder">
          <div class="condition-builder-head"><div><h3>命中条件</h3><p>条件之间为“且”。可直接按统计模式、当前货物归属或成交工具配置。</p></div><span>ALL CONDITIONS</span></div>
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
    updateRuleCheck(document.getElementById('rule-form'));
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
      && normalizeDepartment(target.department) === normalizeDepartment(department);
    const panel = document.getElementById('live-rule-check');
    if (!panel) return;
    const ranking = document.getElementById('priority-ranking');
    if (ranking) ranking.innerHTML = priorityRankingMarkup(form, department, priority, target);
    panel.classList.toggle('has-conflict', conflicts.length > 0 || !targetValid);
    panel.innerHTML = `<span>LIVE CHECK</span><strong>${escapeHtml(departmentName(department))} · 优先级 ${priority || '—'} → ${escapeHtml(target?.name || '未选择标签')}</strong><p>${conditions.length ? escapeHtml(conditionsText(conditions)) : '尚未设置完整条件'}</p><div class="${conflicts.length || !targetValid ? 'is-danger' : 'is-success'}">${!targetValid ? '目标标签不可用或不属于该部门，请重新选择' : conflicts.length ? `发现 ${conflicts.length} 条冲突：${conflicts.map((rule) => rule.id).join('、')}` : '冲突检查通过，可继续提交审核'}</div>`;
  }

  function priorityRankingMarkup(form, department, priority, target) {
    const proposedName = String(form.elements.name?.value || '').trim() || '当前待提交规则';
    const existing = state.rules
      .filter((rule) => normalizeDepartment(rule.department) === normalizeDepartment(department))
      .filter((rule) => ['enabled', 'pending'].includes(rule.status))
      .map((rule) => ({
        id: rule.id,
        name: rule.name,
        priority: Number(rule.priority),
        status: rule.status === 'enabled' ? '生效中' : '待审核',
        isDraft: false
      }));
    const items = [
      ...existing,
      {
        id: 'DRAFT',
        name: proposedName,
        priority: priority || 0,
        targetName: target?.name || '未选择标签',
        status: '当前配置',
        isDraft: true
      }
    ].sort((first, second) => second.priority - first.priority || Number(first.isDraft) - Number(second.isDraft));
    const samePriority = existing.filter((rule) => rule.priority === priority).length;
    return `
      <div class="priority-ranking-head">
        <div><h4>本部门规则顺序预览</h4><p>按优先级从高到低排列；若同一订单命中多条，排在前面的规则先胜出。</p></div>
        <span>${escapeHtml(departmentName(department))} · ${items.length} 条</span>
      </div>
      <div class="priority-ranking-list">
        ${items.map((item, index) => `
          <div class="priority-ranking-row ${item.isDraft ? 'is-draft' : ''}">
            <span class="priority-rank-index">${String(index + 1).padStart(2, '0')}</span>
            <div><strong>${escapeHtml(item.name)}</strong><small>${item.isDraft ? `${escapeHtml(item.targetName)} · ${item.status}` : `${escapeHtml(item.id)} · ${item.status}`}</small></div>
            <b>${item.priority || '—'}</b>
          </div>
        `).join('')}
      </div>
      <div class="priority-ranking-note">${samePriority ? `当前部门已有 ${samePriority} 条规则使用优先级 ${priority}，仍需检查条件是否可同时满足。` : `当前部门尚无其他规则使用优先级 ${priority || '—'}，仍需确认条件配置完整。`}</div>
    `;
  }

  function setRulePriority(form, value) {
    if (!form) return;
    const input = form.elements.priority;
    const slider = form.querySelector('[data-priority-range]');
    const parsed = Number(value);
    const priority = Number.isFinite(parsed) ? Math.min(999, Math.max(1, Math.round(parsed))) : 250;
    if (input) input.value = String(priority);
    if (slider) slider.value = String(priority);
    updateRuleCheck(form);
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
    if (!Number.isInteger(priority) || priority < 1 || priority > 999) {
      showToast('优先级不合法', '请输入 1～999 的整数，数值越大越先执行。', true);
      return;
    }
    if (!canManageDepartment(department)) {
      showToast('超出数据范围', '当前角色不能维护该部门规则。', true);
      return;
    }
    if (!target || !['enabled', 'pending'].includes(target.status)
      || normalizeDepartment(target.department) !== normalizeDepartment(department)) {
      showToast('目标标签不可用', '目标标签必须已生效或待审核，并且归属于规则所在部门。', true);
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
        <div><span>当前货物归属</span><strong>${escapeHtml(departmentName(rule.department))}</strong></div>
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
    const labelSubject = item.type === 'label' && item.operation !== 'disable'
      ? state.labels.find((label) => label.id === item.subjectId)
      : null;
    const uniquenessConflicts = labelSubject ? labelUniquenessConflicts(labelSubject) : [];
    const systemCodeConflicts = labelSubject ? labelsUsingSystemCode(systemCodeForLabel(labelSubject), labelSubject.id) : [];
    const approvalBlocked = uniquenessConflicts.length > 0 || systemCodeConflicts.length > 0;
    const rejectable = !isOwnSubmission && pendingRoles.some((role) => canApproveDepartment(approvalRoleKey(role)));
    const approvableRoles = pendingRoles.filter((role) => {
      if (isOwnSubmission) return false;
      if (approvalBlocked) return false;
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
          <div><span>${approvalBlocked || item.conflicts ? '!' : '✓'}</span><p>${systemCodeConflicts.length ? `系统编码冲突：${systemCodeConflicts.map((label) => label.name).join('、')}，发布被阻断` : uniquenessConflicts.length ? `唯一性冲突：${uniquenessConflicts.map((label) => label.name).join('、')}，发布被阻断` : item.conflicts ? `${item.conflicts} 条冲突，发布被阻断` : '规则冲突、系统编码与配置唯一性检查通过'}</p></div>
          <div><span>✓</span><p>默认不追溯历史订单，仅影响新订单及后续事件</p></div>
          <div><span>✓</span><p>操作将记录提交、审核、发布和前后版本差异</p></div>
        </div>
      </section>
      ${approvalBlocked ? `<div class="notice is-warning"><span>!</span><p><strong>发布前唯一性校验未通过。</strong>${systemCodeConflicts.length ? '同一 REC_ORD_TYP 编码已被其他标签占用。' : '同一非录入分类已存在有效配置，或同一渠道、手机号、机器人已绑定其他生效标签。'}请先调整冲突配置。</p></div>` : ''}
      ${item.submitter === currentRole().name ? '<div class="notice is-warning"><span>!</span><p>当前事项由你提交，系统禁止审核本人事项。请切换为独立审核人。</p></div>' : ''}
    `;
    const actionButtons = item.status === 'pending'
      ? `<button class="button button-danger" data-action="reject-approval" data-id="${escapeHtml(item.id)}" ${rejectable ? '' : 'disabled'}>驳回</button>${approvalBlocked ? '<button class="button button-primary" disabled>唯一性冲突 · 禁止发布</button>' : approvableRoles.map((role) => `<button class="button button-primary" data-action="approve-approval" data-id="${escapeHtml(item.id)}" data-role="${escapeHtml(role)}">以${escapeHtml(role.replace('审核人', ''))}身份同意</button>`).join('') || `<button class="button button-primary" disabled>当前角色不可审核</button>`}`
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
    if (item.type === 'label' && item.operation !== 'disable') {
      const label = state.labels.find((candidate) => candidate.id === item.subjectId);
      const conflicts = label ? labelUniquenessConflicts(label) : [];
      const codeConflicts = label ? labelsUsingSystemCode(systemCodeForLabel(label), label.id) : [];
      if (conflicts.length || codeConflicts.length) {
        item.conflicts = conflicts.length;
        saveState();
        showToast('唯一性冲突', codeConflicts.length ? `系统编码已被“${codeConflicts.map((candidate) => candidate.name).join('、')}”占用，禁止发布。` : `配置与“${conflicts.map((candidate) => candidate.name).join('、')}”重复，禁止发布。`, true);
        return;
      }
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
        <label class="field"><span>目标当前业务标签 <b>*</b></span><select class="select" name="targetLabelId">${state.labels.filter((label) => label.status === 'enabled' && normalizeDepartment(label.department) === normalizeDepartment(trace.department)).map((label) => `<option value="${escapeHtml(label.id)}">${escapeHtml(label.name)} · REC_ORD_TYP ${escapeHtml(systemCodeForLabel(label))}</option>`).join('')}</select></label>
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
      'self-robot': { department: 'self', currentOwner: 'self', bidderParty: 'self', eventType: 'ORDER_WON', dealMethod: 'robot', robotSource: 'self_multi', businessType: 'normal', channel: 'normal', phoneGroup: 'none', ownershipEvent: 'deal_only' },
      'eco-enterprise': { department: 'eco', currentOwner: 'eco', bidderParty: 'buyer', eventType: 'ORDER_WON', dealMethod: 'manual', robotSource: 'none', businessType: 'enterprise_purchase', channel: 'normal', phoneGroup: 'none', ownershipEvent: 'deal_only' },
      'buyer-won': { department: 'eco', currentOwner: 'eco', bidderParty: 'buyer', eventType: 'ORDER_WON', dealMethod: 'manual', robotSource: 'none', businessType: 'normal', channel: 'normal', phoneGroup: 'none', ownershipEvent: 'deal_only' },
      'non-buyer-won': { department: 'self', currentOwner: 'self', bidderParty: 'self', eventType: 'ORDER_WON', dealMethod: 'manual', robotSource: 'none', businessType: 'normal', channel: 'normal', phoneGroup: 'none', ownershipEvent: 'deal_only' },
      'self-to-eco': { department: 'self', currentOwner: 'eco', bidderParty: 'self', eventType: 'OWNERSHIP_EFFECTIVE', dealMethod: 'manual', robotSource: 'none', businessType: 'normal', channel: 'normal', phoneGroup: 'none', ownershipEvent: 'after_sale_effective' },
      'eco-to-self': { department: 'eco', currentOwner: 'self', bidderParty: 'buyer', eventType: 'OWNERSHIP_EFFECTIVE', dealMethod: 'manual', robotSource: 'none', businessType: 'normal', channel: 'normal', phoneGroup: 'none', ownershipEvent: 'active_transfer' },
      'no-hit': { department: 'self', currentOwner: 'self', bidderParty: 'other', eventType: 'ORDER_WON', dealMethod: 'manual', robotSource: 'none', businessType: 'normal', channel: 'normal', phoneGroup: 'none', ownershipEvent: 'deal_only' }
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
    const labelForm = document.getElementById('label-form');
    if (action === 'open-channel-picker') openChannelPicker(labelForm);
    if (action === 'close-channel-picker') closeChannelPicker();
    if (action === 'clear-channel-picker') {
      const layer = document.getElementById('channel-picker-layer');
      if (layer) layer.dataset.selected = '';
      renderChannelPicker(labelForm, document.getElementById('channel-picker-name-search')?.value || '', document.getElementById('channel-picker-code-search')?.value || '');
    }
    if (action === 'select-channel') {
      const layer = document.getElementById('channel-picker-layer');
      if (layer) layer.dataset.selected = String(element.dataset.code || '');
      renderChannelPicker(labelForm, document.getElementById('channel-picker-name-search')?.value || '', document.getElementById('channel-picker-code-search')?.value || '');
    }
    if (action === 'save-channel-picker') saveChannelPicker(labelForm);
    if (action === 'open-system-code-picker') openSystemCodePicker(labelForm);
    if (action === 'close-system-code-picker') closeSystemCodePicker();
    if (action === 'select-system-code') {
      const layer = document.getElementById('system-code-picker-layer');
      if (layer) layer.dataset.selected = String(element.dataset.code || '');
      renderSystemCodePicker(labelForm, document.getElementById('system-code-search')?.value || '');
    }
    if (action === 'save-system-code-picker') saveSystemCodePicker(labelForm);
    if (action === 'priority-adjust') {
      const form = element.closest('#rule-form');
      const current = Number(form?.elements.priority?.value || 250);
      setRulePriority(form, current + Number(element.dataset.delta || 0));
      return;
    }
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
    if (event.target.id === 'channel-picker-name-search' || event.target.id === 'channel-picker-code-search') {
      const labelForm = document.getElementById('label-form');
      const nameQuery = document.getElementById('channel-picker-name-search')?.value || '';
      const codeQuery = document.getElementById('channel-picker-code-search')?.value || '';
      const focusId = event.target.id;
      const selectionStart = event.target.selectionStart;
      renderChannelPicker(labelForm, nameQuery, codeQuery);
      const focused = document.getElementById(focusId);
      if (focused) {
        focused.focus();
        focused.setSelectionRange(selectionStart, selectionStart);
      }
    }
    if (event.target.id === 'system-code-search') {
      const labelForm = document.getElementById('label-form');
      const query = event.target.value;
      const selectionStart = event.target.selectionStart;
      renderSystemCodePicker(labelForm, query);
      const focused = document.getElementById('system-code-search');
      if (focused) {
        focused.focus();
        focused.setSelectionRange(selectionStart, selectionStart);
      }
    }
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
    if (event.target.matches('#label-form [name="categoryValue"][type="tel"]')) {
      const digits = event.target.value.replace(/\D/g, '').slice(0, 11);
      if (event.target.value !== digits) event.target.value = digits;
      updateLabelUniquenessCheck(event.target.form);
    }
    if (event.target.matches('#rule-form [name="priority"]')) {
      const form = event.target.form;
      const slider = form?.querySelector('[data-priority-range]');
      const value = Number(event.target.value);
      if (slider && Number.isFinite(value) && value >= 1 && value <= 999) slider.value = String(value);
      if (form) updateRuleCheck(form);
    }
    if (event.target.matches('#rule-form [data-priority-range]')) {
      const form = event.target.form;
      const input = form?.elements.priority;
      if (input) input.value = event.target.value;
      if (form) updateRuleCheck(form);
    }
    if (event.target.matches('#rule-form [name="name"]')) {
      const form = event.target.form;
      if (form) updateRuleCheck(form);
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
    if (event.target.matches('#rule-form [name="priority"]')) {
      setRulePriority(event.target.form, event.target.value);
    }
    if (event.target.matches('#label-form [name="categoryId"]')) {
      updateLabelCategoryField(event.target.form);
    }
    if (event.target.matches('#label-form [name="categoryValue"]:not([type="tel"])') || event.target.matches('#label-form [name="department"]')) {
      updateLabelUniquenessCheck(event.target.form);
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
