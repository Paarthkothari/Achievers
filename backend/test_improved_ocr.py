#!/usr/bin/env python3
"""
Test script for Improved OCR Processor
"""

import os
import sys
import pandas as pd
from pathlib import Path

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from core.improved_ocr import ImprovedOCRProcessor

def test_improved_ocr():
    """Test the improved OCR processor"""
    print("=" * 80)
    print("=== IMPROVED OCR TEST ===")
    print("=" * 80)
    
    # Initialize processor
    processor = ImprovedOCRProcessor()
    print("✅ Improved OCR processor initialized")
    
    # Test files
    data_dir = Path("data/sample")
    pdf_files = list(data_dir.glob("*.pdf"))
    
    if not pdf_files:
        print("❌ No PDF files found in data/sample directory")
        return
    
    all_results = []
    
    for pdf_file in pdf_files:
        print(f"\n{'='*80}")
        print(f"📄 Processing: {pdf_file.name}")
        print(f"{'='*80}")
        
        try:
            # Process the PDF
            students = processor.process_attendance_pdf(str(pdf_file))
            
            if students:
                print(f"✅ Found {len(students)} students")
                print("\n📋 Extracted Student Data:")
                print("-" * 80)
                
                for i, student in enumerate(students):
                    print(f"{i+1:2d}. Roll: {student['roll_number']:>10} | "
                          f"Name: {student['name']:<30} | "
                          f"Attendance: {student['attendance']:<8}")
                    print(f"    Method: {student['extraction_method']}")
                    print(f"    Raw: {student['raw_line'][:60]}...")
                    print()
                
                # Add to results
                for student in students:
                    student['file'] = pdf_file.name
                all_results.extend(students)
                
            else:
                print("❌ No students found")
                
        except Exception as e:
            print(f"❌ Error processing {pdf_file.name}: {e}")
            import traceback
            traceback.print_exc()
    
    # Save results to Excel
    if all_results:
        print(f"\n{'='*80}")
        print("💾 Saving Results")
        print(f"{'='*80}")
        
        df = pd.DataFrame(all_results)
        output_file = "data/outputs/improved_ocr_results.xlsx"
        
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        # Save to Excel with multiple sheets
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            # Main results
            df.to_excel(writer, sheet_name='All_Students', index=False)
            
            # Summary by file
            summary = df.groupby('file').agg({
                'roll_number': 'count',
                'extraction_method': lambda x: x.mode().iloc[0] if not x.empty else 'Unknown'
            }).rename(columns={'roll_number': 'student_count'})
            summary.to_excel(writer, sheet_name='Summary')
            
            # Method comparison
            method_stats = df.groupby('extraction_method').size().reset_index(name='count')
            method_stats.to_excel(writer, sheet_name='Method_Stats', index=False)
        
        print(f"✅ Results saved to: {output_file}")
        print(f"📊 Total students extracted: {len(all_results)}")
        
        # Show method breakdown
        print("\n📈 Extraction Method Breakdown:")
        method_counts = df['extraction_method'].value_counts()
        for method, count in method_counts.items():
            print(f"  {method}: {count} students")
        
        # Show quality assessment
        print("\n📊 Quality Assessment:")
        avg_confidence = df['confidence'].mean()
        print(f"  Average confidence: {avg_confidence:.2f}")
        
        # Show roll number patterns found
        roll_patterns = df['roll_number'].value_counts()
        print(f"\n🔢 Roll Number Patterns:")
        for pattern, count in roll_patterns.head(10).items():
            print(f"  {pattern}: {count} occurrences")
    
    print(f"\n{'='*80}")
    print("✅ Improved OCR test completed")
    print(f"{'='*80}")

if __name__ == "__main__":
    test_improved_ocr()