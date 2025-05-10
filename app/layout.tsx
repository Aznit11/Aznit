import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '../styles/globals.css';
import { CartProvider } from '../contexts/CartContext';
import { PayPalProvider } from '../contexts/PayPalContext';
import { WishlistProvider } from '../contexts/WishlistContext';
import { ChatProvider } from '../contexts/ChatContext';
import AuthProvider from '../components/auth/AuthProvider';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'AzniT - Authentic Moroccan Traditional Products',
  description: 'Discover authentic Moroccan traditional products - from handcrafted decor to natural beauty essentials. Shop our curated collection of artisanal Moroccan treasures.',
};

// PayPal client ID from environment variables with fallback for development
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 
  (process.env.NODE_ENV === 'production' 
    ? '' // Empty in production forces explicit setting
    : 'AV1ESvhViDUGDbd7WQFeY2WGdP7VVOAvQmcFBZIKEAz-yMh6Wxarcfv8klu6GcPJ5engKwF6B4YI2GqW'); // Sandbox ID for development

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ChatProvider>
                <PayPalProvider clientId={PAYPAL_CLIENT_ID}>
                  <Navbar />
                  <main>
                    {children}
                  </main>
                  <Footer />
                </PayPalProvider>
              </ChatProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 