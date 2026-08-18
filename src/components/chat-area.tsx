'use client';

import { useState } from 'react';
import {
  Send,
  RefreshCw,
  Sparkles,
  Bot,
  Image,
  Paperclip,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Customer, Message, AISuggestion } from '@/lib/mock-data';

interface ChatAreaProps {
  customer: Customer;
  messages: Message[];
  suggestions: AISuggestion[];
}

export function ChatArea({ customer, messages, suggestions }: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setInputText('');
  };

  const handleSendSuggestion = (content: string) => {
    setInputText(content);
  };

  const handleNextSuggestion = () => {
    setActiveSuggestion((prev) => (prev + 1) % suggestions.length);
  };

  const senderStyles: Record<string, { bg: string; align: string; textColor: string }> = {
    customer: {
      bg: 'bg-white border border-slate-200',
      align: 'justify-start',
      textColor: 'text-slate-800',
    },
    sales: {
      bg: 'bg-[#0891b2]',
      align: 'justify-end',
      textColor: 'text-white',
    },
    ai: {
      bg: 'bg-[#8b5cf6]/10 border border-[#8b5cf6]/20',
      align: 'justify-start',
      textColor: 'text-slate-700',
    },
  };

  const senderLabels: Record<string, { name: string; color: string }> = {
    customer: { name: customer.name, color: 'text-slate-500' },
    sales: { name: '我（杨明）', color: 'text-[#0891b2]' },
    ai: { name: 'AI 助手', color: 'text-[#8b5cf6]' },
  };

  return (
    <div className="flex flex-1 flex-col bg-slate-50/50">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0891b2] text-xs font-medium text-white">
            {customer.avatar}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {customer.name}
            </h3>
            <p className="text-xs text-slate-500">
              {customer.source} | {customer.phone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
            对话时长: 2天
          </span>
          <span
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium',
              customer.aiReception
                ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]'
                : 'bg-[#0891b2]/10 text-[#0891b2]'
            )}
          >
            {customer.aiReception ? 'AI 接待中' : '人工接待中'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => {
            const style = senderStyles[message.sender];
            const label = senderLabels[message.sender];
            return (
              <div
                key={message.id}
                className={cn('flex flex-col gap-1 animate-fade-in', style.align)}
              >
                <div className={cn('flex items-center gap-2 text-xs', style.align)}>
                  {message.sender === 'ai' && (
                    <Bot className="h-3 w-3 text-[#8b5cf6]" />
                  )}
                  <span className={cn('font-medium', label.color)}>
                    {label.name}
                  </span>
                  <span className="text-slate-400">{message.timestamp}</span>
                </div>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line',
                    style.bg,
                    style.textColor,
                    message.sender === 'customer'
                      ? 'rounded-tl-sm'
                      : message.sender === 'sales'
                      ? 'rounded-tr-sm'
                      : 'rounded-tl-sm'
                  )}
                >
                  {message.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[#8b5cf6]" />
              <span className="text-xs font-medium text-[#8b5cf6]">
                AI 回复建议
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={handleNextSuggestion}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <RefreshCw className="h-3 w-3" />
                  换一个
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={suggestion.id}
                  className={cn(
                    'animate-pulse-glow rounded-xl border p-3 transition-all',
                    idx === activeSuggestion
                      ? 'border-[#8b5cf6]/30 bg-[#8b5cf6]/5'
                      : 'border-slate-100 bg-slate-50 opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="flex-1 text-sm leading-relaxed text-slate-700">
                      {suggestion.content}
                    </p>
                    <button
                      onClick={() => handleSendSuggestion(suggestion.content)}
                      className="shrink-0 rounded-lg bg-[#0891b2] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0e7490] transition-colors"
                    >
                      发送
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                      置信度 {suggestion.confidence}%
                    </span>
                    <span>来源: {suggestion.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-[#0891b2] focus-within:ring-1 focus-within:ring-[#0891b2]">
            <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <Paperclip className="h-4 w-4" />
            </button>
            <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <Image className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入消息... (Enter 发送)"
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={cn(
                'rounded-lg p-2 transition-colors',
                inputText.trim()
                  ? 'bg-[#0891b2] text-white hover:bg-[#0e7490]'
                  : 'bg-slate-100 text-slate-400'
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
