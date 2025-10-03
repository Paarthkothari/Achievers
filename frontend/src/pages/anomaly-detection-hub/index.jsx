import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import AnomalyTypeFilter from './components/AnomalyTypeFilter';
import AnomalyAlertCard from './components/AnomalyAlertCard';
import ReviewQueuePanel from './components/ReviewQueuePanel';
import AnomalyVisualization from './components/AnomalyVisualization';
import DetailedReviewInterface from './components/DetailedReviewInterface';
import HistoricalTrendsChart from './components/HistoricalTrendsChart';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AnomalyDetectionHub = () => {
  const [selectedTypes, setSelectedTypes] = useState(['duplicate', 'signature', 'inconsistent']);
  const [severityLevel, setSeverityLevel] = useState('all');
  const [sensitivity, setSensitivity] = useState(7);
  const [autoDetection, setAutoDetection] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [reviewingAnomaly, setReviewingAnomaly] = useState(null);
  const [pinnedAnomalies, setPinnedAnomalies] = useState([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);

  // Mock anomaly data
  const [anomalies, setAnomalies] = useState([
    {
      id: 'anom_001',
      type: 'duplicate',
      title: 'Duplicate Roll Number Entry Detected',
      description: 'Roll number 2021CS045 appears multiple times in the same attendance sheet with different attendance marks.',
      severity: 'critical',
      confidence: 92,
      impactScore: 85,
      detectedAt: Date.now() - 300000,
      subject: 'Data Structures - CS301',
      affectedRecords: [
        { rollNumber: '2021CS045', studentName: 'Rahul Sharma', date: '03/10/2025' },
        { rollNumber: '2021CS045', studentName: 'Rahul Sharma', date: '03/10/2025' }
      ],
      suggestedActions: ['Remove duplicate entry', 'Verify student identity', 'Check original document']
    },
    {
      id: 'anom_002',
      type: 'signature',
      title: 'Suspicious Signature Pattern',
      description: 'Attendance signature for multiple students shows identical handwriting characteristics, suggesting potential proxy attendance.',
      severity: 'high',
      confidence: 78,
      impactScore: 70,
      detectedAt: Date.now() - 900000,
      subject: 'Database Systems - CS302',
      affectedRecords: [
        { rollNumber: '2021CS023', studentName: 'Priya Patel', date: '03/10/2025' },
        { rollNumber: '2021CS024', studentName: 'Amit Kumar', date: '03/10/2025' },
        { rollNumber: '2021CS025', studentName: 'Sneha Gupta', date: '03/10/2025' }
      ],
      suggestedActions: ['Manual verification required', 'Contact faculty', 'Review original signatures']
    },
    {
      id: 'anom_003',
      type: 'inconsistent',
      title: 'Inconsistent Attendance Marking',
      description: 'Attendance marks show inconsistent notation patterns (mix of P/A, ✓/✗, and checkmarks) within the same document.',
      severity: 'medium',
      confidence: 65,
      impactScore: 45,
      detectedAt: Date.now() - 1800000,
      subject: 'Computer Networks - CS303',
      affectedRecords: [
        { rollNumber: '2021CS067', studentName: 'Vikash Singh', date: '03/10/2025' },
        { rollNumber: '2021CS068', studentName: 'Anita Rao', date: '03/10/2025' }
      ],
      suggestedActions: ['Standardize notation', 'Re-process with updated rules', 'Faculty clarification']
    },
    {
      id: 'anom_004',
      type: 'missing',
      title: 'Missing Student Records',
      description: 'Expected student entries are missing from the attendance sheet based on enrollment data.',
      severity: 'high',
      confidence: 88,
      impactScore: 75,
      detectedAt: Date.now() - 2700000,
      subject: 'Software Engineering - CS304',
      affectedRecords: [
        { rollNumber: '2021CS089', studentName: 'Ravi Mehta', date: '03/10/2025' },
        { rollNumber: '2021CS090', studentName: 'Kavya Joshi', date: '03/10/2025' }
      ],
      suggestedActions: ['Check enrollment status', 'Verify attendance sheet completeness', 'Contact students']
    },
    {
      id: 'anom_005',
      type: 'temporal',
      title: 'Temporal Attendance Anomaly',
      description: 'Student marked present in multiple classes scheduled at the same time in different locations.',
      severity: 'critical',
      confidence: 95,
      impactScore: 90,
      detectedAt: Date.now() - 3600000,
      subject: 'Multiple Subjects',
      affectedRecords: [
        { rollNumber: '2021CS012', studentName: 'Arjun Reddy', date: '03/10/2025' }
      ],
      suggestedActions: ['Verify class schedules', 'Check location conflicts', 'Manual attendance verification']
    }
  ]);

  // Mock review queue data
  const [reviewQueue, setReviewQueue] = useState([
    {
      id: 'review_001',
      title: 'Handwriting Analysis Required',
      description: 'Multiple signatures require manual verification for authenticity.',
      priority: 'urgent',
      confidence: 45,
      timestamp: Date.now() - 600000
    },
    {
      id: 'review_002',
      title: 'OCR Confidence Low',
      description: 'Several attendance marks have OCR confidence below threshold.',
      priority: 'high',
      confidence: 38,
      timestamp: Date.now() - 1200000
    },
    {
      id: 'review_003',
      title: 'Cross-Reference Check',
      description: 'Student enrollment data mismatch requires verification.',
      priority: 'medium',
      confidence: 62,
      timestamp: Date.now() - 1800000
    },
    {
      id: 'review_004',
      title: 'Pattern Validation',
      description: 'Unusual attendance pattern detected in multiple sheets.',
      priority: 'high',
      confidence: 71,
      timestamp: Date.now() - 2400000
    }
  ]);

  // Mock historical data
  const historicalData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0],
    detections: Math.floor(Math.random() * 50) + 10,
    resolutions: Math.floor(Math.random() * 40) + 8,
    accuracy: 85 + Math.random() * 10,
    avgResolutionTime: 15 + Math.random() * 30
  }));

  // Filter anomalies based on selected criteria
  const filteredAnomalies = anomalies?.filter(anomaly => {
    const typeMatch = selectedTypes?.length === 0 || selectedTypes?.includes(anomaly?.type);
    const severityMatch = severityLevel === 'all' || anomaly?.severity === severityLevel;
    return typeMatch && severityMatch;
  });

  // Separate pinned and unpinned anomalies
  const pinnedAnomaliesList = filteredAnomalies?.filter(anomaly => pinnedAnomalies?.includes(anomaly?.id));
  const unpinnedAnomaliesList = filteredAnomalies?.filter(anomaly => !pinnedAnomalies?.includes(anomaly?.id));

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => 
      prev?.includes(type) 
        ? prev?.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleAnomalyResolve = (anomalyId, resolution) => {
    setAnomalies(prev => prev?.filter(a => a?.id !== anomalyId));
    // In a real app, this would make an API call
    console.log(`Anomaly ${anomalyId} resolved as: ${resolution}`);
  };

  const handleAnomalyEscalate = (anomalyId) => {
    // In a real app, this would escalate to supervisors
    console.log(`Anomaly ${anomalyId} escalated`);
  };

  const handleViewDetails = (anomalyId) => {
    const anomaly = anomalies?.find(a => a?.id === anomalyId);
    setReviewingAnomaly(anomaly);
  };

  const handleTogglePin = (anomalyId) => {
    setPinnedAnomalies(prev => 
      prev?.includes(anomalyId)
        ? prev?.filter(id => id !== anomalyId)
        : [...prev, anomalyId]
    );
  };

  const handleBulkResolve = (itemIds, action) => {
    setReviewQueue(prev => prev?.filter(item => !itemIds?.includes(item?.id)));
    console.log(`Bulk ${action} for items:`, itemIds);
  };

  const handleItemAction = (itemId, action) => {
    if (action === 'details') {
      // Find related anomaly and open detailed review
      const relatedAnomaly = anomalies?.find(a => a?.id?.includes(itemId?.split('_')?.[1]));
      if (relatedAnomaly) {
        setReviewingAnomaly(relatedAnomaly);
      }
    } else {
      setReviewQueue(prev => prev?.filter(item => item?.id !== itemId));
      console.log(`Item ${itemId} ${action}`);
    }
  };

  const handleAnomalyClick = (anomalyId) => {
    setSelectedAnomaly(anomalyId);
  };

  const handleReviewSubmit = (anomalyId, decision, annotation) => {
    console.log(`Review submitted for ${anomalyId}: ${decision}`, annotation);
    if (decision === 'approve') {
      // Keep anomaly but mark as reviewed
    } else {
      // Remove from list as false positive
      setAnomalies(prev => prev?.filter(a => a?.id !== anomalyId));
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      // Simulate new anomaly detection
      if (Math.random() > 0.95) {
        const newAnomaly = {
          id: `anom_${Date.now()}`,
          type: ['duplicate', 'signature', 'inconsistent', 'missing', 'temporal']?.[Math.floor(Math.random() * 5)],
          title: 'New Anomaly Detected',
          description: 'Real-time detection of suspicious pattern in attendance data.',
          severity: ['low', 'medium', 'high', 'critical']?.[Math.floor(Math.random() * 4)],
          confidence: Math.floor(Math.random() * 40) + 60,
          impactScore: Math.floor(Math.random() * 50) + 30,
          detectedAt: Date.now(),
          subject: 'Real-time Processing',
          affectedRecords: [
            { rollNumber: '2021CS999', studentName: 'Test Student', date: new Date()?.toLocaleDateString() }
          ],
          suggestedActions: ['Manual review required', 'Verify data integrity']
        };

        setAnomalies(prev => [newAnomaly, ...prev]);

        // Play notification sound if enabled
        if (notificationSound && newAnomaly?.severity === 'critical') {
          // In a real app, this would play an actual sound
          console.log('🔔 Critical anomaly detected!');
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [realTimeUpdates, notificationSound]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Anomaly Detection Hub</h1>
              <p className="text-muted-foreground mt-1">
                Monitor, analyze, and resolve attendance data anomalies with AI-powered detection
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Real-time Updates Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                    realTimeUpdates ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                      realTimeUpdates ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-foreground">Real-time</span>
              </div>

              {/* Sound Notifications Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setNotificationSound(!notificationSound)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    notificationSound 
                      ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={notificationSound ? 'Volume2' : 'VolumeX'} size={16} />
                </button>
              </div>

              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
              >
                Export Report
              </Button>
            </div>
          </div>

          {/* Control Panel */}
          <AnomalyTypeFilter
            selectedTypes={selectedTypes}
            onTypeToggle={handleTypeToggle}
            severityLevel={severityLevel}
            onSeverityChange={setSeverityLevel}
            sensitivity={sensitivity}
            onSensitivityChange={setSensitivity}
            autoDetection={autoDetection}
            onAutoDetectionToggle={() => setAutoDetection(!autoDetection)}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Primary Alert Section */}
            <div className="lg:col-span-9 space-y-4">
              {/* Pinned Anomalies */}
              {pinnedAnomaliesList?.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="Pin" size={16} className="text-primary" />
                    <h3 className="text-lg font-medium text-foreground">Pinned Anomalies</h3>
                  </div>
                  <div className="space-y-3">
                    {pinnedAnomaliesList?.map((anomaly) => (
                      <AnomalyAlertCard
                        key={anomaly?.id}
                        anomaly={anomaly}
                        onResolve={handleAnomalyResolve}
                        onEscalate={handleAnomalyEscalate}
                        onViewDetails={handleViewDetails}
                        isPinned={true}
                        onTogglePin={handleTogglePin}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Anomalies */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-foreground">
                    Active Anomalies ({unpinnedAnomaliesList?.length})
                  </h3>
                  {unpinnedAnomaliesList?.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const criticalIds = unpinnedAnomaliesList?.filter(a => a?.severity === 'critical')?.map(a => a?.id);
                        setPinnedAnomalies(prev => [...prev, ...criticalIds]);
                      }}
                      iconName="Pin"
                      iconPosition="left"
                    >
                      Pin Critical
                    </Button>
                  )}
                </div>

                {unpinnedAnomaliesList?.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-foreground mb-2">All Clear!</h4>
                    <p className="text-muted-foreground">
                      No anomalies match your current filter criteria. 
                      {selectedTypes?.length > 0 || severityLevel !== 'all' ? ' Try adjusting your filters.' : ''}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unpinnedAnomaliesList?.map((anomaly) => (
                      <AnomalyAlertCard
                        key={anomaly?.id}
                        anomaly={anomaly}
                        onResolve={handleAnomalyResolve}
                        onEscalate={handleAnomalyEscalate}
                        onViewDetails={handleViewDetails}
                        isPinned={false}
                        onTogglePin={handleTogglePin}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Action Panel */}
            <div className="lg:col-span-3">
              <ReviewQueuePanel
                queueItems={reviewQueue}
                onBulkResolve={handleBulkResolve}
                onEscalateAll={() => console.log('Escalate all items')}
                onItemAction={handleItemAction}
              />
            </div>
          </div>

          {/* Visualization Section */}
          <AnomalyVisualization
            anomalies={filteredAnomalies}
            onAnomalyClick={handleAnomalyClick}
            selectedAnomaly={selectedAnomaly}
          />

          {/* Historical Trends */}
          <HistoricalTrendsChart historicalData={historicalData} />
        </div>
      </main>
      {/* Detailed Review Modal */}
      {reviewingAnomaly && (
        <DetailedReviewInterface
          anomaly={reviewingAnomaly}
          onClose={() => setReviewingAnomaly(null)}
          onApprove={handleReviewSubmit}
          onReject={handleReviewSubmit}
          onAnnotate={(annotation) => console.log('Annotation:', annotation)}
        />
      )}
    </div>
  );
};

export default AnomalyDetectionHub;