import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import AttendanceOverview from './pages/attendance-overview';
import AnomalyDetectionHub from './pages/anomaly-detection-hub';
import StudentAnalytics from './pages/student-analytics';
import OCRProcessingMonitor from './pages/ocr-processing-monitor';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<AttendanceOverview />} />
        <Route path="/attendance-overview" element={<AttendanceOverview />} />
        <Route path="/anomaly-detection-hub" element={<AnomalyDetectionHub />} />
        <Route path="/student-analytics" element={<StudentAnalytics />} />
        <Route path="/ocr-processing-monitor" element={<OCRProcessingMonitor />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
