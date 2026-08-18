'use client';

import { useState, useMemo } from 'react';
import { customers } from '@/lib/mock-data';
import { ConversationList } from '@/components/conversation-list';
import { ChatPanel } from '@/components/chat-panel';
import { CustomerProfile } from '@/components/customer-profile';

interface ChatViewProps {
  isAiMode: boolean;
}

export function ChatView({ isAiMode }: ChatViewProps) {
  const [selectedId, setSelectedId] = useState(1);
  const [filter, setFilter] = useState<'all' | 'S' | 'A' | 'B'>('all');
  const [search, setSearch] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (filter !== 'all' && c.level !== filter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filter, search]);

  const selectedCustomer = customers.find((c) => c.id === selectedId) ?? customers[0];

  const counts = {
    all: customers.length,
    S: customers.filter((c) => c.level === 'S').length,
    A: customers.filter((c) => c.level === 'A').length,
    B: customers.filter((c) => c.level === 'B').length,
  };

  return (
    <div className="flex flex-1 flex-row overflow-hidden">
      <ConversationList
        customers={filteredCustomers}
        selectedId={selectedId}
        onSelect={setSelectedId}
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
      />
      <ChatPanel customer={selectedCustomer} isAiMode={isAiMode} />
      <CustomerProfile customer={selectedCustomer} />
    </div>
  );
}
