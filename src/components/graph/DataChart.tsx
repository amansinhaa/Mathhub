'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  ScatterChart,
  BarChart,
  AreaChart,
  Line,
  Scatter,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useGraphStore } from '@/stores/graphStore';
import { useThemeStore } from '@/stores/themeStore';
import { linearRegression } from '@/lib/utils/regression';
import { BarChart3 } from 'lucide-react';

export default function DataChart() {
  const { dataPoints, chartType, regressionType } = useGraphStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const regression = useMemo(() => {
    if (regressionType === 'linear' && dataPoints.length > 1) {
      const res = linearRegression(dataPoints);
      return {
        ...res,
        data: dataPoints.map((p) => ({ x: p.x, yPred: res.predict(p.x) })),
      };
    }
    return null;
  }, [dataPoints, regressionType]);

  if (dataPoints.length === 0) {
    return (
      <div className="w-full h-full min-h-[420px] bg-white dark:bg-[#1B1B1B] rounded-2xl p-8 shadow-xs border border-[#E0E0E0] dark:border-[#2E2825] flex flex-col items-center justify-center text-center text-[#757575] dark:text-[#8D827A]">
        <BarChart3 size={40} className="text-[#BCAAA4] dark:text-[#3E2723] mb-3" />
        <p className="font-semibold text-[#131313] dark:text-white text-sm sm:text-base mb-1">
          No Data Points Entered
        </p>
        <p className="text-xs text-[#616161] dark:text-[#8D827A] max-w-sm">
          Add (X, Y) rows in the Data Table or upload a CSV file on the left to plot your chart.
        </p>
      </div>
    );
  }

  const gridStroke = isDark ? '#262220' : '#E5E7EB';
  const axisStroke = isDark ? '#8D827A' : '#616161';
  const tooltipStyle = isDark
    ? { backgroundColor: '#1B1B1B', borderColor: '#5D4037', color: '#fff', borderRadius: '12px' }
    : { backgroundColor: '#FFFFFF', borderColor: '#5D4037', color: '#131313', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };

  const renderChart = () => {
    switch (chartType) {
      case 'scatter':
        return (
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid stroke={gridStroke} />
            <XAxis type="number" dataKey="x" name="X" stroke={axisStroke} />
            <YAxis type="number" dataKey="y" name="Y" stroke={axisStroke} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
            <Legend />
            <Scatter name="Data" data={dataPoints} fill="#5D4037" />
            {regression && (
              <Line
                data={regression.data}
                dataKey="yPred"
                stroke={isDark ? '#D7CCC8' : '#3E2723'}
                dot={false}
                strokeWidth={2}
                activeDot={false}
                legendType="none"
              />
            )}
          </ScatterChart>
        );
      case 'bar':
        return (
          <BarChart data={dataPoints} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="x" stroke={axisStroke} />
            <YAxis stroke={axisStroke} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="y" fill="#5D4037" radius={[6, 6, 0, 0]} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={dataPoints} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="x" stroke={axisStroke} />
            <YAxis stroke={axisStroke} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Area type="monotone" dataKey="y" stroke="#5D4037" fill="#5D4037" fillOpacity={isDark ? 0.6 : 0.25} />
          </AreaChart>
        );
      case 'line':
      default:
        return (
          <LineChart data={dataPoints} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="x" stroke={axisStroke} />
            <YAxis stroke={axisStroke} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="y" stroke="#5D4037" strokeWidth={2.5} activeDot={{ r: 7, fill: '#5D4037' }} />
            {regression && (
              <Line
                data={regression.data}
                type="linear"
                dataKey="yPred"
                stroke={isDark ? '#D7CCC8' : '#3E2723'}
                dot={false}
                strokeWidth={2}
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <div className="w-full h-full min-h-[420px] bg-white dark:bg-[#1B1B1B] rounded-2xl p-4 shadow-sm border border-[#E0E0E0] dark:border-[#2E2825] transition-colors">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
