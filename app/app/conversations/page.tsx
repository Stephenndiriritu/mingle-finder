'use client'

import { ConversationsList } from '@/components/conversations/ConversationsList'

export default function ConversationsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <ConversationsList />
    </div>
  )
}
