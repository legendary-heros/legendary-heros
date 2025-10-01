'use client';

import { useState, FormEvent } from 'react';
import { ITeamWithLeader } from '@/types';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import ImageUpload from '@/components/ui/ImageUpload';
import { Shield, Image as ImageIcon } from 'lucide-react';

interface TeamFormProps {
  team?: ITeamWithLeader | null;
  onSubmit: (data: {
    name: string;
    bio?: string;
    mark_url?: string;
    ad_url?: string;
    markFile?: File | null;
    adFile?: File | null;
  }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const TeamForm: React.FC<TeamFormProps> = ({
  team,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: team?.name || '',
    bio: team?.bio || '',
    mark_url: team?.mark_url || '',
    ad_url: team?.ad_url || '',
  });

  const [markFile, setMarkFile] = useState<File | null>(null);
  const [adFile, setAdFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Team name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Team name must be less than 50 characters';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      name: formData.name.trim(),
      bio: formData.bio.trim() || undefined,
      mark_url: formData.mark_url.trim() || undefined,
      ad_url: formData.ad_url.trim() || undefined,
      markFile,
      adFile,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">
          Team Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter team name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="bio">Team Bio</Label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about your team..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          disabled={isLoading}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          {formData.bio.length}/500 characters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ImageUpload
            currentImage={formData.mark_url}
            onImageChange={(file, preview) => {
              setMarkFile(file);
              if (file) {
                setFormData({ ...formData, mark_url: preview });
              }
            }}
            onImageRemove={() => {
              setMarkFile(null);
              setFormData({ ...formData, mark_url: '' });
            }}
            disabled={isLoading}
            maxSize={1}
            size="md"
            shape="square"
            label="Team Mark (Small Logo)"
            description="Upload your team's small logo/mark"
            placeholder={<Shield className="w-8 h-8 text-gray-500" />}
          />
        </div>

        <div>
          <ImageUpload
            currentImage={formData.ad_url}
            onImageChange={(file, preview) => {
              setAdFile(file);
              if (file) {
                setFormData({ ...formData, ad_url: preview });
              }
            }}
            onImageRemove={() => {
              setAdFile(null);
              setFormData({ ...formData, ad_url: '' });
            }}
            disabled={isLoading}
            maxSize={1}
            size="md"
            shape="square"
            label="Team Ad (Large Banner)"
            description="Upload your team's large banner/advertisement image"
            placeholder={<ImageIcon className="w-8 h-8 text-gray-500" />}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : team ? 'Update Team' : 'Create Team'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            variant="secondary"
          >
            Cancel
          </Button>
        )}
      </div>

      {!team && (
        <p className="text-sm text-gray-500 text-center">
          Your team will be pending admin approval after creation.
        </p>
      )}
    </form>
  );
};

