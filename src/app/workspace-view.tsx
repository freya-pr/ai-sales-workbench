'use client';

import { useState } from 'react';
import { customers, conversations, aiSuggestions } from '@/lib/mock-data';
import { ConversationList } from '@/components/conversation-list';
import { ChatArea } from '@/components/chat-area';
import { CustomerProfile } from '@/components/customer-profile';
import { DailySummary } from '@/components/daily-summary';

export function WorkspaceView() {
  const [selectedCustomerId, setSelectedCustomerId] = useState('c1');
  const [showSummary, setShowSummary] = useState(true);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)!;
  const selectedMessages = conversations[selectedCustomerId] || [];
  const selectedSuggestions = aiSuggestions[selectedCustomerId] || [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Conversation List */}
        <ConversationList
          customers={customers}
          selectedId={selectedCustomerId}
          onSelect={setSelectedCustomerId}
        />

        {/* Center - Chat Area */}
        <ChatArea
          customer={selectedCustomer}
          messages={selectedMessages}
          suggestions={selectedSuggestions}
        />

        {/* Right Panel - Customer Profile */}
        <CustomerProfile customer={selectedCustomer} />
      </div>

      {/* Bottom - Daily Summary */}
      <DailySummary show={showSummary} onToggle={() => setShowSummary(!showSummary)} />
    </div>
  );
}
