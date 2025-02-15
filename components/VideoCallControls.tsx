"use client";

import React, { useState } from "react";
import { usePeer } from "@/contexts/PeerContext";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VideoCallControls() {
  const { endCall, localStream } = usePeer();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  return (
    <div className="flex gap-4 bg-gray-900 p-4 rounded-xl shadow-lg">
      <Button onClick={toggleMic} variant={isMicOn ? "default" : "destructive"}>
        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
      </Button>
      <Button onClick={toggleCamera} variant={isCameraOn ? "default" : "destructive"}>
        {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
      </Button>
      <Button onClick={endCall} variant="destructive">
        <PhoneOff size={20} />
      </Button>
    </div>
  );
}
