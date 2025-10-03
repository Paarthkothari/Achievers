import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.preprocessing import LabelBinarizer
import os
import logging
from typing import List, Tuple, Optional

logger = logging.getLogger(__name__)

class CustomCNNModel:
    """
    Custom CNN model for character recognition in attendance sheets
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self.characters_list = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        self.label_binarizer = LabelBinarizer()
        self.model_path = model_path or 'models/custom_ocr_model.h5'
        
        # Initialize label binarizer
        labels = list(range(len(self.characters_list)))
        self.label_binarizer.fit(labels)
        
        # Try to load existing model
        self._load_model()
    
    def _load_model(self):
        """Load pre-trained model if available"""
        if os.path.exists(self.model_path):
            try:
                self.model = load_model(self.model_path)
                logger.info(f"Loaded existing model from {self.model_path}")
            except Exception as e:
                logger.warning(f"Failed to load model: {e}")
                self._create_model()
        else:
            logger.info("No existing model found, creating new model")
            self._create_model()
    
    def _create_model(self):
        """Create a new CNN model architecture"""
        self.model = Sequential([
            # First convolutional layer
            Conv2D(filters=32, kernel_size=(3, 3), activation='relu', input_shape=(28, 28, 1)),
            MaxPooling2D(pool_size=(2, 2)),
            
            # Second convolutional layer
            Conv2D(filters=64, kernel_size=(3, 3), activation='relu', padding='same'),
            MaxPooling2D(pool_size=(2, 2)),
            
            # Third convolutional layer
            Conv2D(filters=128, kernel_size=(3, 3), activation='relu', padding='valid'),
            MaxPooling2D(pool_size=(2, 2)),
            
            # Flatten and dense layers
            Flatten(),
            Dense(64, activation='relu'),
            Dense(128, activation='relu'),
            Dense(len(self.characters_list), activation='softmax')
        ])
        
        # Compile the model
        self.model.compile(
            loss='categorical_crossentropy',
            optimizer='adam',
            metrics=['accuracy']
        )
        
        logger.info("Created new CNN model")
        logger.info(f"Model summary:\n{self.model.summary()}")
    
    def preprocess_character_image(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocess a character image for the CNN model
        """
        # Ensure grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Apply threshold
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
        
        # Resize to 28x28
        resized = cv2.resize(thresh, (28, 28))
        
        # Normalize
        normalized = resized.astype('float32') / 255.0
        
        # Add channel dimension
        normalized = np.expand_dims(normalized, axis=-1)
        
        return normalized
    
    def predict_character(self, character_image: np.ndarray) -> Tuple[str, float]:
        """
        Predict a single character from an image
        """
        if self.model is None:
            return "", 0.0
        
        # Preprocess the image
        processed = self.preprocess_character_image(character_image)
        
        # Add batch dimension
        batch_input = np.expand_dims(processed, axis=0)
        
        # Make prediction
        prediction = self.model.predict(batch_input, verbose=0)
        
        # Get the character with highest probability
        char_index = np.argmax(prediction[0])
        confidence = prediction[0][char_index]
        character = self.characters_list[char_index]
        
        return character, float(confidence)
    
    def predict_characters_batch(self, character_images: List[np.ndarray]) -> List[Tuple[str, float]]:
        """
        Predict multiple characters in batch for efficiency
        """
        if self.model is None or not character_images:
            return []
        
        # Preprocess all images
        processed_images = []
        for img in character_images:
            processed = self.preprocess_character_image(img)
            processed_images.append(processed)
        
        # Stack into batch
        batch_input = np.stack(processed_images)
        
        # Make predictions
        predictions = self.model.predict(batch_input, verbose=0)
        
        # Extract results
        results = []
        for prediction in predictions:
            char_index = np.argmax(prediction)
            confidence = prediction[char_index]
            character = self.characters_list[char_index]
            results.append((character, float(confidence)))
        
        return results
    
    def extract_text_from_contours(self, image: np.ndarray, contours: List) -> str:
        """
        Extract text from character contours using the CNN model
        """
        if not contours:
            return ""
        
        # Sort contours from left to right
        from imutils.contours import sort_contours
        sorted_contours = sort_contours(contours, method='left-to-right')[0]
        
        # Extract character images
        character_images = []
        character_boxes = []
        
        for contour in sorted_contours:
            x, y, w, h = cv2.boundingRect(contour)
            
            # Filter by size (adjust these values based on your data)
            if w < 10 or h < 15 or w > 100 or h > 100:
                continue
            
            # Extract character ROI
            char_roi = image[y:y+h, x:x+w]
            character_images.append(char_roi)
            character_boxes.append((x, y, w, h))
        
        if not character_images:
            return ""
        
        # Predict characters
        predictions = self.predict_characters_batch(character_images)
        
        # Construct text with spacing logic
        text = ""
        previous_x = 0
        
        for i, ((char, confidence), (x, y, w, h)) in enumerate(zip(predictions, character_boxes)):
            # Add space if there's a significant gap
            if i > 0 and x - previous_x > w * 1.5:
                text += " "
            
            # Only add character if confidence is reasonable
            if confidence > 0.3:
                text += char
            
            previous_x = x + w
        
        return text
    
    def detect_and_recognize_text(self, image: np.ndarray) -> str:
        """
        Complete pipeline: detect characters and recognize them
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        
        # Preprocess for contour detection
        blur = cv2.GaussianBlur(gray, (3, 3), 0)
        adaptive = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 9)
        inverted = 255 - adaptive
        
        # Morphological operations
        kernel = np.ones((2, 2), np.uint8)
        dilated = cv2.dilate(inverted, kernel, iterations=1)
        
        # Find contours
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Extract text
        return self.extract_text_from_contours(gray, contours)
    
    def save_model(self, path: Optional[str] = None):
        """Save the trained model"""
        if self.model is None:
            logger.warning("No model to save")
            return
        
        save_path = path or self.model_path
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        try:
            self.model.save(save_path)
            logger.info(f"Model saved to {save_path}")
        except Exception as e:
            logger.error(f"Failed to save model: {e}")
    
    def train_on_synthetic_data(self, epochs: int = 10):
        """
        Train the model on synthetic data (placeholder for actual training)
        This would be used if you have training data available
        """
        logger.info("Training on synthetic data would be implemented here")
        logger.info("This requires a dataset of character images with labels")
        
        # Placeholder for training logic
        # In a real implementation, you would:
        # 1. Load training data (character images and labels)
        # 2. Preprocess the data
        # 3. Create data generators for augmentation
        # 4. Train the model
        # 5. Save the trained model
        
        pass
    
    def evaluate_on_test_data(self, test_images: List[np.ndarray], test_labels: List[str]) -> Dict[str, float]:
        """
        Evaluate model performance on test data
        """
        if self.model is None or not test_images:
            return {}
        
        # Preprocess test images
        processed_images = [self.preprocess_character_image(img) for img in test_images]
        batch_input = np.stack(processed_images)
        
        # Convert labels to indices
        label_indices = [self.characters_list.index(label) for label in test_labels if label in self.characters_list]
        
        if len(label_indices) != len(test_images):
            logger.warning("Some test labels not found in character set")
            return {}
        
        # Convert to categorical
        y_true = self.label_binarizer.transform(label_indices)
        
        # Evaluate
        loss, accuracy = self.model.evaluate(batch_input, y_true, verbose=0)
        
        return {
            'loss': float(loss),
            'accuracy': float(accuracy)
        }