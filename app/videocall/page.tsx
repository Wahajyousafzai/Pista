"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePeer } from "@/contexts/PeerContext";
import { Button } from "@/components/ui/button";
import { VideoCallControls } from "@/components/VideoCallControls";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs";

const backgrounds = [
  { name: "Beach", src: "/backgrounds/beach.jpg" },
  { name: "City", src: "/backgrounds/city.jpg" },
  { name: "Mountains", src: "/backgrounds/mountains.jpg" },
  { name: "Office", src: "/backgrounds/office.jpg" },
];

export function VideoCallComponent() {
  const { remoteStream, localStream, startCall, connectedPeerId, isCallActive } = usePeer();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<bodyPix.BodyPix | null>(null);
  const [selectedBackground, setSelectedBackground] = useState(backgrounds[0].src);
  const [blurAmount, setBlurAmount] = useState(5);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await bodyPix.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (!model || !localStream) return;

    const processVideo = async () => {
      const video = localVideoRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!video || !ctx) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const bg = new Image();
      bg.src = selectedBackground;
      
      const segmentation = await model.segmentPerson(video, {
        internalResolution: "medium",
        segmentationThreshold: 0.7,
      });

      bg.onload = () => {
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixel = imageData.data;

        for (let i = 0; i < pixel.length; i += 4) {
          const j = i / 4;
          if (!segmentation.data[j]) {
            pixel[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        requestAnimationFrame(processVideo);
      };
    };

    processVideo();
  }, [model, selectedBackground, blurAmount, localStream]);

  const initiateCall = () => {
    if (connectedPeerId) {
      startCall(connectedPeerId);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full text-white px-4">
      <div className="relative w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 aspect-auto rounded-xl overflow-hidden shadow-xl border border-gray-500 bg-zinc-800">
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
      </div>
      
      <div className="py-3" />

      {!isCallActive ? (
        <Button
          onClick={initiateCall}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white shadow-lg transition-transform transform hover:scale-105"
        >
          Start Call
        </Button>
      ) : (
        <VideoCallControls />
      )}

      <div className="mt-4 flex flex-col items-center gap-3">
        <label htmlFor="background">Background:</label>
        <select
          id="background"
          value={selectedBackground}
          onChange={(e) => setSelectedBackground(e.target.value)}
          className="p-2 border rounded"
        >
          {backgrounds.map((bg) => (
            <option key={bg.name} value={bg.src}>{bg.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default VideoCallComponent;
