import React, { useState } from "react";
import { Note, User } from "../types";
import { FileText, Plus, Trash2, Edit2, Calendar, Tag, Search } from "lucide-react";

interface NotesViewProps {
  notes: Note[];
  user: User;
  onNotesUpdated: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ notes, user, onNotesUpdated }) => {
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<Note> | null>(null);

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNote?.title || !currentNote?.content) return;

    try {
      if (currentNote.id) {
        // Update
        await fetch(`/api/notes/${currentNote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentNote)
        });
      } else {
        // Create
        await fetch(`/api/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            title: currentNote.title,
            content: currentNote.content,
            category: currentNote.category || "General",
            tags: currentNote.tags || ["Study"]
          })
        });
      }
      setIsEditing(false);
      setCurrentNote(null);
      onNotesUpdated();
    } catch (err) {
      console.error("Failed to save note", err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      onNotesUpdated();
    } catch (e) {
      console.error("Failed to delete note", e);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "30px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1f1f1f", margin: "0 0 6px 0" }}>Personal Study Notes</h1>
          <p style={{ fontSize: "15px", color: "#6b7280", margin: 0 }}>Record summaries, reflections, and key takeaways from your books.</p>
        </div>
        {user.role === "Owner" && (
          <button
            onClick={() => { setCurrentNote({ title: "", content: "", category: "Study", tags: ["Important"] }); setIsEditing(true); }}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "14px",
              borderRadius: "14px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(13, 148, 136, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Plus size={18} /> Create New Note
          </button>
        )}
      </div>

      {/* Search notes */}
      <div style={{ position: "relative", marginBottom: "30px", maxWidth: "450px" }}>
        <Search size={18} style={{ position: "absolute", left: "14px", top: "12px", color: "#6b7280" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes by title or content..."
          style={{
            width: "100%",
            padding: "10px 16px 10px 42px",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            border: "1px solid rgba(13, 148, 136, 0.3)",
            borderRadius: "12px",
            fontSize: "14px",
            color: "#111827",
            outline: "none"
          }}
        />
      </div>

      {/* Edit modal / Drawer */}
      {isEditing && (
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
            borderRadius: "20px",
            width: "100%",
            maxWidth: "600px",
            padding: "30px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            border: "1px solid #fee2e2"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1f1f1f", margin: "0 0 20px 0" }}>
              {currentNote?.id ? "Edit Note" : "Create Note"}
            </h2>
            <form onSubmit={handleSaveNote} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Title</label>
                <input
                  type="text"
                  required
                  value={currentNote?.title || ""}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                  placeholder="Note title..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #fca5a5", fontSize: "14px", outline: "none" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Category</label>
                  <input
                    type="text"
                    value={currentNote?.category || ""}
                    onChange={(e) => setCurrentNote({ ...currentNote, category: e.target.value })}
                    placeholder="e.g. History, Coding"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #fca5a5", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Tag</label>
                  <input
                    type="text"
                    value={currentNote?.tags?.[0] || ""}
                    onChange={(e) => setCurrentNote({ ...currentNote, tags: [e.target.value] })}
                    placeholder="e.g. Important"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #fca5a5", fontSize: "14px", outline: "none" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Content (Markdown supported)</label>
                <textarea
                  required
                  rows={6}
                  value={currentNote?.content || ""}
                  onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                  placeholder="Write your notes here..."
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fca5a5", fontSize: "14px", outline: "none", resize: "vertical" }}
                ></textarea>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setCurrentNote(null); }}
                  style={{ padding: "10px 20px", backgroundColor: "#f3f4f6", color: "#374151", borderRadius: "10px", fontWeight: "600", border: "none", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 24px", backgroundColor: "#dc2626", color: "#ffffff", borderRadius: "10px", fontWeight: "600", border: "none", cursor: "pointer" }}
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "60px", textAlign: "center", border: "1px solid #fee2e2" }}>
          <FileText size={48} color="#fca5a5" style={{ marginBottom: "16px" }} />
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f1f1f", margin: "0 0 8px 0" }}>No notes found</h3>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>Create your first study note to summarize what you read.</p>
          <button
            onClick={() => { setCurrentNote({ title: "", content: "", category: "Study", tags: ["Important"] }); setIsEditing(true); }}
            style={{ padding: "10px 20px", backgroundColor: "#dc2626", color: "#ffffff", borderRadius: "10px", fontWeight: "600", border: "none", cursor: "pointer" }}
          >
            Create Note
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid #fee2e2",
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                position: "relative"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
                  {note.category}
                </span>
                {user.role === "Owner" && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => { setCurrentNote(note); setIsEditing(true); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
                      title="Edit Note"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                      title="Delete Note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f1f1f", margin: "0 0 10px 0" }}>{note.title}</h3>
              <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: "1.6", margin: "0 0 20px 0", flex: 1, whiteSpace: "pre-wrap" }}>
                {note.content}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: "12px", fontSize: "12px", color: "#9ca3af" }}>
                <span>{new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</span>
                {note.tags && note.tags[0] && (
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Tag size={12} /> {note.tags[0]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
