import cv2
import numpy as np
import pytesseract
import pandas as pd
import re
import os
from typing import List, Tuple, Dict, Any, Optional
import logging
import fitz  # PyMuPDF
from concurrent.futures import ThreadPoolExecutor
import time

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UltraFastOCRProcessor:
    def __init__(self):
        # Set Tesseract path for Windows
        if os.name == 'nt':
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        
        # Optimized roll number patterns
        self.roll_patterns = [
            r'\b23\d{6}\b',  # Primary pattern: 23XXXXXX
            r'\b\d{8}\b',    # 8 digit numbers
            r'\b23\d{5}\b',  # 7 digit starting with 23
        ]
        
        # Best OCR configurations (pre-selected from testing)
        self.best_configs = [
            '--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz./ ',
            '--oem 3 --psm 12',  # Sparse text with OSD
            '--oem 3 --psm 11',  # Sparse text
        ]
        
    def extract_high_res_images(self, pdf_path: str) -> List[np.ndarray]:
        """Extract high-resolution images quickly"""
        images = []
        try:
            doc = fitz.open(pdf_path)
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # 3x zoom for good quality vs speed balance
                mat = fitz.Matrix(3.0, 3.0)
                pix = page.get_pixmap(matrix=mat)
                img_data = pix.tobytes("png")
                
                nparr = np.frombuffer(img_data, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                images.append(image)
                
            doc.close()
            return images
        except Exception as e:
            logger.error(f"Failed to extract images: {e}")
            return []
    
    def fast_preprocess(self, image: np.ndarray) -> List[Tuple[str, np.ndarray]]:
        """Ultra-fast preprocessing - only the best methods"""
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        preprocessed = []
        
        # Method 1: High contrast with denoising (best performer)
        denoised = cv2.fastNlMeansDenoising(gray)
        enhanced = cv2.convertScaleAbs(denoised, alpha=2.0, beta=50)
        _, thresh1 = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        preprocessed.append(("high_contrast", thresh1))
        
        # Method 2: Gaussian blur (second best)
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        _, thresh2 = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        preprocessed.append(("gaussian_blur", thresh2))
        
        return preprocessed
    
    def extract_text_parallel(self, image: np.ndarray) -> Dict[str, str]:
        """Extract text using parallel processing for speed"""
        results = {}
        preprocessed_images = self.fast_preprocess(image)
        
        # Use ThreadPoolExecutor for parallel OCR
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = []
            
            for prep_name, prep_image in preprocessed_images:
                for i, config in enumerate(self.best_configs):
                    future = executor.submit(self._ocr_worker, prep_image, config)
                    futures.append((f"{prep_name}_config_{i}", future))
            
            # Collect results
            for method_name, future in futures:
                try:
                    text = future.result(timeout=5)  # 5 second timeout
                    results[method_name] = text
                except:
                    results[method_name] = ""
        
        return results
    
    def _ocr_worker(self, image: np.ndarray, config: str) -> str:
        """Worker function for parallel OCR"""
        try:
            return pytesseract.image_to_string(image, config=config).strip()
        except:
            return ""
    
    def detect_handwritten_signatures(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """Detect handwritten signatures/marks in attendance columns"""
        signatures = []
        
        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Detect contours that might be signatures
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            area = cv2.contourArea(contour)
            
            # Filter by area (signatures are usually medium-sized)
            if 100 < area < 5000:
                x, y, w, h = cv2.boundingRect(contour)
                
                # Check aspect ratio (signatures are usually wider than tall)
                aspect_ratio = w / h if h > 0 else 0
                
                if 0.5 < aspect_ratio < 4.0:
                    # Extract the region
                    roi = gray[y:y+h, x:x+w]
                    
                    # Check if it looks like handwriting (has curves/complexity)
                    edges = cv2.Canny(roi, 50, 150)
                    edge_density = np.sum(edges > 0) / (w * h)
                    
                    if edge_density > 0.1:  # Has enough complexity
                        signatures.append({
                            'bbox': (x, y, w, h),
                            'area': area,
                            'aspect_ratio': aspect_ratio,
                            'edge_density': edge_density,
                            'type': 'signature' if aspect_ratio > 1.5 else 'mark'
                        })
        
        return signatures
    
    def fast_score_result(self, text: str) -> float:
        """Ultra-fast scoring"""
        if not text:
            return 0.0
        
        score = 0
        
        # Count roll numbers (highest priority)
        for pattern in self.roll_patterns:
            matches = len(re.findall(pattern, text))
            score += matches * 100
        
        # Text length bonus
        score += len(text) * 0.05
        
        # Alphanumeric ratio
        alphanumeric = len(re.findall(r'[a-zA-Z0-9]', text))
        if len(text) > 0:
            score += (alphanumeric / len(text)) * 20
        
        return score
    
    def extract_students_fast(self, text: str) -> List[Dict[str, Any]]:
        """Ultra-fast student extraction"""
        students = []
        lines = text.split('\n')
        
        for line_num, line in enumerate(lines):
            line = line.strip()
            if len(line) < 8:  # Skip very short lines
                continue
            
            # Find roll number
            roll_number = None
            for pattern in self.roll_patterns:
                match = re.search(pattern, line)
                if match:
                    roll_number = match.group()
                    break
            
            if roll_number:
                # Quick name extraction
                name_text = line.replace(roll_number, '').strip()
                
                # Remove common non-name patterns quickly
                name_text = re.sub(r'[|_\[\]{}()<>]', ' ', name_text)
                name_text = re.sub(r'\b[PA]\b', '', name_text)
                name_text = re.sub(r'\d+', '', name_text)
                name_text = ' '.join(name_text.split())
                
                # Quick attendance detection
                attendance = "Unknown"
                if re.search(r'\bP\b|\bpresent\b', line, re.IGNORECASE):
                    attendance = "Present"
                elif re.search(r'\bA\b|\babsent\b', line, re.IGNORECASE):
                    attendance = "Absent"
                
                if name_text and len(name_text) > 1:
                    students.append({
                        'roll_number': roll_number,
                        'name': name_text.title(),
                        'attendance': attendance,
                        'line_number': line_num + 1,
                        'raw_line': line,
                        'confidence': self.fast_score_result(line)
                    })
        
        return students
    
    def process_pdf_ultra_fast(self, pdf_path: str) -> List[Dict[str, Any]]:
        """Ultra-fast PDF processing with signature detection"""
        start_time = time.time()
        logger.info(f"🚀 Ultra-fast processing: {pdf_path}")
        
        # Extract images
        images = self.extract_high_res_images(pdf_path)
        if not images:
            return []
        
        all_students = []
        
        for page_num, image in enumerate(images):
            page_start = time.time()
            
            # Parallel OCR extraction
            all_results = self.extract_text_parallel(image)
            
            # Find best result quickly
            best_score = 0
            best_text = ""
            best_method = ""
            
            for method, text in all_results.items():
                if text:
                    score = self.fast_score_result(text)
                    if score > best_score:
                        best_score = score
                        best_text = text
                        best_method = method
            
            if best_text:
                # Extract students
                page_students = self.extract_students_fast(best_text)
                
                # Detect signatures for attendance verification
                signatures = self.detect_handwritten_signatures(image)
                
                # Add metadata
                for student in page_students:
                    student['page'] = page_num + 1
                    student['extraction_method'] = best_method
                    student['signatures_detected'] = len(signatures)
                
                all_students.extend(page_students)
                
                page_time = time.time() - page_start
                logger.info(f"📄 Page {page_num + 1}: {len(page_students)} students, "
                          f"{len(signatures)} signatures, {page_time:.2f}s")
        
        total_time = time.time() - start_time
        logger.info(f"⚡ Total processing time: {total_time:.2f}s")
        logger.info(f"🎓 Total students found: {len(all_students)}")
        
        return all_students
    
    def validate_and_clean_results(self, students: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate and clean results to ensure no duplicates"""
        # Remove duplicates based on roll number
        seen_rolls = set()
        cleaned_students = []
        
        # Sort by confidence (highest first)
        students.sort(key=lambda x: x.get('confidence', 0), reverse=True)
        
        for student in students:
            roll = student['roll_number']
            if roll not in seen_rolls:
                seen_rolls.add(roll)
                
                # Clean name further
                name = student['name']
                name = re.sub(r'\b[A-Z]\b', '', name)  # Remove single letters
                name = ' '.join(name.split())  # Clean whitespace
                student['name'] = name.title()
                
                cleaned_students.append(student)
        
        logger.info(f"🧹 Cleaned results: {len(cleaned_students)} unique students")
        return cleaned_students