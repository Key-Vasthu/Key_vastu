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
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectType>(null);
  const [showProjectSelector, setShowProjectSelector] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [threadsRes, activitiesRes] = await Promise.all([
        chatApi.getThreads(),
        dashboardApi.getRecentActivity(),
      ]);
      
      if (threadsRes.success && threadsRes.data) {
        setThreads(threadsRes.data);
      }
      if (activitiesRes.success && activitiesRes.data) {
        setActivities(activitiesRes.data);
      }
      setIsLoading(false);
    };
    
    loadData();

    // Check if user has a saved preference
    const savedProject = localStorage.getItem('keyvasthu_project_type');
    if (savedProject) {
      setSelectedProject(savedProject as ProjectType);
      setShowProjectSelector(false);
    }
  }, []);

  const handleProjectSelect = (type: ProjectType) => {
    setSelectedProject(type);
    setShowProjectSelector(false);
    if (type) {
      localStorage.setItem('keyvasthu_project_type', type);
    }
  };

  const handleChangeProject = () => {
    setShowProjectSelector(true);
    setSelectedProject(null);
    localStorage.removeItem('keyvasthu_project_type');
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-earth-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-astral-500">
                Namaste, {user?.name?.split(' ')[0]}! 🙏
              </h1>
              <p className="text-earth-600 mt-1">
                {showProjectSelector 
                  ? "Let's begin your Vasthu journey. What would you like to explore?"
                  : selectedProject === 'existing'
                    ? "Managing your existing property's Vasthu alignment"
                    : "Exploring Vasthu for your future property"
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!showProjectSelector && (
                <Button variant="ghost" size="sm" onClick={handleChangeProject}>
                  Switch Project Type
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Project Type Selector */}
        <AnimatePresence mode="wait">
          {showProjectSelector ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-100 text-gold-700 rounded-full text-sm font-medium mb-4">
                  <Sparkles size={16} />
                  Choose Your Path
                </div>
                <h2 className="text-2xl font-display font-semibold text-astral-500">
                  What brings you to KeyVasthu today?
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Existing House Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProjectSelect('existing')}
                  className="cursor-pointer"
                >
                  <Card className="relative overflow-hidden border-2 border-transparent hover:border-saffron-400 transition-all duration-300 group">
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-saffron-100 to-saffron-50 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-gold-100 to-transparent rounded-full -ml-16 -mb-16 opacity-50" />
                    
                    <div className="relative p-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-saffron-500 to-saffron-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                        <Home className="w-10 h-10 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-display font-bold text-astral-500 mb-3">
                        Existing House
                      </h3>
                      <p className="text-earth-600 mb-6">
                        I already own a property and want to analyze its Vasthu alignment, get remedies, and optimize energy flow.
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          Upload floor plans & building drawings
                        </div>
                        <div className="flex items-center gap-3 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          Get detailed Vasthu analysis & remedies
                        </div>
                        <div className="flex items-center gap-3 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          Annotate plans on drawing board
                        </div>
                        <div className="flex items-center gap-3 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          Live consultation with expert
                        </div>
                      </div>

                      <div className="flex items-center text-saffron-600 font-medium group-hover:gap-3 gap-2 transition-all">
                        Get Started <ArrowRight size={18} />
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
                  <Card className="relative overflow-hidden border-2 border-transparent hover:border-astral-400 transition-all duration-300 group">
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-astral-100 to-astral-50 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-gold-100 to-transparent rounded-full -ml-16 -mb-16 opacity-50" />
                    
                    <div className="relative p-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-astral-500 to-astral-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                        <Search className="w-10 h-10 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-display font-bold text-astral-500 mb-3">
                        Plan To Buy
                      </h3>
                      <p className="text-earth-600 mb-6">
                        I'm planning to purchase a property and want to evaluate its Vasthu compliance before making a decision.
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          Upload prospective property plans
                        </div>
                        <div className="flex items-center gap-3 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          Pre-purchase Vasthu assessment
                        </div>
                        <div className="flex items-center gap-3 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          Compare multiple properties
                        </div>
                        <div className="flex items-center gap-3 text-sm text-earth-600">
                          <CheckCircle size={16} className="text-green-500" />
                          Download detailed reports
                        </div>
                      </div>

                      <div className="flex items-center text-astral-500 font-medium group-hover:gap-3 gap-2 transition-all">
                        Get Started <ArrowRight size={18} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Selected Project Dashboard */}
              {selectedProject === 'existing' ? (
                <ExistingHouseDashboard data={existingHouseData} threads={threads} />
              ) : (
                <PlanToBuyDashboard data={planToBuyData} threads={threads} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Section - Always visible */}
        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          {/* Active Chats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold text-astral-500 flex items-center gap-2">
                  <MessageCircle className="text-saffron-500" />
                  Active Consultations
                </h2>
                <Link to="/chat">
                  <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={16} />}>
                    View All
                  </Button>
                </Link>
              </div>

              {threads.length > 0 ? (
                <div className="space-y-3">
                  {threads.slice(0, 3).map((thread) => (
                    <Link key={thread.id} to={`/chat?thread=${thread.id}`}>
                      <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-earth-50 transition-colors group">
                        <Avatar
                          src={thread.participantAvatar}
                          name={thread.participantName}
                          showOnlineStatus
                          isOnline={thread.isOnline}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-earth-800 group-hover:text-saffron-600 transition-colors">
                              {thread.participantName}
                            </h3>
                            <span className="text-xs text-earth-500">{thread.lastMessageTime}</span>
                          </div>
                          <p className="text-sm text-earth-500 truncate">{thread.lastMessage}</p>
                        </div>
                        {thread.unreadCount > 0 && (
                          <span className="w-6 h-6 bg-saffron-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-earth-300 mx-auto mb-3" />
                  <p className="text-earth-500">No active consultations</p>
                  <Link to="/chat" className="mt-3 inline-block">
                    <Button variant="primary" size="sm">Start Consultation</Button>
                  </Link>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Notifications / Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold text-astral-500 flex items-center gap-2">
                  <Bell className="text-saffron-500" />
                  Notifications
                </h2>
              </div>

              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-saffron-100 flex items-center justify-center flex-shrink-0">
                      {activity.type === 'message' && <MessageCircle size={16} className="text-saffron-600" />}
                      {activity.type === 'upload' && <Upload size={16} className="text-gold-600" />}
                      {activity.type === 'order' && <BookOpen size={16} className="text-astral-500" />}
                      {activity.type === 'review' && <FileCheck size={16} className="text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-earth-700">{activity.description}</p>
                      <p className="text-xs text-earth-500 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {formatDate(activity.timestamp, 'relative')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Existing House Dashboard Component
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
      <div className="grid sm:grid-cols-3 gap-4">
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
      <div className="grid sm:grid-cols-3 gap-4">
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

// Helper functions defined at component level for use in sub-components
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

export default Dashboard;
