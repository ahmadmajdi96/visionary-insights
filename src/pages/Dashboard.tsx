import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, XCircle, Clock, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllJobs } from '@/services/api';
import { Job } from '@/types/job';
import { motion } from 'framer-motion';

interface Stats {
  total: number;
  succeeded: number;
  failed: number;
  queued: number;
  running: number;
  avgCompliance: number;
}

const Dashboard = () => {
  const { user, stores, planograms } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ total: 0, succeeded: 0, failed: 0, queued: 0, running: 0, avgCompliance: 0 });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const allJobs = await getAllJobs();
        setJobs(allJobs);

        const succeeded = allJobs.filter(j => j.status === 'SUCCEEDED').length;
        const failed = allJobs.filter(j => j.status === 'FAILED').length;
        const queued = allJobs.filter(j => j.status === 'QUEUED').length;
        const running = allJobs.filter(j => j.status === 'RUNNING').length;

        // Calculate average compliance from available results
        const complianceScores = allJobs
          .filter(j => j.images?.[0]?.compliance?.match_percent != null)
          .map(j => j.images![0].compliance!.match_percent);
        const avgCompliance = complianceScores.length > 0
          ? complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length
          : 0;

        setStats({ total: allJobs.length, succeeded, failed, queued, running, avgCompliance });
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = [
    { label: 'Total Scans', value: stats.total, icon: Package, color: 'text-primary' },
    { label: 'Completed', value: stats.succeeded, icon: CheckCircle2, color: 'text-[hsl(var(--status-succeeded))]' },
    { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-[hsl(var(--status-failed))]' },
    { label: 'In Progress', value: stats.queued + stats.running, icon: Clock, color: 'text-[hsl(var(--status-running))]' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-foreground">Analytics</h1>
            <p className="text-xs text-muted-foreground">Overview & insights</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl p-4 shadow-soft"
            >
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">
                {isLoading ? '—' : card.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Compliance Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-5 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Avg. Compliance</span>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-display font-bold text-foreground">
              {isLoading ? '—' : `${stats.avgCompliance.toFixed(1)}%`}
            </p>
            <span className="text-xs text-muted-foreground mb-1">across all scans</span>
          </div>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.avgCompliance}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <p className="text-xs text-muted-foreground font-medium mb-1">Stores</p>
            <p className="text-2xl font-display font-bold text-foreground">{stores.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <p className="text-xs text-muted-foreground font-medium mb-1">Planograms</p>
            <p className="text-2xl font-display font-bold text-foreground">{planograms.length}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl p-5 shadow-soft">
          <h3 className="text-sm font-display font-semibold text-foreground mb-3">Recent Activity</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scans yet</p>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.job_id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    job.status === 'SUCCEEDED' ? 'bg-[hsl(var(--status-succeeded))]' :
                    job.status === 'FAILED' ? 'bg-[hsl(var(--status-failed))]' :
                    job.status === 'RUNNING' ? 'bg-[hsl(var(--status-running))]' :
                    'bg-[hsl(var(--status-queued))]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">
                      {job.job_id.slice(0, 12)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.updated_at ? new Date(job.updated_at).toLocaleDateString() : 'Pending'}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    job.status === 'SUCCEEDED' ? 'status-succeeded' :
                    job.status === 'FAILED' ? 'status-failed' :
                    job.status === 'RUNNING' ? 'status-running' :
                    'status-queued'
                  }`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
