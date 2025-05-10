"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

// Types for chat-related data
export type ChatMessage = {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  };
};

export type ChatConversation = {
  id: string;
  userId: string;
  title: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
  messages?: ChatMessage[];
};

// Type for the context
type ChatContextType = {
  conversations: ChatConversation[];
  filteredConversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  messages: ChatMessage[];
  loading: boolean;
  unreadCount: number;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (title: string) => Promise<ChatConversation | null>;
  updateConversationStatus: (conversationId: string, status: 'OPEN' | 'CLOSED') => Promise<void>;
};

// Create context with default values
const ChatContext = createContext<ChatContextType>({
  conversations: [],
  filteredConversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  unreadCount: 0,
  fetchConversations: async () => {},
  fetchMessages: async () => {},
  sendMessage: async () => {},
  createConversation: async () => null,
  updateConversationStatus: async () => {},
});

// Provider component
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const userIdFilter = searchParams?.get('userId');
  
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter conversations by userId if specified
  const filteredConversations = useMemo(() => {
    if (!userIdFilter) return conversations;
    return conversations.filter(conv => conv.userId === userIdFilter);
  }, [conversations, userIdFilter]);
  
  // Calculate unread count
  const unreadCount = useMemo(() => {
    if (!session?.user?.role) return 0;
    return conversations.reduce((count, conversation) => {
      const isAdmin = session.user.role === 'ADMIN';
      // Count each unread message, not just each conversation
      const unreadMessages = conversation.messages?.filter(
        msg => !msg.isRead && (
          isAdmin ? msg.user?.role !== 'ADMIN' : msg.user?.role === 'ADMIN'
        )
      ) || [];
      return count + unreadMessages.length;
    }, 0);
  }, [conversations, session?.user?.role]);

  // Fetch user's conversations
  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Build the API URL with optional userId filter
      let url = '/api/chats';
      if (userIdFilter && session?.user?.role === 'ADMIN') {
        url += `?userId=${userIdFilter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.conversations) {
        setConversations(data.conversations);
        
        // Clear active conversation if it doesn't match the filter
        if (userIdFilter && activeConversation && activeConversation.userId !== userIdFilter) {
          setActiveConversation(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chats/${conversationId}`);
      const data = await response.json();
      
      if (data.conversation && data.messages) {
        setActiveConversation(data.conversation);
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (conversationId: string, content: string) => {
    try {
      const response = await fetch(`/api/chats/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      const data = await response.json();
      
      if (data.success && data.message) {
        // Add new message to the messages array
        setMessages(prev => [...prev, data.message]);
        
        // Update the conversation in the conversations list
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId
              ? { ...conv, updatedAt: new Date().toISOString() }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Create a new conversation
  const createConversation = async (title: string): Promise<ChatConversation | null> => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      
      const data = await response.json();
      
      if (data.success && data.conversation) {
        // Add new conversation to the conversations array
        setConversations(prev => [data.conversation, ...prev]);
        return data.conversation;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
    return null;
  };

  // Update conversation status (open/closed)
  const updateConversationStatus = async (conversationId: string, status: 'OPEN' | 'CLOSED') => {
    try {
      const response = await fetch(`/api/chats/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update active conversation if it's the one being modified
        if (activeConversation && activeConversation.id === conversationId) {
          setActiveConversation({ ...activeConversation, status });
        }
        
        // Update the conversation in the conversations list
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId
              ? { ...conv, status }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error updating conversation status:', error);
    }
  };

  // Load initial conversations when component mounts
  useEffect(() => {
    fetchConversations();
  }, [userIdFilter]);

  const value = {
    conversations,
    filteredConversations,
    activeConversation,
    messages,
    loading,
    unreadCount,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    updateConversationStatus,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook to use the context
export const useChat = () => useContext(ChatContext);

export default ChatContext; 