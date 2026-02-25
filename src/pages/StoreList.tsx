import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, MapPin, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const StoreList = () => {
  const { stores, user, getStorePlanograms } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-foreground">My Stores</h1>
            <p className="text-xs text-muted-foreground">{user?.username}</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-3">
        {stores.map((store, i) => {
          const planogramCount = getStorePlanograms(store.id).length;
          return (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/stores/${store.id}/planograms`)}
              className="bg-card rounded-xl p-4 shadow-soft cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground truncate">{store.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{store.city}, {store.country}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {planogramCount} planogram{planogramCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </motion.div>
          );
        })}
      </main>
    </div>
  );
};

export default StoreList;
