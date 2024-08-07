// src/components/WebcamWithOverlay.js
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { CircularProgress } from "react-cssfx-loading";

const WebcamWithOverlayGlasses = (props) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [glassesPos, setglassesPos] = useState(null);
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
      console.log("Models loaded");
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (modelsLoaded) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const glassesImage = new Image();
      glassesImage.src = props?.selectedImg;

      glassesImage.onload = () => {
        console.log("Glasses image loaded");
      };

      const draw = async () => {
        const video = webcamRef.current.video;
        if (video.readyState === 4 && modelsLoaded) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();
          setglassesPos(null);
          if (detections.length > 0) {
            const { landmarks } = detections[0];
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();

            // Debugging: Log landmarks to verify correct detection
            console.log("Left Eye:", leftEye);
            console.log("Right Eye:", rightEye);

            const glassesWidth = Math.abs(rightEye[3].x - leftEye[0].x) * 2;
            const glassesHeight = glassesWidth * 0.5;
            const glassesX = leftEye[0].x - glassesWidth * 0.25;
            const glassesY = leftEye[0].y - glassesHeight * 0.5;
            setglassesPos({
              y: glassesY,
              x: glassesX,
              width: glassesWidth,
              height: glassesHeight,
            });
            // Debugging: Log position and size
            console.log(
              `Glasses Position: X=${glassesX}, Y=${glassesY}, Width=${glassesWidth}, Height=${glassesHeight}`
            );

            context.drawImage(
              glassesImage,
              glassesX,
              glassesY,
              glassesWidth,
              glassesHeight
            );
          }
        }
        requestAnimationFrame(draw);
      };

      draw();
    }
  }, [modelsLoaded]);
  if (!modelsLoaded) {
    return (
      <div class="col-lg-12 allcentered" style={{ height: "40vh" }}>
        <CircularProgress
          color="#000"
          width="100px"
          height="100px"
          duration="1s"
        />
      </div>
    );
  } else {
    return (
      <div style={{ position: "absolute" }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          style={{ position: "relative" }}
        />
        {glassesPos != null && (
          <img
            src={props?.selectedImg}
            alt="Glasses"
            style={{
              position: "absolute",
              top: glassesPos.y,
              left: glassesPos.x,
              width: glassesPos.width,
              height: glassesPos.height,
              pointerEvents: "none", // Make sure the image doesn't interfere with webcam controls
              transition: "all 0.4s",
              objectFit: "contain",
            }}
          />
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    );
  }
};

export default WebcamWithOverlayGlasses;
