// Updated PeerContext.tsx to add startCall and startSegmentation

"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Peer, { DataConnection, MediaConnection } from "peerjs";
import { useToast } from "@/components/ui/use-toast";
import * as bodyPix from "@tensorflow-models/body-pix";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgpu";

interface PeerContextType {
  peerId: string;
  isConnected: boolean;
  connectedPeerId: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connection: DataConnection | null;
  mediaConnection: MediaConnection | null;
  isCallActive: boolean;
  segmentationEnabled: boolean;
  selectedBackground: string;
  sendData: (data: any) => void;
  connectToPeer: (recipientId: string) => void;
  disconnectPeer: () => void;
  startCall: (recipientId: string) => void;
  endCall: () => void;
  toggleSegmentation: () => void;
  updateBackground: (background: string) => void;
}

const PeerContext = createContext<PeerContextType | undefined>(undefined);

export function PeerProvider({ children }: { children: React.ReactNode }) {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string>("");
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [mediaConnection, setMediaConnection] = useState<MediaConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPeerId, setConnectedPeerId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [segmentationEnabled, setSegmentationEnabled] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState("Beach");
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const modelRef = useRef<bodyPix.BodyPix | null>(null);

  const { toast } = useToast();


  useEffect(() => {
    const newPeer = new Peer();
    newPeer.on("open", (id) => {
      setPeerId(id);
      setPeer(newPeer);
      toast({ title: "Peer Created", description: `Your peer ID is: ${id}` });
    });

    newPeer.on("call", async (call) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (segmentationEnabled) {
          await startSegmentation(stream);
        } else {
          setLocalStream(stream);
        }
        call.answer(localStream || stream);
        call.on("stream", (remoteStream) => setRemoteStream(remoteStream));
        call.on("close", () => {
          setRemoteStream(null);
          setMediaConnection(null);
          setIsCallActive(false);
        });
        setMediaConnection(call);
        setIsCallActive(true);
        setConnectedPeerId(call.peer);
      } catch (error) {
        toast({ title: "Media Error", description: (error as Error).message, variant: "destructive" });
      }
    });

    const loadModel = async () => {
      await tf.setBackend("webgpu");
      await tf.ready();
      modelRef.current = await bodyPix.load();
    };

    loadModel();

    return () => newPeer.destroy();
  }, [segmentationEnabled]);

  const setupVideoElement = (stream: MediaStream, videoElement: HTMLVideoElement) => {
    return new Promise<void>((resolve) => {
      videoElement.srcObject = stream;
      videoElement.onloadeddata = () => resolve();
      videoElement.play().catch(() => console.log("Video play error"));
    });
  };

  const startSegmentation = async (stream: MediaStream) => {
    const video = document.createElement("video");
    await setupVideoElement(stream, video);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const processVideo = async () => {
      if (!segmentationEnabled || !modelRef.current) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const segmentation = await modelRef.current.segmentPerson(video, {
        internalResolution: "medium",
        segmentationThreshold: 0.7,
      });

      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      if (imageData) {
        for (let i = 0; i < imageData.data.length; i += 4) {
          if (segmentation.data[i / 4] === 0) {
            imageData.data[i + 3] = 0;
          }
        }

        ctx?.putImageData(imageData, 0, 0);
      }

      requestAnimationFrame(processVideo);
    };

    processVideo();
    const segmentedStream = canvas.captureStream();
    setLocalStream(segmentedStream);
  };


  const startCall = async (recipientId: string) => {
    if (!peer) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (segmentationEnabled) {
        await startSegmentation(stream);
      } else {
        setLocalStream(stream);
      }

      const call = peer.call(recipientId, localStream || stream);
      call.on("stream", (remoteStream) => setRemoteStream(remoteStream));
      call.on("close", () => {
        setRemoteStream(null);
        setMediaConnection(null);
        setIsCallActive(false);
      });
      setMediaConnection(call);
      setIsCallActive(true);
      setConnectedPeerId(recipientId);
    } catch (error) {
      toast({ title: "Call Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const sendData = (data: any) => {
    connection?.send(data);
  };

  const connectToPeer = (recipientId: string) => {
    if (!peer) return;
    const conn = peer.connect(recipientId);
    setConnection(conn);
    conn.on("open", () => {
      setIsConnected(true);
      setConnectedPeerId(recipientId);
      toast({ title: "Connected", description: `Connected to peer: ${recipientId}` });
    });
    conn.on("close", () => {
      setConnection(null);
      setIsConnected(false);
      setConnectedPeerId(null);
    });
  };

  const disconnectPeer = () => {
    connection?.close();
    setConnection(null);
    setIsConnected(false);
    setConnectedPeerId(null);
    toast({ title: "Disconnected", description: "You have disconnected from the peer." });
  };

  const endCall = () => {
    mediaConnection?.close();
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    toast({ title: "Call Ended", description: "The call has been terminated" });
  };

  const toggleSegmentation = () => {
    setSegmentationEnabled((prev) => !prev);
    if (localStream) {
      startSegmentation(localStream);
    }
  };

  const updateBackground = (background: string) => {
    setSelectedBackground(background);
  };

  return (
    <PeerContext.Provider
      value={{
        peerId,
        isConnected,
        connectedPeerId,
        localStream,
        remoteStream,
        connection,
        mediaConnection,
        isCallActive,
        segmentationEnabled,
        selectedBackground,
        sendData,
        connectToPeer,
        disconnectPeer,
        startCall,
        endCall,
        toggleSegmentation,
        updateBackground,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
}

export function usePeer() {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error("usePeer must be used within a PeerProvider");
  }
  return context;
}
