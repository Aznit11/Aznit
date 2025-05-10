"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "../../contexts/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { cart, itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close user menu if clicking outside
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        userButtonRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      
      // Close mobile menu when clicking outside
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen, isMenuOpen]);

  // Handle navigation item click
  const handleNavItemClick = () => {
    setIsMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
    setIsUserMenuOpen(false);
  };

  // Toggle user menu
  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white dark:bg-gray-900 shadow-md"
          : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-playfair">
              AzniT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink href="/" active={pathname === "/"} onClick={handleNavItemClick}>
              Home
            </NavLink>
            <NavLink
              href="/products"
              active={pathname === "/products" || pathname.startsWith("/products/")}
              onClick={handleNavItemClick}
            >
              Products
            </NavLink>
            <NavLink 
              href="/blog"
              active={pathname === "/blog" || pathname.startsWith("/blog/")}
              onClick={handleNavItemClick}
            >
              Blog
            </NavLink>
            <NavLink href="/about" active={pathname === "/about"} onClick={handleNavItemClick}>
              About
            </NavLink>
            <NavLink href="/contact" active={pathname === "/contact"} onClick={handleNavItemClick}>
              Contact
            </NavLink>
          </nav>

          {/* Right side - Cart, Account, etc */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            <div className="relative">
              <button
                ref={userButtonRef}
                onClick={toggleUserMenu}
                className="p-2 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                {status === "authenticated" ? (
                  session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <span className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium">
                      {session.user?.name?.charAt(0) || "U"}
                    </span>
                  )
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div
                  ref={userMenuRef}
                  className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-xl z-20"
                >
                  {status === "authenticated" ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Account
                      </Link>
                      {session.user?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: "/" });
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/register"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`fixed inset-0 z-40 bg-gray-900 bg-opacity-50 transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white dark:bg-gray-800 overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="px-6 pt-8 pb-6 space-y-6">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-playfair">
                    AzniT
                  </span>
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <nav className="space-y-4">
                <MobileNavLink href="/" active={pathname === "/"} onClick={handleNavItemClick}>
                  Home
                </MobileNavLink>
                <MobileNavLink
                  href="/products"
                  active={pathname === "/products" || pathname.startsWith("/products/")}
                  onClick={handleNavItemClick}
                >
                  Products
                </MobileNavLink>
                <MobileNavLink
                  href="/blog"
                  active={pathname === "/blog" || pathname.startsWith("/blog/")}
                  onClick={handleNavItemClick}
                >
                  Blog
                </MobileNavLink>
                <MobileNavLink href="/about" active={pathname === "/about"} onClick={handleNavItemClick}>
                  About
                </MobileNavLink>
                <MobileNavLink href="/contact" active={pathname === "/contact"} onClick={handleNavItemClick}>
                  Contact
                </MobileNavLink>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Desktop navigation link component
function NavLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`transition-colors duration-300 py-2 px-1 border-b-2 ${
        active
          ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
          : "border-transparent text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

// Mobile navigation link component
function MobileNavLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`block py-2 px-4 rounded-md ${
        active
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
} 