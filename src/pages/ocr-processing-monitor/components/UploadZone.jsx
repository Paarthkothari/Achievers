import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UploadZone = ({ onFileUpload, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e?.dataTransfer?.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files?.filter(file => 
      file?.type === 'application/pdf' || file?.type?.startsWith('image/')
    );
    if (validFiles?.length > 0) {
      onFileUpload(validFiles);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">File Upload</h3>
        <div className="flex items-center space-x-2">
          <Icon name="Upload" size={20} className="text-primary" />
          <span className="text-sm text-muted-foreground">Drag & Drop or Browse</span>
        </div>
      </div>
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/30'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef?.current?.click()}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragOver ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
          `}>
            <Icon name="FileText" size={32} />
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              {isDragOver ? 'Drop files here' : 'Upload Attendance Sheets'}
            </p>
            <p className="text-sm text-muted-foreground">
              Support for PDF and image files (JPG, PNG, TIFF)
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: 10MB per file
            </p>
          </div>

          <Button
            variant="outline"
            disabled={isProcessing}
            className="mt-4"
          >
            <Icon name="FolderOpen" size={16} className="mr-2" />
            Browse Files
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.tiff"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-muted-foreground">PDF Supported</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <span className="text-muted-foreground">Images Supported</span>
          </div>
        </div>
        <span className="text-muted-foreground">
          Batch processing available
        </span>
      </div>
    </div>
  );
};

export default UploadZone;