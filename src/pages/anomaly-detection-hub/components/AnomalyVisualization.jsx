import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AnomalyVisualization = ({ anomalies, onAnomalyClick, selectedAnomaly }) => {
  const [viewMode, setViewMode] = useState('scatter');
  const [timeRange, setTimeRange] = useState('24h');

  const processedData = useMemo(() => {
    const now = Date.now();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };

    const filteredAnomalies = anomalies?.filter(anomaly => 
      now - anomaly?.detectedAt <= timeRanges?.[timeRange]
    );

    return filteredAnomalies?.map(anomaly => ({
      ...anomaly,
      x: anomaly?.confidence,
      y: anomaly?.impactScore,
      size: anomaly?.severity === 'critical' ? 8 : 
            anomaly?.severity === 'high' ? 6 : 
            anomaly?.severity === 'medium' ? 4 : 2
    }));
  }, [anomalies, timeRange]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#D97706';
      case 'medium': return '#F59E0B';
      case 'low': return '#059669';
      default: return '#6B7280';
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3 max-w-xs">
          <h4 className="font-medium text-popover-foreground mb-2">{data?.title}</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Confidence: {data?.confidence}%</p>
            <p>Impact Score: {data?.impactScore}</p>
            <p>Type: {data?.type}</p>
            <p>Severity: <span className={`font-medium ${
              data?.severity === 'critical' ? 'text-error' :
              data?.severity === 'high' ? 'text-warning' :
              data?.severity === 'medium'? 'text-accent' : 'text-success'
            }`}>{data?.severity}</span></p>
            <p>Detected: {new Date(data.detectedAt)?.toLocaleString()}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const statisticsData = useMemo(() => {
    const total = processedData?.length;
    const bySeverity = processedData?.reduce((acc, item) => {
      acc[item.severity] = (acc?.[item?.severity] || 0) + 1;
      return acc;
    }, {});
    
    const avgConfidence = total > 0 ? 
      processedData?.reduce((sum, item) => sum + item?.confidence, 0) / total : 0;
    
    const avgImpact = total > 0 ?
      processedData?.reduce((sum, item) => sum + item?.impactScore, 0) / total : 0;

    return {
      total,
      bySeverity,
      avgConfidence: Math.round(avgConfidence),
      avgImpact: Math.round(avgImpact)
    };
  }, [processedData]);

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Anomaly Visualization</h3>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e?.target?.value)}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <Button
              variant={viewMode === 'scatter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('scatter')}
              iconName="Scatter3D"
            >
              Scatter
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{statisticsData?.total}</div>
            <div className="text-sm text-muted-foreground">Total Anomalies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-error">{statisticsData?.bySeverity?.critical || 0}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{statisticsData?.avgConfidence}%</div>
            <div className="text-sm text-muted-foreground">Avg Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{statisticsData?.avgImpact}</div>
            <div className="text-sm text-muted-foreground">Avg Impact</div>
          </div>
        </div>
      </div>
      {/* Visualization */}
      <div className="p-4">
        {processedData?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Icon name="BarChart3" size={48} className="text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No Data Available</h4>
            <p className="text-sm text-muted-foreground">
              No anomalies detected in the selected time range.
            </p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Confidence" 
                  unit="%" 
                  domain={[0, 100]}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Impact Score" 
                  domain={[0, 100]}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter 
                  dataKey="y" 
                  onClick={(data) => onAnomalyClick(data?.id)}
                  cursor="pointer"
                >
                  {processedData?.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getSeverityColor(entry?.severity)}
                      stroke={selectedAnomaly === entry?.id ? 'var(--color-primary)' : 'transparent'}
                      strokeWidth={selectedAnomaly === entry?.id ? 2 : 0}
                      r={entry?.size}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {/* Legend */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-foreground">Severity:</span>
              <div className="flex items-center space-x-3">
                {[
                  { level: 'critical', color: '#DC2626', label: 'Critical' },
                  { level: 'high', color: '#D97706', label: 'High' },
                  { level: 'medium', color: '#F59E0B', label: 'Medium' },
                  { level: 'low', color: '#059669', label: 'Low' }
                ]?.map(({ level, color, label }) => (
                  <div key={level} className="flex items-center space-x-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Click on points to view details • X-axis: Detection Confidence • Y-axis: Impact Score
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyVisualization;