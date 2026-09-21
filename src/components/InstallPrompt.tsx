import React, { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstallBtn) return null;

  return (
    <button
      onClick={handleInstall}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: "#0d9488",
        color: "#ffffff",
        border: "none",
        padding: "6px 12px",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(13, 148, 136, 0.25)"
      }}
      title="Install PWA App"
    >
      <Download size={14} /> Install App
    </button>
  );
}
