'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ITeamMemberWithUser, TeamMemberRole } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface MemberCardProps {
  member: ITeamMemberWithUser;
  isLeader?: boolean;
  canManage?: boolean;
  currentUserId?: string;
  onRemove?: (userId: string) => void;
  onChangeRole?: (memberId: string, newRole: TeamMemberRole) => void;
  isLoading?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isLeader = false,
  canManage = false,
  currentUserId,
  onRemove,
  onChangeRole,
  isLoading = false,
}) => {
  const getRoleBadge = (role: string) => {
    const styles = {
      leader: 'bg-purple-100 text-purple-800',
      'Orb Hero': 'bg-orange-100 text-orange-800',
      'King Creep': 'bg-red-100 text-red-800',
      'Bird Buyer': 'bg-green-100 text-green-800',
      'Bounty': 'bg-yellow-100 text-yellow-800',
    };
    return styles[role as keyof typeof styles] || styles.leader;
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      leader: 'Leader',
      'Orb Hero': 'Orb Hero',
      'King Creep': 'King Creep',
      'Bird Buyer': 'Bird Buyer',
      'Bounty': 'Bounty',
    };
    return labels[role as keyof typeof labels] || 'Leader';
  };

  const isSelf = member.user_id === currentUserId;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Link href={`/u/${member.user.username}`}>
            {member.user.avatar_url ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={member.user.avatar_url}
                  alt={member.user.username}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {member.user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/u/${member.user.username}`}
                className="font-medium hover:text-blue-600"
              >
                {member.user.username}
              </Link>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadge(member.role)}`}>
                {getRoleLabel(member.role)}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Score: {parseFloat(member.user.score).toFixed(2)}
            </p>
          </div>

          {canManage && member.role !== 'leader' && (
            <div className="flex gap-2">
              {onChangeRole && !isSelf && (
                <select
                  value={member.role}
                  onChange={(e) => onChangeRole(member.id, e.target.value as TeamMemberRole)}
                  disabled={isLoading}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="Orb Hero">Orb Hero</option>
                  <option value="King Creep">King Creep</option>
                  <option value="Bird Buyer">Bird Buyer</option>
                  <option value="Bounty">Bounty</option>
                </select>
              )}
              {onRemove && (
                <Button
                  onClick={() => onRemove(member.user_id)}
                  disabled={isLoading}
                  variant="secondary"
                  size="sm"
                >
                  {isSelf ? 'Leave' : 'Remove'}
                </Button>
              )}
            </div>
          )}

          {!canManage && member.role === 'leader' && isSelf && onRemove && (
            <p className="text-xs text-gray-500 italic">
              Delete team to leave
            </p>
          )}
        </div>

        {member.user.bio && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {member.user.bio}
          </p>
        )}

        <p className="text-xs text-gray-400 mt-2">
          Joined: {new Date(member.joined_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};

