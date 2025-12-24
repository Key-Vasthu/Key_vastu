import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Edit2,
  X,
  CheckCircle,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react';
import { Button, Input, Card, Avatar, Badge } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { authApi } from '../utils/api';
import { validators, validateForm } from '../utils/validation';
import { formatDate } from '../utils/helpers';

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addNotification('error', 'Invalid File', 'Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addNotification('error', 'File Too Large', 'Image must be less than 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadProgress(0);

    try {
      const response = await authApi.uploadProfileImage(file, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success && response.data) {
        addNotification('success', 'Image Uploaded', 'Your profile image has been updated successfully.');
        setPreviewImage(null);
        // Reload to reflect changes
        window.location.reload();
      } else {
        addNotification('error', 'Upload Failed', response.error || 'Failed to upload image.');
      }
    } catch {
      addNotification('error', 'Error', 'Something went wrong. Please try again.');
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-earth-600">Please login to view your profile.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateForm(formData, {
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
    });

    if (!validation.isValid) {
      setErrors(validation.errors as Record<string, string>);
      return;
    }

    setIsSaving(true);

    try {
      // Preserve avatar when updating profile
      const userData = localStorage.getItem('keyvasthu_user');
      const existingAvatar = userData ? JSON.parse(userData).avatar : undefined;
      const response = await authApi.updateProfile(formData.name, formData.email, formData.phone, existingAvatar);
      
      if (response.success) {
        addNotification('success', 'Profile Updated', 'Your profile has been updated successfully.');
        setIsEditing(false);
        // In a real app, you would update the user context here
        window.location.reload(); // Temporary: reload to reflect changes
      } else {
        addNotification('error', 'Update Failed', response.error || 'Failed to update profile.');
        setErrors({ email: response.error || 'Update failed' });
      }
    } catch {
      addNotification('error', 'Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password form
    const validation = validateForm(passwordData, {
      currentPassword: [
        (v: string) => validators.required(v, 'Current password'),
      ],
      newPassword: [
        (v: string) => validators.required(v, 'New password'),
        validators.password,
      ],
      confirmPassword: [
        (v: string) => validators.required(v, 'Confirm password'),
        (v: string) => validators.confirmPassword(passwordData.newPassword, v),
      ],
    });

    if (!validation.isValid) {
      setPasswordErrors(validation.errors as Record<string, string>);
      return;
    }

    setIsSaving(true);

    try {
      const response = await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (response.success) {
        addNotification('success', 'Password Changed', 'Your password has been changed successfully.');
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        addNotification('error', 'Change Failed', response.error || 'Failed to change password.');
        setPasswordErrors({ currentPassword: response.error || 'Invalid current password' });
      }
    } catch {
      addNotification('error', 'Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setErrors({});
    setPasswordErrors({});
    // Reset form data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-earth-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-astral-500 mb-2">Profile Settings</h1>
          <p className="text-earth-600">Manage your account information and preferences</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <div className="mb-4 relative inline-block">
                <Avatar
                  src={previewImage || user.avatar}
                  name={user.name}
                  size="xl"
                  className="mx-auto"
                />
                <button
                  onClick={handleImageClick}
                  className="absolute -bottom-4 -right-2 w-8 h-8 text-saffron-500 hover:text-saffron-600 rounded-full border-2 border-saffron-500 hover:border-saffron-600 flex items-center justify-center transition-all bg-white"
                  aria-label="Change profile image"
                >
                  <Camera size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  aria-label="Upload profile image"
                />
              </div>

              {previewImage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 space-y-2"
                >
                  <div className="relative inline-block">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-saffron-300"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md"
                      aria-label="Remove preview"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  {isUploadingImage ? (
                    <div className="space-y-2">
                      <div className="w-full bg-earth-100 rounded-full h-2">
                        <div
                          className="bg-saffron-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-earth-500">Uploading... {uploadProgress}%</p>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleImageUpload}
                        leftIcon={<Upload size={14} />}
                      >
                        Upload
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        leftIcon={<Trash2 size={14} />}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              <h2 className="text-xl font-display font-semibold text-earth-800 mb-1">
                {user.name}
              </h2>
              <p className="text-earth-500 text-sm mb-3">{user.email}</p>
              <Badge variant="gold" size="sm" className="mb-4">
                {user.role?.toUpperCase() || 'USER'}
              </Badge>
              <div className="space-y-2 text-sm text-earth-600 border-t border-earth-100 pt-4">
                <div className="flex justify-between">
                  <span>Member since:</span>
                  <span className="font-medium">
                    {user.createdAt ? formatDate(user.createdAt, 'short') : 'N/A'}
                  </span>
                </div>
                {user.lastLogin && (
                  <div className="flex justify-between">
                    <span>Last login:</span>
                    <span className="font-medium">
                      {formatDate(user.lastLogin, 'relative')}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-semibold text-astral-500">
                  Personal Information
                </h3>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    leftIcon={<Edit2 size={16} />}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    leftIcon={<X size={16} />}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    leftIcon={<User size={20} />}
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
                    required
                  />

                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSaving}
                      leftIcon={<Save size={18} />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-earth-600">Full Name</label>
                    <p className="text-earth-800 mt-1">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-earth-600">Email Address</label>
                    <p className="text-earth-800 mt-1">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-earth-600">Phone Number</label>
                    <p className="text-earth-800 mt-1">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Change Password */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-semibold text-astral-500">
                  Change Password
                </h3>
                {!isChangingPassword ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChangingPassword(true)}
                    leftIcon={<Lock size={16} />}
                  >
                    Change Password
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    leftIcon={<X size={16} />}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {isChangingPassword ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.currentPassword}
                    leftIcon={<Lock size={20} />}
                    placeholder="••••••••"
                    required
                  />

                  <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.newPassword}
                    leftIcon={<Lock size={20} />}
                    placeholder="••••••••"
                    helperText="Min 8 chars, with uppercase, lowercase & number"
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.confirmPassword}
                    leftIcon={<Lock size={20} />}
                    placeholder="••••••••"
                    required
                  />

                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSaving}
                      leftIcon={<CheckCircle size={18} />}
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-earth-600 text-sm">
                  Click "Change Password" to update your password. Make sure to use a strong password.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

