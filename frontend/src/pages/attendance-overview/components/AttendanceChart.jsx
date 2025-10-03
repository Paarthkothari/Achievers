import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';

const AttendanceChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedSubjects, setSelectedSubjects] = useState(['all']);

  const chartData = [
    { date: '2025-09-27', 'Computer Science': 85, 'Mathematics': 78, 'Physics': 82, 'Chemistry': 75 },
    { date: '2025-09-28', 'Computer Science': 88, 'Mathematics': 80, 'Physics': 85, 'Chemistry': 77 },
    { date: '2025-09-29', 'Computer Science': 82, 'Mathematics': 75, 'Physics': 80, 'Chemistry': 73 },
    { date: '2025-09-30', 'Computer Science': 90, 'Mathematics': 83, 'Physics': 87, 'Chemistry': 79 },
    { date: '2025-10-01', 'Computer Science': 87, 'Mathematics': 81, 'Physics': 84, 'Chemistry': 76 },
    { date: '2025-10-02', 'Computer Science': 89, 'Mathematics': 84, 'Physics': 86, 'Chemistry': 80 },
    { date: '2025-10-03', 'Computer Science': 91, 'Mathematics': 86, 'Physics': 88, 'Chemistry': 82 }
  ];

  const subjects = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry'];
  const subjectColors = {
    'Computer Science': '#1E3A8A',
    'Mathematics': '#059669',
    'Physics': '#D97706',
    'Chemistry': '#DC2626'
  };

  const periodOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '3 Months' },
    { value: '1y', label: '1 Year' }
  ];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date?.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground mb-2">
            {new Date(label)?.toLocaleDateString('en-GB', { 
              weekday: 'long', 
              day: '2-digit', 
              month: 'short' 
            })}
          </p>
          {payload?.map((entry) => (
            <div key={entry?.dataKey} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-sm text-muted-foreground">{entry?.dataKey}</span>
              </div>
              <span className="text-sm font-medium text-popover-foreground">
                {entry?.value}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Daily Attendance Trends</h3>
          <p className="text-sm text-muted-foreground">Track attendance patterns across subjects</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={16} className="text-muted-foreground" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e?.target?.value)}
              className="text-sm border border-border rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {periodOptions?.map(option => (
                <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
          </div>
          
          <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200">
            <Icon name="Download" size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              domain={[60, 100]}
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            {subjects?.map((subject) => (
              <Line
                key={subject}
                type="monotone"
                dataKey={subject}
                stroke={subjectColors?.[subject]}
                strokeWidth={2}
                dot={{ fill: subjectColors?.[subject], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: subjectColors?.[subject], strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-xs text-muted-foreground">Above 85%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span className="text-xs text-muted-foreground">75-85%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-error rounded-full"></div>
            <span className="text-xs text-muted-foreground">Below 75%</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date()?.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;