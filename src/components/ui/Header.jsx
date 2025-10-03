import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Header = () => {
  const location = useLocation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({
    active: false,
    progress: 0,
    queue: 0
  });
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Anomaly Detected',
      message: 'Unusual attendance pattern in CS-301',
      time: '2 min ago',
      unread: true
    },
    {
      id: 2,
      type: 'success',
      title: 'OCR Processing Complete',
      message: 'Batch #1247 processed successfully',
      time: '5 min ago',
      unread: true
    },
    {
      id: 3,
      type: 'error',
      title: 'Processing Failed',
      message: 'Unable to process attendance sheet for EE-205',
      time: '10 min ago',
      unread: false
    }
  ]);

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const navigationItems = [
    {
      label: 'Overview',
      path: '/attendance-overview',
      icon: 'BarChart3',
      tooltip: 'Attendance Overview Dashboard'
    },
    {
      label: 'Processing',
      path: '/ocr-processing-monitor',
      icon: 'FileText',
      tooltip: 'OCR Processing Monitor'
    },
    {
      label: 'Quality',
      path: '/anomaly-detection-hub',
      icon: 'AlertTriangle',
      tooltip: 'Anomaly Detection Hub'
    },
    {
      label: 'Analytics',
      path: '/student-analytics',
      icon: 'TrendingUp',
      tooltip: 'Student Analytics'
    }
  ];

  const unreadCount = notifications?.filter(n => n?.unread)?.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef?.current && !notificationRef?.current?.contains(event?.target)) {
        setIsNotificationOpen(false);
      }
      if (userMenuRef?.current && !userMenuRef?.current?.contains(event?.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Simulate processing status updates
    const interval = setInterval(() => {
      setProcessingStatus(prev => ({
        ...prev,
        active: Math.random() > 0.7,
        progress: Math.floor(Math.random() * 100),
        queue: Math.floor(Math.random() * 5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (notificationId) => {
    setNotifications(prev => 
      prev?.map(n => 
        n?.id === notificationId ? { ...n, unread: false } : n
      )
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev?.map(n => ({ ...n, unread: false })));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'XCircle';
      default: return 'Info';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-primary';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-1000 bg-card border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="GraduationCap" size={20} color="white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-foreground leading-none">
                Attendance Analytics
              </h1>
              <span className="text-xs text-muted-foreground">Dashboard</span>
            </div>
          </div>

          {/* Primary Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems?.map((item) => {
              const isActive = location?.pathname === item?.path;
              return (
                <a
                  key={item?.path}
                  href={item?.path}
                  title={item?.tooltip}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <Icon name={item?.icon} size={16} />
                  <span>{item?.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Processing Status Indicator */}
          <div className="hidden sm:flex items-center space-x-2">
            {processingStatus?.active ? (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-accent/10 rounded-full">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-accent">
                  Processing {processingStatus?.progress}%
                </span>
                {processingStatus?.queue > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({processingStatus?.queue} queued)
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-success/10 rounded-full">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs font-medium text-success">Idle</span>
              </div>
            )}
          </div>

          {/* Notification Center */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
            >
              <Icon name="Bell" size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs font-medium rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg z-1010 animate-slide-in">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-popover-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary hover:text-primary/80 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications?.map((notification) => (
                    <div
                      key={notification?.id}
                      onClick={() => handleNotificationClick(notification?.id)}
                      className={`
                        p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors duration-200
                        ${notification?.unread ? 'bg-accent/5' : ''}
                      `}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon 
                          name={getNotificationIcon(notification?.type)} 
                          size={16} 
                          className={getNotificationColor(notification?.type)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-popover-foreground truncate">
                              {notification?.title}
                            </p>
                            {notification?.unread && (
                              <div className="w-2 h-2 bg-primary rounded-full ml-2"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification?.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notification?.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Context Switcher */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-foreground">Dr. Sarah Johnson</p>
                <p className="text-xs text-muted-foreground">Computer Science Dept.</p>
              </div>
              <Icon name="ChevronDown" size={16} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-1010 animate-slide-in">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="User" size={20} color="white" />
                    </div>
                    <div>
                      <p className="font-medium text-popover-foreground">Dr. Sarah Johnson</p>
                      <p className="text-sm text-muted-foreground">Faculty Administrator</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted rounded-lg transition-colors duration-200">
                    <Icon name="Building" size={16} />
                    <span className="text-sm">Switch Department</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted rounded-lg transition-colors duration-200">
                    <Icon name="Settings" size={16} />
                    <span className="text-sm">Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted rounded-lg transition-colors duration-200">
                    <Icon name="HelpCircle" size={16} />
                    <span className="text-sm">Help & Support</span>
                  </button>
                  <div className="border-t border-border my-2"></div>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted rounded-lg transition-colors duration-200 text-error">
                    <Icon name="LogOut" size={16} />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;