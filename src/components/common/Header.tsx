import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  BookOpen,
  MessageCircle,
  PenTool,
  User,
  ShoppingCart,
  LogIn,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Info,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { cn } from '../../utils/helpers';

const Logo: React.FC = () => {
  const location = useLocation();
  
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // If not on home page, let the Link handle navigation normally
    // The useEffect hook will handle scrolling to top on route change
  };

  return (
    <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 group flex-shrink-0">
      <div className="relative w-16 h-16 flex-shrink-0">
        <img
          src="/logoo.png"
          alt="KeyVasthu logo"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col justify-center items-start">
        <h1 className="font-display text-xl font-semibold text-astral-500 group-hover:text-saffron-600 transition-colors leading-tight text-left">
          KeyVasthu
        </h1>
        <p className="text-xs text-earth-700 font-accent italic leading-tight text-left">Vasthu • Astrology • Architecture</p>
      </div>
    </Link>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = () => {
    // Scroll to top when clicking navigation links
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Call the original onClick if provided
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
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

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const mainNavLinks = [
    { to: '/', icon: <Home size={18} />, label: 'Home' },
    { to: '/books', icon: <BookOpen size={18} />, label: 'Books' },
    { to: '/blog', icon: <FileText size={18} />, label: 'Blog' },
    { to: '/about', icon: <Info size={18} />, label: 'About' },
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/chat', icon: <MessageCircle size={18} />, label: 'Chat' },
    { to: '/drawing-board', icon: <PenTool size={18} />, label: 'Drawing' },
  ];

  const authNavLinks: Array<{ to: string; icon: React.ReactNode; label: string }> = [];

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
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

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return null;

    const handleBreadcrumbClick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2 text-sm text-earth-500">
        <Link to="/" onClick={handleBreadcrumbClick} className="hover:text-saffron-600">Home</Link>
        {paths.map((path, index) => (
          <React.Fragment key={path}>
            <span>/</span>
            <Link
              to={`/${paths.slice(0, index + 1).join('/')}`}
              onClick={handleBreadcrumbClick}
              className={cn(
                index === paths.length - 1 ? 'text-saffron-600 font-medium' : 'hover:text-saffron-600'
              )}
            >
              {path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')}
            </Link>
          </React.Fragment>
        ))}
      </nav>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-earth-100 shadow-sm">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Fixed on left */}
          <div className="flex-shrink-0 flex items-start -ml-4 sm:-ml-6 lg:-ml">
            <Logo />
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {mainNavLinks.map((link) => (
              <NavLink key={link.to} {...link} />
            ))}
            {isAuthenticated && authNavLinks.length > 0 && authNavLinks.map((link) => (
              <NavLink key={link.to} {...link} />
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Cart */}
            {isAuthenticated ? (
              <Link
                to="/cart"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="relative p-2 text-earth-600 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg transition-all"
                aria-label={`Shopping cart with ${totalItems} items`}
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-saffron-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="relative p-2 text-earth-600 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg transition-all"
                aria-label="Shopping cart"
              >
                <ShoppingCart size={22} />
              </Link>
            )}

            {/* Auth buttons / Profile */}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-earth-600 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg transition-all"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-saffron-400 to-gold-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:block font-medium">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={16} className={cn('transition-transform', isProfileDropdownOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-earth-100 overflow-hidden"
                    >
                      <div className="p-4 border-b border-earth-100">
                        <p className="font-medium text-earth-800">{user?.name}</p>
                        <p className="text-sm text-earth-500">{user?.email}</p>
                        <span className="inline-block mt-2 badge-gold text-xs capitalize">{user?.role}</span>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex items-center gap-3 px-3 py-2 text-earth-600 hover:bg-saffron-50 hover:text-saffron-600 rounded-lg transition-all"
                        >
                          <User size={18} />
                          Profile Settings
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="flex items-center gap-3 px-3 py-2 text-earth-600 hover:bg-saffron-50 hover:text-saffron-600 rounded-lg transition-all"
                          >
                            <LayoutDashboard size={18} />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <LogOut size={18} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              !['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname) && (
                <Link 
                  to="/login" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="btn-primary flex items-center gap-2 !py-2"
                >
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-earth-600 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg transition-all"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Breadcrumbs */}
        {location.pathname !== '/' && (
          <div className="py-2 border-t border-earth-50">
            {getBreadcrumbs()}
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-earth-100 bg-white"
          >
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {mainNavLinks.map((link) => (
                <NavLink key={link.to} {...link} onClick={() => setIsMobileMenuOpen(false)} />
              ))}
              {isAuthenticated && authNavLinks.length > 0 && (
                <>
                  <div className="h-px bg-earth-100 my-2" />
                  {authNavLinks.map((link) => (
                    <NavLink key={link.to} {...link} onClick={() => setIsMobileMenuOpen(false)} />
                  ))}
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

