# Configuration for Attendance Digitization System

import os

class Config:
    # File paths
    UPLOAD_FOLDER = 'data/uploads'
    OUTPUT_FOLDER = 'data/outputs'
    TEMP_FOLDER = 'data/temp'
    
    # OCR Settings
    TESSERACT_CONFIG = '--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz '
    CONFIDENCE_THRESHOLD = 0.6
    
    # Enhanced OCR Settings
    OCR_ENGINES = ['tesseract', 'easyocr']  # Available OCR engines
    PSM_MODES = [6, 7, 8, 11, 12]  # Tesseract PSM modes to try
    PREPROCESSING_METHODS = ['adaptive', 'otsu', 'morphological']
    
    # Image preprocessing
    GAUSSIAN_BLUR_KERNEL = (5, 5)
    ADAPTIVE_THRESHOLD_BLOCK_SIZE = 11
    ADAPTIVE_THRESHOLD_C = 12
    
    # Attendance rules
    DEFAULTER_THRESHOLD = 75.0  # Attendance percentage below this is defaulter
    
    # Supported file formats
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'tiff', 'bmp'}
    
    # Attendance notations mapping
    ATTENDANCE_MAPPING = {
        'P': 'Present',
        'PRESENT': 'Present', 
        '✓': 'Present',
        '✔': 'Present',
        'YES': 'Present',
        'Y': 'Present',
        '1': 'Present',
        
        'A': 'Absent',
        'ABSENT': 'Absent',
        '✗': 'Absent',
        'X': 'Absent',
        'NO': 'Absent',
        'N': 'Absent',
        '-': 'Absent',
        '0': 'Absent',
    }
    
    # Create directories if they don't exist
    @staticmethod
    def create_directories():
        for folder in [Config.UPLOAD_FOLDER, Config.OUTPUT_FOLDER, Config.TEMP_FOLDER]:
            os.makedirs(folder, exist_ok=True)