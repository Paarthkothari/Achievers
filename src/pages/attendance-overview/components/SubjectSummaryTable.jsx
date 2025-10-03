import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SubjectSummaryTable = () => {
  const [sortConfig, setSortConfig] = useState({ key: 'attendance', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const subjectData = [
    {
      id: 1,
      code: 'CS-301',
      name: 'Data Structures & Algorithms',
      department: 'Computer Science',
      faculty: 'Dr. Sarah Johnson',
      totalStudents: 45,
      presentToday: 38,
      attendance: 84.4,
      avgAttendance: 82.1,
      defaulters: 3,
      lastUpdated: new Date(Date.now() - 1800000), // 30 min ago
      status: 'active',
      trend: 'up'
    },
    {
      id: 2,
      code: 'MATH-205',
      name: 'Linear Algebra',
      department: 'Mathematics',
      faculty: 'Prof. Michael Chen',
      totalStudents: 52,
      presentToday: 41,
      attendance: 78.8,
      avgAttendance: 79.5,
      defaulters: 8,
      lastUpdated: new Date(Date.now() - 900000), // 15 min ago
      status: 'processing',
      trend: 'down'
    },
    {
      id: 3,
      code: 'PHY-102',
      name: 'Mechanics & Thermodynamics',
      department: 'Physics',
      faculty: 'Dr. Emily Wilson',
      totalStudents: 38,
      presentToday: 33,
      attendance: 86.8,
      avgAttendance: 85.2,
      defaulters: 2,
      lastUpdated: new Date(Date.now() - 3600000), // 1 hour ago
      status: 'completed',
      trend: 'up'
    },
    {
      id: 4,
      code: 'CHEM-201',
      name: 'Organic Chemistry',
      department: 'Chemistry',
      faculty: 'Dr. Robert Davis',
      totalStudents: 41,
      presentToday: 29,
      attendance: 70.7,
      avgAttendance: 73.8,
      defaulters: 12,
      lastUpdated: new Date(Date.now() - 2700000), // 45 min ago
      status: 'alert',
      trend: 'down'
    },
    {
      id: 5,
      code: 'EE-305',
      name: 'Digital Signal Processing',
      department: 'Electrical Engineering',
      faculty: 'Prof. Lisa Anderson',
      totalStudents: 35,
      presentToday: 32,
      attendance: 91.4,
      avgAttendance: 89.6,
      defaulters: 1,
      lastUpdated: new Date(Date.now() - 600000), // 10 min ago
      status: 'active',
      trend: 'up'
    },
    {
      id: 6,
      code: 'ME-401',
      name: 'Heat Transfer',
      department: 'Mechanical Engineering',
      faculty: 'Dr. James Thompson',
      totalStudents: 29,
      presentToday: 24,
      attendance: 82.8,
      avgAttendance: 81.3,
      defaulters: 4,
      lastUpdated: new Date(Date.now() - 1200000), // 20 min ago
      status: 'active',
      trend: 'up'
    }
  ];

  const departments = ['all', ...new Set(subjectData.map(item => item.department))];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig?.key !== columnKey) {
      return 'ArrowUpDown';
    }
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'CheckCircle';
      case 'processing': return 'Loader2';
      case 'completed': return 'CheckCircle2';
      case 'alert': return 'AlertTriangle';
      default: return 'Circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'processing': return 'text-primary';
      case 'completed': return 'text-success';
      case 'alert': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 'TrendingUp' : 'TrendingDown';
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-success' : 'text-error';
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 85) return 'text-success';
    if (attendance >= 75) return 'text-warning';
    return 'text-error';
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

  const filteredAndSortedData = subjectData?.filter(item => {
      const matchesSearch = item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           item?.code?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           item?.faculty?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || item?.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    })?.sort((a, b) => {
      if (sortConfig?.key) {
        const aValue = a?.[sortConfig?.key];
        const bValue = b?.[sortConfig?.key];
        
        if (aValue < bValue) {
          return sortConfig?.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig?.direction === 'asc' ? 1 : -1;
        }
      }
      return 0;
    });

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Subject-wise Summary</h3>
          <p className="text-sm text-muted-foreground">Attendance overview across all subjects</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="pl-10 pr-4 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e?.target?.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {departments?.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
          
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200">
            <Icon name="Download" size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('code')}
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Subject</span>
                  <Icon name={getSortIcon('code')} size={14} />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('faculty')}
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Faculty</span>
                  <Icon name={getSortIcon('faculty')} size={14} />
                </button>
              </th>
              <th className="text-center py-3 px-4">
                <button
                  onClick={() => handleSort('totalStudents')}
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Students</span>
                  <Icon name={getSortIcon('totalStudents')} size={14} />
                </button>
              </th>
              <th className="text-center py-3 px-4">
                <button
                  onClick={() => handleSort('attendance')}
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Today's Attendance</span>
                  <Icon name={getSortIcon('attendance')} size={14} />
                </button>
              </th>
              <th className="text-center py-3 px-4">
                <button
                  onClick={() => handleSort('avgAttendance')}
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Avg Attendance</span>
                  <Icon name={getSortIcon('avgAttendance')} size={14} />
                </button>
              </th>
              <th className="text-center py-3 px-4">
                <button
                  onClick={() => handleSort('defaulters')}
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Defaulters</span>
                  <Icon name={getSortIcon('defaulters')} size={14} />
                </button>
              </th>
              <th className="text-center py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
              </th>
              <th className="text-center py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData?.map((subject) => (
              <tr key={subject?.id} className="border-b border-border hover:bg-muted/50 transition-colors duration-200">
                <td className="py-4 px-4">
                  <div>
                    <div className="font-medium text-foreground">{subject?.code}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-48">{subject?.name}</div>
                    <div className="text-xs text-muted-foreground">{subject?.department}</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-foreground">{subject?.faculty}</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="text-sm font-medium text-foreground">{subject?.totalStudents}</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`text-sm font-medium ${getAttendanceColor(subject?.attendance)}`}>
                      {subject?.attendance?.toFixed(1)}%
                    </span>
                    <Icon 
                      name={getTrendIcon(subject?.trend)} 
                      size={14} 
                      className={getTrendColor(subject?.trend)}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {subject?.presentToday}/{subject?.totalStudents}
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`text-sm font-medium ${getAttendanceColor(subject?.avgAttendance)}`}>
                    {subject?.avgAttendance?.toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`text-sm font-medium ${subject?.defaulters > 5 ? 'text-error' : subject?.defaulters > 2 ? 'text-warning' : 'text-success'}`}>
                    {subject?.defaulters}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center">
                    <Icon 
                      name={getStatusIcon(subject?.status)} 
                      size={16} 
                      className={`${getStatusColor(subject?.status)} ${subject?.status === 'processing' ? 'animate-spin' : ''}`}
                    />
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(subject?.lastUpdated)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredAndSortedData?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No subjects found matching your criteria</p>
        </div>
      )}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedData?.length} of {subjectData?.length} subjects
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-xs text-muted-foreground">≥85%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span className="text-xs text-muted-foreground">75-84%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-error rounded-full"></div>
            <span className="text-xs text-muted-foreground">&lt;75%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectSummaryTable;