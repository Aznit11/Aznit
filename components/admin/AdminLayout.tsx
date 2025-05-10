"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  ArchiveBoxIcon, 
  StarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useChat } from '@/contexts/ChatContext';

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

export default function AdminLayout({ children, pageTitle }: AdminLayoutProps) {
  const pathname = usePathname();
  const { unreadCount } = useChat();
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: HomeIcon },
    { path: '/admin/products', label: 'Products', icon: ArchiveBoxIcon },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBagIcon },
    { path: '/admin/users', label: 'Users', icon: UsersIcon },
    { path: '/admin/blog', label: 'Blog', icon: DocumentTextIcon },
    { 
      path: '/admin/chats', 
      label: 'Customer Messages', 
      icon: ChatBubbleLeftRightIcon,
      badge: unreadCount > 0 ? unreadCount : undefined,
      highlight: true
    },
    { path: '/admin/reviews', label: 'Reviews', icon: StarIcon },
    { path: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="container-custom py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-dark font-serif">{pageTitle}</h1>
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-primary"
        >
          Return to Website
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="flex overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center py-4 px-4 whitespace-nowrap border-b-2 relative ${
                  isActive 
                    ? 'border-primary text-primary font-medium'
                    : item.highlight
                      ? 'border-transparent text-primary-dark hover:text-primary hover:bg-primary/5'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 mr-2 ${item.highlight && !isActive ? 'text-primary' : ''}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        {children}
      </div>
    </div>
  );
} 