import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ValidationResults = ({ validationData, onResolveAnomaly }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const mockValidationData = {
    rollNumberMatches: {
      total: 45,
      matched: 42,
      unmatched: 3,
      issues: [
        { rollNo: 'CS2021006', issue: 'Roll number not found in master data', severity: 'high', suggestion: 'Verify roll number format' },
        { rollNo: 'CS2021007', issue: 'Duplicate roll number detected', severity: 'medium', suggestion: 'Check for data entry errors' },
        { rollNo: 'CS2021008', issue: 'Invalid roll number format', severity: 'high', suggestion: 'Correct format: CS2021XXX' }
      ]
    },
    nameVerification: {
      total: 45,
      verified: 40,
      flagged: 5,
      issues: [
        { rollNo: 'CS2021009', name: 'Rajesh Kumar', masterName: 'Rajesh K. Sharma', similarity: 0.75, severity: 'medium' },
        { rollNo: 'CS2021010', name: 'Priya', masterName: 'Priya Patel', similarity: 0.65, severity: 'high' },
        { rollNo: 'CS2021011', name: 'Amit Singh', masterName: 'Amit Kumar Singh', similarity: 0.82, severity: 'low' }
      ]
    },
    anomalies: {
      total: 8,
      resolved: 3,
      pending: 5,
      issues: [
        { 
          id: 1, 
          type: 'suspicious_signature', 
          rollNo: 'CS2021012', 
          description: 'Signature region appears to be digitally altered', 
          severity: 'high',
          confidence: 0.89,
          location: { x: 450, y: 120, width: 80, height: 30 }
        },
        { 
          id: 2, 
          type: 'inconsistent_entry', 
          rollNo: 'CS2021013', 
          description: 'Attendance mark differs from pattern (✓ vs P)', 
          severity: 'medium',
          confidence: 0.76,
          suggestion: 'Standardize to P/A format'
        },
        { 
          id: 3, 
          type: 'unclear_marking', 
          rollNo: 'CS2021014', 
          description: 'Attendance marking is unclear or smudged', 
          severity: 'medium',
          confidence: 0.45,
          suggestion: 'Manual review required'
        }
      ]
    },
    dataQuality: {
      overallScore: 0.87,
      completeness: 0.93,
      accuracy: 0.85,
      consistency: 0.82,
      readability: 0.89
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-error bg-error/10 border-error/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'low': return 'text-success bg-success/10 border-success/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return 'AlertTriangle';
      case 'medium': return 'AlertCircle';
      case 'low': return 'Info';
      default: return 'Info';
    }
  };

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'suspicious_signature': return 'Shield';
      case 'inconsistent_entry': return 'AlertTriangle';
      case 'unclear_marking': return 'Eye';
      default: return 'Flag';
    }
  };

  const categories = [
    { id: 'all', label: 'All Issues', count: 16 },
    { id: 'roll_numbers', label: 'Roll Numbers', count: 3 },
    { id: 'names', label: 'Name Verification', count: 5 },
    { id: 'anomalies', label: 'Anomalies', count: 8 }
  ];

  const getAllIssues = () => {
    const issues = [];
    
    // Roll number issues
    mockValidationData?.rollNumberMatches?.issues?.forEach(issue => {
      issues?.push({
        ...issue,
        category: 'roll_numbers',
        type: 'roll_number_mismatch'
      });
    });

    // Name verification issues
    mockValidationData?.nameVerification?.issues?.forEach(issue => {
      issues?.push({
        ...issue,
        category: 'names',
        type: 'name_mismatch',
        issue: `Name similarity: ${Math.round(issue?.similarity * 100)}% - "${issue?.name}" vs "${issue?.masterName}"`
      });
    });

    // Anomaly issues
    mockValidationData?.anomalies?.issues?.forEach(issue => {
      issues?.push({
        ...issue,
        category: 'anomalies',
        issue: issue?.description
      });
    });

    return selectedCategory === 'all' 
      ? issues 
      : issues?.filter(issue => issue?.category === selectedCategory);
  };

  const filteredIssues = getAllIssues();

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Validation Results</h3>
        <div className="flex items-center space-x-2">
          <div className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${mockValidationData?.dataQuality?.overallScore >= 0.8 
              ? 'text-success bg-success/10' :'text-warning bg-warning/10'
            }
          `}>
            Quality Score: {Math.round(mockValidationData?.dataQuality?.overallScore * 100)}%
          </div>
        </div>
      </div>
      {/* Quality Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(mockValidationData?.dataQuality)?.map(([key, value]) => {
          if (key === 'overallScore') return null;
          return (
            <div key={key} className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-lg font-bold text-foreground">
                {Math.round(value * 100)}%
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {key?.replace(/([A-Z])/g, ' $1')?.trim()}
              </p>
            </div>
          );
        })}
      </div>
      {/* Category Filters */}
      <div className="flex items-center space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {categories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => setSelectedCategory(category?.id)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${selectedCategory === category?.id 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <span>{category?.label}</span>
            <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-xs">
              {category?.count}
            </span>
          </button>
        ))}
      </div>
      {/* Issues List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredIssues?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
            <p className="text-foreground font-medium">All validations passed!</p>
            <p className="text-sm text-muted-foreground mt-1">
              No issues found in the selected category
            </p>
          </div>
        ) : (
          filteredIssues?.map((issue, index) => (
            <div
              key={issue?.id || index}
              className={`
                p-4 border rounded-lg transition-all duration-200 hover:shadow-sm
                ${getSeverityColor(issue?.severity)}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon 
                      name={issue?.type ? getAnomalyIcon(issue?.type) : getSeverityIcon(issue?.severity)} 
                      size={20} 
                      className={getSeverityColor(issue?.severity)?.split(' ')?.[0]}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-foreground">
                        {issue?.rollNo}
                      </p>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium capitalize
                        ${getSeverityColor(issue?.severity)}
                      `}>
                        {issue?.severity}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground mb-2">
                      {issue?.issue || issue?.description}
                    </p>
                    
                    {issue?.suggestion && (
                      <p className="text-xs text-muted-foreground">
                        <Icon name="Lightbulb" size={12} className="inline mr-1" />
                        {issue?.suggestion}
                      </p>
                    )}

                    {issue?.confidence && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          Confidence: {Math.round(issue?.confidence * 100)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {issue?.severity === 'high' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResolveAnomaly && onResolveAnomaly(issue?.id || index)}
                    >
                      <Icon name="Eye" size={14} className="mr-1" />
                      Review
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Icon name="MoreVertical" size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Summary Stats */}
      {filteredIssues?.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-error">
                {filteredIssues?.filter(issue => issue?.severity === 'high')?.length}
              </p>
              <p className="text-xs text-muted-foreground">High Priority</p>
            </div>
            <div>
              <p className="text-lg font-bold text-warning">
                {filteredIssues?.filter(issue => issue?.severity === 'medium')?.length}
              </p>
              <p className="text-xs text-muted-foreground">Medium Priority</p>
            </div>
            <div>
              <p className="text-lg font-bold text-success">
                {filteredIssues?.filter(issue => issue?.severity === 'low')?.length}
              </p>
              <p className="text-xs text-muted-foreground">Low Priority</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationResults;