'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, User, Camera } from 'lucide-react';

interface EditProfileFormProps {
  user: {
    displayName: string | null;
    bio: string;
    avatarUrl: string | null;
  };
  onSave: (data: { displayName: string; bio: string; avatarUrl: string }) => void;
  isSaving?: boolean;
  className?: string;
}

export function EditProfileForm({ user, onSave, isSaving = false, className }: EditProfileFormProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ displayName, bio, avatarUrl });
  };

  const hasChanges = displayName !== (user.displayName || '') || bio !== (user.bio || '') || avatarUrl !== (user.avatarUrl || '');

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-5', className)}>
      {/* Avatar URL */}
      <div className="space-y-2">
        <Label className="text-xs text-arena-text-muted uppercase tracking-wide font-medium">
          Avatar URL
        </Label>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-arena-surface border border-arena-border shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-full h-full object-cover"
                onError={() => setAvatarUrl('')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-arena-text-muted" />
              </div>
            )}
          </div>
          <Input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.png"
            className="flex-1 bg-arena-surface border-arena-border rounded-xl text-sm text-arena-text-primary placeholder:text-arena-text-muted focus:border-arena-accent focus:ring-arena-accent/20"
          />
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label className="text-xs text-arena-text-muted uppercase tracking-wide font-medium">
          Display Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena-text-muted" />
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter display name"
            maxLength={30}
            className="pl-9 bg-arena-surface border-arena-border rounded-xl text-sm text-arena-text-primary placeholder:text-arena-text-muted focus:border-arena-accent focus:ring-arena-accent/20"
          />
        </div>
        <p className="text-[10px] text-arena-text-muted">{displayName.length}/30 characters</p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label className="text-xs text-arena-text-muted uppercase tracking-wide font-medium">
          Bio
        </Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          maxLength={200}
          rows={3}
          className="bg-arena-surface border-arena-border rounded-xl text-sm text-arena-text-primary placeholder:text-arena-text-muted focus:border-arena-accent focus:ring-arena-accent/20 resize-none"
        />
        <p className="text-[10px] text-arena-text-muted">{bio.length}/200 characters</p>
      </div>

      {/* Save */}
      <Button
        type="submit"
        disabled={isSaving || !hasChanges}
        className="w-full bg-arena-accent hover:bg-arena-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl h-11 gap-2"
      >
        <Save className="w-4 h-4" />
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
