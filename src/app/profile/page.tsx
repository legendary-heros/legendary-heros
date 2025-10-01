'use client';

import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import ProfileForm from '@/components/forms/ProfileForm';

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">User Profile</CardTitle>
            <CardDescription className="text-blue-100">
              Manage your profile information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ProfileForm />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

