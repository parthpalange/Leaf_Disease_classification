from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from model import predict_image

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Crop Disease API Running"

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"})

    file = request.files['file']

    try:
        image = Image.open(file).convert("RGB")
        prediction, confidence = predict_image(image)

        return jsonify({
            "prediction": prediction,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)