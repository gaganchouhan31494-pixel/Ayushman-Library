import React, { useState } from "react";
import { Book } from "../types";
import { X, Edit3 } from "lucide-react";

interface RenameModalProps {
  book: Book | null;
  onClose: () => void;
  onRename: (bookId: string, newTitle: string) => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({ book, onClose, onRename }) => {
  const [title, setTitle] = useState(book?.title || "");

  if (!book) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onRename(book.id, title);
    onClose();
  };

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
        maxWidth: "420px",
        padding: "30px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        border: "1px solid #fee2e2",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1f1f1f", margin: "0 0 8px 0" }}>Rename Document</h2>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 20px 0" }}>Enter a new title for this book.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1px solid #fca5a5", fontSize: "14px", outline: "none" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "10px 18px", backgroundColor: "#f3f4f6", color: "#374151", borderRadius: "10px", fontWeight: "600", border: "none", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: "10px 22px", backgroundColor: "#dc2626", color: "#ffffff", borderRadius: "10px", fontWeight: "600", border: "none", cursor: "pointer" }}
            >
              Save Title
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
