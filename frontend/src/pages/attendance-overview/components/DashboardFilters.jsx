import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DashboardFilters = ({ onFiltersChange }) => {
  const [dateRange, setDateRange] = useState('current_semester');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedSubjects, setSelectedSubjects] = useState(['all']);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'current_semester', label: 'Current Semester' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'computer_science', label: 'Computer Science' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'electrical_engineering', label: 'Electrical Engineering' },
    { value: 'mechanical_engineering', label: 'Mechanical Engineering' }
  ];

  const subjects = [
    { value: 'all', label: 'All Subjects', department: 'all' },
    { value: 'cs_301', label: 'CS-301: Data Structures', department: 'computer_science' },
    { value: 'cs_302', label: 'CS-302: Algorithms', department: 'computer_science' },
    { value: 'math_205', label: 'MATH-205: Linear Algebra', department: 'mathematics' },
    { value: 'math_206', label: 'MATH-206: Calculus III', department: 'mathematics' },
    { value: 'phy_102', label: 'PHY-102: Mechanics', department: 'physics' },
    { value: 'phy_103', label: 'PHY-103: Thermodynamics', department: 'physics' },
    { value: 'chem_201', label: 'CHEM-201: Organic Chemistry', department: 'chemistry' },
    { value: 'ee_305', label: 'EE-305: Digital Signal Processing', department: 'electrical_engineering' },
    { value: 'me_401', label: 'ME-401: Heat Transfer', department: 'mechanical_engineering' }
  ];

  const getFilteredSubjects = () => {
    if (selectedDepartment === 'all') return subjects;
    return subjects?.filter(subject => 
      subject?.department === 'all' || subject?.department === selectedDepartment
    );
  };

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    onFiltersChange?.({
      dateRange: value,
      department: selectedDepartment,
      subjects: selectedSubjects
    });
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    // Reset subjects when department changes
    if (value === 'all') {
      setSelectedSubjects(['all']);
    } else {
      const departmentSubjects = subjects?.filter(s => s?.department === value);
      if (departmentSubjects?.length > 0) {
        setSelectedSubjects(['all']);
      }
    }
    
    onFiltersChange?.({
      dateRange,
      department: value,
      subjects: value === 'all' ? ['all'] : ['all']
    });
  };

  const handleSubjectToggle = (subjectValue) => {
    let newSelectedSubjects;
    
    if (subjectValue === 'all') {
      newSelectedSubjects = ['all'];
    } else {
      if (selectedSubjects?.includes('all')) {
        newSelectedSubjects = [subjectValue];
      } else {
        if (selectedSubjects?.includes(subjectValue)) {
          newSelectedSubjects = selectedSubjects?.filter(s => s !== subjectValue);
          if (newSelectedSubjects?.length === 0) {
            newSelectedSubjects = ['all'];
          }
        } else {
          newSelectedSubjects = [...selectedSubjects, subjectValue];
        }
      }
    }
    
    setSelectedSubjects(newSelectedSubjects);
    onFiltersChange?.({
      dateRange,
      department: selectedDepartment,
      subjects: newSelectedSubjects
    });
  };

  const getSelectedSubjectsLabel = () => {
    if (selectedSubjects?.includes('all')) return 'All Subjects';
    if (selectedSubjects?.length === 1) {
      const subject = subjects?.find(s => s?.value === selectedSubjects?.[0]);
      return subject?.label || 'Select Subjects';
    }
    return `${selectedSubjects?.length} subjects selected`;
  };

  const clearAllFilters = () => {
    setDateRange('current_semester');
    setSelectedDepartment('all');
    setSelectedSubjects(['all']);
    onFiltersChange?.({
      dateRange: 'current_semester',
      department: 'all',
      subjects: ['all']
    });
  };

  const hasActiveFilters = dateRange !== 'current_semester' || 
                          selectedDepartment !== 'all'|| !selectedSubjects?.includes('all');

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Dashboard Filters</h3>
          <p className="text-sm text-muted-foreground">Customize your attendance overview</p>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200"
          >
            <Icon name="X" size={14} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Date Range</label>
          <div className="relative">
            <Icon name="Calendar" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
            >
              {dateRangeOptions?.map(option => (
                <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
            <Icon name="ChevronDown" size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Department Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Department</label>
          <div className="relative">
            <Icon name="Building" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <select
              value={selectedDepartment}
              onChange={(e) => handleDepartmentChange(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
            >
              {departments?.map(dept => (
                <option key={dept?.value} value={dept?.value}>
                  {dept?.label}
                </option>
              ))}
            </select>
            <Icon name="ChevronDown" size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Subject Multi-Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Subjects</label>
          <div className="relative">
            <button
              onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
              className="w-full flex items-center justify-between pl-10 pr-4 py-2.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-left"
            >
              <Icon name="BookOpen" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <span className="truncate">{getSelectedSubjectsLabel()}</span>
              <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
            </button>
            
            {isSubjectDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {getFilteredSubjects()?.map(subject => (
                  <label
                    key={subject?.value}
                    className="flex items-center space-x-3 px-4 py-2.5 hover:bg-muted cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubjects?.includes(subject?.value)}
                      onChange={() => handleSubjectToggle(subject?.value)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-popover-foreground">{subject?.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Processing Status Indicator */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">System Status</label>
          <div className="flex items-center space-x-3 px-4 py-2.5 border border-border rounded-md bg-background">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-success font-medium">Live</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Updated {new Date()?.toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">Active filters:</span>
            <div className="flex items-center space-x-2">
              {dateRange !== 'current_semester' && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  {dateRangeOptions?.find(opt => opt?.value === dateRange)?.label}
                </span>
              )}
              {selectedDepartment !== 'all' && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  {departments?.find(dept => dept?.value === selectedDepartment)?.label}
                </span>
              )}
              {!selectedSubjects?.includes('all') && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  {selectedSubjects?.length} subject{selectedSubjects?.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;