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
import { getApiBaseUrl, getApiHost, setApiUrls, resetApiUrls, API_STORAGE_KEY } from '@/services/api';

export function ApiSettings() {
  const [open, setOpen] = useState(false);
  const [tunnelUrl, setTunnelUrl] = useState('');

  useEffect(() => {
    if (open) {
      // Show the current host (without /v1)
      setTunnelUrl(getApiHost());
    }
  }, [open]);

  const handleSave = () => {
    let url = tunnelUrl.trim().replace(/\/+$/, '');
    if (!url) {
      toast({ title: '❌ Invalid URL', description: 'Please enter a valid URL.', variant: 'destructive' });
      return;
    }
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    setApiUrls(url);
    toast({ title: '✅ API URL Updated', description: 'Refresh the page or pull to reload jobs.' });
    setOpen(false);
    // Reload to apply
    window.location.reload();
  };

  const handleReset = () => {
    resetApiUrls();
    toast({ title: '🔄 API URL Reset', description: 'Using default URL. Reloading...' });
    setOpen(false);
    window.location.reload();
  };

  const isCustom = !!localStorage.getItem(API_STORAGE_KEY);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full relative"
        >
          <Settings className="w-5 h-5" />
          {isCustom && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
          <DialogDescription>
            Set your Cloudflare tunnel URL. This is saved locally in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="tunnel-url">Tunnel URL</Label>
            <Input
              id="tunnel-url"
              placeholder="https://your-tunnel.trycloudflare.com"
              value={tunnelUrl}
              onChange={(e) => setTunnelUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The <code>/v1</code> prefix will be appended automatically.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              Save & Reload
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
