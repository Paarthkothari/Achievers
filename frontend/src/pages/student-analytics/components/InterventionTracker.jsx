import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InterventionTracker = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const interventions = {
    pending: [
      {
        id: 1,
        studentName: 'Rahul Sharma',
        rollNumber: 'CS21001',
        type: 'Email Reminder',
        priority: 'high',
        dueDate: '2025-10-05',
        assignedTo: 'Dr. Sarah Johnson',
        reason: 'Attendance below 70%'
      },
      {
        id: 2,
        studentName: 'Amit Kumar',
        rollNumber: 'ME21089',
        type: 'Parent Meeting',
        priority: 'urgent',
        dueDate: '2025-10-04',
        assignedTo: 'Prof. Michael Chen',
        reason: 'Consistent absence pattern'
      }
    ],
    inProgress: [
      {
        id: 3,
        studentName: 'Priya Patel',
        rollNumber: 'EE21045',
        type: 'Counseling Session',
        priority: 'medium',
        startDate: '2025-10-01',
        assignedTo: 'Dr. Emily Davis',
        status: 'First session completed'
      }
    ],
    completed: [
      {
        id: 4,
        studentName: 'Sneha Gupta',
        rollNumber: 'IT21067',
        type: 'Academic Support',
        priority: 'medium',
        completedDate: '2025-09-28',
        assignedTo: 'Dr. Sarah Johnson',
        outcome: 'Attendance improved to 82%'
      }
    ]
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-error text-error-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Email Reminder': return 'Mail';
      case 'Parent Meeting': return 'Users';
      case 'Counseling Session': return 'MessageCircle';
      case 'Academic Support': return 'BookOpen';
      default: return 'AlertCircle';
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending', count: interventions?.pending?.length },
    { id: 'inProgress', label: 'In Progress', count: interventions?.inProgress?.length },
    { id: 'completed', label: 'Completed', count: interventions?.completed?.length }
  ];

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Intervention Tracker</h3>
            <p className="text-sm text-muted-foreground">Monitor student support activities</p>
          </div>
          <Button variant="default" size="sm" iconName="Plus">
            New Intervention
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`
                flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                ${activeTab === tab?.id 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <span>{tab?.label}</span>
              <span className={`
                inline-flex items-center justify-center w-5 h-5 text-xs rounded-full
                ${activeTab === tab?.id ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'}
              `}>
                {tab?.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {interventions?.[activeTab]?.map((intervention) => (
          <div key={intervention?.id} className="p-4 hover:bg-muted/50 transition-colors duration-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={getTypeIcon(intervention?.type)} size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">{intervention?.studentName}</h4>
                    <p className="text-sm text-muted-foreground">{intervention?.rollNumber}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(intervention?.priority)}`}>
                    {intervention?.priority?.charAt(0)?.toUpperCase() + intervention?.priority?.slice(1)}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-foreground mb-1">{intervention?.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {intervention?.reason || intervention?.status || intervention?.outcome}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="User" size={14} />
                      <span>{intervention?.assignedTo}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={14} />
                      <span>
                        {intervention?.dueDate && `Due: ${intervention?.dueDate}`}
                        {intervention?.startDate && `Started: ${intervention?.startDate}`}
                        {intervention?.completedDate && `Completed: ${intervention?.completedDate}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activeTab === 'pending' && (
                      <>
                        <button className="p-1 text-muted-foreground hover:text-primary transition-colors duration-200" title="Start Intervention">
                          <Icon name="Play" size={16} />
                        </button>
                        <button className="p-1 text-muted-foreground hover:text-primary transition-colors duration-200" title="Edit">
                          <Icon name="Edit" size={16} />
                        </button>
                      </>
                    )}
                    {activeTab === 'inProgress' && (
                      <>
                        <button className="p-1 text-muted-foreground hover:text-success transition-colors duration-200" title="Mark Complete">
                          <Icon name="Check" size={16} />
                        </button>
                        <button className="p-1 text-muted-foreground hover:text-primary transition-colors duration-200" title="Add Note">
                          <Icon name="FileText" size={16} />
                        </button>
                      </>
                    )}
                    {activeTab === 'completed' && (
                      <button className="p-1 text-muted-foreground hover:text-primary transition-colors duration-200" title="View Details">
                        <Icon name="Eye" size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {interventions?.[activeTab]?.length === 0 && (
        <div className="p-8 text-center">
          <Icon name="Inbox" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No {activeTab} interventions</p>
        </div>
      )}
    </div>
  );
};

export default InterventionTracker;