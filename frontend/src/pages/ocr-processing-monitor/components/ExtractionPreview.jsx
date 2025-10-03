import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExtractionPreview = ({ extractedData, confidenceScores, tableStructure }) => {
  const [selectedFile, setSelectedFile] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table', 'raw', 'confidence'

  const mockExtractedData = [
    {
      id: 1,
      fileName: 'CS301_Attendance_Oct2025.pdf',
      extractedAt: '2025-10-03T16:45:00Z',
      tableData: [
        { rollNo: 'CS2021001', name: 'Aarav Sharma', date: '03/10/2025', subject: 'CS-301', status: 'P', confidence: 0.95 },
        { rollNo: 'CS2021002', name: 'Priya Patel', date: '03/10/2025', subject: 'CS-301', status: 'A', confidence: 0.92 },
        { rollNo: 'CS2021003', name: 'Rahul Kumar', date: '03/10/2025', subject: 'CS-301', status: 'P', confidence: 0.98 },
        { rollNo: 'CS2021004', name: 'Sneha Singh', date: '03/10/2025', subject: 'CS-301', status: '✓', confidence: 0.87 },
        { rollNo: 'CS2021005', name: 'Arjun Reddy', date: '03/10/2025', subject: 'CS-301', status: '✗', confidence: 0.91 }
      ],
      structure: {
        columns: 5,
        rows: 6,
        headers: ['Roll No', 'Name', 'Date', 'Subject', 'Status'],
        confidence: 0.94
      },
      qualityMetrics: {
        overallConfidence: 0.93,
        textClarity: 0.89,
        tableStructure: 0.96,
        handwritingQuality: 0.85
      }
    },
    {
      id: 2,
      fileName: 'EE205_Attendance_Oct2025.pdf',
      extractedAt: '2025-10-03T16:42:00Z',
      tableData: [
        { rollNo: 'EE2021001', name: 'Vikram Joshi', date: '03/10/2025', subject: 'EE-205', status: 'P', confidence: 0.96 },
        { rollNo: 'EE2021002', name: 'Anita Gupta', date: '03/10/2025', subject: 'EE-205', status: 'P', confidence: 0.94 },
        { rollNo: 'EE2021003', name: 'Suresh Nair', date: '03/10/2025', subject: 'EE-205', status: 'A', confidence: 0.88 }
      ],
      structure: {
        columns: 5,
        rows: 4,
        headers: ['Roll No', 'Name', 'Date', 'Subject', 'Status'],
        confidence: 0.92
      },
      qualityMetrics: {
        overallConfidence: 0.91,
        textClarity: 0.93,
        tableStructure: 0.89,
        handwritingQuality: 0.91
      }
    }
  ];

  const currentData = mockExtractedData?.[selectedFile] || mockExtractedData?.[0];

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-success bg-success/10';
    if (confidence >= 0.8) return 'text-warning bg-warning/10';
    return 'text-error bg-error/10';
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'P': { display: 'Present', color: 'text-success bg-success/10' },
      'A': { display: 'Absent', color: 'text-error bg-error/10' },
      '✓': { display: 'Present', color: 'text-success bg-success/10' },
      '✗': { display: 'Absent', color: 'text-error bg-error/10' },
      '-': { display: 'Unclear', color: 'text-warning bg-warning/10' }
    };
    return statusMap?.[status] || { display: status, color: 'text-muted-foreground bg-muted' };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Extraction Preview</h3>
        <div className="flex items-center space-x-2">
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(parseInt(e?.target?.value))}
            className="px-3 py-1 text-sm border border-border rounded-md bg-background text-foreground"
          >
            {mockExtractedData?.map((file, index) => (
              <option key={file?.id} value={index}>
                {file?.fileName}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* View Mode Tabs */}
      <div className="flex items-center space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {[
          { id: 'table', label: 'Table View', icon: 'Table' },
          { id: 'confidence', label: 'Confidence', icon: 'BarChart3' },
          { id: 'raw', label: 'Raw Data', icon: 'Code' }
        ]?.map((mode) => (
          <button
            key={mode?.id}
            onClick={() => setViewMode(mode?.id)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${viewMode === mode?.id 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <Icon name={mode?.icon} size={16} />
            <span>{mode?.label}</span>
          </button>
        ))}
      </div>
      {/* Table View */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          {/* Table Structure Info */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Structure:</span>
                <span className="ml-2 font-medium text-foreground">
                  {currentData?.structure?.rows} rows × {currentData?.structure?.columns} cols
                </span>
              </div>
              <div className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${getConfidenceColor(currentData?.structure?.confidence)}
              `}>
                {Math.round(currentData?.structure?.confidence * 100)}% confidence
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Extracted: {new Date(currentData.extractedAt)?.toLocaleTimeString()}
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full border border-border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  {currentData?.structure?.headers?.map((header, index) => (
                    <th key={index} className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">
                      {header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData?.tableData?.map((row, index) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors duration-200">
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border">
                      {row?.rollNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border">
                      {row?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border">
                      {row?.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border">
                      {row?.subject}
                    </td>
                    <td className="px-4 py-3 border-b border-border">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${getStatusDisplay(row?.status)?.color}
                      `}>
                        {getStatusDisplay(row?.status)?.display}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-border">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${getConfidenceColor(row?.confidence)}
                      `}>
                        {Math.round(row?.confidence * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Confidence View */}
      {viewMode === 'confidence' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Metrics */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Quality Metrics</h4>
              {Object.entries(currentData?.qualityMetrics)?.map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key?.replace(/([A-Z])/g, ' $1')?.trim()}
                    </span>
                    <span className={`font-medium ${getConfidenceColor(value)?.split(' ')?.[0]}`}>
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        value >= 0.9 ? 'bg-success' : value >= 0.8 ? 'bg-warning' : 'bg-error'
                      }`}
                      style={{ width: `${value * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Per-Row Confidence */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Per-Row Confidence</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentData?.tableData?.map((row, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm text-foreground">{row?.rollNo}</span>
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${getConfidenceColor(row?.confidence)}
                    `}>
                      {Math.round(row?.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Raw Data View */}
      {viewMode === 'raw' && (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <pre className="text-sm text-foreground overflow-x-auto">
              {JSON.stringify(currentData, null, 2)}
            </pre>
          </div>
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Download" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Export extracted data</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} className="mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="FileSpreadsheet" size={16} className="mr-2" />
            Export Excel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExtractionPreview;