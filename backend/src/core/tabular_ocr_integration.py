import cv2
import numpy as np
import pandas as pd
import re
import os
from typing import List, Dict, Any, Optional, Tuple
import logging
from PIL import Image

logger = logging.getLogger(__name__)

class TabularOCRIntegration:
    """
    Integration with TabularOCR for enhanced table extraction
    """
    
    def __init__(self):
        self.tabular_ocr = None
        self._initialize_tabular_ocr()
    
    def _initialize_tabular_ocr(self):
        """Initialize TabularOCR if available"""
        try:
            # Try to import and initialize TabularOCR
            # Note: This is a placeholder as TabularOCR might need specific installation
            # from tabularocr import TabularOCR
            # self.tabular_ocr = TabularOCR()
            logger.info("TabularOCR would be initialized here")
        except ImportError:
            logger.warning("TabularOCR not available, using fallback methods")
    
    def detect_table_regions(self, image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detect table regions in the image using computer vision
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        
        # Apply threshold
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Detect horizontal lines
        horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
        horizontal_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel)
        
        # Detect vertical lines
        vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
        vertical_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel)
        
        # Combine lines
        table_mask = cv2.addWeighted(horizontal_lines, 0.5, vertical_lines, 0.5, 0.0)
        
        # Find contours
        contours, _ = cv2.findContours(table_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        table_regions = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            # Filter by size - tables should be reasonably large
            if w > 200 and h > 100:
                table_regions.append((x, y, x + w, y + h))
        
        return table_regions
    
    def extract_table_structure(self, image: np.ndarray, table_region: Tuple[int, int, int, int]) -> Dict[str, Any]:
        """
        Extract table structure from a detected table region
        """
        x1, y1, x2, y2 = table_region
        table_roi = image[y1:y2, x1:x2]
        
        # Convert to grayscale
        gray = cv2.cvtColor(table_roi, cv2.COLOR_BGR2GRAY) if len(table_roi.shape) == 3 else table_roi
        
        # Detect rows and columns
        rows = self._detect_rows(gray)
        columns = self._detect_columns(gray)
        
        return {
            'region': table_region,
            'rows': rows,
            'columns': columns,
            'cells': self._create_cell_grid(rows, columns)
        }
    
    def _detect_rows(self, gray_image: np.ndarray) -> List[Tuple[int, int]]:
        """Detect table rows"""
        # Apply threshold
        _, thresh = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Horizontal projection to find row separators
        horizontal_projection = np.sum(thresh, axis=1)
        
        # Find peaks (row separators)
        rows = []
        in_row = False
        start_y = 0
        
        for y, intensity in enumerate(horizontal_projection):
            if intensity > np.mean(horizontal_projection) * 0.5:  # Threshold for row detection
                if not in_row:
                    start_y = y
                    in_row = True
            else:
                if in_row:
                    rows.append((start_y, y))
                    in_row = False
        
        # Add last row if needed
        if in_row:
            rows.append((start_y, len(horizontal_projection)))
        
        return rows
    
    def _detect_columns(self, gray_image: np.ndarray) -> List[Tuple[int, int]]:
        """Detect table columns"""
        # Apply threshold
        _, thresh = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Vertical projection to find column separators
        vertical_projection = np.sum(thresh, axis=0)
        
        # Find valleys (column separators)
        columns = []
        in_column = False
        start_x = 0
        
        for x, intensity in enumerate(vertical_projection):
            if intensity > np.mean(vertical_projection) * 0.3:  # Threshold for column detection
                if not in_column:
                    start_x = x
                    in_column = True
            else:
                if in_column:
                    columns.append((start_x, x))
                    in_column = False
        
        # Add last column if needed
        if in_column:
            columns.append((start_x, len(vertical_projection)))
        
        return columns
    
    def _create_cell_grid(self, rows: List[Tuple[int, int]], columns: List[Tuple[int, int]]) -> List[List[Tuple[int, int, int, int]]]:
        """Create a grid of cell coordinates"""
        cells = []
        
        for row_start, row_end in rows:
            cell_row = []
            for col_start, col_end in columns:
                cell_row.append((col_start, row_start, col_end, row_end))
            cells.append(cell_row)
        
        return cells
    
    def extract_cell_content(self, image: np.ndarray, cell_coords: Tuple[int, int, int, int], ocr_engine) -> str:
        """
        Extract content from a single table cell
        """
        x1, y1, x2, y2 = cell_coords
        
        # Add padding to avoid cutting off characters
        padding = 2
        x1 = max(0, x1 - padding)
        y1 = max(0, y1 - padding)
        x2 = min(image.shape[1], x2 + padding)
        y2 = min(image.shape[0], y2 + padding)
        
        cell_roi = image[y1:y2, x1:x2]
        
        if cell_roi.size == 0:
            return ""
        
        # Extract text using the provided OCR engine
        try:
            text = ocr_engine.extract_text_tesseract(cell_roi, config='--psm 8 --oem 3')
            return text.strip()
        except:
            return ""
    
    def process_table_with_structure(self, image: np.ndarray, ocr_engine) -> List[Dict[str, Any]]:
        """
        Process image using table structure detection
        """
        results = []
        
        # Detect table regions
        table_regions = self.detect_table_regions(image)
        logger.info(f"Detected {len(table_regions)} table regions")
        
        for i, region in enumerate(table_regions):
            logger.info(f"Processing table region {i+1}")
            
            # Extract table structure
            table_structure = self.extract_table_structure(image, region)
            
            # Extract content from each cell
            table_data = []
            for row_idx, cell_row in enumerate(table_structure['cells']):
                row_data = []
                for col_idx, cell_coords in enumerate(cell_row):
                    # Adjust coordinates to global image coordinates
                    x1, y1, x2, y2 = cell_coords
                    global_coords = (
                        region[0] + x1,
                        region[1] + y1,
                        region[0] + x2,
                        region[1] + y2
                    )
                    
                    cell_content = self.extract_cell_content(image, global_coords, ocr_engine)
                    row_data.append(cell_content)
                
                table_data.append(row_data)
            
            # Convert to structured attendance data
            structured_data = self._convert_table_to_attendance_data(table_data)
            results.extend(structured_data)
        
        return results
    
    def _convert_table_to_attendance_data(self, table_data: List[List[str]]) -> List[Dict[str, Any]]:
        """
        Convert raw table data to structured attendance records
        """
        attendance_records = []
        
        for row in table_data:
            if len(row) < 2:  # Need at least roll number and name
                continue
            
            # Try to find roll number in the row
            roll_number = None
            name = ""
            attendance_marks = []
            
            for cell in row:
                # Check for roll number
                roll_match = re.search(r'\b(23\d{6})\b', cell)
                if roll_match:
                    roll_number = roll_match.group(1)
                    continue
                
                # Check for name (alphabetic characters)
                if re.search(r'^[A-Za-z\s]+$', cell.strip()) and len(cell.strip()) > 2:
                    if not name:  # Take the first name found
                        name = cell.strip()
                    continue
                
                # Check for attendance marks
                if re.search(r'^[PA✓✗XY01-]+$', cell.strip()):
                    attendance_marks.extend(list(cell.strip()))
            
            # Create record if we have at least a roll number
            if roll_number:
                # Count attendance
                present_count = sum(1 for mark in attendance_marks if mark.upper() in ['P', '✓', 'Y', '1'])
                absent_count = sum(1 for mark in attendance_marks if mark.upper() in ['A', '✗', 'X', '0', '-'])
                total_classes = len(attendance_marks)
                
                attendance_percentage = (present_count / total_classes * 100) if total_classes > 0 else 0
                
                record = {
                    'roll_number': roll_number,
                    'name': name.title() if name else "",
                    'present_count': present_count,
                    'absent_count': absent_count,
                    'total_classes': total_classes,
                    'attendance_percentage': round(attendance_percentage, 2),
                    'attendance_marks': attendance_marks,
                    'raw_row': row
                }
                
                attendance_records.append(record)
        
        return attendance_records
    
    def enhance_image_for_ocr(self, image: np.ndarray) -> np.ndarray:
        """
        Enhance image specifically for table OCR
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        
        # Noise reduction
        denoised = cv2.fastNlMeansDenoising(gray)
        
        # Contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(denoised)
        
        # Sharpening
        kernel = np.array([[-1, -1, -1],
                          [-1,  9, -1],
                          [-1, -1, -1]])
        sharpened = cv2.filter2D(enhanced, -1, kernel)
        
        # Morphological operations to clean up
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
        cleaned = cv2.morphologyEx(sharpened, cv2.MORPH_CLOSE, kernel)
        
        return cleaned