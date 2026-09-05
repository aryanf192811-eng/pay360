import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store-context';

export function OrgChart() {
  const { employees } = useStore();

  // Basic hierarchy parsing based on roles to create a cool visual
  const hierarchy = useMemo(() => {
    const cLevel = employees.filter(e => e.role.includes('VP') || e.role.includes('CTO') || e.role.includes('Director'));
    const managers = employees.filter(e => e.role.includes('Manager') && !cLevel.find(c => c.id === e.id));
    const ICs = employees.filter(e => !cLevel.find(c => c.id === e.id) && !managers.find(m => m.id === e.id));
    
    return [cLevel, managers, ICs];
  }, [employees]);

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-start p-10 bg-slate-50/50 relative overflow-hidden rounded-3xl border border-slate-200">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#714B67]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00A09D]/5 rounded-full blur-3xl -z-10" />
      
      <div className="text-center mb-12">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Organization Structure</h2>
        <p className="text-slate-500 font-medium text-sm mt-1">Interactive overview of reporting lines</p>
      </div>

      <div className="flex flex-col items-center gap-16 w-full max-w-5xl relative z-10">
        {hierarchy.map((level, levelIdx) => (
          <div key={levelIdx} className="flex flex-wrap justify-center gap-8 md:gap-16 relative w-full">
            {/* Draw connecting lines if not first level */}
            {levelIdx > 0 && (
              <svg className="absolute -top-16 left-0 w-full h-16 pointer-events-none -z-10 overflow-visible">
                {level.map((emp, empIdx) => {
                  return (
                    <motion.path
                      key={emp.id}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.3 }}
                      transition={{ duration: 1.5, delay: levelIdx * 0.4 }}
                      d={`M 50% 0 L ${50 + (empIdx - level.length / 2) * 10}% 100%`}
                      stroke="#714B67"
                      strokeWidth="2"
                      fill="none"
                      className="vector-line"
                    />
                  );
                })}
              </svg>
            )}

            {level.map((emp, i) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: levelIdx * 0.2 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-[#714B67]/40 transition-all cursor-pointer flex flex-col items-center min-w-[180px] z-20 group relative"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md mb-3 group-hover:border-[#714B67]/20 transition-all">
                  <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm text-center">{emp.name}</h3>
                <p className="text-[10px] font-bold text-[#714B67] uppercase tracking-wider text-center mt-1 bg-[#714B67]/5 px-2 py-1 rounded-md">
                  {emp.role}
                </p>
                <div className="text-[10px] text-slate-400 font-medium mt-2">
                  {emp.department}
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
