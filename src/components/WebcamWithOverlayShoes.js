import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs";

const WebcamWithOverlayShoes = (props) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [leftShoePos, setLeftShoePos] = useState(null);
  const [rightShoePos, setRightShoePos] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const net = await posenet.load();
        setModel(net);
        console.log("PoseNet model loaded");
      } catch (error) {
        console.error("Error loading PoseNet model:", error);
      }
    };

    loadModel();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const shoeImage = new Image();
    shoeImage.src = props?.selectedImg;

    shoeImage.onload = () => {
      console.log("Shoe image loaded");
    };

    const draw = async () => {
      const video = webcamRef.current.video;
      if (video.readyState === 4 && model) {
        // Set video width and height programmatically
        video.width = 500;
        video.height = 500;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const pose = await model.estimateSinglePose(video, {
          flipHorizontal: false,
        });

        const keypoints = pose.keypoints;

        // Find the keypoints for the feet
        const leftAnkle = keypoints.find(
          (keypoint) => keypoint.part === "leftAnkle"
        );
        const rightAnkle = keypoints.find(
          (keypoint) => keypoint.part === "rightAnkle"
        );

        setRightShoePos(null);
        setLeftShoePos(null);
        const shoeWidth = video.videoWidth * 0.3; // Adjust as needed
        const shoeHeight = shoeWidth * 1.5; // Adjust as needed
        if (leftAnkle && leftAnkle.score > 0.5) {
          const leftShoeX = leftAnkle.position.x - shoeWidth / 2;
          const leftShoeY = leftAnkle.position.y - shoeHeight / 2; // Adjust to place the shoe below the foot

          setLeftShoePos({
            y: leftShoeY,
            x: leftShoeX,
            width: shoeWidth,
            height: shoeHeight,
          });
        }

        if (rightAnkle && rightAnkle.score > 0.5) {
          // Right shoe position
          const rightShoeX = rightAnkle.position.x - shoeWidth / 2;
          const rightShoeY = rightAnkle.position.y - shoeHeight / 2; // Adjust to place the shoe below the foot

          setRightShoePos({
            y: rightShoeY,
            x: rightShoeX,
            width: shoeWidth,
            height: shoeHeight,
          });
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(draw);
    };

    if (model) {
      draw();
    }
  }, [model]);

  return (
    <div style={{ position: "relative" }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        onUserMedia={() => console.log("Webcam stream is available")}
        style={{ position: "relative" }}
      />
      {leftShoePos && (
        <img
          src={props?.selectedImg}
          alt="Left Shoe"
          style={{
            position: "absolute",
            top: leftShoePos.y,
            left: leftShoePos.x,
            width: leftShoePos.width,
            height: leftShoePos.height,
            pointerEvents: "none",
            transition: "all 0.4s",
            objectFit: "contain",
          }}
        />
      )}
      {rightShoePos && (
        <img
          src={props?.selectedImg}
          alt="Right Shoe"
          style={{
            position: "absolute",
            top: rightShoePos.y,
            left: rightShoePos.x,
            width: rightShoePos.width,
            height: rightShoePos.height,
            pointerEvents: "none",
            transition: "all 0.4s",
            objectFit: "contain",
          }}
        />
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default WebcamWithOverlayShoes;
