'use client';

const insights = [
  {
    title: '🧠 AI 客户洞察',
    items: [
      {
        bullet: true,
        content:
          '<strong>张雨萱妈妈</strong> 正处于高意向窗口期，建议24小时内完成体验营邀约。关键词匹配：专注力 + 4岁 + 高预算，转化率预估 <strong>72%</strong>。',
        tag: { text: '紧急', class: 'urgent' },
      },
      {
        bullet: true,
        content:
          '<strong>李明轩爸爸</strong> 价格犹豫中，建议推送学员效果数据+限时优惠。家长决策周期通常3-5天，当前处于Day2，仍有较充裕跟进时间。',
        tag: { text: '紧急', class: 'urgent' },
      },
      {
        bullet: true,
        content:
          '<strong>王诗涵妈妈</strong> 老学员续费意向明确，建议立即推送进阶课详情+老学员专属优惠，预估客单价 <strong>¥5,980</strong>。',
        tag: { text: '今日', class: 'normal' },
      },
      {
        bullet: true,
        content:
          '<strong>陈浩宇爸爸</strong> 回复较为冷淡，建议先发送免费评估工具做价值输出，再引导妈妈入群。需要拉入决策人后再深度沟通。',
        tag: { text: '跟进', class: 'normal' },
      },
    ],
  },
  {
    title: '📊 话术效果分析',
    items: [
      {
        bullet: true,
        content:
          '本周"<strong>黄金窗口期</strong>"话术回复率比平均高出 <strong>34%</strong>，建议在3-6岁家长群体中广泛使用。',
      },
      {
        bullet: true,
        content:
          '"<strong>限时优惠+剩余名额</strong>"组合话术在价格敏感客户中的转化率提升 <strong>28%</strong>。',
      },
      {
        bullet: true,
        content:
          '发送"<strong>学员案例/效果数据</strong>"后，客户平均回复时间缩短 <strong>40%</strong>。建议作为标准跟进动作。',
      },
      {
        bullet: true,
        content:
          '在晚上 <strong>20:00-21:30</strong> 发送消息的回复率最高（68%），建议集中在此时段跟进高意向客户。',
      },
    ],
  },
  {
    title: '🎯 今日重点关注',
    items: [
      {
        bullet: true,
        content:
          '有 <strong>3位</strong> 客户超过48小时未回复，建议发送关怀消息激活。AI已自动生成跟进话术，可在AI副驾中查看。',
      },
      {
        bullet: true,
        content:
          '本周新留资客户 <strong>15位</strong>，其中S级意向 <strong>4位</strong>，建议优先跟进。',
      },
      {
        bullet: true,
        content:
          '老学员续费率本月达到 <strong>82%</strong>，较上月提升 <strong>6%</strong>。王诗涵等5位学员有升级意向。',
      },
    ],
  },
];

export function InsightsView() {
  return (
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
      {insights.map((section) => (
        <div
          key={section.title}
          className="mb-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <h3 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-gray-800">
            {section.title}
          </h3>
          <ul>
            {section.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 border-b border-gray-100 py-2.5 text-[13.5px] leading-relaxed text-gray-600 last:border-b-0"
              >
                {item.bullet && (
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#0891b2]" />
                )}
                <span
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
                {'tag' in item && item.tag && (
                  <span
                    className={
                      item.tag.class === 'urgent'
                        ? 'shrink-0 rounded-lg bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-500'
                        : 'shrink-0 rounded-lg bg-yellow-100 px-1.5 py-0.5 text-[10px] font-bold text-yellow-700'
                    }
                  >
                    {item.tag.text}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
