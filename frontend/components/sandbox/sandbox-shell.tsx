"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_SANDBOX_HREF,
  findSandboxScreen,
} from "@/lib/sandbox-screens";
import { DevicePreview } from "@/components/sandbox/device-preview";
import { SandboxSidebar } from "@/components/sandbox/sandbox-sidebar";
import { subscribeToSandboxNavigation } from "@/components/sandbox/sandbox-bridge";

const SIDEBAR_STORAGE_KEY = "sidequest-sandbox-nav";

export const SandboxShell = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [activePath, setActivePath] = useState(DEFAULT_SANDBOX_HREF);
  const [iframeSrc] = useState(DEFAULT_SANDBOX_HREF);

  const activeScreen = findSandboxScreen(activePath);

  const handleToggle = () => {
    setIsOpen((current) => {
      const next = !current;
      window.localStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        next ? "open" : "collapsed",
      );
      return next;
    });
  };

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("sandbox-studio");
    body.classList.add("sandbox-studio");
    return () => {
      html.classList.remove("sandbox-studio");
      body.classList.remove("sandbox-studio");
    };
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === "collapsed") setIsOpen(false);
  }, []);

  useEffect(() => {
    return subscribeToSandboxNavigation((pathname) => {
      setActivePath(pathname);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "[") {
        event.preventDefault();
        handleToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectScreen = (href: string) => {
    if (href.startsWith("/sandbox")) return;

    setActivePath(href);
    const frame = iframeRef.current;
    if (!frame) return;
    frame.src = new URL(href, window.location.origin).toString();
  };

  return (
    <div className="flex h-full w-full min-h-0 min-w-0 overflow-hidden bg-[#1E1A16]">
      <SandboxSidebar
        isOpen={isOpen}
        activeScreenId={activeScreen?.id ?? null}
        onToggle={handleToggle}
        onSelectScreen={handleSelectScreen}
      />
      <div className="flex min-h-0 min-w-0 flex-1 items-safe-center justify-safe-center overflow-auto p-8">
        <DevicePreview
          src={iframeSrc}
          iframeRef={iframeRef}
          label={activeScreen?.label ?? "Preview"}
          path={activePath}
        />
      </div>
    </div>
  );
};
