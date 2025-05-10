"use client";

import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import AccountLayout from '@/components/account/AccountLayout';
import { 
  PaperAirplaneIcon, 
  PlusCircleIcon 
} from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function SupportPage() {
  const { 
    conversations, 
    activeConversation, 
    messages, 
    loading,
    createConversation, 
    fetchMessages, 
    sendMessage,
    fetchConversations,
    updateConversationStatus,
  } = useChat();
  
  const [newMessageText, setNewMessageText] = useState('');
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  
  // Create a new conversation
  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConversationTitle.trim()) return;
    
    try {
      const conversation = await createConversation(newConversationTitle);
      if (conversation) {
        setNewConversationTitle('');
        setShowNewConversation(false);
        // Select the new conversation
        fetchMessages(conversation.id);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };
  
  // When a conversation is clicked, fetch messages and then refresh conversations to update unread count
  const handleConversationClick = async (conversationId: string) => {
    await fetchMessages(conversationId);
    await fetchConversations(); // Refresh unread count
  };
  
  // When a message is sent, send the message and then refresh conversations to update unread count
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !newMessageText.trim()) return;
    await sendMessage(activeConversation.id, newMessageText);
    setNewMessageText("");
    await fetchConversations(); // Refresh unread count
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <AccountLayout activePage="support">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Customer Support</h2>
        <p className="text-gray-600">
          Need help? Start a conversation with our support team and we'll respond as soon as possible.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row h-[calc(100vh-16rem)] bg-white rounded-lg shadow overflow-hidden">
        {/* Conversations sidebar */}
        <div className="w-full md:w-1/3 border-r border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Your Conversations</h3>
            <button 
              onClick={() => setShowNewConversation(!showNewConversation)}
              className="text-primary hover:text-primary/80"
              aria-label="New conversation"
            >
              <PlusCircleIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* New conversation form */}
          {showNewConversation && (
            <form onSubmit={handleCreateConversation} className="p-3 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What do you need help with?
              </label>
              <input
                type="text"
                placeholder="e.g., Order Issue, Product Question"
                value={newConversationTitle}
                onChange={(e) => setNewConversationTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <div className="mt-2 flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowNewConversation(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 mr-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
                >
                  Start Conversation
                </button>
              </div>
            </form>
          )}
          
          {/* Conversation list */}
          <div className="overflow-y-auto h-full" style={{ maxHeight: '400px' }}>
            {loading && conversations.length === 0 ? (
              <p className="text-center py-4 text-gray-500">Loading conversations...</p>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-gray-500 mb-4">You don't have any support conversations yet.</p>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 inline-flex items-center"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-1" />
                  Start New Conversation
                </button>
              </div>
            ) : (
              conversations.map(conversation => (
                <div 
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={`p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200
                    ${activeConversation?.id === conversation.id ? 'bg-gray-100' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">{conversation.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      conversation.status === 'OPEN' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {conversation.status === 'OPEN' ? 'Active' : 'Resolved'}
                    </span>
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
              ))
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
                  <h2 className="text-xl font-semibold text-gray-800">{activeConversation.title}</h2>
                  <p className="text-sm text-gray-500">
                    {activeConversation.status === 'OPEN' ? 'Active Conversation' : 'Conversation Resolved'}
                  </p>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <p>No messages yet.</p>
                    <p className="text-sm mt-1">Start the conversation below.</p>
                  </div>
                ) : (
                  messages.map(message => {
                    const isAdmin = message.user?.role === 'ADMIN';
                    return (
                      <div 
                        key={message.id} 
                        className={`mb-4 flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[75%] rounded-lg p-3 ${
                          isAdmin 
                            ? 'bg-blue-50 border border-blue-200 text-gray-800' 
                            : 'bg-primary text-white'
                        }`}>
                          <div className="flex items-start mb-1">
                            {isAdmin && message.user?.image && (
                              <div className="mr-2 relative w-6 h-6">
                                <Image
                                  src={message.user.image}
                                  alt={message.user.name || 'Admin'}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                            )}
                            <span className={`font-medium text-sm ${isAdmin ? 'text-blue-700' : ''}`}>
                              {isAdmin ? (message.user?.name || 'Support Agent') : 'You'}
                            </span>
                            {isAdmin && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">Admin</span>
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
                  placeholder={activeConversation.status === 'CLOSED' ? 'This conversation is resolved' : 'Type your message...'}
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
              <h3 className="text-xl font-medium mb-2">Contact Our Support Team</h3>
              <p className="text-center max-w-md mb-4">
                Have a question or need assistance? Start a conversation with our support team and we'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setShowNewConversation(true)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 inline-flex items-center"
              >
                <PlusCircleIcon className="h-5 w-5 mr-1" />
                Start New Conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
} 