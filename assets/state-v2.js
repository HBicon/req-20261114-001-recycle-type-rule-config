(() => {
  'use strict';

  window.BUSINESS_LABEL_DEFAULT_STATE = {
    version: 5,
    currentUser: '林澜',
    currentRoleId: 'self_author',
    ruleVersion: 'v1.4',
    roles: [
      {
        id: 'self_author',
        name: '林澜',
        title: '自营标签配置人',
        short: '自营配置',
        capabilities: ['label:submit', 'rule:submit', 'trace:view']
      },
      {
        id: 'eco_author',
        name: '陈屿',
        title: '生态标签配置人',
        short: '生态配置',
        capabilities: ['label:submit', 'rule:submit', 'trace:view']
      },
      {
        id: 'self_reviewer',
        name: '韩审核',
        title: '自营标签审核人',
        short: '自营审核',
        capabilities: ['label:approve:self', 'manual:approve:self', 'trace:view']
      },
      {
        id: 'eco_reviewer',
        name: '李审核',
        title: '生态标签审核人',
        short: '生态审核',
        capabilities: ['label:approve:eco', 'manual:approve:eco', 'trace:view']
      },
      {
        id: 'platform_admin',
        name: '周平台',
        title: '标签平台管理员',
        short: '平台管理',
        capabilities: ['label:submit', 'label:approve:all', 'rule:submit', 'rule:approve:all', 'trace:view', 'manual:submit', 'manual:approve:all']
      },
      {
        id: 'ops_exception',
        name: '陈运营',
        title: '运营异常处理人',
        short: '异常运营',
        capabilities: ['trace:view', 'manual:submit']
      },
      {
        id: 'viewer',
        name: '只读访客',
        title: '业务只读访问',
        short: '只读',
        capabilities: ['trace:view']
      }
    ],
    eventCatalog: [
      { id: 'ORDER_WON', name: '订单成交', scope: '新订单', description: '写入原始标签并将当前标签初始化为原始标签。' },
      { id: 'CHANNEL_CORRECTED', name: '渠道事实修正', scope: '后续事件', description: '渠道字段发生变化后，按事件发生时间匹配当时的生效规则版本。' },
      { id: 'AFTER_SALE_APPLIED', name: '售后申请', scope: '信息事件', description: '仅记录事件，不直接修改当前标签。' },
      { id: 'OWNERSHIP_EFFECTIVE', name: '售后物权生效', scope: '后续事件', description: '物权实际生效后重新计算当前标签。' },
      { id: 'MANUAL_REPLAY', name: '审批后重算', scope: '人工触发', description: '仅批准后的异常修复或规则重算任务可调用。' }
    ],
    governancePolicies: [
      { id: 'P-001', title: '原始标签不可变', level: '强制', detail: '成交时按订单部门写入，接口、页面与规则均不得覆盖。' },
      { id: 'P-002', title: '当前标签唯一', level: '强制', detail: '一个订单任一时刻仅保留一个当前业务标签。' },
      { id: 'P-003', title: '高优先级胜出', level: '强制', detail: '多条规则命中时，仅最高优先级的唯一规则参与输出。' },
      { id: 'P-004', title: '同优先级冲突阻断', level: '强制', detail: '同部门、同优先级、条件可重叠且目标不同时禁止发布。' },
      { id: 'P-005', title: '历史订单默认不追溯', level: '强制', detail: '新版本配置仅影响新订单及后续事件，不自动回算历史订单。' },
      { id: 'P-006', title: '人工变更必须审批', level: '强制', detail: '运营不能直接改写订单标签，修复与重算均通过独立审批事项执行。' }
    ],
    audits: [
      { id: 'AU-1048', time: '11-19 11:08', actor: '平台运营', action: '提交共用标签', object: '共管-机器人专项 · v0.1', result: '待自营、生态双审' },
      { id: 'AU-1047', time: '11-19 10:36', actor: '规则引擎', action: '更新当前标签', object: 'TC202611190108', result: 'R-001 · v1.2 命中' },
      { id: 'AU-1046', time: '11-19 10:12', actor: '自营审核人', action: '发布规则', object: 'R-001 · v1.2', result: '已生效' },
      { id: 'AU-1045', time: '11-19 09:42', actor: '自营运营专员', action: '提交异常修复', object: 'TC202611180032', result: '待审核' },
      { id: 'AU-1044', time: '11-18 17:48', actor: '生态审核人', action: '停用规则', object: '买家-企业版旧规则', result: '仅影响后续订单' }
    ],
    baseLabels: [
      {
        id: 'BASE-SELF',
        code: 'FLASHBACK_DEAL',
        name: '闪回-闪回成交',
        department: 'self',
        category: 'base',
        description: '自营部门订单成交时写入的默认原始业务标签。',
        protected: true,
        status: 'enabled'
      },
      {
        id: 'BASE-BUYER',
        code: 'BUYER_DEAL',
        name: '买家-买家成交',
        department: 'buyer',
        category: 'base',
        description: '生态部门订单成交时写入的默认原始业务标签。',
        protected: true,
        status: 'enabled'
      }
    ],
    categories: [
      { id: 'cat_robot', name: '机器人成交', code: 'ROBOT', description: '机器人报价、自营机器人、生态兜底机器人等场景。', count: 4 },
      { id: 'cat_channel', name: '渠道成交', code: 'CHANNEL', description: '指定渠道、闲鱼兜底与生态渠道场景。', count: 2 },
      { id: 'cat_value', name: '保值换新', code: 'VALUE_TRADE', description: '闪回或买家保值订单中标成交。', count: 2 },
      { id: 'cat_enterprise', name: '企业业务', code: 'ENTERPRISE', description: '企业购和企业版买家成交场景。', count: 2 },
      { id: 'cat_service', name: '售后与物权', code: 'OWNERSHIP', description: '售后、物权变更和转自营场景。', count: 3 },
      { id: 'cat_custom', name: '自定义业务', code: 'CUSTOM', description: '部门按指定手机号或业务规则定义的特殊标签。', count: 2 }
    ],
    labels: [
      {
        id: 'tag_multi_robot',
        code: 'SELF_MULTI_ROBOT',
        name: '多个机器人',
        department: 'self',
        categoryId: 'cat_robot',
        description: '自由配置的多个机器人出价成交订单。',
        owner: '自营业务运营',
        status: 'enabled',
        version: 'v1.2',
        updatedAt: '11-19 10:12',
        ruleIds: ['R-001']
      },
      {
        id: 'tag_eco_no_quote',
        code: 'ECO_NO_QUOTE',
        name: '生态-无人报价',
        department: 'eco',
        categoryId: 'cat_robot',
        description: '生态BU配置的兜底机器人成交订单。',
        owner: '生态业务运营',
        status: 'enabled',
        version: 'v1.1',
        updatedAt: '11-18 16:30',
        ruleIds: ['R-002']
      },
      {
        id: 'tag_eco_platform',
        code: 'ECO_PLATFORM_FALLBACK',
        name: '生态-平台兜底报价',
        department: 'eco',
        categoryId: 'cat_robot',
        description: '生态BU配置的保价一口价机器人成交订单。',
        owner: '生态业务运营',
        status: 'enabled',
        version: 'v1.1',
        updatedAt: '11-18 16:30',
        ruleIds: ['R-003']
      },
      {
        id: 'tag_flash_value',
        code: 'FLASHBACK_VALUE',
        name: '闪回-保值换新',
        department: 'self',
        categoryId: 'cat_value',
        description: '审单报保值订单中标并成交。',
        owner: '闪回渠道运营',
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-17 11:26',
        ruleIds: ['R-004']
      },
      {
        id: 'tag_eco_channel',
        code: 'ECO_CHANNEL',
        name: '生态-生态渠道',
        department: 'eco',
        categoryId: 'cat_channel',
        description: '指定业务闲鱼通知兜底成交订单。',
        owner: '生态渠道运营',
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-17 11:26',
        ruleIds: ['R-005']
      },
      {
        id: 'tag_flash_xiaomi',
        code: 'FLASHBACK_SERVICE',
        name: '闪回-小米售后',
        department: 'self',
        categoryId: 'cat_service',
        description: '指定售后渠道成交订单，渠道编号在公网版本中脱敏。',
        owner: '闪回渠道运营',
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-17 11:26',
        ruleIds: ['R-006']
      },
      {
        id: 'tag_self_custom',
        code: 'SELF_CUSTOM',
        name: '自定义',
        department: 'self',
        categoryId: 'cat_custom',
        description: '自营由买家手机号报价转自营成交。',
        owner: '自营业务运营',
        status: 'enabled',
        version: 'v1.1',
        updatedAt: '11-19 10:18',
        ruleIds: ['R-007']
      },
      {
        id: 'tag_eco_custom',
        code: 'ECO_CUSTOM',
        name: '自定义',
        department: 'eco',
        categoryId: 'cat_custom',
        description: '生态由买家手机号报价转生态成交。',
        owner: '生态业务运营',
        status: 'enabled',
        version: 'v1.1',
        updatedAt: '11-19 10:18',
        ruleIds: ['R-008']
      },
      {
        id: 'tag_buyer_enterprise_purchase',
        code: 'BUYER_ENTERPRISE_PURCHASE',
        name: '买家-企业购',
        department: 'buyer',
        categoryId: 'cat_enterprise',
        description: '买家报企业购订单成交。',
        owner: '企业业务运营',
        status: 'enabled',
        version: 'v1.2',
        updatedAt: '11-18 09:45',
        ruleIds: ['R-009']
      },
      {
        id: 'tag_buyer_enterprise_account',
        code: 'BUYER_ENTERPRISE_ACCOUNT',
        name: '买家-企业版',
        department: 'buyer',
        categoryId: 'cat_enterprise',
        description: '买家类型为企业版的订单。原业务备注为“已废弃？”，当前仍保留但未绑定生效规则。',
        owner: '企业业务运营',
        status: 'draft',
        version: 'v0.9',
        updatedAt: '11-16 15:12',
        ruleIds: []
      },
      {
        id: 'tag_buyer_value',
        code: 'BUYER_VALUE',
        name: '买家-保值换新',
        department: 'buyer',
        categoryId: 'cat_value',
        description: '买家报保值订单中标成交订单。',
        owner: '买家运营',
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-17 14:30',
        ruleIds: ['R-010']
      },
      {
        id: 'tag_buyer_ai',
        code: 'BUYER_AI_QUOTE',
        name: '买家-AI报价',
        department: 'buyer',
        categoryId: 'cat_robot',
        description: '买家使用包销机器人中标成交订单。',
        owner: '买家运营',
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-17 14:30',
        ruleIds: ['R-011']
      },
      {
        id: 'tag_buyer_to_self',
        code: 'BUYER_TO_SELF',
        name: '买家-转自营',
        department: 'buyer',
        categoryId: 'cat_service',
        description: '买家成交后未发起售后，物权转闪回。',
        owner: '买家运营',
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-18 13:20',
        ruleIds: ['R-012']
      },
      {
        id: 'tag_eco_return',
        code: 'ECO_AFTERSALE_RETURN',
        name: '生态-售后退货',
        department: 'eco',
        categoryId: 'cat_service',
        description: '买家发起售后且物权实际生效。',
        owner: '生态业务运营',
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-18 13:20',
        ruleIds: ['R-013']
      },
      {
        id: 'tag_shared_robot',
        code: 'SHARED_ROBOT_SPECIAL',
        name: '共管-机器人专项',
        department: 'shared',
        categoryId: 'cat_robot',
        description: '自营与生态共用规则演示标签，发布前需要双方共同确认。',
        owner: '标签平台',
        status: 'pending',
        version: 'v0.1',
        updatedAt: '11-19 11:08',
        ruleIds: []
      }
    ],
    rules: [
      {
        id: 'R-001',
        name: '自营多机器人成交',
        department: 'self',
        targetLabelId: 'tag_multi_robot',
        priority: 300,
        status: 'enabled',
        version: 'v1.2',
        updatedAt: '11-19 10:12',
        conditions: [{ field: 'dealMethod', value: 'robot' }, { field: 'robotSource', value: 'self_multi' }]
      },
      {
        id: 'R-002',
        name: '生态无人报价',
        department: 'eco',
        targetLabelId: 'tag_eco_no_quote',
        priority: 280,
        status: 'enabled',
        version: 'v1.1',
        updatedAt: '11-18 16:30',
        conditions: [{ field: 'dealMethod', value: 'robot' }, { field: 'robotSource', value: 'eco_no_quote' }]
      },
      {
        id: 'R-003',
        name: '生态平台兜底报价',
        department: 'eco',
        targetLabelId: 'tag_eco_platform',
        priority: 270,
        status: 'enabled',
        version: 'v1.1',
        updatedAt: '11-18 16:30',
        conditions: [{ field: 'dealMethod', value: 'robot' }, { field: 'robotSource', value: 'eco_platform' }]
      },
      {
        id: 'R-004',
        name: '闪回保值换新',
        department: 'self',
        targetLabelId: 'tag_flash_value',
        priority: 260,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-17 11:26',
        conditions: [{ field: 'businessType', value: 'value_trade' }]
      },
      {
        id: 'R-005',
        name: '生态渠道成交',
        department: 'eco',
        targetLabelId: 'tag_eco_channel',
        priority: 250,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-17 11:26',
        conditions: [{ field: 'channel', value: 'eco_channel' }]
      },
      {
        id: 'R-006',
        name: '闪回指定售后渠道',
        department: 'self',
        targetLabelId: 'tag_flash_xiaomi',
        priority: 240,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-17 11:26',
        conditions: [{ field: 'channel', value: 'service_channel' }]
      },
      {
        id: 'R-007',
        name: '自营手机号群组',
        department: 'self',
        targetLabelId: 'tag_self_custom',
        priority: 220,
        status: 'enabled',
        version: 'v1.1',
        updatedAt: '11-19 10:18',
        conditions: [{ field: 'phoneGroup', value: 'self_bu' }]
      },
      {
        id: 'R-008',
        name: '生态手机号群组',
        department: 'eco',
        targetLabelId: 'tag_eco_custom',
        priority: 220,
        status: 'enabled',
        version: 'v1.1',
        updatedAt: '11-19 10:18',
        conditions: [{ field: 'phoneGroup', value: 'eco_bu' }]
      },
      {
        id: 'R-009',
        name: '买家企业购',
        department: 'buyer',
        targetLabelId: 'tag_buyer_enterprise_purchase',
        priority: 300,
        status: 'enabled',
        version: 'v1.2',
        updatedAt: '11-18 09:45',
        conditions: [{ field: 'businessType', value: 'enterprise_purchase' }]
      },
      {
        id: 'R-010',
        name: '买家保值换新',
        department: 'buyer',
        targetLabelId: 'tag_buyer_value',
        priority: 270,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-17 14:30',
        conditions: [{ field: 'businessType', value: 'value_trade' }]
      },
      {
        id: 'R-011',
        name: '买家包销机器人',
        department: 'buyer',
        targetLabelId: 'tag_buyer_ai',
        priority: 260,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-17 14:30',
        conditions: [{ field: 'dealMethod', value: 'robot' }, { field: 'robotSource', value: 'buyer_package' }]
      },
      {
        id: 'R-012',
        name: '买家未发起售后转自营',
        department: 'buyer',
        targetLabelId: 'tag_buyer_to_self',
        priority: 210,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-18 13:20',
        conditions: [{ field: 'ownershipEvent', value: 'none_after_sale' }]
      },
      {
        id: 'R-013',
        name: '买家售后转生态退货',
        department: 'eco',
        targetLabelId: 'tag_eco_return',
        priority: 220,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-18 13:20',
        conditions: [{ field: 'ownershipEvent', value: 'after_sale_effective' }]
      },
      {
        id: 'R-DRAFT-01',
        name: '生态平台兜底报价补充规则',
        department: 'eco',
        targetLabelId: 'tag_eco_platform',
        priority: 270,
        status: 'pending',
        version: 'v1.2',
        updatedAt: '11-19 11:06',
        conditions: [{ field: 'dealMethod', value: 'robot' }, { field: 'businessType', value: 'platform_fallback' }]
      }
    ],
    approvals: [
      {
        id: 'AP-001',
        type: 'rule',
        title: '生态平台兜底报价补充规则',
        subjectId: 'R-DRAFT-01',
        department: 'eco',
        submitter: '生态标签配置人',
        submittedAt: '11-19 11:06',
        status: 'pending',
        summary: '新增“平台兜底业务类型 + 机器人成交”条件，优先级 270。',
        impact: '预计影响生态新成交订单，不追溯历史订单。',
        conflicts: 0,
        requiredApprovals: ['生态审核人'],
        approvals: []
      },
      {
        id: 'AP-002',
        type: 'label',
        title: '共管-机器人专项',
        subjectId: 'tag_shared_robot',
        department: 'shared',
        submitter: '标签平台运营',
        submittedAt: '11-19 11:08',
        status: 'pending',
        summary: '新增两部门共用业务标签，编码 SHARED_ROBOT_SPECIAL。',
        impact: '发布后可由两个部门的已审核规则共同引用。',
        conflicts: 0,
        requiredApprovals: ['自营审核人', '生态审核人'],
        approvals: []
      },
      {
        id: 'AP-003',
        type: 'manual',
        title: 'TC202611180032 异常修复',
        subjectId: 'TC202611180032',
        department: 'self',
        submitter: '自营运营专员',
        submittedAt: '11-19 09:42',
        status: 'pending',
        summary: '将当前业务标签从“闪回-闪回成交”修复为“多个机器人”。',
        impact: '仅修改该订单当前标签；原始标签保持不变。',
        conflicts: 0,
        requiredApprovals: ['自营审核人'],
        approvals: []
      },
      {
        id: 'AP-004',
        type: 'rule',
        title: '买家企业版规则停用',
        subjectId: 'R-OLD-ENTERPRISE',
        department: 'buyer',
        submitter: '企业业务运营',
        submittedAt: '11-18 17:20',
        status: 'approved',
        summary: '停用“买家-企业版”旧规则，保留已生成标签。',
        impact: '仅影响后续订单，历史订单保持原快照。',
        conflicts: 0,
        requiredApprovals: ['生态审核人'],
        approvals: [{ role: '生态审核人', user: '李审核', at: '11-18 17:48' }]
      }
    ],
    traces: [
      {
        orderNo: 'TC202611190108',
        department: 'self',
        departmentName: '自营',
        originalLabel: '闪回-闪回成交',
        currentLabel: '多个机器人',
        matchedRule: 'R-001 · 自营多机器人成交',
        ruleVersion: 'v1.2',
        status: '成交确认',
        updatedAt: '11-19 10:36',
        facts: ['成交方式：机器人成交', '机器人来源：多个自营机器人', '渠道：非指定渠道'],
        entries: [
          { time: '10:35:42', title: '订单成交', description: '按自营部门写入原始业务标签。', before: '尚未生成', after: '闪回-闪回成交', source: '订单成交事件' },
          { time: '10:35:43', title: '初始化当前标签', description: '当前业务标签初始化为原始业务标签。', before: '尚未生成', after: '闪回-闪回成交', source: '标签初始化' },
          { time: '10:36:08', title: '规则命中并更新', description: 'R-001 优先级 300，高于无规则命中的兜底路径。', before: '闪回-闪回成交', after: '多个机器人', source: 'R-001 · v1.2' }
        ],
        unmatched: [
          { id: 'R-006', name: '闪回指定售后渠道', priority: 240, reason: '渠道不匹配' },
          { id: 'R-007', name: '自营手机号群组', priority: 220, reason: '手机号群组不匹配' }
        ]
      },
      {
        orderNo: 'TC202611190096',
        department: 'buyer',
        departmentName: '生态',
        originalLabel: '买家-买家成交',
        currentLabel: '买家-企业购',
        matchedRule: 'R-009 · 买家企业购',
        ruleVersion: 'v1.2',
        status: '成交确认',
        updatedAt: '11-19 10:18',
        facts: ['成交方式：人工成交', '业务类型：企业购', '买家类型：企业版'],
        entries: [
          { time: '10:17:51', title: '订单成交', description: '按生态部门写入原始业务标签。', before: '尚未生成', after: '买家-买家成交', source: '订单成交事件' },
          { time: '10:17:52', title: '初始化当前标签', description: '当前业务标签初始化为原始业务标签。', before: '尚未生成', after: '买家-买家成交', source: '标签初始化' },
          { time: '10:18:02', title: '规则命中并更新', description: '企业购规则优先级 300；企业版规则当前未生效。', before: '买家-买家成交', after: '买家-企业购', source: 'R-009 · v1.2' }
        ],
        unmatched: [
          { id: 'R-011', name: '买家包销机器人', priority: 260, reason: '成交方式不是机器人' }
        ]
      },
      {
        orderNo: 'TC202611180032',
        department: 'self',
        departmentName: '自营',
        originalLabel: '闪回-闪回成交',
        currentLabel: '闪回-闪回成交',
        matchedRule: '未命中',
        ruleVersion: '—',
        status: '待人工修复',
        updatedAt: '11-19 09:42',
        facts: ['成交方式：机器人成交', '机器人来源：多个自营机器人', '规则事件到达时标签服务超时'],
        entries: [
          { time: '11-18 18:22', title: '订单成交', description: '写入原始业务标签。', before: '尚未生成', after: '闪回-闪回成交', source: '订单成交事件' },
          { time: '11-18 18:22', title: '标签计算失败', description: '标签服务超时，订单成交不受影响。', before: '闪回-闪回成交', after: '闪回-闪回成交', source: '失败任务 RETRY-0084' },
          { time: '11-19 09:42', title: '提交异常修复', description: '运营提交审批，审批通过前不会修改当前标签。', before: '闪回-闪回成交', after: '闪回-闪回成交', source: 'AP-003' }
        ],
        unmatched: [
          { id: 'R-001', name: '自营多机器人成交', priority: 300, reason: '处理失败，待审批后重算' }
        ]
      },
      {
        orderNo: 'TC202611170067',
        department: 'buyer',
        departmentName: '生态',
        originalLabel: '买家-买家成交',
        currentLabel: '生态-售后退货',
        matchedRule: 'R-013 · 买家售后转生态退货',
        ruleVersion: 'v1.0',
        status: '售后物权生效',
        updatedAt: '11-19 08:56',
        facts: ['初始买家成交', '买家发起售后', '物权已实际转回生态'],
        entries: [
          { time: '11-17 15:02', title: '订单成交', description: '写入原始业务标签。', before: '尚未生成', after: '买家-买家成交', source: '订单成交事件' },
          { time: '11-17 15:02', title: '初始化当前标签', description: '当前标签与原始标签一致。', before: '尚未生成', after: '买家-买家成交', source: '标签初始化' },
          { time: '11-18 11:20', title: '售后申请', description: '申请阶段不修改当前标签。', before: '买家-买家成交', after: '买家-买家成交', source: '售后事件' },
          { time: '11-19 08:56', title: '物权生效', description: '售后物权生效事件触发重新计算。', before: '买家-买家成交', after: '生态-售后退货', source: 'R-013 · v1.0' }
        ],
        unmatched: []
      }
    ],
    lastSimulation: null
  };
})();
