import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReviewQueuePanel = ({ 
  queueItems, 
  onBulkResolve, 
  onEscalateAll,
  onItemAction 
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortBy, setSortBy] = useState('priority');

  const handleSelectAll = () => {
    if (selectedItems?.length === queueItems?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(queueItems?.map(item => item?.id));
    }
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => 
      prev?.includes(itemId) 
        ? prev?.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-error';
      case 'high': return 'text-warning';
      case 'medium': return 'text-accent';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return 'AlertTriangle';
      case 'high': return 'ArrowUp';
      case 'medium': return 'Minus';
      case 'low': return 'ArrowDown';
      default: return 'Circle';
    }
  };

  const sortedItems = [...queueItems]?.sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder?.[b?.priority] - priorityOrder?.[a?.priority];
      case 'time':
        return new Date(b.timestamp) - new Date(a.timestamp);
      case 'confidence':
        return b?.confidence - a?.confidence;
      default:
        return 0;
    }
  });

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">Manual Review Queue</h3>
          <span className="text-sm text-muted-foreground">
            {queueItems?.length} items
          </span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <div className={`w-4 h-4 border border-border rounded flex items-center justify-center ${
                selectedItems?.length === queueItems?.length ? 'bg-primary border-primary' : ''
              }`}>
                {selectedItems?.length === queueItems?.length && (
                  <Icon name="Check" size={12} color="white" />
                )}
              </div>
              <span>Select All</span>
            </button>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="text-sm border border-border rounded-lg px-2 py-1 bg-background text-foreground"
          >
            <option value="priority">Sort by Priority</option>
            <option value="time">Sort by Time</option>
            <option value="confidence">Sort by Confidence</option>
          </select>
        </div>
      </div>
      {/* Queue Items */}
      <div className="flex-1 overflow-y-auto">
        {sortedItems?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Icon name="CheckCircle" size={48} className="text-success mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">All Clear!</h4>
            <p className="text-sm text-muted-foreground">
              No items in the review queue at the moment.
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {sortedItems?.map((item) => (
              <div
                key={item?.id}
                className={`p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors duration-200 ${
                  selectedItems?.includes(item?.id) ? 'bg-primary/5 border-primary/20' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleItemSelect(item?.id)}
                    className="mt-0.5"
                  >
                    <div className={`w-4 h-4 border border-border rounded flex items-center justify-center ${
                      selectedItems?.includes(item?.id) ? 'bg-primary border-primary' : ''
                    }`}>
                      {selectedItems?.includes(item?.id) && (
                        <Icon name="Check" size={12} color="white" />
                      )}
                    </div>
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon 
                        name={getPriorityIcon(item?.priority)} 
                        size={14} 
                        className={getPriorityColor(item?.priority)} 
                      />
                      <span className="text-sm font-medium text-foreground truncate">
                        {item?.title}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {item?.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Confidence: {item?.confidence}%</span>
                        <span>•</span>
                        <span>{new Date(item.timestamp)?.toLocaleTimeString()}</span>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onItemAction(item?.id, 'approve')}
                          className="p-1 text-success hover:bg-success/10 rounded transition-colors duration-200"
                        >
                          <Icon name="Check" size={14} />
                        </button>
                        <button
                          onClick={() => onItemAction(item?.id, 'reject')}
                          className="p-1 text-error hover:bg-error/10 rounded transition-colors duration-200"
                        >
                          <Icon name="X" size={14} />
                        </button>
                        <button
                          onClick={() => onItemAction(item?.id, 'details')}
                          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors duration-200"
                        >
                          <Icon name="Eye" size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Bulk Actions */}
      {selectedItems?.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedItems?.length} item{selectedItems?.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkResolve(selectedItems, 'reject')}
                iconName="X"
                iconPosition="left"
              >
                Reject All
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onBulkResolve(selectedItems, 'approve')}
                iconName="Check"
                iconPosition="left"
              >
                Approve All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewQueuePanel;