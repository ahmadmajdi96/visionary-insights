import { useLocation, useNavigate } from 'react-router-dom';
import { Store, History, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'stores', label: 'Stores', icon: Store, path: '/stores' },
  { id: 'history', label: 'History', icon: History, path: '/history' },
  { id: 'dashboard', label: 'Analytics', icon: BarChart3, path: '/dashboard' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export function BottomTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    for (const tab of tabs) {
      if (location.pathname.startsWith(tab.path)) return tab.id;
    }
    return 'stores';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -top-px left-3 right-3 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <tab.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
              <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
