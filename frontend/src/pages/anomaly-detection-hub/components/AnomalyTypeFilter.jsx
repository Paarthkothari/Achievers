import React from 'react';
import Button from '../../../components/ui/Button';


const AnomalyTypeFilter = ({ 
  selectedTypes, 
  onTypeToggle, 
  severityLevel, 
  onSeverityChange,
  sensitivity,
  onSensitivityChange,
  autoDetection,
  onAutoDetectionToggle
}) => {
  const anomalyTypes = [
    { id: 'duplicate', label: 'Duplicate Entries', icon: 'Copy', count: 23 },
    { id: 'signature', label: 'Suspicious Signatures', icon: 'FileSignature', count: 8 },
    { id: 'inconsistent', label: 'Inconsistent Data', icon: 'AlertTriangle', count: 15 },
    { id: 'missing', label: 'Missing Records', icon: 'FileX', count: 5 },
    { id: 'temporal', label: 'Temporal Anomalies', icon: 'Clock', count: 12 }
  ];

  const severityLevels = [
    { value: 'all', label: 'All Levels', color: 'text-muted-foreground' },
    { value: 'critical', label: 'Critical', color: 'text-error' },
    { value: 'high', label: 'High', color: 'text-warning' },
    { value: 'medium', label: 'Medium', color: 'text-accent' },
    { value: 'low', label: 'Low', color: 'text-success' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
        {/* Anomaly Type Filters */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground mb-3">Anomaly Types</h3>
          <div className="flex flex-wrap gap-2">
            {anomalyTypes?.map((type) => (
              <Button
                key={type?.id}
                variant={selectedTypes?.includes(type?.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTypeToggle(type?.id)}
                iconName={type?.icon}
                iconPosition="left"
                className="relative"
              >
                {type?.label}
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  selectedTypes?.includes(type?.id) 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {type?.count}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Severity Level Selector */}
        <div className="flex-shrink-0">
          <h3 className="text-sm font-medium text-foreground mb-3">Severity Level</h3>
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            {severityLevels?.map((level) => (
              <button
                key={level?.value}
                onClick={() => onSeverityChange(level?.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  severityLevel === level?.value
                    ? 'bg-card shadow-sm text-foreground'
                    : `hover:bg-card/50 ${level?.color}`
                }`}
              >
                {level?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detection Controls */}
        <div className="flex-shrink-0 space-y-3">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Detection Sensitivity</h3>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-muted-foreground">Low</span>
              <input
                type="range"
                min="1"
                max="10"
                value={sensitivity}
                onChange={(e) => onSensitivityChange(parseInt(e?.target?.value))}
                className="w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-muted-foreground">High</span>
              <span className="text-sm font-medium text-foreground min-w-[2rem]">{sensitivity}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onAutoDetectionToggle}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                autoDetection ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                  autoDetection ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-foreground">Auto-Detection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyTypeFilter;