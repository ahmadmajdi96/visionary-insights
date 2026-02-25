import { useState, useEffect, useMemo } from 'react';
import { History as HistoryIcon, Search, Filter, RefreshCw, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAllJobs } from '@/services/api';
import { Job, JobStatus } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const statusFilters: { label: string; value: JobStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Completed', value: 'SUCCEEDED' },
  { label: 'Running', value: 'RUNNING' },
  { label: 'Queued', value: 'QUEUED' },
  { label: 'Failed', value: 'FAILED' },
];

const History = () => {
  const { stores, planograms } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'ALL'>('ALL');

  const fetchJobs = async () => {
    try {
      const data = await getAllJobs();
      setJobs(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchJobs();
  };

  const filteredJobs = useMemo(() => {
    let result = jobs;
    if (statusFilter !== 'ALL') {
      result = result.filter(j => j.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(j =>
        j.job_id.toLowerCase().includes(q) ||
        j.planogram_id?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [jobs, statusFilter, searchQuery]);

  const getPlanogramName = (planogramId?: string) => {
    if (!planogramId) return null;
    return planograms.find(p => p.id === planogramId)?.name;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <HistoryIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-foreground">History</h1>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Loading...' : `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-full"
          >
            <RefreshCw className={cn('w-5 h-5', isRefreshing && 'animate-spin')} />
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by job ID or planogram..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
          {statusFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0',
                statusFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading job history...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
              <HistoryIcon className="w-10 h-10 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">No jobs found</h3>
            <p className="text-sm text-muted-foreground text-center">
              {searchQuery || statusFilter !== 'ALL' ? 'Try adjusting your filters' : 'Start scanning to see history here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job, i) => {
                const planogramName = getPlanogramName(job.planogram_id);
                const objectCount = job.images?.[0]?.objects?.length;
                return (
                  <motion.div
                    key={job.job_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.02 }}
                    className="bg-card rounded-xl p-4 shadow-soft cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => {
                      // Navigate if we know the store/planogram
                      // Otherwise just show info
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                        job.status === 'SUCCEEDED' ? 'bg-[hsl(var(--status-succeeded-bg))]' :
                        job.status === 'FAILED' ? 'bg-[hsl(var(--status-failed-bg))]' :
                        job.status === 'RUNNING' ? 'bg-[hsl(var(--status-running-bg))]' :
                        'bg-[hsl(var(--status-queued-bg))]'
                      )}>
                        <HistoryIcon className={cn(
                          'w-5 h-5',
                          job.status === 'SUCCEEDED' ? 'text-[hsl(var(--status-succeeded))]' :
                          job.status === 'FAILED' ? 'text-[hsl(var(--status-failed))]' :
                          job.status === 'RUNNING' ? 'text-[hsl(var(--status-running))]' :
                          'text-[hsl(var(--status-queued))]'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {job.job_id.slice(0, 16)}...
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {planogramName && (
                            <span className="text-xs text-muted-foreground truncate">{planogramName}</span>
                          )}
                          {objectCount != null && (
                            <span className="text-xs text-muted-foreground">{objectCount} objects</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {job.updated_at ? new Date(job.updated_at).toLocaleString() : 'Pending'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                          job.status === 'SUCCEEDED' ? 'status-succeeded' :
                          job.status === 'FAILED' ? 'status-failed' :
                          job.status === 'RUNNING' ? 'status-running' :
                          'status-queued'
                        )}>
                          {job.status}
                        </span>
                        {job.images?.[0]?.compliance && (
                          <span className="text-xs font-medium text-primary">
                            {job.images[0].compliance.match_percent.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
