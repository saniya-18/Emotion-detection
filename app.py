import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from flask import Flask, request, jsonify
from PIL import Image
import base64
from io import BytesIO
from flask_cors import CORS
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

# Load the pre-trained model (ensure correct path to the model)
model = load_model('emotion1_model.h5')  # Ensure the file exists or adjust the path

# Define emotion labels
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Function to predict emotion from base64 image
def predict_emotion(frame_base64):
    try:
        # Decode base64 image
        image_data = base64.b64decode(frame_base64.split(',')[1])
        image = Image.open(BytesIO(image_data)).convert('L')
        image = image.resize((48, 48))
        image_array = np.array(image).reshape(1, 48, 48, 1) / 255.0
        predictions = model.predict(image_array)
        emotion_index = np.argmax(predictions)
        return emotion_labels[emotion_index]
    except Exception as e:
        logging.error(f"Error predicting emotion: {e}")
        return None

# API route for testing
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Emotion Detection API!"})

# API route to handle frame upload and prediction
@app.route('/upload', methods=['POST'])
def upload_frame():
    try:
        data = request.get_json()
        frames = data.get('frames', [])
        results = []

        stress_emotions = ['Angry', 'Disgust', 'Fear', 'Sad']  # Define stress-related emotions
        stress_count = 0
        
        for frame in frames:
            emotion = predict_emotion(frame)
            if emotion:
                results.append({'emotion': emotion})
                if emotion in stress_emotions:
                    stress_count += 1
            else:
                results.append({'error': 'Error in processing frame'})

        # Determine if the user is stressed based on the count of stress emotions
        is_stressed = stress_count > 25  # Change threshold as needed
        return jsonify({"status": "success", "results": results, "is_stressed": is_stressed})
    
    except Exception as e:
        logging.error(f"Error in upload_frame: {e}")
        return jsonify({"status": "error", "message": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
