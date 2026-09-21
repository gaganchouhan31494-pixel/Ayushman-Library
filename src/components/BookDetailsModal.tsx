import React from "react";
import { Book } from "../types";
import { X, BookOpen, Star, Clock, FileText, Play } from "lucide-react";

interface BookDetailsModalProps {
  book: Book | null;
  onClose: () => void;
  onOpenReader: (book: Book) => void;
  onToggleFavorite: (bookId: string) => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ book, onClose, onOpenReader, onToggleFavorite }) => {
  if (!book) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        width: "100%",
        maxWidth: "600px",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        border: "1px solid #ccfbf1",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}
        >
          <X size={20} color="#374151" />
        </button>

        <div style={{ height: "220px", backgroundColor: "#f0fdfa", position: "relative" }}>
          <img
            src={book.thumbnail || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80"}
            alt={book.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute",
            bottom: "16px",
            left: "20px",
            background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)",
            color: "#ffffff",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase"
          }}>
            {book.category}
          </div>
        </div>

        <div style={{ padding: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", margin: 0, lineHeight: "1.3" }}>
              {book.title}
            </h2>
            <button
              onClick={() => onToggleFavorite(book.id)}
              style={{ background: "#f0fdfa", border: "1px solid #5eead4", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <Star size={20} color={book.isFavorite ? "#0d9488" : "#9ca3af"} fill={book.isFavorite ? "#0d9488" : "none"} />
            </button>
          </div>

          <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 20px 0" }}>
            Original file: {book.originalFilename} • Uploaded on {new Date(book.uploadDate).toLocaleDateString()}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px", backgroundColor: "#f0fdfa", padding: "16px", borderRadius: "16px", border: "1px solid rgba(13, 148, 136, 0.15)" }}>
            <div>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0", fontWeight: "600" }}>TOTAL PAGES</p>
              <p style={{ fontSize: "16px", fontWeight: "800", color: "#111827", margin: 0 }}>{book.pageCount}</p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0", fontWeight: "600" }}>CURRENT PAGE</p>
              <p style={{ fontSize: "16px", fontWeight: "800", color: "#111827", margin: 0 }}>{book.currentPage || 1}</p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0", fontWeight: "600" }}>PROGRESS</p>
              <p style={{ fontSize: "16px", fontWeight: "800", color: "#0d9488", margin: 0 }}>{book.readingProgress}%</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => { onClose(); onOpenReader(book); }}
              style={{
                flex: 1,
                padding: "14px",
                background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)",
                color: "#ffffff",
                borderRadius: "14px",
                fontWeight: "700",
                fontSize: "15px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 6px 20px rgba(13, 148, 136, 0.3)"
              }}
            >
              <Play size={18} /> Start / Resume Reading
            </button>
            <button
              onClick={onClose}
              style={{
                padding: "14px 20px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                borderRadius: "14px",
                fontWeight: "650",
                fontSize: "15px",
                border: "none",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
