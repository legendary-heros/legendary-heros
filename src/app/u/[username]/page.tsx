'use client';

import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { IRootState } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { MainLayout } from '@/components/layouts/MainLayout';
import PublicRoute from '@/components/auth/PublicRoute';
import { getUserByUsername, voteUser, clearProfile, checkVoteStatus } from '@/store/slices/userProfileSlice';
import { AppDispatch } from '@/store';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const dispatch = useDispatch<AppDispatch>();
  
  const { user: currentUser, isAuthenticated } = useSelector((state: IRootState) => state.auth);
  const { user, loading, voting, hasVoted, error } = useSelector((state: IRootState) => state.userProfile);
  const [voteSuccess, setVoteSuccess] = useState(false);

  useEffect(() => {
    dispatch(getUserByUsername(username));

    return () => {
      dispatch(clearProfile());
    };
  }, [dispatch, username]);

  // Check vote status when user is loaded and current user is authenticated
  useEffect(() => {
    if (user && currentUser && user.id !== currentUser.id && isAuthenticated) {
      dispatch(checkVoteStatus(user.id));
    }
  }, [dispatch, user, currentUser, isAuthenticated]);

  useEffect(() => {
    if (error) {
      notFound();
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {
          isAuthenticated? (
            <Header />
          ): (
            <Header variant="public" showBackButton={true} />
          )
        }
        
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleVote = async () => {
    if (!user || !currentUser || user.id === currentUser.id || hasVoted) return;

    try {
      await dispatch(voteUser(user.id)).unwrap();
      setVoteSuccess(true);
      // Reset success message after 3 seconds
      setTimeout(() => setVoteSuccess(false), 3000);
    } catch (error: any) {
      alert(error || 'Failed to vote');
      console.error('Vote error:', error);
    }
  };

  const canVote = isAuthenticated && currentUser && user && currentUser.id !== user.id && !hasVoted;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'leader':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'member':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'allow':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'block':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUserLevel = (score: number) => {
    if (score >= 1000) {
      return {
        name: 'SS Level',
        tier: 'master',
        stars: 5,
        description: 'Monster, God',
        color: 'from-yellow-400 to-orange-500',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      };
    } else if (score >= 500) {
      return {
        name: 'S Level',
        tier: 'expert',
        stars: 4,
        description: 'A hero who has ability to change round situation',
        color: 'from-purple-400 to-pink-500',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-50'
      };
    } else if (score >= 250) {
      return {
        name: 'A Level',
        tier: 'professional',
        stars: 3,
        description: 'A hero who can do rampage in round',
        color: 'from-blue-400 to-cyan-500',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50'
      };
    } else if (score >= 100) {
      return {
        name: 'B Level',
        tier: 'intermediate',
        stars: 2,
        description: 'A hero who is good at carry and support both and sometimes takes 1 place in the round',
        color: 'from-green-400 to-emerald-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    } else if (score >= 50) {
      return {
        name: 'C Level',
        tier: 'beginner',
        stars: 1,
        description: 'A hero who is good at carry',
        color: 'from-blue-400 to-blue-500',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50'
      };
    } else {
      return {
        name: 'D Level',
        tier: 'novice',
        stars: 0,
        description: 'A new hero starting their journey',
        color: 'from-slate-300 to-slate-400',
        textColor: 'text-slate-600',
        bgColor: 'bg-slate-50'
      };
    }
  };

  const renderStars = (count: number, maxStars: number = 5) => {
    return (
      <div className="flex gap-1">
        {[...Array(maxStars)].map((_, index) => (
          <svg
            key={index}
            className={`w-5 h-5 ${
              index < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const renderComponent = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile Header Card */}
        <Card className="border-0 shadow-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-32" />
          <CardContent className="relative pt-0 pb-8">
            {/* Avatar */}
            <div className="flex justify-center -mt-16 mb-4">
              <div className="relative">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-5xl font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Status Indicator */}
                <div
                  className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${
                    user.status === 'allow'
                      ? 'bg-green-500'
                      : user.status === 'waiting'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            {/* User Info */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {user.username}
              </h1>

              {/* Badges */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role.toUpperCase()}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(
                    user.status
                  )}`}
                >
                  {user.status.toUpperCase()}
                </span>
              </div>

              {/* Level Display */}
              {(() => {
                const level = getUserLevel(Number(user.score) || 0);
                return (
                  <div className={`max-w-md mx-auto mb-6 p-4 rounded-xl ${level.bgColor} border-2 border-${level.textColor.replace('text-', '')}-200`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-left">
                        <div className="text-lg font-bold text-gray-900">
                          {level.name} <span className="text-sm font-normal text-gray-600">- {level.tier}</span>
                        </div>
                      </div>
                      {renderStars(level.stars)}
                    </div>
                    <p className="text-sm text-gray-600 text-left italic">{level.description}</p>
                  </div>
                );
              })()}

              {/* Bio */}
              {user.bio && (
                <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-md">
                  <div className="text-3xl font-bold text-blue-700 mb-1">
                    {user.score}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Score</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-md">
                  <div className="text-3xl font-bold text-purple-700 mb-1">
                    {user.vote_count}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Votes</div>
                </div>
              </div>

              {/* Vote Button */}
              {isAuthenticated && currentUser && user && currentUser.id !== user.id && (
                <div className="mt-8 max-w-md mx-auto">
                  {voteSuccess ? (
                    <div className="bg-green-50 border-2 border-green-500 text-green-700 px-6 py-3 rounded-xl font-semibold text-center animate-pulse">
                      ✓ Vote Submitted Successfully!
                    </div>
                  ) : hasVoted ? (
                    <div className="bg-gray-100 border-2 border-gray-300 text-gray-600 px-6 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>You've Already Voted</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleVote}
                      disabled={voting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {voting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Voting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          <span>Vote for {user.username}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Contact Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-gray-500 font-medium min-w-[100px]">User Name:</span>
                  <span className="text-gray-900">{user.username}</span>
                </div>
                {user.slackname && (
                  <div className="flex items-start">
                    <span className="text-gray-500 font-medium min-w-[100px]">Slack Name:</span>
                    <span className="text-gray-900">{user.slackname}</span>
                  </div>
                )}
                {user.dotaname && (
                  <div className="flex items-start">
                    <span className="text-gray-500 font-medium min-w-[100px]">Dota Name:</span>
                    <span className="text-gray-900">{user.dotaname}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Account Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-gray-500 font-medium min-w-[100px]">Role:</span>
                  <span className="text-gray-900 capitalize">{user.role}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-500 font-medium min-w-[100px]">Status:</span>
                  <span className="text-gray-900 capitalize">{user.status}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-500 font-medium min-w-[100px]">Joined:</span>
                  <span className="text-gray-900">{formatDate(user.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <MainLayout>
        {renderComponent()}
      </MainLayout>
    );
  }
  
  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Header variant="public" showBackButton={true} />
        {renderComponent()}
      </div>
    </PublicRoute>
  );
}

