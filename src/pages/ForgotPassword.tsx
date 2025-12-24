import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Compass } from 'lucide-react';
import { Button, Input, Card } from '../components/common';
import { useNotification } from '../contexts/NotificationContext';
import { authApi } from '../utils/api';
import { validators, validateForm } from '../utils/validation';

const ForgotPassword: React.FC = () => {
  const { addNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    const validation = validateForm(
      { email },
      {
        email: [
          (v: string) => validators.required(v, 'Email'),
          validators.email,
        ],
      }
    );

    if (!validation.isValid) {
      setError(validation.errors.email || '');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.forgotPassword(email);
      
      if (response.success) {
        setIsSuccess(true);
        addNotification('success', 'Reset Link Sent', 'Please check your email for password reset instructions.');
      } else {
        setError(response.error || 'Failed to send reset link. Please try again.');
        addNotification('error', 'Error', response.error || 'Failed to send reset link.');
      }
    } catch {
      setError('Something went wrong. Please try again later.');
      addNotification('error', 'Error', 'Something went wrong. Please try again later.');
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
              Check Your Email
            </h2>
            <p className="text-earth-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-earth-500">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-saffron-600 hover:underline font-medium"
                >
                  try again
                </button>
              </p>
              <Link to="/login">
                <Button variant="primary" fullWidth leftIcon={<ArrowLeft size={18} />}>
                  Back to Login
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
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
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-astral-500 to-astral-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Compass className="w-8 h-8 text-gold-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-astral-500">Forgot Password?</h1>
            <p className="text-earth-500 mt-2">Enter your email to receive a reset link</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={error}
              leftIcon={<Mail size={20} />}
              placeholder="your@email.com"
              autoComplete="email"
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
            >
              Send Reset Link
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

export default ForgotPassword;

