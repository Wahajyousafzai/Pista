"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { usePeer } from "@/contexts/PeerContext"
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VideoCallControls() {
  const { endCall, localStream, isCallActive } = usePeer()
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMicOn(audioTrack.enabled)
      }
    }
  }

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsCameraOn(videoTrack.enabled)
      }
    }
  }

  if (!isCallActive) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 
                bg-white/10 backdrop-blur-xl border border-white/20
                px-6 py-4 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.2)]"
    >
      <div className="flex items-center gap-4">
        {/* Mic Control */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={toggleMic}
            className={`relative w-16 h-16 rounded-full transition-colors duration-200
                      ${
                        isMicOn
                          ? "bg-white/20 hover:bg-white/30 text-white"
                          : "bg-red-500/20 hover:bg-red-500/30 text-red-500"
                      }`}
          >
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/70">
              {isMicOn ? "Mute" : "Unmute"}
            </span>
          </Button>
        </motion.div>

        {/* Camera Control */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={toggleCamera}
            className={`relative w-16 h-16 rounded-full transition-colors duration-200
                      ${
                        isCameraOn
                          ? "bg-white/20 hover:bg-white/30 text-white"
                          : "bg-red-500/20 hover:bg-red-500/30 text-red-500"
                      }`}
          >
            {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/70">
              {isCameraOn ? "Stop" : "Start"}
            </span>
          </Button>
        </motion.div>

        {/* End Call */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={endCall}
            className="relative w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 
                     transition-colors duration-200"
          >
            <PhoneOff size={24} className="text-white" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/70">End</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

