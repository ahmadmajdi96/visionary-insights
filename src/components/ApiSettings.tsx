import { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { getApiHost, getJobsApiHost, setApiUrls, resetApiUrls, API_STORAGE_KEY, API_JOBS_STORAGE_KEY } from '@/services/api';

export function ApiSettings() {
  const [open, setOpen] = useState(false);
  const [mainUrl, setMainUrl] = useState('');
  const [jobsUrl, setJobsUrl] = useState('');

  useEffect(() => {
    if (open) {
      setMainUrl(getApiHost());
      setJobsUrl(getJobsApiHost());
    }
  }, [open]);

  const handleSave = () => {
    let main = mainUrl.trim().replace(/\/+$/, '');
    let jobs = jobsUrl.trim().replace(/\/+$/, '');
    if (!main || !jobs) {
      toast({ title: '❌ Invalid URL', description: 'Please enter valid URLs.', variant: 'destructive' });
      return;
    }
    if (!main.startsWith('http')) main = 'https://' + main;
    if (!jobs.startsWith('http')) jobs = 'https://' + jobs;
    setApiUrls(main, jobs);
    toast({ title: '✅ API URLs Updated', description: 'Reloading...' });
    setOpen(false);
    window.location.reload();
  };

  const handleReset = () => {
    resetApiUrls();
    toast({ title: '🔄 API URLs Reset', description: 'Using defaults. Reloading...' });
    setOpen(false);
    window.location.reload();
  };

  const isCustom = !!localStorage.getItem(API_STORAGE_KEY) || !!localStorage.getItem(API_JOBS_STORAGE_KEY);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full relative">
          <Settings className="w-5 h-5" />
          {isCustom && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
          <DialogDescription>
            Set your Cloudflare tunnel URLs. Saved locally in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="main-url">Main API (Auth & Data)</Label>
            <Input id="main-url" placeholder="https://..." value={mainUrl} onChange={(e) => setMainUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobs-url">Jobs API (Inference)</Label>
            <Input id="jobs-url" placeholder="https://..." value={jobsUrl} onChange={(e) => setJobsUrl(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">The <code>/v1</code> prefix is appended automatically.</p>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1 gap-2">
              <Save className="w-4 h-4" /> Save & Reload
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
