import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Compass, CheckCircle, ArrowRight, LogIn } from 'lucide-react';
import { Button, Input, Card } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { validators, validateForm } from '../utils/validation';

const Register: React.FC = () => {
  const { register, isLoading } = useAuth();
  const { addNotification } = useNotification();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const rules = {
      name: [
        (v: string) => validators.required(v, 'Name'),
        (v: string) => validators.minLength(v, 2, 'Name'),
      ],
      email: [
        (v: string) => validators.required(v, 'Email'),
        validators.email,
      ],
      phone: [
        (v: string) => validators.required(v, 'Phone'),
        validators.phone,
      ],
    };

    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      setErrors(validation.errors as Record<string, string>);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const rules = {
      password: [
        (v: string) => validators.required(v, 'Password'),
        validators.password,
      ],
      confirmPassword: [
        (v: string) => validators.required(v, 'Confirm password'),
        (v: string) => validators.confirmPassword(formData.password, v),
      ],
    };

    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      setErrors(validation.errors as Record<string, string>);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setIsSubmitting(true);
    
    try {
      const success = await register(formData.email, formData.password, formData.name);
      
      if (success) {
        setIsSuccess(true);
        addNotification('success', 'Registration Successful!', 'Please check your email to verify your account.');
      } else {
        addNotification('error', 'Registration Failed', 'Email may already be in use. Please try again.');
      }
    } catch {
      addNotification('error', 'Error', 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card variant="elevated" padding="lg" className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-astral-500 mb-2">
              Registration Successful!
            </h2>
            <p className="text-earth-600 mb-6">
              We've sent a verification link to <strong>{formData.email}</strong>. 
              Please check your inbox to activate your account.
            </p>
            <div className="space-y-3">
              <Link to="/login">
                <Button variant="primary" fullWidth leftIcon={<LogIn size={18} />}>
                  Go to Login
                </Button>
              </Link>
              <p className="text-sm text-earth-500">
                Didn't receive the email?{' '}
                <button className="text-saffron-600 hover:underline font-medium">
                  Resend verification
                </button>
              </p>
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
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-saffron-100 rounded-full blur-3xl opacity-30" />
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
            <h1 className="text-2xl font-display font-bold text-astral-500">Create Account</h1>
            <p className="text-earth-500 mt-2">Join KeyVasthu for expert consultation</p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
              step >= 1 ? 'bg-saffron-500 text-white' : 'bg-earth-100 text-earth-500'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 rounded ${step >= 2 ? 'bg-saffron-500' : 'bg-earth-200'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
              step >= 2 ? 'bg-saffron-500 text-white' : 'bg-earth-100 text-earth-500'
            }`}>
              2
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  leftIcon={<User size={20} />}
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                />

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
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  leftIcon={<Phone size={20} />}
                  placeholder="9876543210"
                  autoComplete="tel"
                  required
                />

                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleNext}
                  rightIcon={<ArrowRight size={20} />}
                >
                  Continue
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <Input
                  label="Password"
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
                  label="Confirm Password"
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

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 rounded border-earth-300 text-saffron-500 focus:ring-saffron-500"
                  />
                  <span className="text-sm text-earth-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-saffron-600 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-saffron-600 hover:underline">Privacy Policy</Link>
                  </span>
                </label>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting || isLoading}
                    className="flex-1"
                  >
                    Create Account
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          {/* Sign in link */}
          <p className="text-center mt-6 text-earth-600">
            Already have an account?{' '}
            <Link to="/login" className="text-saffron-600 hover:text-saffron-700 font-semibold inline-flex items-center gap-1">
              <LogIn size={16} />
              Sign In
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;

