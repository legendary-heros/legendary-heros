'use client';

import Link from 'next/link';
import { ITeamInvitationWithDetails } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface InvitationCardProps {
  invitation: ITeamInvitationWithDetails;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isLoading?: boolean;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  onAccept,
  onReject,
  isLoading = false,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Team Invitation</CardTitle>
        <CardDescription>
          From: {invitation.inviter.username}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Team:</p>
            <Link
              href={`/teams/${invitation.team.slug}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {invitation.team.name}
            </Link>
          </div>
          
          {invitation.team.bio && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {invitation.team.bio}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onAccept(invitation.id)}
              disabled={isLoading}
              className="flex-1"
              size="sm"
            >
              Accept
            </Button>
            <Button
              onClick={() => onReject(invitation.id)}
              disabled={isLoading}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              Reject
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            {new Date(invitation.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

