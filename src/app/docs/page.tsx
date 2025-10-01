'use client';

import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function DocsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Learn the basics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Documentation content coming soon...</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>Explore our API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">API documentation coming soon...</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Guides & Tutorials</CardTitle>
              <CardDescription>Step-by-step guides</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Tutorials coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

