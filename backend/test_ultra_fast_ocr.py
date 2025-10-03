#!/usr/bin/env python3
"""
Test Ultra Fast OCR Processor
"""

import os
import sys
import pandas as pd
import time
from pathlib import Path

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from core.ultra_fast_ocr import UltraFastOCRProcessor

def test_ultra_fast_ocr():
    """Test the ultra-fast OCR processor"""
    print("=" * 80)
    print("=== ⚡ ULTRA FAST OCR TEST ⚡ ===")
    print("=" * 80)
    
    start_time = time.time()
    
    # Initialize processor
    processor = UltraFastOCRProcessor()
    print("✅ Ultra Fast OCR processor initialized")
    
    # Test files
    data_dir = Path("data/sample")
    pdf_files = list(data_dir.glob("*.pdf"))
    
    if not pdf_files:
        print("❌ No PDF files found in data/sample directory")
        return
    
    all_results = []
    
    for pdf_file in pdf_files:
        print(f"\n{'='*80}")
        print(f"🚀 PROCESSING: {pdf_file.name}")
        print(f"{'='*80}")
        
        try:
            # Process with ultra-fast method
            students = processor.process_pdf_ultra_fast(str(pdf_file))
            
            if students:
                # Clean and validate results
                cleaned_students = processor.validate_and_clean_results(students)
                
                print(f"\n✅ RESULTS:")
                print(f"   Raw extractions: {len(students)}")
                print(f"   Unique students: {len(cleaned_students)}")
                
                print(f"\n📋 STUDENT LIST:")
                print("-" * 80)
                
                for i, student in enumerate(cleaned_students):
                    print(f"{i+1:2d}. Roll: {student['roll_number']:>10} | "
                          f"Name: {student['name']:<30} | "
                          f"Attendance: {student['attendance']:<8}")
                    
                    if student.get('signatures_detected', 0) > 0:
                        print(f"    📝 Signatures detected: {student['signatures_detected']}")
                
                # Add to results
                for student in cleaned_students:
                    student['file'] = pdf_file.name
                all_results.extend(cleaned_students)
                
            else:
                print("❌ No students found")
                
        except Exception as e:
            print(f"❌ Error processing {pdf_file.name}: {e}")
            import traceback
            traceback.print_exc()
    
    # Performance summary
    total_time = time.time() - start_time
    print(f"\n{'='*80}")
    print("⚡ PERFORMANCE SUMMARY")
    print(f"{'='*80}")
    print(f"Total processing time: {total_time:.2f} seconds")
    print(f"Average time per file: {total_time/len(pdf_files):.2f} seconds")
    print(f"Total students found: {len(all_results)}")
    
    # Save results
    if all_results:
        print(f"\n💾 SAVING RESULTS")
        print("-" * 40)
        
        df = pd.DataFrame(all_results)
        output_file = "data/outputs/ultra_fast_ocr_results.xlsx"
        
        # Create output directory
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        # Save to Excel
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            # Main results
            df.to_excel(writer, sheet_name='Students', index=False)
            
            # Summary statistics
            summary_data = {
                'Metric': [
                    'Total Students',
                    'Processing Time (seconds)',
                    'Average Time per File',
                    'Students per Second',
                    'Files Processed'
                ],
                'Value': [
                    len(all_results),
                    f"{total_time:.2f}",
                    f"{total_time/len(pdf_files):.2f}",
                    f"{len(all_results)/total_time:.2f}",
                    len(pdf_files)
                ]
            }
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Performance', index=False)
            
            # Method breakdown
            method_stats = df.groupby('extraction_method').agg({
                'roll_number': 'count',
                'signatures_detected': 'sum'
            }).rename(columns={'roll_number': 'student_count'})
            method_stats.to_excel(writer, sheet_name='Methods')
        
        print(f"✅ Results saved to: {output_file}")
        
        # Quality metrics
        print(f"\n📊 QUALITY METRICS:")
        avg_confidence = df['confidence'].mean()
        print(f"   Average confidence: {avg_confidence:.2f}")
        
        # Attendance breakdown
        attendance_counts = df['attendance'].value_counts()
        print(f"\n📈 ATTENDANCE BREAKDOWN:")
        for status, count in attendance_counts.items():
            print(f"   {status}: {count} students")
        
        # Signature detection summary
        total_signatures = df['signatures_detected'].sum()
        print(f"\n📝 SIGNATURE DETECTION:")
        print(f"   Total signatures detected: {total_signatures}")
        print(f"   Average per student: {total_signatures/len(all_results):.2f}")
    
    print(f"\n{'='*80}")
    print("✅ Ultra Fast OCR test completed")
    print(f"⚡ Speed: {len(all_results)/total_time:.1f} students/second")
    print(f"{'='*80}")

if __name__ == "__main__":
    test_ultra_fast_ocr()