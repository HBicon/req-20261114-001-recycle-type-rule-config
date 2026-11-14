(() => {
  'use strict';

  const STORAGE_KEY = 'recycle-type-rule-center-v1';

  const DIMENSIONS = {
    winner: { name: '中标方', en: 'WINNER', color: '#526df6', description: '按最终成交主体归类' },
    phone: { name: '指定手机号', en: 'PHONE', color: '#ff774f', description: '按加密名单命中结果归类' },
    channel: { name: '渠道', en: 'CHANNEL', color: '#16836d', description: '按订单来源渠道归类' },
    robot: { name: '机器人名称', en: 'ROBOT', color: '#9a761f', description: '按中标机器人身份归类' },
    business: { name: '特殊业务类型', en: 'BUSINESS', color: '#7c6a46', description: '按保值换新、企业购等业务场景归类' }
  };

  const CHANNELS = [
    { id: 'retail', name: '零售通' },
    { id: 'enterprise', name: '企业购渠道' },
    { id: 'store', name: '门店渠道' },
    { id: 'douyin', name: '抖音渠道' }
  ];

  const ROBOTS = [
    { id: 'r5', name: '5号机器人', code: 'RB-005' },
    { id: 'precision', name: '精准机器人', code: 'RB-P01' },
    { id: 'fallback', name: '兜底机器人', code: 'RB-F01' }
  ];

  const PHONE_LISTS = [
    { id: 'phone-a', name: '重点客户名单 A', version: 'v3', masked: '共 128 个脱敏号码' }
  ];

  const WINNERS = [
    { id: 'buyer', name: '买家' },
    { id: 'recycler', name: '回收商' },
    { id: 'robot', name: '机器人' }
  ];

  const TRANSFER_SCENES = [
    { id: 'pre_sale', name: '成交后、未起售' },
    { id: 'after_sale', name: '买家售后转移' }
  ];

  const TRANSFER_DIRECTIONS = [
    { id: 'to_platform', name: '转回平台' },
    { id: 'to_buyer', name: '转给买家' },
    { id: 'to_recycler', name: '转给回收商' }
  ];

  const AFTER_SALE_STATUSES = [
    { id: 'effective', name: '售后审核通过且物权生效' },
    { id: 'requested', name: '仅提交售后申请' }
  ];

  const DIMENSION_OPTIONS = {
    winner: WINNERS,
    phone: PHONE_LISTS,
    channel: CHANNELS,
    robot: ROBOTS,
    business_type: [],
    transfer_scene: TRANSFER_SCENES,
    current_type: [],
    transfer_direction: TRANSFER_DIRECTIONS,
    after_sale_status: AFTER_SALE_STATUSES
  };

  const CONDITION_LABELS = {
    winner: '中标方',
    phone: '指定手机号',
    channel: '渠道',
    robot: '机器人名称',
    business_type: '特殊业务类型',
    transfer_scene: '物权转移场景',
    current_type: '当前回收类型',
    transfer_direction: '物权转移方向',
    after_sale_status: '售后状态'
  };

  const DEAL_DIMENSIONS = ['business_type', 'phone', 'channel', 'robot', 'winner'];
  const TRANSFER_DIMENSIONS = ['transfer_scene', 'current_type', 'transfer_direction', 'after_sale_status'];

  const VIEW_META = {
    overview: { label: '总览', group: '工作台', crumb: 'WORKBENCH' },
    business: { label: '业务类型', group: '配置', crumb: 'BUSINESS PARAMS' },
    recycle: { label: '回收类型', group: '配置', crumb: 'RECYCLE TYPES' },
    rules: { label: '分类规则', group: '规则与事件', crumb: 'CLASSIFICATION RULES' },
    transfer: { label: '物权转移', group: '规则与事件', crumb: 'OWNERSHIP EVENTS' },
    simulator: { label: '规则试算', group: '验证与追溯', crumb: 'RULE SIMULATOR' },
    trace: { label: '类型追溯', group: '验证与追溯', crumb: 'TYPE TRACE' }
  };

  const ui = {
    view: 'overview',
    ruleStage: 'deal',
    typeDimension: 'all',
    activeTrace: 'TC202611140083',
    simDirty: false
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function createDefaultState() {
    return {
      version: 1,
      transferPolicy: 'effective',
      businessTypes: [
        {
          id: 'bt_standard',
          name: '普通回收',
          code: 'STANDARD_RECYCLE',
          description: '没有特殊业务标记的常规回收订单。',
          owner: '回收业务运营',
          status: 'enabled',
          updatedAt: '11-12 09:20'
        },
        {
          id: 'bt_value',
          name: '保值换新',
          code: 'VALUE_TRADE_IN',
          description: '品牌以旧换新、保值换新与换机补贴场景。',
          owner: '渠道运营',
          status: 'enabled',
          updatedAt: '11-13 16:20'
        },
        {
          id: 'bt_enterprise',
          name: '企业购',
          code: 'ENTERPRISE_PURCHASE',
          description: '企业客户批量采购、企业换新与企业结算场景。',
          owner: '企业业务运营',
          status: 'enabled',
          updatedAt: '11-13 11:05'
        },
        {
          id: 'bt_carrier',
          name: '运营商合约',
          code: 'CARRIER_CONTRACT',
          description: '运营商合约机返还与合约到期换新场景。',
          owner: '运营商运营',
          status: 'draft',
          updatedAt: '11-12 18:42'
        }
      ],
      recycleTypes: [
        {
          id: 'rt_bidder',
          name: '中标方回收',
          code: 'RT-BIDDER',
          dimension: 'winner',
          usage: 'deal',
          settlement: '购销',
          entity: '买家结算主体',
          legacyCode: '20',
          allowTransfer: true,
          status: 'enabled',
          version: 'v1.2',
          updatedAt: '11-12 09:20'
        },
        {
          id: 'rt_phone',
          name: '指定手机号回收',
          code: 'RT-PHONE',
          dimension: 'phone',
          usage: 'deal',
          settlement: '购销',
          entity: '深圳闪回',
          legacyCode: '41',
          allowTransfer: true,
          status: 'enabled',
          version: 'v1.3',
          updatedAt: '11-13 16:22'
        },
        {
          id: 'rt_channel',
          name: '指定渠道回收',
          code: 'RT-CHANNEL',
          dimension: 'channel',
          usage: 'deal',
          settlement: '购销',
          entity: '浙江闪回',
          legacyCode: '42',
          allowTransfer: true,
          status: 'enabled',
          version: 'v1.1',
          updatedAt: '11-11 14:06'
        },
        {
          id: 'rt_robot',
          name: '机器人回收',
          code: 'RT-ROBOT',
          dimension: 'robot',
          usage: 'deal',
          settlement: '代付',
          entity: '自营主体',
          legacyCode: '43',
          allowTransfer: true,
          status: 'enabled',
          version: 'v1.2',
          updatedAt: '11-13 10:18'
        },
        {
          id: 'rt_value',
          name: '保值换新回收',
          code: 'RT-VALUE',
          dimension: 'business',
          usage: 'deal',
          settlement: '代付',
          entity: '深圳闪回',
          legacyCode: '51',
          allowTransfer: true,
          status: 'enabled',
          version: 'v1.0',
          updatedAt: '11-12 17:32'
        },
        {
          id: 'rt_enterprise',
          name: '企业购回收',
          code: 'RT-ENTERPRISE',
          dimension: 'business',
          usage: 'deal',
          settlement: '代付',
          entity: '企业业务主体',
          legacyCode: '52',
          allowTransfer: true,
          status: 'enabled',
          version: 'v1.0',
          updatedAt: '11-13 11:06'
        },
        {
          id: 'rt_purchase',
          name: '购销回收',
          code: 'RT-PURCHASE',
          dimension: 'business',
          usage: 'transfer',
          settlement: '购销',
          entity: '深圳闪回',
          legacyCode: '61',
          allowTransfer: false,
          status: 'enabled',
          version: 'v1.1',
          updatedAt: '11-13 18:14'
        },
        {
          id: 'rt_aftersale',
          name: '售后回收',
          code: 'RT-AFTERSALE',
          dimension: 'business',
          usage: 'transfer',
          settlement: '购销',
          entity: '深圳闪回',
          legacyCode: '62',
          allowTransfer: false,
          status: 'enabled',
          version: 'v1.0',
          updatedAt: '11-14 09:36'
        }
      ],
      rules: [
        {
          id: 'R-DEAL-001',
          name: '指定手机号优先归类',
          stage: 'deal',
          priority: 100,
          targetTypeId: 'rt_phone',
          status: 'enabled',
          conditions: [{ dimension: 'phone', value: 'phone-a' }],
          tags: ['指定手机号'],
          stopOnMatch: true,
          version: 'v1.4',
          updatedAt: '11-13 16:22'
        },
        {
          id: 'R-DEAL-002',
          name: '保值换新业务归类',
          stage: 'deal',
          priority: 95,
          targetTypeId: 'rt_value',
          status: 'enabled',
          conditions: [{ dimension: 'business_type', value: 'bt_value' }],
          tags: ['保值换新'],
          stopOnMatch: true,
          version: 'v1.4',
          updatedAt: '11-13 16:18'
        },
        {
          id: 'R-DEAL-003',
          name: '企业购业务归类',
          stage: 'deal',
          priority: 90,
          targetTypeId: 'rt_enterprise',
          status: 'enabled',
          conditions: [{ dimension: 'business_type', value: 'bt_enterprise' }],
          tags: ['企业购'],
          stopOnMatch: true,
          version: 'v1.4',
          updatedAt: '11-13 11:06'
        },
        {
          id: 'R-DEAL-004',
          name: '5号机器人中标归类',
          stage: 'deal',
          priority: 80,
          targetTypeId: 'rt_robot',
          status: 'enabled',
          conditions: [
            { dimension: 'winner', value: 'robot' },
            { dimension: 'robot', value: 'r5' }
          ],
          tags: ['机器人：5号机器人'],
          stopOnMatch: true,
          version: 'v1.3',
          updatedAt: '11-13 10:18'
        },
        {
          id: 'R-DEAL-005',
          name: '零售通渠道归类',
          stage: 'deal',
          priority: 60,
          targetTypeId: 'rt_channel',
          status: 'enabled',
          conditions: [{ dimension: 'channel', value: 'retail' }],
          tags: ['零售通'],
          stopOnMatch: true,
          version: 'v1.2',
          updatedAt: '11-12 15:40'
        },
        {
          id: 'R-DEAL-006',
          name: '中标方显式兜底',
          stage: 'deal',
          priority: 10,
          targetTypeId: 'rt_bidder',
          status: 'enabled',
          conditions: [],
          tags: ['中标方'],
          stopOnMatch: true,
          version: 'v1.1',
          updatedAt: '11-10 09:12'
        },
        {
          id: 'R-OWN-001',
          name: '成交未起售物权回平台',
          stage: 'transfer',
          priority: 200,
          targetTypeId: 'rt_purchase',
          status: 'enabled',
          conditions: [{ dimension: 'transfer_scene', value: 'pre_sale' }],
          tags: ['物权转移', '未起售'],
          stopOnMatch: true,
          version: 'v1.2',
          updatedAt: '11-13 18:14'
        },
        {
          id: 'R-OWN-002',
          name: '买家售后生效转售后回收',
          stage: 'transfer',
          priority: 210,
          targetTypeId: 'rt_aftersale',
          status: 'enabled',
          conditions: [
            { dimension: 'transfer_scene', value: 'after_sale' },
            { dimension: 'after_sale_status', value: 'effective' }
          ],
          tags: ['售后转移', '物权已生效'],
          stopOnMatch: true,
          version: 'v1.3',
          updatedAt: '11-14 09:36'
        }
      ],
      transferEvents: [
        {
          id: 'EVT-20261114-018',
          orderNo: 'TC202611140083',
          scene: 'pre_sale',
          fromTypeId: 'rt_phone',
          toTypeId: 'rt_purchase',
          ruleId: 'R-OWN-001',
          status: 'pending',
          createdAt: '11-14 10:42',
          effectiveAt: '',
          ownerBefore: '用户',
          ownerAfter: '深圳闪回',
          direction: 'to_platform'
        },
        {
          id: 'EVT-20261114-017',
          orderNo: 'TC202611140071',
          scene: 'after_sale',
          fromTypeId: 'rt_enterprise',
          toTypeId: 'rt_aftersale',
          ruleId: 'R-OWN-002',
          status: 'applied',
          createdAt: '11-14 09:36',
          effectiveAt: '11-14 10:08',
          ownerBefore: '买家',
          ownerAfter: '深圳闪回',
          direction: 'to_platform'
        }
      ],
      traces: {
        TC202611140083: {
          orderNo: 'TC202611140083',
          businessTypeId: 'bt_value',
          channelId: 'retail',
          status: '待发货',
          currentTypeId: 'rt_phone',
          tags: ['保值换新', '指定手机号', '机器人：5号机器人'],
          updatedAt: '11-14 10:42',
          entries: [
            {
              id: 'T83-1',
              time: '11-14 10:18',
              event: '订单建立',
              title: '沿用原系统类型',
              typeName: '普通回收',
              source: '原系统',
              description: '下单阶段不执行新分类规则，订单初始值保持不变。',
              status: 'done',
              snapshot: ['initial-type: 普通回收']
            },
            {
              id: 'T83-2',
              time: '11-14 10:42',
              event: '成交确认',
              title: '指定手机号优先命中',
              typeName: '指定手机号回收',
              source: '规则引擎',
              description: '同时命中保值换新和 5 号机器人条件。优先级 100 的手机号规则成为主类型，其余命中写入标签。',
              status: 'done',
              matched: [
                { name: 'R-DEAL-001', priority: 100, status: 'applied' },
                { name: 'R-DEAL-002', priority: 95, status: 'masked' },
                { name: 'R-DEAL-004', priority: 80, status: 'masked' },
                { name: 'R-DEAL-005', priority: 60, status: 'masked' },
                { name: 'R-DEAL-006', priority: 10, status: 'masked' }
              ],
              snapshot: ['规则快照 v1.4', '手机号名单 v3', '业务类型参数 v1.1']
            },
            {
              id: 'T83-3',
              time: '待生效',
              event: '物权转移',
              title: '成交后、未起售 · 待物权生效',
              typeName: '购销回收',
              source: 'EVT-20261114-018',
              description: '事件已受理但尚未确认实际物权转移，因此不提前修改回收类型。',
              status: 'pending',
              transferEventId: 'EVT-20261114-018',
              matched: [{ name: 'R-OWN-001', priority: 200, status: 'applied' }],
              snapshot: ['物权事件 EVT-20261114-018', '规则快照 v1.2']
            }
          ]
        },
        TC202611140071: {
          orderNo: 'TC202611140071',
          businessTypeId: 'bt_enterprise',
          channelId: 'enterprise',
          status: '售后处理中',
          currentTypeId: 'rt_aftersale',
          tags: ['企业购', '机器人：5号机器人', '售后转移'],
          updatedAt: '11-14 10:08',
          entries: [
            {
              id: 'T71-1',
              time: '11-13 17:22',
              event: '订单建立',
              title: '沿用原系统类型',
              typeName: '普通回收',
              source: '原系统',
              description: '订单初始类型由原系统带入。',
              status: 'done',
              snapshot: ['initial-type: 普通回收']
            },
            {
              id: 'T71-2',
              time: '11-13 18:02',
              event: '成交确认',
              title: '企业购业务命中',
              typeName: '企业购回收',
              source: '规则引擎',
              description: '企业购业务规则优先级 90，在机器人规则之前完成归类。',
              status: 'done',
              matched: [
                { name: 'R-DEAL-003', priority: 90, status: 'applied' },
                { name: 'R-DEAL-004', priority: 80, status: 'masked' },
                { name: 'R-DEAL-006', priority: 10, status: 'masked' }
              ],
              snapshot: ['规则快照 v1.4', '业务类型参数 v1.1']
            },
            {
              id: 'T71-3',
              time: '11-14 09:36',
              event: '买家发起售后',
              title: '售后申请受理，不改类型',
              typeName: '企业购回收',
              source: '售后单 AS202611140021',
              description: '仅记录售后申请，等待审核与物权实际转移。',
              status: 'done',
              snapshot: ['售后状态：审核中', '物权状态：未转移']
            },
            {
              id: 'T71-4',
              time: '11-14 10:08',
              event: '物权转移生效',
              title: '售后物权回平台',
              typeName: '售后回收',
              source: 'EVT-20261114-017',
              description: '售后审核通过且物权生效后，追加新的类型版本并保留企业购标签。',
              status: 'done',
              matched: [{ name: 'R-OWN-002', priority: 210, status: 'applied' }],
              snapshot: ['物权事件 EVT-20261114-017', '规则快照 v1.3']
            }
          ]
        }
      },
      simulator: {
        businessTypeId: 'bt_value',
        currentTypeId: 'rt_bidder',
        phoneHit: 'hit',
        channelId: 'retail',
        winnerType: 'robot',
        robotId: 'r5',
        eventType: 'pre_sale'
      },
      lastSim: null
    };
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return createDefaultState();
      const parsed = JSON.parse(saved);
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.recycleTypes)) return createDefaultState();
      return parsed;
    } catch (error) {
      return createDefaultState();
    }
  }

  let state = loadState();

  const viewRoot = document.getElementById('view-root');
  const breadcrumb = document.getElementById('breadcrumb');
  const contextRuleCount = document.getElementById('context-rule-count');
  const appDialog = document.getElementById('app-dialog');
  const dialogContent = document.getElementById('dialog-content');
  const toastRegion = document.getElementById('toast-region');

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
      showToast('本地保存失败', '当前浏览器可能限制了本地存储，刷新后会恢复演示数据。', true);
    }
  }

  function nowLabel() {
    const date = new Date();
    const pad = (number) => String(number).padStart(2, '0');
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function fullNowLabel() {
    const date = new Date();
    const pad = (number) => String(number).padStart(2, '0');
    return `2026-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function findBusinessType(id) {
    return state.businessTypes.find((item) => item.id === id);
  }

  function findRecycleType(id) {
    return state.recycleTypes.find((item) => item.id === id);
  }

  function findRule(id) {
    return state.rules.find((item) => item.id === id);
  }

  function findChannel(id) {
    return CHANNELS.find((item) => item.id === id);
  }

  function findRobot(id) {
    return ROBOTS.find((item) => item.id === id);
  }

  function findPhoneList(id) {
    return PHONE_LISTS.find((item) => item.id === id);
  }

  function findTransferScene(id) {
    return TRANSFER_SCENES.find((item) => item.id === id);
  }

  function dimensionMeta(id) {
    return DIMENSIONS[id] || DIMENSIONS.business;
  }

  function getRuleCountForType(typeId) {
    return state.rules.filter((rule) => rule.targetTypeId === typeId).length;
  }

  function getBusinessRules(businessTypeId) {
    return state.rules.filter((rule) => rule.conditions.some((condition) => condition.dimension === 'business_type' && condition.value === businessTypeId));
  }

  function getBusinessLinkedTypes(businessTypeId) {
    const typeIds = new Set(getBusinessRules(businessTypeId).map((rule) => rule.targetTypeId));
    return state.recycleTypes.filter((type) => typeIds.has(type.id));
  }

  function conditionValueOptions(dimension) {
    if (dimension === 'business_type') {
      return state.businessTypes.map((item) => ({ id: item.id, name: item.name }));
    }
    if (dimension === 'current_type') {
      return state.recycleTypes.map((item) => ({ id: item.id, name: item.name }));
    }
    return DIMENSION_OPTIONS[dimension] || [];
  }

  function conditionValueName(dimension, value) {
    const option = conditionValueOptions(dimension).find((item) => item.id === value);
    return option ? option.name : value;
  }

  function conditionLabel(condition) {
    return `${CONDITION_LABELS[condition.dimension] || condition.dimension}：${conditionValueName(condition.dimension, condition.value)}`;
  }

  function conditionTag(condition) {
    if (condition.dimension === 'business_type') return conditionValueName('business_type', condition.value);
    if (condition.dimension === 'phone') return '指定手机号';
    if (condition.dimension === 'channel') return conditionValueName('channel', condition.value);
    if (condition.dimension === 'robot') return `机器人：${conditionValueName('robot', condition.value)}`;
    if (condition.dimension === 'winner') return `中标方：${conditionValueName('winner', condition.value)}`;
    if (condition.dimension === 'transfer_scene') return conditionValueName('transfer_scene', condition.value);
    if (condition.dimension === 'current_type') return `原类型：${conditionValueName('current_type', condition.value)}`;
    if (condition.dimension === 'transfer_direction') return conditionValueName('transfer_direction', condition.value);
    if (condition.dimension === 'after_sale_status') return conditionValueName('after_sale_status', condition.value);
    return conditionLabel(condition);
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function deriveRuleTags(conditions, targetTypeId) {
    const target = findRecycleType(targetTypeId);
    return unique([target?.name, ...conditions.map(conditionTag)]);
  }

  function getConflicts(candidate, ignoreId = candidate.id) {
    return state.rules.filter((rule) => {
      return rule.id !== ignoreId
        && rule.stage === candidate.stage
        && Number(rule.priority) === Number(candidate.priority)
        && rule.targetTypeId !== candidate.targetTypeId
        && rule.status !== 'disabled';
    });
  }

  function getAllConflictPairs() {
    const pairs = [];
    const rules = state.rules.filter((rule) => rule.status !== 'disabled');
    for (let index = 0; index < rules.length; index += 1) {
      for (let next = index + 1; next < rules.length; next += 1) {
        const first = rules[index];
        const second = rules[next];
        if (first.stage === second.stage && Number(first.priority) === Number(second.priority) && first.targetTypeId !== second.targetTypeId) {
          pairs.push([first, second]);
        }
      }
    }
    return pairs;
  }

  function statusMarkup(status) {
    const map = {
      enabled: ['status-enabled', '启用'],
      draft: ['status-draft', '草稿'],
      disabled: ['status-disabled', '停用'],
      pending: ['status-pending', '待生效'],
      applied: ['status-enabled', '已生效'],
      done: ['status-enabled', '已完成']
    };
    const value = map[status] || ['status-disabled', status || '未知'];
    return `<span class="status ${value[0]}"><i></i>${escapeHtml(value[1])}</span>`;
  }

  function ruleStatusMarkup(status) {
    const map = {
      enabled: ['status-enabled', '已启用'],
      draft: ['status-draft', '草稿'],
      disabled: ['status-disabled', '已停用']
    };
    const value = map[status] || ['status-disabled', status];
    return `<span class="status ${value[0]}"><i></i>${value[1]}</span>`;
  }

  function eventName(stage) {
    return stage === 'transfer' ? '物权转移生效' : '成交确认';
  }

  function activeViewFromHash() {
    const view = window.location.hash.replace(/^#/, '') || 'overview';
    return VIEW_META[view] ? view : 'overview';
  }

  function updateShell() {
    ui.view = activeViewFromHash();
    const meta = VIEW_META[ui.view];
    document.querySelectorAll('.admin-menu-item[data-nav]').forEach((item) => {
      const isActive = item.dataset.nav === ui.view;
      item.classList.toggle('is-active', isActive);
      if (isActive) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
    const headerTitle = document.getElementById('admin-header-title');
    if (headerTitle) headerTitle.textContent = meta.label;
    document.title = `${meta.label}｜回收类型规则中心`;
    breadcrumb.innerHTML = `<span>规则中心</span><span>${meta.group}</span><b>${meta.label}</b>`;
    contextRuleCount.textContent = `${state.rules.length} RULES`;
  }

  function render(options = {}) {
    updateShell();
    const renderers = {
      overview: renderOverview,
      business: renderBusiness,
      recycle: renderRecycle,
      rules: renderRules,
      transfer: renderTransfer,
      simulator: renderSimulator,
      trace: renderTrace
    };
    viewRoot.innerHTML = renderers[ui.view] ? renderers[ui.view]() : renderOverview();
    if (options.scrollTop) window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function goTo(view) {
    if (!VIEW_META[view]) return;
    if (activeViewFromHash() === view) {
      render();
      return;
    }
    window.location.hash = view;
  }

  function renderOverview() {
    const enabledRules = state.rules.filter((rule) => rule.status === 'enabled').length;
    const dealRules = state.rules.filter((rule) => rule.stage === 'deal').length;
    const pendingTransfers = state.transferEvents.filter((event) => event.status === 'pending').length;
    const conflicts = getAllConflictPairs().length;
    const linkedBusiness = state.businessTypes.filter((item) => getBusinessRules(item.id).length > 0).length;
    const unboundTypes = state.recycleTypes.filter((type) => getRuleCountForType(type.id) === 0).length;

    const recent = [
      { time: '10:42', title: '物权事件 EVT-20261114-018 已受理', meta: 'TC202611140083 · 等待实际转移', tag: '待生效' },
      { time: '10:18', title: 'R-DEAL-004 规则增加机器人身份条件', meta: '运营管理员 · 优先级 80', tag: '规则更新' },
      { time: '09:36', title: '售后转移规则 R-OWN-002 生效', meta: '买家售后 · 物权生效时触发', tag: '已发布' }
    ];

    return `
      <div class="view overview-view">
        <section class="overview-hero">
          <div class="overview-hero-copy">
            <div class="hero-code">RECYCLE TYPE CONFIGURATION / 01</div>
            <h1>让回收类型<br />成为<span>规则的结果</span></h1>
            <p>业务类型与回收类型先参数化，再由成交分类规则和物权转移规则消费。一次命中只产生一个主类型，多个条件进入归类标签，所有变化可试算、可追溯。</p>
            <div class="hero-actions">
              <button class="button button-primary" type="button" data-action="open-rule">＋ 新建分类规则</button>
              <button class="button button-secondary" type="button" data-action="go-view" data-view="simulator">运行一次试算 →</button>
            </div>
          </div>
          <aside class="hero-side" aria-label="配置链路摘要">
            <div class="hero-side-label">CHANGE WINDOW</div>
            <div class="hero-side-title">只在两个事件<br />修改回收类型</div>
            <ul class="hero-side-list">
              <li><span>成交确认</span><b>BID_WON</b></li>
              <li><span>物权转移生效</span><b>OWNERSHIP_EFFECTIVE</b></li>
              <li><span>订单建立</span><b>NO ACTION</b></li>
            </ul>
          </aside>
        </section>

        <section class="metric-strip" aria-label="配置统计">
          <article class="metric metric-accent">
            <div class="metric-label"><span>业务类型参数</span><span>01 / PARAMS</span></div>
            <strong>${state.businessTypes.length}</strong>
            <div class="metric-meta">${linkedBusiness} 个已关联规则</div>
          </article>
          <article class="metric">
            <div class="metric-label"><span>回收类型参数</span><span>02 / TYPES</span></div>
            <strong>${state.recycleTypes.length}</strong>
            <div class="metric-meta">${unboundTypes} 个待绑定规则</div>
          </article>
          <article class="metric">
            <div class="metric-label"><span>生效规则</span><span>03 / RULES</span></div>
            <strong>${enabledRules}</strong>
            <div class="metric-meta">成交 ${dealRules} · 物权 ${state.rules.length - dealRules}</div>
          </article>
          <article class="metric">
            <div class="metric-label"><span>物权待生效</span><span>04 / EVENTS</span></div>
            <strong>${pendingTransfers}</strong>
            <div class="metric-meta">${conflicts ? `${conflicts} 组规则待处理` : '规则冲突 0 组'}</div>
          </article>
        </section>

        <div class="overview-grid">
          <section class="panel pipeline-panel" aria-labelledby="pipeline-title">
            <div class="panel-title-line">
              <div>
                <h2 id="pipeline-title">类型生命周期</h2>
                <p>参数是输入，规则是决策，版本是结果。</p>
              </div>
              <span class="section-note">NO ORDER-STAGE RULE</span>
            </div>
            <div class="pipeline">
              <div class="pipeline-step">
                <span class="pipeline-no">01</span>
                <h3>订单事实</h3>
                <p>业务类型、手机号、渠道、报价与中标信息。</p>
                <small>ORDER FACT</small>
              </div>
              <div class="pipeline-step accent">
                <span class="pipeline-no">02</span>
                <h3>成交确认</h3>
                <p>按优先级匹配成交分类规则，生成主类型与标签。</p>
                <small>BID_WON</small>
              </div>
              <div class="pipeline-step">
                <span class="pipeline-no">03</span>
                <h3>类型版本</h3>
                <p>下游同步结算模式、核算主体和旧系统编码。</p>
                <small>VERSION SNAPSHOT</small>
              </div>
              <div class="pipeline-step accent">
                <span class="pipeline-no">04</span>
                <h3>物权转移</h3>
                <p>实际物权生效时，执行独立的二次变更规则。</p>
                <small>OWNERSHIP</small>
              </div>
              <div class="pipeline-step">
                <span class="pipeline-no">05</span>
                <h3>新版本</h3>
                <p>追加历史版本，不覆盖已成交与已结算快照。</p>
                <small>APPEND ONLY</small>
              </div>
            </div>
          </section>

          <aside class="panel health-panel" aria-labelledby="health-title">
            <div class="panel-title-line">
              <div>
                <h2 id="health-title">配置体检</h2>
                <p>发布前的关键约束。</p>
              </div>
              <span class="status ${conflicts ? 'status-pending' : 'status-enabled'}"><i></i>${conflicts ? '需处理' : '通过'}</span>
            </div>
            <div class="health-row"><span>规则冲突</span><strong class="${conflicts ? 'health-warn' : 'health-ok'}">${conflicts} 组</strong></div>
            <div class="health-row"><span>未绑定类型的规则</span><strong class="health-ok">0 条</strong></div>
            <div class="health-row"><span>缺少下游映射的类型</span><strong class="health-ok">0 个</strong></div>
            <div class="health-row"><span>已成交订单快照</span><strong>${Object.keys(state.traces).length} 份</strong></div>
            <div class="health-bar"><i style="width:${conflicts ? '64%' : '92%'}"></i></div>
            <div class="health-caption"><span>配置完整度</span><span>${conflicts ? '64%' : '92%'}</span></div>
          </aside>
        </div>

        <div class="section-head">
          <div><h2>从这里开始</h2><p>四个高频配置动作，全部可以点击体验。</p></div>
          <span class="section-note">QUICK ACTIONS</span>
        </div>
        <section class="shortcuts" aria-label="快捷操作">
          <button class="shortcut" type="button" data-action="add-type">
            <span class="shortcut-no">A / TYPE</span>
            <span><strong>新增回收类型参数</strong><span>先定义名称、归类维度与下游映射。</span></span>
            <span class="shortcut-arrow"><b>↗</b><span>参数层</span></span>
          </button>
          <button class="shortcut" type="button" data-action="open-rule">
            <span class="shortcut-no">B / RULE</span>
            <span><strong>创建一条分类规则</strong><span>把参数组合成可执行的匹配条件。</span></span>
            <span class="shortcut-arrow"><b>↗</b><span>规则层</span></span>
          </button>
          <button class="shortcut" type="button" data-action="go-view" data-view="simulator">
            <span class="shortcut-no">C / LAB</span>
            <span><strong>用订单样本试算</strong><span>查看命中、覆盖与最终字段输出。</span></span>
            <span class="shortcut-arrow"><b>↗</b><span>验证层</span></span>
          </button>
          <button class="shortcut" type="button" data-action="go-view" data-view="transfer">
            <span class="shortcut-no">D / EVENT</span>
            <span><strong>处理物权转移队列</strong><span>模拟实际物权生效后的二次变化。</span></span>
            <span class="shortcut-arrow"><b>↗</b><span>事件层</span></span>
          </button>
        </section>

        <div class="overview-grid" style="margin-top: 14px;">
          <section class="panel panel-pad" aria-labelledby="recent-title">
            <div class="panel-title-line"><div><h2 id="recent-title">最近变化</h2><p>配置和事件的最新活动。</p></div><span class="section-note">AUDIT TRAIL</span></div>
            <div class="recent-list">
              ${recent.map((item) => `
                <div class="recent-item">
                  <span class="recent-time">${item.time}</span>
                  <span><strong>${item.title}</strong><span>${item.meta}</span></span>
                  <span class="tag ${item.tag === '待生效' ? 'tag-orange' : item.tag === '已发布' ? 'tag-accent' : 'tag-muted'}">${item.tag}</span>
                </div>
              `).join('')}
            </div>
          </section>
          <aside class="panel panel-pad" aria-labelledby="boundary-title">
            <div class="panel-title-line"><div><h2 id="boundary-title">设计边界</h2><p>避免把规则写成字段补丁。</p></div><span class="section-note">GUARDRAILS</span></div>
            <div class="notice notice-accent" style="margin-top: 16px;">
              <span class="notice-mark">i</span>
              <div><b>一个订单一个主类型。</b>多条规则命中时，只取最高优先级为主类型，其余命中作为标签保留。</div>
            </div>
            <div class="notice" style="margin-top: 8px;">
              <span class="notice-mark">↺</span>
              <div><b>物权申请不等于物权生效。</b>售后申请只记录事件；类型变更在审核通过且实际转移生效后发生。</div>
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  function renderBusiness() {
    const linkedBusiness = state.businessTypes.filter((item) => getBusinessRules(item.id).length > 0).length;
    const pendingBusiness = state.businessTypes.filter((item) => getBusinessRules(item.id).length === 0).length;
    const dimensions = Object.keys(DIMENSIONS).map((key) => ({
      key,
      name: DIMENSIONS[key].name,
      count: state.recycleTypes.filter((type) => type.dimension === key).length
    }));
    const maxCount = Math.max(1, ...dimensions.map((item) => item.count));

    return `
      <div class="view">
        <header class="page-head">
          <div class="page-head-copy">
            <div class="eyebrow">01 / PARAMETER LAYER</div>
            <h1>业务类型<em>参数</em></h1>
            <p>业务类型描述订单场景，不直接决定回收类型。新增保值换新、企业购等场景后，由规则把它关联到一个或多个回收类型。</p>
          </div>
          <div class="head-actions">
            <button class="button button-primary" type="button" data-action="add-business">＋ 新增业务类型</button>
          </div>
        </header>

        <div class="business-summary">
          <span class="summary-chip"><b>${state.businessTypes.length}</b> 个业务类型</span>
          <span class="summary-chip"><b>${linkedBusiness}</b> 个已关联规则</span>
          <span class="summary-chip"><b>${pendingBusiness}</b> 个待关联</span>
          <span class="summary-chip">参数变更不直接修改历史订单</span>
        </div>

        <div class="table-shell">
          <div class="data-head">
            <span>业务类型 / 编码</span>
            <span>场景说明</span>
            <span>关联回收类型</span>
            <span>状态</span>
            <span>操作</span>
          </div>
          ${state.businessTypes.map((item) => {
            const linkedTypes = getBusinessLinkedTypes(item.id);
            const ruleCount = getBusinessRules(item.id).length;
            return `
              <div class="business-row">
                <div class="business-name">
                  <span class="business-glyph">${escapeHtml(item.name.slice(0, 1))}</span>
                  <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.code)} · ${ruleCount} 条关联规则</small></div>
                </div>
                <div class="business-desc">${escapeHtml(item.description)}</div>
                <div class="business-links">
                  ${linkedTypes.length ? linkedTypes.map((type) => `<span class="tag tag-teal">${escapeHtml(type.name)}</span>`).join('') : '<span class="empty-inline">待绑定规则</span>'}
                </div>
                <div>${statusMarkup(item.status)}</div>
                <div class="row-actions">
                  <button class="icon-button" type="button" aria-label="编辑 ${escapeHtml(item.name)}" data-action="edit-business" data-id="${item.id}">✎</button>
                  <button class="icon-button" type="button" aria-label="为 ${escapeHtml(item.name)} 配置规则" data-action="open-business-rule" data-id="${item.id}">→</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="type-governance">
          <section class="governance-card">
            <h3>回收类型归类分布</h3>
            <p>每种类型应明确一个主归类维度，组合条件由规则承担。</p>
            <div class="dimension-bars">
              ${dimensions.map((item) => `
                <div class="dimension-bar">
                  <span>${item.name}</span>
                  <i><b style="width:${Math.max(9, (item.count / maxCount) * 100)}%; background:${DIMENSIONS[item.key].color}"></b></i>
                  <em>${item.count}</em>
                </div>
              `).join('')}
            </div>
          </section>
          <aside class="governance-card">
            <h3>参数与规则的关系</h3>
            <p>新增业务类型后，需要在规则中引用它，才能把订单归到对应的回收类型。参数本身不会写入订单。</p>
            <div class="notice notice-accent" style="margin-top: 14px;">
              <span class="notice-mark">↗</span>
              <div><b>推荐路径：</b>新建业务类型 → 创建分类规则 → 选择目标回收类型 → 用订单样本试算。</div>
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  function renderRecycle() {
    const filtered = state.recycleTypes.filter((type) => ui.typeDimension === 'all' || type.dimension === ui.typeDimension);
    return `
      <div class="view">
        <header class="page-head">
          <div class="page-head-copy">
            <div class="eyebrow">02 / TYPE DEFINITIONS</div>
            <h1>回收类型<em>参数</em></h1>
            <p>类型是可被规则引用的稳定参数，包含归类维度、结算模式、核算主体与旧系统映射。新增类型后，再绑定具体规则。</p>
          </div>
          <div class="head-actions">
            <button class="button button-primary" type="button" data-action="add-type">＋ 新增回收类型</button>
          </div>
        </header>

        <div class="notice" style="margin-bottom: 17px;">
          <span class="notice-mark">i</span>
          <div><b>类型数量不是策略数量。</b>优先复用已有类型；只有下游字段映射或归类口径确实不同，才新增回收类型。</div>
        </div>

        <div class="filter-line">
          <div class="filter-tabs" role="group" aria-label="按归类维度筛选">
            <button class="filter-tab ${ui.typeDimension === 'all' ? 'is-active' : ''}" type="button" data-action="filter-type" data-dimension="all">全部 ${state.recycleTypes.length}</button>
            ${Object.entries(DIMENSIONS).map(([key, meta]) => `
              <button class="filter-tab ${ui.typeDimension === key ? 'is-active' : ''}" type="button" data-action="filter-type" data-dimension="${key}">${meta.name} ${state.recycleTypes.filter((type) => type.dimension === key).length}</button>
            `).join('')}
          </div>
          <span class="filter-meta">SHOWING ${filtered.length} / ${state.recycleTypes.length}</span>
        </div>

        <div class="type-grid">
          ${filtered.length ? filtered.map((type) => {
            const meta = dimensionMeta(type.dimension);
            const ruleCount = getRuleCountForType(type.id);
            return `
              <article class="type-card ${type.status === 'disabled' ? 'is-off' : ''}" style="--type-accent:${meta.color}">
                <div class="type-card-top">
                  <span class="type-dimension"><i class="dimension-mark"></i>${meta.name} / ${meta.en}</span>
                  <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;">
                    ${type.usage === 'transfer' ? '<span class="tag tag-orange">物权结果</span>' : ''}
                    ${statusMarkup(type.status)}
                  </div>
                </div>
                <h3>${escapeHtml(type.name)}</h3>
                <div class="type-code">${escapeHtml(type.code)} · ${escapeHtml(type.version)}</div>
                <div class="type-tags">
                  <span class="tag tag-muted">${type.allowTransfer ? '允许成交后转移' : '禁止继续转移'}</span>
                  ${ruleCount ? `<span class="tag tag-accent">${ruleCount} 条规则</span>` : '<span class="tag tag-danger">待绑定规则</span>'}
                </div>
                <div class="type-mapping">
                  <div class="mapping-cell"><span>结算模式</span><strong>${escapeHtml(type.settlement)}</strong></div>
                  <div class="mapping-cell"><span>核算主体</span><strong>${escapeHtml(type.entity)}</strong></div>
                  <div class="mapping-cell"><span>旧系统编码</span><strong class="mono">${escapeHtml(type.legacyCode)}</strong></div>
                </div>
                <div class="type-card-bottom">
                  <span class="type-stat"><b>${ruleCount}</b> 条规则引用 · 更新 ${escapeHtml(type.updatedAt)}</span>
                  <div class="card-actions">
                    <button class="card-action" type="button" data-action="edit-type" data-id="${type.id}">编辑</button>
                    <button class="card-action" type="button" data-action="open-type-rule" data-id="${type.id}">配规则</button>
                  </div>
                </div>
              </article>
            `;
          }).join('') : '<div class="panel-pad" style="grid-column:1/-1;"><div class="rule-empty"><strong>当前维度暂无类型</strong>可以新增一个回收类型参数。</div></div>'}
        </div>
      </div>
    `;
  }

  function renderRules() {
    const stageRules = state.rules.filter((rule) => rule.stage === ui.ruleStage);
    const conflicts = getAllConflictPairs();
    return `
      <div class="view">
        <header class="page-head">
          <div class="page-head-copy">
            <div class="eyebrow">03 / RULE ENGINE</div>
            <h1>分类规则<em>编排</em></h1>
            <p>成交分类和物权转移分阶段执行。条件之间为 AND；同一阶段命中多条时，按优先级选一个主类型，其余命中保留为标签。</p>
          </div>
          <div class="head-actions">
            <button class="button button-secondary" type="button" data-action="check-conflicts">规则体检</button>
            <button class="button button-primary" type="button" data-action="open-rule">＋ 新建规则</button>
          </div>
        </header>

        <div class="rule-stage-tabs" role="tablist" aria-label="规则阶段">
          <button class="stage-tab ${ui.ruleStage === 'deal' ? 'is-active' : ''}" type="button" role="tab" aria-selected="${ui.ruleStage === 'deal'}" data-action="filter-stage" data-stage="deal">
            成交分类 <b>${state.rules.filter((rule) => rule.stage === 'deal').length}</b>
          </button>
          <button class="stage-tab ${ui.ruleStage === 'transfer' ? 'is-active' : ''}" type="button" role="tab" aria-selected="${ui.ruleStage === 'transfer'}" data-action="filter-stage" data-stage="transfer">
            物权转移 <b>${state.rules.filter((rule) => rule.stage === 'transfer').length}</b>
          </button>
        </div>

        <div class="rule-toolbar">
          <div class="rule-principle">
            <b>${eventName(ui.ruleStage)}</b><span class="relation-line"></span>
            <span>优先级从高到低</span><span class="relation-line"></span>
            <b>主回收类型 + 标签</b>
          </div>
          <span class="conflict-pill ${conflicts.length ? '' : 'is-clear'}">
            <span>${conflicts.length ? '!' : '✓'}</span>${conflicts.length ? `${conflicts.length} 组潜在冲突` : '未发现同优先级冲突'}
          </span>
        </div>

        <div class="ruled-list">
          <div class="rule-list-head">
            <span>优先级</span><span>规则与条件</span><span>触发事件</span><span>输出类型</span><span>状态</span><span>操作</span>
          </div>
          ${stageRules.length ? stageRules.map((rule) => {
            const target = findRecycleType(rule.targetTypeId);
            const conflict = getConflicts(rule);
            return `
              <div class="rule-row ${rule.status === 'enabled' ? 'is-enabled' : ''} ${rule.status === 'disabled' ? 'is-disabled' : ''} ${conflict.length ? 'has-conflict' : ''}">
                <div class="priority-number">${String(rule.priority).padStart(2, '0')}</div>
                <div class="rule-name">
                  <strong>${escapeHtml(rule.name)}</strong>
                  <small>${escapeHtml(rule.id)} · ${escapeHtml(rule.version)} · 更新 ${escapeHtml(rule.updatedAt)}</small>
                  <div class="rule-condition-chips">
                    ${rule.conditions.length ? rule.conditions.map((condition) => `<span class="tag tag-muted">${escapeHtml(conditionLabel(condition))}</span>`).join('') : '<span class="tag tag-accent">无条件 · 显式兜底</span>'}
                    ${conflict.length ? '<span class="tag tag-danger">同优先级冲突待确认</span>' : ''}
                  </div>
                </div>
                <div class="rule-event"><b>${eventName(rule.stage)}</b>${rule.stopOnMatch ? '命中即锁定主类型' : '允许继续匹配'}</div>
                <div class="rule-output"><span class="arrow">→</span><b>${escapeHtml(target?.name || '类型已失效')}</b></div>
                <div class="rule-toggle-wrap">
                  ${ruleStatusMarkup(rule.status)}
                  <button class="switch" type="button" role="switch" aria-checked="${rule.status === 'enabled'}" aria-label="${rule.status === 'enabled' ? '停用' : '启用'} ${escapeHtml(rule.name)}" data-action="toggle-rule" data-id="${rule.id}"></button>
                </div>
                <div class="rule-row-actions">
                  <button class="icon-button" type="button" aria-label="编辑 ${escapeHtml(rule.name)}" data-action="edit-rule" data-id="${rule.id}">✎</button>
                </div>
              </div>
            `;
          }).join('') : '<div class="rule-empty"><strong>当前阶段还没有规则</strong>创建一条规则后，参数才会真正参与订单分类。</div>'}
        </div>
      </div>
    `;
  }

  function renderTransfer() {
    const pendingCount = state.transferEvents.filter((event) => event.status === 'pending').length;
    const appliedCount = state.transferEvents.filter((event) => event.status === 'applied').length;
    const policyEffective = state.transferPolicy === 'effective';

    return `
      <div class="view">
        <header class="page-head">
          <div class="page-head-copy">
            <div class="eyebrow">04 / OWNERSHIP EVENTS</div>
            <h1>物权转移<em>二次变更</em></h1>
            <p>成交后、未起售的物权回平台，以及买家发起售后后的回寄转移，都必须以“物权实际生效”作为类型变更触发点。申请、审核、发货节点不提前改写类型。</p>
          </div>
          <div class="head-actions">
            <button class="button button-secondary" type="button" data-action="go-view" data-view="rules" data-stage="transfer">查看转移规则</button>
          </div>
        </header>

        <section class="transfer-scenarios" aria-label="物权转移场景">
          <article class="scenario-card is-highlight">
            <div class="scenario-head"><span class="scenario-index">SCENE / 01</span><span class="tag tag-accent">推荐启用</span></div>
            <h3>成交后 · 未起售</h3>
            <p>成交已经锁定，但设备尚未进入正常销售或售后流程，物权从用户或原权利人转回平台。</p>
            <div class="scenario-flow">
              <span class="flow-node">成交确认</span><span class="flow-arrow">→</span>
              <span class="flow-node">物权事件受理</span><span class="flow-arrow">→</span>
              <span class="flow-node accent">实际转移生效</span><span class="flow-arrow">→</span>
              <span class="flow-node dark">购销回收</span>
            </div>
            <div class="scenario-foot"><span>TRIGGER / OWNERSHIP_EFFECTIVE</span><span>${pendingCount} 笔待生效</span></div>
          </article>

          <article class="scenario-card">
            <div class="scenario-head"><span class="scenario-index">SCENE / 02</span><span class="tag tag-orange">售后触发</span></div>
            <h3>买家发起售后转移</h3>
            <p>买家提交售后只记录事件起点；审核通过且设备物权实际转回平台后，才二次变更回收类型。</p>
            <div class="scenario-flow">
              <span class="flow-node">买家发起售后</span><span class="flow-arrow">→</span>
              <span class="flow-node">审核通过</span><span class="flow-arrow">→</span>
              <span class="flow-node accent">物权转移生效</span><span class="flow-arrow">→</span>
              <span class="flow-node dark">售后回收</span>
            </div>
            <div class="scenario-foot"><span>APPLY ≠ EFFECTIVE</span><span>${appliedCount} 笔已生效</span></div>
          </article>
        </section>

        <section class="policy-panel" aria-labelledby="policy-title">
          <div>
            <h3 id="policy-title">二次变更生效点</h3>
            <p>默认只在物权实际转移生效后改类型。若改为“申请时变更”，售后撤销时需要额外冲正，已结算订单也可能被错误改写。</p>
          </div>
          <div class="segmented" role="group" aria-label="物权转移生效点">
            <button class="${policyEffective ? 'is-active' : ''}" type="button" data-action="set-transfer-policy" data-policy="effective">物权实际生效</button>
            <button class="${policyEffective ? '' : 'is-active'}" type="button" data-action="set-transfer-policy" data-policy="request">售后申请时</button>
          </div>
        </section>

        ${policyEffective ? '' : `
          <div class="notice notice-warning" style="margin-top: 10px;">
            <span class="notice-mark">!</span>
            <div><b>当前为风险口径。</b>展示“申请即变更”的治理效果；真实业务如采用此口径，必须同时配置售后撤销冲正、已结算审批与角色权限。</div>
          </div>
        `}

        <div class="section-head">
          <div><h2>类型转换矩阵</h2><p>限定哪些类型允许二次变更，以及由哪条规则输出结果。</p></div>
          <span class="section-note">TRANSITION MATRIX</span>
        </div>
        <div class="matrix-wrap">
          <table class="matrix-table">
            <thead>
              <tr><th>当前类型范围</th><th>事件场景</th><th>触发时点</th><th>输出类型</th><th>状态</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="matrix-type">允许成交后转移的类型</span></td>
                <td>成交后、未起售</td>
                <td>物权实际转移生效</td>
                <td><span class="matrix-type result">购销回收</span></td>
                <td>${statusMarkup('enabled')}</td>
              </tr>
              <tr>
                <td><span class="matrix-type">允许售后转移的类型</span></td>
                <td>买家售后转移</td>
                <td>审核通过 + 物权回寄生效</td>
                <td><span class="matrix-type result">售后回收</span></td>
                <td>${statusMarkup('enabled')}</td>
              </tr>
              <tr>
                <td><span class="matrix-type">已结算或已开票订单</span></td>
                <td>任意物权转移</td>
                <td>财务审批通过后追加版本</td>
                <td><span class="matrix-type">保留原类型并进入审批</span></td>
                <td>${statusMarkup('pending')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section-head">
          <div><h2>物权事件队列</h2><p>选择一个待生效事件，模拟实际物权确认后的类型版本追加。</p></div>
          <span class="section-note">${state.transferEvents.length} EVENTS / ${pendingCount} PENDING</span>
        </div>
        <div class="event-list">
          ${state.transferEvents.map((event) => {
            const fromType = findRecycleType(event.fromTypeId);
            const toType = findRecycleType(event.toTypeId);
            const scene = findTransferScene(event.scene);
            return `
              <div class="event-row">
                <div class="event-order"><strong>${escapeHtml(event.orderNo)}</strong><small>${escapeHtml(event.id)}</small></div>
                <div class="event-scene"><b>${escapeHtml(scene?.name || event.scene)}</b>${event.direction === 'to_platform' ? '转回平台' : '转出平台'}</div>
                <div class="event-change"><span>${escapeHtml(fromType?.name || event.fromTypeId)}</span><span class="arrow">→</span><span class="tag tag-accent">${escapeHtml(toType?.name || event.toTypeId)}</span></div>
                <div class="event-time">${statusMarkup(event.status)}<br />${escapeHtml(event.effectiveAt || event.createdAt)}</div>
                <div class="event-actions">
                  <button class="button button-small button-secondary" type="button" data-action="view-transfer" data-id="${event.id}">详情</button>
                  ${event.status === 'pending' ? `<button class="button button-small button-primary" type="button" data-action="apply-transfer" data-id="${event.id}">模拟生效</button>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function selectOptions(items, selected, placeholder = '') {
    const rendered = items.map((item) => `<option value="${escapeHtml(item.id)}" ${String(item.id) === String(selected) ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
    return placeholder ? `<option value="">${escapeHtml(placeholder)}</option>${rendered}` : rendered;
  }

  function renderSimulator() {
    const simulator = state.simulator;
    const businessOptions = state.businessTypes.map((item) => ({ id: item.id, name: item.name }));
    const typeOptions = state.recycleTypes.map((item) => ({ id: item.id, name: item.name }));
    const eventOptions = [
      { id: 'only', name: '仅成交分类' },
      { id: 'pre_sale', name: '成交 + 未起售物权转移' },
      { id: 'after_sale', name: '成交 + 买家售后物权生效' }
    ];

    return `
      <div class="view">
        <header class="page-head">
          <div class="page-head-copy">
            <div class="eyebrow">05 / RULE LAB</div>
            <h1>规则<em>试算器</em></h1>
            <p>用脱敏订单样本验证规则命中、优先级覆盖和物权二次变更。试算不写真实订单，但会生成一份可追溯的演示快照。</p>
          </div>
          <div class="head-actions">
            <button class="button button-secondary" type="button" data-action="go-view" data-view="trace">查看追溯示例</button>
          </div>
        </header>

        <div class="sim-layout sim-shell ${ui.simDirty ? 'is-dirty' : ''}" id="sim-shell">
          <section class="sim-builder" aria-labelledby="sim-builder-title">
            <div class="sim-builder-head">
              <div><h2 id="sim-builder-title">订单样本</h2><p>选择场景后运行；字段变化不会自动重算。</p></div>
              <span class="tag tag-muted">DEMO 001</span>
            </div>

            <div class="preset-row" aria-label="试算预设">
              <button class="preset-button" type="button" data-action="apply-preset" data-preset="phone-robot">保值换新 × 手机号 × 机器人</button>
              <button class="preset-button" type="button" data-action="apply-preset" data-preset="enterprise">企业购 × 指定渠道</button>
              <button class="preset-button" type="button" data-action="apply-preset" data-preset="after-sale">买家售后重分类</button>
            </div>

            <div class="form-grid">
              <label class="field">
                <span>业务类型</span>
                <select class="select" data-sim-field="businessTypeId">${selectOptions(businessOptions, simulator.businessTypeId)}</select>
              </label>
              <label class="field">
                <span>当前类型（沿用订单值）</span>
                <select class="select" data-sim-field="currentTypeId">${selectOptions(typeOptions, simulator.currentTypeId)}</select>
              </label>
              <label class="field">
                <span>指定手机号名单</span>
                <select class="select" data-sim-field="phoneHit">
                  <option value="hit" ${simulator.phoneHit === 'hit' ? 'selected' : ''}>命中：重点客户名单 A</option>
                  <option value="miss" ${simulator.phoneHit === 'miss' ? 'selected' : ''}>未命中名单</option>
                </select>
              </label>
              <label class="field">
                <span>来源渠道</span>
                <select class="select" data-sim-field="channelId">${selectOptions(CHANNELS, simulator.channelId)}</select>
              </label>
              <div class="field field-full">
                <span class="field-label">中标方</span>
                <div class="winner-segment" role="group" aria-label="中标方">
                  ${WINNERS.map((winner) => `<button class="${simulator.winnerType === winner.id ? 'is-active' : ''}" type="button" data-action="set-sim-winner" data-winner="${winner.id}">${winner.name}</button>`).join('')}
                </div>
              </div>
              <label class="field robot-field ${simulator.winnerType === 'robot' ? '' : 'is-hidden'}" id="robot-field">
                <span>中标机器人</span>
                <select class="select" data-sim-field="robotId">${selectOptions(ROBOTS, simulator.robotId)}</select>
              </label>
              <label class="field">
                <span>叠加事件</span>
                <select class="select" data-sim-field="eventType">${selectOptions(eventOptions, simulator.eventType)}</select>
              </label>
            </div>

            <div class="sim-dirty">订单字段已变化，右侧仍是上一次试算结果。请重新运行。</div>
            <div class="sim-run-bar">
              <span>样本手机号、订单号和渠道<br />均为脱敏演示数据。</span>
              <button class="button button-primary" type="button" data-action="run-sim">运行试算 ↗</button>
            </div>
          </section>

          <section class="sim-result" aria-live="polite" aria-label="试算结果">
            ${state.lastSim ? renderSimResult(state.lastSim) : renderSimEmpty()}
          </section>
        </div>
      </div>
    `;
  }

  function renderSimEmpty() {
    return `
      <div class="result-empty">
        <div class="result-empty-top"><span>SIMULATION OUTPUT</span><span>WAITING FOR INPUT</span></div>
        <div class="result-empty-graphic" aria-hidden="true">
          <span class="empty-node">ORDER<br />FACT</span><span class="empty-arrow">→</span>
          <span class="empty-node accent">RULE<br />MATCH</span><span class="empty-arrow">→</span>
          <span class="empty-node">TYPE<br />VERSION</span>
        </div>
        <div class="result-empty-copy">
          <h2>准备生成一份<br />可解释的类型快照</h2>
          <p>左侧选择业务类型、手机号、渠道、中标方和物权事件，然后运行试算。结果会展示命中规则、被覆盖候选和下游字段。</p>
        </div>
      </div>
    `;
  }

  function renderSimResult(result) {
    const finalType = findRecycleType(result.finalTypeId);
    const inputBusiness = findBusinessType(result.input.businessTypeId);
    const allMatches = result.matches || [];
    const appliedCount = allMatches.filter((item) => item.applied).length;
    return `
      <div class="result-filled">
        <div class="result-topline"><span>SIMULATION / ${escapeHtml(result.orderNo)}</span><span class="mono">${escapeHtml(result.runAt)}</span></div>
        <div class="result-kicker">FINAL RECYCLE TYPE</div>
        <h2 class="result-type">${escapeHtml(finalType?.name || '未归类')}</h2>
        <div class="result-code">${escapeHtml(finalType?.code || '—')} · ${escapeHtml(finalType?.version || '—')} · ${inputBusiness ? escapeHtml(inputBusiness.name) : '业务类型未设置'}</div>
        <div class="result-tags">${result.tags.map((tag) => `<span class="result-tag">${escapeHtml(tag)}</span>`).join('')}</div>

        <div class="result-section">
          <div class="result-section-head"><span>规则命中链</span><b>${allMatches.length} HIT / ${appliedCount} APPLIED</b></div>
          <div class="match-list">
            ${allMatches.length ? allMatches.map((item) => `
              <div class="match-row">
                <span class="match-priority">${item.priority}</span>
                <span class="match-name">${escapeHtml(item.name)}<small>${item.stage === 'transfer' ? '物权转移' : '成交分类'} · ${escapeHtml(item.ruleId)}</small></span>
                <span class="match-result ${item.applied ? 'applied' : ''}">${item.applied ? '已采用' : '被覆盖'}</span>
              </div>
            `).join('') : '<div class="match-row"><span class="match-priority">—</span><span class="match-name">没有规则命中，保持当前类型<small>建议配置显式兜底规则</small></span><span class="match-result">未命中</span></div>'}
          </div>
        </div>

        <div class="result-section">
          <div class="result-section-head"><span>下游字段输出</span><b>ATOMIC ACTION SET</b></div>
          <div class="output-grid">
            <div class="output-cell"><span>回收类型编码</span><strong>${escapeHtml(finalType?.code || '—')}</strong></div>
            <div class="output-cell"><span>结算模式</span><strong>${escapeHtml(finalType?.settlement || '—')}</strong></div>
            <div class="output-cell"><span>核算主体</span><strong>${escapeHtml(finalType?.entity || '—')}</strong></div>
            <div class="output-cell"><span>旧系统编码</span><strong>${escapeHtml(finalType?.legacyCode || '—')}</strong></div>
          </div>
        </div>

        <div class="result-section">
          <div class="result-section-head"><span>变更轨迹</span><b>${result.events.length} EVENT</b></div>
          <div class="result-timeline">
            ${result.events.map((event) => `
              <div class="result-event">
                <span class="result-event-time">${escapeHtml(event.time)}</span>
                <span class="result-event-body"><b>${escapeHtml(event.title)}</b><span>${escapeHtml(event.fromName)} → ${escapeHtml(event.toName)} · ${escapeHtml(event.ruleName)}</span></span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="result-footer">
          <span>快照：${escapeHtml(result.snapshot)}</span>
          <button class="button" type="button" data-action="go-trace" data-order="SIM-20261114-001">打开追溯 →</button>
        </div>
      </div>
    `;
  }

  function renderTrace() {
    const traces = Object.values(state.traces).sort((first, second) => String(second.updatedAt).localeCompare(String(first.updatedAt)));
    if (!traces.length) {
      return `<div class="view"><header class="page-head"><div class="page-head-copy"><div class="eyebrow">06 / TRACE</div><h1>类型<em>追溯</em></h1><p>运行一次试算或处理物权事件后，这里会出现订单级类型时间线。</p></div></header><div class="panel-pad"><div class="rule-empty"><strong>暂无追溯快照</strong>可在规则试算器中生成一份演示订单。</div></div></div>`;
    }
    if (!state.traces[ui.activeTrace]) ui.activeTrace = traces[0].orderNo;
    const active = state.traces[ui.activeTrace] || traces[0];
    const currentType = findRecycleType(active.currentTypeId);
    const business = findBusinessType(active.businessTypeId);
    const channel = findChannel(active.channelId);

    return `
      <div class="view">
        <header class="page-head">
          <div class="page-head-copy">
            <div class="eyebrow">06 / ORDER SNAPSHOT</div>
            <h1>类型<em>追溯</em></h1>
            <p>每次类型变化追加一个版本，保留命中规则、参数快照和物权事件。历史成交订单不会因当前规则修改而被重新计算。</p>
          </div>
          <div class="head-actions"><button class="button button-secondary" type="button" data-action="go-view" data-view="simulator">再运行一次试算</button></div>
        </header>

        <div class="trace-layout">
          <aside class="trace-orders">
            <div class="trace-orders-head"><h2>演示订单</h2><span>${traces.length} SNAPSHOT</span></div>
            <div class="order-list">
              ${traces.map((trace) => {
                const type = findRecycleType(trace.currentTypeId);
                const isSim = trace.orderNo.startsWith('SIM-');
                return `
                  <button class="order-option ${trace.orderNo === active.orderNo ? 'is-active' : ''}" type="button" data-action="select-trace" data-order="${escapeHtml(trace.orderNo)}">
                    <strong>${escapeHtml(trace.orderNo)}</strong>
                    <span>${isSim ? '最近一次试算' : escapeHtml(trace.status)} · ${escapeHtml(type?.name || '未归类')}</span>
                    <small>更新 ${escapeHtml(trace.updatedAt)}</small>
                  </button>
                `;
              }).join('')}
            </div>
          </aside>

          <section class="trace-detail">
            <div class="trace-detail-head">
              <div class="trace-headline">
                <div>
                  <div class="trace-order-code">${escapeHtml(active.orderNo)} · ${active.orderNo.startsWith('SIM-') ? 'RULE LAB SNAPSHOT' : 'ORDER SNAPSHOT'}</div>
                  <h2>${escapeHtml(currentType?.name || '未归类')}</h2>
                </div>
                <div class="trace-status">${active.orderNo.startsWith('SIM-') ? '<span class="tag tag-blue">最近一次试算</span>' : `<span class="tag tag-teal">${escapeHtml(active.status)}</span>`}<span class="tag tag-muted">APPEND ONLY</span></div>
              </div>
              <div class="trace-meta-grid">
                <div class="trace-meta-cell"><span>业务类型</span><strong>${escapeHtml(business?.name || '未设置')}</strong></div>
                <div class="trace-meta-cell"><span>来源渠道</span><strong>${escapeHtml(channel?.name || '未设置')}</strong></div>
                <div class="trace-meta-cell"><span>当前类型标签</span><strong>${active.tags.length} 个标签</strong></div>
                <div class="trace-meta-cell"><span>最后更新</span><strong class="mono">${escapeHtml(active.updatedAt)}</strong></div>
              </div>
              <div class="result-tags" style="margin-top: 15px;">${active.tags.map((tag) => `<span class="tag tag-accent">${escapeHtml(tag)}</span>`).join('')}</div>
            </div>

            <div class="timeline">
              ${active.entries.map((entry) => `
                <div class="timeline-item ${entry.status === 'pending' ? 'is-pending' : 'is-done'}">
                  <div class="timeline-time">${escapeHtml(entry.time)}</div>
                  <span class="timeline-dot" aria-hidden="true"></span>
                  <div class="timeline-content">
                    <div class="timeline-event">
                      <b>${escapeHtml(entry.event)}</b>
                      ${statusMarkup(entry.status)}
                    </div>
                    <div class="timeline-title">${escapeHtml(entry.title)}</div>
                    <div class="timeline-type">类型：<strong>${escapeHtml(entry.typeName)}</strong></div>
                    <p class="timeline-desc">${escapeHtml(entry.description)}</p>
                    ${entry.matched?.length ? `<div class="timeline-rules">${entry.matched.map((match) => `<span class="trace-rule-chip ${match.status === 'applied' ? 'applied' : ''}">${escapeHtml(match.name)} · ${match.priority} · ${match.status === 'applied' ? '采用' : '覆盖'}</span>`).join('')}</div>` : ''}
                    ${entry.snapshot?.length ? `<div class="trace-snapshot">${entry.snapshot.map((item) => `<span class="snapshot-chip">${escapeHtml(item)}</span>`).join('')}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
        </div>
      </div>
    `;
  }

  function getStageDimensions(stage) {
    return stage === 'transfer' ? TRANSFER_DIMENSIONS : DEAL_DIMENSIONS;
  }

  function defaultCondition(stage) {
    const dimension = getStageDimensions(stage)[0];
    const options = conditionValueOptions(dimension);
    return { dimension, value: options[0]?.id || '' };
  }

  function ruleConditionMatches(condition, input, context = {}) {
    const value = condition.value;
    switch (condition.dimension) {
      case 'business_type':
        return input.businessTypeId === value;
      case 'phone':
        return input.phoneHit === 'hit' && value === 'phone-a';
      case 'channel':
        return input.channelId === value;
      case 'robot':
        return input.winnerType === 'robot' && input.robotId === value;
      case 'winner':
        return input.winnerType === value;
      case 'transfer_scene':
        return context.scene === value;
      case 'current_type':
        return context.currentTypeId === value;
      case 'transfer_direction':
        return context.direction === value;
      case 'after_sale_status':
        return context.afterSaleStatus === value;
      default:
        return false;
    }
  }

  function runSimulation(input) {
    const dealRules = state.rules
      .filter((rule) => rule.stage === 'deal' && rule.status === 'enabled')
      .slice()
      .sort((first, second) => Number(second.priority) - Number(first.priority));
    const currentType = findRecycleType(input.currentTypeId);
    const dealMatched = dealRules.filter((rule) => rule.conditions.every((condition) => ruleConditionMatches(condition, input)));
    const dealApplied = dealMatched[0] || null;
    const afterDealTypeId = dealApplied ? dealApplied.targetTypeId : input.currentTypeId;
    const afterDealType = findRecycleType(afterDealTypeId);
    const business = findBusinessType(input.businessTypeId);
    let tags = unique([
      business?.id === 'bt_standard' ? '' : business?.name,
      afterDealType?.name,
      ...dealMatched.flatMap((rule) => rule.conditions.map(conditionTag))
    ]);

    const events = [{
      time: nowLabel(),
      title: '成交确认',
      fromName: currentType?.name || '当前值',
      toName: afterDealType?.name || '未归类',
      ruleName: dealApplied ? `${dealApplied.id} · ${dealApplied.name}` : '无规则命中，保持当前类型'
    }];

    const matches = dealMatched.map((rule, index) => ({
      ruleId: rule.id,
      name: rule.name,
      stage: rule.stage,
      priority: rule.priority,
      targetTypeId: rule.targetTypeId,
      applied: index === 0
    }));

    let finalTypeId = afterDealTypeId;
    let transferApplied = null;
    if (input.eventType === 'pre_sale' || input.eventType === 'after_sale') {
      const scene = input.eventType;
      const context = {
        scene,
        currentTypeId: afterDealTypeId,
        direction: 'to_platform',
        afterSaleStatus: 'effective'
      };
      const transferRules = state.rules
        .filter((rule) => rule.stage === 'transfer' && rule.status === 'enabled')
        .slice()
        .sort((first, second) => Number(second.priority) - Number(first.priority));
      const transferMatched = transferRules.filter((rule) => rule.conditions.every((condition) => ruleConditionMatches(condition, input, context)));
      transferApplied = transferMatched[0] || null;
      if (transferApplied) {
        const target = findRecycleType(transferApplied.targetTypeId);
        finalTypeId = transferApplied.targetTypeId;
        tags = unique([...tags, target?.name, ...transferApplied.tags, '物权已转移']);
        events.push({
          time: nowLabel(),
          title: scene === 'after_sale' ? '售后物权转移生效' : '成交后物权转移生效',
          fromName: afterDealType?.name || '未归类',
          toName: target?.name || '未归类',
          ruleName: `${transferApplied.id} · ${transferApplied.name}`
        });
        transferMatched.forEach((rule, index) => {
          matches.push({
            ruleId: rule.id,
            name: rule.name,
            stage: rule.stage,
            priority: rule.priority,
            targetTypeId: rule.targetTypeId,
            applied: index === 0
          });
        });
      }
    }

    const finalType = findRecycleType(finalTypeId);
    tags = unique([...tags, finalType?.name]);
    const sortedMatches = matches.slice().sort((first, second) => Number(second.priority) - Number(first.priority));
    const applyRules = [dealApplied, transferApplied].filter(Boolean);
    const snapshot = [
      `规则 ${applyRules.map((rule) => rule.version).join(' / ') || '未命中'}`,
      `名单 ${PHONE_LISTS[0].version}`,
      input.eventType === 'only' ? '无物权事件' : `物权 ${input.eventType === 'after_sale' ? '售后生效' : '未起售生效'}`
    ].join(' · ');

    return {
      orderNo: 'SIM-20261114-001',
      runAt: fullNowLabel(),
      input: clone(input),
      finalTypeId,
      afterDealTypeId,
      tags,
      matches: sortedMatches,
      events,
      snapshot
    };
  }

  function makeTraceFromSimulation(result) {
    const finalType = findRecycleType(result.finalTypeId);
    const entries = [{
      id: `SIM-${Date.now()}-1`,
      time: result.runAt.slice(5, 16),
      event: '试算订单',
      title: '使用订单样本进入规则试算',
      typeName: '沿用当前类型',
      source: '规则试算器',
      description: '仅生成演示快照，不写入真实订单。',
      status: 'done',
      snapshot: ['sample: DEMO-001', 'source: manual simulation']
    }];
    const dealEvent = result.events[0];
    entries.push({
      id: `SIM-${Date.now()}-2`,
      time: result.runAt.slice(5, 16),
      event: '成交分类',
      title: dealEvent.ruleName,
      typeName: dealEvent.toName,
      source: '规则引擎',
      description: '按优先级选择主类型，其余命中规则写入可追溯标签。',
      status: 'done',
      matched: result.matches.filter((match) => match.stage === 'deal').map((match) => ({ name: match.ruleId, priority: match.priority, status: match.applied ? 'applied' : 'masked' })),
      snapshot: [result.snapshot]
    });
    if (result.events[1]) {
      const transferEvent = result.events[1];
      entries.push({
        id: `SIM-${Date.now()}-3`,
        time: result.runAt.slice(5, 16),
        event: '物权转移生效',
        title: transferEvent.ruleName,
        typeName: transferEvent.toName,
        source: '物权事件 / SIM',
        description: '物权实际生效后追加新版本，不覆盖成交快照。',
        status: 'done',
        matched: result.matches.filter((match) => match.stage === 'transfer').map((match) => ({ name: match.ruleId, priority: match.priority, status: match.applied ? 'applied' : 'masked' })),
        snapshot: [result.snapshot]
      });
    }
    return {
      orderNo: result.orderNo,
      businessTypeId: result.input.businessTypeId,
      channelId: result.input.channelId,
      status: '试算快照',
      currentTypeId: result.finalTypeId,
      tags: result.tags,
      updatedAt: result.runAt.slice(5, 16),
      entries
    };
  }

  function showToast(title, message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'is-error' : ''}`;
    toast.innerHTML = `<span class="toast-mark">${isError ? '!' : '✓'}</span><span><strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span></span>`;
    toastRegion.appendChild(toast);
    window.setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
      toast.style.transition = 'opacity 180ms ease, transform 180ms ease';
      window.setTimeout(() => toast.remove(), 200);
    }, 3600);
  }

  function openDialog({ title, kicker, description = '', body, footer, wide = false, small = false }) {
    if (appDialog.open) appDialog.close();
    appDialog.className = `app-dialog ${wide ? 'is-wide' : ''} ${small ? 'is-small' : ''}`.trim();
    dialogContent.innerHTML = `
      <div class="dialog-shell">
        <header class="dialog-head">
          <div>
            <div class="dialog-kicker">${escapeHtml(kicker || 'CONFIGURATION')}</div>
            <h2 id="dialog-title">${escapeHtml(title)}</h2>
            ${description ? `<p>${escapeHtml(description)}</p>` : ''}
          </div>
          <button class="dialog-close" type="button" aria-label="关闭弹窗" data-dialog-close>×</button>
        </header>
        <div class="dialog-body">${body}</div>
        ${footer ? `<footer class="dialog-foot">${footer}</footer>` : ''}
      </div>
    `;
    appDialog.showModal();
    window.setTimeout(() => {
      const firstField = appDialog.querySelector('input:not([type="checkbox"]), select, textarea');
      if (firstField) firstField.focus();
    }, 30);
  }

  function closeDialog() {
    if (appDialog.open) appDialog.close();
  }

  function openBusinessDialog(item = null) {
    const editing = Boolean(item);
    const current = item || {
      name: '',
      code: '',
      description: '',
      owner: '业务运营',
      status: 'enabled'
    };
    const body = `
      <div class="dialog-layout">
        <form id="business-form" data-id="${editing ? current.id : ''}">
          <div class="form-section">
            <div class="form-section-title"><h3>参数基础信息</h3><span>01 / BUSINESS TYPE</span></div>
            <div class="form-grid-2">
              <label class="field"><span>业务类型名称 <b class="required">*</b></span><input class="input" name="name" required maxlength="30" value="${escapeHtml(current.name)}" placeholder="例如：保值换新" /></label>
              <label class="field"><span>稳定编码 <b class="required">*</b></span><input class="input mono" name="code" required maxlength="40" value="${escapeHtml(current.code)}" placeholder="VALUE_TRADE_IN" /></label>
            </div>
            <label class="field"><span>业务场景说明</span><textarea class="textarea" name="description" maxlength="120" placeholder="说明该业务类型的适用订单场景">${escapeHtml(current.description)}</textarea></label>
            <div class="form-grid-2">
              <label class="field"><span>归属团队</span><input class="input" name="owner" maxlength="20" value="${escapeHtml(current.owner)}" /></label>
              <label class="field"><span>参数状态</span><select class="select" name="status"><option value="enabled" ${current.status === 'enabled' ? 'selected' : ''}>启用</option><option value="draft" ${current.status === 'draft' ? 'selected' : ''}>草稿</option><option value="disabled" ${current.status === 'disabled' ? 'selected' : ''}>停用</option></select></label>
            </div>
          </div>
        </form>
        <aside class="preview-card">
          <div class="preview-top"><span>PARAMETER PREVIEW</span><span>BUSINESS TYPE</span></div>
          <div class="preview-main">
            <div class="preview-label">场景参数</div>
            <div class="preview-name">${editing ? escapeHtml(current.name) : '新业务类型'}</div>
            <div class="preview-code">${editing ? escapeHtml(current.code) : '等待填写编码'}</div>
            <div class="preview-tagline"><span class="preview-tag">不直接写订单类型</span><span class="preview-tag">由规则关联</span></div>
          </div>
          <div class="preview-mapping">
            <div class="preview-map-row"><span>参数用途</span><b>描述订单场景</b></div>
            <div class="preview-map-row"><span>关联方式</span><b>规则条件引用</b></div>
            <div class="preview-map-row"><span>历史订单</span><b>不自动回刷</b></div>
          </div>
        </aside>
      </div>
      <div class="notice notice-accent dialog-note"><span class="notice-mark">i</span><div><b>业务类型不是回收类型。</b>同一业务类型可以在不同条件下关联不同回收类型；新增参数后需要配置一条引用它的规则。</div></div>
    `;
    const footer = `
      <span class="dialog-foot-note">编码发布后建议保持稳定，避免下游映射失效。</span>
      <div class="dialog-foot-actions">
        <button class="button button-secondary" type="button" data-dialog-close>取消</button>
        <button class="button button-secondary" type="submit" form="business-form">仅保存</button>
        <button class="button button-primary" type="submit" form="business-form" data-next="rule">保存并配置规则</button>
      </div>
    `;
    openDialog({
      title: editing ? '编辑业务类型' : '新增业务类型参数',
      kicker: '01 / PARAMETER LAYER',
      description: '业务类型描述订单场景；规则负责把它关联到回收类型。',
      body,
      footer
    });
    const form = document.getElementById('business-form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const code = String(data.get('code') || '').trim().toUpperCase().replace(/\s+/g, '_');
      const duplicate = state.businessTypes.find((business) => business.id !== current.id && (business.name === name || business.code === code));
      if (duplicate) {
        showToast('参数重复', '业务类型名称或编码已存在，请修改后再保存。', true);
        return;
      }
      const next = editing ? state.businessTypes.find((business) => business.id === current.id) : {
        id: `bt_${Date.now()}`,
        name: '',
        code: '',
        description: '',
        owner: '',
        status: 'enabled',
        updatedAt: ''
      };
      next.name = name;
      next.code = code;
      next.description = String(data.get('description') || '').trim();
      next.owner = String(data.get('owner') || '').trim();
      next.status = String(data.get('status') || 'enabled');
      next.updatedAt = nowLabel();
      if (!editing) state.businessTypes.push(next);
      saveState();
      closeDialog();
      const shouldCreateRule = event.submitter?.dataset.next === 'rule';
      showToast(editing ? '业务类型已更新' : '业务类型已创建', `${next.name} · ${next.code}`);
      if (shouldCreateRule) {
        const linkedType = getBusinessLinkedTypes(next.id)[0];
        openRuleDialog({
          preset: {
            conditions: [{ dimension: 'business_type', value: next.id }],
            targetTypeId: linkedType?.id || 'rt_value',
            name: `${next.name}业务归类`
          }
        });
      } else {
        render();
      }
    });
  }

  function openRecycleDialog(item = null) {
    const editing = Boolean(item);
    const current = item || {
      name: '',
      code: `RT-CUSTOM-${String(state.recycleTypes.length + 1).padStart(2, '0')}`,
      dimension: 'business',
      usage: 'deal',
      settlement: '购销',
      entity: '深圳闪回',
      legacyCode: '',
      allowTransfer: true,
      status: 'enabled'
    };
    const body = `
      <div class="dialog-layout">
        <form id="recycle-form" data-id="${editing ? current.id : ''}">
          <div class="form-section">
            <div class="form-section-title"><h3>类型基础信息</h3><span>01 / TYPE PARAM</span></div>
            <div class="form-grid-2">
              <label class="field"><span>回收类型名称 <b class="required">*</b></span><input class="input" name="name" required maxlength="30" value="${escapeHtml(current.name)}" placeholder="例如：企业购回收" /></label>
              <label class="field"><span>类型编码 <b class="required">*</b></span><input class="input mono" name="code" required maxlength="40" value="${escapeHtml(current.code)}" placeholder="RT-ENTERPRISE" /></label>
            </div>
            <div class="form-grid-2">
              <label class="field"><span>主归类维度</span><select class="select" name="dimension">${Object.entries(DIMENSIONS).map(([key, meta]) => `<option value="${key}" ${current.dimension === key ? 'selected' : ''}>${meta.name}</option>`).join('')}</select></label>
              <label class="field"><span>类型用途</span><select class="select" name="usage"><option value="deal" ${current.usage === 'deal' ? 'selected' : ''}>成交分类结果</option><option value="transfer" ${current.usage === 'transfer' ? 'selected' : ''}>物权转移结果</option></select></label>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section-title"><h3>下游字段映射</h3><span>02 / ATOMIC ACTION SET</span></div>
            <div class="form-grid-2">
              <label class="field"><span>结算模式 <b class="required">*</b></span><select class="select" name="settlement"><option ${current.settlement === '购销' ? 'selected' : ''}>购销</option><option ${current.settlement === '代付' ? 'selected' : ''}>代付</option><option ${current.settlement === '寄售' ? 'selected' : ''}>寄售</option></select></label>
              <label class="field"><span>核算主体 <b class="required">*</b></span><input class="input" name="entity" required value="${escapeHtml(current.entity)}" placeholder="例如：深圳闪回" /></label>
            </div>
            <div class="form-grid-2">
              <label class="field"><span>旧系统编码</span><input class="input mono" name="legacyCode" maxlength="20" value="${escapeHtml(current.legacyCode)}" placeholder="例如：52" /></label>
              <label class="field"><span>类型状态</span><select class="select" name="status"><option value="enabled" ${current.status === 'enabled' ? 'selected' : ''}>启用</option><option value="draft" ${current.status === 'draft' ? 'selected' : ''}>草稿</option><option value="disabled" ${current.status === 'disabled' ? 'selected' : ''}>停用</option></select></label>
            </div>
            <label class="checkbox-line"><input type="checkbox" name="allowTransfer" ${current.allowTransfer ? 'checked' : ''} /><span>允许成交后因物权转移再次变更类型<small>关闭后，该类型只能作为最终结果，不会继续进入转移规则。</small></span></label>
          </div>
        </form>
        <aside class="preview-card" id="type-preview">${typePreviewMarkup(current)}</aside>
      </div>
      <div class="notice dialog-note"><span class="notice-mark">↗</span><div><b>先定义参数，再绑定规则。</b>新类型保存后可继续创建规则；没有规则引用的类型只会显示为待绑定，不会自动命中订单。</div></div>
    `;
    const footer = `
      <span class="dialog-foot-note">类型编码与下游字段必须稳定，不允许用同名类型绕过历史映射。</span>
      <div class="dialog-foot-actions">
        <button class="button button-secondary" type="button" data-dialog-close>取消</button>
        <button class="button button-secondary" type="submit" form="recycle-form">仅保存</button>
        <button class="button button-primary" type="submit" form="recycle-form" data-next="rule">保存并新建规则</button>
      </div>
    `;
    openDialog({
      title: editing ? '编辑回收类型' : '新增回收类型参数',
      kicker: '02 / TYPE DEFINITIONS',
      description: '定义归类维度、结算映射和是否允许成交后二次转移。',
      body,
      footer
    });
    const form = document.getElementById('recycle-form');
    const updatePreview = () => {
      const data = new FormData(form);
      const previewData = {
        ...current,
        name: String(data.get('name') || '').trim() || '未命名类型',
        code: String(data.get('code') || '').trim() || 'CODE',
        dimension: String(data.get('dimension') || 'business'),
        usage: String(data.get('usage') || 'deal'),
        settlement: String(data.get('settlement') || '购销'),
        entity: String(data.get('entity') || '').trim() || '待配置',
        legacyCode: String(data.get('legacyCode') || '').trim() || '—',
        allowTransfer: data.get('allowTransfer') === 'on'
      };
      document.getElementById('type-preview').innerHTML = typePreviewMarkup(previewData);
    };
    form.addEventListener('input', updatePreview);
    form.addEventListener('change', updatePreview);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const code = String(data.get('code') || '').trim().toUpperCase().replace(/\s+/g, '-');
      const duplicate = state.recycleTypes.find((type) => type.id !== current.id && (type.name === name || type.code === code));
      if (duplicate) {
        showToast('类型重复', '回收类型名称或编码已存在，请修改后再保存。', true);
        return;
      }
      const next = editing ? state.recycleTypes.find((type) => type.id === current.id) : {
        id: `rt_${Date.now()}`,
        name: '',
        code: '',
        dimension: 'business',
        usage: 'deal',
        settlement: '购销',
        entity: '',
        legacyCode: '',
        allowTransfer: true,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: ''
      };
      next.name = name;
      next.code = code;
      next.dimension = String(data.get('dimension') || 'business');
      next.usage = String(data.get('usage') || 'deal');
      next.settlement = String(data.get('settlement') || '购销');
      next.entity = String(data.get('entity') || '').trim();
      next.legacyCode = String(data.get('legacyCode') || '').trim();
      next.allowTransfer = data.get('allowTransfer') === 'on';
      next.status = String(data.get('status') || 'enabled');
      next.updatedAt = nowLabel();
      if (!editing) state.recycleTypes.push(next);
      saveState();
      closeDialog();
      const shouldCreateRule = event.submitter?.dataset.next === 'rule';
      showToast(editing ? '回收类型已更新' : '回收类型已创建', `${next.name} · ${getRuleCountForType(next.id)} 条关联规则`);
      if (shouldCreateRule) {
        openRuleDialog({ preset: { targetTypeId: next.id, name: `${next.name}归类` } });
      } else {
        render();
      }
    });
  }

  function typePreviewMarkup(item) {
    const meta = dimensionMeta(item.dimension);
    return `
      <div class="preview-top"><span>TYPE PREVIEW</span><span>${meta.en}</span></div>
      <div class="preview-main">
        <div class="preview-label">${meta.name}</div>
        <div class="preview-name">${escapeHtml(item.name || '未命名类型')}</div>
        <div class="preview-code">${escapeHtml(item.code || 'CODE')} · ${item.usage === 'transfer' ? '物权结果' : '成交结果'}</div>
        <div class="preview-tagline">
          <span class="preview-tag">${item.allowTransfer ? '允许继续转移' : '最终类型'}</span>
          <span class="preview-tag">${escapeHtml(item.settlement || '购销')}</span>
        </div>
      </div>
      <div class="preview-mapping">
        <div class="preview-map-row"><span>核算主体</span><b>${escapeHtml(item.entity || '待配置')}</b></div>
        <div class="preview-map-row"><span>旧系统编码</span><b>${escapeHtml(item.legacyCode || '—')}</b></div>
        <div class="preview-map-row"><span>归类型规则</span><b>${getRuleCountForType(item.id)} 条</b></div>
      </div>
    `;
  }

  function conditionRowHtml(condition, stage) {
    const dimensions = getStageDimensions(stage);
    const selectedDimension = dimensions.includes(condition?.dimension) ? condition.dimension : dimensions[0];
    const options = conditionValueOptions(selectedDimension);
    const selectedValue = options.some((option) => option.id === condition?.value) ? condition.value : options[0]?.id || '';
    return `
      <div class="condition-row">
        <select class="select cond-dimension" aria-label="条件字段">
          ${dimensions.map((dimension) => `<option value="${dimension}" ${dimension === selectedDimension ? 'selected' : ''}>${CONDITION_LABELS[dimension]}</option>`).join('')}
        </select>
        <select class="select cond-value" aria-label="条件值">
          ${options.map((option) => `<option value="${escapeHtml(option.id)}" ${option.id === selectedValue ? 'selected' : ''}>${escapeHtml(option.name)}</option>`).join('')}
        </select>
        <button class="condition-remove" type="button" aria-label="删除条件" data-rule-remove-condition>×</button>
      </div>
    `;
  }

  function conditionsMarkup(conditions, stage) {
    if (!conditions.length) {
      return '<div class="condition-empty">当前没有条件。保存后该规则为“显式兜底”，会匹配该阶段全部订单。</div>';
    }
    return conditions.map((condition) => conditionRowHtml(condition, stage)).join('');
  }

  function nextRuleId(stage) {
    const prefix = stage === 'transfer' ? 'R-OWN' : 'R-DEAL';
    let index = 1;
    while (findRule(`${prefix}-${String(index).padStart(3, '0')}`)) index += 1;
    return `${prefix}-${String(index).padStart(3, '0')}`;
  }

  function openRuleDialog({ rule = null, preset = {} } = {}) {
    const editing = Boolean(rule);
    const defaultStage = preset.stage || rule?.stage || ui.ruleStage || 'deal';
    const initialConditions = preset.conditions || rule?.conditions || [defaultCondition(defaultStage)];
    const current = rule || {
      id: nextRuleId(defaultStage),
      name: preset.name || (defaultStage === 'transfer' ? '新物权转移规则' : '新成交分类规则'),
      stage: defaultStage,
      priority: defaultStage === 'transfer' ? 220 : 110,
      targetTypeId: preset.targetTypeId || (defaultStage === 'transfer' ? 'rt_purchase' : 'rt_phone'),
      conditions: initialConditions,
      tags: [],
      stopOnMatch: true,
      status: 'draft'
    };
    const previewConditions = preset.conditions || current.conditions || [];
    const body = `
      <div class="dialog-layout">
        <form id="rule-form" data-id="${editing ? current.id : ''}" data-original-stage="${current.stage}" data-original-id="${current.id}">
          <div class="form-section">
            <div class="form-section-title"><h3>规则信息</h3><span>01 / RULE META</span></div>
            <div class="form-grid-2">
              <label class="field"><span>规则名称 <b class="required">*</b></span><input class="input" name="name" required maxlength="36" value="${escapeHtml(current.name)}" /></label>
              <label class="field"><span>触发阶段</span><select class="select" name="stage"><option value="deal" ${current.stage === 'deal' ? 'selected' : ''}>成交确认</option><option value="transfer" ${current.stage === 'transfer' ? 'selected' : ''}>物权转移生效</option></select></label>
            </div>
            <div class="form-grid-2">
              <label class="field"><span>优先级 <b class="required">*</b></span><input class="input mono" name="priority" type="number" min="0" max="999" required value="${current.priority}" /><small class="field-note">数值越大越先执行；同阶段同优先级且输出不同会触发冲突。</small></label>
              <label class="field"><span>输出回收类型 <b class="required">*</b></span><select class="select" name="targetTypeId">${selectOptions(state.recycleTypes.map((type) => ({ id: type.id, name: `${type.name} · ${type.code}` })), current.targetTypeId)}</select><small class="field-note">规则只输出一个主类型，其他命中写入标签。</small></label>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title"><h3>匹配条件</h3><span>02 / CONDITIONS · ALL MUST MATCH</span></div>
            <div class="condition-builder">
              <div class="condition-head"><span>条件之间为 AND；一个条件都不添加时表示显式兜底。</span><span class="mono">AND</span></div>
              <div class="condition-list" id="condition-list">${conditionsMarkup(previewConditions, current.stage)}</div>
              <button class="condition-add" type="button" data-rule-add-condition>＋ 添加条件</button>
            </div>
            <label class="field"><span>归类标签（逗号分隔）</span><input class="input" name="tags" value="${escapeHtml((current.tags || []).join('，'))}" placeholder="留空则按条件和输出类型自动生成" /></label>
            <div class="form-grid-2">
              <label class="checkbox-line"><input type="checkbox" name="stopOnMatch" ${current.stopOnMatch !== false ? 'checked' : ''} /><span>命中后锁定主类型<small>关闭后仍继续匹配，但当前版本只采用最高优先级结果。</small></span></label>
              <label class="checkbox-line"><input type="checkbox" name="enableNow" ${editing ? (current.status === 'enabled' ? 'checked' : '') : 'checked'} /><span>保存后立即启用<small>有冲突时自动保存为草稿并阻断发布。</small></span></label>
            </div>
          </div>

          <div id="rule-live-preview">${rulePreviewMarkup(current, getConflicts(current, editing ? current.id : 'new'))}</div>
        </form>

        <aside class="preview-card">
          <div class="preview-top"><span>RULE PREVIEW</span><span>${current.stage === 'transfer' ? 'OWNERSHIP' : 'BID WON'}</span></div>
          <div class="preview-main">
            <div class="preview-label">规则结果预览</div>
            <div class="preview-name" id="preview-rule-name">${escapeHtml(current.name)}</div>
            <div class="preview-code" id="preview-rule-id">${escapeHtml(current.id)} · ${eventName(current.stage)}</div>
            <div class="preview-tagline" id="preview-condition-tags"></div>
          </div>
          <div class="preview-mapping" id="preview-target-mapping"></div>
          <div style="padding:12px 13px;border-top:1px solid #3a4036;color:#899282;font-size:8px;line-height:1.6;">
            规则发布后只影响新事件。已成交订单继续使用成交时固化的规则快照。
          </div>
        </aside>
      </div>
    `;
    const footer = `
      <span class="dialog-foot-note">条件引用参数 ID，名称变化不会破坏历史规则。</span>
      <div class="dialog-foot-actions">
        <button class="button button-secondary" type="button" data-dialog-close>取消</button>
        <button class="button button-primary" type="submit" form="rule-form">${editing ? '保存规则' : '创建规则'}</button>
      </div>
    `;
    openDialog({
      title: editing ? '编辑分类规则' : '新建分类规则',
      kicker: current.stage === 'transfer' ? '03 / OWNERSHIP RULE' : '03 / DEAL CLASSIFICATION',
      description: '参数定义可选项，规则负责组合条件、优先级与输出动作。',
      body,
      footer,
      wide: true
    });
    const form = document.getElementById('rule-form');
    const conditionList = document.getElementById('condition-list');
    const runUpdate = () => updateRulePreview(form, current, editing);
    form.addEventListener('input', runUpdate);
    form.addEventListener('change', (event) => {
      if (event.target.name === 'stage') {
        const nextStage = event.target.value;
        conditionList.innerHTML = conditionsMarkup([defaultCondition(nextStage)], nextStage);
      }
      if (event.target.classList.contains('cond-dimension')) {
        const row = event.target.closest('.condition-row');
        const dimension = event.target.value;
        const valueSelect = row.querySelector('.cond-value');
        const options = conditionValueOptions(dimension);
        valueSelect.innerHTML = options.map((option) => `<option value="${escapeHtml(option.id)}">${escapeHtml(option.name)}</option>`).join('');
        runUpdate();
        return;
      }
      runUpdate();
    });
    form.addEventListener('click', (event) => {
      const addButton = event.target.closest('[data-rule-add-condition]');
      if (addButton) {
        const stage = form.elements.stage.value;
        const currentConditions = collectRuleConditions(form);
        const emptyState = conditionList.querySelector('.condition-empty');
        if (emptyState) emptyState.remove();
        const next = defaultCondition(stage);
        if (currentConditions.some((condition) => condition.dimension === next.dimension && condition.value === next.value)) {
          const options = getStageDimensions(stage);
          const unusedDimension = options.find((dimension) => !currentConditions.some((condition) => condition.dimension === dimension));
          if (unusedDimension) {
            const option = conditionValueOptions(unusedDimension)[0];
            next.dimension = unusedDimension;
            next.value = option?.id || '';
          }
        }
        conditionList.insertAdjacentHTML('beforeend', conditionRowHtml(next, stage));
        runUpdate();
        return;
      }
      const removeButton = event.target.closest('[data-rule-remove-condition]');
      if (removeButton) {
        removeButton.closest('.condition-row').remove();
        if (!conditionList.querySelector('.condition-row')) {
          conditionList.innerHTML = '<div class="condition-empty">当前没有条件。保存后该规则为“显式兜底”，会匹配该阶段全部订单。</div>';
        }
        runUpdate();
      }
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const stage = String(data.get('stage') || 'deal');
      const priority = Number(data.get('priority'));
      const targetTypeId = String(data.get('targetTypeId') || '');
      const conditions = collectRuleConditions(form);
      if (!targetTypeId) {
        showToast('缺少输出类型', '请选择一个回收类型作为规则结果。', true);
        return;
      }
      if (!Number.isFinite(priority) || priority < 0 || priority > 999) {
        showToast('优先级不合法', '请输入 0 到 999 之间的整数。', true);
        return;
      }
      const candidate = {
        id: editing ? current.id : current.id,
        stage,
        priority,
        targetTypeId
      };
      const conflicts = getConflicts(candidate, editing ? current.id : '__new__');
      const enableNow = data.get('enableNow') === 'on';
      const tagsInput = String(data.get('tags') || '').trim();
      const tags = tagsInput
        ? unique(tagsInput.split(/[，,]/).map((item) => item.trim()))
        : deriveRuleTags(conditions, targetTypeId);
      const ruleId = editing ? current.id : nextRuleId(stage);
      const next = editing ? findRule(current.id) : {
        id: ruleId,
        name: '',
        stage,
        priority,
        targetTypeId,
        status: 'draft',
        conditions: [],
        tags: [],
        stopOnMatch: true,
        version: 'v1.0',
        updatedAt: ''
      };
      next.name = String(data.get('name') || '').trim();
      next.stage = stage;
      next.priority = priority;
      next.targetTypeId = targetTypeId;
      next.conditions = conditions;
      next.tags = tags;
      next.stopOnMatch = data.get('stopOnMatch') === 'on';
      next.status = conflicts.length ? 'draft' : (enableNow ? 'enabled' : 'draft');
      next.version = editing ? bumpVersion(current.version) : 'v1.0';
      next.updatedAt = nowLabel();
      if (!editing) state.rules.push(next);
      saveState();
      closeDialog();
      ui.ruleStage = stage;
      showToast(
        conflicts.length ? '规则已保存为草稿' : (editing ? '规则已更新' : '规则已创建'),
        conflicts.length ? `检测到 ${conflicts.length} 组同优先级冲突，请先调整优先级或输出类型。` : `${next.name} · ${eventName(stage)} · 优先级 ${priority}`,
        Boolean(conflicts.length)
      );
      if (activeViewFromHash() === 'rules') {
        render();
      } else {
        goTo('rules');
      }
    });
    runUpdate();
  }

  function bumpVersion(version) {
    const match = String(version || 'v1.0').match(/^v(\d+)\.(\d+)$/);
    if (!match) return 'v1.1';
    return `v${match[1]}.${Number(match[2]) + 1}`;
  }

  function collectRuleConditions(form) {
    return [...form.querySelectorAll('.condition-row')].map((row) => ({
      dimension: row.querySelector('.cond-dimension').value,
      value: row.querySelector('.cond-value').value
    })).filter((condition) => condition.dimension && condition.value);
  }

  function rulePreviewMarkup(candidate, conflicts) {
    const target = findRecycleType(candidate.targetTypeId);
    const tags = deriveRuleTags(candidate.conditions || [], candidate.targetTypeId);
    return `
      <div class="rule-live-preview">
        <div class="live-preview-label">LIVE RULE CHECK</div>
        <div class="live-preview-title">${escapeHtml(candidate.name || '未命名规则')}</div>
        <div class="live-preview-cond">${candidate.conditions?.length ? candidate.conditions.map((condition) => escapeHtml(conditionLabel(condition))).join(' · ') : '显式兜底 · 无条件匹配全部订单'}</div>
        <div class="live-preview-output"><span class="arrow">→</span><b>${escapeHtml(target?.name || '未选择输出类型')}</b><span class="tag tag-muted">优先级 ${escapeHtml(candidate.priority ?? '—')}</span></div>
        <div class="live-conflict ${conflicts.length ? 'is-visible' : ''}">${conflicts.length ? `⚠ 与 ${conflicts.map((rule) => rule.id).join('、')} 同优先级但输出不同，保存后将保持草稿并阻断发布。` : '✓ 当前未检测到同优先级输出冲突。'}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:9px;">${tags.map((tag) => `<span class="tag tag-muted">${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
    `;
  }

  function updateRulePreview(form, originalRule, editing) {
    const stage = form.elements.stage.value;
    const priority = Number(form.elements.priority.value);
    const targetTypeId = form.elements.targetTypeId.value;
    const conditions = collectRuleConditions(form);
    const candidate = {
      id: editing ? originalRule.id : '__new__',
      stage,
      priority,
      targetTypeId,
      conditions,
      name: form.elements.name.value
    };
    const conflicts = getConflicts(candidate, editing ? originalRule.id : '__new__');
    const previewRoot = document.getElementById('rule-live-preview');
    if (previewRoot) previewRoot.innerHTML = rulePreviewMarkup(candidate, conflicts);
    const target = findRecycleType(targetTypeId);
    const ruleName = document.getElementById('preview-rule-name');
    const ruleId = document.getElementById('preview-rule-id');
    const conditionTags = document.getElementById('preview-condition-tags');
    const mapping = document.getElementById('preview-target-mapping');
    if (ruleName) ruleName.textContent = candidate.name || '未命名规则';
    if (ruleId) ruleId.textContent = `${candidate.id === '__new__' ? '新规则' : candidate.id} · ${eventName(stage)} · 优先级 ${candidate.priority || '—'}`;
    if (conditionTags) {
      const tags = deriveRuleTags(conditions, targetTypeId);
      conditionTags.innerHTML = tags.map((tag) => `<span class="preview-tag">${escapeHtml(tag)}</span>`).join('');
    }
    if (mapping) {
      mapping.innerHTML = `
        <div class="preview-map-row"><span>输出类型</span><b>${escapeHtml(target?.name || '未选择')}</b></div>
        <div class="preview-map-row"><span>结算模式</span><b>${escapeHtml(target?.settlement || '—')}</b></div>
        <div class="preview-map-row"><span>核算主体</span><b>${escapeHtml(target?.entity || '—')}</b></div>
        <div class="preview-map-row"><span>旧系统编码</span><b>${escapeHtml(target?.legacyCode || '—')}</b></div>
      `;
    }
  }

  function openTransferDetail(eventId) {
    const event = state.transferEvents.find((item) => item.id === eventId);
    if (!event) return;
    const fromType = findRecycleType(event.fromTypeId);
    const toType = findRecycleType(event.toTypeId);
    const scene = findTransferScene(event.scene);
    const rule = findRule(event.ruleId);
    const body = `
      <div class="form-section">
        <div class="form-section-title"><h3>物权事件信息</h3><span>${escapeHtml(event.id)}</span></div>
        <div class="trace-meta-grid" style="grid-template-columns:repeat(2,1fr);">
          <div class="trace-meta-cell"><span>关联订单</span><strong>${escapeHtml(event.orderNo)}</strong></div>
          <div class="trace-meta-cell"><span>事件场景</span><strong>${escapeHtml(scene?.name || event.scene)}</strong></div>
          <div class="trace-meta-cell"><span>事件状态</span><strong>${event.status === 'pending' ? '等待物权实际生效' : '已生效并追加版本'}</strong></div>
          <div class="trace-meta-cell"><span>原权利人 → 新权利人</span><strong>${escapeHtml(event.ownerBefore)} → ${escapeHtml(event.ownerAfter)}</strong></div>
          <div class="trace-meta-cell"><span>变更前类型</span><strong>${escapeHtml(fromType?.name || event.fromTypeId)}</strong></div>
          <div class="trace-meta-cell"><span>变更后类型</span><strong>${escapeHtml(toType?.name || event.toTypeId)}</strong></div>
          <div class="trace-meta-cell"><span>命中规则</span><strong>${escapeHtml(rule ? `${rule.id} · ${rule.name}` : event.ruleId)}</strong></div>
          <div class="trace-meta-cell"><span>生效时间</span><strong>${escapeHtml(event.effectiveAt || '待确认')}</strong></div>
        </div>
      </div>
      <div class="notice ${event.status === 'pending' ? 'notice-warning' : 'notice-accent'} dialog-note"><span class="notice-mark">${event.status === 'pending' ? '!' : '✓'}</span><div><b>${event.status === 'pending' ? '尚未改写类型。' : '已完成二次变更。'}</b>${event.status === 'pending' ? '当前只是物权事件受理，必须确认实际转移后才允许追加类型版本。' : '历史成交版本原样保留，新类型作为后续版本追加。'}</div></div>
    `;
    const footer = event.status === 'pending'
      ? `<span class="dialog-foot-note">模拟操作只影响演示数据。</span><div class="dialog-foot-actions"><button class="button button-secondary" type="button" data-dialog-close>关闭</button><button class="button button-primary" type="button" data-action="apply-transfer" data-id="${event.id}">确认物权已生效</button></div>`
      : `<span class="dialog-foot-note">事件类型：OWNERSHIP_EFFECTIVE</span><div class="dialog-foot-actions"><button class="button button-primary" type="button" data-dialog-close>关闭</button></div>`;
    openDialog({
      title: event.status === 'pending' ? '物权事件 · 待生效' : '物权事件 · 已生效',
      kicker: '04 / OWNERSHIP EVENT',
      description: '申请、审核和发货均不直接触发类型变更。',
      body,
      footer,
      small: true
    });
  }

  function openTransferConfirm(eventId) {
    const event = state.transferEvents.find((item) => item.id === eventId);
    if (!event) return;
    const fromType = findRecycleType(event.fromTypeId);
    const toType = findRecycleType(event.toTypeId);
    const body = `
      <div class="notice notice-warning"><span class="notice-mark">!</span><div><b>这次操作会追加一个新的回收类型版本。</b>确认后，${escapeHtml(event.orderNo)} 的主类型将从“${escapeHtml(fromType?.name || event.fromTypeId)}”变为“${escapeHtml(toType?.name || event.toTypeId)}”，并同步结算模式与核算主体映射。</div></div>
      <div class="type-mapping" style="margin-top:16px;">
        <div class="mapping-cell"><span>原类型</span><strong>${escapeHtml(fromType?.name || event.fromTypeId)}</strong></div>
        <div class="mapping-cell"><span>新类型</span><strong>${escapeHtml(toType?.name || event.toTypeId)}</strong></div>
        <div class="mapping-cell"><span>事件 ID</span><strong class="mono">${escapeHtml(event.id)}</strong></div>
      </div>
      <label class="checkbox-line" style="margin-top:18px;"><input type="checkbox" id="transfer-ack" /><span>我已确认该订单的物权实际转移已经生效<small>不是售后申请、审核中或仅发货节点。</small></span></label>
    `;
    const footer = `
      <span class="dialog-foot-note">同一事件重复回调将按幂等处理。</span>
      <div class="dialog-foot-actions">
        <button class="button button-secondary" type="button" data-dialog-close>取消</button>
        <button class="button button-primary" type="button" id="execute-transfer-button" disabled data-action="execute-transfer" data-id="${event.id}">确认并变更类型</button>
      </div>
    `;
    openDialog({
      title: '确认物权转移生效',
      kicker: 'OWNERSHIP / CONFIRMATION',
      description: '确认实际转移，而不是申请或审核节点。',
      body,
      footer,
      small: true
    });
    const checkbox = document.getElementById('transfer-ack');
    const button = document.getElementById('execute-transfer-button');
    checkbox.addEventListener('change', () => {
      button.disabled = !checkbox.checked;
    });
  }

  function executeTransfer(eventId) {
    const event = state.transferEvents.find((item) => item.id === eventId);
    if (!event || event.status !== 'pending') {
      showToast('事件不可处理', '该事件已生效或状态已变化，请刷新查看。', true);
      return;
    }
    const toType = findRecycleType(event.toTypeId);
    const appliedAt = nowLabel();
    event.status = 'applied';
    event.effectiveAt = appliedAt;
    const trace = state.traces[event.orderNo];
    if (trace) {
      const pendingEntry = trace.entries.find((entry) => entry.transferEventId === event.id);
      if (pendingEntry) {
        pendingEntry.status = 'done';
        pendingEntry.time = appliedAt;
        pendingEntry.title = event.scene === 'after_sale' ? '售后物权回平台' : '成交未起售 · 物权回平台';
        pendingEntry.typeName = toType?.name || event.toTypeId;
        pendingEntry.description = '实际物权转移已确认，系统按事件快照追加新的类型版本。';
        pendingEntry.snapshot = unique([...(pendingEntry.snapshot || []), `effective: ${appliedAt}`]);
      } else {
        trace.entries.push({
          id: `TR-${Date.now()}`,
          time: appliedAt,
          event: '物权转移生效',
          title: event.scene === 'after_sale' ? '售后物权回平台' : '成交后物权回平台',
          typeName: toType?.name || event.toTypeId,
          source: event.id,
          description: '实际物权转移已确认，系统追加新的类型版本。',
          status: 'done',
          matched: [{ name: event.ruleId, priority: findRule(event.ruleId)?.priority || 0, status: 'applied' }],
          snapshot: [`物权事件 ${event.id}`, `effective: ${appliedAt}`]
        });
      }
      trace.currentTypeId = event.toTypeId;
      trace.status = event.scene === 'after_sale' ? '售后回收完成' : '待发货';
      trace.tags = unique([...trace.tags, toType?.name, event.scene === 'after_sale' ? '售后转移' : '未起售转移']);
      trace.updatedAt = appliedAt;
    }
    saveState();
    closeDialog();
    showToast('物权转移已生效', `${event.orderNo} · 回收类型已变更为 ${toType?.name || event.toTypeId}`);
    render();
  }

  function openConflictDialog() {
    const conflicts = getAllConflictPairs();
    const body = conflicts.length
      ? `<div class="notice notice-warning"><span class="notice-mark">!</span><div><b>检测到 ${conflicts.length} 组同阶段、同优先级、不同输出类型的规则。</b>当前实现无法证明条件互斥，因此发布会被阻断。</div></div>
         <div style="margin-top:16px;display:grid;gap:8px;">${conflicts.map(([first, second]) => `<div class="panel-pad" style="padding:13px;"><div style="display:flex;justify-content:space-between;gap:10px;"><strong style="font-size:11px;">${escapeHtml(first.name)} ↔ ${escapeHtml(second.name)}</strong><span class="tag tag-danger">优先级 ${first.priority}</span></div><div style="margin-top:7px;color:var(--muted);font-size:9px;">${escapeHtml(first.id)} → ${escapeHtml(findRecycleType(first.targetTypeId)?.name || first.targetTypeId)}<br />${escapeHtml(second.id)} → ${escapeHtml(findRecycleType(second.targetTypeId)?.name || second.targetTypeId)}</div></div>`).join('')}</div>`
      : `<div class="notice notice-accent"><span class="notice-mark">✓</span><div><b>当前没有同优先级输出冲突。</b>分组条件仍需在发布前用真实订单样本回放验证。</div></div>
         <div class="type-mapping" style="margin-top:16px;"><div class="mapping-cell"><span>成交规则</span><strong>${state.rules.filter((rule) => rule.stage === 'deal').length} 条</strong></div><div class="mapping-cell"><span>物权规则</span><strong>${state.rules.filter((rule) => rule.stage === 'transfer').length} 条</strong></div><div class="mapping-cell"><span>最近体检</span><strong>${nowLabel()}</strong></div></div>`;
    openDialog({
      title: '规则冲突体检',
      kicker: 'GOVERNANCE / CONFLICT CHECK',
      description: '检查同阶段、同优先级、不同输出类型。',
      body,
      footer: `<span class="dialog-foot-note">正式系统还应补充条件集合互斥证明与试算回放。</span><div class="dialog-foot-actions"><button class="button button-primary" type="button" data-dialog-close>知道了</button></div>`,
      small: true
    });
  }

  function openPublishDialog() {
    const conflicts = getAllConflictPairs();
    const drafts = state.rules.filter((rule) => rule.status === 'draft');
    const body = `
      <div class="metric-strip" style="grid-template-columns:repeat(3,1fr);margin-top:0;">
        <article class="metric"><div class="metric-label"><span>待发布规则</span><span>DRAFT</span></div><strong>${drafts.length}</strong><div class="metric-meta">当前规则版本 v1.4</div></article>
        <article class="metric"><div class="metric-label"><span>冲突阻断</span><span>CONFLICT</span></div><strong style="color:${conflicts.length ? 'var(--danger)' : 'var(--success)'}">${conflicts.length}</strong><div class="metric-meta">${conflicts.length ? '需调整优先级' : '可以发布'}</div></article>
        <article class="metric"><div class="metric-label"><span>已启用</span><span>ACTIVE</span></div><strong>${state.rules.filter((rule) => rule.status === 'enabled').length}</strong><div class="metric-meta">发布只影响后续事件</div></article>
      </div>
      ${conflicts.length ? `<div class="notice notice-warning dialog-note"><span class="notice-mark">!</span><div><b>发布已被阻断。</b>先处理同优先级输出冲突，再重新发布。</div></div>` : ''}
      ${drafts.length ? `<div class="table-shell" style="margin-top:16px;"><div class="data-head" style="grid-template-columns:1.4fr .6fr .7fr;"><span>规则</span><span>事件</span><span>输出类型</span></div>${drafts.map((rule) => `<div class="business-row" style="grid-template-columns:1.4fr .6fr .7fr;min-height:58px;"><div><strong style="font-size:10px;">${escapeHtml(rule.name)}</strong><div class="mono" style="color:var(--muted-2);font-size:8px;">${escapeHtml(rule.id)} · 优先级 ${rule.priority}</div></div><span style="font-size:9px;">${eventName(rule.stage)}</span><span class="tag tag-accent">${escapeHtml(findRecycleType(rule.targetTypeId)?.name || '—')}</span></div>`).join('')}</div></div>` : `<div class="notice notice-accent dialog-note"><span class="notice-mark">✓</span><div><b>当前没有草稿规则。</b>参数和已启用规则仍可在各自页面继续编辑。</div></div>`}
      <div class="notice dialog-note"><span class="notice-mark">i</span><div>发布采用“规则快照”方式：已成交订单不会回刷；新订单在成交或物权生效时读取最新启用版本。</div></div>
    `;
    const footer = `<span class="dialog-foot-note">演示环境不会写入真实配置。</span><div class="dialog-foot-actions"><button class="button button-secondary" type="button" data-dialog-close>取消</button><button class="button button-primary" type="button" data-action="execute-publish" ${!drafts.length || conflicts.length ? 'disabled' : ''}>发布 ${drafts.length || ''} 条变更</button></div>`;
    openDialog({
      title: '发布规则变更',
      kicker: 'RELEASE / CONFIGURATION SNAPSHOT',
      description: '发布前检查冲突、草稿与影响范围。',
      body,
      footer,
      small: true
    });
  }

  function executePublish() {
    const conflicts = getAllConflictPairs();
    if (conflicts.length) {
      showToast('发布被阻断', '请先处理同优先级冲突。', true);
      return;
    }
    const drafts = state.rules.filter((rule) => rule.status === 'draft');
    if (!drafts.length) {
      showToast('没有待发布规则', '当前规则均已处于启用状态。');
      closeDialog();
      return;
    }
    drafts.forEach((rule) => {
      rule.status = 'enabled';
      rule.updatedAt = nowLabel();
    });
    saveState();
    closeDialog();
    showToast('变更已发布', `${drafts.length} 条规则已进入生效状态；历史订单快照保持不变。`);
    render();
  }

  function openResetDialog() {
    const body = `<div class="notice notice-warning"><span class="notice-mark">!</span><div><b>将恢复初始演示数据。</b>新增的业务类型、回收类型、规则、模拟物权事件和试算快照都会被清除。</div></div><p style="margin:16px 0 0;color:var(--muted);font-size:10px;">重置只影响当前浏览器的本地演示状态，不会影响真实系统。</p>`;
    const footer = `<span class="dialog-foot-note">此操作不可撤销。</span><div class="dialog-foot-actions"><button class="button button-secondary" type="button" data-dialog-close>取消</button><button class="button button-danger" type="button" data-action="execute-reset">确认重置</button></div>`;
    openDialog({
      title: '重置演示数据',
      kicker: 'DEMO / RESET',
      description: '恢复到初始配置与示例订单。',
      body,
      footer,
      small: true
    });
  }

  function executeReset() {
    localStorage.removeItem(STORAGE_KEY);
    state = createDefaultState();
    ui.ruleStage = 'deal';
    ui.typeDimension = 'all';
    ui.activeTrace = 'TC202611140083';
    ui.simDirty = false;
    saveState();
    closeDialog();
    showToast('演示数据已重置', '已恢复业务类型、回收类型、规则和示例订单。');
    render();
  }

  function handlePreset(preset) {
    const presets = {
      'phone-robot': {
        businessTypeId: 'bt_value',
        currentTypeId: 'rt_bidder',
        phoneHit: 'hit',
        channelId: 'retail',
        winnerType: 'robot',
        robotId: 'r5',
        eventType: 'pre_sale'
      },
      enterprise: {
        businessTypeId: 'bt_enterprise',
        currentTypeId: 'rt_bidder',
        phoneHit: 'miss',
        channelId: 'enterprise',
        winnerType: 'buyer',
        robotId: 'r5',
        eventType: 'only'
      },
      'after-sale': {
        businessTypeId: 'bt_enterprise',
        currentTypeId: 'rt_robot',
        phoneHit: 'miss',
        channelId: 'enterprise',
        winnerType: 'robot',
        robotId: 'r5',
        eventType: 'after_sale'
      }
    };
    state.simulator = clone(presets[preset] || presets['phone-robot']);
    state.lastSim = null;
    ui.simDirty = false;
    saveState();
    render();
  }

  function handleAction(actionElement, event) {
    const action = actionElement.dataset.action;
    const id = actionElement.dataset.id;
    switch (action) {
      case 'add-business':
        openBusinessDialog();
        break;
      case 'edit-business':
        openBusinessDialog(findBusinessType(id));
        break;
      case 'open-business-rule': {
        const business = findBusinessType(id);
        const linkedType = getBusinessLinkedTypes(id)[0];
        openRuleDialog({
          preset: {
            name: `${business?.name || '业务'}业务归类`,
            conditions: [{ dimension: 'business_type', value: id }],
            targetTypeId: linkedType?.id || 'rt_value'
          }
        });
        break;
      }
      case 'add-type':
        openRecycleDialog();
        break;
      case 'edit-type':
        openRecycleDialog(findRecycleType(id));
        break;
      case 'open-type-rule': {
        const type = findRecycleType(id);
        openRuleDialog({
          preset: {
            name: `${type?.name || '类型'}归类`,
            targetTypeId: id
          }
        });
        break;
      }
      case 'filter-type':
        ui.typeDimension = actionElement.dataset.dimension;
        render();
        break;
      case 'open-rule':
        openRuleDialog({});
        break;
      case 'edit-rule':
        openRuleDialog({ rule: findRule(id) });
        break;
      case 'filter-stage':
        ui.ruleStage = actionElement.dataset.stage;
        render();
        break;
      case 'toggle-rule': {
        const rule = findRule(id);
        if (!rule) break;
        if (rule.status !== 'enabled') {
          const conflicts = getConflicts(rule);
          if (conflicts.length) {
            showToast('无法启用规则', `与 ${conflicts.map((item) => item.id).join('、')} 存在同优先级输出冲突。`, true);
            break;
          }
          rule.status = 'enabled';
          rule.updatedAt = nowLabel();
          showToast('规则已启用', `${rule.name} 将从下一笔成交或物权事件开始生效。`);
        } else {
          rule.status = 'disabled';
          rule.updatedAt = nowLabel();
          showToast('规则已停用', `${rule.name} 不再参与新订单匹配，历史快照不受影响。`);
        }
        saveState();
        render();
        break;
      }
      case 'check-conflicts':
        openConflictDialog();
        break;
      case 'publish':
        openPublishDialog();
        break;
      case 'execute-publish':
        executePublish();
        break;
      case 'set-transfer-policy':
        state.transferPolicy = actionElement.dataset.policy;
        saveState();
        render();
        showToast(
          state.transferPolicy === 'effective' ? '已切回推荐口径' : '已切换为申请时变更',
          state.transferPolicy === 'effective' ? '仅在物权实际生效后变更回收类型。' : '演示风险口径：需额外配置撤销冲正与财务审批。',
          state.transferPolicy !== 'effective'
        );
        break;
      case 'view-transfer':
        openTransferDetail(id);
        break;
      case 'apply-transfer':
        openTransferConfirm(id);
        break;
      case 'execute-transfer':
        executeTransfer(id);
        break;
      case 'go-view': {
        if (actionElement.dataset.stage) ui.ruleStage = actionElement.dataset.stage;
        goTo(actionElement.dataset.view);
        break;
      }
      case 'go-trace':
        if (actionElement.dataset.order) ui.activeTrace = actionElement.dataset.order;
        goTo('trace');
        break;
      case 'set-sim-winner':
        state.simulator.winnerType = actionElement.dataset.winner;
        ui.simDirty = Boolean(state.lastSim);
        saveState();
        render();
        break;
      case 'apply-preset':
        handlePreset(actionElement.dataset.preset);
        break;
      case 'run-sim': {
        state.lastSim = runSimulation(state.simulator);
        const trace = makeTraceFromSimulation(state.lastSim);
        delete state.traces['SIM-20261114-001'];
        state.traces[trace.orderNo] = trace;
        ui.activeTrace = trace.orderNo;
        ui.simDirty = false;
        saveState();
        render();
        document.querySelector('.sim-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast('试算完成', `${state.lastSim.orderNo} · 最终类型 ${findRecycleType(state.lastSim.finalTypeId)?.name || '未归类'}`);
        break;
      }
      case 'select-trace':
        ui.activeTrace = actionElement.dataset.order;
        render();
        break;
      case 'reset-demo':
        openResetDialog();
        break;
      case 'execute-reset':
        executeReset();
        break;
      default:
        break;
    }
  }

  document.addEventListener('click', (event) => {
    const closeTrigger = event.target.closest('[data-dialog-close]');
    if (closeTrigger) {
      closeDialog();
      return;
    }
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;
    if (actionElement.disabled) return;
    handleAction(actionElement, event);
  });

  document.addEventListener('change', (event) => {
    const field = event.target.closest('[data-sim-field]');
    if (!field) return;
    state.simulator[field.dataset.simField] = field.value;
    ui.simDirty = Boolean(state.lastSim);
    saveState();
    const shell = document.getElementById('sim-shell');
    if (shell) shell.classList.toggle('is-dirty', ui.simDirty);
  });

  appDialog.addEventListener('click', (event) => {
    if (event.target === appDialog) closeDialog();
  });

  window.addEventListener('hashchange', () => {
    render({ scrollTop: true });
  });

  if (!window.location.hash) {
    history.replaceState(null, '', '#overview');
  }
  render();
})();
