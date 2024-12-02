import React, { useState, useEffect, useRef } from "react";
import "./App.css"; // Подключаем внешний файл стилей

const App = () => {
  const [isCvLoaded, setCvLoaded] = useState(false);
  const [image, setImage] = useState(null);
  const [operation, setOperation] = useState("erosion");
  const [shape, setShape] = useState("circle");
  const [size, setSize] = useState(5);

  const originalCanvasRef = useRef(null);
  const processedCanvasRef = useRef(null);

  useEffect(() => {
    const checkOpenCV = () => {
      if (window.cv && window.cv.Mat) {
        setCvLoaded(true);
        console.log("OpenCV.js is loaded successfully!");
      } else {
        console.log("Waiting for OpenCV.js to load...");
        setTimeout(checkOpenCV, 100);
      }
    };
    checkOpenCV();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);

      const canvas = originalCanvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
    };
    reader.readAsDataURL(file);
  };

  const processImage = () => {
    if (!isCvLoaded) {
      alert("OpenCV.js is not loaded yet. Please wait...");
      return;
    }

    const originalCanvas = originalCanvasRef.current;
    const processedCanvas = processedCanvasRef.current;

    const src = cv.imread(originalCanvas);
    const kernel = getKernel(shape, size);
    const dst = new cv.Mat();

    switch (operation) {
      case "erosion":
        cv.erode(src, dst, kernel);
        break;
      case "dilation":
        cv.dilate(src, dst, kernel);
        break;
      case "opening":
        cv.morphologyEx(src, dst, cv.MORPH_OPEN, kernel);
        break;
      case "closing":
        cv.morphologyEx(src, dst, cv.MORPH_CLOSE, kernel);
        break;
      default:
        break;
    }

    cv.imshow(processedCanvas, dst);
    src.delete();
    dst.delete();
    kernel.delete();
  };

  const getKernel = (shape, size) => {
    let kernel;
    if (shape === "circle") {
      kernel = cv.getStructuringElement(
        cv.MORPH_ELLIPSE,
        new cv.Size(size, size)
      );
    } else if (shape === "square") {
      kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(size, size));
    }
    return kernel;
  };

  return (
    <div className="app">
      <h1 className="title">Morphological Image Processing</h1>
      <div className="controls">
        <input
          type="file"
          onChange={handleImageUpload}
          className="file-input"
        />
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          className="dropdown"
        >
          <option value="erosion">Erosion</option>
          <option value="dilation">Dilation</option>
          <option value="opening">Opening</option>
          <option value="closing">Closing</option>
        </select>
        <select
          value={shape}
          onChange={(e) => setShape(e.target.value)}
          className="dropdown"
        >
          <option value="circle">Circle</option>
          <option value="square">Square</option>
        </select>
        <input
          type="number"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          placeholder="Kernel size"
          className="input-number"
        />
        <button onClick={processImage} className="process-button">
          Process
        </button>
      </div>
      <div className="canvas-container">
        <div>
          <h3>Original Image</h3>
          <canvas ref={originalCanvasRef} className="canvas"></canvas>
        </div>
        <div>
          <h3>Processed Image</h3>
          <canvas ref={processedCanvasRef} className="canvas"></canvas>
        </div>
      </div>
      {!isCvLoaded && <p className="loading">Loading OpenCV.js...</p>}
    </div>
  );
};

export default App;
