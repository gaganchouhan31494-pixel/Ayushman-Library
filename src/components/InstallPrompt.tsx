import React, { useEffect, useState } from "react";
import { Download, Smartphone, X, CheckCircle, HelpCircle } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const appInstalledHandler = () => {
      setIsInstalled(true);
      setShowModal(false);
    };
    window.addEventListener("appinstalled", appInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
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
          boxShadow: "0 2px 8px rgba(13, 148, 136, 0.25)",
          transition: "background 0.2s"
        }}
        title="Install Ayushman Library App"
      >
        <Download size={14} /> Install App
      </button>

      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            maxWidth: "480px",
            width: "100%",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            position: "relative",
            animation: "fadeIn 0.2s ease-out"
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280"
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#f0fdfa",
                color: "#0d9488",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Smartphone size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: 0 }}>Install Ayushman Library</h3>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0" }}>App ko apne phone ya PC par install karein</p>
              </div>
            </div>

            <div style={{ fontSize: "14px", color: "#374151", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <strong style={{ color: "#0d9488", display: "block", marginBottom: "4px" }}>📱 Android / Chrome (Mobile):</strong>
                1. Browser menu (3 dots) par click karein.<br />
                2. <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> select karein.
              </div>

              <div style={{ padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <strong style={{ color: "#0d9488", display: "block", marginBottom: "4px" }}>🍏 iPhone / iPad (Safari):</strong>
                1. Safari ke bottom menu me <strong>Share button (box with arrow)</strong> par tap karein.<br />
                2. Scroll down karke <strong>"Add to Home Screen"</strong> par tap karein.
              </div>

              <div style={{ padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <strong style={{ color: "#0d9488", display: "block", marginBottom: "4px" }}>💻 PC / Laptop (Chrome / Edge):</strong>
                1. Address bar ke right side me <strong>Install icon</strong> (computer with arrow) par click karein.<br />
                2. Ya browser menu se <strong>"Install Ayushman Library..."</strong> choose karein.
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: "#0d9488",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Got It / Samajh aa gaya
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
