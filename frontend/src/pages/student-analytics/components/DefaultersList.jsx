import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DefaultersList = ({ threshold = 75 }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  const defaulters = [
    {
      id: 1,
      rollNumber: 'CS21001',
      name: 'Rahul Sharma',
      department: 'Computer Science',
      semester: 3,
      attendance: 68,
      riskScore: 85,
      subjects: ['Mathematics', 'Physics', 'Programming'],
      lastContact: '2025-09-28',
      interventionStatus: 'pending',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 2,
      rollNumber: 'EE21045',
      name: 'Priya Patel',
      department: 'Electrical Engineering',
      semester: 2,
      attendance: 72,
      riskScore: 78,
      subjects: ['Circuit Analysis', 'Mathematics'],
      lastContact: '2025-09-30',
      interventionStatus: 'contacted',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: 3,
      rollNumber: 'ME21089',
      name: 'Amit Kumar',
      department: 'Mechanical Engineering',
      semester: 4,
      attendance: 65,
      riskScore: 92,
      subjects: ['Thermodynamics', 'Fluid Mechanics', 'Manufacturing'],
      lastContact: '2025-09-25',
      interventionStatus: 'escalated',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    {
      id: 4,
      rollNumber: 'IT21067',
      name: 'Sneha Gupta',
      department: 'Information Technology',
      semester: 1,
      attendance: 74,
      riskScore: 70,
      subjects: ['Programming Fundamentals', 'Mathematics'],
      lastContact: '2025-10-01',
      interventionStatus: 'resolved',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
    },
    {
      id: 5,
      rollNumber: 'CE21023',
      name: 'Vikash Singh',
      department: 'Civil Engineering',
      semester: 5,
      attendance: 69,
      riskScore: 88,
      subjects: ['Structural Analysis', 'Concrete Technology'],
      lastContact: '2025-09-27',
      interventionStatus: 'pending',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg'
    }
  ];

  const getRiskColor = (score) => {
    if (score >= 90) return 'text-error';
    if (score >= 80) return 'text-warning';
    return 'text-accent';
  };

  const getRiskBadge = (score) => {
    if (score >= 90) return { label: 'High Risk', color: 'bg-error' };
    if (score >= 80) return { label: 'Medium Risk', color: 'bg-warning' };
    return { label: 'Low Risk', color: 'bg-accent' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'contacted': return 'bg-primary/10 text-primary border-primary/20';
      case 'escalated': return 'bg-error/10 text-error border-error/20';
      case 'resolved': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const handleContactStudent = (studentId) => {
    console.log('Contacting student:', studentId);
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Defaulters List</h3>
            <p className="text-sm text-muted-foreground">
              Students below {threshold}% attendance threshold
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" iconName="Filter">
              Filter
            </Button>
            <Button variant="outline" size="sm" iconName="Download">
              Export
            </Button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {defaulters?.map((student) => {
          const riskBadge = getRiskBadge(student?.riskScore);
          return (
            <div key={student?.id} className="p-4 hover:bg-muted/50 transition-colors duration-200">
              <div className="flex items-start space-x-4">
                <img
                  src={student?.avatar}
                  alt={student?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">{student?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {student?.rollNumber} • {student?.department}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${riskBadge?.color} text-white`}>
                        {riskBadge?.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Attendance</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${student?.attendance < threshold ? 'text-error' : 'text-foreground'}`}>
                          {student?.attendance}%
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${student?.attendance < threshold ? 'bg-error' : 'bg-success'}`}
                            style={{ width: `${student?.attendance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Risk Score</span>
                      <p className={`text-sm font-medium ${getRiskColor(student?.riskScore)}`}>
                        {student?.riskScore}/100
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(student?.interventionStatus)}`}>
                        {student?.interventionStatus?.charAt(0)?.toUpperCase() + student?.interventionStatus?.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Last contact: {student?.lastContact}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewProfile(student)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors duration-200"
                        title="View Profile"
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                      <button
                        onClick={() => handleContactStudent(student?.id)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors duration-200"
                        title="Contact Student"
                      >
                        <Icon name="MessageCircle" size={16} />
                      </button>
                      <button
                        className="p-1 text-muted-foreground hover:text-primary transition-colors duration-200"
                        title="Send Email"
                      >
                        <Icon name="Mail" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {defaulters?.length} defaulters
          </span>
          <Button variant="outline" size="sm" iconName="RefreshCw">
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DefaultersList;