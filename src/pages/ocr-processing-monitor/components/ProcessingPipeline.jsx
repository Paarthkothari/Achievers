import React from 'react';
import Icon from '../../../components/AppIcon';

const ProcessingPipeline = ({ currentStage, progress, estimatedTime, throughput }) => {
  const stages = [
    {
      id: 'upload',
      name: 'Upload',
      icon: 'Upload',
      description: 'File validation & storage'
    },
    {
      id: 'ocr',
      name: 'OCR Processing',
      icon: 'FileText',
      description: 'Text & table extraction'
    },
    {
      id: 'validation',
      name: 'Validation',
      icon: 'CheckCircle',
      description: 'Data quality checks'
    },
    {
      id: 'normalization',
      name: 'Normalization',
      icon: 'Database',
      description: 'Format standardization'
    }
  ];

  const getStageStatus = (stageId) => {
    const stageIndex = stages?.findIndex(s => s?.id === stageId);
    const currentIndex = stages?.findIndex(s => s?.id === currentStage);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStageColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success bg-success/10 border-success';
      case 'active': return 'text-primary bg-primary/10 border-primary';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Processing Pipeline</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Progress: <span className="font-medium text-foreground">{progress}%</span>
          </div>
          {estimatedTime && (
            <div className="text-sm text-muted-foreground">
              ETA: <span className="font-medium text-foreground">{estimatedTime}</span>
            </div>
          )}
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      {/* Pipeline Stages */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {stages?.map((stage, index) => {
            const status = getStageStatus(stage?.id);
            const isActive = status === 'active';
            
            return (
              <div key={stage?.id} className="flex flex-col items-center space-y-3 flex-1">
                {/* Stage Icon */}
                <div className={`
                  relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300
                  ${getStageColor(status)}
                  ${isActive ? 'animate-pulse' : ''}
                `}>
                  <Icon name={stage?.icon} size={20} />
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping"></div>
                  )}
                </div>
                {/* Stage Info */}
                <div className="text-center">
                  <p className={`
                    text-sm font-medium
                    ${status === 'completed' ? 'text-success' : 
                      status === 'active' ? 'text-primary' : 'text-muted-foreground'}
                  `}>
                    {stage?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stage?.description}
                  </p>
                </div>
                {/* Connection Line */}
                {index < stages?.length - 1 && (
                  <div className={`
                    absolute top-6 h-0.5 transition-all duration-300
                    ${status === 'completed' ? 'bg-success' : 'bg-border'}
                  `}
                  style={{
                    left: `${((index + 1) / stages?.length) * 100 - (100 / stages?.length / 2)}%`,
                    width: `${100 / stages?.length}%`,
                    transform: 'translateX(-50%)'
                  }}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Metrics */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{throughput?.processed || 0}</p>
            <p className="text-sm text-muted-foreground">Files Processed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{throughput?.rate || '0'}/min</p>
            <p className="text-sm text-muted-foreground">Processing Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{throughput?.accuracy || '0'}%</p>
            <p className="text-sm text-muted-foreground">OCR Accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPipeline;