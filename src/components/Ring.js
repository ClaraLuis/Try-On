import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
// import bracelet from "./bracelet.png";

function Ring(props) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  // const [braceletImage, setBraceletImage] = useState(null);

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const hand = await net.estimateHands(video);
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, videoWidth, videoHeight);

      if (hand.length > 0) {
        // Detect landmarks for the ring finger (index 16 is the 4th finger tip)
        const landmarks = hand[0].landmarks;
        const ringFingerTip = landmarks[17];

        const x = ringFingerTip[0];
        const y = ringFingerTip[1];
        const thumbTip = landmarks[4];
        const pinkyTip = landmarks[20];

        // Determine hand side
        const handSide = thumbTip[0] > pinkyTip[0] ? "left" : "right";
        // Calculate bracelet size and position
        const boundingBox = hand[0].boundingBox;
        const boxWidth = boundingBox.bottomRight[0] - boundingBox.topLeft[0];
        const braceletSize = boxWidth * 0.08;

        const adjustedX =
          handSide === "left" ? x - braceletSize * 0.1 : x - braceletSize * 0.9;
        const adjustedY = y - braceletSize * 1.5;

        const img = new Image();
        img.src = props?.selectedImg;

        // Handle image load success
        // img.onload = () => setBraceletImage(img);

        // Handle image load error
        img.onerror = (error) => {
          console.error("Error loading image:", error);
          // setBraceletImage(null);
        };

        if (img) {
          ctx.save();
          var flipAdjustedX = adjustedX;
          if (handSide === "right") {
            ctx.save();

            ctx.scale(-1, 1);

            flipAdjustedX = -(adjustedX + braceletSize);
          }
          ctx.drawImage(
            img,
            flipAdjustedX,
            adjustedY,
            braceletSize,
            braceletSize
          );
          ctx.restore();
        }
      }
    }
  };

  useEffect(() => {
    runHandpose();

    // Load the bracelet image
  }, []);

  return (
    <div style={{ position: "absolute" }}>
      <Webcam audio={false} ref={webcamRef} style={{ position: "relative" }} />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

export default Ring;
