"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const SANDBOX_MESSAGE_SOURCE = "sidequest-sandbox";

type SandboxNavigateMessage = {
  source: typeof SANDBOX_MESSAGE_SOURCE;
  pathname: string;
};

const isSandboxNavigateMessage = (
  data: unknown,
): data is SandboxNavigateMessage => {
  if (typeof data !== "object" || data === null) return false;

  const message = data as Record<string, unknown>;
  return (
    message.source === SANDBOX_MESSAGE_SOURCE &&
    typeof message.pathname === "string"
  );
};

export const SandboxBridge = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (window.parent === window) return;
    document.documentElement.classList.add("sandbox-preview");

    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      if (anchor.target !== "_top" && anchor.target !== "_parent") return;
      event.preventDefault();
      const href = anchor.getAttribute("href");
      if (href) window.location.assign(href);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.documentElement.classList.remove("sandbox-preview");
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    if (window.parent === window) return;

    const message: SandboxNavigateMessage = {
      source: SANDBOX_MESSAGE_SOURCE,
      pathname,
    };
    window.parent.postMessage(message, window.location.origin);
  }, [pathname]);

  return null;
};

export const subscribeToSandboxNavigation = (
  onNavigate: (pathname: string) => void,
) => {
  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (!isSandboxNavigateMessage(event.data)) return;
    onNavigate(event.data.pathname);
  };

  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
};
