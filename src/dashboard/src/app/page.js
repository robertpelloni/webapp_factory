"use client";
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, CodeXml } from 'lucide-react';

export default function Dashboard() {
  const [apps, setApps] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [logs, setLogs] = useState('');

  useEffect(() => {
    fetch('/api/apps').then(res => res.json()).then(data => setApps(Array.isArray(data) ? data : []));
    fetch('/api/routes').then(res => res.json()).then(data => setRoutes(Array.isArray(data) ? data : []));

    // Poll logs every 5 seconds
    const fetchLogs = () => fetch('/api/logs').then(res => res.text()).then(data => setLogs(data));
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const copyIframe = (subdomain) => {
     const snippet = `<iframe src="https://${subdomain}" width="100%" height="600px" style="border: none; border-radius: 8px;"></iframe>`;
     navigator.clipboard.writeText(snippet);
     alert("Iframe snippet copied to clipboard!");
  }

  return (
    <TooltipProvider>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">WebApp Factory Dashboard</h1>
          <p className="text-muted-foreground text-lg">Monitoring active pipelines, processed utilities, dynamic deployments, and live daemon logs.</p>
        </div>

        {/* Logs Card */}
        <Card className="w-full border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50/50 pb-4 border-b">
            <div className="flex items-center gap-2">
               <CardTitle>Daemon Runtime Logs (Tail)</CardTitle>
               <Tooltip>
                 <TooltipTrigger><Info className="h-4 w-4 text-slate-400" /></TooltipTrigger>
                 <TooltipContent>
                   <p>Live feed of the background factory daemon processes, including Playwright scraping, LLM API generation loops, and Vercel deployments.</p>
                 </TooltipContent>
               </Tooltip>
            </div>
            <CardDescription>Real-time output from the autonomous orchestration engine.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
             <pre className="bg-slate-950 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap break-words border shadow-inner">
                {logs || 'Loading logs...'}
             </pre>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Apps Table */}
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <div className="flex items-center gap-2">
                 <CardTitle>Discovered & Processed Apps</CardTitle>
                 <Tooltip>
                   <TooltipTrigger><Info className="h-4 w-4 text-slate-400" /></TooltipTrigger>
                   <TooltipContent>
                     <p>A historical record of all trending utility apps discovered via RSS feeds and successfully analyzed by the Gemini feasibility filter.</p>
                   </TooltipContent>
                 </Tooltip>
              </div>
              <CardDescription>Apps currently ingested into the database.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Target App Name</TableHead>
                    <TableHead className="text-right">Processed Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apps.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No applications processed yet.</TableCell></TableRow>
                  ) : (
                      apps.map(app => (
                          <TableRow key={app.id}>
                              <TableCell className="font-medium">{app.id}</TableCell>
                              <TableCell>{app.app_name}</TableCell>
                              <TableCell className="text-right text-slate-500">{new Date(app.processed_at).toLocaleString()}</TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Routes Table */}
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
               <div className="flex items-center gap-2">
                 <CardTitle>Active Subdomain Deployments</CardTitle>
                 <Tooltip>
                   <TooltipTrigger><Info className="h-4 w-4 text-slate-400" /></TooltipTrigger>
                   <TooltipContent>
                     <p>Live web URLs dynamically provisioned via the Vercel API. Copy the Embed Snippet to quickly render the Vanilla JS utility in your CMS.</p>
                   </TooltipContent>
                 </Tooltip>
              </div>
              <CardDescription>Currently hosted generated utilities & embed snippets.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Slug</TableHead>
                    <TableHead>Live Subdomain Route</TableHead>
                    <TableHead className="text-right">Embed Snippet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {routes.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No active routes found.</TableCell></TableRow>
                  ) : (
                      routes.map(route => (
                          <TableRow key={route.id}>
                              <TableCell className="font-medium text-slate-500">{route.slug}</TableCell>
                              <TableCell>
                                  <a href={`https://${route.subdomain}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1">
                                      {route.subdomain}
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                  </a>
                              </TableCell>
                              <TableCell className="text-right">
                                  <button onClick={() => copyIframe(route.subdomain)} className="text-xs inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 px-2 rounded border border-slate-300 transition-colors">
                                     <CodeXml size={12} />
                                     Copy Iframe
                                  </button>
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
    </TooltipProvider>
  );
}
