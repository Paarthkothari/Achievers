import cv2
import numpy as np
import pandas as pd
import re
import os
from typing import List, Dict, Any, Optional, Tuple
import logging
from .enhanced_ocr_processor import EnhancedOCRProcessor
from .tabular_ocr_integration import TabularOCRIntegration
from .custom_cnn_model import CustomCNNModel

logger = logging.getLogger(__name__)

class IntegratedOCRManager:
    """
    Integrated OCR manager that combines multiple OCR approaches for best results
    """
    
    def __init__(self):
        # Initialize all OCR components
        self.enhanced_ocr = EnhancedOCRProcessor()
        self.tabular_ocr = TabularOCRIntegration()
        self.custom_cnn = CustomCNNModel()
        
        # Configuration
        self.confidence_threshold = 0.6
        self.min_roll_number_confidence = 0.8
        
        logger.info("Integrated OCR Manager initialized")
    
    def process_document(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Process a document (PDF or image) using all available OCR methods
        """
        logger.info(f"Processing document: {file_path}")
        
        # Determine file type
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            return self._process_pdf_comprehensive(file_path)
        elif file_ext in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
            return self._process_image_comprehensive(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
    
    def _process_pdf_comprehensive(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Comprehensive PDF processing using multiple methods
        """
        all_results = []
        
        # Method 1: Enhanced OCR with multiple engines
        logger.info("Method 1: Enhanced OCR processing...")
        try:
            enhanced_results = self.enhanced_ocr.process_pdf_enhanced(pdf_path)
            logger.info(f"Enhanced OCR found {len(enhanced_results)} records")
            all_results.extend(self._tag_results(enhanced_results, "enhanced_ocr"))
        except Exception as e:
            logger.error(f"Enhanced OCR failed: {e}")
        
        # Method 2: Process each page as image with tabular OCR
        logger.info("Method 2: Tabular OCR processing...")
        try:
            tabular_results = self._process_pdf_with_tabular_ocr(pdf_path)
            logger.info(f"Tabular OCR found {len(tabular_results)} records")
            all_results.extend(self._tag_results(tabular_results, "tabular_ocr"))
        except Exception as e:
            logger.error(f"Tabular OCR failed: {e}")
        
        # Method 3: Custom CNN processing
        logger.info("Method 3: Custom CNN processing...")
        try:
            cnn_results = self._process_pdf_with_cnn(pdf_path)
            logger.info(f"Custom CNN found {len(cnn_results)} records")
            all_results.extend(self._tag_results(cnn_results, "custom_cnn"))
        except Exception as e:
            logger.error(f"Custom CNN failed: {e}")
        
        # Combine and validate results
        final_results = self._combine_and_validate_results(all_results)
        logger.info(f"Final combined results: {len(final_results)} records")
        
        return final_results
    
    def _process_image_comprehensive(self, image_path: str) -> List[Dict[str, Any]]:
        """
        Comprehensive image processing using multiple methods
        """
        all_results = []
        
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        # Method 1: Enhanced OCR
        logger.info("Method 1: Enhanced OCR processing...")
        try:
            enhanced_results = self.enhanced_ocr.extract_structured_table_data(image)
            logger.info(f"Enhanced OCR found {len(enhanced_results)} records")
            all_results.extend(self._tag_results(enhanced_results, "enhanced_ocr"))
        except Exception as e:
            logger.error(f"Enhanced OCR failed: {e}")
        
        # Method 2: Tabular OCR
        logger.info("Method 2: Tabular OCR processing...")
        try:
            tabular_results = self.tabular_ocr.process_table_with_structure(image, self.enhanced_ocr)
            logger.info(f"Tabular OCR found {len(tabular_results)} records")
            all_results.extend(self._tag_results(tabular_results, "tabular_ocr"))
        except Exception as e:
            logger.error(f"Tabular OCR failed: {e}")
        
        # Method 3: Custom CNN
        logger.info("Method 3: Custom CNN processing...")
        try:
            cnn_results = self._process_image_with_cnn(image)
            logger.info(f"Custom CNN found {len(cnn_results)} records")
            all_results.extend(self._tag_results(cnn_results, "custom_cnn"))
        except Exception as e:
            logger.error(f"Custom CNN failed: {e}")
        
        # Combine and validate results
        final_results = self._combine_and_validate_results(all_results)
        logger.info(f"Final combined results: {len(final_results)} records")
        
        return final_results
    
    def _process_pdf_with_tabular_ocr(self, pdf_path: str) -> List[Dict[str, Any]]:
        """Process PDF using tabular OCR approach"""
        results = []
        
        try:
            import fitz
            doc = fitz.open(pdf_path)
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Convert to high-resolution image
                mat = fitz.Matrix(3.0, 3.0)
                pix = page.get_pixmap(matrix=mat)
                img_data = pix.tobytes("ppm")
                
                # Convert to numpy array
                from PIL import Image
                import io
                image = Image.open(io.BytesIO(img_data))
                image_array = np.array(image)
                
                # Process with tabular OCR
                page_results = self.tabular_ocr.process_table_with_structure(image_array, self.enhanced_ocr)
                
                # Add page information
                for record in page_results:
                    record['page_number'] = page_num + 1
                
                results.extend(page_results)
            
            doc.close()
            
        except Exception as e:
            logger.error(f"Error in tabular OCR processing: {e}")
        
        return results
    
    def _process_pdf_with_cnn(self, pdf_path: str) -> List[Dict[str, Any]]:
        """Process PDF using custom CNN approach"""
        results = []
        
        try:
            import fitz
            doc = fitz.open(pdf_path)
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Convert to image
                mat = fitz.Matrix(2.0, 2.0)
                pix = page.get_pixmap(matrix=mat)
                img_data = pix.tobytes("ppm")
                
                # Convert to numpy array
                from PIL import Image
                import io
                image = Image.open(io.BytesIO(img_data))
                image_array = np.array(image)
                
                # Process with CNN
                page_results = self._process_image_with_cnn(image_array)
                
                # Add page information
                for record in page_results:
                    record['page_number'] = page_num + 1
                
                results.extend(page_results)
            
            doc.close()
            
        except Exception as e:
            logger.error(f"Error in CNN processing: {e}")
        
        return results
    
    def _process_image_with_cnn(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """Process image using custom CNN model"""
        results = []
        
        try:
            # Detect table lines
            line_boxes = self.enhanced_ocr.detect_table_structure(image)
            
            for i, line_box in enumerate(line_boxes):
                x1, y1, x2, y2 = line_box
                line_roi = image[y1:y2, x1:x2]
                
                # Extract text using CNN
                text = self.custom_cnn.detect_and_recognize_text(line_roi)
                
                if text:
                    # Parse the text
                    parsed_data = self.enhanced_ocr.parse_attendance_line(text)
                    if parsed_data:
                        parsed_data['line_number'] = i + 1
                        parsed_data['extraction_method'] = 'custom_cnn'
                        results.append(parsed_data)
        
        except Exception as e:
            logger.error(f"Error in CNN image processing: {e}")
        
        return results
    
    def _tag_results(self, results: List[Dict[str, Any]], method: str) -> List[Dict[str, Any]]:
        """Tag results with extraction method"""
        for result in results:
            result['extraction_method'] = method
        return results
    
    def _combine_and_validate_results(self, all_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Combine results from different methods and validate
        """
        if not all_results:
            return []
        
        # Group results by roll number
        roll_number_groups = {}
        
        for result in all_results:
            roll_number = result.get('roll_number', '')
            if roll_number and self._is_valid_roll_number(roll_number):
                if roll_number not in roll_number_groups:
                    roll_number_groups[roll_number] = []
                roll_number_groups[roll_number].append(result)
        
        # For each roll number, select the best result
        final_results = []
        
        for roll_number, candidates in roll_number_groups.items():
            best_result = self._select_best_result(candidates)
            if best_result:
                final_results.append(best_result)
        
        # Sort by roll number
        final_results.sort(key=lambda x: x.get('roll_number', ''))
        
        return final_results
    
    def _is_valid_roll_number(self, roll_number: str) -> bool:
        """Validate roll number format"""
        return bool(re.match(r'^23\d{6}$', roll_number))
    
    def _select_best_result(self, candidates: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Select the best result from multiple candidates for the same roll number
        """
        if not candidates:
            return None
        
        if len(candidates) == 1:
            return candidates[0]
        
        # Scoring criteria
        def score_result(result):
            score = 0
            
            # Name quality (longer, more alphabetic characters)
            name = result.get('name', '')
            if name:
                score += len(name) * 0.1
                score += sum(1 for c in name if c.isalpha()) * 0.2
            
            # Confidence score if available
            confidence = result.get('confidence', 0)
            score += confidence * 10
            
            # Total classes (more data is better)
            total_classes = result.get('total_classes', 0)
            score += total_classes * 0.5
            
            # Method preference (some methods might be more reliable)
            method = result.get('extraction_method', '')
            if method == 'enhanced_ocr':
                score += 2
            elif method == 'tabular_ocr':
                score += 1.5
            elif method == 'custom_cnn':
                score += 1
            
            return score
        
        # Select candidate with highest score
        best_candidate = max(candidates, key=score_result)
        
        # Merge information from other candidates if beneficial
        merged_result = best_candidate.copy()
        
        # If best candidate has empty name, try to get name from others
        if not merged_result.get('name', '').strip():
            for candidate in candidates:
                name = candidate.get('name', '').strip()
                if name and len(name) > 2:
                    merged_result['name'] = name
                    break
        
        # Use the highest attendance count if available
        max_total_classes = max(c.get('total_classes', 0) for c in candidates)
        if max_total_classes > merged_result.get('total_classes', 0):
            for candidate in candidates:
                if candidate.get('total_classes', 0) == max_total_classes:
                    merged_result.update({
                        'present_count': candidate.get('present_count', 0),
                        'absent_count': candidate.get('absent_count', 0),
                        'total_classes': candidate.get('total_classes', 0),
                        'attendance_percentage': candidate.get('attendance_percentage', 0),
                        'attendance_marks': candidate.get('attendance_marks', [])
                    })
                    break
        
        # Add information about multiple extractions
        merged_result['extraction_methods'] = list(set(c.get('extraction_method', '') for c in candidates))
        merged_result['candidate_count'] = len(candidates)
        
        return merged_result
    
    def export_results_to_excel(self, results: List[Dict[str, Any]], output_path: str):
        """
        Export results to Excel with enhanced formatting
        """
        if not results:
            logger.warning("No results to export")
            return
        
        # Create DataFrame
        df = pd.DataFrame(results)
        
        # Reorder columns for better readability
        column_order = [
            'roll_number', 'name', 'present_count', 'absent_count', 
            'total_classes', 'attendance_percentage', 'extraction_method',
            'page_number', 'line_number', 'confidence', 'candidate_count'
        ]
        
        # Only include columns that exist
        available_columns = [col for col in column_order if col in df.columns]
        df = df[available_columns]
        
        # Add summary statistics
        summary_data = {
            'Total Students': len(df),
            'Average Attendance': df['attendance_percentage'].mean() if 'attendance_percentage' in df.columns else 0,
            'Students Below 75%': len(df[df['attendance_percentage'] < 75]) if 'attendance_percentage' in df.columns else 0,
            'Extraction Methods Used': ', '.join(df['extraction_method'].unique()) if 'extraction_method' in df.columns else 'Unknown'
        }
        
        # Write to Excel with multiple sheets
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            # Main data sheet
            df.to_excel(writer, sheet_name='Attendance Data', index=False)
            
            # Summary sheet
            summary_df = pd.DataFrame(list(summary_data.items()), columns=['Metric', 'Value'])
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Defaulters sheet (if applicable)
            if 'attendance_percentage' in df.columns:
                defaulters = df[df['attendance_percentage'] < 75]
                if not defaulters.empty:
                    defaulters.to_excel(writer, sheet_name='Defaulters', index=False)
        
        logger.info(f"Results exported to {output_path}")
    
    def get_processing_statistics(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Get statistics about the processing results
        """
        if not results:
            return {}
        
        df = pd.DataFrame(results)
        
        stats = {
            'total_records': len(df),
            'unique_roll_numbers': df['roll_number'].nunique() if 'roll_number' in df.columns else 0,
            'records_with_names': len(df[df['name'].str.len() > 0]) if 'name' in df.columns else 0,
            'average_confidence': df['confidence'].mean() if 'confidence' in df.columns else 0,
            'extraction_methods': df['extraction_method'].value_counts().to_dict() if 'extraction_method' in df.columns else {},
            'average_attendance': df['attendance_percentage'].mean() if 'attendance_percentage' in df.columns else 0,
            'students_below_75': len(df[df['attendance_percentage'] < 75]) if 'attendance_percentage' in df.columns else 0
        }
        
        return stats