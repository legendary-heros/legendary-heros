'use client';

import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Manage your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Profile page content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

