'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Customer } from '@/lib/mock-data';

interface ChatPanelProps {
  customer: Customer;
  isAiMode: boolean;
}

export function ChatPanel({ customer, isAiMode }: ChatPanelProps) {
  const [messages, setMessages] = useState(customer.messages);
  const [suggestions, setSuggestions] = useState(customer.aiSuggestions);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset when customer changes
  useEffect(() => {
    setMessages(customer.messages);
    setSuggestions(customer.aiSuggestions);
    setInput('');
  }, [customer.id, customer.messages, customer.aiSuggestions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    setMessages((prev) => [...prev, { from: 'sales', text, time }]);
    setInput('');
  };

  const handleSendSuggestion = (idx: number) => {
    const s = suggestions[idx];
    if (!s) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    setMessages((prev) => [...prev, { from: 'sales', text: s.text, time }]);
  };

  const handleChange = (idx: number) => {
    const alternatives = [
      '您好！根据我对您需求的了解，为您推荐以下学习方案，我给您详细介绍一下...',
      '感谢您的关注！我这边有一个特别适合您孩子的学习计划，方便的话我给您发一份资料？',
      '收到！针对您提到的情况，我给您几个建议供参考，可以先从体验营开始尝试...',
    ];
    setSuggestions((prev) =>
      prev.map((s, i) =>
        i === idx
          ? {
              ...s,
              text: alternatives[Math.floor(Math.random() * alternatives.length)],
              confidence: Math.floor(Math.random() * 15) + 75,
            }
          : s
      )
    );
  };

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full text-[15px] font-semibold text-white"
            style={{ background: customer.color }}
          >
            {customer.avatar}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-gray-800">
              {customer.name}
            </h3>
            <span className="text-[11.5px] text-gray-400">
              {customer.online ? '🟢 在线' : '⚪ 离线'} · 最后活跃:{' '}
              {customer.lastActive} · {customer.source}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-[12.5px] text-gray-600 transition-all hover:border-cyan-400 hover:bg-[#ecfeff] hover:text-[#0891b2]">
            📞 电话
          </button>
          <button className="flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-[12.5px] text-gray-600 transition-all hover:border-cyan-400 hover:bg-[#ecfeff] hover:text-[#0891b2]">
            📋 跟进记录
          </button>
          <button
            className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#0891b2] bg-[#0891b2] px-3.5 py-1.5 text-[12.5px] text-white transition-all hover:bg-[#0e7490]"
          >
            ✨ AI 分析
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar">
        {messages.map((msg, i) => {
          if (msg.type === 'date') {
            return (
              <div key={i} className="relative my-4 text-center">
                <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-200" />
                <span className="relative z-10 bg-gray-50 px-3 text-[11.5px] text-gray-400">
                  {msg.text}
                </span>
              </div>
            );
          }
          const isCustomer = msg.from === 'customer';
          return (
            <div
              key={i}
              className={cn(
                'mb-2.5 flex items-start gap-2.5',
                isCustomer ? 'justify-start' : 'justify-end'
              )}
            >
              {isCustomer && (
                <div
                  className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                  style={{ background: customer.color }}
                >
                  {customer.avatar}
                </div>
              )}
              <div>
                <div
                  className={cn(
                    'max-w-full whitespace-pre-line px-3.5 py-2.5 text-[13.5px] leading-relaxed',
                    isCustomer
                      ? 'rounded-xl rounded-tl-sm border border-gray-200 bg-white text-gray-800'
                      : 'rounded-xl rounded-tr-sm text-white',
                    !isCustomer && 'message-bubble-sales'
                  )}
                  style={
                    !isCustomer
                      ? {
                          background:
                            'linear-gradient(135deg, #0891b2, #06b6d4)',
                        }
                      : undefined
                  }
                >
                  {msg.text}
                </div>
                <div
                  className={cn(
                    'mt-1 text-[10.5px] text-gray-400',
                    isCustomer ? 'text-left' : 'text-right'
                  )}
                >
                  {msg.time}
                </div>
              </div>
              {!isCustomer && (
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#0891b2] text-[13px] font-semibold text-white">
                  我
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestions */}
      {isAiMode && (
        <div className="shrink-0 overflow-hidden border-t border-gray-200 bg-white">
          <div
            className="flex items-center justify-between border-b border-gray-100 px-5 py-2.5"
            style={{
              background: 'linear-gradient(90deg, #ecfeff, #f0fdfa)',
            }}
          >
            <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0e7490]">
              <span className="text-[15px]">✨</span> AI 智能回复建议
            </div>
            <span className="text-[11px] text-gray-400">基于客户画像生成</span>
          </div>
          <div className="px-5 py-3">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="mb-2 rounded-lg border border-cyan-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-3.5 last:mb-0 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <p className="mb-2.5 whitespace-pre-line text-[13.5px] leading-relaxed text-gray-700">
                  {s.text}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'flex items-center gap-1 rounded-xl px-2.5 py-[3px] text-[11.5px] font-semibold',
                      s.level === 'high'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-yellow-100 text-yellow-700'
                    )}
                  >
                    🎯 置信度 {s.confidence}%
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleChange(i)}
                      className="cursor-pointer rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-all hover:bg-gray-200"
                    >
                      🔄 换一个
                    </button>
                    <button
                      onClick={() => handleSendSuggestion(i)}
                      className="cursor-pointer rounded-md bg-[#0891b2] px-3 py-1 text-xs font-medium text-white transition-all hover:bg-[#0e7490]"
                    >
                      📤 一键发送
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex shrink-0 items-end gap-2.5 border-t border-gray-200 bg-white px-5 py-3">
        <div className="flex gap-1.5 pb-1.5">
          <button
            title="图片"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-0 bg-gray-100 text-[15px] text-gray-500 transition-all hover:bg-[#ecfeff] hover:text-[#0891b2]"
          >
            🖼
          </button>
          <button
            title="文件"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-0 bg-gray-100 text-[15px] text-gray-500 transition-all hover:bg-[#ecfeff] hover:text-[#0891b2]"
          >
            📎
          </button>
          <button
            title="快捷回复"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-0 bg-gray-100 text-[15px] text-gray-500 transition-all hover:bg-[#ecfeff] hover:text-[#0891b2]"
          >
            ⚡
          </button>
        </div>
        <div className="relative flex-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入消息... (Enter 发送)"
            rows={1}
            className="h-10 w-full resize-none rounded-lg border-[1.5px] border-gray-200 px-3 py-2 text-[13.5px] leading-snug outline-none transition-all focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)]"
          />
        </div>
        <button
          onClick={handleSend}
          className="h-10 cursor-pointer whitespace-nowrap rounded-lg bg-[#0891b2] px-5 text-[13.5px] font-semibold text-white transition-all hover:bg-[#0e7490]"
        >
          发送
        </button>
      </div>
    </section>
  );
}
