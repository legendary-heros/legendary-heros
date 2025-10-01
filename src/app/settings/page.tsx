'use client';

import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto"> 
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Configure your preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Settings page content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

