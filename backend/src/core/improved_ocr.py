import cv2
import numpy as np
import pytesseract
import pandas as pd
import re
import os
from PIL import Image, ImageEnhance, ImageFilter
from typing import List, Tuple, Dict, Any, Optional
import logging
import fitz  # PyMuPDF

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImprovedOCRProcessor:
    def __init__(self):
        # Set Tesseract path for Windows
        if os.name == 'nt':  # Windows
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        
        # Student Id patterns 
        self.roll_patterns = [
            r'\b23\d{6}\b',  # 23XXXXXX format
            r'\b\d{2}[A-Z]{2}\d{4}\b',  # 23CS1234 format
            r'\b[A-Z]{2}\d{6}\b',  # CS234567 format
            r'\b\d{8}\b',  # 8 digit numbers
        ]
        
    def extract_high_quality_images_from_pdf(self, pdf_path: str) -> List[np.ndarray]:
        """Extract high-quality images from PDF using PyMuPDF"""
        images = []
        try:
            doc = fitz.open(pdf_path)
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Get page as high-resolution image (4x zoom for better quality)
                mat = fitz.Matrix(4.0, 4.0)  # 4x zoom for better quality
                pix = page.get_pixmap(matrix=mat)
                img_data = pix.tobytes("png")
                
                # Convert to OpenCV format
                nparr = np.frombuffer(img_data, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                images.append(image)
                
            doc.close()
            logger.info(f"Extracted {len(images)} high-quality images from PDF")
            return images
        except Exception as e:
            logger.error(f"Failed to extract images from PDF: {e}")
            return []
    
    def advanced_preprocess_image(self, image: np.ndarray) -> List[Tuple[str, np.ndarray]]:
        """
        Apply multiple advanced preprocessing techniques
        """
        preprocessed_images = []
        
        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Method 1: High contrast with denoising
        denoised = cv2.fastNlMeansDenoising(gray)
        enhanced = cv2.convertScaleAbs(denoised, alpha=2.0, beta=50)
        _, thresh1 = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        preprocessed_images.append(("high_contrast_denoised", thresh1))
        
        # Method 2: Adaptive threshold with larger block size
        adaptive = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 10
        )
        preprocessed_images.append(("adaptive_large", adaptive))
        
        # Method 3: Morphological operations to connect broken characters
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
        morph = cv2.morphologyEx(adaptive, cv2.MORPH_CLOSE, kernel)
        preprocessed_images.append(("morphological_close", morph))
        
        # Method 4: Bilateral filter for edge preservation
        bilateral = cv2.bilateralFilter(gray, 15, 80, 80)
        _, thresh_bilateral = cv2.threshold(bilateral, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        preprocessed_images.append(("bilateral_filtered", thresh_bilateral))
        
        # Method 5: Histogram equalization + contrast
        equalized = cv2.equalizeHist(gray)
        enhanced_eq = cv2.convertScaleAbs(equalized, alpha=1.8, beta=30)
        _, thresh_eq = cv2.threshold(enhanced_eq, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        preprocessed_images.append(("histogram_enhanced", thresh_eq))
        
        # Method 6: Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        _, thresh_blur = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        preprocessed_images.append(("gaussian_blur", thresh_blur))
        
        return preprocessed_images
    
    def extract_text_with_multiple_configs(self, image: np.ndarray) -> Dict[str, str]:
        """
        Extract text using multiple Tesseract configurations
        """
        results = {}
        
        # Different PSM modes optimized for table data
        psm_configs = {
            'single_block': '--oem 3 --psm 6',
            'single_line': '--oem 3 --psm 7',
            'single_word': '--oem 3 --psm 8',
            'sparse_text': '--oem 3 --psm 11',
            'sparse_text_osd': '--oem 3 --psm 12',
        }
        
        # Character whitelist configurations
        char_configs = {
            'alphanumeric_space': '--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ',
            'student_data': '--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz./ ',
        }
        
        # Try different preprocessing methods
        preprocessed_images = self.advanced_preprocess_image(image)
        
        for prep_name, prep_image in preprocessed_images:
            # Try different PSM modes
            for psm_name, config in psm_configs.items():
                try:
                    text = pytesseract.image_to_string(prep_image, config=config)
                    results[f"{prep_name}_{psm_name}"] = text.strip()
                except Exception as e:
                    results[f"{prep_name}_{psm_name}"] = ""
            
            # Try character whitelisting
            for char_name, config in char_configs.items():
                try:
                    text = pytesseract.image_to_string(prep_image, config=config)
                    results[f"{prep_name}_{char_name}"] = text.strip()
                except Exception as e:
                    results[f"{prep_name}_{char_name}"] = ""
        
        return results
    
    def score_ocr_result(self, text: str) -> float:
        """
        Score OCR result based on quality indicators
        """
        if not text:
            return 0.0
        
        score = 0
        
        # Score based on roll number detection
        roll_matches = 0
        for pattern in self.roll_patterns:
            matches = re.findall(pattern, text)
            roll_matches += len(matches)
        score += roll_matches * 100  # High weight for roll numbers
        
        # Score based on text length (longer usually better for tables)
        score += len(text) * 0.1
        
        # Score based on alphanumeric ratio
        alphanumeric_chars = len(re.findall(r'[a-zA-Z0-9]', text))
        if len(text) > 0:
            score += (alphanumeric_chars / len(text)) * 30
        
        # Score based on presence of common words
        common_words = ['name', 'roll', 'student', 'attendance', 'present', 'absent']
        for word in common_words:
            if word.lower() in text.lower():
                score += 15
        
        # Score based on line structure (tables have multiple lines)
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        score += len(lines) * 2
        
        # Penalize results with too many special characters
        special_chars = len(re.findall(r'[^\w\s]', text))
        score -= special_chars * 0.3
        
        # Penalize very short results
        if len(text) < 50:
            score *= 0.5
        
        return score
    
    def find_best_ocr_result(self, all_results: Dict[str, str]) -> Tuple[str, str]:
        """
        Find the best OCR result based on scoring
        """
        scored_results = []
        
        for method, text in all_results.items():
            if text:
                score = self.score_ocr_result(text)
                scored_results.append((score, method, text))
        
        # Sort by score (highest first)
        scored_results.sort(reverse=True)
        
        if scored_results:
            best_score, best_method, best_text = scored_results[0]
            logger.info(f"Best OCR result from {best_method} with score {best_score:.2f}")
            return best_method, best_text
        
        return "none", ""
    
    def extract_student_data_from_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract student data from OCR text using improved pattern matching
        """
        students = []
        lines = text.split('\n')
        
        for line_num, line in enumerate(lines):
            line = line.strip()
            if not line or len(line) < 5:  # Skip very short lines
                continue
            
            # Try to find roll number
            roll_number = None
            for pattern in self.roll_patterns:
                match = re.search(pattern, line)
                if match:
                    roll_number = match.group()
                    break
            
            if roll_number:
                # Extract name (clean up the line)
                name_text = line
                
                # Remove roll number
                name_text = re.sub(r'\b' + re.escape(roll_number) + r'\b', '', name_text)
                
                # Remove common non-name patterns
                name_text = re.sub(r'\b[PA]\b', '', name_text)  # Remove P/A markers
                name_text = re.sub(r'\d+', '', name_text)  # Remove other numbers
                name_text = re.sub(r'[^\w\s]', ' ', name_text)  # Remove special chars
                name_text = ' '.join(name_text.split())  # Clean whitespace
                
                # Extract attendance status
                attendance_status = "Unknown"
                if re.search(r'\bP\b|\bpresent\b', line, re.IGNORECASE):
                    attendance_status = "Present"
                elif re.search(r'\bA\b|\babsent\b', line, re.IGNORECASE):
                    attendance_status = "Absent"
                
                # Only add if we have a reasonable name
                if name_text and len(name_text) > 2:
                    students.append({
                        'roll_number': roll_number,
                        'name': name_text.title(),
                        'attendance': attendance_status,
                        'line_number': line_num + 1,
                        'raw_line': line,
                        'confidence': self.score_ocr_result(line)
                    })
        
        return students
    
    def process_attendance_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Main method to process attendance PDF with improved OCR
        """
        logger.info(f"Processing PDF: {pdf_path}")
        
        # Extract high-quality images
        images = self.extract_high_quality_images_from_pdf(pdf_path)
        
        if not images:
            logger.error("No images extracted from PDF")
            return []
        
        all_students = []
        
        for page_num, image in enumerate(images):
            logger.info(f"Processing page {page_num + 1}/{len(images)}")
            
            # Get all OCR results
            all_results = self.extract_text_with_multiple_configs(image)
            
            # Find best result
            best_method, best_text = self.find_best_ocr_result(all_results)
            
            if best_text:
                logger.info(f"Page {page_num + 1} - Best method: {best_method}")
                logger.info(f"Extracted text length: {len(best_text)} characters")
                
                # Show a sample of the best text
                sample_text = best_text[:200] + "..." if len(best_text) > 200 else best_text
                logger.info(f"Sample text: {sample_text}")
                
                # Extract student data
                page_students = self.extract_student_data_from_text(best_text)
                
                # Add page information
                for student in page_students:
                    student['page'] = page_num + 1
                    student['extraction_method'] = best_method
                
                all_students.extend(page_students)
                
                logger.info(f"Found {len(page_students)} students on page {page_num + 1}")
        
        logger.info(f"Total students found: {len(all_students)}")
        return all_students