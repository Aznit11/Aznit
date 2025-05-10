"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  MapPinIcon, 
  CreditCardIcon, 
  Cog6ToothIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { ReactNode } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useRouter } from 'next/navigation';

interface AccountLayoutProps {
  children: ReactNode;
  activePage: string;
}

export default function AccountLayout({ children, activePage }: AccountLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useChat();
  
  // Function to navigate to support page
  const navigateToSupport = () => {
    router.push('/account/support');
  };
  
  const links = [
    { 
      name: 'profile', 
      label: 'Profile', 
      href: '/account', 
      icon: UserIcon 
    },
    { 
      name: 'orders', 
      label: 'Orders', 
      href: '/account/orders', 
      icon: ShoppingBagIcon 
    },
    { 
      name: 'wishlist', 
      label: 'Wishlist', 
      href: '/account/wishlist', 
      icon: HeartIcon 
    },
    { 
      name: 'addresses', 
      label: 'Addresses', 
      href: '/account/addresses', 
      icon: MapPinIcon 
    },
    { 
      name: 'payment', 
      label: 'Payment Methods', 
      href: '/account/payment', 
      icon: CreditCardIcon 
    },
    { 
      name: 'support', 
      label: 'Contact Support', 
      description: 'Message with our team',
      href: '/account/support', 
      icon: ChatBubbleBottomCenterTextIcon,
      badge: unreadCount > 0 ? unreadCount : undefined,
      highlight: true
    },
    { 
      name: 'settings', 
      label: 'Settings', 
      href: '/account/settings', 
      icon: Cog6ToothIcon 
    }
  ];

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-dark mb-6 font-serif">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="bg-white shadow rounded-lg overflow-hidden">
            <ul>
              {links.map((link) => {
                const isActive = activePage === link.name;
                const Icon = link.icon;
                
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={`flex items-center py-3 px-4 border-l-4 ${
                        isActive
                          ? 'border-primary bg-primary/5 text-primary font-medium'
                          : link.highlight 
                            ? 'border-transparent hover:bg-primary/5 text-primary-dark'
                            : 'border-transparent hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mr-3 ${link.highlight && !isActive ? 'text-primary' : ''}`} />
                      <div>
                        <span>{link.label}</span>
                        {link.description && (
                          <p className="text-xs text-gray-500">{link.description}</p>
                        )}
                      </div>
                      {link.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 font-semibold">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
      
      {/* Only show the floating button if we're not already on the support page */}
      {activePage !== 'support' && (
        <button
          onClick={navigateToSupport}
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-colors duration-200"
          aria-label="Contact Support"
        >
          <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
} 