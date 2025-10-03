import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';


const HistoricalTrendsChart = ({ historicalData }) => {
  const [chartType, setChartType] = useState('detection');
  const [timeRange, setTimeRange] = useState('7d');

  const processedData = useMemo(() => {
    const now = Date.now();
    const timeRanges = {
      '24h': { duration: 24 * 60 * 60 * 1000, interval: 'hour' },
      '7d': { duration: 7 * 24 * 60 * 60 * 1000, interval: 'day' },
      '30d': { duration: 30 * 24 * 60 * 60 * 1000, interval: 'day' },
      '90d': { duration: 90 * 24 * 60 * 60 * 1000, interval: 'week' }
    };

    const range = timeRanges?.[timeRange];
    const startTime = now - range?.duration;

    // Generate time series data
    const dataPoints = [];
    const intervalMs = range?.interval === 'hour' ? 60 * 60 * 1000 :
                      range?.interval === 'day' ? 24 * 60 * 60 * 1000 :
                      7 * 24 * 60 * 60 * 1000;

    for (let time = startTime; time <= now; time += intervalMs) {
      const date = new Date(time);
      const dateStr = range?.interval === 'hour' ? date?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : range?.interval === 'day' ? date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : `Week ${Math.ceil(date?.getDate() / 7)}`;

      // Simulate data based on time patterns
      const baseDetections = Math.floor(Math.random() * 20) + 5;
      const baseResolutions = Math.floor(baseDetections * (0.7 + Math.random() * 0.25));
      const accuracy = 85 + Math.random() * 10;
      const avgResolutionTime = 15 + Math.random() * 30;

      dataPoints?.push({
        time: dateStr,
        timestamp: time,
        detections: baseDetections,
        resolutions: baseResolutions,
        accuracy: Math.round(accuracy),
        avgResolutionTime: Math.round(avgResolutionTime),
        critical: Math.floor(baseDetections * 0.1),
        high: Math.floor(baseDetections * 0.2),
        medium: Math.floor(baseDetections * 0.4),
        low: Math.floor(baseDetections * 0.3)
      });
    }

    return dataPoints;
  }, [timeRange]);

  const chartConfigs = {
    detection: {
      title: 'Detection & Resolution Trends',
      lines: [
        { key: 'detections', name: 'Detections', color: '#1E3A8A', strokeWidth: 2 },
        { key: 'resolutions', name: 'Resolutions', color: '#059669', strokeWidth: 2 }
      ]
    },
    accuracy: {
      title: 'Detection Accuracy Over Time',
      lines: [
        { key: 'accuracy', name: 'Accuracy %', color: '#F59E0B', strokeWidth: 3 }
      ]
    },
    performance: {
      title: 'Resolution Performance',
      lines: [
        { key: 'avgResolutionTime', name: 'Avg Resolution Time (min)', color: '#DC2626', strokeWidth: 2 }
      ]
    },
    severity: {
      title: 'Anomalies by Severity',
      type: 'bar',
      bars: [
        { key: 'critical', name: 'Critical', color: '#DC2626' },
        { key: 'high', name: 'High', color: '#D97706' },
        { key: 'medium', name: 'Medium', color: '#F59E0B' },
        { key: 'low', name: 'Low', color: '#059669' }
      ]
    }
  };

  const currentConfig = chartConfigs?.[chartType];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {entry?.name}: {entry?.value}
              {chartType === 'accuracy' && '%'}
              {chartType === 'performance' && ' min'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const summaryStats = useMemo(() => {
    const totalDetections = processedData?.reduce((sum, item) => sum + item?.detections, 0);
    const totalResolutions = processedData?.reduce((sum, item) => sum + item?.resolutions, 0);
    const avgAccuracy = processedData?.reduce((sum, item) => sum + item?.accuracy, 0) / processedData?.length;
    const avgResolutionTime = processedData?.reduce((sum, item) => sum + item?.avgResolutionTime, 0) / processedData?.length;

    return {
      totalDetections,
      totalResolutions,
      resolutionRate: Math.round((totalResolutions / totalDetections) * 100),
      avgAccuracy: Math.round(avgAccuracy),
      avgResolutionTime: Math.round(avgResolutionTime)
    };
  }, [processedData]);

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <h3 className="text-lg font-semibold text-foreground">Historical Trends</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Chart Type Selector */}
            <div className="flex space-x-1 bg-muted rounded-lg p-1">
              {Object.entries(chartConfigs)?.map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setChartType(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                    chartType === key
                      ? 'bg-card shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {config?.title?.split(' ')?.[0]}
                </button>
              ))}
            </div>

            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e?.target?.value)}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="text-center">
            <div className="text-xl font-bold text-foreground">{summaryStats?.totalDetections}</div>
            <div className="text-xs text-muted-foreground">Total Detections</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-success">{summaryStats?.totalResolutions}</div>
            <div className="text-xs text-muted-foreground">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-primary">{summaryStats?.resolutionRate}%</div>
            <div className="text-xs text-muted-foreground">Resolution Rate</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-accent">{summaryStats?.avgAccuracy}%</div>
            <div className="text-xs text-muted-foreground">Avg Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-warning">{summaryStats?.avgResolutionTime}m</div>
            <div className="text-xs text-muted-foreground">Avg Resolution</div>
          </div>
        </div>
      </div>
      {/* Chart */}
      <div className="p-4">
        <h4 className="text-md font-medium text-foreground mb-4">{currentConfig?.title}</h4>
        
        {processedData?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Icon name="TrendingUp" size={48} className="text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No Historical Data</h4>
            <p className="text-sm text-muted-foreground">
              Historical trends will appear here once data is available.
            </p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {currentConfig?.type === 'bar' ? (
                <BarChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {currentConfig?.bars?.map((bar) => (
                    <Bar
                      key={bar?.key}
                      dataKey={bar?.key}
                      name={bar?.name}
                      fill={bar?.color}
                      stackId="severity"
                    />
                  ))}
                </BarChart>
              ) : (
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {currentConfig?.lines?.map((line) => (
                    <Line
                      key={line?.key}
                      type="monotone"
                      dataKey={line?.key}
                      name={line?.name}
                      stroke={line?.color}
                      strokeWidth={line?.strokeWidth}
                      dot={{ fill: line?.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: line?.color, strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {/* Insights */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={16} className="text-accent mt-0.5" />
          <div className="flex-1">
            <h5 className="text-sm font-medium text-foreground mb-1">Key Insights</h5>
            <div className="text-sm text-muted-foreground space-y-1">
              {chartType === 'detection' && (
                <>
                  <p>• Detection rate has {summaryStats?.resolutionRate > 80 ? 'remained stable' : 'shown fluctuation'} over the selected period</p>
                  <p>• Resolution efficiency is {summaryStats?.resolutionRate > 85 ? 'excellent' : summaryStats?.resolutionRate > 70 ? 'good' : 'needs improvement'} at {summaryStats?.resolutionRate}%</p>
                </>
              )}
              {chartType === 'accuracy' && (
                <>
                  <p>• Average detection accuracy is {summaryStats?.avgAccuracy}% across all anomaly types</p>
                  <p>• Accuracy trends show {summaryStats?.avgAccuracy > 90 ? 'excellent' : 'room for improvement'} model performance</p>
                </>
              )}
              {chartType === 'performance' && (
                <>
                  <p>• Average resolution time is {summaryStats?.avgResolutionTime} minutes per anomaly</p>
                  <p>• Performance is {summaryStats?.avgResolutionTime < 20 ? 'excellent' : summaryStats?.avgResolutionTime < 40 ? 'good' : 'needs optimization'}</p>
                </>
              )}
              {chartType === 'severity' && (
                <>
                  <p>• Critical anomalies represent the smallest portion of total detections</p>
                  <p>• Medium severity anomalies are most common, indicating effective threshold tuning</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrendsChart;