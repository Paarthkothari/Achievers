import os
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any
from ..config import Config
from .ocr_processor import OCRProcessor
from .data_processor import DataProcessor

class AttendanceDigitizationSystem:
    def __init__(self):
        self.config = Config()
        self.ocr_processor = OCRProcessor()
        self.data_processor = DataProcessor()
        self.config.create_directories()
        
    def process_file(self, file_path: str, subject: str = "Unknown", 
                    date: str = None) -> Dict[str, Any]:
        """
        Main method to process an attendance file
        """
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
            
        results = {
            'success': False,
            'raw_data': pd.DataFrame(),
            'aggregated_data': pd.DataFrame(),
            'anomalies': [],
            'message': ''
        }
        
        try:
            file_ext = os.path.splitext(file_path)[1].lower()
            
            if file_ext == '.pdf':
                tables = self.ocr_processor.extract_tables_from_pdf(file_path)
                if not tables:
                    results['message'] = "No tables found in PDF"
                    return results
                    
                # Process all tables found
                all_data = []
                for i, table in enumerate(tables):
                    df = self.data_processor.process_table_to_dataframe(
                        table, subject, f"{date}_table_{i+1}"
                    )
                    if not df.empty:
                        all_data.append(df)
                
                if all_data:
                    results['raw_data'] = pd.concat(all_data, ignore_index=True)
                else:
                    results['message'] = "No valid data extracted from tables"
                    return results
                    
            elif file_ext in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
                text = self.ocr_processor.extract_from_image_file(file_path)
                if not text:
                    results['message'] = "No text extracted from image"
                    return results
                    
                table = self.ocr_processor.parse_text_to_table(text)
                if not table:
                    results['message'] = "Could not parse text into table format"
                    return results
                    
                results['raw_data'] = self.data_processor.process_table_to_dataframe(
                    table, subject, date
                )
            else:
                results['message'] = f"Unsupported file format: {file_ext}"
                return results
            
            # Process the extracted data
            if not results['raw_data'].empty:
                results['aggregated_data'] = self.data_processor.aggregate_attendance(
                    results['raw_data']
                )
                results['anomalies'] = self.data_processor.detect_anomalies(
                    results['raw_data']
                )
                results['success'] = True
                results['message'] = f"Successfully processed {len(results['raw_data'])} records"
            else:
                results['message'] = "No valid attendance data found"
                
        except Exception as e:
            results['message'] = f"Error processing file: {str(e)}"
            
        return results
    
    def generate_reports(self, aggregated_data: pd.DataFrame, 
                        raw_data: pd.DataFrame, anomalies: List[str],
                        output_prefix: str = "attendance_report") -> str:
        """
        Generate Excel reports
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"{self.config.OUTPUT_FOLDER}/{output_prefix}_{timestamp}.xlsx"
        
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            # Raw OCR data
            if not raw_data.empty:
                raw_data.to_excel(writer, sheet_name='Raw_Data', index=False)
            
            # Aggregated summary
            if not aggregated_data.empty:
                aggregated_data.to_excel(writer, sheet_name='Summary', index=False)
                
                # Subject-wise summary
                if 'subject' in aggregated_data.columns:
                    subject_summary = aggregated_data.groupby('subject').agg({
                        'total_lectures': 'mean',
                        'attendance_percentage': 'mean',
                        'roll_number': 'count'
                    }).round(2)
                    subject_summary.columns = ['Avg_Lectures', 'Avg_Attendance_%', 'Student_Count']
                    subject_summary.to_excel(writer, sheet_name='Subject_Summary')
                
                # Defaulters list
                defaulters = aggregated_data[
                    aggregated_data['status'] == 'Defaulter'
                ][['roll_number', 'student_name', 'subject', 'attendance_percentage']]
                defaulters.to_excel(writer, sheet_name='Defaulters', index=False)
            
            # Anomalies
            anomaly_df = pd.DataFrame({'Anomaly': anomalies})
            anomaly_df.to_excel(writer, sheet_name='Anomalies', index=False)
        
        return output_file
    
    def get_statistics(self, aggregated_data: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate statistics from processed data
        """
        if aggregated_data.empty:
            return {}
            
        stats = {
            'total_students': len(aggregated_data),
            'average_attendance': aggregated_data['attendance_percentage'].mean(),
            'defaulters_count': len(aggregated_data[aggregated_data['status'] == 'Defaulter']),
            'subjects': aggregated_data['subject'].unique().tolist(),
            'attendance_distribution': {
                'excellent': len(aggregated_data[aggregated_data['attendance_percentage'] >= 90]),
                'good': len(aggregated_data[
                    (aggregated_data['attendance_percentage'] >= 75) & 
                    (aggregated_data['attendance_percentage'] < 90)
                ]),
                'defaulter': len(aggregated_data[aggregated_data['attendance_percentage'] < 75])
            }
        }
        
        return stats