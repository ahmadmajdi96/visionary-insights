import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/stores');
    } catch {
      toast({ title: 'Login failed', description: 'Invalid credentials', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
            <Scan className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Image Scanner</h1>
          <p className="text-sm text-muted-foreground text-center">
            Sign in to access your stores and planograms
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-xl"
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl"
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Demo: use any email &amp; password
        </p>
      </div>
    </div>
  );
};

export default Login;
