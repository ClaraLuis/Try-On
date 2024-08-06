import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const WebcamWithOverlayTops = (props) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [shirtPos, setShirtPos] = useState(null);

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
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const shirtImage = new Image();
    shirtImage.src = props?.selectedImg;

    shirtImage.onload = () => {
      console.log("Shirt image loaded");
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
        setShirtPos(null);
        if (detections.length > 0) {
          const { landmarks } = detections[0];
          const nose = landmarks.getNose();

          // Debugging: Log landmarks to verify correct detection
          console.log("Nose:", nose);

          const shirtWidth = video.videoWidth * 1.1; // Adjust as needed
          const shirtHeight = shirtWidth * 0.6; // Adjust as needed
          const shirtX = nose[0].x - shirtWidth / 2;
          const shirtY = nose[0].y + 90; // Adjust to place the shirt below the face

          setShirtPos({
            y: shirtY,
            x: shirtX,
            width: shirtWidth,
            height: shirtHeight,
          });

          // Debugging: Log position and size
          console.log(
            `Shirt Position: X=${shirtX}, Y=${shirtY}, Width=${shirtWidth}, Height=${shirtHeight}`
          );

          context.drawImage(
            shirtImage,
            shirtX,
            shirtY,
            shirtWidth,
            shirtHeight
          );
        }
      }
      requestAnimationFrame(draw);
    };

    if (modelsLoaded) {
      draw();
    }
  }, [modelsLoaded]);

  return (
    <div style={{ position: "absolute" }}>
      <Webcam audio={false} ref={webcamRef} style={{ position: "relative" }} />
      {shirtPos != null && (
        <img
          src={props?.selectedImg}
          alt="Shirt"
          style={{
            position: "absolute",
            top: shirtPos.y,
            left: shirtPos.x,
            width: shirtPos.width,
            height: shirtPos.height,
            pointerEvents: "none", // Make sure the image doesn't interfere with webcam controls
            transition: "all 0.4s",
            objectFit: "contain",
            clipPath: `inset(0px ${Math.max(
              shirtPos.x +
                shirtPos.width -
                webcamRef?.current?.video?.videoWidth,
              0
            )}px ${Math.max(
              shirtPos.y +
                shirtPos.height -
                webcamRef?.current?.video?.videoHeight,
              0
            )}px ${Math.max(-shirtPos.x, 0)}px)`,
          }}
        />
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default WebcamWithOverlayTops;
