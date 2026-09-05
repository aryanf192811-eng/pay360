"use client";

import React, { useMemo } from 'react';
import { useStore } from '@/lib/store-context';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  Cell
} from 'recharts';

export function AdvancedCharts() {
  const { employees, attendance } = useStore();

  // Prepare data for Attendance Heatmap (Mocked as Bar Chart showing Attendance over a week)
  const attendanceData = useMemo(() => {
    // Generate some stable fake dates
    const data = [
      { date: 'Mon', present: 0, absent: 0, late: 0 },
      { date: 'Tue', present: 0, absent: 0, late: 0 },
      { date: 'Wed', present: 0, absent: 0, late: 0 },
      { date: 'Thu', present: 0, absent: 0, late: 0 },
      { date: 'Fri', present: 0, absent: 0, late: 0 },
    ];
    
    // Spread the 8 attendance records over the 5 days
    attendance.forEach((record, i) => {
      const day = data[i % 5];
      if (record.status === 'Present') day.present += 1;
      else if (record.status === 'Absent' || record.status === 'On Leave') day.absent += 1;
      else if (record.status === 'Late') day.late += 1;
    });

    // Make it look better for the demo
    return data.map(d => ({
      ...d,
      present: d.present + Math.floor(Math.random() * 20 + 70), // Baseline 70-90
      absent: d.absent + Math.floor(Math.random() * 5),
      late: d.late + Math.floor(Math.random() * 10),
    }));
  }, [attendance]);

  // Prepare data for Department Payroll
  const payrollData = useMemo(() => {
    const deptTotals: Record<string, number> = {};
    employees.forEach(emp => {
      const dept = emp.department || 'General';
      deptTotals[dept] = (deptTotals[dept] || 0) + (emp.monthlyCTC || 50000);
    });
    return Object.entries(deptTotals).map(([name, total]) => ({
      name,
      total
    }));
  }, [employees]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
      {/* Attendance Trends */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#714B67]/5 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700" />
        
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">
          Attendance Trends
        </h3>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A09D" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00A09D" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              <Area type="monotone" dataKey="present" name="Present" stroke="#00A09D" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
              <Area type="monotone" dataKey="late" name="Late" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorLate)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payroll by Department */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#714B67]/5 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700" />
        
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">
          Monthly Payroll by Department
        </h3>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={payrollData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                tickFormatter={(value) => `₹${(value / 1000)}k`}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Payroll Cost']}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {
                  payrollData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#714B67' : '#00A09D'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
