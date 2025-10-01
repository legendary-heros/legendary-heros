'use client';

import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
              <CardDescription>Frequently asked questions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">FAQ content coming soon...</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get help from our team</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Support options coming soon...</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Community</CardTitle>
              <CardDescription>Join our community forums</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Community links coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

