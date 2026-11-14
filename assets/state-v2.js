(() => {
  'use strict';

  window.RECYCLE_RULE_DEFAULT_STATE = {
    version: 3,
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
        description: '闪回或买家申报保值订单并成交的业务场景。',
        owner: '渠道运营',
        status: 'enabled',
        updatedAt: '11-13 16:20'
      },
      {
        id: 'bt_enterprise',
        name: '企业购',
        code: 'ENTERPRISE_PURCHASE',
        description: '买家以企业购身份中标或使用企业购业务标记成交。',
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
        id: 'rt_slot_self_robot',
        name: '',
        code: '',
        dimension: 'robot',
        segment: 'flashback',
        usage: 'deal',
        branch: '闪回成交 / 机器人成交 / 自营机器人',
        settlement: '',
        entity: '',
        legacyCode: '',
        allowTransfer: true,
        status: 'unconfigured',
        version: '—',
        updatedAt: '—'
      },
      {
        id: 'rt_eco_no_quote',
        name: '生态-无人报价',
        code: 'ECO_NO_QUOTE',
        dimension: 'robot',
        segment: 'flashback',
        usage: 'deal',
        branch: '闪回成交 / 机器人成交 / 生态-无人报价',
        settlement: '代付',
        entity: '生态结算主体',
        legacyCode: '—',
        allowTransfer: true,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-13 15:10'
      },
      {
        id: 'rt_eco_platform_fallback',
        name: '生态-平台兜底报价',
        code: 'ECO_PLATFORM_FALLBACK',
        dimension: 'robot',
        segment: 'flashback',
        usage: 'deal',
        branch: '闪回成交 / 机器人成交 / 生态-平台兜底报价',
        settlement: '代付',
        entity: '生态结算主体',
        legacyCode: '—',
        allowTransfer: true,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-13 15:12'
      },
      {
        id: 'rt_flashback_value',
        name: '闪回-保值换新',
        code: 'FLASHBACK_VALUE',
        dimension: 'business',
        segment: 'flashback',
        usage: 'deal',
        branch: '闪回成交 / 保值换新成交 / 审单报保值订单中标',
        settlement: '代付',
        entity: '闪回结算主体',
        legacyCode: '—',
        allowTransfer: true,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-13 15:20'
      },
      {
        id: 'rt_eco_channel',
        name: '生态-生态渠道',
        code: 'ECO_CHANNEL',
        dimension: 'channel',
        segment: 'flashback',
        usage: 'deal',
        branch: '闪回成交 / 闲鱼兜底成交 / 指定渠道',
        settlement: '购销',
        entity: '生态结算主体',
        legacyCode: '—',
        allowTransfer: true,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-13 15:30'
      },
      {
        id: 'rt_flashback_xiaomi_service',
        name: '闪回-小米售后',
        code: 'FLASHBACK_XIAOMI_SERVICE',
        dimension: 'channel',
        segment: 'flashback',
        usage: 'deal',
        branch: '闪回成交 / 指定渠道成交',
        settlement: '代付',
        entity: '闪回结算主体',
        legacyCode: '—',
        allowTransfer: true,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-13 15:36'
      },
      {
        id: 'rt_flashback_deal',
        name: '闪回-闪回成交',
        code: 'FLASHBACK_DEAL',
        dimension: 'winner',
        segment: 'flashback',
        usage: 'deal',
        branch: '闪回成交 / 人工成交 / 审单人工成交',
        settlement: '购销',
        entity: '闪回结算主体',
        legacyCode: '—',
        allowTransfer: true,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-13 15:42'
      },
      {
        id: 'rt_slot_phone_self_bu',
        name: '',
        code: '',
        dimension: 'phone',
        segment: 'flashback',
        usage: 'deal',
        branch: '闪回成交 / 人工成交 / 指定手机号 / 自营BU',
        settlement: '',
        entity: '',
        legacyCode: '',
        allowTransfer: true,
        status: 'unconfigured',
        version: '—',
        updatedAt: '—'
      },
      {
        id: 'rt_slot_phone_eco_bu',
        name: '',
        code: '',
        dimension: 'phone',
        segment: 'flashback',
        usage: 'deal',
        branch: '闪回成交 / 人工成交 / 指定手机号 / 生态BU',
        settlement: '',
        entity: '',
        legacyCode: '',
        allowTransfer: true,
        status: 'unconfigured',
        version: '—',
        updatedAt: '—'
      },
      {
        id: 'rt_buyer_enterprise_purchase',
        name: '买家-企业购',
        code: 'BUYER_ENTERPRISE_PURCHASE',
        dimension: 'business',
        segment: 'buyer',
        usage: 'deal',
        branch: '买家成交 / 人工成交 / 企业购中标',
        settlement: '购销',
        entity: '企业买家结算主体',
        legacyCode: '—',
        allowTransfer: true,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-13 16:06'
      },
      {
        id: 'rt_buyer_enterprise_account',
        name: '买家-企业版',
        code: 'BUYER_ENTERPRISE_ACCOUNT',
        dimension: 'winner',
        segment: 'buyer',
        usage: 'deal',
        branch: '买家成交 / 人工成交 / 买家类型=企业版',
        settlement: '购销',
        entity: '企业买家结算主体',
        legacyCode: '—',
        allowTransfer: true,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-13 16:10'
      },
      {
        id: 'rt_buyer_normal',
        name: '买家-买家成交',
        code: 'BUYER_NORMAL_DEAL',
        dimension: 'winner',
        segment: 'buyer',
        usage: 'deal',
        branch: '买家成交 / 人工成交 / 普通买家中标',
        settlement: '购销',
        entity: '个人买家结算主体',
        legacyCode: '—',
        allowTransfer: true,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-13 16:14'
      },
      {
        id: 'rt_buyer_ai_quote',
        name: '买家-AI报价',
        code: 'BUYER_AI_QUOTE',
        dimension: 'robot',
        segment: 'buyer',
        usage: 'deal',
        branch: '买家成交 / 机器人成交 / 买家包销机器人报价中标',
        settlement: '代付',
        entity: '买家结算主体',
        legacyCode: '—',
        allowTransfer: true,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-13 16:18'
      },
      {
        id: 'rt_buyer_to_self',
        name: '买家-转自营',
        code: 'BUYER_TO_SELF',
        dimension: 'winner',
        segment: 'buyer',
        usage: 'transfer',
        branch: '买家成交 / 物权变更 / 未发起售后，转闪回成交',
        settlement: '购销',
        entity: '自营结算主体',
        legacyCode: '—',
        allowTransfer: false,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-14 09:20'
      },
      {
        id: 'rt_eco_aftersale_return',
        name: '生态-售后退货',
        code: 'ECO_AFTERSALE_RETURN',
        dimension: 'business',
        segment: 'buyer',
        usage: 'transfer',
        branch: '买家成交 / 物权变更 / 发起售后，转闪回成交',
        settlement: '购销',
        entity: '生态结算主体',
        legacyCode: '—',
        allowTransfer: false,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-14 09:36'
      },
      {
        id: 'rt_buyer_value',
        name: '买家-保值换新',
        code: 'BUYER_VALUE',
        dimension: 'business',
        segment: 'buyer',
        usage: 'deal',
        branch: '买家成交 / 保值换新成交 / 买家报保值订单中标',
        settlement: '代付',
        entity: '买家结算主体',
        legacyCode: '—',
        allowTransfer: true,
        status: 'enabled',
        version: 'v1.0',
        updatedAt: '11-13 16:22'
      }
    ],
    rules: [
      {
        id: 'R-DEAL-001',
        name: '买家企业购中标归类',
        stage: 'deal',
        priority: 300,
        targetTypeId: 'rt_buyer_enterprise_purchase',
        status: 'enabled',
        conditions: [
          { dimension: 'deal_side', value: 'buyer' },
          { dimension: 'deal_method', value: 'manual' },
          { dimension: 'business_type', value: 'bt_enterprise' }
        ],
        tags: ['企业购', '买家成交'],
        stopOnMatch: true,
        version: 'v2.0',
        updatedAt: '11-13 16:06'
      },
      {
        id: 'R-DEAL-002',
        name: '买家类型企业版归类',
        stage: 'deal',
        priority: 290,
        targetTypeId: 'rt_buyer_enterprise_account',
        status: 'enabled',
        conditions: [
          { dimension: 'deal_side', value: 'buyer' },
          { dimension: 'deal_method', value: 'manual' },
          { dimension: 'buyer_type', value: 'enterprise' }
        ],
        tags: ['企业版买家', '买家成交'],
        stopOnMatch: true,
        version: 'v2.0',
        updatedAt: '11-13 16:10'
      },
      {
        id: 'R-DEAL-003',
        name: '普通买家中标归类',
        stage: 'deal',
        priority: 280,
        targetTypeId: 'rt_buyer_normal',
        status: 'enabled',
        conditions: [
          { dimension: 'deal_side', value: 'buyer' },
          { dimension: 'deal_method', value: 'manual' },
          { dimension: 'buyer_type', value: 'normal' }
        ],
        tags: ['普通买家', '买家成交'],
        stopOnMatch: true,
        version: 'v2.0',
        updatedAt: '11-13 16:14'
      },
      {
        id: 'R-DEAL-004',
        name: '买家报保值订单中标',
        stage: 'deal',
        priority: 270,
        targetTypeId: 'rt_buyer_value',
        status: 'enabled',
        conditions: [
          { dimension: 'deal_side', value: 'buyer' },
          { dimension: 'deal_method', value: 'value_trade' },
          { dimension: 'business_type', value: 'bt_value' }
        ],
        tags: ['买家成交', '保值换新'],
        stopOnMatch: true,
        version: 'v2.0',
        updatedAt: '11-13 16:22'
      },
      {
        id: 'R-DEAL-005',
        name: '买家包销机器人报价中标',
        stage: 'deal',
        priority: 260,
        targetTypeId: 'rt_buyer_ai_quote',
        status: 'enabled',
        conditions: [
          { dimension: 'deal_side', value: 'buyer' },
          { dimension: 'deal_method', value: 'robot' },
          { dimension: 'robot_source', value: 'buyer_package' },
          { dimension: 'robot', value: 'buyer_package' }
        ],
        tags: ['AI报价', '买家成交'],
        stopOnMatch: true,
        version: 'v2.0',
        updatedAt: '11-13 16:18'
      },
      {
        id: 'R-DEAL-006',
        name: '闪回审单报保值订单中标',
        stage: 'deal',
        priority: 250,
        targetTypeId: 'rt_flashback_value',
        status: 'enabled',
        conditions: [
          { dimension: 'deal_side', value: 'flashback' },
          { dimension: 'deal_method', value: 'value_trade' },
          { dimension: 'business_type', value: 'bt_value' }
        ],
        tags: ['闪回成交', '保值换新'],
        stopOnMatch: true,
        version: 'v2.0',
        updatedAt: '11-13 15:20'
      },
      {
        id: 'R-DEAL-007',
        name: '闪回小米售后指定渠道成交',
        stage: 'deal',
        priority: 240,
        targetTypeId: 'rt_flashback_xiaomi_service',
        status: 'enabled',
        conditions: [
          { dimension: 'deal_side', value: 'flashback' },
          { dimension: 'channel', value: 'ch_xiaomi_service' }
        ],
        tags: ['闪回成交', '小米售后渠道'],
        stopOnMatch: true,
        version: 'v2.0',
        updatedAt: '11-13 15:36'
      },
      {
        id: 'R-DEAL-008',
        name: '闲鱼兜底指定生态渠道成交',
        stage: 'deal',
        priority: 230,
        targetTypeId: 'rt_eco_channel',
        status: 'enabled',
        conditions: [
          { dimension: 'deal_side', value: 'flashback' },
          { dimension: 'deal_method', value: 'xianyu_fallback' },
          { dimension: 'channel', value: 'ch_eco' }
        ],
        tags: ['闲鱼兜底', '生态渠道'],
        stopOnMatch: true,
        version: 'v2.0',
        updatedAt: '11-13 15:30'
      },
      {
        id: 'R-DEAL-009',
        name: '生态无人报价成交',
        stage: 'deal',
        priority: 220,
        targetTypeId: 'rt_eco_no_quote',
        status: 'enabled',
        conditions: [
          { dimension: 'deal_side', value: 'flashback' },
          { dimension: 'deal_method', value: 'robot' },
          { dimension: 'robot_source', value: 'eco_no_quote' },
          { dimension: 'robot', value: 'eco_no_quote' }
        ],
        tags: ['机器人成交', '生态无人报价'],
        stopOnMatch: true,
        version: 'v2.0',
        updatedAt: '11-13 15:10'
      },
      {
        id: 'R-DEAL-010',
        name: '生态平台兜底报价成交',
        stage: 'deal',
        priority: 210,
        targetTypeId: 'rt_eco_platform_fallback',
        status: 'enabled',
        conditions: [
          { dimension: 'deal_side', value: 'flashback' },
          { dimension: 'deal_method', value: 'robot' },
          { dimension: 'robot_source', value: 'eco_platform' },
          { dimension: 'robot', value: 'eco_platform' }
        ],
        tags: ['机器人成交', '生态平台兜底'],
        stopOnMatch: true,
        version: 'v2.0',
        updatedAt: '11-13 15:12'
      },
      {
        id: 'R-DEAL-011',
        name: '闪回审单人工成交',
        stage: 'deal',
        priority: 200,
        targetTypeId: 'rt_flashback_deal',
        status: 'enabled',
        conditions: [
          { dimension: 'deal_side', value: 'flashback' },
          { dimension: 'deal_method', value: 'manual' },
          { dimension: 'phone', value: 'phone_miss' }
        ],
        tags: ['闪回成交', '人工成交'],
        stopOnMatch: true,
        version: 'v2.0',
        updatedAt: '11-13 15:42'
      },
      {
        id: 'R-OWN-001',
        name: '买家未发起售后物权转自营',
        stage: 'transfer',
        priority: 200,
        targetTypeId: 'rt_buyer_to_self',
        status: 'enabled',
        conditions: [
          { dimension: 'current_side', value: 'buyer' },
          { dimension: 'transfer_scene', value: 'pre_sale' }
        ],
        tags: ['买家成交', '未起售', '转自营'],
        stopOnMatch: true,
        version: 'v2.0',
        updatedAt: '11-14 09:20'
      },
      {
        id: 'R-OWN-002',
        name: '买家发起售后物权转生态退货',
        stage: 'transfer',
        priority: 210,
        targetTypeId: 'rt_eco_aftersale_return',
        status: 'enabled',
        conditions: [
          { dimension: 'current_side', value: 'buyer' },
          { dimension: 'transfer_scene', value: 'after_sale' },
          { dimension: 'after_sale_status', value: 'effective' }
        ],
        tags: ['买家成交', '售后转移', '生态退货'],
        stopOnMatch: true,
        version: 'v2.0',
        updatedAt: '11-14 09:36'
      }
    ],
    transferEvents: [
      {
        id: 'EVT-20261114-018',
        orderNo: 'TC202611140083',
        scene: 'pre_sale',
        fromTypeId: 'rt_buyer_value',
        toTypeId: 'rt_buyer_to_self',
        ruleId: 'R-OWN-001',
        status: 'pending',
        createdAt: '11-14 10:42',
        effectiveAt: '',
        ownerBefore: '买家',
        ownerAfter: '自营主体',
        direction: 'to_platform'
      },
      {
        id: 'EVT-20261114-017',
        orderNo: 'TC202611140071',
        scene: 'after_sale',
        fromTypeId: 'rt_buyer_enterprise_purchase',
        toTypeId: 'rt_eco_aftersale_return',
        ruleId: 'R-OWN-002',
        status: 'applied',
        createdAt: '11-14 09:36',
        effectiveAt: '11-14 10:08',
        ownerBefore: '买家',
        ownerAfter: '生态主体',
        direction: 'to_platform'
      }
    ],
    traces: {
      TC202611140083: {
        orderNo: 'TC202611140083',
        businessTypeId: 'bt_value',
        channelId: 'retail',
        status: '待发货',
        currentTypeId: 'rt_buyer_value',
        tags: ['买家成交', '买家-保值换新', '物权待生效'],
        updatedAt: '11-14 10:42',
        entries: [
          {
            id: 'T83-1',
            time: '11-14 10:18',
            event: '订单建立',
            title: '沿用原系统类型',
            typeName: '原系统带入值',
            source: '原系统',
            description: '下单阶段不执行新分类规则，订单初始类型保持不变。',
            status: 'done',
            snapshot: ['initial-type: 原系统带入值']
          },
          {
            id: 'T83-2',
            time: '11-14 10:42',
            event: '成交确认',
            title: '买家报保值订单中标',
            typeName: '买家-保值换新',
            source: '规则引擎',
            description: '成交归属=买家、成交方式=保值换新成交，命中买家保值规则并固化成交快照。',
            status: 'done',
            matched: [{ name: 'R-DEAL-004', priority: 270, status: 'applied' }],
            snapshot: ['规则快照 v2.0', '业务类型参数 v1.1']
          },
          {
            id: 'T83-3',
            time: '待生效',
            event: '物权变更',
            title: '成交后、未起售 · 待物权生效',
            typeName: '买家-转自营',
            source: 'EVT-20261114-018',
            description: '事件已受理但尚未确认实际物权转移，因此不提前修改回收类型。',
            status: 'pending',
            transferEventId: 'EVT-20261114-018',
            matched: [{ name: 'R-OWN-001', priority: 200, status: 'applied' }],
            snapshot: ['物权事件 EVT-20261114-018', '规则快照 v2.0']
          }
        ]
      },
      TC202611140071: {
        orderNo: 'TC202611140071',
        businessTypeId: 'bt_enterprise',
        channelId: 'enterprise',
        status: '售后回收完成',
        currentTypeId: 'rt_eco_aftersale_return',
        tags: ['企业购', '买家成交', '生态-售后退货'],
        updatedAt: '11-14 10:08',
        entries: [
          {
            id: 'T71-1',
            time: '11-13 17:22',
            event: '订单建立',
            title: '沿用原系统类型',
            typeName: '原系统带入值',
            source: '原系统',
            description: '订单初始类型由原系统带入，下单阶段不执行新规则。',
            status: 'done',
            snapshot: ['initial-type: 原系统带入值']
          },
          {
            id: 'T71-2',
            time: '11-13 18:02',
            event: '成交确认',
            title: '企业购中标',
            typeName: '买家-企业购',
            source: '规则引擎',
            description: '企业购业务标记优先级高于企业版买家类型，成交时输出买家-企业购。',
            status: 'done',
            matched: [
              { name: 'R-DEAL-001', priority: 300, status: 'applied' },
              { name: 'R-DEAL-002', priority: 290, status: 'masked' }
            ],
            snapshot: ['规则快照 v2.0', '业务类型参数 v1.1']
          },
          {
            id: 'T71-3',
            time: '11-14 09:36',
            event: '买家发起售后',
            title: '售后申请受理，不改类型',
            typeName: '买家-企业购',
            source: '售后单 AS202611140021',
            description: '仅记录售后申请，等待审核与物权实际转移。',
            status: 'done',
            snapshot: ['售后状态：审核中', '物权状态：未转移']
          },
          {
            id: 'T71-4',
            time: '11-14 10:08',
            event: '物权转移生效',
            title: '售后物权转移生效',
            typeName: '生态-售后退货',
            source: 'EVT-20261114-017',
            description: '买家发起售后且物权实际生效后，追加生态-售后退货类型版本并保留成交标签。',
            status: 'done',
            matched: [{ name: 'R-OWN-002', priority: 210, status: 'applied' }],
            snapshot: ['物权事件 EVT-20261114-017', '规则快照 v2.0']
          }
        ]
      },
      TC202611140052: {
        orderNo: 'TC202611140052',
        businessTypeId: 'bt_standard',
        channelId: 'ch_xiaomi_service',
        status: '已成交待发货',
        currentTypeId: 'rt_flashback_xiaomi_service',
        tags: ['闪回成交', '闪回-小米售后'],
        updatedAt: '11-14 09:54',
        entries: [
          {
            id: 'T52-1',
            time: '11-14 08:46',
            event: '订单建立',
            title: '沿用原系统类型',
            typeName: '原系统带入值',
            source: '原系统',
            description: '下单阶段不执行分类，类型由原系统带入。',
            status: 'done',
            snapshot: ['initial-type: 原系统带入值']
          },
          {
            id: 'T52-2',
            time: '11-14 09:54',
            event: '成交确认',
            title: '指定渠道成交',
            typeName: '闪回-小米售后',
            source: '规则引擎',
            description: '闪回成交且命中指定渠道，成交时立即归类；该类型不依赖售后物权转移。',
            status: 'done',
            matched: [{ name: 'R-DEAL-007', priority: 240, status: 'applied' }],
            snapshot: ['规则快照 v2.0', '渠道参数 v1.1']
          }
        ]
      }
    },
    simulator: {
      businessTypeId: 'bt_value',
      currentTypeId: 'rt_buyer_normal',
      phoneHit: 'miss',
      channelId: 'none',
      dealSide: 'buyer',
      dealMethod: 'value_trade',
      robotSource: 'buyer_package',
      buyerGroup: 'self_bu',
      buyerType: 'normal',
      winnerType: 'buyer',
      robotId: 'buyer_package',
      eventType: 'pre_sale'
    },
    lastSim: null
  };
})();
