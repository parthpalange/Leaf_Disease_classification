import React, { useState } from "react";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!image) {
      alert("Upload image first");
      return;
    }

    const formData = new FormData();
    formData.append("file", image);

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.prediction) {
        setResult(data.prediction);
      } else {
        setResult("Error: " + data.error);
      }

    } catch (error) {
      console.error(error);
      setResult("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🌱 Crop Disease Detection</h1>

      <input type="file" accept="image/*" onChange={handleImageChange} />

      {preview && (
        <div className="image-preview">
          <img src={preview} alt="preview" />
        </div>
      )}

      <button onClick={handleSubmit}>
        {loading ? "Predicting..." : "Submit"}
      </button>

      {result && (
        <div className="result">
          <h2>Prediction: {result}</h2>
        </div>
      )}
    </div>
  );
}

export default App;