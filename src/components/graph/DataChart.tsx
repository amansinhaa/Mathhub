'use client';

import React, { useMemo } from 'react';
import { LineChart, ScatterChart, BarChart, AreaChart, Line, Scatter, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useGraphStore } from '@/stores/graphStore';
import { linearRegression } from '@/lib/utils/regression';

export default function DataChart() {
  const { dataPoints, chartType, regressionType } = useGraphStore();

  const regression = useMemo(() => {
    if (regressionType === 'linear' && dataPoints.length > 1) {
      const res = linearRegression(dataPoints);
      return {
        ...res,
        data: dataPoints.map(p => ({ x: p.x, yPred: res.predict(p.x) }))
      };
    }
    return null;
  }, [dataPoints, regressionType]);

  const renderChart = () => {
    switch (chartType) {
      case 'scatter':
        return (
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="X" />
            <YAxis type="number" dataKey="y" name="Y" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Data" data={dataPoints} fill="#3b82f6" />
            {regression && (
              <Line data={regression.data} dataKey="yPred" stroke="#ef4444" dot={false} strokeWidth={2} activeDot={false} legendType="none" />
            )}
          </ScatterChart>
        );
      case 'bar':
        return (
          <BarChart data={dataPoints} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="y" fill="#10b981" />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={dataPoints} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="y" stroke="#8b5cf6" fill="#8b5cf6" />
          </AreaChart>
        );
      case 'line':
      default:
        return (
          <LineChart data={dataPoints} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="y" stroke="#3b82f6" activeDot={{ r: 8 }} />
            {regression && (
              <Line data={regression.data} type="linear" dataKey="yPred" stroke="#ef4444" dot={false} strokeWidth={2} />
            )}
          </LineChart>
        );
    }
  };

  return (
    <div className="w-full h-full min-h-[400px] bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
