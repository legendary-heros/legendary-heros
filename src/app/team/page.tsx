'use client';

import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function TeamPage() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage your team and collaborators</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Team management content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

