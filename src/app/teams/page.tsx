'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchTeams, fetchMyTeam, createTeam, setPage } from '@/store/slices/teamsSlice';
import { TeamCard } from '@/components/teams/TeamCard';
import { TeamForm } from '@/components/teams/TeamForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import PageLoader from '@/components/ui/PageLoader';

export default function TeamsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { teams, myTeam, total, page, totalPages, loading, updating, error } = useAppSelector((state) => state.teams);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyTeam());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    dispatch(fetchTeams({
      page,
      limit: 12,
      search: searchDebounce,
      status: statusFilter,
    }));
  }, [dispatch, page, searchDebounce, statusFilter]);

  const handleCreateTeam = async (data: {
    name: string;
    bio?: string;
    mark_url?: string;
    ad_url?: string;
    markFile?: File | null;
    adFile?: File | null;
  }) => {
    try {
      // Create team with images in one request
      await dispatch(createTeam({
        name: data.name,
        bio: data.bio,
        mark_url: data.mark_url,
        ad_url: data.ad_url,
        markFile: data.markFile,
        adFile: data.adFile,
      })).unwrap();

      setShowCreateForm(false);
      // Refresh my team
      await dispatch(fetchMyTeam());
    } catch (err) {
      console.error('Failed to create team:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = user && ['admin', 'superadmin'].includes(user.role);

  if (loading && teams.length === 0) {
    return (
      <MainLayout>
        <PageLoader />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Teams</h1>
              <p className="text-gray-600 mt-1">
                Join or create a team to collaborate with others
              </p>
            </div>
            {isAuthenticated && !myTeam && (
              <Button onClick={() => setShowCreateForm(true)}>
                Create Team
              </Button>
            )}
          </div>

          {/* My Team Section */}
          {myTeam && (
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle>Your Team</CardTitle>
                <CardDescription>You are {user?.id === myTeam.leader_id ? 'leading' : 'a member of'} this team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xl">{myTeam.name}</h3>
                    <p className="text-sm text-gray-600">
                      {myTeam.member_count} members • Score: {parseFloat(myTeam.score).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push(`/teams/${myTeam.slug}`)}
                    variant="secondary"
                  >
                    View Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create Team Modal */}
          <Modal
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            title="Create New Team"
            description="Your team will need admin approval before becoming active"
            size="lg"
          >
            <TeamForm
              onSubmit={handleCreateTeam}
              onCancel={() => setShowCreateForm(false)}
              isLoading={updating}
            />
          </Modal>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              {isAdmin && (
                <>
                  <option value="waiting">Waiting</option>
                  <option value="blocked">Blocked</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No teams found</p>
              {!myTeam && isAuthenticated && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4"
                >
                  Create the first team
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                  variant="secondary"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages} ({total} teams)
                </span>
                <Button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || loading}
                  variant="secondary"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

