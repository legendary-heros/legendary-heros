'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IRootState, IUser, UserStatus, UserRole } from '@/types';
import api from '@/lib/api';
import endpoints from '@/lib/endpoints';
import { isAdmin, isSuperAdmin } from '@/lib/auth-middleware';

interface UserWithActions extends Omit<IUser, 'password'> {}

interface PendingChanges {
  status?: UserStatus;
  score?: string;
  role?: UserRole;
}

export default function UsersPage() {
  const { user: currentUser } = useSelector((state: IRootState) => state.auth);
  const [users, setUsers] = useState<UserWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, PendingChanges>>({});
  
  const limit = 10;
  const isCurrentUserAdmin = currentUser && isAdmin(currentUser.role);
  const isCurrentUserSuperAdmin = currentUser && isSuperAdmin(currentUser.role);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(roleFilter && { role: roleFilter }),
      });

      const response = await api.get(`${endpoints.users.list}?${params.toString()}`);
      
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotal(response.data.data.pagination.total);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (userId: string, status: UserStatus) => {
    setPendingChanges(prev => ({
      ...prev,
      [userId]: { ...prev[userId], status }
    }));
  };

  const canChangeUserStatus = (user: UserWithActions) => {
    // Users cannot change their own status
    if (user.id === currentUser?.id) return false;
    
    // Superadmins can change anyone's status
    if (isCurrentUserSuperAdmin) return true;
    
    // Admins cannot change status of other admins or superadmins
    if (isCurrentUserAdmin && (user.role === 'admin' || user.role === 'superadmin')) {
      return false;
    }
    
    return true;
  };

  const canChangeUserScore = (user: UserWithActions) => {
    // Superadmins can change anyone's score
    if (isCurrentUserSuperAdmin) return true;
    
    // Admins cannot change score of other admins or superadmins
    if (isCurrentUserAdmin && (user.role === 'admin' || user.role === 'superadmin')) {
      return false;
    }
    
    return true;
  };

  const canDeleteUser = (user: UserWithActions) => {
    // Cannot delete yourself
    if (user.id === currentUser?.id) return false;
    
    // Superadmins can delete anyone (except themselves)
    if (isCurrentUserSuperAdmin) return true;
    
    // Admins cannot delete other admins or superadmins
    if (isCurrentUserAdmin && (user.role === 'admin' || user.role === 'superadmin')) {
      return false;
    }
    
    return true;
  };

  const handleScoreChange = (userId: string, score: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [userId]: { ...prev[userId], score }
    }));
  };

  const handleRoleChange = (userId: string, role: UserRole) => {
    setPendingChanges(prev => ({
      ...prev,
      [userId]: { ...prev[userId], role }
    }));
  };

  const handleSaveChanges = async (userId: string) => {
    const changes = pendingChanges[userId];
    if (!changes) return;

    try {
      setUpdatingUserId(userId);
      
      // Update status if changed
      if (changes.status !== undefined) {
        await api.patch(endpoints.users.updateStatus(userId), { status: changes.status });
      }
      
      // Update score if changed
      if (changes.score !== undefined) {
        await api.patch(endpoints.users.updateScore(userId), { score: changes.score });
      }
      
      // Update role if changed (superadmin only)
      if (changes.role !== undefined && isCurrentUserSuperAdmin) {
        await api.patch(endpoints.users.updateRole(userId), { role: changes.role });
      }

      // Update local state with all changes
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, ...changes } 
          : u
      ));

      // Clear pending changes for this user
      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[userId];
        return newChanges;
      });

    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save changes');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleCancelChanges = (userId: string) => {
    setPendingChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[userId];
      return newChanges;
    });
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setUpdatingUserId(userId);
      const response = await api.delete(endpoints.users.delete(userId));
      
      if (response.data.success) {
        // Remove user from local state
        setUsers(users.filter(u => u.id !== userId));
        // Clear any pending changes for this user
        setPendingChanges(prev => {
          const newChanges = { ...prev };
          delete newChanges[userId];
          return newChanges;
        });
        // Recalculate total
        setTotal(prev => prev - 1);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const hasPendingChanges = (userId: string) => {
    return pendingChanges[userId] !== undefined;
  };

  const getCurrentValue = <K extends keyof UserWithActions>(
    user: UserWithActions, 
    field: K
  ): UserWithActions[K] => {
    if (pendingChanges[user.id]?.[field as keyof PendingChanges] !== undefined) {
      return pendingChanges[user.id][field as keyof PendingChanges] as UserWithActions[K];
    }
    return user[field];
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case 'allow': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'block': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-indigo-100 text-indigo-800';
      case 'leader': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isCurrentUserAdmin) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view this page.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
          </div>
          <div className="text-sm text-gray-600">
            Total Users: <span className="font-semibold">{total}</span>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
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
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Roles</option>
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="leader">Leader</option>
                <option value="member">Member</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center overflow-hidden">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-white font-semibold">{user.username[0].toUpperCase()}</span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {canChangeUserStatus(user) ? (
                          <select
                            value={getCurrentValue(user, 'status')}
                            onChange={(e) => handleStatusChange(user.id, e.target.value as UserStatus)}
                            disabled={updatingUserId === user.id}
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(getCurrentValue(user, 'status'))} border-0 focus:ring-2 focus:ring-indigo-500 ${hasPendingChanges(user.id) ? 'ring-2 ring-yellow-400' : ''}`}
                          >
                            <option value="allow">Allow</option>
                            <option value="waiting">Waiting</option>
                            <option value="block">Block</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(user.status)}`}>
                            {user.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isCurrentUserSuperAdmin && user.id !== currentUser?.id ? (
                          <select
                            value={getCurrentValue(user, 'role')}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            disabled={updatingUserId === user.id}
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(getCurrentValue(user, 'role'))} border-0 focus:ring-2 focus:ring-indigo-500 ${hasPendingChanges(user.id) ? 'ring-2 ring-yellow-400' : ''}`}
                          >
                            <option value="superadmin">Superadmin</option>
                            <option value="admin">Admin</option>
                            <option value="leader">Leader</option>
                            <option value="member">Member</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={getCurrentValue(user, 'score')}
                          onChange={(e) => handleScoreChange(user.id, e.target.value)}
                          disabled={updatingUserId === user.id || !canChangeUserScore(user)}
                          className={`w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${hasPendingChanges(user.id) ? 'ring-2 ring-yellow-400' : ''} ${!canChangeUserScore(user) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {updatingUserId === user.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                          ) : hasPendingChanges(user.id) ? (
                            <>
                              <button
                                onClick={() => handleSaveChanges(user.id)}
                                className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded hover:from-indigo-700 hover:to-purple-700 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => handleCancelChanges(user.id)}
                                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded hover:bg-gray-300 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : canDeleteUser(user) ? (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors"
                              title="Delete user"
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="secondary"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="secondary"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

