"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePeer } from "@/contexts/PeerContext";
import { Button } from "@/components/ui/button";
import { VideoCallControls } from "@/components/VideoCallControls";

const backgrounds = [
  { name: "Beach", src: "/backgrounds/beach.jpg" },
  { name: "City", src: "/backgrounds/city.jpg" },
  { name: "Mountains", src: "/backgrounds/mountains.jpg" },
  { name: "Office", src: "/backgrounds/office.jpg" },
  { name: "Blur", src: "blur" },
];

export function VideoCallComponent() {
  const { remoteStream, localStream, startCall, connectedPeerId, isCallActive, toggleSegmentation, segmentationEnabled, updateBackground } = usePeer();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [selectedBackground, setSelectedBackground] = useState<string>(backgrounds[0].name);

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

  const initiateCall = () => {
    if (connectedPeerId) {
      startCall(connectedPeerId);
    }
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBackground = e.target.value;
    setSelectedBackground(newBackground);
    updateBackground(newBackground);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full text-white px-4">
      <div className="relative w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 aspect-auto rounded-xl overflow-hidden shadow-xl border border-gray-500 bg-zinc-800">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        {remoteStream && (
          <video ref={remoteVideoRef} autoPlay playsInline className="absolute top-2 right-2 w-1/4 h-1/4 rounded-lg border border-white shadow-lg" />
        )}
      </div>

      <div className="py-3" />

      {!isCallActive ? (
        <Button onClick={initiateCall} className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white shadow-lg transition-transform transform hover:scale-105">
          Start Call
        </Button>
      ) : (
        <VideoCallControls />
      )}

      <div className="mt-4 flex flex-col items-center gap-3">
        <label htmlFor="background">Background:</label>
        <select id="background" value={selectedBackground} onChange={handleBackgroundChange} className="p-2 border rounded">
          {backgrounds.map((bg) => (
            <option key={bg.name} value={bg.name}>{bg.name}</option>
          ))}
        </select>

        <div className="mt-4">
          <label htmlFor="segmentationToggle" className="flex items-center gap-2">
            <input id="segmentationToggle" type="checkbox" checked={segmentationEnabled} onChange={toggleSegmentation} />
            Enable Segmentation
          </label>
        </div>
      </div>
    </div>
  );
}

export default VideoCallComponent;
