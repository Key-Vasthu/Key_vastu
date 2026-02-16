import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  FileText,
  BookOpen,
  Bell,
  Clock,
  Upload,
  ChevronRight,
  Star,
  Home,
  Search,
  Building2,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Sparkles,
  ArrowRight,
  MapPin,
  Compass,
  FileCheck,
  MessageSquare,
  Pencil,
  PenTool,
} from 'lucide-react';
import { Button, Card, Badge, Avatar, Loading } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { chatApi, dashboardApi } from '../utils/api';
import { formatDate, cn } from '../utils/helpers';
import type { ChatThread, Activity } from '../types';

// Project type for user workflow
type ProjectType = 'existing' | 'planning' | null;

// Sample project data
const existingHouseData = {
  recentUploads: [
    { id: '1', name: 'Floor_Plan_Ground.pdf', status: 'reviewed', date: '2024-01-15', feedback: 'Vasthu compliant with minor suggestions' },
    { id: '2', name: 'First_Floor_Layout.dwg', status: 'in_review', date: '2024-01-14', feedback: null },
    { id: '3', name: 'Site_Photos.zip', status: 'pending', date: '2024-01-12', feedback: null },
  ],
  stats: {
    uploaded: 8,
    reviewed: 5,
    pending: 3,
  },
  lastConsultation: '2024-01-14',
};

const planToBuyData = {
  savedPlans: [
    { id: '1', name: '3BHK Apartment - Andheri', status: 'analyzed', score: 78, date: '2024-01-15' },
    { id: '2', name: 'Villa Plot - Pune', status: 'pending', score: null, date: '2024-01-13' },
  ],
  stats: {
    analyzed: 3,
    saved: 5,
    reports: 2,
  },
  recommendations: 4,
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Load any necessary data here if needed
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const handleProjectSelect = (type: ProjectType) => {
    if (type === 'existing') {
      window.location.href = '/chat';
    } else if (type === 'planning') {
      window.location.href = '/drawing-board';
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-earth-50 flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-earth-200 flex-shrink-0 hidden lg:block">
        <div className="p-6 border-b border-earth-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron-400 to-gold-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="w-full px-3 py-2 text-sm border border-earth-200 rounded-lg bg-earth-50 text-earth-700"
                placeholder="Your name"
              />
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-earth-700 hover:bg-saffron-50 hover:text-saffron-600 transition-colors font-medium"
          >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/chat"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-earth-700 hover:bg-saffron-50 hover:text-saffron-600 transition-colors"
          >
            <MessageCircle size={20} />
            <span>Chats</span>
          </Link>
          <Link
            to="/cart"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-earth-700 hover:bg-saffron-50 hover:text-saffron-600 transition-colors"
          >
            <BookOpen size={20} />
            <span>Orders</span>
          </Link>
          <Link
            to="/drawing-board"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-earth-700 hover:bg-saffron-50 hover:text-saffron-600 transition-colors"
          >
            <PenTool size={20} />
            <span>Drawing</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold text-astral-500 mb-2">
              Hello {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <div className="h-px bg-earth-200 mb-2"></div>
            <div className="h-px bg-earth-200"></div>
          </motion.div>

          {/* Project Type Selector - Two Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
            {/* Existing House Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProjectSelect('existing')}
              className="cursor-pointer"
            >
              <Card className="relative overflow-hidden border-2 border-transparent hover:border-saffron-400 transition-all duration-300 group h-full">
                <div className="relative p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-saffron-500 to-saffron-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Home className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-display font-bold text-astral-500 mb-3">
                        Existing House
                      </h3>
                      <p className="text-earth-600 mb-4">
                        I already own a property and want to analyze its Vasthu alignment, get remedies, and optimize energy flow.
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          <span>Upload floor plans & building drawings</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          <span>Get detailed Vasthu analysis & remedies</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          <span>Annotate plans on drawing board</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          <span>Live consultation with expert</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <Button variant="ghost" size="sm" className="text-saffron-600 hover:text-saffron-700">
                      Action (Click)
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Plan To Buy Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProjectSelect('planning')}
              className="cursor-pointer"
            >
              <Card className="relative overflow-hidden border-2 border-transparent hover:border-astral-400 transition-all duration-300 group h-full">
                <div className="relative p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-astral-500 to-astral-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Search className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-display font-bold text-astral-500 mb-3">
                        Plan To Buy
                      </h3>
                      <p className="text-earth-600 mb-4">
                        I'm planning to purchase a property and want to evaluate its Vasthu compliance before making a decision.
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          <span>Upload prospective property plans</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          <span>Pre-purchase Vasthu assessment</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          <span>Compare multiple properties</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          <span>Download detailed reports</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <Button variant="ghost" size="sm" className="text-astral-500 hover:text-astral-600">
                      Action (Click)
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
      </div>
    </div>
  );
};

// Helper functions for use in sub-components
const getStatusColor = (status: string) => {
  switch (status) {
    case 'reviewed':
    case 'analyzed':
      return 'success' as const;
    case 'in_review':
      return 'warning' as const;
    case 'pending':
      return 'neutral' as const;
    default:
      return 'neutral' as const;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'reviewed':
    case 'analyzed':
      return <CheckCircle size={14} />;
    case 'in_review':
      return <Clock size={14} />;
    case 'pending':
      return <AlertCircle size={14} />;
    default:
      return null;
  }
};

// Existing House Dashboard Component (kept for potential future use)
interface ExistingHouseDashboardProps {
  data: typeof existingHouseData;
  threads: ChatThread[];
}

const ExistingHouseDashboard: React.FC<ExistingHouseDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Project Header Card */}
      <Card className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <pattern id="existingPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="20" fill="none" stroke="#fff" strokeWidth="1" />
              <circle cx="30" cy="30" r="10" fill="none" stroke="#fff" strokeWidth="0.5" />
            </pattern>
            <rect width="400" height="200" fill="url(#existingPattern)" />
          </svg>
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Home className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">My Existing Property</h2>
              <p className="text-saffron-100">Vasthu analysis and optimization in progress</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{data.stats.uploaded}</p>
              <p className="text-sm text-saffron-100">Uploaded</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{data.stats.reviewed}</p>
              <p className="text-sm text-saffron-100">Reviewed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{data.stats.pending}</p>
              <p className="text-sm text-saffron-100">Pending</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/files">
          <Card hoverable className="text-center py-6 group border-2 border-transparent hover:border-saffron-300">
            <div className="w-14 h-14 bg-saffron-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7 text-saffron-600" />
            </div>
            <h3 className="font-semibold text-earth-800 mb-1">Upload Plans</h3>
            <p className="text-sm text-earth-500">Share floor plans & drawings</p>
          </Card>
        </Link>
        <Link to="/chat">
          <Card hoverable className="text-center py-6 group border-2 border-transparent hover:border-gold-300">
            <div className="w-14 h-14 bg-gold-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-7 h-7 text-gold-600" />
            </div>
            <h3 className="font-semibold text-earth-800 mb-1">Consult Expert</h3>
            <p className="text-sm text-earth-500">Chat with Vasthu consultant</p>
          </Card>
        </Link>
        <Link to="/drawing-board">
          <Card hoverable className="text-center py-6 group border-2 border-transparent hover:border-astral-300">
            <div className="w-14 h-14 bg-astral-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Pencil className="w-7 h-7 text-astral-500" />
            </div>
            <h3 className="font-semibold text-earth-800 mb-1">Drawing Board</h3>
            <p className="text-sm text-earth-500">Annotate & mark plans</p>
          </Card>
        </Link>
        <Link to="/blog">
          <Card hoverable className="text-center py-6 group border-2 border-transparent hover:border-purple-300">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-semibold text-earth-800 mb-1">Blog</h3>
            <p className="text-sm text-earth-500">Latest news & updates</p>
          </Card>
        </Link>
      </div>

      {/* Recent Uploads & Status */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-semibold text-astral-500 flex items-center gap-2">
            <FileText className="text-saffron-500" />
            Recent Uploads & Review Status
          </h3>
          <Link to="/files">
            <Button variant="primary" size="sm" leftIcon={<Upload size={16} />}>
              Upload New
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {data.recentUploads.map((file) => (
            <div key={file.id} className="flex items-center gap-4 p-4 bg-earth-50 rounded-xl">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <FileText className="text-saffron-500" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-earth-800 truncate">{file.name}</h4>
                  <Badge variant={getStatusColor(file.status)} size="sm">
                    {getStatusIcon(file.status)}
                    <span className="ml-1 capitalize">{file.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
                <p className="text-sm text-earth-500">
                  Uploaded on {formatDate(file.date)}
                  {file.feedback && <span className="text-green-600 ml-2">• Feedback available</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {file.feedback && (
                  <Button variant="ghost" size="sm" leftIcon={<Eye size={16} />}>
                    View Feedback
                  </Button>
                )}
                <Link to="/chat">
                  <Button variant="outline" size="sm" leftIcon={<MessageCircle size={16} />}>
                    Discuss
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Plan To Buy Dashboard Component
interface PlanToBuyDashboardProps {
  data: typeof planToBuyData;
  threads: ChatThread[];
}

const PlanToBuyDashboard: React.FC<PlanToBuyDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Project Header Card */}
      <Card className="bg-gradient-to-r from-astral-500 to-astral-600 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <pattern id="planningPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect x="15" y="15" width="30" height="30" fill="none" stroke="#fff" strokeWidth="1" />
              <circle cx="30" cy="30" r="8" fill="none" stroke="#fff" strokeWidth="0.5" />
            </pattern>
            <rect width="400" height="200" fill="url(#planningPattern)" />
          </svg>
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Property Search</h2>
              <p className="text-astral-100">Pre-purchase Vasthu analysis</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{data.stats.analyzed}</p>
              <p className="text-sm text-astral-100">Analyzed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{data.stats.saved}</p>
              <p className="text-sm text-astral-100">Saved</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{data.stats.reports}</p>
              <p className="text-sm text-astral-100">Reports</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/chat">
          <Card hoverable className="text-center py-6 group border-2 border-transparent hover:border-astral-300">
            <div className="w-14 h-14 bg-astral-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7 text-astral-500" />
            </div>
            <h3 className="font-semibold text-earth-800 mb-1">Add Property</h3>
            <p className="text-sm text-earth-500">Upload plan or describe</p>
          </Card>
        </Link>
        <Link to="/chat">
          <Card hoverable className="text-center py-6 group border-2 border-transparent hover:border-gold-300">
            <div className="w-14 h-14 bg-gold-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Compass className="w-7 h-7 text-gold-600" />
            </div>
            <h3 className="font-semibold text-earth-800 mb-1">Get Analysis</h3>
            <p className="text-sm text-earth-500">Pre-purchase Vasthu check</p>
          </Card>
        </Link>
        <Link to="/drawing-board">
          <Card hoverable className="text-center py-6 group border-2 border-transparent hover:border-saffron-300">
            <div className="w-14 h-14 bg-saffron-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Pencil className="w-7 h-7 text-saffron-600" />
            </div>
            <h3 className="font-semibold text-earth-800 mb-1">Annotate Plan</h3>
            <p className="text-sm text-earth-500">Mark & highlight areas</p>
          </Card>
        </Link>
        <Link to="/blog">
          <Card hoverable className="text-center py-6 group border-2 border-transparent hover:border-purple-300">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-semibold text-earth-800 mb-1">Blog</h3>
            <p className="text-sm text-earth-500">Latest news & updates</p>
          </Card>
        </Link>
      </div>

      {/* Saved Properties & Analysis */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-semibold text-astral-500 flex items-center gap-2">
            <Building2 className="text-astral-500" />
            Saved Properties & Analysis
          </h3>
          <Link to="/chat">
            <Button variant="secondary" size="sm" leftIcon={<Search size={16} />}>
              Add Property
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {data.savedPlans.map((plan) => (
            <div key={plan.id} className="flex items-center gap-4 p-4 bg-earth-50 rounded-xl">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <MapPin className="text-astral-500" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-earth-800 truncate">{plan.name}</h4>
                  <Badge variant={plan.status === 'analyzed' ? 'success' : 'warning'} size="sm">
                    {plan.status === 'analyzed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    <span className="ml-1 capitalize">{plan.status}</span>
                  </Badge>
                </div>
                <p className="text-sm text-earth-500">
                  Added on {formatDate(plan.date)}
                  {plan.score && (
                    <span className={cn(
                      'ml-2 font-medium',
                      plan.score >= 70 ? 'text-green-600' : plan.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      • Vasthu Score: {plan.score}/100
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {plan.status === 'analyzed' && (
                  <Button variant="ghost" size="sm" leftIcon={<Download size={16} />}>
                    Report
                  </Button>
                )}
                <Link to="/chat">
                  <Button variant="outline" size="sm" leftIcon={<MessageCircle size={16} />}>
                    Consult
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations Banner */}
        {data.recommendations > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-gold-50 to-saffron-50 border border-gold-200 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
                <Star className="text-gold-600" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-earth-800">Personalized Recommendations</h4>
                <p className="text-sm text-earth-600">
                  Based on your criteria, we have {data.recommendations} Vasthu-compliant properties to suggest.
                </p>
              </div>
              <Button variant="gold" size="sm" rightIcon={<ChevronRight size={16} />}>
                View All
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
