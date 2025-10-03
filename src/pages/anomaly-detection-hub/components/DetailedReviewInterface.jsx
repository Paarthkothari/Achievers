
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const DetailedReviewInterface = ({ 
  anomaly, 
  onClose, 
  onApprove, 
  onReject, 
  onAnnotate 
}) => {
  const [annotation, setAnnotation] = useState('');
  const [selectedComparison, setSelectedComparison] = useState('original');
  const [reviewDecision, setReviewDecision] = useState(null);

  if (!anomaly) return null;

  const handleSubmitReview = () => {
    if (reviewDecision === 'approve') {
      onApprove(anomaly?.id, annotation);
    } else if (reviewDecision === 'reject') {
      onReject(anomaly?.id, annotation);
    }
    onClose();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-error';
      case 'high': return 'text-warning';
      case 'medium': return 'text-accent';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-foreground">Detailed Review</h2>
              <div className="flex items-center space-x-2">
                <span className={`text-sm px-3 py-1 rounded-full ${
                  anomaly?.severity === 'critical' ? 'bg-error/10 text-error' :
                  anomaly?.severity === 'high' ? 'bg-warning/10 text-warning' :
                  anomaly?.severity === 'medium'? 'bg-accent/10 text-accent' : 'bg-success/10 text-success'
                }`}>
                  {anomaly?.severity?.toUpperCase()}
                </span>
                <span className="text-sm text-muted-foreground">
                  Confidence: {anomaly?.confidence}%
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              iconName="X"
            />
          </div>
        </div>

        <div className="flex h-[calc(90vh-8rem)]">
          {/* Left Panel - Anomaly Details */}
          <div className="w-1/3 border-r border-border p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-3">Anomaly Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <p className="text-sm text-foreground mt-1">{anomaly?.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm text-foreground mt-1">{anomaly?.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="text-sm text-foreground mt-1 capitalize">{anomaly?.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Subject</label>
                    <p className="text-sm text-foreground mt-1">{anomaly?.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Detected At</label>
                    <p className="text-sm text-foreground mt-1">
                      {new Date(anomaly.detectedAt)?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* ML Confidence Indicators */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-3">ML Analysis</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Detection Confidence</span>
                      <span className="text-sm font-medium text-foreground">{anomaly?.confidence}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${anomaly?.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Impact Score</span>
                      <span className="text-sm font-medium text-foreground">{anomaly?.impactScore}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${anomaly?.impactScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Affected Records */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-3">Affected Records</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {anomaly?.affectedRecords?.map((record, index) => (
                    <div key={index} className="p-2 bg-muted/50 rounded-lg">
                      <div className="text-sm font-medium text-foreground">
                        Roll: {record?.rollNumber}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record?.studentName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {record?.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Side-by-Side Comparison */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">Data Comparison</h3>
                <div className="flex space-x-1 bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setSelectedComparison('original')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedComparison === 'original' ?'bg-card shadow-sm text-foreground' :'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Original vs Expected
                  </button>
                  <button
                    onClick={() => setSelectedComparison('flagged')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedComparison === 'flagged' ?'bg-card shadow-sm text-foreground' :'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Flagged Regions
                  </button>
                </div>
              </div>

              {selectedComparison === 'original' ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Original Data */}
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                      <Icon name="FileText" size={16} className="mr-2" />
                      Original Data
                    </h4>
                    <div className="bg-muted/30 rounded-lg p-3 font-mono text-sm">
                      <div className="space-y-1">
                        <div>Roll: 2021CS001</div>
                        <div>Name: John Doe</div>
                        <div>Date: 03/10/2025</div>
                        <div className="text-error">Attendance: P, P, A, P, P</div>
                        <div>Subject: Data Structures</div>
                      </div>
                    </div>
                  </div>

                  {/* Expected Data */}
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                      <Icon name="CheckCircle" size={16} className="mr-2" />
                      Expected Pattern
                    </h4>
                    <div className="bg-success/10 rounded-lg p-3 font-mono text-sm">
                      <div className="space-y-1">
                        <div>Roll: 2021CS001</div>
                        <div>Name: John Doe</div>
                        <div>Date: 03/10/2025</div>
                        <div className="text-success">Attendance: P, P, P, P, P</div>
                        <div>Subject: Data Structures</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                    <Icon name="AlertTriangle" size={16} className="mr-2" />
                    Flagged Regions
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon name="AlertCircle" size={16} className="text-error" />
                        <span className="text-sm font-medium text-error">Suspicious Pattern Detected</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Attendance mark appears to be altered from 'A' to 'P' in position 3.
                        OCR confidence for this region is only 45%.
                      </p>
                    </div>
                    <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon name="Info" size={16} className="text-warning" />
                        <span className="text-sm font-medium text-warning">Inconsistent Handwriting</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The handwriting style for this entry differs significantly from other entries in the same row.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Actions */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                  <Icon name="Lightbulb" size={16} className="mr-2" />
                  Suggested Actions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {anomaly?.suggestedActions?.map((action, index) => (
                    <span 
                      key={index}
                      className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Review Controls */}
          <div className="w-1/3 border-l border-border p-6 overflow-y-auto">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground">Review Decision</h3>
              
              {/* Decision Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setReviewDecision('approve')}
                  className={`w-full p-3 border rounded-lg text-left transition-all duration-200 ${
                    reviewDecision === 'approve' ?'border-success bg-success/10 text-success' :'border-border hover:border-success/50 text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon name="CheckCircle" size={20} />
                    <div>
                      <div className="font-medium">Approve as Valid Anomaly</div>
                      <div className="text-sm opacity-80">This is a genuine issue that needs attention</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setReviewDecision('reject')}
                  className={`w-full p-3 border rounded-lg text-left transition-all duration-200 ${
                    reviewDecision === 'reject' ?'border-error bg-error/10 text-error' :'border-border hover:border-error/50 text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon name="XCircle" size={20} />
                    <div>
                      <div className="font-medium">Mark as False Positive</div>
                      <div className="text-sm opacity-80">This is not actually an anomaly</div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Annotation */}
              <div>
                <Input
                  label="Review Notes"
                  type="text"
                  placeholder="Add your review comments..."
                  value={annotation}
                  onChange={(e) => setAnnotation(e?.target?.value)}
                  description="Optional notes about your decision"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-border">
                <Button
                  variant="default"
                  fullWidth
                  onClick={handleSubmitReview}
                  disabled={!reviewDecision}
                  iconName="Check"
                  iconPosition="left"
                >
                  Submit Review
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={onClose}
                  iconName="X"
                  iconPosition="left"
                >
                  Cancel
                </Button>
              </div>

              {/* Additional Actions */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">Additional Actions</h4>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    iconName="ArrowUp"
                    iconPosition="left"
                  >
                    Escalate to Supervisor
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    iconName="MessageSquare"
                    iconPosition="left"
                  >
                    Request Faculty Input
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    iconName="Download"
                    iconPosition="left"
                  >
                    Export Evidence
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedReviewInterface;