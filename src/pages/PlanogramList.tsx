import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const PlanogramList = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { stores, getStorePlanograms } = useAuth();
  const navigate = useNavigate();

  const store = stores.find((s) => s.id === storeId);
  const planograms = storeId ? getStorePlanograms(storeId) : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/stores')} className="w-10 h-10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-foreground">Planograms</h1>
            <p className="text-xs text-muted-foreground">{store?.name}</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-3">
        {planograms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
              <LayoutGrid className="w-10 h-10 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">No planograms</h3>
            <p className="text-sm text-muted-foreground text-center">No planograms assigned to this store yet</p>
          </div>
        ) : (
          planograms.map((plano, i) => (
            <motion.div
              key={plano.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/stores/${storeId}/planograms/${plano.id}`)}
              className="bg-card rounded-xl p-4 shadow-soft cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground truncate">{plano.name}</h3>
                  {plano.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{plano.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                      {plano.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {plano.layout.length} slot{plano.layout.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </motion.div>
          ))
        )}
      </main>
    </div>
  );
};

export default PlanogramList;
