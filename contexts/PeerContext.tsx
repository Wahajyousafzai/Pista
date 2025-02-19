"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import Peer, { DataConnection, MediaConnection } from "peerjs";
import { useToast } from "@/components/ui/use-toast";

interface PeerContextType {
  peerId: string;
  isConnected: boolean;
  connectedPeerId: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connection: DataConnection | null;
  mediaConnection: MediaConnection | null;
  isCallActive: boolean;
  sendData: (data: any) => void;
  connectToPeer: (recipientId: string) => void;
  disconnectPeer: () => void;
  startCall: (recipientId: string) => void;
  endCall: () => void;
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

  const { toast } = useToast();

  useEffect(() => {
    const newPeer = new Peer();
    newPeer.on("open", (id) => {
      setPeerId(id);
      setPeer(newPeer);
      toast({ title: "Peer Created", description: `Your peer ID is: ${id}` });
    });

    newPeer.on("connection", (conn) => {
      setConnection(conn);
      conn.on("open", () => {
        setIsConnected(true);
        setConnectedPeerId(conn.peer);
        toast({ title: "Connected", description: `Connected to peer: ${conn.peer}` });
      });
      conn.on("close", () => {
        setConnection(null);
        setIsConnected(false);
        setConnectedPeerId(null);
      });
    });

    newPeer.on("call", async (call) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        call.answer(stream);
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

    return () => newPeer.destroy();
  }, []);

  const startCall = async (recipientId: string) => {
    if (!peer) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      const call = peer.call(recipientId, stream);
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

  const endCall = () => {
    mediaConnection?.close();
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    toast({ title: "Call Ended", description: "The call has been terminated" });
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

  return (
    <PeerContext.Provider value={{ peerId, isConnected, connectedPeerId, localStream, remoteStream, connection, mediaConnection, isCallActive, sendData, connectToPeer, disconnectPeer, startCall, endCall }}>
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