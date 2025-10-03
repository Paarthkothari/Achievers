import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AnomalyAlertCard = ({ 
  anomaly, 
  onResolve, 
  onEscalate, 
  onViewDetails,
  isPinned,
  onTogglePin 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-l-error bg-error/5';
      case 'high': return 'border-l-warning bg-warning/5';
      case 'medium': return 'border-l-accent bg-accent/5';
      case 'low': return 'border-l-success bg-success/5';
      default: return 'border-l-muted bg-muted/5';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return { name: 'AlertTriangle', color: 'text-error' };
      case 'high': return { name: 'AlertCircle', color: 'text-warning' };
      case 'medium': return { name: 'Info', color: 'text-accent' };
      case 'low': return { name: 'CheckCircle', color: 'text-success' };
      default: return { name: 'Circle', color: 'text-muted-foreground' };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'duplicate': return 'Copy';
      case 'signature': return 'FileSignature';
      case 'inconsistent': return 'AlertTriangle';
      case 'missing': return 'FileX';
      case 'temporal': return 'Clock';
      default: return 'Flag';
    }
  };

  const severityIcon = getSeverityIcon(anomaly?.severity);
  const timeAgo = new Date(Date.now() - anomaly.detectedAt)?.toLocaleTimeString();

  return (
    <div className={`border border-border rounded-lg ${getSeverityColor(anomaly?.severity)} ${
      isPinned ? 'ring-2 ring-primary/20' : ''
    } transition-all duration-200 hover:shadow-md`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              <Icon name={getTypeIcon(anomaly?.type)} size={20} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {anomaly?.title}
                </h4>
                <Icon 
                  name={severityIcon?.name} 
                  size={16} 
                  className={severityIcon?.color} 
                />
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  anomaly?.severity === 'critical' ? 'bg-error/10 text-error' :
                  anomaly?.severity === 'high' ? 'bg-warning/10 text-warning' :
                  anomaly?.severity === 'medium'? 'bg-accent/10 text-accent' : 'bg-success/10 text-success'
                }`}>
                  {anomaly?.severity?.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {anomaly?.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>Confidence: {anomaly?.confidence}%</span>
                <span>•</span>
                <span>Detected: {timeAgo}</span>
                <span>•</span>
                <span>Subject: {anomaly?.subject}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={onTogglePin}
              className={`p-1.5 rounded-lg transition-colors duration-200 ${
                isPinned 
                  ? 'text-primary bg-primary/10 hover:bg-primary/20' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name="Pin" size={16} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
            >
              <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
            </button>
          </div>
        </div>
      </div>
      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border bg-card/50">
          <div className="p-4 space-y-4">
            {/* Affected Records */}
            <div>
              <h5 className="text-sm font-medium text-foreground mb-2">Affected Records</h5>
              <div className="space-y-2">
                {anomaly?.affectedRecords?.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-foreground">
                        Roll: {record?.rollNumber}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {record?.studentName}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {record?.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Actions */}
            <div>
              <h5 className="text-sm font-medium text-foreground mb-2">Suggested Actions</h5>
              <div className="flex flex-wrap gap-2">
                {anomaly?.suggestedActions?.map((action, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(anomaly?.id)}
                  iconName="Eye"
                  iconPosition="left"
                >
                  View Details
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEscalate(anomaly?.id)}
                  iconName="ArrowUp"
                  iconPosition="left"
                >
                  Escalate
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onResolve(anomaly?.id, 'false_positive')}
                >
                  Mark as False Positive
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onResolve(anomaly?.id, 'resolved')}
                  iconName="Check"
                  iconPosition="left"
                >
                  Resolve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyAlertCard;