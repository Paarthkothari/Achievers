import React, { useState } from 'react';

import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const StudentSearchFilter = ({ onFilterChange, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'cs', label: 'Computer Science' },
    { value: 'ee', label: 'Electrical Engineering' },
    { value: 'me', label: 'Mechanical Engineering' },
    { value: 'ce', label: 'Civil Engineering' },
    { value: 'it', label: 'Information Technology' }
  ];

  const semesterOptions = [
    { value: '', label: 'All Semesters' },
    { value: '1', label: 'Semester 1' },
    { value: '2', label: 'Semester 2' },
    { value: '3', label: 'Semester 3' },
    { value: '4', label: 'Semester 4' },
    { value: '5', label: 'Semester 5' },
    { value: '6', label: 'Semester 6' },
    { value: '7', label: 'Semester 7' },
    { value: '8', label: 'Semester 8' }
  ];

  const handleFilterChange = () => {
    onFilterChange({
      searchTerm,
      department: selectedDepartment,
      semester: selectedSemester,
      threshold: attendanceThreshold
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedSemester('');
    setAttendanceThreshold(75);
    onFilterChange({
      searchTerm: '',
      department: '',
      semester: '',
      threshold: 75
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <Input
            type="search"
            label="Search Students"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Department Filter */}
        <div className="w-full lg:w-48">
          <Select
            label="Department"
            options={departmentOptions}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            placeholder="Select department"
          />
        </div>

        {/* Semester Filter */}
        <div className="w-full lg:w-40">
          <Select
            label="Semester"
            options={semesterOptions}
            value={selectedSemester}
            onChange={setSelectedSemester}
            placeholder="Select semester"
          />
        </div>

        {/* Attendance Threshold */}
        <div className="w-full lg:w-48">
          <label className="block text-sm font-medium text-foreground mb-2">
            Defaulter Threshold: {attendanceThreshold}%
          </label>
          <input
            type="range"
            min="50"
            max="90"
            step="5"
            value={attendanceThreshold}
            onChange={(e) => setAttendanceThreshold(Number(e?.target?.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>50%</span>
            <span>90%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleFilterChange}
            iconName="Search"
            iconPosition="left"
          >
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            iconName="RotateCcw"
            iconPosition="left"
          >
            Reset
          </Button>
          <Button
            variant="secondary"
            onClick={onExport}
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentSearchFilter;