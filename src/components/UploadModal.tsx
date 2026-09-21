import React, { useState } from "react";
import { User, Book } from "../types";
import { X, Upload as UploadIcon, BookOpen, FileText, Image as ImageIcon, ArrowRight, ArrowLeft } from "lucide-react";

interface UploadModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (book: Book) => void;
}

export function UploadModal({ user, isOpen, onClose, onUploaded }: UploadModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Computer Science");
  const [tagsInput, setTagsInput] = useState("Algorithms, Programming");
  const [fileType, setFileType] = useState<"book" | "document" | "notes" | "ebook">("book");
  const [pageCount, setPageCount] = useState("50");
  
  const [frontCover, setFrontCover] = useState<File | null>(null);
  const [backCover, setBackCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      if (!title) {
        setTitle(f.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id);
      formData.append("title", title || file.name);
      formData.append("author", author || "Unknown Author");
      formData.append("category", category);
      formData.append("fileType", fileType);
      formData.append("pageCount", pageCount);
      
      const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
      formData.append("tags", JSON.stringify(tags));

      if (frontCover) {
        formData.append("frontCover", frontCover);
      }
      if (backCover) {
        formData.append("backCover", backCover);
      }

      const res = await fetch("/api/books/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onUploaded(data);
      onClose();
      // Reset
      setStep(1);
      setFile(null);
      setTitle("");
      setAuthor("");
      setFrontCover(null);
      setBackCover(null);
    } catch (err: any) {
      setError(err.message || "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        width: "100%",
        maxWidth: "580px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        border: "1px solid #e5e7eb"
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 30px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
              {step === 1 ? "Upload PDF to Library" : "Configure Book Covers & Type"}
            </h2>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
              {step === 1 ? "Step 1 of 2: Select PDF and enter metadata" : "Step 2 of 2: Optional covers and format"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              padding: "4px",
              borderRadius: "8px"
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); if (file) setStep(2); else setError("Please select a PDF file"); } : handleSubmit}>
          <div style={{ padding: "30px" }}>
            {error && (
              <div style={{ backgroundColor: "#f0fdfa", border: "1px solid #5eead4", color: "#0d9488", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "20px", fontWeight: "650" }}>
                {error}
              </div>
            )}

            {step === 1 ? (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                    PDF Document File *
                  </label>
                  <label style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "32px",
                    border: "2px dashed #d1d5db",
                    borderRadius: "14px",
                    backgroundColor: "#f9fafb",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s"
                  }}>
                    <UploadIcon size={32} color="#0d9488" style={{ marginBottom: "12px" }} />
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                      {file ? file.name : "Click to browse or drop PDF here"}
                    </span>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Supports PDF documents up to 50MB</span>
                    <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: "none" }} />
                  </label>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Book / Document Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Advanced System Design 2026"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Author</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g., John Doe"
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "14px", backgroundColor: "#fff", outline: "none" }}
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Design">Design</option>
                      <option value="Finance">Finance</option>
                      <option value="Physics & Tech">Physics & Tech</option>
                      <option value="Productivity">Productivity</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. AI, Architecture, Notes"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                    Publication Format / Type
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                    {[
                      { id: "book", label: "Book (Covers)", icon: BookOpen },
                      { id: "document", label: "Document", icon: FileText },
                      { id: "notes", label: "Notes PDF", icon: FileText }
                    ].map((t) => {
                      const Icon = t.icon;
                      const selected = fileType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFileType(t.id as any)}
                          style={{
                            padding: "16px 12px",
                            backgroundColor: selected ? "#fef2f2" : "#f9fafb",
                            border: `2px solid ${selected ? "#dc2626" : "#e5e7eb"}`,
                            borderRadius: "12px",
                            cursor: "pointer",
                            textAlign: "center",
                            color: selected ? "#dc2626" : "#4b5563",
                            fontWeight: "600",
                            fontSize: "13px"
                          }}
                        >
                          <Icon size={20} style={{ margin: "0 auto 8px", display: "block" }} />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {fileType === "book" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                        Front Cover Image
                      </label>
                      <label style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        border: "1px dashed #d1d5db",
                        borderRadius: "10px",
                        backgroundColor: "#f9fafb",
                        cursor: "pointer",
                        textAlign: "center"
                      }}>
                        <ImageIcon size={20} color="#9ca3af" style={{ marginBottom: "6px" }} />
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>
                          {frontCover ? frontCover.name : "Select Front Cover"}
                        </span>
                        <input type="file" accept="image/*" onChange={(e) => e.target.files && setFrontCover(e.target.files[0])} style={{ display: "none" }} />
                      </label>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                        Back Cover Image
                      </label>
                      <label style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        border: "1px dashed #d1d5db",
                        borderRadius: "10px",
                        backgroundColor: "#f9fafb",
                        cursor: "pointer",
                        textAlign: "center"
                      }}>
                        <ImageIcon size={20} color="#9ca3af" style={{ marginBottom: "6px" }} />
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>
                          {backCover ? backCover.name : "Select Back Cover"}
                        </span>
                        <input type="file" accept="image/*" onChange={(e) => e.target.files && setBackCover(e.target.files[0])} style={{ display: "none" }} />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", borderTop: "1px solid #f3f4f6", paddingTop: "20px" }}>
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#f3f4f6",
                    color: "#4b5563",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : <div />}

              {step === 1 ? (
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 15px rgba(13, 148, 136, 0.25)"
                  }}
                >
                  Next: Covers & Type <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 6px 20px rgba(13, 148, 136, 0.3)"
                  }}
                >
                  {loading ? "Uploading to Library..." : "Upload & Save Book"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
