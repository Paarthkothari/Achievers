#!/usr/bin/env python3
"""
Main entry point for Attendance Digitization System
"""

import sys
import os
from src.core.attendance_system import AttendanceDigitizationSystem

def main():
    """Main function"""
    print("🎓 Attendance Digitization System")
    print("=" * 50)
    
    if len(sys.argv) < 2:
        print("Usage: python main.py <pdf_file> [subject_name]")
        print("Example: python main.py data/sample/attendance.pdf 'Computer Science'")
        return
    
    file_path = sys.argv[1]
    subject = sys.argv[2] if len(sys.argv) > 2 else "Unknown Subject"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return
    
    # Initialize system
    system = AttendanceDigitizationSystem()
    
    print(f"📄 Processing: {file_path}")
    print(f"📚 Subject: {subject}")
    print("-" * 50)
    
    # Process file
    results = system.process_file(file_path, subject)
    
    if results['success']:
        print("✅ Processing completed successfully!")
        
        raw_data = results['raw_data']
        agg_data = results['aggregated_data']
        
        print(f"\n📊 Results Summary:")
        print(f"   • Total records processed: {len(raw_data)}")
        print(f"   • Unique students found: {raw_data['roll_number'].nunique()}")
        print(f"   • Average attendance: {agg_data['attendance_percentage'].mean():.1f}%")
        print(f"   • Students below 75%: {len(agg_data[agg_data['status'] == 'Defaulter'])}")
        
        # Generate report
        report_file = system.generate_reports(
            agg_data, raw_data, results['anomalies'],
            f"attendance_{os.path.basename(file_path).split('.')[0]}"
        )
        print(f"\n📋 Excel report generated: {report_file}")
        
        # Show anomalies if any
        if results['anomalies'] and results['anomalies'] != ["No anomalies detected"]:
            print(f"\n⚠️  Anomalies detected:")
            for anomaly in results['anomalies']:
                print(f"   • {anomaly}")
        
        # Show statistics
        stats = system.get_statistics(agg_data)
        if stats:
            print(f"\n📈 Attendance Distribution:")
            dist = stats['attendance_distribution']
            print(f"   • Excellent (≥90%): {dist['excellent']} students")
            print(f"   • Good (75-89%): {dist['good']} students")
            print(f"   • Defaulter (<75%): {dist['defaulter']} students")
    else:
        print(f"❌ Processing failed: {results['message']}")

if __name__ == "__main__":
    main()