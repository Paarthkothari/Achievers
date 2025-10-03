import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const RecentAlerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'critical',
      title: 'Multiple Defaulters Detected',
      message: 'CS-301 has 12 students below 75% attendance threshold',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      subject: 'CS-301',
      count: 12,
      unread: true
    },
    {
      id: 2,
      type: 'warning',
      title: 'OCR Quality Issue',
      message: 'Low confidence scores detected in MATH-205 processing',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      subject: 'MATH-205',
      confidence: 67,
      unread: true
    },
    {
      id: 3,
      type: 'info',
      title: 'Duplicate Roll Numbers',
      message: '3 duplicate entries found in PHY-102 attendance sheet',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      subject: 'PHY-102',
      count: 3,
      unread: false
    },
    {
      id: 4,
      type: 'success',
      title: 'Processing Complete',
      message: 'CHEM-201 attendance successfully processed and validated',
      timestamp: new Date(Date.now() - 2700000), // 45 minutes ago
      subject: 'CHEM-201',
      unread: false
    },
    {
      id: 5,
      type: 'warning',
      title: 'Signature Anomaly',
      message: 'Suspicious signature patterns detected in EE-305',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      subject: 'EE-305',
      unread: false
    }
  ]);

  const [filter, setFilter] = useState('all');

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return 'AlertTriangle';
      case 'warning': return 'AlertCircle';
      case 'info': return 'Info';
      case 'success': return 'CheckCircle';
      default: return 'Bell';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'text-error';
      case 'warning': return 'text-warning';
      case 'info': return 'text-primary';
      case 'success': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getAlertBg = (type) => {
    switch (type) {
      case 'critical': return 'bg-error/10';
      case 'warning': return 'bg-warning/10';
      case 'info': return 'bg-primary/10';
      case 'success': return 'bg-success/10';
      default: return 'bg-muted';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const filteredAlerts = filter === 'all' ? alerts : alerts?.filter(alert => alert?.type === filter);
  const unreadCount = alerts?.filter(alert => alert?.unread)?.length;

  const handleMarkAsRead = (alertId) => {
    setAlerts(prev => 
      prev?.map(alert => 
        alert?.id === alertId ? { ...alert, unread: false } : alert
      )
    );
  };

  const handleMarkAllRead = () => {
    setAlerts(prev => prev?.map(alert => ({ ...alert, unread: false })));
  };

  const filterOptions = [
    { value: 'all', label: 'All', count: alerts?.length },
    { value: 'critical', label: 'Critical', count: alerts?.filter(a => a?.type === 'critical')?.length },
    { value: 'warning', label: 'Warning', count: alerts?.filter(a => a?.type === 'warning')?.length },
    { value: 'info', label: 'Info', count: alerts?.filter(a => a?.type === 'info')?.length }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Alerts</h3>
          <p className="text-sm text-muted-foreground">
            System notifications and anomalies
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-primary hover:text-primary/80 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>
      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-4 p-1 bg-muted rounded-lg">
        {filterOptions?.map((option) => (
          <button
            key={option?.value}
            onClick={() => setFilter(option?.value)}
            className={`
              flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200
              ${filter === option?.value 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <span>{option?.label}</span>
            {option?.count > 0 && (
              <span className={`
                px-1.5 py-0.5 rounded-full text-xs
                ${filter === option?.value 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted-foreground/20 text-muted-foreground'
                }
              `}>
                {option?.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* Alerts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAlerts?.map((alert) => (
          <div
            key={alert?.id}
            onClick={() => handleMarkAsRead(alert?.id)}
            className={`
              border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors duration-200
              ${alert?.unread ? 'bg-accent/5' : ''}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getAlertBg(alert?.type)}`}>
                <Icon 
                  name={getAlertIcon(alert?.type)} 
                  size={16} 
                  className={getAlertColor(alert?.type)}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {alert?.title}
                  </h4>
                  {alert?.unread && (
                    <div className="w-2 h-2 bg-primary rounded-full ml-2"></div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {alert?.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {alert?.subject}
                    </span>
                    {alert?.count && (
                      <span className="text-xs text-muted-foreground">
                        {alert?.count} items
                      </span>
                    )}
                    {alert?.confidence && (
                      <span className="text-xs text-muted-foreground">
                        {alert?.confidence}% confidence
                      </span>
                    )}
                  </div>
                  
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(alert?.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredAlerts?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No alerts found</p>
        </div>
      )}
      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex space-x-2">
          <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors duration-200">
            <Icon name="Settings" size={16} />
            <span>Alert Settings</span>
          </button>
          <button className="flex items-center justify-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200">
            <Icon name="ExternalLink" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentAlerts;