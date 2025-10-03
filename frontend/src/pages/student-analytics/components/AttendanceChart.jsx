  import React from 'react';
  import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

  const AttendanceChart = ({ data }) => {
    const chartData = [
      { subject: 'Mathematics', individual: 85, classAverage: 78, students: 45 },
      { subject: 'Physics', individual: 92, classAverage: 82, students: 42 },
      { subject: 'Chemistry', individual: 78, classAverage: 75, students: 48 },
      { subject: 'Computer Science', individual: 95, classAverage: 88, students: 38 },
      { subject: 'English', individual: 88, classAverage: 85, students: 50 },
      { subject: 'Engineering Drawing', individual: 82, classAverage: 79, students: 44 },
      { subject: 'Workshop Practice', individual: 90, classAverage: 86, students: 40 }
    ];

    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload?.length) {
        return (
          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
            <p className="font-medium text-popover-foreground mb-2">{label}</p>
            {payload?.map((entry, index) => (
              <p key={index} className="text-sm" style={{ color: entry?.color }}>
                {entry?.name}: {entry?.value}%
              </p>
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
            <h3 className="text-lg font-semibold text-foreground">Subject-wise Attendance Analysis</h3>
            <p className="text-sm text-muted-foreground">Individual vs Class Average Performance</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded mr-2"></div>
              <span className="text-muted-foreground">Individual</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-accent rounded mr-2"></div>
              <span className="text-muted-foreground">Class Average</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="subject" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="individual" 
                name="Individual Attendance"
                fill="var(--color-primary)" 
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Line 
                type="monotone" 
                dataKey="classAverage" 
                name="Class Average"
                stroke="var(--color-accent)" 
                strokeWidth={3}
                dot={{ fill: 'var(--color-accent)', strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  export default AttendanceChart;