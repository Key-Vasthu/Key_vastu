import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Star,
  BookOpen,
  MessageCircle,
  PenTool,
  Users,
  Award,
  Building2,
  ChevronRight,
  Quote,
  Sparkles,
} from 'lucide-react';
import { Button, Card, Badge, Avatar } from '../components/common';
import { VasthuPurushaGrid, ZodiacWheel } from '../components/vasthu';
import { useAuth } from '../contexts/AuthContext';
import { getR2AssetUrl } from '../utils/r2';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Fixed Elephant Border Component using elephant.png (complete side view)
const ElephantBorder: React.FC<{ position: 'top' | 'bottom' }> = ({ position }) => {
  const elephants = Array(14).fill(null);
  
  return (
    <div 
      className={`absolute left-0 right-0 h-20 overflow-visible pointer-events-none z-10 ${
        position === 'top' ? 'top-[-5px]' : 'bottom-[-0px]'
      }`}
    >
      {/* Gradient fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cream-50 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-cream-50 to-transparent z-10" />
      
      {/* Fixed container - evenly distributed elephants with reduced spacing - showing complete side view */}
      <div className="flex items-center justify-evenly w-full px-4 gap-4 h-full">
        {elephants.map((_, i) => (
          <div 
            key={i}
            className="flex items-center justify-center h-full"
            style={{ 
              transform: position === 'top' ? 'none' : 'scaleX(-1)', // Flip bottom row for visual variety
            }}
          >
            <img 
              src={getR2AssetUrl('elephant.png', '')} 
              alt="" 
              className="h-full w-auto object-contain opacity-80 flex-shrink-0"
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))',
                maxHeight: '80%',
                height: '80%',
                backgroundColor: 'transparent',
                mixBlendMode: 'multiply',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Hero Section
const HeroSection: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
  <section id="hero" className="relative min-h-[90vh] flex items-center overflow-hidden bg-cream-50">
    {/* Animated Elephant Borders */}
    <ElephantBorder position="top" />
    <ElephantBorder position="bottom" />
    
    {/* Faded Background Image - Behind Right Content (Rotating) */}
    <div className="absolute inset-y-0 right-0 w-3/4 pointer-events-none overflow-hidden hidden lg:flex items-center justify-center">
      <motion.div 
        className="w-[600px] h-[600px] opacity-[0.20]"
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 120, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        <img 
          src={getR2AssetUrl('vasthu-plan.png', '')} 
          alt="" 
          className="w-full h-full object-contain"
        />
      </motion.div>
    </div>

    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[25%_75%] gap-8 lg:gap-8 items-center">
        
        {/* Left Side - Vastu Compass Image (Static) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center"
        >
          <div className="w-[360px] h-[360px] sm:w-[400px] sm:h-[400px] lg:w-[450px] lg:h-[450px]">
            <img 
              src={getR2AssetUrl('vasthu-plan.png', '')} 
              alt="Vasthu & Astrology" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
        </motion.div>

        {/* Right Side - Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative text-center flex flex-col items-center justify-center"
        >
          {/* Soft Spotlight Gradient */}
          <div 
            className="absolute inset-0 -inset-x-12 -inset-y-12 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 247, 237, 0.4) 0%, rgba(255, 247, 237, 0.2) 40%, transparent 70%)'
            }}
          />
          
          <motion.div variants={fadeInUp} className="mb-6">
            <Badge variant="gold" className="inline-flex">
              <Star size={14} className="mr-1.5" /> Trusted by 10,000+ Clients
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-display font-bold text-astral-900 leading-tight mb-6"
          >
            Harness the Ancient Wisdom of{' '}
            <span className="text-saffron-600">Vasthu</span> for Your Modern Lifestyle
          </motion.h1>
          
          <motion.p
            variants={fadeInUp}
            className="text-sm lg:text-base text-earth-600 mb-8 max-w-xl leading-relaxed"
          >
            Discover how the timeless principles of Vasthu can enhance your modern living space, 
            creating harmony and balance in your home. Embrace ancient wisdom to foster well-being, 
            productivity, and positive energy in your everyday life.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {!isAuthenticated && (
              <Link to="/login">
                <Button 
                  variant="primary" 
                  size="lg" 
                  rightIcon={<ChevronRight size={20} />}
                  className="shadow-lg hover:shadow-xl hover:shadow-saffron/50 transition-shadow duration-300"
                >
                  Login
                </Button>
              </Link>
            )}
            <Link to="/books">
              <Button 
                variant="outline" 
                size="lg"
                className="border-[3px] border-astral-500 text-astral-600 hover:bg-astral-50 focus-visible:ring-astral-400"
              >
                <BookOpen size={18} className="mr-2" />
                Explore Books
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            {[
              { value: '25+', label: 'Years Experience' },
              { value: '5000+', label: 'Projects Completed' },
              { value: '15+', label: 'Published Books' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-white/80 rounded-xl border-2 border-earth-200 shadow-sm">
                <p className="text-xl sm:text-2xl font-display font-bold text-astral-600">{stat.value}</p>
                <p className="text-xs text-earth-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
  );
};

// Features Section
const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Compass,
      title: 'Vasthu Analysis',
      description: 'Comprehensive assessment of your space based on ancient Vasthu Shastra principles for optimal energy flow.',
      color: 'text-saffron-500',
      bg: 'bg-saffron-50',
    },
    {
      icon: Star,
      title: 'Astrological Guidance',
      description: 'Personalized recommendations based on your birth chart and planetary positions for construction timing.',
      color: 'text-gold-600',
      bg: 'bg-gold-50',
    },
    {
      icon: MessageCircle,
      title: 'Expert Consultation',
      description: 'One-on-one sessions with our experienced Vasthu consultant to address your specific concerns.',
      color: 'text-astral-500',
      bg: 'bg-astral-50',
    },
    {
      icon: PenTool,
      title: 'Interactive Drawing',
      description: 'Upload and annotate floor plans directly in our drawing board for detailed analysis.',
      color: 'text-earth-600',
      bg: 'bg-earth-50',
    },
    {
      icon: BookOpen,
      title: 'Knowledge Library',
      description: 'Access our extensive collection of books on Vasthu, astrology, and architectural harmony.',
      color: 'text-saffron-600',
      bg: 'bg-saffron-50',
    },
    {
      icon: Building2,
      title: 'Project Support',
      description: 'End-to-end guidance for residential and commercial construction projects.',
      color: 'text-gold-600',
      bg: 'bg-gold-50',
    },
  ];

  return (
    <section className="py-20 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="divider-ornate mb-6">
            <Star className="text-gold-500" />
          </motion.div>
          <motion.h2 variants={fadeInUp} className="section-title mb-4">
            Our Services
          </motion.h2>
          <motion.p variants={fadeInUp} className="section-subtitle">
            Comprehensive Vasthu and astrology services tailored to your needs
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={fadeInUp}>
              <Card variant="gold" className="h-full hover:shadow-gold group border-2 border-gold-300">
                <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-display font-semibold text-astral-500 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-earth-600">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Books Showcase Section
const BooksSection: React.FC = () => {
  const books = [
    {
      id: '1',
      title: 'Complete Guide to Vasthu Shastra',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      price: 599,
    },
    {
      id: '2',
      title: 'Astrology for Architecture',
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
      price: 449,
    },
    {
      id: '3',
      title: 'Vasthu for Commercial Spaces',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      price: 699,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="divider-ornate mb-6">
            <BookOpen className="text-gold-500" />
          </motion.div>
          <motion.h2 variants={fadeInUp} className="section-title mb-4">
            Featured Books
          </motion.h2>
          <motion.p variants={fadeInUp} className="section-subtitle">
            Explore our published works on Vasthu Shastra
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {books.map((book) => (
            <motion.div key={book.id} variants={fadeInUp}>
              <Link to="/books">
                <Card variant="default" padding="none" hoverable className="overflow-hidden group border-2 border-earth-200">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-astral-900/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-lg font-display font-semibold mb-2">{book.title}</h3>
                      <p className="text-gold-400 font-semibold text-sm">₹{book.price}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link to="/books">
            <Button variant="outline" rightIcon={<ChevronRight size={18} />}>
              View All Books
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: '1',
      name: 'Rajesh Sharma',
      location: 'Mumbai, Maharashtra',
      content: 'The Vasthu consultation transformed our home. We noticed positive changes in health and prosperity within months. Dr. Sharma\'s expertise is unmatched.',
      rating: 5,
      project: 'Residential Villa',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
    },
    {
      id: '2',
      name: 'Priya Patel',
      location: 'Ahmedabad, Gujarat',
      content: 'Our office was designed according to Vasthu principles recommended by KeyVasthu. The workplace harmony and business growth has been remarkable.',
      rating: 5,
      project: 'Corporate Office',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    },
    {
      id: '3',
      name: 'Amit Kumar',
      location: 'Delhi NCR',
      content: 'The astrological timing guidance for our construction project was invaluable. The project completed smoothly and the building feels blessed.',
      rating: 5,
      project: 'Commercial Complex',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-astral-50 to-earth-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="divider-ornate mb-6">
            <Users className="text-gold-500" />
          </motion.div>
          <motion.h2 variants={fadeInUp} className="section-title mb-4">
            Client Testimonials
          </motion.h2>
          <motion.p variants={fadeInUp} className="section-subtitle">
            Hear from our satisfied clients about their transformation journey
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.id} variants={fadeInUp}>
              <Card className="h-full relative border-2 border-earth-200">
                <Quote className="absolute top-4 right-4 w-10 h-10 text-gold-200" />
                <div className="flex items-center gap-4 mb-4">
                  <Avatar src={testimonial.avatar} name={testimonial.name} size="lg" />
                  <div>
                    <h4 className="text-base font-semibold text-astral-500">{testimonial.name}</h4>
                    <p className="text-xs text-earth-500">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-gold-500 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-earth-600 italic mb-4">"{testimonial.content}"</p>
                <Badge variant="gold" size="sm">{testimonial.project}</Badge>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Vasthu & Astrology Elements Section
const VasthuAstrologySection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-astral-900 via-astral-800 to-astral-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <pattern id="vasthuBg" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#d4a418" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="#d4a418" strokeWidth="0.5" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="#d4a418" strokeWidth="0.3" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="#d4a418" strokeWidth="0.3" />
          </pattern>
          <rect width="400" height="400" fill="url(#vasthuBg)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-6">
            <Sparkles size={16} />
            Ancient Wisdom, Modern Application
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
            The Science of <span className="text-gold-400">Vasthu</span>  <span className="text-saffron-400"></span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-base text-earth-200 max-w-3xl mx-auto">
            Experience the harmonious blend of Vasthu Shastra's spatial science and Vedic Astrology's cosmic wisdom
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Vasthu Purusha Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-gold-500/20">
              <h3 className="text-lg font-display font-semibold text-gold-400 mb-4">
                Vasthu Purusha Mandala
              </h3>
              <p className="text-xs text-earth-300 mb-6">
                The cosmic man representing the soul of the building, aligned with the 8 cardinal directions
              </p>
              <div className="flex justify-center">
                <VasthuPurushaGrid size="sm" showLabels={false} interactive />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-earth-300">
                <div className="bg-white/5 rounded-lg p-2">
                  <span className="text-gold-400 font-semibold">81 Padas</span>
                  <p>Sacred grid zones</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <span className="text-gold-400 font-semibold">Brahma Sthana</span>
                  <p>Central sacred space</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Zodiac Wheel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-gold-500/20">
              <h3 className="text-lg font-display font-semibold text-gold-400 mb-4">
                12 Rashis (Zodiac Signs)
              </h3>
              <p className="text-xs text-earth-300 mb-6">
                The celestial wheel governing cosmic influences on architecture and construction timing
              </p>
              <div className="flex justify-center">
                <ZodiacWheel size="sm" interactive showPlanets />
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((symbol, i) => (
                  <span key={i} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-gold-400">
                    {symbol}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Navagraha */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-gold-500/20">
              <h3 className="text-lg font-display font-semibold text-gold-400 mb-4">
                Navagrahas (9 Planets)
              </h3>
              <p className="text-xs text-earth-300 mb-6">
                The nine celestial bodies influencing human life and architectural harmony
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { symbol: '☉', name: 'Surya', color: '#f97316' },
                  { symbol: '☽', name: 'Chandra', color: '#e2e8f0' },
                  { symbol: '♂', name: 'Mangal', color: '#ef4444' },
                  { symbol: '☿', name: 'Budha', color: '#22c55e' },
                  { symbol: '♃', name: 'Guru', color: '#fbbf24' },
                  { symbol: '♀', name: 'Shukra', color: '#ec4899' },
                  { symbol: '♄', name: 'Shani', color: '#60a5fa' },
                  { symbol: '☊', name: 'Rahu', color: '#6366f1' },
                  { symbol: '☋', name: 'Ketu', color: '#78716c' },
                ].map((planet) => (
                  <div
                    key={planet.name}
                    className="bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <span
                      className="text-2xl block group-hover:scale-110 transition-transform"
                      style={{ color: planet.color }}
                    >
                      {planet.symbol}
                    </span>
                    <span className="text-xs text-earth-400">{planet.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ashtadikpalakas info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gold-500/20"
        >
          <h3 className="text-lg font-display font-semibold text-gold-400 text-center mb-6">
            Ashtadikpalakas - The Eight Directional Guardians
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { dir: 'E', name: 'Indra', symbol: '⚡', color: '#f97316' },
              { dir: 'SE', name: 'Agni', symbol: '🔥', color: '#ef4444' },
              { dir: 'S', name: 'Yama', symbol: '⚖️', color: '#22c55e' },
              { dir: 'SW', name: 'Nirrti', symbol: '🌑', color: '#a855f7' },
              { dir: 'W', name: 'Varuna', symbol: '🌊', color: '#06b6d4' },
              { dir: 'NW', name: 'Vayu', symbol: '💨', color: '#94a3b8' },
              { dir: 'N', name: 'Kubera', symbol: '💰', color: '#fbbf24' },
              { dir: 'NE', name: 'Ishana', symbol: '🕉️', color: '#60a5fa' },
            ].map((guardian) => (
              <div
                key={guardian.dir}
                className="text-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-2xl block mb-1">{guardian.symbol}</span>
                <p className="text-sm font-semibold text-white">{guardian.name}</p>
                <p className="text-xs text-earth-400">{guardian.dir}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/about">
            <Button variant="gold" size="lg" rightIcon={<ChevronRight size={18} />}>
              Learn More About Our Approach
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// Quick Access CTA Section
const QuickAccessSection: React.FC = () => {
  const quickActions = [
    {
      title: 'Book Consultation',
      description: 'Schedule a session with our expert',
      icon: MessageCircle,
      link: '/chat',
      color: 'from-saffron-500 to-saffron-600',
    },
    {
      title: 'Drawing Board',
      description: 'Upload and annotate floor plans',
      icon: PenTool,
      link: '/drawing-board',
      color: 'from-astral-500 to-astral-600',
    },
    {
      title: 'Browse Books',
      description: 'Explore our knowledge library',
      icon: BookOpen,
      link: '/books',
      color: 'from-gold-500 to-gold-600',
    },
    {
      title: 'About Expert',
      description: 'Learn about our consultant',
      icon: Award,
      link: '/about',
      color: 'from-earth-500 to-earth-600',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {quickActions.map((action) => (
            <motion.div key={action.title} variants={fadeInUp}>
              <Link to={action.link}>
                <Card
                  padding="none"
                  className="group overflow-hidden border-2 border-earth-200"
                  hoverable
                >
                  <div className={`h-2 bg-gradient-to-r ${action.color}`} />
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-display font-semibold text-astral-500 mb-1 group-hover:text-saffron-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-earth-500">{action.description}</p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Main Home Component
const Home: React.FC = () => {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <FeaturesSection />
      <VasthuAstrologySection />
      <BooksSection />
      <TestimonialsSection />
      <QuickAccessSection />
    </div>
  );
};

export default Home;

