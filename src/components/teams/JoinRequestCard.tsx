'use client';

import Link from 'next/link';
import { ITeamJoinRequestWithDetails } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface JoinRequestCardProps {
  request: ITeamJoinRequestWithDetails;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isLoading?: boolean;
  showActions?: boolean;
}

export const JoinRequestCard: React.FC<JoinRequestCardProps> = ({
  request,
  onApprove,
  onReject,
  isLoading = false,
  showActions = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              <Link
                href={`/u/${request.user.username}`}
                className="hover:text-blue-600"
              >
                {request.user.username}
              </Link>
            </CardTitle>
            <CardDescription>
              Requesting to join {request.team.name}
            </CardDescription>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {request.message && (
            <div>
              <p className="text-sm font-medium text-gray-700">Message:</p>
              <p className="text-sm text-gray-600 mt-1">{request.message}</p>
            </div>
          )}

          <div className="text-xs text-gray-400">
            <p>Score: {parseFloat(request.user.score).toFixed(2)}</p>
            <p>Requested: {new Date(request.created_at).toLocaleDateString()}</p>
          </div>

          {showActions && request.status === 'pending' && onApprove && onReject && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => onApprove(request.id)}
                disabled={isLoading}
                className="flex-1"
                size="sm"
              >
                Approve
              </Button>
              <Button
                onClick={() => onReject(request.id)}
                disabled={isLoading}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

