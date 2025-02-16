"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Navigate() {
  const [isVisible, setIsVisible] = useState(true);
  let timeoutId: NodeJS.Timeout | null = null;

  useEffect(() => {
    const showNavbar = () => {
      setIsVisible(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsVisible(false), 3000);
    };

    // Show navbar when user interacts (mouse move or touch)
    window.addEventListener("mousemove", showNavbar);
    window.addEventListener("touchstart", showNavbar);

    // Hide after 3 seconds of inactivity
    timeoutId = setTimeout(() => setIsVisible(false), 3000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("mousemove", showNavbar);
      window.removeEventListener("touchstart", showNavbar);
    };
  }, []);

  return (
    <nav
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-6
                  bg-gray-100 backdrop-blur-lg shadow-lg p-2 px-3 rounded-full 
                  border border-gray-300 transition-all duration-500 ease-in-out
                  ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
    >
      <NavItem href="/" src="/home.svg" alt="Home" />
      <NavItem href="/sharefiles" src="/share.svg" alt="Share Files" />
      <NavItem href="/videocall" src="/videocall.svg" alt="Video Call" />
    </nav>
  );
}

function NavItem({ href, src, alt }: { href: string; src: string; alt: string }) {
  return (
    <Link
      href={href}
      className="p-3 rounded-full transition-all hover:bg-gray-300 active:scale-90"
    >
      <img src={src} alt={alt} className="w-7 h-7" />
    </Link>
  );
}
