#!/usr/bin/env python3
"""
OCR Test for Attendance System
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.core.attendance_system import AttendanceDigitizationSystem

def test_attendance_system():
    """Test the attendance system with sample files"""
    
    print("=== Attendance Digitization System Test ===")
    
    # Initialize system
    system = AttendanceDigitizationSystem()
    
    # Test files
    test_files = [
        ("data/sample/ASK_TCS_Attendance Sheet.pdf", "Computer Science"),
        ("data/sample/AOA VKC.pdf", "Analysis of Algorithms")
    ]
    
    for file_path, subject in test_files:
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue
            
        print(f"\n{'='*60}")
        print(f"Testing: {file_path}")
        print(f"Subject: {subject}")
        print(f"{'='*60}")
        
        # Process file
        results = system.process_file(file_path, subject)
        
        # Display results
        print(f"Status: {'SUCCESS' if results['success'] else 'FAILED'}")
        print(f"Message: {results['message']}")
        
        if results['success']:
            raw_data = results['raw_data']
            agg_data = results['aggregated_data']
            
            print(f"\nExtracted Data:")
            print(f"- Total records: {len(raw_data)}")
            print(f"- Unique students: {raw_data['roll_number'].nunique()}")
            print(f"- Average attendance: {agg_data['attendance_percentage'].mean():.1f}%")
            print(f"- Defaulters: {len(agg_data[agg_data['status'] == 'Defaulter'])}")
            
            # Generate report
            report_file = system.generate_reports(
                agg_data, raw_data, results['anomalies'],
                f"test_{os.path.basename(file_path).split('.')[0]}"
            )
            print(f"- Report saved: {report_file}")
            
            # Show anomalies
            print(f"\nAnomalies:")
            for anomaly in results['anomalies']:
                print(f"  - {anomaly}")

if __name__ == "__main__":
    test_attendance_system()