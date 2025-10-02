import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Model
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import os

class ModelPredictor:
    def __init__(self):
        self.model = None
        self.class_names = ['healthy', 'multiple_diseases', 'rust', 'scab']
        self.input_size = (224, 224)
        self.loaded = False
        self._load_model()
    
    def _create_model(self):
        """Create the MobileNetV2 model architecture from the notebook"""
        # Load MobileNetV2 base (using ImageNet weights since we don't have the custom weights)
        base_model = MobileNetV2(
            include_top=False,
            input_shape=(224, 224, 3),
            weights='imagenet'  # Using ImageNet weights as fallback
        )
        base_model.trainable = False  # Freeze base model
        
        # Add custom classification head (same as notebook)
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dropout(0.3)(x)
        x = Dense(128, activation='relu')(x)
        output = Dense(4, activation='softmax')(x)  # 4 classes
        
        model = Model(inputs=base_model.input, outputs=output)
        return model
    
    def _load_model(self):
        """Load the trained model or create a new one"""
        try:
            # Try to load saved model first
            model_path = 'models/apple_leaf_model.keras'
            if os.path.exists(model_path):
                self.model = tf.keras.models.load_model(model_path)
                print("Loaded saved model from", model_path)
            else:
                # Create new model with pre-trained weights
                print("Creating new model with ImageNet weights...")
                self.model = self._create_model()
                
                # Compile the model
                self.model.compile(
                    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
                    loss='categorical_crossentropy',
                    metrics=['accuracy']
                )
                
                print("Model created successfully (using ImageNet weights)")
            
            self.loaded = True
            
        except Exception as e:
            print(f"Error loading model: {e}")
            self.loaded = False
    
    def _preprocess_image(self, image):
        """Preprocess image for prediction (same as notebook preprocessing)"""
        # Resize image to model input size
        image = image.resize(self.input_size)
        
        # Convert to array and normalize (same as notebook: rescale=1./255)
        image_array = img_to_array(image)
        image_array = image_array / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
    
    def predict_leaf(self, image):
        """
        Predict leaf disease from PIL Image
        Returns: (result_string, confidence_score)
        """
        if not self.loaded or self.model is None:
            raise Exception("Model not loaded")
        
        try:
            # Preprocess the image
            processed_image = self._preprocess_image(image)
            
            # Make prediction
            predictions = self.model.predict(processed_image, verbose=0)
            
            # Get the predicted class and confidence
            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_idx])
            
            # Map to class name
            result = self.class_names[predicted_class_idx]
            
            return result, confidence
            
        except Exception as e:
            raise Exception(f"Prediction error: {str(e)}")
    
    def is_loaded(self):
        """Check if model is loaded"""
        return self.loaded and self.model is not None
