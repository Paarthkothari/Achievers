import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ControlBar = ({ 
  processingMode, 
  onProcessingModeChange, 
  autoRefresh, 
  onAutoRefreshToggle,
  onBulkAction,
  onRefresh 
}) => {
  const [selectedAction, setSelectedAction] = useState('');

  const processingModeOptions = [
    { value: 'batch', label: 'Batch Processing', description: 'Process multiple files together' },
    { value: 'individual', label: 'Individual Processing', description: 'Process files one by one' },
    { value: 'priority', label: 'Priority Queue', description: 'High priority files first' }
  ];

  const bulkActionOptions = [
    { value: '', label: 'Select Action' },
    { value: 'retry_failed', label: 'Retry Failed Items' },
    { value: 'cancel_waiting', label: 'Cancel Waiting Items' },
    { value: 'clear_completed', label: 'Clear Completed Items' },
    { value: 'export_results', label: 'Export All Results' }
  ];

  const handleBulkAction = () => {
    if (selectedAction && onBulkAction) {
      onBulkAction(selectedAction);
      setSelectedAction('');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Left Section - Processing Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Processing Mode Selector */}
          <div className="flex items-center space-x-2">
            <Icon name="Settings" size={16} className="text-muted-foreground" />
            <Select
              options={processingModeOptions}
              value={processingMode}
              onChange={onProcessingModeChange}
              placeholder="Processing Mode"
              className="w-48"
            />
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onAutoRefreshToggle}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${autoRefresh 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              <Icon 
                name={autoRefresh ? "Pause" : "Play"} 
                size={14} 
                className={autoRefresh ? "animate-pulse" : ""}
              />
              <span>Auto Refresh</span>
              {autoRefresh && (
                <span className="text-xs opacity-80">(10s)</span>
              )}
            </button>
          </div>

          {/* Manual Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center space-x-2"
          >
            <Icon name="RefreshCw" size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Right Section - Bulk Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Bulk Actions */}
          <div className="flex items-center space-x-2">
            <Select
              options={bulkActionOptions}
              value={selectedAction}
              onChange={setSelectedAction}
              placeholder="Bulk Actions"
              className="w-48"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkAction}
              disabled={!selectedAction}
            >
              <Icon name="Play" size={14} className="mr-1" />
              Execute
            </Button>
          </div>

          {/* System Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-muted/30 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">System Online</span>
          </div>
        </div>
      </div>
      {/* Processing Mode Info */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium mb-1">
              Current Mode: {processingModeOptions?.find(opt => opt?.value === processingMode)?.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {processingModeOptions?.find(opt => opt?.value === processingMode)?.description}
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="text-center">
              <p className="font-medium text-foreground">2.3s</p>
              <p>Avg Processing</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">94%</p>
              <p>Success Rate</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">156</p>
              <p>Files Today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;