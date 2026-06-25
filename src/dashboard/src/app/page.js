"use client";
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Dashboard() {
  const [apps, setApps] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetch('/api/apps').then(res => res.json()).then(data => setApps(Array.isArray(data) ? data : []));
    fetch('/api/routes').then(res => res.json()).then(data => setRoutes(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">WebApp Factory Dashboard</h1>
      <p className="text-muted-foreground">Monitoring active pipelines, processed utilities, and dynamic deployments.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Apps Table */}
        <Card>
          <CardHeader>
            <CardTitle>Discovered & Processed Apps</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>App Name</TableHead>
                  <TableHead>Processed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No data found.</TableCell></TableRow>
                ) : (
                    apps.map(app => (
                        <TableRow key={app.id}>
                            <TableCell>{app.id}</TableCell>
                            <TableCell className="font-medium">{app.app_name}</TableCell>
                            <TableCell>{new Date(app.processed_at).toLocaleString()}</TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Routes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Project Slug</TableHead>
                  <TableHead>Subdomain Route</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {routes.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No data found.</TableCell></TableRow>
                ) : (
                    routes.map(route => (
                        <TableRow key={route.id}>
                            <TableCell>{route.id}</TableCell>
                            <TableCell className="font-medium">{route.slug}</TableCell>
                            <TableCell>
                                <a href={`https://${route.subdomain}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                    {route.subdomain}
                                </a>
                            </TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
