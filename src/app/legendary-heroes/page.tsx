'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IRootState, IUserWithTeam, UserStatus, UserRole, TeamMemberRole } from '@/types';
import { getUserLevel, getTeamLevel } from '@/utils/levelUtils';
import { StarRating } from '@/components/ui/StarRating';
import { 
  getUsers, 
  updateUserStatus, 
  updateUserScore, 
  updateUserRole, 
  deleteUser as deleteUserAction,
  clearError,
  resetUsers
} from '@/store/slices/usersSlice';
import { AppDispatch } from '@/store';

interface UserWithActions extends IUserWithTeam {}

interface PendingChanges {
  status?: UserStatus;
  score?: string;
  role?: UserRole;
}

export default function LegendaryHeroesPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser, isAuthenticated } = useSelector((state: IRootState) => state.auth);
  const { users, loading, loadingMore, hasMore, total, error } = useSelector((state: IRootState) => state.users);
  
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [teamRoleFilter, setTeamRoleFilter] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, PendingChanges>>({});
  
  const limit = 20;
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, dispatch]);

  // Load initial users and handle filter changes
  useEffect(() => {
    dispatch(getUsers({
      page: 1,
      limit,
      search: searchTerm,
      status: statusFilter,
      role: roleFilter,
      team: teamFilter,
      teamRole: teamRoleFilter,
      sortBy: 'score',
      append: false
    }));
  }, [dispatch, searchTerm, statusFilter, roleFilter, teamFilter, teamRoleFilter]);

  // Infinite scroll observer
  const lastUserElementCallback = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        const currentPage = Math.ceil(users.length / limit) + 1;
        dispatch(getUsers({
          page: currentPage,
          limit,
          search: searchTerm,
          status: statusFilter,
          role: roleFilter,
          team: teamFilter,
          teamRole: teamRoleFilter,
          sortBy: 'score',
          append: true
        }));
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, users.length, limit, dispatch, searchTerm, statusFilter, roleFilter, teamFilter, teamRoleFilter]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case 'allow': return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'block': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'member': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTeamRoleBadgeColor = (role: TeamMemberRole) => {
    switch (role) {
      case 'leader': return 'bg-red-100 text-red-800 border-red-200';
      case 'Orb Hero': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'King Creep': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Bird Buyer': return 'bg-green-100 text-green-800 border-green-200';
      case 'Bounty': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleUserClick = (username: string) => {
    router.push(`/u/${username}`);
  };

  const handleTeamClick = (teamSlug: string) => {
    router.push(`/teams/${teamSlug}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Legendary Heroes
            </h1>
            <p className="text-gray-600 mt-1">Discover and explore all legendary heroes across teams</p>
          </div>
          <div className="text-sm text-gray-600">
            Total Heroes: <span className="font-semibold">{total}</span>
          </div>
        </div>

        {/* Enhanced Filters */}
        <Card>
            <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <Input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="allow">Allow</option>
                  <option value="waiting">Waiting</option>
                  <option value="block">Block</option>
                </select>
              </div>
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Roles</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              </div>
              <div>
                <select
                  value={teamRoleFilter}
                  onChange={(e) => setTeamRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Team Roles</option>
                  <option value="leader">Leader</option>
                  <option value="Orb Hero">Orb Hero</option>
                  <option value="King Creep">King Creep</option>
                  <option value="Bird Buyer">Bird Buyer</option>
                  <option value="Bounty">Bounty</option>
                </select>
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Filter by team name..."
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                />
              </div>
              <div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchInput('');
                    setStatusFilter('');
                    setRoleFilter('');
                    setTeamFilter('');
                    setTeamRoleFilter('');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
            </CardContent>
          </Card>
          
        {/* Heroes Table */}
        <Card>
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No legendary heroes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hero</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-gray-50"
                      ref={index === users.length - 1 ? lastUserElementCallback : null}
                    >
                      {/* Rank */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className=" font-bold text-indigo-600">#{index + 1}</span>
                        </div>
                      </td>

                      {/* Hero */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="flex items-center cursor-pointer group"
                          onClick={() => handleUserClick(user.username)}
                        >
                          <div className="h-12 w-12 flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center overflow-hidden group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-white font-semibold">{user.username[0].toUpperCase()}</span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}
                              >
                                {user.role.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-1xl font-bold text-blue-600">{user.score}</div>
                      </td>

                      {/* Level */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const level = getUserLevel(Number(user.score) || 0);
                            return (
                              <div className="flex flex-col items-start gap-1">
                                <div>
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${level.bgColor} ${level.textColor}`}>
                                    {level.name}
                                  </span>
                                </div>
                                <StarRating count={level.stars} maxStars={5} className="w-3 h-3" />
                              </div>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Team */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.team ? (
                          <div 
                            className="cursor-pointer group"
                            onClick={() => handleTeamClick(user.team!.team.slug)}
                          >
                            <div className="flex items-center mb-2">
                              {user.team.team.mark_url ? (
                                <img
                                  src={user.team.team.mark_url}
                                  alt={`${user.team.team.name} mark`}
                                  className="w-8 h-8 rounded-lg object-cover mr-3"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
                                  <span className="text-white font-bold text-sm">
                                    {user.team.team.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                  {user.team.team.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.team.team.member_count} members
                                </div>
                              </div>
                            </div>
                            
                            {/* Team Score & Level */}
                            <div className="ml-11 space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold text-green-600">
                                  Score: {user.team.team.score}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {(() => {
                                  const teamLevel = getTeamLevel(Number(user.team.team.score) || 0);
                                  return (
                                    <>
                                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${teamLevel.bgColor} ${teamLevel.textColor}`}>
                                        {teamLevel.name}
                                      </span>
                                      <StarRating count={teamLevel.stars} maxStars={5} className="w-3 h-3" />
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No team</span>
                        )}
                      </td>

                      {/* Team Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.team ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold border ${getTeamRoleBadgeColor(user.team.role)}`}
                          >
                            {user.team.role}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* Votes */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-semibold text-purple-600">{user.vote_count}</div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(user.status)}`}
                        >
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    <span className="text-gray-600">Loading more legendary heroes...</span>
                  </div>
                </div>
              )}

              {/* End of Results */}
              {!hasMore && users.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">You've reached the end of the legendary heroes list</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}

