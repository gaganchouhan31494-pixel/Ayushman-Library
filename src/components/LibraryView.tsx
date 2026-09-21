import React, { useState } from "react";
import { Book, User, ActiveTab } from "../types";
import { BookOpen, Search, Filter, Plus, Trash2, Edit3, Star, Play, MoreVertical } from "lucide-react";

interface LibraryViewProps {
  books: Book[];
  user?: User;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenUpload: () => void;
  onOpenReader: (book: Book, startFromBeginning?: boolean) => void;
  onOpenDetails: (book: Book) => void;
  onOpenRename: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onToggleFavorite: (bookId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  user,
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  onOpenReader,
  onOpenDetails,
  onOpenRename,
  onDeleteBook,
  onToggleFavorite
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [googleBooks, setGoogleBooks] = useState<Book[]>([]);
  const [searchingGoogle, setSearchingGoogle] = useState(false);

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setGoogleBooks([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingGoogle(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data && data.googleBooks) {
          setGoogleBooks(data.googleBooks);
        }
      } catch (err) {
        console.error("Error fetching Google Books:", err);
      } finally {
        setSearchingGoogle(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categories = ["All", ...Array.from(new Set(books.map(b => b.category)))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.originalFilename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "30px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1f1f1f", margin: "0 0 6px 0" }}>My Library</h1>
          <p style={{ fontSize: "15px", color: "#6b7280", margin: 0 }}>Browse and manage your digital PDF books, research papers, and guides.</p>
        </div>
        {user?.role === "Owner" && (
          <button
            onClick={onOpenUpload}
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
            <Plus size={18} /> Upload New PDF
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", marginBottom: "30px" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "8px 18px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "650",
              cursor: "pointer",
              border: selectedCategory === cat ? "1px solid #0d9488" : "1px solid #cbd5e1",
              backgroundColor: selectedCategory === cat ? "#0d9488" : "#ffffff",
              color: selectedCategory === cat ? "#ffffff" : "#4b5563",
              whiteSpace: "nowrap",
              transition: "all 0.2s"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 && googleBooks.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "60px", textAlign: "center", border: "1px solid #ccfbf1" }}>
          <BookOpen size={48} color="#0d9488" style={{ marginBottom: "16px" }} />
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>No books found</h3>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>Try adjusting your search query or check back for new library additions.</p>
          {user?.role === "Owner" && (
            <button
              onClick={onOpenUpload}
              style={{ padding: "10px 20px", background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)", color: "#ffffff", borderRadius: "10px", fontWeight: "700", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(13, 148, 136, 0.3)" }}
            >
              Upload PDF
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {/* Local Library Books */}
          {filteredBooks.length > 0 && (
            <div>
              {searchQuery && <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0d9488", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>📚 Local Library Books ({filteredBooks.length})</h3>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "20px",
                      overflow: "hidden",
                      border: "1px solid #fee2e2",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                    onClick={() => onOpenDetails(book)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 12px 30px rgba(220, 38, 38, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.03)";
                    }}
                  >
                    <div style={{ height: "180px", position: "relative", backgroundColor: "#fef2f2", overflow: "hidden" }}>
                      <img
                        src={book.thumbnail || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80"}
                        alt={book.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(book.id); }}
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                        }}
                      >
                        <Star size={18} color={book.isFavorite ? "#dc2626" : "#9ca3af"} fill={book.isFavorite ? "#dc2626" : "none"} />
                      </button>
                      <div style={{
                        position: "absolute",
                        bottom: "12px",
                        left: "12px",
                        backgroundColor: "rgba(220, 38, 38, 0.9)",
                        color: "#ffffff",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700",
                        textTransform: "uppercase"
                      }}>
                        {book.category}
                      </div>
                    </div>

                    <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1f1f1f", margin: "0 0 6px 0", lineHeight: "1.4" }}>
                        {book.title}
                      </h3>
                      <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px 0" }}>
                        {book.pageCount} pages • {book.readingProgress}% read
                      </p>

                      {/* Progress bar */}
                      <div style={{ width: "100%", height: "6px", backgroundColor: "#f3f4f6", borderRadius: "3px", overflow: "hidden", marginBottom: "16px" }}>
                        <div style={{ width: `${book.readingProgress}%`, height: "100%", backgroundColor: "#dc2626", borderRadius: "3px" }}></div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); onOpenReader(book); }}
                          style={{
                            flex: 1,
                            padding: "10px",
                            backgroundColor: "#0d9488",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "10px",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px"
                          }}
                        >
                          <Play size={14} /> Read
                        </button>
                        {user?.role === "Owner" && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); onOpenRename(book); }}
                              style={{ padding: "10px", backgroundColor: "#f0fdfa", color: "#0d9488", border: "1px solid #ccfbf1", borderRadius: "10px", cursor: "pointer" }}
                              title="Rename"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); }}
                              style={{ padding: "10px", backgroundColor: "#fff5f5", color: "#ef4444", border: "1px solid #fca5a5", borderRadius: "10px", cursor: "pointer" }}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Books API Results */}
          {searchQuery.trim() && (
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#2563eb", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>🌐 Google Books API Search Results</h3>
              {searchingGoogle ? (
                <p style={{ fontSize: "14px", color: "#6b7280" }}>Searching Google Books API...</p>
              ) : googleBooks.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#6b7280" }}>No Google Books found for this query.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
                  {googleBooks.map((gb) => (
                    <div key={gb.id} style={{ backgroundColor: "#fff", borderRadius: "20px", border: "1px solid #bfdbfe", padding: "20px", boxShadow: "0 4px 15px rgba(37,99,235,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "800", backgroundColor: "#eff6ff", color: "#2563eb", padding: "3px 10px", borderRadius: "10px" }}>Google Books</span>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>{gb.category}</span>
                        </div>
                        <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 6px 0", lineHeight: "1.4" }}>{gb.title}</h4>
                        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>By {gb.author} • {gb.pageCount} pages</p>
                      </div>
                      {gb.fileUrl && (
                        <a
                          href={gb.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "block",
                            textAlign: "center",
                            padding: "10px",
                            backgroundColor: "#2563eb",
                            color: "#fff",
                            borderRadius: "10px",
                            fontWeight: "700",
                            fontSize: "13px",
                            textDecoration: "none"
                          }}
                        >
                          View on Google Books ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
