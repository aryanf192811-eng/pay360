import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { apiClient } from '../api/client';
import { cn } from '../lib/utils';

async function pingHealth() {
  const { data } = await apiClient.get('/health');
  return data;
}

// A real, live status indicator (polls the actual /health endpoint) instead of a decorative
// static "All Systems Operational" string — if the API is actually down, this footer says so.
export function Footer() {
  const { data, isError } = useQuery({
    queryKey: ['health'],
    queryFn: pingHealth,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1,
  });

  const online = !isError && !!data;

  return (
    <footer className="mt-32 flex flex-wrap items-center justify-between gap-12 border-t border-border px-24 py-16 text-xs text-text-muted lg:px-32">
      <div className="flex items-center gap-8">
        <div className="flex h-[20px] w-[20px] items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent font-mono text-[10px] font-bold text-white">
          P
        </div>
        <span>&copy; {new Date().getFullYear()} PeoplePay360</span>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-6"
      >
        <span className={cn('h-8 w-8 rounded-full', online ? 'bg-success' : 'bg-danger')} />
        {online ? 'All systems operational' : 'API unreachable'}
      </motion.div>
    </footer>
  );
}
