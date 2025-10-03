#!/usr/bin/env python3
"""
Direct OCR Test - Extract raw text to see what's happening
"""

import sys
import os
sys.path.append('src')

def test_direct_ocr():
    """Test direct OCR extraction"""
    
    print("=== Direct OCR Test ===")
    print("Testing raw OCR extraction...")
    
    try:
        from src.core.ocr_processor import OCRProcessor
        from src.config import Config
        
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
            print(f"📄 Processing: {os.path.basename(file_path)}")
            print(f"{'='*80}")
            
            try:
                # Try direct PDF extraction
                print("🔍 Attempting PDF table extraction...")
                tables = ocr_processor.extract_tables_from_pdf(file_path)
                
                print(f"📊 Tables found: {len(tables)}")
                
                if tables:
                    for i, table in enumerate(tables):
                        print(f"\n📋 Table {i+1} (first 10 rows):")
                        print("-" * 60)
                        for j, row in enumerate(table[:10]):
                            print(f"  Row {j+1}: {row}")
                        if len(table) > 10:
                            print(f"  ... and {len(table) - 10} more rows")
                else:
                    print("❌ No tables extracted")
                    
                    # Try to get raw text from first page
                    print("\n🔍 Attempting raw text extraction from first page...")
                    try:
                        import fitz
                        doc = fitz.open(file_path)
                        if len(doc) > 0:
                            page = doc[0]
                            
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
                            
                            print(f"📝 Raw text extracted ({len(raw_text)} characters):")
                            print("-" * 60)
                            print(raw_text[:1000])  # First 1000 characters
                            if len(raw_text) > 1000:
                                print("... (truncated)")
                            
                            # Try to parse as table
                            parsed_table = ocr_processor.parse_text_to_table(raw_text)
                            print(f"\n📊 Parsed table rows: {len(parsed_table)}")
                            
                            if parsed_table:
                                print("📋 Parsed table (first 5 rows):")
                                for j, row in enumerate(parsed_table[:5]):
                                    print(f"  Row {j+1}: {row}")
                        
                        doc.close()
                        
                    except Exception as e:
                        print(f"❌ Raw text extraction failed: {e}")
                    
            except Exception as e:
                print(f"❌ Error processing {file_path}: {e}")
                import traceback
                traceback.print_exc()
        
        print(f"\n{'='*80}")
        print("✅ Direct OCR test completed")
        
    except Exception as e:
        print(f"❌ System initialization failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Need to import numpy for the image processing
    try:
        import numpy as np
        test_direct_ocr()
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please install required packages: pip install numpy opencv-python PyMuPDF Pillow pytesseract")