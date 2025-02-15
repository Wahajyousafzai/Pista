"use client";

import { useState, useEffect } from "react";
import { FloatingDock } from "./FloatingDock";
import { IconMessage, IconFolder, IconVideo, IconHome } from "@tabler/icons-react";

const navigationItems = [
  { title: "Home", icon: <IconHome className="h-full w-full" />, href: "/" },
  { title: "Chat", icon: <IconMessage className="h-full w-full" />, href: "/chat" },
  { title: "Files", icon: <IconFolder className="h-full w-full" />, href: "/sharefiles" },
  { title: "Video", icon: <IconVideo className="h-full w-full" />, href: "/videocall" },
];

export function Navigation(): React.ReactElement {
  const [isVisible, setIsVisible] = useState(true);
  let hideTimeout: number;
  let showTimeout: number;

  useEffect(() => {
    const hideNav = () => {
      hideTimeout = window.setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    hideNav(); // Start hiding timer when component mounts

    const showNav = () => {
      clearTimeout(hideTimeout);
      clearTimeout(showTimeout);
      setIsVisible(true);

      // Hide again after 3s of inactivity
      hideTimeout = window.setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    const handleUserInteraction = () => {
      clearTimeout(showTimeout);
      showTimeout = window.setTimeout(showNav, 500); // Delay appearance by 0.5s
    };

    document.addEventListener("mousemove", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("scroll", handleUserInteraction);

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(showTimeout);
      document.removeEventListener("mousemove", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("scroll", handleUserInteraction);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <FloatingDock items={navigationItems} />
    </div>
  );
}
