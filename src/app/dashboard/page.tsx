'use client';

import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { MainLayout } from '@/components/layouts/MainLayout';
import { getUserLevel, getTeamLevel } from '@/utils/levelUtils';
import { useEffect } from 'react';
import { fetchMyTeam } from '@/store/slices/teamsSlice';
import { getUsers } from '@/store/slices/usersSlice';
import { fetchTeams } from '@/store/slices/teamsSlice';
import { StarRating } from '@/components/ui/StarRating';
import Link from 'next/link';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const { myTeam } = useAppSelector((state: any) => state.teams);
  const { users } = useAppSelector((state: any) => state.users);
  const { teams } = useAppSelector((state: any) => state.teams);

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      dispatch(fetchMyTeam());
      dispatch(getUsers({ page: 1, limit: 10, append: false }));
      dispatch(fetchTeams({ page: 1, limit: 10 }));
    }
  }, [dispatch, user]);

  // Get user level
  const userLevel = user ? getUserLevel(parseInt(user.score) || 0) : null;
  
  // Get team level
  const teamLevel = myTeam ? getTeamLevel(parseInt(myTeam.score) || 0) : null;

  // Get top users (sorted by score)
  const topUsers = users
    .filter((u: any) => u.id !== user?.id)
    .sort((a: any, b: any) => parseInt(b.score) - parseInt(a.score))
    .slice(0, 5);

  // Get top teams (sorted by score)
  const topTeams = teams
    .filter((t: any) => t.id !== myTeam?.id)
    .sort((a: any, b: any) => parseInt(b.score) - parseInt(a.score))
    .slice(0, 5);

  const getChallengeMessage = (userScore: number, currentUserScore: number) => {
    const scoreDiff = userScore - currentUserScore;
    if (scoreDiff > 500) return "🔥 Legendary challenge ahead!";
    if (scoreDiff > 200) return "⚡ Epic battle awaits!";
    if (scoreDiff > 100) return "💪 Strong opponent detected!";
    if (scoreDiff > 0) return "🎯 Perfect match for growth!";
    return "🌟 Keep pushing forward!";
  };

  const getTeamChallengeMessage = (teamScore: number, currentTeamScore: number) => {
    const scoreDiff = teamScore - currentTeamScore;
    if (scoreDiff > 1000) return "🏆 Legendary team challenge!";
    if (scoreDiff > 500) return "⚔️ Epic team battle!";
    if (scoreDiff > 200) return "💪 Strong team opponent!";
    if (scoreDiff > 0) return "🎯 Great team matchup!";
    return "🌟 Keep climbing together!";
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-2">Welcome back, {user?.username}!</h2>
                <p className="text-indigo-100 text-lg">Ready to dominate the battlefield?</p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>

        {/* User Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Score & Level Card */}
          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center overflow-hidden">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  </div>
                  <div>
                  <CardTitle className="text-2xl">Your Power Level</CardTitle>
                  <CardDescription>Current score and level status</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
              {user && userLevel && (
                <div className="space-y-6">
                  {/* Score Display */}
                  <div className="text-center">
                    <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      {user.score}
                    </div>
                    <p className="text-gray-600 text-lg">Total Score</p>
                  </div>

                  {/* Level Display */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="text-center mb-4">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${userLevel.color} text-white mb-2`}>
                        {userLevel.name}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{userLevel.tier.charAt(0).toUpperCase() + userLevel.tier.slice(1)}</div>
                      <p className="text-gray-600 text-sm">{userLevel.description}</p>
                    </div>
                    
                    {/* Star Rating */}
                    <div className="flex justify-center">
                      <StarRating count={userLevel.stars} maxStars={5} className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Progress to next level */}
                    <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress to next level</span>
                      <span>{user.score} / {userLevel.name === 'SS Level' ? '∞' : userLevel.name === 'S Level' ? '1000' : userLevel.name === 'A Level' ? '500' : userLevel.name === 'B Level' ? '250' : userLevel.name === 'C Level' ? '100' : '50'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full bg-gradient-to-r ${userLevel.color}`}
                        style={{ 
                          width: userLevel.name === 'SS Level' ? '100%' : 
                          userLevel.name === 'S Level' ? '100%' : 
                          userLevel.name === 'A Level' ? '100%' : 
                          userLevel.name === 'B Level' ? '100%' : 
                          userLevel.name === 'C Level' ? '100%' : 
                          `${(parseInt(user.score) / 50) * 100}%` 
                        }}
                      ></div>
                    </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          {/* Team Stats Card (if user has a team) */}
          {myTeam && teamLevel ? (
            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center overflow-hidden">
                    {myTeam.mark_url ? (
                      <img 
                        src={myTeam.mark_url} 
                        alt={myTeam.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Team Power</CardTitle>
                    <CardDescription>{myTeam.name} - Team Level</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Team Score Display */}
                  <div className="text-center">
                    <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {myTeam.score}
                    </div>
                    <p className="text-gray-600 text-lg">Team Score</p>
                  </div>

                  {/* Team Level Display */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="text-center mb-4">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${teamLevel.color} text-white mb-2`}>
                        {teamLevel.name}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{teamLevel.tier.charAt(0).toUpperCase() + teamLevel.tier.slice(1)}</div>
                      <p className="text-gray-600 text-sm">{teamLevel.description}</p>
                    </div>
                    
                    {/* Star Rating */}
                    <div className="flex justify-center">
                      <StarRating count={teamLevel.stars} maxStars={5} className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Team Members Count */}
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Team Members</span>
                      <span className="text-2xl font-bold text-purple-600">{myTeam.member_count}</span>
                </div>
                </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-gray-50 to-slate-50">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-slate-600 rounded-xl flex items-center justify-center overflow-hidden">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">No Team Yet</CardTitle>
                    <CardDescription>Join or create a team to unlock team features</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">👥</div>
                  <p className="text-gray-600">Join a team to compete together and climb the team leaderboards!</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    Find Teams
                </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Leaderboards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Users Leaderboard */}
          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader className="border-b border-gray-100">
                <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                  <CardTitle className="text-2xl">Top Heroes</CardTitle>
                  <CardDescription>Challenge the best players</CardDescription>
                  </div>
                </div>
              </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {topUsers.map((topUser: any, index: number) => {
                  const topUserLevel = getUserLevel(parseInt(topUser.score) || 0);
                  const challengeMessage = getChallengeMessage(parseInt(topUser.score), parseInt(user?.score || '0'));
                  
                  return (
                    <div key={topUser.id} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                              index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                              'bg-gradient-to-r from-blue-500 to-blue-600'
                            }`}>
                             {index + 1}
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              {topUser.avatar_url ? (
                                <img 
                                  src={topUser.avatar_url} 
                                  alt={topUser.username} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-sm">{topUser.username.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{topUser.username}</div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block bg-gradient-to-r ${topUserLevel.color} text-white`}>
                              {topUserLevel.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{topUser.score}</div>
                          <div className="text-xs text-gray-500">{challengeMessage}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Teams Leaderboard */}
          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                <div>
                  <CardTitle className="text-2xl">Top Teams</CardTitle>
                  <CardDescription>Challenge the strongest teams</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {topTeams.map((topTeam: any, index: number) => {
                  const topTeamLevel = getTeamLevel(parseInt(topTeam.score) || 0);
                  const challengeMessage = myTeam ? getTeamChallengeMessage(parseInt(topTeam.score), parseInt(myTeam.score)) : "Join a team to compete!";
                  
                  return (
                    <div key={topTeam.id} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                              index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                              'bg-gradient-to-r from-green-500 to-green-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                              {topTeam.mark_url ? (
                                <img 
                                  src={topTeam.mark_url} 
                                  alt={topTeam.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-sm">{topTeam.name.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{topTeam.name}</div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block bg-gradient-to-r ${topTeamLevel.color} text-white`}>
                              {topTeamLevel.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{topTeam.score}</div>
                          <div className="text-xs text-gray-500">{challengeMessage}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    🔔 Match Results & Updates
                  </CardTitle>
                  <CardDescription>
                    Latest match results and team achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Point System Info */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-900 mb-2">🏆 Point System</h4>
                      <div className="space-y-1 text-sm text-blue-800">
                        <div>🥇 1st Place: <span className="font-bold">10 points</span></div>
                        <div>🥈 2nd Place: <span className="font-bold">8 points</span></div>
                        <div>🥉 3rd Place: <span className="font-bold">6 points</span></div>
                        <div>🏆 Team Win: <span className="font-bold">20 points</span></div>
                      </div>
                    </div>

                    {/* Sample Notifications */}
                    <div className="space-y-3">
                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">🏆</span>
                          <div>
                            <p className="text-sm font-medium text-green-900">Team Victory!</p>
                            <p className="text-xs text-green-700">Dragon Warriors won their latest match</p>
                            <p className="text-xs text-green-600">+20 points awarded</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-l-4 border-yellow-500">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-600">🥇</span>
                          <div>
                            <p className="text-sm font-medium text-yellow-900">Match Results</p>
                            <p className="text-xs text-yellow-700">PlayerX secured 1st place</p>
                            <p className="text-xs text-yellow-600">+10 points earned</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">📈</span>
                          <div>
                            <p className="text-sm font-medium text-purple-900">Level Up!</p>
                            <p className="text-xs text-purple-700">PhoenixRising reached Elite status</p>
                            <p className="text-xs text-purple-600">Congratulations!</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Link href="/legendary-heroes">
                        <Button variant="outline" className="w-full">
                          View All Heroes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
              <div>
                <CardTitle className="text-2xl">Quick Actions</CardTitle>
                <CardDescription>Manage your account and compete</CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="w-full justify-start bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm h-12">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </Button>
              <Button className="w-full justify-start bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm h-12">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {myTeam ? 'Manage Team' : 'Find Teams'}
              </Button>
              <Button className="w-full justify-start bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm h-12">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Leaderboard
              </Button>
                </div>
              </CardContent>
            </Card>
        </div>
    </MainLayout>
  );
}