"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { usePeer } from "@/contexts/PeerContext";
import { Button } from "@/components/ui/button";
import { VideoCallControls } from "@/components/VideoCallControls";

export function VideoCallComponent() {
  const { remoteStream, localStream, mediaConnection, startCall, connectedPeerId, isCallActive } = usePeer();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

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

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Video Call</h2>

      {/* Video Container */}
      <div className="relative w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 aspect-video bg-black rounded-xl overflow-hidden shadow-xl border border-gray-700">
        {/* Remote Video */}
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

        {/* Floating Local Video */}
        {localStream && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute border-2 border-white shadow-lg rounded-lg 
                       bottom-2 right-2 w-1/4 sm:w-1/5 md:w-1/6 lg:w-1/5 xl:w-1/6"
          />
        )}
      </div>

      {/* Show Start Call button only if no active call */}
      {!isCallActive ? (
        <Button
          onClick={initiateCall}
          className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white shadow-lg transition-transform transform hover:scale-105"
        >
          Start Call
        </Button>
      ) : (
        <VideoCallControls />
      )}
    </div>
  );
}

export default VideoCallComponent;
