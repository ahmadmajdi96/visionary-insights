import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, LayoutGrid } from 'lucide-react';
import { JobImage } from '@/types/job';

interface PlanogramViewProps {
  image: JobImage;
}

export function PlanogramView({ image }: PlanogramViewProps) {
  const compliance = image.compliance;
  const planogram = image.planogram?.planogram || [];

  const matchPercent = compliance?.match_percent ?? 0;
  const totalExpected = compliance?.total_expected ?? 0;
  const totalMatched = compliance?.total_matched ?? 0;

  const isGood = matchPercent >= 80;
  const isOkay = matchPercent >= 50 && matchPercent < 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Compliance Score Card */}
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          {isGood ? (
            <CheckCircle2 className="w-5 h-5 text-status-succeeded" />
          ) : (
            <XCircle className="w-5 h-5 text-status-failed" />
          )}
          <h3 className="text-sm font-semibold text-foreground">Planogram Compliance</h3>
        </div>

        {/* Big percentage */}
        <div className="text-center mb-4">
          <span className={`text-5xl font-bold ${
            isGood ? 'text-status-succeeded' : isOkay ? 'text-yellow-500' : 'text-status-failed'
          }`}>
            {matchPercent.toFixed(1)}%
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            {totalMatched} of {totalExpected} expected positions matched
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${matchPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isGood ? 'bg-status-succeeded' : isOkay ? 'bg-yellow-500' : 'bg-status-failed'
            }`}
          />
        </div>
      </div>

      {/* Expected Planogram Layout */}
      {planogram.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Expected Planogram</h3>
          </div>

          <div className="space-y-3">
            {planogram.map((shelf, shelfIdx) => (
              <div key={shelfIdx}>
                <p className="text-xs text-muted-foreground mb-1.5">Shelf {shelfIdx + 1}</p>
                <div className="flex flex-wrap gap-1.5">
                  {shelf.map((product, prodIdx) => (
                    <span
                      key={prodIdx}
                      className="text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary font-medium truncate max-w-[120px]"
                      title={product}
                    >
                      {product.replace(/-/g, ' ')}
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
