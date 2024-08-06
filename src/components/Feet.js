// src/components/WebcamComponent.js
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const Feet = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const detectFeet = async () => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const predictions = await model.detect(video);
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      predictions.forEach((prediction) => {
        if (prediction.class === "person") {
          const [x, y, width, height] = prediction.bbox;
          const feetBox = [x, y + height * 0.75, width, height * 0.25];
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(...feetBox);
        }
      });
    }
  };

  useEffect(() => {
    if (model) {
      const intervalId = setInterval(detectFeet, 100);
      return () => clearInterval(intervalId);
    }
  }, [model]);

  return (
    <div>
      <Webcam ref={webcamRef} />
      <canvas ref={canvasRef} style={{ position: "absolute" }} />
    </div>
  );
};

export default Feet;
