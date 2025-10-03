import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import StudentSearchFilter from './components/StudentSearchFilter';
import MetricsStrip from './components/MetricsStrip';
import AttendanceChart from './components/AttendanceChart';
import AttendanceHeatmap from './components/AttendanceHeatmap';
import DefaultersList from './components/DefaultersList';
import InterventionTracker from './components/InterventionTracker';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const StudentAnalytics = () => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    department: '',
    semester: '',
    threshold: 75
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock metrics data
  const metrics = {
    totalStudents: 1247,
    averageAttendance: 82.4,
    defaulters: 89,
    atRiskStudents: 34,
    perfectAttendance: 156
  };

  useEffect(() => {
    // Auto-refresh data every 30 minutes
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    console.log('Filters applied:', newFilters);
  };

  const handleExport = () => {
    console.log('Exporting student analytics data...');
    // Mock export functionality
    const exportData = {
      filters,
      metrics,
      timestamp: new Date()?.toISOString()
    };
    console.log('Export data:', exportData);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 2000);
  };

  const formatLastUpdated = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    return date?.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Student Analytics</h1>
              <p className="text-muted-foreground">
                Comprehensive attendance analysis and student performance insights
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Clock" size={16} />
                <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
              </div>
              <Button
                variant="outline"
                onClick={handleManualRefresh}
                loading={isRefreshing}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <StudentSearchFilter 
            onFilterChange={handleFilterChange}
            onExport={handleExport}
          />

          {/* Metrics Overview */}
          <MetricsStrip metrics={metrics} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Left Column - Charts (2/3 width on xl screens) */}
            <div className="xl:col-span-2 space-y-6">
              <AttendanceChart data={metrics} />
              <AttendanceHeatmap />
            </div>

            {/* Right Column - Analytics Panel (1/3 width on xl screens) */}
            <div className="space-y-6">
              <DefaultersList threshold={filters?.threshold} />
              <InterventionTracker />
            </div>
          </div>

          {/* Additional Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Performance Trends</h3>
                  <p className="text-sm text-muted-foreground">Monthly attendance progression</p>
                </div>
                <Icon name="TrendingUp" size={20} className="text-success" />
              </div>
              <div className="space-y-4">
                {[
                  { month: 'September', attendance: 84.2, change: '+2.1%' },
                  { month: 'August', attendance: 82.1, change: '-1.3%' },
                  { month: 'July', attendance: 83.4, change: '+3.2%' }
                ]?.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{trend?.month}</p>
                      <p className="text-sm text-muted-foreground">{trend?.attendance}% average</p>
                    </div>
                    <div className={`text-sm font-medium ${
                      trend?.change?.startsWith('+') ? 'text-success' : 'text-error'
                    }`}>
                      {trend?.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                  <p className="text-sm text-muted-foreground">Common administrative tasks</p>
                </div>
                <Icon name="Zap" size={20} className="text-accent" />
              </div>
              <div className="space-y-3">
                <Button variant="outline" fullWidth iconName="Mail" iconPosition="left">
                  Send Bulk Notifications
                </Button>
                <Button variant="outline" fullWidth iconName="FileText" iconPosition="left">
                  Generate Reports
                </Button>
                <Button variant="outline" fullWidth iconName="Users" iconPosition="left">
                  Schedule Parent Meetings
                </Button>
                <Button variant="outline" fullWidth iconName="Calendar" iconPosition="left">
                  Plan Interventions
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>Data updated every 30 minutes</span>
                <span>•</span>
                <span>Showing results for Academic Year 2024-25</span>
              </div>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <Icon name="Shield" size={16} />
                <span>Data privacy compliant</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentAnalytics;