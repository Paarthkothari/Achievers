#!/usr/bin/env python3
"""
Show Extracted Data from Current OCR System
"""

import sys
import os
import re
sys.path.append('src')

def clean_and_analyze_text(text):
    """Clean and analyze extracted text"""
    
    print("🔍 ANALYZING EXTRACTED TEXT:")
    print("-" * 60)
    
    # Look for potential roll numbers
    roll_numbers = re.findall(r'\b23\d{6}\b', text)
    print(f"📋 Potential Roll Numbers Found: {len(roll_numbers)}")
    for roll in roll_numbers:
        print(f"  - {roll}")
    
    # Look for potential names (sequences of capital letters)
    names = re.findall(r'\b[A-Z]{3,}(?:\s+[A-Z]{3,})*\b', text)
    print(f"\n👤 Potential Names Found: {len(names)}")
    for name in names[:10]:  # Show first 10
        print(f"  - {name}")
    if len(names) > 10:
        print(f"  ... and {len(names) - 10} more")
    
    # Look for attendance markers
    attendance_markers = re.findall(r'[PA✓✗XY01-]', text)
    print(f"\n✅ Potential Attendance Markers: {len(attendance_markers)}")
    marker_counts = {}
    for marker in attendance_markers:
        marker_counts[marker] = marker_counts.get(marker, 0) + 1
    for marker, count in sorted(marker_counts.items()):
        print(f"  '{marker}': {count} times")
    
    # Look for numbers that could be attendance counts
    numbers = re.findall(r'\b\d{1,2}\b', text)
    print(f"\n🔢 Numbers Found (potential attendance): {len(numbers)}")
    number_counts = {}
    for num in numbers:
        number_counts[num] = number_counts.get(num, 0) + 1
    for num, count in sorted(number_counts.items(), key=lambda x: int(x[0])):
        print(f"  {num}: {count} times")

def show_extracted_data():
    """Show what data is actually being extracted"""
    
    print("=== EXTRACTED DATA ANALYSIS ===")
    print("Analyzing what the current OCR system extracts...")
    
    try:
        from src.core.ocr_processor import OCRProcessor
        from src.config import Config
        import numpy as np
        
        # Create directories
        Config.create_directories()
        
        # Initialize OCR processor
        ocr_processor = OCRProcessor()
        print("✅ OCR processor initialized")
        
        # Test files
        test_files = [
            "data/sample/ASK_TCS_Attendance Sheet.pdf",
            "data/sample/AOA VKC.pdf"
        ]
        
        for file_path in test_files:
            if not os.path.exists(file_path):
                print(f"❌ File not found: {file_path}")
                continue
                
            print(f"\n{'='*80}")
            print(f"📄 ANALYZING: {os.path.basename(file_path)}")
            print(f"{'='*80}")
            
            try:
                import fitz
                doc = fitz.open(file_path)
                
                for page_num in range(min(2, len(doc))):  # Analyze first 2 pages
                    print(f"\n📄 PAGE {page_num + 1}:")
                    print("-" * 40)
                    
                    page = doc[page_num]
                    
                    # Convert page to image
                    mat = fitz.Matrix(2.0, 2.0)
                    pix = page.get_pixmap(matrix=mat)
                    img_data = pix.tobytes("ppm")
                    
                    # Convert to PIL Image then numpy array
                    from PIL import Image
                    import io
                    image = Image.open(io.BytesIO(img_data))
                    image_array = np.array(image)
                    
                    # Extract raw text
                    raw_text = ocr_processor.extract_text_from_image(image_array)
                    
                    print(f"📝 Raw text length: {len(raw_text)} characters")
                    
                    if raw_text:
                        # Clean and analyze the text
                        clean_and_analyze_text(raw_text)
                        
                        # Try to parse as table
                        parsed_table = ocr_processor.parse_text_to_table(raw_text)
                        
                        print(f"\n📊 PARSED TABLE RESULTS:")
                        print(f"   Rows extracted: {len(parsed_table)}")
                        
                        if parsed_table:
                            print("\n📋 PARSED ROWS:")
                            for i, row in enumerate(parsed_table):
                                print(f"  Row {i+1}: {row}")
                                
                                # Try to identify what each row might contain
                                row_text = ' '.join(row)
                                has_roll = bool(re.search(r'\b23\d{6}\b', row_text))
                                has_name = bool(re.search(r'\b[A-Z]{3,}\b', row_text))
                                has_numbers = bool(re.search(r'\b\d{1,2}\b', row_text))
                                
                                indicators = []
                                if has_roll:
                                    indicators.append("ROLL")
                                if has_name:
                                    indicators.append("NAME")
                                if has_numbers:
                                    indicators.append("NUMS")
                                
                                if indicators:
                                    print(f"       ^ Contains: {', '.join(indicators)}")
                        else:
                            print("   No valid table rows parsed")
                    else:
                        print("❌ No text extracted from this page")
                
                doc.close()
                
            except Exception as e:
                print(f"❌ Error processing {file_path}: {e}")
                import traceback
                traceback.print_exc()
        
        print(f"\n{'='*80}")
        print("📊 SUMMARY:")
        print("The current OCR system is extracting text but with poor quality.")
        print("Text is heavily garbled and not recognizing proper table structure.")
        print("This explains why no correct roll numbers, names, or attendance")
        print("calculations are being produced.")
        print("✅ Analysis completed")
        
    except Exception as e:
        print(f"❌ System initialization failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    show_extracted_data()