import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AttendanceHeatmap = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English', 'Engineering Drawing'];
  const timeLabels = selectedPeriod === 'month' 
    ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'] 
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  // Mock heatmap data (attendance percentages)
  const heatmapData = [
    [85, 92, 78, 88, 95, 82],
    [78, 85, 82, 92, 88, 79],
    [92, 78, 95, 85, 82, 88],
    [88, 95, 85, 78, 92, 85]
  ];

  const getIntensityColor = (value) => {
    if (value >= 90) return 'bg-success';
    if (value >= 80) return 'bg-accent';
    if (value >= 70) return 'bg-warning';
    return 'bg-error';
  };

  const getIntensityOpacity = (value) => {
    if (value >= 90) return 'opacity-100';
    if (value >= 80) return 'opacity-75';
    if (value >= 70) return 'opacity-50';
    return 'opacity-25';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Attendance Pattern Heatmap</h3>
          <p className="text-sm text-muted-foreground">Visual representation of attendance intensity</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
              selectedPeriod === 'month' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPeriod('semester')}
            className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
              selectedPeriod === 'semester' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Semester
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            <div className="text-sm font-medium text-muted-foreground"></div>
            {subjects?.map((subject, index) => (
              <div key={index} className="text-xs font-medium text-muted-foreground text-center p-2">
                {subject?.split(' ')?.[0]}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          {timeLabels?.map((timeLabel, timeIndex) => (
            <div key={timeIndex} className="grid grid-cols-7 gap-2 mb-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center">
                {timeLabel}
              </div>
              {heatmapData?.[timeIndex]?.map((value, subjectIndex) => (
                <div
                  key={subjectIndex}
                  className={`
                    relative h-12 rounded-md border border-border cursor-pointer
                    ${getIntensityColor(value)} ${getIntensityOpacity(value)}
                    hover:scale-105 transition-transform duration-200
                    flex items-center justify-center
                  `}
                  title={`${subjects?.[subjectIndex]}: ${value}% attendance`}
                >
                  <span className="text-xs font-medium text-white mix-blend-difference">
                    {value}%
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-muted-foreground">Attendance Rate:</span>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-error opacity-25 rounded"></div>
            <span className="text-xs text-muted-foreground">&lt;70%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-warning opacity-50 rounded"></div>
            <span className="text-xs text-muted-foreground">70-79%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-accent opacity-75 rounded"></div>
            <span className="text-xs text-muted-foreground">80-89%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-success opacity-100 rounded"></div>
            <span className="text-xs text-muted-foreground">90%+</span>
          </div>
        </div>
        <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80">
          <Icon name="Maximize2" size={16} />
          <span>Full Screen</span>
        </button>
      </div>
    </div>
  );
};

export default AttendanceHeatmap;