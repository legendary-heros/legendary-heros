'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, uploadAvatar } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store';
import { IRootState, IProfileForm } from '@/types';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Camera, User, Mail, MessageSquare, Gamepad2, Lock } from 'lucide-react';

export default function ProfileForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isFormLoading, isLoading, error } = useSelector((state: IRootState) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<IProfileForm>({
    username: user?.username || '',
    email: user?.email || '',
    slackname: user?.slackname || '',
    dotaname: user?.dotaname || '',
    bio: user?.bio || '',
    password: '',
    confirmPassword: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar_url || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setValidationError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setValidationError('File size must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValidationError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');

    // Validate passwords if provided
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setValidationError('Passwords do not match');
        return;
      }
      // @ts-ignore
      if (formData.password.length < 6) {
        setValidationError('Password must be at least 6 characters');
        return;
      }
    }

    try {
      let avatarUrl = user?.avatar_url;

      // Upload avatar if a new one was selected
      if (avatarFile) {
        const uploadResult = await dispatch(uploadAvatar(avatarFile)).unwrap();
        avatarUrl = uploadResult.data?.avatar_url;
      }

      // Prepare profile data
      const profileData: any = {
        username: formData.username,
        email: formData.email,
        slackname: formData.slackname || null,
        dotaname: formData.dotaname || null,
        bio: formData.bio || null,
      };

      if (avatarUrl) {
        profileData.avatar_url = avatarUrl;
      }

      if (formData.password) {
        profileData.password = formData.password;
      }

      // Update profile
      await dispatch(updateProfile(profileData)).unwrap();
      
      setSuccessMessage('Profile updated successfully!');
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      setAvatarFile(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to update profile');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload Section */}
      <div className="flex flex-col items-center space-y-4 pb-6 border-b">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-white" />
            )}
          </div>
          <button
            type="button"
            onClick={handleAvatarClick}
            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors"
            disabled={isLoading}
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <p className="text-sm text-gray-500">Click the camera icon to upload a new avatar</p>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Username
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange}
            required
            placeholder="Enter your username"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="Enter your email"
            disabled
          />
        </div>

        {/* Slack Name */}
        <div className="space-y-2">
          <Label htmlFor="slackname" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Slack Name
          </Label>
          <Input
            id="slackname"
            name="slackname"
            type="text"
            value={formData.slackname}
            onChange={handleInputChange}
            placeholder="Enter your Slack name"
          />
        </div>

        {/* Dota Name */}
        <div className="space-y-2">
          <Label htmlFor="dotaname" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            Dota Name
          </Label>
          <Input
            id="dotaname"
            name="dotaname"
            type="text"
            value={formData.dotaname}
            onChange={handleInputChange}
            placeholder="Enter your Dota name"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          placeholder="Tell us about yourself..."
        />
      </div>

      {/* Password Change Section */}
      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold mb-4">Change Password (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              New Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter new password"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm new password"
            />
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      {validationError && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm">
          {validationError}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 text-green-600 px-4 py-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isFormLoading || isLoading}
          className="min-w-[150px]"
        >
          {isFormLoading || isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}