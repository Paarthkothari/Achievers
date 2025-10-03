import streamlit as st
import pandas as pd
import os
import logging
from src.core.ocr_processor import OCRProcessor
from src.core.attendance_analyzer import AttendanceAnalyzer
from src.utils.file_handler import FileHandler
from src.config import Config

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    st.set_page_config(
        page_title="Enhanced Attendance Digitization System",
        page_icon="📊",
        layout="wide"
    )
    
    st.title("📊 Enhanced Attendance Digitization System")
    st.markdown("Advanced OCR system with multiple engines for accurate attendance extraction")
    
    # Initialize components
    Config.create_directories()
    
    # Create models directory
    os.makedirs('models', exist_ok=True)
    
    try:
        ocr_processor = OCRProcessor()
        analyzer = AttendanceAnalyzer()
        file_handler = FileHandler()
    except Exception as e:
        st.error(f"Error initializing system: {e}")
        st.stop()
    
    # Sidebar for configuration
    st.sidebar.header("⚙️ Configuration")
    defaulter_threshold = st.sidebar.slider(
        "Defaulter Threshold (%)", 
        min_value=50, 
        max_value=90, 
        value=75, 
        step=5
    )
    
    # OCR Method Selection
    st.sidebar.header("🔍 OCR Methods")
    st.sidebar.info("""
    **Enhanced System Uses:**
    - Tesseract OCR (multiple modes)
    - EasyOCR
    - Custom CNN Model
    - Tabular Structure Detection
    - Multi-engine validation
    """)
    
    # File upload
    st.header("📁 Upload Files")
    uploaded_files = st.file_uploader(
        "Choose attendance files",
        type=['pdf', 'png', 'jpg', 'jpeg', 'tiff', 'bmp'],
        accept_multiple_files=True,
        help="Upload PDF files or high-quality images of attendance sheets"
    )
    
    if uploaded_files:
        st.success(f"Uploaded {len(uploaded_files)} file(s)")
        
        # Display file information
        with st.expander("📋 File Details"):
            for file in uploaded_files:
                st.write(f"**{file.name}** - {file.size / 1024:.1f} KB")
        
        # Process files button
        if st.button("🚀 Process Files with Enhanced OCR", type="primary"):
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            all_results = []
            processing_stats = []
            
            for i, uploaded_file in enumerate(uploaded_files):
                status_text.text(f"Processing {uploaded_file.name} with multiple OCR engines...")
                
                # Save uploaded file
                file_path = file_handler.save_uploaded_file(uploaded_file)
                
                try:
                    # Process with enhanced OCR processor
                    if uploaded_file.name.lower().endswith('.pdf'):
                        file_results = ocr_processor.extract_tables_from_pdf(file_path)
                    else:
                        file_results = ocr_processor.process_image_enhanced(file_path)
                    
                    # Add file information to results
                    for result in file_results:
                        result['source_file'] = uploaded_file.name
                    
                    all_results.extend(file_results)
                    
                    # Get processing statistics
                    file_stats = ocr_processor.get_processing_statistics(file_results)
                    file_stats['file_name'] = uploaded_file.name
                    processing_stats.append(file_stats)
                    
                    st.success(f"✅ {uploaded_file.name}: Found {len(file_results)} records")
                        
                except Exception as e:
                    st.error(f"❌ Error processing {uploaded_file.name}: {str(e)}")
                    logger.error(f"Error processing {uploaded_file.name}: {e}")
                
                progress_bar.progress((i + 1) / len(uploaded_files))
            
            status_text.text("✨ Processing complete!")
            
            if all_results:
                # Convert to DataFrame for analysis
                df = pd.DataFrame(all_results)
                
                # Display processing statistics
                st.header("📊 Processing Statistics")
                
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    st.metric("Total Records Found", len(all_results))
                with col2:
                    unique_students = df['roll_number'].nunique() if 'roll_number' in df.columns else 0
                    st.metric("Unique Students", unique_students)
                with col3:
                    records_with_names = len(df[df['name'].str.len() > 0]) if 'name' in df.columns else 0
                    st.metric("Records with Names", records_with_names)
                with col4:
                    avg_confidence = df['confidence'].mean() if 'confidence' in df.columns else 0
                    st.metric("Avg Confidence", f"{avg_confidence:.2f}")
                
                # Method breakdown
                if 'extraction_method' in df.columns:
                    st.subheader("🔍 Extraction Methods Used")
                    method_counts = df['extraction_method'].value_counts()
                    st.bar_chart(method_counts)
                
                # Display results
                st.header("📋 Extracted Attendance Data")
                
                # Filter and display options
                col1, col2 = st.columns(2)
                with col1:
                    show_all = st.checkbox("Show all extraction details", value=False)
                with col2:
                    min_confidence = st.slider("Minimum confidence", 0.0, 1.0, 0.0, 0.1)
                
                # Filter data
                display_df = df.copy()
                if 'confidence' in display_df.columns and min_confidence > 0:
                    display_df = display_df[display_df['confidence'] >= min_confidence]
                
                # Select columns to display
                if show_all:
                    st.dataframe(display_df, use_container_width=True)
                else:
                    # Show only essential columns
                    essential_cols = ['roll_number', 'name', 'present_count', 'absent_count', 
                                    'total_classes', 'attendance_percentage', 'source_file']
                    available_cols = [col for col in essential_cols if col in display_df.columns]
                    st.dataframe(display_df[available_cols], use_container_width=True)
                
                # Analysis section
                if 'attendance_percentage' in df.columns:
                    st.header("📈 Attendance Analysis")
                    
                    col1, col2, col3, col4 = st.columns(4)
                    
                    with col1:
                        st.metric("Total Students", len(df))
                    
                    with col2:
                        avg_attendance = df['attendance_percentage'].mean()
                        st.metric("Average Attendance", f"{avg_attendance:.1f}%")
                    
                    with col3:
                        defaulters = len(df[df['attendance_percentage'] < defaulter_threshold])
                        st.metric("Defaulters", defaulters)
                    
                    with col4:
                        max_classes = df['total_classes'].max() if 'total_classes' in df.columns else 0
                        st.metric("Max Classes", max_classes)
                    
                    # Attendance distribution
                    st.subheader("📊 Attendance Distribution")
                    st.histogram_chart(df['attendance_percentage'])
                    
                    # Defaulters list
                    defaulters_df = df[df['attendance_percentage'] < defaulter_threshold]
                    if not defaulters_df.empty:
                        st.header("⚠️ Defaulters List")
                        defaulter_cols = ['roll_number', 'name', 'attendance_percentage', 'total_classes']
                        available_defaulter_cols = [col for col in defaulter_cols if col in defaulters_df.columns]
                        st.dataframe(defaulters_df[available_defaulter_cols], use_container_width=True)
                
                # Download options
                st.header("💾 Export Results")
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    # Excel download with enhanced formatting
                    if st.button("📊 Export to Excel"):
                        try:
                            # Create DataFrame and export using analyzer
                            results_df = pd.DataFrame(all_results)
                            excel_data = analyzer.export_to_excel(results_df)
                            
                            st.download_button(
                                label="📊 Download Enhanced Excel Report",
                                data=excel_data,
                                file_name="enhanced_attendance_report.xlsx",
                                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            )
                        except Exception as e:
                            st.error(f"Error creating Excel file: {e}")
                
                with col2:
                    # CSV download
                    csv_data = df.to_csv(index=False)
                    st.download_button(
                        label="📄 Download CSV",
                        data=csv_data,
                        file_name="attendance_data.csv",
                        mime="text/csv"
                    )
                
                with col3:
                    # JSON download (for debugging)
                    import json
                    json_data = json.dumps(all_results, indent=2, default=str)
                    st.download_button(
                        label="🔧 Download JSON (Debug)",
                        data=json_data,
                        file_name="attendance_debug.json",
                        mime="application/json"
                    )
                
                # Quality assessment
                st.header("🎯 Quality Assessment")
                
                quality_metrics = {
                    "Records with valid roll numbers": len(df[df['roll_number'].str.match(r'^23\d{6}$', na=False)]) if 'roll_number' in df.columns else 0,
                    "Records with names": len(df[df['name'].str.len() > 2]) if 'name' in df.columns else 0,
                    "Records with attendance data": len(df[df['total_classes'] > 0]) if 'total_classes' in df.columns else 0,
                    "High confidence records": len(df[df['confidence'] > 0.7]) if 'confidence' in df.columns else 0
                }
                
                for metric, value in quality_metrics.items():
                    percentage = (value / len(df) * 100) if len(df) > 0 else 0
                    st.metric(metric, f"{value} ({percentage:.1f}%)")
                
            else:
                st.warning("⚠️ No valid attendance data could be extracted from the uploaded files.")
                st.info("""
                **Possible reasons:**
                - Poor image quality or resolution
                - Unsupported table format
                - Text not clearly visible
                - Skewed or rotated images
                
                **Try:**
                - Using higher resolution images
                - Ensuring good lighting and contrast
                - Straightening skewed images
                - Using PDF format if available
                """)
    
    # Instructions and tips
    st.header("📋 How to Use")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📤 Upload Guidelines")
        st.markdown("""
        **Supported Formats:**
        - PDF files (preferred)
        - PNG, JPG, JPEG images
        - TIFF, BMP images
        
        **For Best Results:**
        - Use high-resolution images (300+ DPI)
        - Ensure good contrast and lighting
        - Avoid skewed or rotated images
        - Clear, readable text
        """)
    
    with col2:
        st.subheader("🔍 OCR Technology")
        st.markdown("""
        **Enhanced Features:**
        - Multiple OCR engines working together
        - Advanced image preprocessing
        - Table structure detection
        - Custom CNN character recognition
        - Multi-method validation
        - Confidence scoring
        """)
    
    # System information
    with st.expander("ℹ️ System Information"):
        st.markdown("""
        **Enhanced Attendance Digitization System v2.0**
        
        This system uses advanced OCR techniques including:
        - **Tesseract OCR** with multiple PSM modes
        - **EasyOCR** for robust text detection
        - **Custom CNN Model** for character recognition
        - **Tabular Structure Detection** for better table parsing
        - **Multi-engine Validation** for improved accuracy
        
        The system automatically combines results from multiple methods to provide the most accurate attendance data extraction.
        """)

if __name__ == "__main__":
    main()