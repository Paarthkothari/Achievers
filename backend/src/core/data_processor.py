import pandas as pd
import re
from typing import List, Dict, Tuple, Any
from ..config import Config

class DataProcessor:
    def __init__(self):
        self.config = Config()
        
    def normalize_attendance_status(self, status: str) -> str:
        """
        Normalize attendance status to standard format
        """
        if pd.isna(status) or status == '':
            return 'Unclear'
            
        status_clean = str(status).strip().upper()
        
        # Check direct mapping first
        if status_clean in self.config.ATTENDANCE_MAPPING:
            return self.config.ATTENDANCE_MAPPING[status_clean]
            
        # Check for partial matches or special characters
        for key, value in self.config.ATTENDANCE_MAPPING.items():
            if key in status_clean:
                return value
                
        return 'Unclear'
    
    def validate_roll_number(self, roll_no: str) -> bool:
        """
        Validate roll number format
        """
        if pd.isna(roll_no) or roll_no == '':
            return False
            
        roll_clean = str(roll_no).strip()
        # Check if it's numeric or follows common roll number patterns
        return bool(re.match(r'^[A-Z0-9]+$', roll_clean, re.IGNORECASE))
    
    def validate_name(self, name: str) -> bool:
        """
        Validate student name
        """
        if pd.isna(name) or name == '':
            return False
        return len(str(name).strip()) > 1
    
    def process_table_to_dataframe(self, table: List[List[str]], 
                                 subject: str = "Unknown", 
                                 date: str = "Unknown") -> pd.DataFrame:
        """
        Convert extracted table to standardized DataFrame
        """
        if not table or len(table) < 1:
            return pd.DataFrame()
            
        # Process all rows as data rows
        processed_data = []
        
        for row in table:
            if len(row) < 2:  # Need at least roll and name
                continue
                
            # Extract roll number and name (usually first two columns)
            roll_no = row[0] if len(row) > 0 else ""
            name = row[1] if len(row) > 1 else ""
            
            # Remaining columns are attendance data
            attendance_data = row[2:] if len(row) > 2 else [""]
            
            # Create a row for each attendance entry
            for i, attendance in enumerate(attendance_data):
                processed_data.append({
                    'roll_number': roll_no,
                    'student_name': name,
                    'subject': subject,
                    'date': f"{date}_lecture_{i+1}",
                    'attendance_raw': attendance,
                    'attendance_status': self.normalize_attendance_status(attendance)
                })
        
        df = pd.DataFrame(processed_data)
        
        if not df.empty:
            # Add validation columns
            df['valid_roll'] = df['roll_number'].apply(self.validate_roll_number)
            df['valid_name'] = df['student_name'].apply(self.validate_name)
            
        return df
    
    def aggregate_attendance(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Aggregate attendance data by student and subject
        """
        if df.empty:
            return pd.DataFrame()
            
        # Group by student and subject
        agg_data = df.groupby(['roll_number', 'student_name', 'subject']).agg({
            'attendance_status': [
                ('total_lectures', 'count'),
                ('present_count', lambda x: (x == 'Present').sum()),
                ('absent_count', lambda x: (x == 'Absent').sum()),
                ('unclear_count', lambda x: (x == 'Unclear').sum())
            ]
        }).reset_index()
        
        # Flatten column names
        agg_data.columns = ['roll_number', 'student_name', 'subject', 
                           'total_lectures', 'present_count', 'absent_count', 'unclear_count']
        
        # Calculate percentage (excluding unclear entries from total)
        agg_data['valid_lectures'] = agg_data['present_count'] + agg_data['absent_count']
        agg_data['attendance_percentage'] = (
            agg_data['present_count'] / agg_data['valid_lectures'] * 100
        ).fillna(0)
        
        # Determine status
        agg_data['status'] = agg_data['attendance_percentage'].apply(
            lambda x: 'Defaulter' if x < self.config.DEFAULTER_THRESHOLD else 'Regular'
        )
        
        return agg_data
    
    def detect_anomalies(self, df: pd.DataFrame) -> List[str]:
        """
        Detect anomalies in the attendance data
        """
        anomalies = []
        
        if df.empty:
            return ["No data to analyze"]
        
        # Check for duplicate roll numbers
        duplicate_rolls = df[df.duplicated(['roll_number'], keep=False)]['roll_number'].unique()
        if len(duplicate_rolls) > 0:
            anomalies.append(f"Duplicate roll numbers found: {', '.join(duplicate_rolls)}")
        
        # Check for invalid roll numbers
        invalid_rolls = df[~df['valid_roll']]['roll_number'].unique()
        if len(invalid_rolls) > 0:
            anomalies.append(f"Invalid roll numbers: {', '.join(invalid_rolls)}")
        
        # Check for missing names
        missing_names = df[~df['valid_name']]['roll_number'].unique()
        if len(missing_names) > 0:
            anomalies.append(f"Missing/invalid names for rolls: {', '.join(missing_names)}")
        
        # Check for high unclear percentage
        unclear_percentage = (df['attendance_status'] == 'Unclear').sum() / len(df) * 100
        if unclear_percentage > 20:
            anomalies.append(f"High unclear attendance entries: {unclear_percentage:.1f}%")
        
        return anomalies if anomalies else ["No anomalies detected"]