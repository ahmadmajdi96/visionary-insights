import { useNavigate } from 'react-router-dom';
import { User, LogOut, Mail, Shield, Store, LayoutGrid, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiSettings } from '@/components/ApiSettings';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, stores, planograms, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-foreground">Profile</h1>
            <p className="text-xs text-muted-foreground">Account & settings</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-5 shadow-soft"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-display font-bold text-foreground truncate">
                {user?.username || 'User'}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-xl p-4 shadow-soft"
          >
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Stores</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stores.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-4 shadow-soft"
          >
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Planograms</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{planograms.length}</p>
          </motion.div>
        </div>

        {/* Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl shadow-soft overflow-hidden"
        >
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-display font-semibold text-foreground flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </h3>
          </div>

          {/* API Settings */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">API Configuration</p>
              <p className="text-xs text-muted-foreground">Manage server endpoints</p>
            </div>
            <ApiSettings />
          </div>

          {/* Security */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Security</p>
                <p className="text-xs text-muted-foreground">Authenticated via JWT</p>
              </div>
            </div>
            <span className="text-xs font-medium text-primary px-2 py-1 rounded-full bg-accent">Active</span>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full h-12 rounded-xl gap-2 text-base font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
