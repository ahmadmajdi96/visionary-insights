import { motion } from 'framer-motion';
import { Package, Eye, EyeOff, ShoppingCart } from 'lucide-react';
import { JobImage } from '@/types/job';

interface OSAViewProps {
  image: JobImage;
}

export function OSAView({ image }: OSAViewProps) {
  const shelves = image.shelves;
  const totalKnown = shelves?.total_known ?? 0;
  const totalUnknown = shelves?.total_unknown ?? 0;
  const totalObjects = shelves?.total_objects ?? 0;

  // Aggregate all known products across shelves
  const productCounts: Record<string, number> = {};
  shelves?.shelves.forEach(shelf => {
    Object.entries(shelf.class_counts).forEach(([name, count]) => {
      productCounts[name] = (productCounts[name] || 0) + count;
    });
  });

  const sortedProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);
  const osaPercent = totalObjects > 0 ? (totalKnown / totalObjects) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* OSA Score Card */}
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">On-Shelf Availability</h3>
        </div>

        <div className="text-center mb-4">
          <span className={`text-5xl font-bold ${
            osaPercent >= 90 ? 'text-status-succeeded' : osaPercent >= 70 ? 'text-yellow-500' : 'text-status-failed'
          }`}>
            {osaPercent.toFixed(1)}%
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            {totalKnown} identified / {totalObjects} total products
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-secondary">
            <Package className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-bold text-foreground">{totalObjects}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary">
            <Eye className="w-4 h-4 mx-auto text-status-succeeded mb-1" />
            <p className="text-lg font-bold text-foreground">{totalKnown}</p>
            <p className="text-[10px] text-muted-foreground">Known</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary">
            <EyeOff className="w-4 h-4 mx-auto text-status-failed mb-1" />
            <p className="text-lg font-bold text-foreground">{totalUnknown}</p>
            <p className="text-[10px] text-muted-foreground">Unknown</p>
          </div>
        </div>
      </div>

      {/* Product Breakdown */}
      {sortedProducts.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Product Breakdown</h3>
          <div className="space-y-2.5">
            {sortedProducts.map(([name, count]) => {
              const pct = totalKnown > 0 ? (count / totalKnown) * 100 : 0;
              return (
                <div key={name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-foreground truncate max-w-[70%]">
                      {name.replace(/-/g, ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shelf Details */}
      {shelves && shelves.shelves.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Shelf Details</h3>
          <div className="space-y-3">
            {shelves.shelves.map(shelf => (
              <div key={shelf.shelf_index} className="p-3 rounded-lg bg-secondary">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-foreground">Shelf {shelf.shelf_index}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {shelf.known_count} known · {shelf.unknown_count} unknown
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {shelf.classes_left_to_right.map((cls, i) => (
                    <span
                      key={i}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        cls === 'UNKNOWN'
                          ? 'bg-status-failed/20 text-status-failed'
                          : 'bg-primary/10 text-primary'
                      } font-medium truncate max-w-[100px]`}
                      title={cls}
                    >
                      {cls === 'UNKNOWN' ? '?' : cls.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
