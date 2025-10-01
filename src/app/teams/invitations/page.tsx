'use client';

import { useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchInvitations, respondToInvitation, fetchMyTeam } from '@/store/slices/teamsSlice';
import { InvitationCard } from '@/components/teams/InvitationCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import PageLoader from '@/components/ui/PageLoader';

export default function InvitationsPage() {
  const dispatch = useAppDispatch();
  const { invitations, loading, updating } = useAppSelector((state) => state.teams);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchInvitations());
    }
  }, [dispatch, isAuthenticated]);

  const handleAcceptInvitation = async (id: string) => {
    try {
      await dispatch(respondToInvitation({ invitationId: id, action: 'accept' })).unwrap();
      // Refresh invitations and my team
      dispatch(fetchInvitations());
      dispatch(fetchMyTeam());
    } catch (err: any) {
      alert(err.message || 'Failed to accept invitation');
    }
  };

  const handleRejectInvitation = async (id: string) => {
    try {
      await dispatch(respondToInvitation({ invitationId: id, action: 'reject' })).unwrap();
      dispatch(fetchInvitations());
    } catch (err: any) {
      alert(err.message || 'Failed to reject invitation');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <PageLoader />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Team Invitations</CardTitle>
            <CardDescription>
              Manage your team invitations
            </CardDescription>
          </CardHeader>
        </Card>

        {invitations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No pending invitations</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onAccept={handleAcceptInvitation}
                onReject={handleRejectInvitation}
                isLoading={updating}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

