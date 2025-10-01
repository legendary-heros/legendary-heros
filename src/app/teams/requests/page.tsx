'use client';

import { useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchJoinRequests } from '@/store/slices/teamsSlice';
import { JoinRequestCard } from '@/components/teams/JoinRequestCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import PageLoader from '@/components/ui/PageLoader';

export default function JoinRequestsPage() {
  const dispatch = useAppDispatch();
  const { joinRequests, loading } = useAppSelector((state) => state.teams);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchJoinRequests());
    }
  }, [dispatch, isAuthenticated]);

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
            <CardTitle>Your Join Requests</CardTitle>
            <CardDescription>
              View the status of your team join requests
            </CardDescription>
          </CardHeader>
        </Card>

        {joinRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No join requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinRequests.map((request) => (
              <JoinRequestCard
                key={request.id}
                request={request}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

