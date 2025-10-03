import cv2
import numpy as np
import pytesseract
import pandas as pd
import re
import os
import logging
from PIL import Image
from io import BytesIO
from typing import List, Tuple, Dict, Any, Optional
from ..config import Config

# Try to import additional OCR engines
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False

try:
    import imutils
    from imutils.contours import sort_contours
    IMUTILS_AVAILABLE = True
except ImportError:
    IMUTILS_AVAILABLE = False

logger = logging.getLogger(__name__)

class OCRProcessor:
    def __init__(self):
        self.config = Config()
        # Set Tesseract path for Windows
        if os.name == 'nt':  # Windows
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        
        # Initialize EasyOCR if available
        self.easyocr_reader = None
        if EASYOCR_AVAILABLE:
            try:
                self.easyocr_reader = easyocr.Reader(['en'])
                logger.info("EasyOCR initialized successfully")
            except Exception as e:
                logger.warning(f"EasyOCR initialization failed: {e}")
        
        # OCR engine preferences
        self.ocr_engines = ['tesseract', 'easyocr'] if EASYOCR_AVAILABLE else ['tesseract']
        
    def preprocess_image(self, image: np.ndarray, method: str = "adaptive") -> np.ndarray:
        """
        Enhanced image preprocessing with multiple methods
        """
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        if method == "adaptive":
            # Gaussian blur to reduce noise
            blur = cv2.GaussianBlur(gray, (3, 3), 0)
            
            # Adaptive thresholding
            adaptive = cv2.adaptiveThreshold(
                blur, 255, 
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 9
            )
            
            # Invert for better OCR
            inverted = 255 - adaptive
            
            # Morphological operations to clean up
            kernel = np.ones((2, 2), np.uint8)
            cleaned = cv2.morphologyEx(inverted, cv2.MORPH_CLOSE, kernel)
            
            return cleaned
            
        elif method == "otsu":
            # Gaussian blur
            blur = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Otsu's thresholding
            _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            return thresh
            
        elif method == "morphological":
            # Advanced morphological preprocessing
            blur = cv2.GaussianBlur(gray, (3, 3), 0)
            
            # Adaptive threshold
            adaptive = cv2.adaptiveThreshold(
                blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 9
            )
            
            # Inversion
            inverted = 255 - adaptive
            
            # Dilation to connect broken characters
            kernel = np.ones((3, 3), np.uint8)
            dilated = cv2.dilate(inverted, kernel, iterations=1)
            
            # Edge detection for better character separation
            edges = cv2.Canny(dilated, 40, 150)
            
            # Final dilation
            final = cv2.dilate(edges, kernel, iterations=1)
            
            return final
        
        # Default fallback
        blurred = cv2.GaussianBlur(gray, self.config.GAUSSIAN_BLUR_KERNEL, 0)
        thresh = cv2.adaptiveThreshold(
            blurred, 255, 
            cv2.ADAPTIVE_THRESH_MEAN_C, 
            cv2.THRESH_BINARY,
            self.config.ADAPTIVE_THRESHOLD_BLOCK_SIZE,
            self.config.ADAPTIVE_THRESHOLD_C
        )
        return thresh
    
    def extract_text_from_image(self, image: np.ndarray, engine: str = "auto") -> str:
        """
        Extract text using multiple OCR engines for better accuracy
        """
        if engine == "auto":
            # Try multiple engines and return the best result
            results = {}
            
            # Try Tesseract with different preprocessing methods
            for method in ["adaptive", "otsu", "morphological"]:
                try:
                    processed = self.preprocess_image(image, method)
                    text = pytesseract.image_to_string(processed, config=self.config.TESSERACT_CONFIG)
                    results[f"tesseract_{method}"] = text.strip()
                except:
                    results[f"tesseract_{method}"] = ""
            
            # Try EasyOCR if available
            if self.easyocr_reader:
                try:
                    processed = self.preprocess_image(image, "otsu")
                    easyocr_results = self.easyocr_reader.readtext(processed)
                    text_parts = []
                    for (bbox, text, confidence) in easyocr_results:
                        if confidence > 0.5:
                            text_parts.append(text)
                    results["easyocr"] = ' '.join(text_parts)
                except:
                    results["easyocr"] = ""
            
            # Try different PSM modes with Tesseract
            for psm in [6, 7, 8, 11, 12]:
                try:
                    processed = self.preprocess_image(image, "adaptive")
                    text = pytesseract.image_to_string(processed, config=f'--oem 3 --psm {psm}')
                    results[f"tesseract_psm_{psm}"] = text.strip()
                except:
                    results[f"tesseract_psm_{psm}"] = ""
            
            # Return the longest result that contains a roll number, or the longest overall
            best_text = ""
            max_length = 0
            
            for method, text in results.items():
                if text and self._contains_roll_number(text):
                    if len(text) > max_length:
                        max_length = len(text)
                        best_text = text
            
            # If no roll number found, return the longest text
            if not best_text:
                for method, text in results.items():
                    if len(text) > max_length:
                        max_length = len(text)
                        best_text = text
            
            return best_text
            
        elif engine == "tesseract":
            processed_image = self.preprocess_image(image)
            text = pytesseract.image_to_string(processed_image, config=self.config.TESSERACT_CONFIG)
            return text.strip()
            
        elif engine == "easyocr" and self.easyocr_reader:
            processed = self.preprocess_image(image, "otsu")
            results = self.easyocr_reader.readtext(processed)
            text_parts = []
            for (bbox, text, confidence) in results:
                if confidence > 0.5:
                    text_parts.append(text)
            return ' '.join(text_parts)
        
        # Fallback to tesseract
        processed_image = self.preprocess_image(image)
        text = pytesseract.image_to_string(processed_image, config=self.config.TESSERACT_CONFIG)
        return text.strip()
    
    def _contains_roll_number(self, text: str) -> bool:
        """Check if text contains a valid roll number pattern"""
        return bool(re.search(r'\b23\d{6}\b', text))
    
    def detect_table_structure(self, image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detect table structure and return line bounding boxes
        """
        # Preprocess for line detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        blur = cv2.GaussianBlur(gray, (3, 3), 0)
        
        # Threshold
        _, thresh = cv2.threshold(blur, 127, 255, cv2.THRESH_BINARY_INV)
        
        # Create kernel for horizontal line detection
        kernel_height = 200  # Adjust based on your table row height
        kernel = np.ones((5, kernel_height), np.uint8)
        dilated = cv2.dilate(thresh, kernel, iterations=1)
        
        # Find contours for lines
        contours, _ = cv2.findContours(dilated.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        sorted_contours = sorted(contours, key=lambda ctr: cv2.boundingRect(ctr)[1])
        
        line_boxes = []
        min_h, max_h = 60, 200  # Minimum and maximum line height
        
        for contour in sorted_contours:
            x, y, w, h = cv2.boundingRect(contour)
            if min_h <= h <= max_h and w > 100:  # Filter by size
                line_boxes.append((x, y, x + w, y + h))
        
        logger.info(f"Detected {len(line_boxes)} table lines")
        return line_boxes

    def extract_structured_table_data(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Extract structured table data using advanced OCR techniques
        """
        logger.info("Starting structured table extraction...")
        
        # Detect table structure
        line_boxes = self.detect_table_structure(image)
        
        extracted_data = []
        
        for i, line_box in enumerate(line_boxes):
            logger.info(f"Processing line {i+1}/{len(line_boxes)}")
            
            # Extract text from entire line using multiple methods
            x1, y1, x2, y2 = line_box
            line_roi = image[y1:y2, x1:x2]
            
            # Get text using enhanced OCR
            text = self.extract_text_from_image(line_roi, engine="auto")
            
            # Parse the line
            if text:
                parsed_data = self.parse_attendance_line_enhanced(text)
                if parsed_data:
                    parsed_data['line_number'] = i + 1
                    parsed_data['confidence'] = self._calculate_confidence(text)
                    extracted_data.append(parsed_data)
        
        logger.info(f"Extracted {len(extracted_data)} valid records")
        return extracted_data

    def extract_tables_from_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Enhanced PDF processing with structured table extraction
        """
        all_data = []
        try:
            import fitz
            import io
            
            doc = fitz.open(pdf_path)
            logger.info(f"Processing PDF with {len(doc)} pages using enhanced OCR...")
            
            for page_num in range(len(doc)):
                logger.info(f"Processing page {page_num + 1}...")
                page = doc[page_num]
                
                # Convert page to high-resolution image
                mat = fitz.Matrix(3.0, 3.0)  # 3x zoom for better quality
                pix = page.get_pixmap(matrix=mat)
                img_data = pix.tobytes("ppm")
                
                # Convert to PIL Image then numpy array
                from PIL import Image
                image = Image.open(io.BytesIO(img_data))
                image_array = np.array(image)
                
                # Extract structured data
                page_data = self.extract_structured_table_data(image_array)
                
                # Add page information
                for record in page_data:
                    record['page_number'] = page_num + 1
                
                all_data.extend(page_data)
                logger.info(f"Page {page_num + 1}: Found {len(page_data)} records")
            
            doc.close()
            
        except Exception as e:
            logger.error(f"Error processing PDF: {e}")
            
        return all_data
    
    def parse_attendance_line_enhanced(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Enhanced parsing of a single attendance line into structured data
        """
        # Clean the text
        text = re.sub(r'[|_\[\]()]+', ' ', text)
        text = ' '.join(text.split())
        
        # Extract roll number
        roll_match = re.search(r'\b(23\d{6})\b', text)
        if not roll_match:
            return None
        
        roll_number = roll_match.group(1)
        
        # Extract name (words after roll number, before attendance markers)
        name_pattern = r'23\d{6}\s+([A-Za-z\s]+?)(?:\s+[PA✓✗XY01-]|$)'
        name_match = re.search(name_pattern, text)
        name = name_match.group(1).strip() if name_match else ""
        
        # Clean name
        name = re.sub(r'\s+', ' ', name)
        name = ' '.join([word.capitalize() for word in name.split() if len(word) > 1])
        
        # Extract attendance data
        attendance_pattern = r'[PA✓✗XY01-]'
        attendance_marks = re.findall(attendance_pattern, text)
        
        # Count attendance
        present_count = 0
        absent_count = 0
        total_classes = len(attendance_marks)
        
        for mark in attendance_marks:
            if mark.upper() in ['P', '✓', 'Y', '1']:
                present_count += 1
            elif mark.upper() in ['A', '✗', 'X', '0', '-']:
                absent_count += 1
        
        # Calculate percentage
        attendance_percentage = (present_count / total_classes * 100) if total_classes > 0 else 0
        
        return {
            'roll_number': roll_number,
            'name': name,
            'present_count': present_count,
            'absent_count': absent_count,
            'total_classes': total_classes,
            'attendance_percentage': round(attendance_percentage, 2),
            'attendance_marks': attendance_marks,
            'raw_text': text
        }

    def _calculate_confidence(self, text: str) -> float:
        """Calculate confidence score based on text quality"""
        if not text:
            return 0.0
        
        score = 0.0
        
        # Check for roll number
        if re.search(r'\b23\d{6}\b', text):
            score += 0.4
        
        # Check for name pattern
        if re.search(r'\b[A-Z][a-z]+\s+[A-Z][a-z]+', text):
            score += 0.3
        
        # Check for attendance markers
        if re.search(r'[PA✓✗XY01-]', text):
            score += 0.3
        
        return min(score, 1.0)

    def parse_text_to_table(self, text: str) -> List[List[str]]:
        """
        Parse OCR text into table format - improved for attendance sheets
        """
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        table = []
        
        for line in lines:
            # Skip lines that are mostly noise (repeated characters)
            if len(re.sub(r'[^A-Za-z0-9]', '', line)) < 3:
                continue
                
            # Look for lines with roll numbers (8-digit numbers starting with 23)
            if re.search(r'\b23\d{6}\b', line):
                # Split by multiple spaces, tabs, or special characters
                columns = re.split(r'\s{2,}|\t|[|_\[\]]+', line)
                # Clean up columns
                clean_columns = []
                for col in columns:
                    col = col.strip('|_[]() ').strip()
                    if col and len(col) > 0:
                        clean_columns.append(col)
                
                if len(clean_columns) >= 2:  # At least roll number and name
                    table.append(clean_columns)
            
            # Also look for lines with just roll numbers (for cases where they're on separate lines)
            elif re.search(r'^\s*23\d{6}\s*$', line):
                roll_num = re.search(r'23\d{6}', line).group()
                table.append([roll_num, ""])  # Empty name, might be filled later
            
            # Also look for lines with names (capitalized words)
            elif re.search(r'\b[A-Z]{2,}[A-Z\s]*\b', line) and not re.search(r'^[E\s]+$', line):
                columns = re.split(r'\s{2,}|\t|[|_\[\]]+', line)
                clean_columns = []
                for col in columns:
                    col = col.strip('|_[]() ').strip()
                    if col and len(col) > 1 and not re.match(r'^[E\s]+$', col):
                        clean_columns.append(col)
                
                if len(clean_columns) >= 2:
                    table.append(clean_columns)
                
        logger.info(f"Parsed {len(table)} potential table rows from text")
        return table if len(table) > 0 else []
    
    def extract_from_image_file(self, image_path: str) -> str:
        """
        Extract text from image file
        """
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        return self.extract_text_from_image(image)
    
    def process_image_enhanced(self, image_path: str) -> List[Dict[str, Any]]:
        """
        Process image with enhanced OCR techniques
        """
        try:
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            return self.extract_structured_table_data(image)
            
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            return []
    
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
            'average_attendance': df['attendance_percentage'].mean() if 'attendance_percentage' in df.columns else 0,
            'students_below_75': len(df[df['attendance_percentage'] < 75]) if 'attendance_percentage' in df.columns else 0
        }
        
        return stats