import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // If not on home page, let the Link handle navigation normally
  };

  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Book Store', to: '/books' },
    { label: 'Consultation', to: '/chat' },
    { label: 'Drawing Board', to: '/drawing-board' },
  ];

  const resourceLinks = [
    { label: 'Vasthu Guide', to: '/books' },
    { label: 'Astrology Basics', to: '/books' },
    { label: 'FAQ', to: '/about' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Refund Policy', to: '/refund' },
    { label: 'Disclaimer', to: '/disclaimer' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gradient-to-br from-astral-800 to-astral-900 text-white">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-saffron-500 via-gold-400 to-saffron-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 mb-4">
              <div className="w-20 h-20">
                <img
                  src="/logoo.png"
                  alt="KeyVasthu logo"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-gold-400">KeyVasthu</h2>
                <p className="text-xs text-earth-300 font-accent italic">Harmony in Architecture</p>
              </div>
            </Link>
            <p className="text-earth-300 text-sm leading-relaxed mb-4">
              Bridging ancient Vasthu Shastra wisdom with modern civil engineering. 
              Expert consultation for homes, offices, and commercial spaces.
            </p>
            {/* Contact info */}
            <div className="space-y-2">
              <a href="mailto:contact@keyvasthu.com" className="flex items-center gap-2 text-sm text-earth-300 hover:text-gold-400 transition-colors">
                <Mail size={16} />
                contact@keyvasthu.com
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-earth-300 hover:text-gold-400 transition-colors">
                <Phone size={16} />
                +91 98765 43210
              </a>
              <p className="flex items-center gap-2 text-sm text-earth-300">
                <MapPin size={16} />
                Mumbai, Maharashtra, India
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-gold-400 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-earth-300 hover:text-gold-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-display text-lg font-semibold text-gold-400 mb-4">Resources</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-earth-300 hover:text-gold-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="font-display text-lg font-semibold text-gold-400 mb-4">Legal</h3>
            <ul className="space-y-2 mb-6">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-earth-300 hover:text-gold-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <h3 className="font-display text-lg font-semibold text-gold-400 mb-3">Follow Us</h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-astral-700 hover:bg-gold-500 rounded-full flex items-center justify-center text-earth-300 hover:text-astral-900 transition-all duration-300"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative mandala pattern */}
        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
          <div className="text-gold-500/50">
            <svg viewBox="0 0 40 40" className="w-10 h-10">
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
              <line x1="20" y1="2" x2="20" y2="38" stroke="currentColor" strokeWidth="0.5" />
              <line x1="2" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-earth-400">
          <p>© {currentYear} KeyVasthu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

