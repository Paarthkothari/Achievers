import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsStrip = ({ metrics }) => {
  const metricCards = [
    {
      title: 'Total Students',
      value: metrics?.totalStudents,
      change: '+12',
      changeType: 'positive',
      icon: 'Users',
      color: 'bg-primary'
    },
    {
      title: 'Average Attendance',
      value: `${metrics?.averageAttendance}%`,
      change: '+2.3%',
      changeType: 'positive',
      icon: 'TrendingUp',
      color: 'bg-success'
    },
    {
      title: 'Defaulters',
      value: metrics?.defaulters,
      change: '-5',
      changeType: 'negative',
      icon: 'AlertTriangle',
      color: 'bg-warning'
    },
    {
      title: 'At Risk Students',
      value: metrics?.atRiskStudents,
      change: '-3',
      changeType: 'negative',
      icon: 'UserX',
      color: 'bg-error'
    },
    {
      title: 'Perfect Attendance',
      value: metrics?.perfectAttendance,
      change: '+8',
      changeType: 'positive',
      icon: 'Award',
      color: 'bg-accent'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {metricCards?.map((metric, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${metric?.color} rounded-lg flex items-center justify-center`}>
              <Icon name={metric?.icon} size={24} color="white" />
            </div>
            <div className={`flex items-center text-sm font-medium ${
              metric?.changeType === 'positive' ? 'text-success' : 'text-error'
            }`}>
              <Icon 
                name={metric?.changeType === 'positive' ? 'TrendingUp' : 'TrendingDown'} 
                size={16} 
                className="mr-1"
              />
              {metric?.change}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{metric?.value}</h3>
            <p className="text-sm text-muted-foreground">{metric?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsStrip;