import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { CircularProgress } from "react-cssfx-loading";

const WebcamWithEarrings = (props) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [leftEarringPos, setLeftEarringPos] = useState(null);
  const [rightEarringPos, setRightEarringPos] = useState(null);

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
      const draw = async () => {
        const video = webcamRef.current.video;
        if (video.readyState === 4 && modelsLoaded) {
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

          setLeftEarringPos(null);
          setRightEarringPos(null);

          if (detections.length > 0) {
            const { landmarks } = detections[0];
            const jawOutline = landmarks.getJawOutline();

            // Earring position and size
            const earringWidth = video.videoWidth * 0.028; // Adjust as needed
            const earringHeight = earringWidth * 1; // Adjust as needed

            // Left earring (landmark at jawOutline[0])
            const leftEarringX = jawOutline[0].x - earringWidth / 2;
            const leftEarringY = jawOutline[0].y + earringHeight * 2;
            //   alert(leftEarringY);
            setLeftEarringPos({
              y: leftEarringY,
              x: leftEarringX,
              width: earringWidth,
              height: earringHeight,
            });

            // Right earring (landmark at jawOutline[16])
            const rightEarringX = jawOutline[16].x - earringWidth / 2;
            const rightEarringY = jawOutline[16].y + earringHeight * 2;

            setRightEarringPos({
              y: rightEarringY,
              x: rightEarringX,
              width: earringWidth,
              height: earringHeight,
            });
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
        {leftEarringPos != null && (
          <img
            src={props?.selectedImg}
            alt="Left Earring"
            style={{
              position: "absolute",
              top: leftEarringPos.y,
              left: leftEarringPos.x,
              width: leftEarringPos.width,
              height: leftEarringPos.height,
              pointerEvents: "none",
              transition: "all 0.4s",
              objectFit: "contain",
            }}
          />
        )}
        {rightEarringPos != null && (
          <img
            src={props?.selectedImg}
            alt="Right Earring"
            style={{
              position: "absolute",
              top: rightEarringPos.y,
              left: rightEarringPos.x,
              width: rightEarringPos.width,
              height: rightEarringPos.height,
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

export default WebcamWithEarrings;
