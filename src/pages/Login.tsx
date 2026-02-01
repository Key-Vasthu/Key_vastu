import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, LogIn, UserPlus, Compass } from 'lucide-react';
import { Button, Input, Card } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { validators, validateForm } from '../utils/validation';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginAsGuest, isLoading } = useAuth();
  const { addNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationRules = {
      email: [
        (v: string) => validators.required(v, 'Email'),
        validators.email,
      ],
      password: [
        (v: string) => validators.required(v, 'Password'),
      ],
    };

    const validation = validateForm(formData, validationRules);
    if (!validation.isValid) {
      setErrors(validation.errors as Record<string, string>);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        // Get user from localStorage to check role
        const userData = localStorage.getItem('keyvasthu_user');
        const user = userData ? JSON.parse(userData) : null;
        
        // Redirect admin to admin dashboard, others to regular dashboard
        // Check role from database (user.role === 'admin')
        if (user && user.role === 'admin') {
          addNotification('success', 'Welcome Admin!', 'You have successfully logged in as administrator.');
          navigate('/admin');
        } else {
          addNotification('success', 'Welcome back!', 'You have successfully logged in.');
          navigate('/dashboard');
        }
      } else {
        addNotification('error', 'Login failed', 'Invalid email or password. Please try again.');
      }
    } catch {
      addNotification('error', 'Error', 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    addNotification('info', 'Guest Mode', 'You are browsing as a guest. Some features are limited.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cream-50 via-white to-earth-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-saffron-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-100 rounded-full blur-3xl opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card variant="elevated" padding="lg" className="shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-astral-500 to-astral-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Compass className="w-8 h-8 text-gold-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-astral-500">Welcome Back</h1>
            <p className="text-earth-500 mt-2">Sign in to continue your journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={20} />}
              placeholder="your@email.com"
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock size={20} />}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-earth-300 text-saffron-500 focus:ring-saffron-500"
                />
                <span className="text-earth-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-saffron-600 hover:text-saffron-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isSubmitting || isLoading}
              leftIcon={<LogIn size={20} />}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-earth-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-earth-500">or continue with</span>
            </div>
          </div>

          {/* Guest Mode */}
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleGuestLogin}
            leftIcon={<Eye size={20} />}
          >
            Continue as Guest
          </Button>

          {/* Sign up link */}
          <p className="text-center mt-6 text-earth-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-saffron-600 hover:text-saffron-700 font-semibold inline-flex items-center gap-1">
              <UserPlus size={16} />
              Create Account
            </Link>
          </p>
        </Card>

        {/* Demo credentials hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-gold-50 border border-gold-200 rounded-xl text-center"
        >
          <p className="text-sm text-earth-600">
            <strong className="text-gold-700">Demo Mode:</strong> Use any email to login. 
            Add "admin" in email for admin access.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;

