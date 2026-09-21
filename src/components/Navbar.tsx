import React, { useState } from "react";
import { User, ActiveTab } from "../types";
import { BookOpen, Search, LayoutDashboard, Library, FileText, Bookmark, Clock, Shield, User as UserIcon, Settings, LogOut, Menu, X, Upload, Star } from "lucide-react";
import { InstallPrompt } from "./InstallPrompt";

interface NavbarProps {
  user: User;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Navbar({
  user,
  activeTab,
  setActiveTab,
  onOpenUpload,
  onLogout,
  searchQuery,
  setSearchQuery
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "library", label: "My Books", icon: Library },
    { id: "notes", label: "My Notes", icon: FileText },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
    { id: "activity", label: "Login History", icon: Shield },
    { id: "profile", label: "Profile", icon: UserIcon }
  ];

  return (
    <>
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)"
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
          height: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px"
        }}>
          {/* Brand Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <button
              onClick={() => setActiveTab("dashboard")}
              style={{
                background: "none",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                textAlign: "left",
                padding: 0
              }}
            >
              <div style={{
                width: "38px",
                height: "38px",
                background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)",
                color: "#ffffff",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(13, 148, 136, 0.3)",
                flexShrink: 0
              }}>
                <BookOpen size={20} />
              </div>
              <div className="navbar-brand-text">
                <span style={{ fontSize: "15px", fontWeight: "800", color: "#111827", letterSpacing: "-0.5px", display: "block", lineHeight: "1.2" }}>आयुष्मान लाइब्रेरी</span>
                <span style={{ fontSize: "9px", fontWeight: "700", background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textTransform: "uppercase", letterSpacing: "0.8px" }}>Ayushman Library</span>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="nav-search-container" style={{ display: "flex", flex: 1, maxWidth: "340px", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "12px", color: "#6b7280" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, notes..."
              style={{
                width: "100%",
                padding: "9px 14px 9px 38px",
                backgroundColor: "rgba(248, 250, 252, 0.9)",
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                fontSize: "13px",
                color: "#1e293b",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => { e.target.style.borderColor = "#0d9488"; e.target.style.backgroundColor = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(13, 148, 136, 0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.backgroundColor = "rgba(248, 250, 252, 0.9)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Desktop Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }} className="desktop-nav">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: isActive ? "700" : "500",
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: isActive ? "rgba(13, 148, 136, 0.1)" : "transparent",
                    color: isActive ? "#0d9488" : "#475569",
                    transition: "all 0.2s"
                  }}
                >
                  <Icon size={16} color={isActive ? "#0d9488" : "#64748b"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <InstallPrompt />
            {user.role === "Owner" && (
              <button
                onClick={onOpenUpload}
                className="upload-btn-desktop"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 16px",
                  background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "13px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(13, 148, 136, 0.3)",
                  whiteSpace: "nowrap"
                }}
              >
                <Upload size={16} />
                <span>Upload PDF</span>
              </button>
            )}

            {/* Profile Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #e0f2fe 0%, #ccfbf1 100%)",
                  color: "#0f766e",
                  border: "1px solid rgba(13, 148, 136, 0.3)",
                  fontSize: "14px",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                }}
              >
                {user.username ? user.username.charAt(0).toUpperCase() : "A"}
              </button>

              {profileDropdownOpen && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: "48px",
                  width: "220px",
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  backdropFilter: "blur(16px)",
                  borderRadius: "16px",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
                  border: "1px solid #e2e8f0",
                  padding: "8px",
                  zIndex: 100
                }}>
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", marginBottom: "6px" }}>
                    <p style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", margin: "0 0 2px" }}>{user.name}</p>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>@{user.username} • {user.role === "Owner" ? "Manager" : "Student Reader"}</p>
                  </div>
                  <button
                    onClick={() => { setActiveTab("profile"); setProfileDropdownOpen(false); }}
                    style={{ width: "100%", padding: "10px 12px", textAlign: "left", background: "none", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "650", color: "#334155", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <UserIcon size={16} /> Profile & Security
                  </button>
                  <button
                    onClick={() => { setActiveTab("activity"); setProfileDropdownOpen(false); }}
                    style={{ width: "100%", padding: "10px 12px", textAlign: "left", background: "none", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "650", color: "#334155", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <Shield size={16} /> Login History
                  </button>
                  <div style={{ borderTop: "1px solid #f1f5f9", margin: "6px 0" }} />
                  <button
                    onClick={() => { onLogout(); setProfileDropdownOpen(false); }}
                    style={{ width: "100%", padding: "10px 12px", textAlign: "left", background: "none", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <LogOut size={16} /> Logout System
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: "none",
                padding: "8px",
                backgroundColor: "rgba(13, 148, 136, 0.1)",
                border: "1px solid rgba(13, 148, 136, 0.3)",
                borderRadius: "10px",
                cursor: "pointer",
                color: "#0d9488"
              }}
              className="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid #e2e8f0",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }} className="mobile-drawer">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as ActiveTab); setMobileMenuOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: isActive ? "700" : "500",
                    backgroundColor: isActive ? "rgba(13, 148, 136, 0.1)" : "transparent",
                    color: isActive ? "#0d9488" : "#334155",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <Icon size={18} color={isActive ? "#0d9488" : "#64748b"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            {user.role === "Owner" && (
              <button
                onClick={() => { onOpenUpload(); setMobileMenuOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)",
                  color: "#ffffff",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "8px",
                  boxShadow: "0 4px 15px rgba(13, 148, 136, 0.3)"
                }}
              >
                <Upload size={18} /> Upload PDF
              </button>
            )}
          </div>
        )}
      </header>

      {/* Floating Bottom Navigation Bar for Mobile */}
      <div className="mobile-bottom-nav" style={{
        display: "none",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid #e2e8f0",
        boxShadow: "0 -10px 30px rgba(0, 0, 0, 0.08)",
        padding: "8px 12px",
        justifyContent: "space-around",
        alignItems: "center"
      }}>
        {[
          { id: "dashboard", label: "Home", icon: LayoutDashboard },
          { id: "library", label: "Books", icon: Library },
          { id: "notes", label: "Notes", icon: FileText },
          { id: "bookmarks", label: "Marks", icon: Bookmark },
          { id: "profile", label: "Profile", icon: UserIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              style={{
                background: "none",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
                padding: "6px 10px",
                borderRadius: "10px",
                cursor: "pointer",
                color: isActive ? "#0d9488" : "#64748b"
              }}
            >
              <Icon size={20} color={isActive ? "#0d9488" : "#64748b"} />
              <span style={{ fontSize: "11px", fontWeight: isActive ? "700" : "500" }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
