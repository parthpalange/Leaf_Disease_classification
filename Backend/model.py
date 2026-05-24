import torch
import torchvision.transforms as transforms
import torchvision.models as models
import json
import os

# Path to this file's directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load class-to-index mapping and invert it (index → class name)
with open(os.path.join(BASE_DIR, "resnet50_class_to_idx.json"), "r") as f:
    class_to_idx = json.load(f)

idx_to_class = {v: k for k, v in class_to_idx.items()}
num_classes = len(class_to_idx)

# Build the same ResNet50 architecture used during training
model = models.resnet50(pretrained=False)
model.fc = torch.nn.Linear(model.fc.in_features, num_classes)

# Load the saved weights
model.load_state_dict(
    torch.load(
        os.path.join(BASE_DIR, "resnet50.pth"),
        map_location=torch.device("cpu")
    )
)
model.eval()

# Image pre-processing pipeline (must match training transforms)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def predict_image(image):
    """
    Takes a PIL Image, runs it through the ResNet50 model,
    and returns the predicted disease class name and confidence score.
    """
    tensor = transform(image).unsqueeze(0)  # Add batch dimension

    with torch.no_grad():
        outputs = model(tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        confidence, predicted_idx = torch.max(probabilities, 1)

    predicted_class = idx_to_class[predicted_idx.item()]
    confidence_score = round(confidence.item() * 100, 2)
    return predicted_class, confidence_score