import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import KPICard from './components/KPICard';
import AttendanceChart from './components/AttendanceChart';
import ProcessingStatus from './components/ProcessingStatus';
import RecentAlerts from './components/RecentAlerts';
import SubjectSummaryTable from './components/SubjectSummaryTable';
import DashboardFilters from './components/DashboardFilters';
import Icon from '../../components/AppIcon';

const AttendanceOverview = () => {
  const [filters, setFilters] = useState({
    dateRange: 'current_semester',
    department: 'all',
    subjects: ['all']
  });

  const [dashboardData, setDashboardData] = useState({
    totalStudents: 1247,
    overallAttendance: 82.4,
    activeDefaulters: 89,
    processingSuccessRate: 94.7,
    trends: {
      students: { value: '+3.2%', direction: 'up' },
      attendance: { value: '+1.8%', direction: 'up' },
      defaulters: { value: '-5.1%', direction: 'down' },
      successRate: { value: '+0.9%', direction: 'up' }
    },
    sparklineData: {
      students: [1180, 1195, 1210, 1225, 1240, 1247],
      attendance: [79.2, 80.1, 81.3, 81.8, 82.1, 82.4],
      defaulters: [105, 98, 92, 89, 91, 89],
      successRate: [92.1, 93.2, 93.8, 94.1, 94.5, 94.7]
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate data refresh when filters change
    setIsLoading(true);
    const timer = setTimeout(() => {
      // Update dashboard data based on filters
      setDashboardData(prev => ({
        ...prev,
        // Simulate different data based on filters
        totalStudents: filters?.department === 'all' ? 1247 : Math.floor(Math.random() * 500) + 200,
        overallAttendance: Math.round((Math.random() * 20 + 75) * 10) / 10,
        activeDefaulters: Math.floor(Math.random() * 50) + 40,
        processingSuccessRate: Math.round((Math.random() * 10 + 90) * 10) / 10
      }));
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const kpiCards = [
    {
      title: 'Total Students Processed',
      value: dashboardData?.totalStudents?.toLocaleString(),
      subtitle: 'Across all subjects',
      trend: dashboardData?.trends?.students?.direction,
      trendValue: dashboardData?.trends?.students?.value,
      icon: 'Users',
      color: 'primary',
      sparklineData: dashboardData?.sparklineData?.students
    },
    {
      title: 'Overall Attendance',
      value: `${dashboardData?.overallAttendance}%`,
      subtitle: 'Current semester average',
      trend: dashboardData?.trends?.attendance?.direction,
      trendValue: dashboardData?.trends?.attendance?.value,
      icon: 'TrendingUp',
      color: dashboardData?.overallAttendance >= 85 ? 'success' : dashboardData?.overallAttendance >= 75 ? 'warning' : 'error',
      sparklineData: dashboardData?.sparklineData?.attendance
    },
    {
      title: 'Active Defaulters',
      value: dashboardData?.activeDefaulters?.toString(),
      subtitle: 'Below 75% attendance',
      trend: dashboardData?.trends?.defaulters?.direction,
      trendValue: dashboardData?.trends?.defaulters?.value,
      icon: 'AlertTriangle',
      color: 'warning',
      sparklineData: dashboardData?.sparklineData?.defaulters
    },
    {
      title: 'Processing Success Rate',
      value: `${dashboardData?.processingSuccessRate}%`,
      subtitle: 'OCR accuracy rate',
      trend: dashboardData?.trends?.successRate?.direction,
      trendValue: dashboardData?.trends?.successRate?.value,
      icon: 'CheckCircle',
      color: 'success',
      sparklineData: dashboardData?.sparklineData?.successRate
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Attendance Overview</h1>
                <p className="text-muted-foreground mt-2">
                  Real-time monitoring and analytics dashboard for attendance tracking
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-4 py-2 bg-card border border-border rounded-lg">
                  <Icon name="Calendar" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {new Date()?.toLocaleDateString('en-GB', { 
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200">
                  <Icon name="RefreshCw" size={16} className={isLoading ? 'animate-spin' : ''} />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Filters */}
          <DashboardFilters onFiltersChange={handleFiltersChange} />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiCards?.map((card, index) => (
              <KPICard
                key={index}
                title={card?.title}
                value={card?.value}
                subtitle={card?.subtitle}
                trend={card?.trend}
                trendValue={card?.trendValue}
                icon={card?.icon}
                color={card?.color}
                sparklineData={card?.sparklineData}
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Attendance Chart - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <AttendanceChart />
            </div>
            
            {/* Right Sidebar - Takes 1 column */}
            <div className="space-y-6">
              <ProcessingStatus />
              <RecentAlerts />
            </div>
          </div>

          {/* Subject Summary Table */}
          <SubjectSummaryTable />

          {/* Quick Actions Footer */}
          <div className="mt-8 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Common tasks and shortcuts</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200">
                  <Icon name="Upload" size={16} />
                  <span>Upload Attendance</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors duration-200">
                  <Icon name="FileText" size={16} />
                  <span>Generate Report</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors duration-200">
                  <Icon name="Settings" size={16} />
                  <span>Configure Alerts</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors duration-200">
                  <Icon name="HelpCircle" size={16} />
                  <span>Help & Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendanceOverview;