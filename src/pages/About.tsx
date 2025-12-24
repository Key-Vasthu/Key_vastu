import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  Star,
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Youtube,
  Twitter,
  ChevronRight,
  Compass,
  GraduationCap,
  Sparkles,
  User,
} from 'lucide-react';
import { Button, Card, Badge } from '../components/common';
import { AshtadikpalakasDisplay, ZodiacWheel } from '../components/vasthu';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const About: React.FC = () => {
  const [hoveredZodiacSign, setHoveredZodiacSign] = useState<{
    name: string;
    sanskrit: string;
    symbol: string;
    element: string;
    ruler: string;
    color: string;
  } | null>(null);

  const consultant = {
    name: 'Dr. Arun Sharma',
    title: 'Vasthu Shastra & Jyotish Expert',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: `With over 25 years of experience in Vasthu Shastra and Vedic Astrology, Dr. Arun Sharma has 
    helped thousands of individuals and businesses harmonize their spaces with cosmic energies. 
    His unique approach combines ancient Vasthu principles with modern architectural understanding, 
    making traditional wisdom accessible for contemporary living.`,
    expertise: [
      'Residential Vasthu',
      'Commercial Vasthu',
      'Industrial Vasthu',
      'Vedic Astrology',
      'Muhurta Selection',
      'Remedial Vasthu',
      'Temple Architecture',
      'Feng Shui Integration',
    ],
    stats: {
      experience: 25,
      projects: 5000,
      books: 15,
      students: 2000,
    },
    certifications: [
      'PhD in Vasthu Shastra - BHU',
      'Certified Jyotish Acharya',
      'Member - Indian Council of Astrological Sciences',
      'Honorary Consultant - CREDAI',
    ],
    socialLinks: {
      website: 'https://keyvasthu.com',
      linkedin: '#',
      youtube: '#',
      twitter: '#',
    },
  };

  const timeline = [
    { year: '1999', title: 'Started Practice', description: 'Began professional Vasthu consultation after completing PhD.' },
    { year: '2005', title: 'First Book Published', description: '"Complete Guide to Vasthu Shastra" became a bestseller.' },
    { year: '2010', title: 'International Recognition', description: 'Invited as keynote speaker at World Vasthu Conference, Singapore.' },
    { year: '2015', title: 'Online Consultation', description: 'Launched digital platform for worldwide consultations.' },
    { year: '2020', title: 'KeyVasthu Founded', description: 'Established comprehensive platform for Vasthu and Astrology services.' },
    { year: '2024', title: '5000+ Projects', description: 'Milestone of 5000+ successful project consultations achieved.' },
  ];

  const projects = [
    { id: '1', title: 'Vasthu Temple Complex', location: 'Gujarat', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400', category: 'Temple' },
    { id: '2', title: 'Corporate Headquarters', location: 'Mumbai', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400', category: 'Commercial' },
    { id: '3', title: 'Luxury Villa', location: 'Bangalore', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', category: 'Residential' },
    { id: '4', title: 'Shopping Mall', location: 'Delhi', image: 'https://images.unsplash.com/photo-1519566335946-e6f65f0f4fdf?w=400', category: 'Commercial' },
  ];

  const books = [
    { title: 'Complete Guide to Vasthu Shastra', year: 2005 },
    { title: 'Vasthu for Commercial Spaces', year: 2008 },
    { title: 'Astrology for Architecture', year: 2012 },
    { title: 'Remedial Vasthu', year: 2016 },
    { title: 'Modern Vasthu Principles', year: 2020 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-earth-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-astral-800 to-astral-900">
          {/* Decorative mandala */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <pattern id="aboutMandala" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#d4a418" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#d4a418" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="#d4a418" strokeWidth="0.5" />
              </pattern>
              <rect width="400" height="400" fill="url(#aboutMandala)" />
            </svg>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Image - To be added in future */}
            <motion.div variants={fadeInUp} className="order-2 lg:order-1">
              <Card className="w-full max-w-md mx-auto aspect-[3/4] flex items-center justify-center border-2 border-dashed border-earth-300 bg-earth-50">
                <div className="text-center text-earth-400">
                  <div className="w-16 h-16 mx-auto mb-3 bg-earth-200 rounded-full flex items-center justify-center">
                    <User size={32} className="text-earth-400" />
                  </div>
                  <p className="text-sm font-medium">Profile Photo</p>
                  <p className="text-xs mt-1">To be added</p>
                </div>
              </Card>
            </motion.div>

            {/* Content */}
            <motion.div variants={fadeInUp} className="order-1 lg:order-2 text-white">
              <Badge variant="gold" className="mb-4">
                <Compass size={14} className="mr-1.5" />
                About the Expert
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                {consultant.name}
              </h1>
              <p className="text-xl text-gold-400 font-accent mb-6">{consultant.title}</p>
              <p className="text-lg text-earth-200 mb-8 leading-relaxed">
                {consultant.bio}
              </p>
              
              {/* Quick stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gold-400">{consultant.stats.experience}+</p>
                  <p className="text-sm text-earth-300">Years</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gold-400">{consultant.stats.projects}+</p>
                  <p className="text-sm text-earth-300">Projects</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gold-400">{consultant.stats.books}</p>
                  <p className="text-sm text-earth-300">Books</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gold-400">{consultant.stats.students}+</p>
                  <p className="text-sm text-earth-300">Students</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/chat">
                  <Button variant="gold" size="lg" rightIcon={<ChevronRight size={18} />}>
                    Book Consultation
                  </Button>
                </Link>
                <Link to="/books">
                  <Button variant="outline" size="lg" className="!border-white/30 !text-white hover:!bg-white/10">
                    <BookOpen size={18} className="mr-2" />
                    View Books
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.div variants={fadeInUp} className="divider-ornate mb-6">
              <Award className="text-gold-500" />
            </motion.div>
            <motion.h2 variants={fadeInUp} className="section-title mb-4">
              Areas of Expertise
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {consultant.expertise.map((skill) => (
              <motion.div key={skill} variants={fadeInUp}>
                <Card className="text-center py-6 hover:shadow-gold transition-shadow">
                  <Star className="w-8 h-8 text-gold-500 mx-auto mb-3" />
                  <p className="font-medium text-earth-800">{skill}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <div className="divider-ornate mb-6">
                <GraduationCap className="text-gold-500" />
              </div>
              <h2 className="section-title mb-4">Certifications & Memberships</h2>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto"
            >
              {consultant.certifications.map((cert) => (
                <motion.div
                  key={cert}
                  variants={fadeInUp}
                  className="flex items-center gap-4 p-4 bg-earth-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="text-gold-600" size={20} />
                  </div>
                  <p className="font-medium text-earth-800">{cert}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gradient-to-br from-astral-50 to-earth-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <div className="divider-ornate mb-6">
                <Calendar className="text-gold-500" />
              </div>
              <h2 className="section-title mb-4">Journey & Milestones</h2>
            </motion.div>

            <div className="relative">
              {timeline.map((item) => (
                <motion.div
                  key={item.year}
                  variants={fadeInUp}
                  className="relative flex gap-6 mb-8 last:mb-0"
                >
                  <div className="w-16 flex-shrink-0 text-right">
                    <span className="font-bold text-gold-600">{item.year}</span>
                  </div>
                  <div className="w-4 h-4 bg-gold-500 rounded-full mt-1 flex-shrink-0 relative z-10 ring-4 ring-gold-100" />
                  <Card className="flex-1">
                    <h3 className="font-display font-semibold text-astral-500 mb-1">{item.title}</h3>
                    <p className="text-earth-600">{item.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Gallery */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <div className="divider-ornate mb-6">
                <Building2 className="text-gold-500" />
              </div>
              <h2 className="section-title mb-4">Featured Projects</h2>
              <p className="section-subtitle">A glimpse of our successful Vasthu implementations</p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {projects.map((project) => (
                <motion.div key={project.id} variants={fadeInUp}>
                  <Card padding="none" className="group overflow-hidden">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-astral-900/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <Badge variant="gold" size="sm" className="mb-2">{project.category}</Badge>
                        <h3 className="font-display font-semibold">{project.title}</h3>
                        <p className="text-sm text-earth-300 flex items-center gap-1">
                          <MapPin size={12} /> {project.location}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Published Books */}
      <section className="py-20 bg-gradient-to-br from-earth-50 to-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <div className="divider-ornate mb-6">
                <BookOpen className="text-gold-500" />
              </div>
              <h2 className="section-title mb-4">Published Works</h2>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              {books.map((book) => (
                <motion.div key={book.title} variants={fadeInUp} className="h-full">
                  <Link to="/books" className="block h-full">
                    <Card className="text-center py-6 hover:shadow-gold group h-full flex flex-col justify-between min-h-[180px]">
                      <div>
                        <BookOpen className="w-10 h-10 text-gold-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-medium text-earth-800 mb-1 line-clamp-2 group-hover:text-saffron-600 transition-colors">
                          {book.title}
                        </h3>
                      </div>
                      <p className="text-sm text-earth-500 mt-2">{book.year}</p>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center mt-8">
              <Link to="/books">
                <Button variant="primary" rightIcon={<ChevronRight size={18} />}>
                  Browse All Books
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Vasthu & Astrology Philosophy Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <div className="divider-ornate mb-6">
                <Sparkles className="text-gold-500" />
              </div>
              <h2 className="section-title mb-4">Our Approach to Vasthu & Astrology</h2>
              <p className="section-subtitle">
                We integrate ancient Vedic sciences with modern architectural understanding
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Ashtadikpalakas */}
              <motion.div variants={fadeInUp}>
                <Card className="p-6 group hover:shadow-xl hover:shadow-gold-200/50 hover:border-gold-300 transition-all duration-300">
                  <h3 className="text-xl font-display font-semibold text-astral-500 mb-4 text-center group-hover:text-gold-600 transition-colors">
                    Ashtadikpalakas - Directional Guardians
                  </h3>
                  <p className="text-earth-600 text-center mb-6 group-hover:text-earth-700 transition-colors">
                    Click on any guardian to learn about their influence on your space
                  </p>
                  <div className="flex justify-center">
                    <AshtadikpalakasDisplay size="sm" interactive />
                  </div>
                </Card>
              </motion.div>

              {/* Zodiac Wheel */}
              <motion.div variants={fadeInUp} className="relative">
                <Card className="p-6 group hover:shadow-xl hover:shadow-gold-200/50 hover:border-gold-300 transition-all duration-300">
                  <h3 className="text-xl font-display font-semibold text-astral-500 mb-4 text-center group-hover:text-gold-600 transition-colors">
                    Jyotish - Vedic Astrology
                  </h3>
                  <p className="text-earth-600 text-center mb-6 group-hover:text-earth-700 transition-colors">
                    Hover over zodiac signs to explore their characteristics
                  </p>
                  <div className="flex justify-center">
                    <ZodiacWheel 
                      size="md" 
                      interactive 
                      showPlanets 
                      onSignHover={setHoveredZodiacSign}
                      hideTooltip={true}
                    />
                  </div>
                </Card>
                
                {/* Small Hover Card Tooltip */}
                <AnimatePresence>
                  {hoveredZodiacSign && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl border border-earth-200 p-4 min-w-[200px]"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="text-3xl"
                          style={{ color: hoveredZodiacSign.color }}
                        >
                          {hoveredZodiacSign.symbol}
                        </span>
                        <div>
                          <h4 className="font-display font-semibold text-astral-500 text-base">
                            {hoveredZodiacSign.name}
                          </h4>
                          <p className="text-sm text-saffron-600 font-medium">{hoveredZodiacSign.sanskrit}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-earth-100 text-xs">
                        <div>
                          <span className="text-earth-400">Element:</span>
                          <span className="ml-1 text-earth-700 font-medium">{hoveredZodiacSign.element}</span>
                        </div>
                        <div>
                          <span className="text-earth-400">Ruler:</span>
                          <span className="ml-1 text-earth-700 font-medium">{hoveredZodiacSign.ruler}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Philosophy text */}
            <motion.div variants={fadeInUp} className="mt-12 max-w-4xl mx-auto">
              <Card className="bg-gradient-to-r from-gold-50 to-saffron-50 border-2 border-gold-200">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">🙏</span>
                  <blockquote className="text-lg text-earth-700 italic font-accent mb-4">
                    "वास्तु शास्त्रं प्रवक्ष्यामि यथोक्तं विश्वकर्मणा"
                  </blockquote>
                  <p className="text-earth-600">
                    "I shall explain Vasthu Shastra as expounded by Vishwakarma"
                  </p>
                  <p className="text-sm text-earth-500 mt-4">
                    Our practice combines the eternal wisdom of Vasthu Purusha Mandala with practical modern construction,
                    ensuring your spaces resonate with positive cosmic energies while meeting contemporary lifestyle needs.
                  </p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-astral-800 to-astral-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Get in Touch
              </h2>
              <p className="text-xl text-earth-200 mb-8">
                Ready to transform your space? Let's discuss your project.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-3 gap-6 mb-8"
            >
              <motion.a
                variants={fadeInUp}
                href="mailto:contact@keyvasthu.com"
                className="flex flex-col items-center gap-3 p-6 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <Mail className="text-gold-400" size={28} />
                <span>contact@keyvasthu.com</span>
              </motion.a>
              <motion.a
                variants={fadeInUp}
                href="tel:+919876543210"
                className="flex flex-col items-center gap-3 p-6 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <Phone className="text-gold-400" size={28} />
                <span>+91 98765 43210</span>
              </motion.a>
              <motion.a
                variants={fadeInUp}
                href={consultant.socialLinks.website}
                className="flex flex-col items-center gap-3 p-6 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <Globe className="text-gold-400" size={28} />
                <span>keyvasthu.com</span>
              </motion.a>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex justify-center gap-4">
              {[
                { icon: Linkedin, href: consultant.socialLinks.linkedin, label: 'LinkedIn' },
                { icon: Youtube, href: consultant.socialLinks.youtube, label: 'YouTube' },
                { icon: Twitter, href: consultant.socialLinks.twitter, label: 'Twitter' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-12 h-12 bg-white/10 hover:bg-gold-500 rounded-full flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={22} />
                </a>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-12">
              <Link to="/chat">
                <Button variant="gold" size="lg" rightIcon={<ChevronRight size={20} />}>
                  Start Your Consultation
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;

