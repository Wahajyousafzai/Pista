"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { usePeer } from "@/contexts/PeerContext"
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function VideoCallControls() {
  const { endCall, localStream } = usePeer()
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

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-8 md:bottom-1 
                  bg-black/20 backdrop-blur-xl border border-white/20
                  p-2 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)]"
      >
        <div className="flex items-center gap-2">
          {/* Primary Controls */}
          <div className="flex items-center gap-2 px-4">
            <ControlButton
              onClick={toggleMic}
              isOn={isMicOn}
              icon={isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
              tooltip={isMicOn ? "Mute" : "Unmute"}
            />
            <ControlButton
              onClick={toggleCamera}
              isOn={isCameraOn}
              icon={isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
              tooltip={isCameraOn ? "Stop Video" : "Start Video"}
            />
            <ControlButton
              onClick={endCall}
              isOn={false}
              icon={<PhoneOff size={24} />}
              tooltip="End Call"
              variant="destructive"
            />
          </div>

          {/* Separator */}
          <div className="w-px h-8 bg-white/20" />

          {/* Secondary Controls */}
          <div className="flex items-center gap-2 px-4">
            <ControlButton onClick={() => {}} isOn={true} icon={<MessageSquare size={24} />} tooltip="Chat" />
            <ControlButton onClick={() => {}} isOn={true} icon={<Users size={24} />} tooltip="Participants" />
            <ControlButton onClick={() => {}} isOn={true} icon={<Share size={24} />} tooltip="Share Screen" />
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}

interface ControlButtonProps {
  onClick: () => void
  isOn: boolean
  icon: React.ReactNode
  tooltip: string
  variant?: "default" | "destructive"
}

function ControlButton({ onClick, isOn, icon, tooltip, variant = "default" }: ControlButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onClick}
            variant="ghost"
            size="icon"
            className={`
              w-12 h-12 rounded-full transition-all duration-300
              ${
                variant === "destructive"
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                  : isOn
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-white/5 hover:bg-white/10 text-white/70"
              }
            `}
          >
            {icon}
          </Button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-black/80 text-white border-white/20 px-3 py-1.5 rounded-lg">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

