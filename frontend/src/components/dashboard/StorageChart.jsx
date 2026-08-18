import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { HardDrive, ShieldCheck } from 'lucide-react';
import { useDocuments } from '../../context/DocumentContext';

export const StorageChart = () => {
  const { metrics } = useDocuments();

  const data = metrics.storageBreakdown;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-700 font-mono">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-blue-300">{payload[0].value} MB</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Storage Breakdown</h3>
        </div>
        <span className="text-xs font-mono text-slate-500 font-medium">
          {metrics.storageUsedMB} MB / 1 GB
        </span>
      </div>

      {/* Donut Chart with Center Text */}
      <div className="relative h-52 my-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              innerRadius={62}
              outerRadius={84}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {metrics.storagePercentage}%
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Used
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}:</span>
            <span className="font-semibold text-slate-900 dark:text-white font-mono ml-auto">
              {item.value}M
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
