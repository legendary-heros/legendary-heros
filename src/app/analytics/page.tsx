'use client';

import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AnalyticsPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>View your analytics data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Analytics content coming soon...</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Track user activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Engagement metrics coming soon...</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Monitor your earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Revenue data coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

