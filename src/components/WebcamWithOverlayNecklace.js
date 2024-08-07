import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { CircularProgress } from "react-cssfx-loading";

const WebcamWithOverlayNecklace = (props) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [necklacePos, setNecklacePos] = useState(null);

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
      const necklaceImage = new Image();

      necklaceImage.src = props?.selectedImg;

      const draw = async () => {
        const video = webcamRef.current.video;
        if (video.readyState === 4 && modelsLoaded) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();
          setNecklacePos(null);
          if (detections.length > 0) {
            const { landmarks } = detections[0];
            const nose = landmarks.getNose();

            const necklaceWidth = video.videoWidth * 0.5; // Adjust as needed
            const necklaceHeight = necklaceWidth * 0.3; // Adjust as needed
            const necklaceX = nose[0].x - necklaceWidth / 2;
            const necklaceY = nose[0].y + 120; // Place necklace around the neck

            setNecklacePos({
              y: necklaceY,
              x: necklaceX,
              width: necklaceWidth,
              height: necklaceHeight,
            });

            context.drawImage(
              necklaceImage,
              necklaceX,
              necklaceY,
              necklaceWidth,
              necklaceHeight
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
        {necklacePos != null && (
          <img
            src={props?.selectedImg}
            alt="Necklace"
            style={{
              position: "absolute",
              top: necklacePos.y,
              left: necklacePos.x,
              width: necklacePos.width,
              height: necklacePos.height,
              pointerEvents: "none",
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

export default WebcamWithOverlayNecklace;
