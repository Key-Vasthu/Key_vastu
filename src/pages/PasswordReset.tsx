import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Compass, ArrowLeft } from 'lucide-react';
import { Button, Input, Card } from '../components/common';
import { useNotification } from '../contexts/NotificationContext';
import { authApi } from '../utils/api';
import { validators, validateForm } from '../utils/validation';

const PasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      addNotification('error', 'Invalid Link', 'Password reset link is invalid or expired.');
      navigate('/forgot-password');
    } else {
      setToken(resetToken);
    }
  }, [searchParams, navigate, addNotification]);

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
    const validation = validateForm(formData, {
      password: [
        (v: string) => validators.required(v, 'Password'),
        validators.password,
      ],
      confirmPassword: [
        (v: string) => validators.required(v, 'Confirm password'),
        (v: string) => validators.confirmPassword(formData.password, v),
      ],
    });

    if (!validation.isValid) {
      setErrors(validation.errors as Record<string, string>);
      return;
    }

    if (!token) {
      addNotification('error', 'Invalid Token', 'Reset token is missing.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.resetPassword(token, formData.password);
      
      if (response.success) {
        setIsSuccess(true);
        addNotification('success', 'Password Reset', 'Your password has been reset successfully.');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        addNotification('error', 'Reset Failed', response.error || 'Failed to reset password. The link may have expired.');
        setErrors({ password: response.error || 'Failed to reset password' });
      }
    } catch {
      addNotification('error', 'Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card variant="elevated" padding="lg" className="text-center shadow-xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-astral-500 mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-earth-600 mb-6">
              Your password has been reset successfully. You can now login with your new password.
            </p>
            <Link to="/login">
              <Button variant="primary" fullWidth leftIcon={<ArrowLeft size={18} />}>
                Go to Login
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect in useEffect
  }

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
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-saffron-500 to-gold-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Compass className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-astral-500">Reset Password</h1>
            <p className="text-earth-500 mt-2">Enter your new password</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock size={20} />}
              placeholder="••••••••"
              helperText="Min 8 chars, with uppercase, lowercase & number"
              autoComplete="new-password"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              leftIcon={<Lock size={20} />}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
            >
              Reset Password
            </Button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-saffron-600 hover:text-saffron-700 font-medium"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PasswordReset;

