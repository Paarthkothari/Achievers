import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProcessingQueue = ({ queueItems, onRetry, onCancel }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success bg-success/10';
      case 'processing': return 'text-primary bg-primary/10';
      case 'failed': return 'text-error bg-error/10';
      case 'waiting': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'CheckCircle';
      case 'processing': return 'Loader';
      case 'failed': return 'XCircle';
      case 'waiting': return 'Clock';
      default: return 'Clock';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Processing Queue</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">
            {queueItems?.filter(item => item?.status === 'processing')?.length} active
          </span>
        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {queueItems?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No files in queue</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload files to start processing
            </p>
          </div>
        ) : (
          queueItems?.map((item) => (
            <div
              key={item?.id}
              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors duration-200"
            >
              {/* File Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Icon 
                    name={item?.type === 'pdf' ? 'FileText' : 'Image'} 
                    size={20} 
                    className="text-muted-foreground" 
                  />
                </div>
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item?.name}
                  </p>
                  <div className={`
                    flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                    ${getStatusColor(item?.status)}
                  `}>
                    <Icon 
                      name={getStatusIcon(item?.status)} 
                      size={12} 
                      className={item?.status === 'processing' ? 'animate-spin' : ''}
                    />
                    <span className="capitalize">{item?.status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item?.size)}
                  </p>
                  {item?.processingTime && (
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(item?.processingTime)}
                    </p>
                  )}
                </div>

                {/* Progress Bar for Processing Items */}
                {item?.status === 'processing' && (
                  <div className="mt-2">
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className="bg-primary h-1 rounded-full transition-all duration-300"
                        style={{ width: `${item?.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {item?.status === 'failed' && item?.error && (
                  <p className="text-xs text-error mt-1">{item?.error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex items-center space-x-1">
                {item?.status === 'failed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRetry(item?.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Icon name="RotateCcw" size={14} />
                  </Button>
                )}
                
                {(item?.status === 'waiting' || item?.status === 'failed') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCancel(item?.id)}
                    className="h-8 w-8 p-0 text-error hover:text-error"
                  >
                    <Icon name="X" size={14} />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Queue Summary */}
      {queueItems?.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-success">
                {queueItems?.filter(item => item?.status === 'completed')?.length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-lg font-bold text-primary">
                {queueItems?.filter(item => item?.status === 'processing')?.length}
              </p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </div>
            <div>
              <p className="text-lg font-bold text-muted-foreground">
                {queueItems?.filter(item => item?.status === 'waiting')?.length}
              </p>
              <p className="text-xs text-muted-foreground">Waiting</p>
            </div>
            <div>
              <p className="text-lg font-bold text-error">
                {queueItems?.filter(item => item?.status === 'failed')?.length}
              </p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingQueue;