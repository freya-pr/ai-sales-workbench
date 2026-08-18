'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const scripts = [
  {
    scenario: '📌 场景：新客户首次沟通',
    text: '您好！我是XX老师～感谢您的关注！了解到您对{课程方向}感兴趣，请问宝贝现在多大了呢？我根据孩子的年龄给您推荐最适合的学习方案😊',
  },
  {
    scenario: '📌 场景：客户犹豫价格',
    text: '理解您的考虑！其实教育投资最重要的是效果和适合度。跟您分享一组数据：我们的学员中，85%在课程结束后{核心能力}测试成绩提升了30%以上。而且现在有限时优惠，平均一节课不到{单价}元，性价比非常高～',
  },
  {
    scenario: '📌 场景：邀约体验营',
    text: '{孩子名}妈妈/爸爸，我们有一个{天数}天的免费体验营，在家就能带孩子做。很多家长反馈孩子参与后变化很大！最近一期明天就开始了，我帮您预约一个名额？',
  },
  {
    scenario: '📌 场景：老学员续费/升级',
    text: '{孩子名}最近的打卡表现太棒了！能看出来{孩子名}对这个方向非常有兴趣。根据目前的学习进度，我建议可以进入{进阶课程名}阶段了。作为老学员，我们有一个专属优惠价，您了解一下？',
  },
  {
    scenario: '📌 场景：超过48小时未回复',
    text: '{称呼}您好！最近忙了吧～上次聊到{孩子名}的{学习方向}，我这边整理了一些资料觉得特别适合您，发给您看看？不着急决定，先了解一下也好😊',
  },
];

const strategies = [
  {
    scenario: '🎯 高意向客户转化策略',
    steps: [
      '24小时内完成首次深度沟通，了解痛点',
      '发送课程大纲 + 2-3个学员案例',
      '邀约免费体验营（制造紧迫感）',
      '体验营期间每日跟进反馈',
      '体验结束当天推送正式课程+限时优惠',
      '48小时内未成交，发送学员效果数据做最后推动',
    ],
  },
  {
    scenario: '🎯 价格敏感客户策略',
    steps: [
      '先输出价值（免费评估/资料），建立信任',
      '用"每节课均价"替代总价概念',
      '分期付款方案降低心理门槛',
      '限时优惠+赠品组合提升感知价值',
      '发送其他价格敏感客户的成功案例',
    ],
  },
];

export function CopilotView() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
      {/* Script Library */}
      <div className="mb-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-gray-800">
          🤖 AI 话术库
        </h3>
        {scripts.map((s, i) => (
          <div
            key={i}
            className="mb-2.5 rounded-lg border-l-[3px] border-l-[#0891b2] bg-gray-50 p-3.5 last:mb-0"
          >
            <div className="mb-1.5 text-xs font-semibold text-[#0e7490]">
              {s.scenario}
            </div>
            <div className="whitespace-pre-line text-[13px] leading-relaxed text-gray-600">
              {s.text}
            </div>
            <button
              onClick={() => handleCopy(s.text, i)}
              className={cn(
                'mt-2 cursor-pointer rounded-md border-0 px-3 py-1 text-[11.5px] font-semibold transition-all',
                copiedIdx === i
                  ? 'bg-[#0891b2] text-white'
                  : 'bg-[#ecfeff] text-[#0e7490] hover:bg-[#0891b2] hover:text-white'
              )}
            >
              {copiedIdx === i ? '✅ 已复制' : '📋 复制话术'}
            </button>
          </div>
        ))}
      </div>

      {/* Strategies */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-gray-800">
          💡 AI 沟通策略
        </h3>
        {strategies.map((st, i) => (
          <div
            key={i}
            className="mb-2.5 rounded-lg border-l-[3px] border-l-[#0891b2] bg-gray-50 p-3.5 last:mb-0"
          >
            <div className="mb-2 text-xs font-semibold text-[#0e7490]">
              {st.scenario}
            </div>
            <div className="space-y-1.5 text-[13px] leading-relaxed text-gray-600">
              {st.steps.map((step, j) => (
                <div key={j} className="flex gap-2">
                  <strong className="shrink-0 text-gray-800">
                    Step {j + 1}:
                  </strong>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
