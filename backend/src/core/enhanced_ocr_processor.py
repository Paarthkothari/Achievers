import cv2
import numpy as np
import pytesseract
import pandas as pd
import re
import os
import easyocr
from PIL import Image
from io import BytesIO
from typing import List, Tuple, Dict, Any, Optional
import imutils
from imutils.contours import sort_contours
import tensorflow as tf
from sklearn.preprocessing import LabelBinarizer
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedOCRProcessor:
    def __init__(self):
        # Initialize multiple OCR engines
        self.tesseract_available = True
        self.easyocr_reader = None
        self.custom_model = None
        
        # Set Tesseract path for Windows
        if os.name == 'nt':  # Windows
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        
        # Initialize EasyOCR
        try:
            self.easyocr_reader = easyocr.Reader(['en'])
            logger.info("EasyOCR initialized successfully")
        except Exception as e:
            logger.warning(f"EasyOCR initialization failed: {e}")
        
        # Character mapping for custom model
        self.characters_list = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        
    def advanced_preprocess_image(self, image: np.ndarray, method: str = "adaptive") -> np.ndarray:
        """
        Advanced image preprocessing with multiple methods
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
        
        return gray
    
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
    
    def detect_characters_in_line(self, image: np.ndarray, line_box: Tuple[int, int, int, int]) -> List[Tuple[np.ndarray, Tuple[int, int, int, int]]]:
        """
        Detect individual characters within a table line
        """
        x1, y1, x2, y2 = line_box
        
        # Extract line ROI
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        roi = gray[y1:y2, x1:x2]
        
        # Preprocess ROI
        adaptive = cv2.adaptiveThreshold(roi, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 9)
        inverted = 255 - adaptive
        dilated = cv2.dilate(inverted, np.ones((3, 3), np.uint8))
        
        # Find character contours
        contours = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours = imutils.grab_contours(contours)
        contours = sort_contours(contours, method='left-to-right')[0]
        
        characters = []
        min_w, max_w = 10, 160
        min_h, max_h = 20, 140
        
        for contour in contours:
            (x, y, w, h) = cv2.boundingRect(contour)
            if (w >= min_w and w <= max_w) and (h >= min_h and h <= max_h):
                # Extract character ROI
                char_roi = gray[y1 + y:y1 + y + h, x1 + x:x1 + x + w]
                
                # Preprocess character
                char_thresh = cv2.threshold(char_roi, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
                char_resized = cv2.resize(char_thresh, (28, 28))
                char_normalized = char_resized.astype('float32') / 255.0
                char_normalized = np.expand_dims(char_normalized, axis=-1)
                
                characters.append((char_normalized, (x1 + x, y1 + y, w, h)))
        
        return characters
    
    def extract_text_tesseract(self, image: np.ndarray, config: str = None) -> str:
        """
        Extract text using Tesseract with custom config
        """
        if config is None:
            config = '--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz '
        
        try:
            processed = self.advanced_preprocess_image(image, "adaptive")
            text = pytesseract.image_to_string(processed, config=config)
            return text.strip()
        except Exception as e:
            logger.error(f"Tesseract OCR failed: {e}")
            return ""
    
    def extract_text_easyocr(self, image: np.ndarray) -> str:
        """
        Extract text using EasyOCR
        """
        if self.easyocr_reader is None:
            return ""
        
        try:
            processed = self.advanced_preprocess_image(image, "otsu")
            results = self.easyocr_reader.readtext(processed)
            
            # Combine all detected text
            text_parts = []
            for (bbox, text, confidence) in results:
                if confidence > 0.5:  # Filter by confidence
                    text_parts.append(text)
            
            return ' '.join(text_parts)
        except Exception as e:
            logger.error(f"EasyOCR failed: {e}")
            return ""
    
    def extract_text_multi_engine(self, image: np.ndarray) -> Dict[str, str]:
        """
        Extract text using multiple OCR engines and return best result
        """
        results = {}
        
        # Try different preprocessing methods with Tesseract
        for method in ["adaptive", "otsu", "morphological"]:
            try:
                processed = self.advanced_preprocess_image(image, method)
                text = pytesseract.image_to_string(processed, config='--oem 3 --psm 6')
                results[f"tesseract_{method}"] = text.strip()
            except:
                results[f"tesseract_{method}"] = ""
        
        # Try EasyOCR
        results["easyocr"] = self.extract_text_easyocr(image)
        
        # Try different PSM modes
        for psm in [6, 7, 8, 11, 12]:
            try:
                processed = self.advanced_preprocess_image(image, "adaptive")
                text = pytesseract.image_to_string(processed, config=f'--oem 3 --psm {psm}')
                results[f"tesseract_psm_{psm}"] = text.strip()
            except:
                results[f"tesseract_psm_{psm}"] = ""
        
        return results
    
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
            
            # Get text from multiple OCR engines
            ocr_results = self.extract_text_multi_engine(line_roi)
            
            # Find the best result (most complete)
            best_text = ""
            max_length = 0
            
            for method, text in ocr_results.items():
                if len(text) > max_length and self._contains_roll_number(text):
                    max_length = len(text)
                    best_text = text
            
            # If no roll number found, try the longest text
            if not best_text:
                for method, text in ocr_results.items():
                    if len(text) > max_length:
                        max_length = len(text)
                        best_text = text
            
            # Parse the line
            if best_text:
                parsed_data = self.parse_attendance_line(best_text)
                if parsed_data:
                    parsed_data['line_number'] = i + 1
                    parsed_data['confidence'] = self._calculate_confidence(best_text)
                    extracted_data.append(parsed_data)
        
        logger.info(f"Extracted {len(extracted_data)} valid records")
        return extracted_data
    
    def _contains_roll_number(self, text: str) -> bool:
        """Check if text contains a valid roll number pattern"""
        return bool(re.search(r'\b23\d{6}\b', text))
    
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
    
    def parse_attendance_line(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Parse a single attendance line into structured data
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
    
    def process_pdf_enhanced(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Process PDF with enhanced OCR techniques
        """
        all_data = []
        
        try:
            import fitz
            doc = fitz.open(pdf_path)
            logger.info(f"Processing PDF with {len(doc)} pages...")
            
            for page_num in range(len(doc)):
                logger.info(f"Processing page {page_num + 1}...")
                page = doc[page_num]
                
                # Convert page to high-resolution image
                mat = fitz.Matrix(3.0, 3.0)  # 3x zoom for better quality
                pix = page.get_pixmap(matrix=mat)
                img_data = pix.tobytes("ppm")
                
                # Convert to numpy array
                from PIL import Image
                import io
                image = Image.open(io.BytesIO(img_data))
                image_array = np.array(image)
                
                # Extract structured data
                page_data = self.extract_structured_table_data(image_array)
                
                # Add page information
                for record in page_data:
                    record['page_number'] = page_num + 1
                
                all_data.extend(page_data)
            
            doc.close()
            
        except Exception as e:
            logger.error(f"Error processing PDF: {e}")
        
        return all_data
    
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