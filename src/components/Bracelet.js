import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { CircularProgress } from "react-cssfx-loading";

function Bracelet(props) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(new Image());
  const [isLoading, setIsLoading] = useState(false);

  const runHandpose = async () => {
    setIsLoading(true);
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    setIsLoading(false);

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
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

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
        const ringFingerTip = landmarks[0];

        const x = ringFingerTip[0];
        const y = ringFingerTip[1];
        const thumbTip = landmarks[4];
        const pinkyTip = landmarks[20];

        // Determine hand side
        const handSide = thumbTip[0] > pinkyTip[0] ? "left" : "right";
        // Calculate bracelet size and position
        const boundingBox = hand[0].boundingBox;
        const boxWidth = boundingBox.bottomRight[0] - boundingBox.topLeft[0];
        const braceletSize = boxWidth * 0.2;

        const adjustedX =
          handSide === "left" ? x - braceletSize * 0.6 : x - braceletSize * 0.6;
        const adjustedY = y - braceletSize * 0.5;

        if (imgRef.current) {
          ctx.save();
          if (handSide === "right") {
            // ctx.scale(-1, 1);
            // ctx.translate(-canvasRef.current.width, 0);
          }

          ctx.drawImage(
            imgRef.current,
            adjustedX,
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
  }, []);

  useEffect(() => {
    imgRef.current.src = props?.selectedImg;
  }, [props?.selectedImg]);
  if (isLoading) {
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
}

export default Bracelet;
