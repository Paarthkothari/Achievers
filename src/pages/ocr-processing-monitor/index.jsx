import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import UploadZone from './components/UploadZone';
import ControlBar from './components/ControlBar';
import ProcessingPipeline from './components/ProcessingPipeline';
import ProcessingQueue from './components/ProcessingQueue';
import ExtractionPreview from './components/ExtractionPreview';
import ValidationResults from './components/ValidationResults';

const OCRProcessingMonitor = () => {
  const [processingMode, setProcessingMode] = useState('batch');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentStage, setCurrentStage] = useState('upload');
  const [progress, setProgress] = useState(0);
  const [queueItems, setQueueItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock processing data
  const [processingData, setProcessingData] = useState({
    estimatedTime: '2m 30s',
    throughput: {
      processed: 42,
      rate: '3.2',
      accuracy: '94'
    }
  });

  // Initialize with mock queue items
  useEffect(() => {
    const mockQueueItems = [
      {
        id: 1,
        name: 'CS301_Attendance_Oct2025.pdf',
        type: 'pdf',
        size: 2048576,
        status: 'completed',
        progress: 100,
        processingTime: 45
      },
      {
        id: 2,
        name: 'EE205_Attendance_Oct2025.pdf',
        type: 'pdf',
        size: 1536000,
        status: 'processing',
        progress: 67,
        processingTime: 28
      },
      {
        id: 3,
        name: 'ME101_Attendance_Oct2025.jpg',
        type: 'image',
        size: 3072000,
        status: 'waiting',
        progress: 0,
        processingTime: 0
      },
      {
        id: 4,
        name: 'CS302_Attendance_Oct2025.pdf',
        type: 'pdf',
        size: 1792000,
        status: 'failed',
        progress: 0,
        processingTime: 15,
        error: 'OCR confidence too low'
      }
    ];
    setQueueItems(mockQueueItems);
  }, []);

  // Auto refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate processing progress
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          setCurrentStage(prev => {
            const stages = ['upload', 'ocr', 'validation', 'normalization'];
            const currentIndex = stages?.indexOf(prev);
            return currentIndex < stages?.length - 1 ? stages?.[currentIndex + 1] : 'upload';
          });
          return 0;
        }
        return Math.min(newProgress, 100);
      });

      // Update queue items
      setQueueItems(prev => prev?.map(item => {
        if (item?.status === 'processing') {
          const newProgress = Math.min(item?.progress + Math.random() * 15, 100);
          return {
            ...item,
            progress: newProgress,
            processingTime: item?.processingTime + 1,
            status: newProgress >= 100 ? 'completed' : 'processing'
          };
        }
        return item;
      }));

      // Update throughput
      setProcessingData(prev => ({
        ...prev,
        throughput: {
          ...prev?.throughput,
          processed: prev?.throughput?.processed + Math.floor(Math.random() * 2),
          rate: (3.2 + Math.random() * 0.8)?.toFixed(1),
          accuracy: (94 + Math.random() * 4)?.toFixed(0)
        }
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleFileUpload = (files) => {
    setIsProcessing(true);
    const newItems = files?.map((file, index) => ({
      id: Date.now() + index,
      name: file?.name,
      type: file?.type?.includes('pdf') ? 'pdf' : 'image',
      size: file?.size,
      status: 'waiting',
      progress: 0,
      processingTime: 0
    }));

    setQueueItems(prev => [...prev, ...newItems]);

    // Start processing simulation
    setTimeout(() => {
      setQueueItems(prev => prev?.map(item => 
        newItems?.find(newItem => newItem?.id === item?.id)
          ? { ...item, status: 'processing' }
          : item
      ));
      setIsProcessing(false);
    }, 1000);
  };

  const handleRetry = (itemId) => {
    setQueueItems(prev => prev?.map(item =>
      item?.id === itemId
        ? { ...item, status: 'processing', progress: 0, error: undefined }
        : item
    ));
  };

  const handleCancel = (itemId) => {
    setQueueItems(prev => prev?.filter(item => item?.id !== itemId));
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'retry_failed':
        setQueueItems(prev => prev?.map(item =>
          item?.status === 'failed'
            ? { ...item, status: 'processing', progress: 0, error: undefined }
            : item
        ));
        break;
      case 'cancel_waiting':
        setQueueItems(prev => prev?.filter(item => item?.status !== 'waiting'));
        break;
      case 'clear_completed':
        setQueueItems(prev => prev?.filter(item => item?.status !== 'completed'));
        break;
      case 'export_results':
        // Simulate export
        console.log('Exporting results...');
        break;
      default:
        break;
    }
  };

  const handleRefresh = () => {
    // Simulate refresh
    setProgress(0);
    setCurrentStage('upload');
  };

  const handleResolveAnomaly = (anomalyId) => {
    console.log('Resolving anomaly:', anomalyId);
    // Handle anomaly resolution
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              OCR Processing Monitor
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring of attendance sheet processing and data extraction workflows
            </p>
          </div>

          {/* Control Bar */}
          <ControlBar
            processingMode={processingMode}
            onProcessingModeChange={setProcessingMode}
            autoRefresh={autoRefresh}
            onAutoRefreshToggle={() => setAutoRefresh(!autoRefresh)}
            onBulkAction={handleBulkAction}
            onRefresh={handleRefresh}
          />

          {/* Upload Zone */}
          <div className="mb-8">
            <UploadZone
              onFileUpload={handleFileUpload}
              isProcessing={isProcessing}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
            {/* Processing Pipeline - 12 cols on desktop */}
            <div className="xl:col-span-3">
              <ProcessingPipeline
                currentStage={currentStage}
                progress={progress}
                estimatedTime={processingData?.estimatedTime}
                throughput={processingData?.throughput}
              />
            </div>

            {/* Processing Queue - 4 cols on desktop */}
            <div className="xl:col-span-1">
              <ProcessingQueue
                queueItems={queueItems}
                onRetry={handleRetry}
                onCancel={handleCancel}
              />
            </div>
          </div>

          {/* Bottom Section - Dual Pane Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Extraction Preview - 8 cols on desktop */}
            <div>
              <ExtractionPreview
                extractedData={{
                  students: [],
                  attendanceData: {},
                  metadata: {}
                }}
                confidenceScores={{
                  overall: 94,
                  individual: []
                }}
                tableStructure={{
                  columns: [],
                  rows: 0
                }}
              />
            </div>

            {/* Validation Results - 8 cols on desktop */}
            <div>
              <ValidationResults
                validationData={{
                  anomalies: [],
                  warnings: [],
                  errors: []
                }}
                onResolveAnomaly={handleResolveAnomaly}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OCRProcessingMonitor;