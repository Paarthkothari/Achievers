import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ProcessingStatus = () => {
  const [processingQueue, setProcessingQueue] = useState([
    {
      id: 1,
      fileName: 'CS-301_Attendance_Oct03.pdf',
      status: 'processing',
      progress: 67,
      timeRemaining: '2 min',
      uploadedBy: 'Dr. Smith',
      size: '2.4 MB'
    },
    {
      id: 2,
      fileName: 'MATH-205_Attendance_Oct03.pdf',
      status: 'queued',
      progress: 0,
      timeRemaining: '5 min',
      uploadedBy: 'Prof. Johnson',
      size: '1.8 MB'
    },
    {
      id: 3,
      fileName: 'PHY-102_Attendance_Oct02.pdf',
      status: 'completed',
      progress: 100,
      timeRemaining: null,
      uploadedBy: 'Dr. Wilson',
      size: '3.1 MB'
    }
  ]);

  const [connectionStatus, setConnectionStatus] = useState('connected');

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setProcessingQueue(prev => 
        prev?.map(item => {
          if (item?.status === 'processing' && item?.progress < 100) {
            const newProgress = Math.min(item?.progress + Math.random() * 10, 100);
            return {
              ...item,
              progress: Math.round(newProgress),
              status: newProgress >= 100 ? 'completed' : 'processing',
              timeRemaining: newProgress >= 100 ? null : `${Math.ceil((100 - newProgress) / 10)} min`
            };
          }
          return item;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing': return 'Loader2';
      case 'queued': return 'Clock';
      case 'completed': return 'CheckCircle';
      case 'error': return 'XCircle';
      default: return 'FileText';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'text-primary';
      case 'queued': return 'text-warning';
      case 'completed': return 'text-success';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'processing': return 'bg-primary/10';
      case 'queued': return 'bg-warning/10';
      case 'completed': return 'bg-success/10';
      case 'error': return 'bg-error/10';
      default: return 'bg-muted';
    }
  };

  const activeProcessing = processingQueue?.filter(item => item?.status === 'processing')?.length;
  const queuedItems = processingQueue?.filter(item => item?.status === 'queued')?.length;
  const completedToday = processingQueue?.filter(item => item?.status === 'completed')?.length;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Processing Status</h3>
          <p className="text-sm text-muted-foreground">Real-time OCR processing queue</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-success' : 'bg-error'}`}></div>
          <span className="text-xs text-muted-foreground capitalize">{connectionStatus}</span>
        </div>
      </div>
      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{activeProcessing}</div>
          <div className="text-xs text-muted-foreground">Processing</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warning">{queuedItems}</div>
          <div className="text-xs text-muted-foreground">Queued</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success">{completedToday}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
      </div>
      {/* Processing Queue */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Current Queue</h4>
        
        {processingQueue?.map((item) => (
          <div key={item?.id} className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusBg(item?.status)}`}>
                  <Icon 
                    name={getStatusIcon(item?.status)} 
                    size={16} 
                    className={`${getStatusColor(item?.status)} ${item?.status === 'processing' ? 'animate-spin' : ''}`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground truncate max-w-48">
                    {item?.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item?.uploadedBy} • {item?.size}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`text-xs font-medium capitalize ${getStatusColor(item?.status)}`}>
                  {item?.status}
                </span>
                {item?.timeRemaining && (
                  <p className="text-xs text-muted-foreground">{item?.timeRemaining}</p>
                )}
              </div>
            </div>
            
            {item?.status === 'processing' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">{item?.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item?.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex space-x-2">
          <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200">
            <Icon name="Upload" size={16} />
            <span>Upload Files</span>
          </button>
          <button className="flex items-center justify-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200">
            <Icon name="RefreshCw" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;