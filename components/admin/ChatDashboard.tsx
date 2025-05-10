"use client";

import { useState, useMemo } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { 
  PaperAirplaneIcon, 
  XCircleIcon, 
  CheckCircleIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ChatDashboardProps {
  isStandalone?: boolean;
}

export default function ChatDashboard({ isStandalone = false }: ChatDashboardProps) {
  const { 
    conversations, 
    filteredConversations,
    activeConversation, 
    messages, 
    loading,
    fetchMessages, 
    sendMessage,
    updateConversationStatus
  } = useChat();
  
  const router = useRouter();
  const [newMessageText, setNewMessageText] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  
  // Filter conversations
  const displayedConversations = useMemo(() => {
    // First use filteredConversations if they exist and have content
    const baseConversations = filteredConversations.length > 0 ? filteredConversations : conversations;
    
    // Then apply the open/closed/all filter
    return baseConversations.filter(conversation => {
      if (filter === 'open') return conversation.status === 'OPEN';
      if (filter === 'closed') return conversation.status === 'CLOSED';
      return true;
    });
  }, [conversations, filteredConversations, filter]);
  
  // Handle message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !newMessageText.trim()) return;
    
    sendMessage(activeConversation.id, newMessageText);
    setNewMessageText('');
  };
  
  // Toggle conversation status
  const handleToggleStatus = () => {
    if (!activeConversation) return;
    
    const newStatus = activeConversation.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    updateConversationStatus(activeConversation.id, newStatus);
  };
  
  // Navigate to user details
  const handleViewUserDetails = (userId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    router.push(`/admin/users/${userId}`);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className={isStandalone ? "" : "mt-8"}>
      {!isStandalone && (
        <>
          <h2 className="text-2xl font-serif font-bold mb-4">Customer Messages</h2>
          <p className="text-gray-600 mb-4">
            Manage customer inquiries and provide support through direct messaging.
          </p>
        </>
      )}
      
      <div className={`flex flex-col md:flex-row ${isStandalone ? "h-[calc(100vh-12rem)]" : "h-[calc(100vh-20rem)]"} bg-white rounded-lg shadow overflow-hidden`}>
        {/* Conversations sidebar */}
        <div className="w-full md:w-1/3 border-r border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Customer Inquiries</h3>
            <div className="mt-2 flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-1 text-sm ${
                  filter === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('open')}
                className={`flex-1 py-1 text-sm ${
                  filter === 'open' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('closed')}
                className={`flex-1 py-1 text-sm ${
                  filter === 'closed' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>
          
          {/* Conversation list */}
          <div className="overflow-y-auto h-full">
            {loading && displayedConversations.length === 0 ? (
              <p className="text-center py-4 text-gray-500">Loading conversations...</p>
            ) : displayedConversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-gray-500 mb-2">No customer messages found.</p>
                <p className="text-sm text-gray-400">
                  Customer inquiries will appear here when they contact support.
                </p>
              </div>
            ) : (
              displayedConversations.map(conversation => {
                // Check for unread messages
                const hasUnreadMessages = conversation.messages?.some(
                  msg => !msg.isRead && msg.userId === conversation.userId
                );
                
                return (
                  <div 
                    key={conversation.id}
                    onClick={() => fetchMessages(conversation.id)}
                    className={`p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200
                      ${activeConversation?.id === conversation.id ? 'bg-gray-100' : ''}
                      ${hasUnreadMessages ? 'border-l-4 border-l-red-500' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-800">
                        {conversation.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        conversation.status === 'OPEN' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {conversation.status === 'OPEN' ? 'Active' : 'Resolved'}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      {conversation.user?.image ? (
                        <div className="mr-2 relative w-5 h-5">
                          <Image
                            src={conversation.user.image}
                            alt={conversation.user.name || 'User'}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                      )}
                      <button 
                        className="text-sm text-gray-600 truncate hover:text-primary hover:underline"
                        onClick={(e) => handleViewUserDetails(conversation.userId, e)}
                      >
                        {conversation.user?.name || conversation.user?.email || 'Customer'}
                      </button>
                    </div>
                    {conversation.messages && conversation.messages.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {conversation.messages[0].content}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(conversation.updatedAt)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Chat area */}
        <div className="flex flex-col w-full md:w-2/3">
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {activeConversation.title}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    {activeConversation.user?.image ? (
                      <div className="mr-2 relative w-5 h-5">
                        <Image
                          src={activeConversation.user.image}
                          alt={activeConversation.user.name || 'User'}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                    )}
                    <button 
                      onClick={() => handleViewUserDetails(activeConversation.userId)}
                      className="mr-2 hover:text-primary hover:underline"
                    >
                      {activeConversation.user?.name || activeConversation.user?.email || 'Customer'}
                    </button>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeConversation.status === 'OPEN'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {activeConversation.status === 'OPEN' ? 'Active' : 'Resolved'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Link
                    href={`/admin/users/${activeConversation.userId}`}
                    className="px-3 py-1 rounded-lg text-sm flex items-center bg-gray-100 text-gray-700 hover:bg-gray-200 mr-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <UserCircleIcon className="h-4 w-4 mr-1" />
                    View User Profile
                  </Link>
                  <button
                    onClick={handleToggleStatus}
                    className={`px-3 py-1 rounded-lg text-sm flex items-center ${
                      activeConversation.status === 'OPEN'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {activeConversation.status === 'OPEN' ? (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Mark as Resolved
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Reopen
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <p>No messages found in this conversation.</p>
                    <p className="text-sm mt-1">Respond to the customer below.</p>
                  </div>
                ) : (
                  messages.map(message => {
                    const isAdmin = message.user?.role === 'ADMIN';
                    return (
                      <div 
                        key={message.id} 
                        className={`mb-4 flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] rounded-lg p-3 ${
                          isAdmin 
                            ? 'bg-primary text-white' 
                            : 'bg-yellow-50 border border-yellow-200 text-gray-800'
                        }`}>
                          <div className="flex items-start mb-1">
                            {!isAdmin && message.user?.image ? (
                              <div className="mr-2 relative w-6 h-6">
                                <Image
                                  src={message.user.image}
                                  alt={message.user.name || 'Customer'}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                            ) : !isAdmin && (
                              <UserCircleIcon className="h-6 w-6 mr-2 text-amber-500" />
                            )}
                            <span className={`font-medium text-sm ${!isAdmin ? 'text-amber-700' : ''}`}>
                              {isAdmin ? 'You' : (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isAdmin && message.userId) {
                                      handleViewUserDetails(message.userId);
                                    }
                                  }}
                                  className={`hover:underline ${!isAdmin ? 'cursor-pointer' : ''}`}
                                >
                                  {message.user?.name || message.user?.email || 'Customer'}
                                </button>
                              )}
                            </span>
                            {!isAdmin && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">Customer</span>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs mt-1 opacity-75">{formatDate(message.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Message input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex">
                <input
                  type="text"
                  placeholder={activeConversation.status === 'CLOSED' ? 'Conversation is resolved' : 'Type your reply...'}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  disabled={activeConversation.status === 'CLOSED'}
                  className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
                />
                <button 
                  type="submit" 
                  disabled={!newMessageText.trim() || activeConversation.status === 'CLOSED'}
                  className="bg-primary text-white p-2 rounded-r hover:bg-primary/90 disabled:opacity-50 disabled:bg-gray-400"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
              <h3 className="text-xl font-medium mb-2">Customer Support Dashboard</h3>
              <p className="text-center max-w-md">
                Select a conversation from the sidebar to view customer messages and respond to inquiries.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}