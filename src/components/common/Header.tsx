import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  BookOpen,
  User,
  ShoppingCart,
  LogIn,
  LogOut,
  ChevronDown,
  Info,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { cn } from '../../utils/helpers';
import { getR2AssetUrl } from '../../utils/r2';

/* ================= LOGO ================= */

const Logo: React.FC = () => {
  const location = useLocation();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 group flex-shrink-0">
      <div className="relative w-16 h-16 flex-shrink-0">
        <img
          src={getR2AssetUrl('logoo.png', '')}
          alt="KeyVasthu logo"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col">
        <h1 className="font-display text-xl font-semibold text-astral-500 group-hover:text-saffron-600 transition-colors">
          KeyVasthu
        </h1>
        <p className="text-xs text-earth-700 font-accent italic">
          Vasthu • Astrology • Architecture
        </p>
      </div>
    </Link>
  );
};

/* ================= NAV LINK ================= */

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onClick?.();
      }}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300',
        isActive
          ? 'bg-saffron-50 text-saffron-600 font-medium'
          : 'text-earth-600 hover:text-saffron-600 hover:bg-saffron-50/50'
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

/* ================= HEADER ================= */

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  /* ===== PUBLIC NAVIGATION (Always Visible) ===== */
  const mainNavLinks = [
    { to: '/', icon: <Home size={18} />, label: 'Home' },
    { to: '/books', icon: <BookOpen size={18} />, label: 'Products' },
    { to: '/blog', icon: <FileText size={18} />, label: 'Blog' },
    { to: '/about', icon: <Info size={18} />, label: 'About' },
  ];

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
  };

  /* ===== Close Profile Dropdown ===== */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  /* ===== Scroll To Top On Route Change ===== */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-earth-100 shadow-sm">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <Logo />

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {mainNavLinks.map((link) => (
              <NavLink key={link.to} {...link} />
            ))}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">

            {/* CART */}
            <Link
              to={isAuthenticated ? "/cart" : "/login"}
              className="relative p-2 text-earth-600 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg transition-all"
            >
              <ShoppingCart size={22} />
              {isAuthenticated && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-saffron-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* PROFILE / LOGIN */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* User Profile Section with Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-3 px-3 py-2 text-earth-600 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg transition-all"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-saffron-400 to-gold-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block font-medium text-earth-700">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDown size={16} />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-earth-100 z-50"
                      >
                        <div className="p-6 border-b border-earth-100">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-saffron-400 to-gold-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-astral-500 text-lg">{user?.name || 'User'}</p>
                              <p className="text-sm text-earth-500 mt-1">{user?.email || ''}</p>
                            </div>
                          </div>
                          {user?.phone && (
                            <div className="mt-3 pt-3 border-t border-earth-100">
                              <p className="text-sm text-earth-600">
                                <span className="font-medium">Phone:</span> {user.phone}
                              </p>
                            </div>
                          )}
                          {user?.role && (
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'admin' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role === 'admin' ? 'Administrator' : 'User'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-saffron-50 rounded-lg text-earth-700"
                          >
                            <User size={18} />
                            <span>View Profile</span>
                          </Link>
                          <Link
                            to={user?.role === 'admin' ? "/admin" : "/dashboard"}
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-saffron-50 rounded-lg text-earth-700"
                          >
                            <Home size={18} />
                            <span>Dashboard</span>
                          </Link>
                         
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all font-medium"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary flex items-center gap-2 !py-2">
                <LogIn size={18} />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-earth-600 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-earth-100 bg-white"
          >
            <nav className="px-4 py-4 space-y-1">
              {mainNavLinks.map((link) => (
                <NavLink
                  key={link.to}
                  {...link}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
