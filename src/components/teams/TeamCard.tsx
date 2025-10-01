'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ITeamWithLeader } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface TeamCardProps {
  team: ITeamWithLeader;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={`/teams/${team.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {team.mark_url ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image
                    src={team.mark_url}
                    alt={team.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {team.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <CardTitle className="text-xl">{team.name}</CardTitle>
                <CardDescription className="text-sm">
                  Leader: {team.leader.username}
                </CardDescription>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(team.status)}`}>
              {team.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {team.bio && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {team.bio}
            </p>
          )}
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <div>
                <span className="text-gray-500">Members:</span>
                <span className="font-semibold ml-1">{team.member_count}</span>
              </div>
              <div>
                <span className="text-gray-500">Score:</span>
                <span className="font-semibold ml-1">{parseFloat(team.score).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

