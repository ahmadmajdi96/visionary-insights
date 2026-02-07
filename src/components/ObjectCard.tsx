import { motion } from 'framer-motion';
import { JobObject } from '@/types/job';
import { getImageUrl } from '@/services/api';

interface ObjectCardProps {
  object: JobObject;
  index: number;
}

export function ObjectCard({ object, index }: ObjectCardProps) {
  const confidencePercent = Math.round(object.confidence * 100);
  const predConfidencePercent = Math.round(object.pred_confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-lg shadow-soft overflow-hidden"
    >
      {/* Object Image */}
      <div className="aspect-square bg-muted">
        <img
          src={getImageUrl(object.crop)}
          alt={object.label}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>

      {/* Object Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground capitalize">
            {object.label}
          </span>
          <span className="text-xs font-medium text-primary">
            {confidencePercent}%
          </span>
        </div>

        {/* Prediction */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Prediction: <span className="font-medium">{object.pred_label}</span>
          </span>
          <span className="text-xs text-muted-foreground">
            {predConfidencePercent}%
          </span>
        </div>

        {/* Confidence bar */}
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidencePercent}%` }}
            transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
