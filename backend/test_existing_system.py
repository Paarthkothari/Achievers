#!/usr/bin/env python3
"""
Test Existing OCR System and Print Extracted Data
"""

import sys
import os
sys.path.append('src')

def test_existing_system():
    """Test existing OCR system with sample files"""
    
    print("=== Existing OCR System Test ===")
    print("Initializing system...")
    
    try:
        from src.core.attendance_system import AttendanceDigitizationSystem
        
        # Initialize system
        system = AttendanceDigitizationSystem()
        print("✅ System initialized successfully")
        
        # Test files
        test_files = [
            ("data/sample/ASK_TCS_Attendance Sheet.pdf", "Computer Science"),
            ("data/sample/AOA VKC.pdf", "Analysis of Algorithms")
        ]
        
        for file_path, subject in test_files:
            if not os.path.exists(file_path):
                print(f"❌ File not found: {file_path}")
                continue
                
            print(f"\n{'='*80}")
            print(f"📄 Processing: {os.path.basename(file_path)}")
            print(f"📚 Subject: {subject}")
            print(f"{'='*80}")
            
            try:
                # Process file
                results = system.process_file(file_path, subject)
                
                print(f"📊 PROCESSING RESULT:")
                print(f"   Status: {'SUCCESS' if results['success'] else 'FAILED'}")
                print(f"   Message: {results['message']}")
                
                if results['success']:
                    raw_data = results['raw_data']
                    agg_data = results['aggregated_data']
                    
                    print(f"\n📋 RAW DATA SAMPLE:")
                    print("-" * 80)
                    if not raw_data.empty:
                        print(f"Total raw records: {len(raw_data)}")
                        print("Columns:", list(raw_data.columns))
                        print("\nFirst 5 records:")
                        for idx, row in raw_data.head().iterrows():
                            print(f"  Record {idx + 1}: {dict(row)}")
                    
                    print(f"\n📈 AGGREGATED DATA:")
                    print("-" * 80)
                    if not agg_data.empty:
                        print(f"Total students: {len(agg_data)}")
                        print("Columns:", list(agg_data.columns))
                        
                        for idx, row in agg_data.iterrows():
                            print(f"\nStudent {idx + 1}:")
                            for col, val in row.items():
                                print(f"  {col}: {val}")
                        
                        # Statistics
                        stats = system.get_statistics(agg_data)
                        print(f"\n📊 STATISTICS:")
                        for key, value in stats.items():
                            print(f"  {key}: {value}")
                    
                    # Anomalies
                    if results['anomalies']:
                        print(f"\n⚠️ ANOMALIES:")
                        for anomaly in results['anomalies']:
                            print(f"  - {anomaly}")
                    
                    # Generate report
                    try:
                        report_file = system.generate_reports(
                            agg_data, raw_data, results['anomalies'],
                            f"test_{os.path.basename(file_path).split('.')[0]}"
                        )
                        print(f"\n💾 Report saved: {report_file}")
                    except Exception as e:
                        print(f"❌ Error generating report: {e}")
                
                else:
                    print("❌ Processing failed")
                    
            except Exception as e:
                print(f"❌ Error processing {file_path}: {e}")
                import traceback
                traceback.print_exc()
        
        print(f"\n{'='*80}")
        print("✅ Test completed")
        
    except Exception as e:
        print(f"❌ System initialization failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_existing_system()