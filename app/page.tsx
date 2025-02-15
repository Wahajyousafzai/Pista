"use client";

import React, { useState, useEffect } from "react";
import { usePeer } from "@/contexts/PeerContext";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Link, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { peerId, isConnected, connectedPeerId, connectToPeer, disconnectPeer } = usePeer();
  const [recipientId, setRecipientId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    console.log("Home page - Connection state:", { isConnected, connectedPeerId });
  }, [isConnected, connectedPeerId]);

  const copyPeerId = () => {
    navigator.clipboard.writeText(peerId);
    toast({ title: "Peer ID Copied", description: "Your Peer ID has been copied to the clipboard." });
  };

  const handleConnect = () => {
    if (recipientId.trim()) {
      connectToPeer(recipientId.trim());
    } else {
      toast({ title: "Invalid Peer ID", description: "Please enter a valid Peer ID to connect.", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-center">P2P File Sharing & Video Call</h2>
        <div className="text-center my-4">
          <p>Your Peer ID:</p>
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono text-sm">{peerId}</div>
          <Button onClick={copyPeerId} variant="outline" className="mt-2"><Copy className="mr-2" /> Copy ID</Button>
        </div>
        <div className="my-4">
          <Input value={recipientId} onChange={(e) => setRecipientId(e.target.value)} placeholder="Enter recipient's Peer ID" />
          <Button onClick={handleConnect} className="w-full mt-3"> <Link className="mr-2" /> Connect</Button>
        </div>
        {isConnected && (
          <Button onClick={disconnectPeer} variant="destructive" className="w-full mt-3"> <UserMinus className="mr-2" /> Disconnect</Button>
        )}
      </div>
    </div>
  );
}
