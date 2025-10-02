'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchTeam,
  fetchTeamMembers,
  updateTeam,
  updateTeamScore,
  deleteTeam,
  removeTeamMember,
  updateTeamMemberRole,
  fetchJoinRequests,
  respondToJoinRequest,
  createJoinRequest,
  sendInvitation,
  clearCurrentTeam,
} from '@/store/slices/teamsSlice';
import { getUsers } from '@/store/slices/usersSlice';
import { MemberCard } from '@/components/teams/MemberCard';
import { JoinRequestCard } from '@/components/teams/JoinRequestCard';
import { TeamForm } from '@/components/teams/TeamForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import PageLoader from '@/components/ui/PageLoader';
import type { TeamMemberRole } from '@/types';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { currentTeam, teamMembers, joinRequests, loading, updating } = useAppSelector((state) => state.teams);
  const { users } = useAppSelector((state) => state.users);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'requests' | 'invite'>('members');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [showScoreEditor, setShowScoreEditor] = useState(false);
  const [newScore, setNewScore] = useState('');
  const [scoreReason, setScoreReason] = useState('');
  const [scoreError, setScoreError] = useState('');

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const result = await dispatch(fetchTeam(params.slug as string)).unwrap();
        if (result) {
          dispatch(fetchTeamMembers(result.id));
          // Load join requests if leader
          if (user && result.leader_id === user.id) {
            dispatch(fetchJoinRequests(result.id));
          }
        }
      } catch (err) {
        router.push('/teams');
        console.error('Failed to load team:', err);
      }
    };

    if (params.slug) {
      loadTeam();
    }

    return () => {
      dispatch(clearCurrentTeam());
    };
  }, [params.slug, dispatch, user]);

  useEffect(() => {
    if (activeTab === 'invite') {
      dispatch(getUsers({ page: 1, limit: 50 }));
    }
  }, [activeTab, dispatch]);

  if (loading || !currentTeam) {
    return (
      <MainLayout>
        <PageLoader />
      </MainLayout>
    );
  }

  const isLeader = user?.id === currentTeam.leader_id;
  const isAdmin = user && ['admin', 'superadmin'].includes(user.role);
  const isMember = teamMembers.some(m => m.user_id === user?.id) || isLeader;
  const canEdit = (isLeader || isAdmin) && currentTeam.status !== 'blocked';
  
  // Create a combined members list that includes the leader at the top
  const allMembers = currentTeam.leader ? [
    {
      id: 'leader-' + currentTeam.leader_id,
      team_id: currentTeam.id,
      user_id: currentTeam.leader_id,
      role: 'leader' as const,
      joined_at: currentTeam.created_at,
      user: currentTeam.leader
    },
    ...teamMembers
  ] : teamMembers;

  const handleUpdateTeam = async (data: any) => {
    try {
      await dispatch(updateTeam({ teamId: currentTeam.id, teamData: data })).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update team:', err);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await dispatch(deleteTeam(currentTeam.id)).unwrap();
      router.push('/teams');
    } catch (err) {
      console.error('Failed to delete team:', err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await dispatch(removeTeamMember({ teamId: currentTeam.id, userId })).unwrap();
      // Refresh team data
      dispatch(fetchTeam(params.slug as string));
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: TeamMemberRole) => {
    try {
      await dispatch(updateTeamMemberRole({ teamId: currentTeam.id, memberId, role: newRole })).unwrap();
      // Refresh team data
      dispatch(fetchTeam(params.slug as string));
    } catch (err) {
      console.error('Failed to update member role:', err);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await dispatch(respondToJoinRequest({ requestId, action: 'approve' })).unwrap();
      // Refresh members and team
      dispatch(fetchTeamMembers(currentTeam.id));
      dispatch(fetchTeam(params.slug as string));
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await dispatch(respondToJoinRequest({ requestId, action: 'reject' })).unwrap();
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  const handleJoinRequest = async () => {
    try {
      await dispatch(createJoinRequest({ teamId: currentTeam.id, message: joinMessage })).unwrap();
      alert('Join request sent successfully!');
      setJoinMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to send join request');
    }
  };

  const handleSendInvitation = async () => {
    setInviteError('');
    
    if (!inviteUsername.trim()) {
      setInviteError('Please enter a username');
      return;
    }

    const invitee = users.find(u => u.username.toLowerCase() === inviteUsername.toLowerCase());
    
    if (!invitee) {
      setInviteError('User not found');
      return;
    }

    try {
      await dispatch(sendInvitation({ teamId: currentTeam.id, inviteeId: invitee.id })).unwrap();
      alert(`Invitation sent to ${invitee.username}!`);
      setInviteUsername('');
    } catch (err: any) {
      setInviteError(err.message || 'Failed to send invitation');
    }
  };

  const handleUpdateScore = async () => {
    setScoreError('');
    
    if (!newScore.trim()) {
      setScoreError('Please enter a score');
      return;
    }

    const scoreNumber = parseFloat(newScore);
    if (isNaN(scoreNumber) || scoreNumber < 0) {
      setScoreError('Score must be a valid positive number');
      return;
    }

    try {
      await dispatch(updateTeamScore({
        teamId: currentTeam.id,
        score: scoreNumber,
        reason: scoreReason.trim() || undefined,
      })).unwrap();
      
      setShowScoreEditor(false);
      setNewScore('');
      setScoreReason('');
      alert('Team score updated successfully!');
    } catch (err: any) {
      setScoreError(err.message || 'Failed to update score');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      waiting: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Banner */}
        {currentTeam.ad_url && (
          <div className="relative w-full h-48 md:h-85 rounded-lg overflow-hidden mb-6">
            <Image
              src={currentTeam.ad_url}
              alt={currentTeam.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Team Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {currentTeam.mark_url ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={currentTeam.mark_url}
                    alt={currentTeam.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-4xl flex-shrink-0">
                  {currentTeam.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold">{currentTeam.name}</h1>
                    <p className="text-gray-600 mt-1">
                      Led by <span className="font-medium">{currentTeam.leader.username}</span>
                    </p>
                  </div>
                  {getStatusBadge(currentTeam.status)}
                </div>

                {currentTeam.bio && (
                  <p className="text-gray-700 mt-3">{currentTeam.bio}</p>
                )}

                <div className="flex gap-6 mt-4">
                  <div className="flex items-center ">
                    <span className="text-gray-500">Members:</span>
                    <span className="font-bold ml-2">{currentTeam.member_count}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Team Score:</span>
                    <span className="font-bold">{parseFloat(currentTeam.score).toFixed(2)}</span>
                    {isAdmin && (
                      <>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Admin Control
                        </span>
                        <Button
                          onClick={() => {
                            setNewScore(currentTeam.score);
                            setShowScoreEditor(true);
                          }}
                          size="sm"
                          variant="secondary"
                        >
                          Edit Score
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {canEdit && (
                    <>
                      <Button onClick={() => setIsEditing(true)} size="sm">
                        Edit Team
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="secondary"
                        size="sm"
                      >
                        Delete Team
                      </Button>
                    </>
                  )}
                  {isAdmin && (
                    <select
                      value={currentTeam.status}
                      onChange={(e) => handleUpdateTeam({ status: e.target.value })}
                      className="px-3 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="waiting">Waiting</option>
                      <option value="approved">Approved</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  )}
                  {!isMember && isAuthenticated && currentTeam.status === 'approved' && (
                    <Button onClick={() => setActiveTab('members')} size="sm">
                      Request to Join
                    </Button>
                  )}
                  {isMember && !isLeader && (
                    <Button
                      onClick={() => handleRemoveMember(user!.id)}
                      variant="secondary"
                      size="sm"
                    >
                      Leave Team
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <Card className="mb-6 border-red-300">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-red-600 mb-2">Delete Team?</h3>
              <p className="text-gray-600 mb-4">
                This action cannot be undone. All team data will be permanently deleted.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleDeleteTeam} disabled={updating}>
                  Confirm Delete
                </Button>
                <Button onClick={() => setShowDeleteConfirm(false)} variant="secondary">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score Editor */}
        {showScoreEditor && isAdmin && (
          <Card className="mb-6 border-blue-300">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-blue-600 mb-2">Update Team Score</h3>
              <p className="text-gray-600 mb-4">
                Current score: <span className="font-bold">{parseFloat(currentTeam.score).toFixed(2)}</span>
                <span className="text-sm text-gray-500 ml-2">
                  (Last updated: {new Date(currentTeam.updated_at).toLocaleDateString()})
                </span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Score
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    placeholder="Enter new score"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={scoreReason}
                    onChange={(e) => setScoreReason(e.target.value)}
                    placeholder="Enter reason for score change..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
                {scoreError && (
                  <p className="text-red-500 text-sm">{scoreError}</p>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpdateScore} 
                    disabled={updating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updating ? 'Updating...' : 'Update Score'}
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowScoreEditor(false);
                      setNewScore('');
                      setScoreReason('');
                      setScoreError('');
                    }} 
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Form */}
        {isEditing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Edit Team</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamForm
                team={currentTeam}
                onSubmit={handleUpdateTeam}
                onCancel={() => setIsEditing(false)}
                isLoading={updating}
              />
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('members')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Members ({allMembers.length})
              </button>
              {isLeader && (
                <>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'requests'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Join Requests ({joinRequests.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('invite')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'invite'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Invite Members
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'members' && (
          <div>
            {!isMember && isAuthenticated && currentTeam.status === 'approved' && (
              <Card className="mb-6 bg-blue-50">
                <CardHeader>
                  <CardTitle>Request to Join</CardTitle>
                  <CardDescription>Send a request to join this team</CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={joinMessage}
                    onChange={(e) => setJoinMessage(e.target.value)}
                    placeholder="Tell the team why you want to join (optional)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 min-h-[100px]"
                  />
                  <Button onClick={handleJoinRequest} disabled={updating}>
                    Send Join Request
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isLeader={member.role === 'leader'}
                  canManage={isLeader}
                  currentUserId={user?.id}
                  onRemove={handleRemoveMember}
                  onChangeRole={handleChangeRole}
                  isLoading={updating}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requests' && isLeader && (
          <div>
            {joinRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No pending join requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {joinRequests.map((request) => (
                  <JoinRequestCard
                    key={request.id}
                    request={request}
                    onApprove={handleApproveRequest}
                    onReject={handleRejectRequest}
                    isLoading={updating}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'invite' && isLeader && (
          <Card>
            <CardHeader>
              <CardTitle>Invite Members</CardTitle>
              <CardDescription>
                Invite users to join your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                  {inviteError && (
                    <p className="text-red-500 text-sm mt-1">{inviteError}</p>
                  )}
                </div>
                <Button onClick={handleSendInvitation} disabled={updating}>
                  Send Invitation
                </Button>

                {users.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Available Users</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                      {users
                        .filter(u => !teamMembers.some(m => m.user_id === u.id) && u.id !== currentTeam.leader_id)
                        .map((u) => (
                          <button
                            key={u.id}
                            onClick={() => setInviteUsername(u.username)}
                            className="text-left p-3 border border-gray-200 rounded hover:bg-gray-50"
                          >
                            <p className="font-medium">{u.username}</p>
                            <p className="text-sm text-gray-500">
                              Score: {parseFloat(u.score).toFixed(2)}
                            </p>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

