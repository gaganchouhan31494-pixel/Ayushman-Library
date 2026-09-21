import React from "react";
import { Book, Note, User, ActiveTab } from "../types";
import { BookOpen, FileText, Bookmark, Clock, HardDrive, Sparkles, ArrowRight, Star, TrendingUp, Shield, Search } from "lucide-react";

interface DashboardViewProps {
  books: Book[];
  notes: Note[];
  user?: User;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
  onOpenReader: (book: Book) => void;
  onOpenDetails: (book: Book) => void;
}

export function DashboardView({
  books,
  notes,
  user,
  searchQuery,
  setSearchQuery,
  setActiveTab,
  onOpenUpload,
  onOpenReader,
  onOpenDetails
}: DashboardViewProps) {
  const totalBooks = books.length;
  const totalNotes = notes.length;
  const totalBookmarks = books.reduce((acc, b) => acc + (b.bookmarks?.length || 0), 0);
  const currentlyReading = books.filter(b => b.readingProgress > 0 && b.readingProgress < 100);
  const totalStorage = books.reduce((acc, b) => acc + (b.fileSize || 2500000), 0);
  const storageFormatted = (totalStorage / (1024 * 1024)).toFixed(1) + " MB";

  const continueReadingBook = books.sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime())[0];

  const isOwner = user?.role === "Owner";

  const [googleBooks, setGoogleBooks] = React.useState<Book[]>([]);
  const [searchingGoogle, setSearchingGoogle] = React.useState(false);

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
        console.error("Error searching Google Books:", err);
      } finally {
        setSearchingGoogle(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredBooks = searchQuery.trim() 
    ? books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.category.toLowerCase().includes(searchQuery.toLowerCase()) || (b.tags && b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))))
    : [];

  const filteredNotes = searchQuery.trim()
    ? notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()) || n.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "30px 20px" }}>
      {/* Welcome Banner */}
      <div className="welcome-banner" style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%)",
        borderRadius: "24px",
        padding: "36px 40px",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        boxShadow: "0 15px 35px rgba(15, 118, 110, 0.3)",
        marginBottom: "36px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "650", marginBottom: "14px" }}>
              <Shield size={13} /> आयुष्मान लाइब्रेरी (Ayushman Library) • {isOwner ? "Manager Panel" : "Student Reader Panel"}
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
              {isOwner ? "Welcome back, Master Administrator" : `Welcome back, ${user?.name || "Student Reader"}`}
            </h1>
            <p style={{ fontSize: "15px", opacity: 0.9, margin: 0, maxWidth: "600px", lineHeight: "1.5" }}>
              {isOwner 
                ? "Your professional digital library and notes manager is fully operational. All PDF documents and personal notes are securely protected."
                : "Explore, search, and study verified digital library books and notes uploaded by the Manager. Track your reading progress and bookmarks seamlessly."}
            </p>
          </div>
          {isOwner && (
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={onOpenUpload}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#ffffff",
                  color: "#0f766e",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "800",
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "transform 0.2s"
                }}
              >
                <Sparkles size={18} /> Upload New PDF
              </button>
            </div>
          )}
        </div>

        {/* Home Page Search Box */}
        <div style={{ position: "relative", maxWidth: "680px", width: "100%" }}>
          <Search size={20} style={{ position: "absolute", left: "18px", top: "16px", color: "#64748b" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any book, research paper, notes, category, or tag instantly..."
            style={{
              width: "100%",
              padding: "14px 20px 14px 50px",
              backgroundColor: "#ffffff",
              border: "none",
              borderRadius: "16px",
              fontSize: "15px",
              color: "#1e293b",
              fontWeight: "600",
              outline: "none",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "14px",
                top: "12px",
                background: "#f1f5f9",
                border: "none",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: "700",
                color: "#475569",
                cursor: "pointer"
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Search Results if searchQuery is active */}
      {searchQuery.trim() ? (
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "20px" }}>
            Search Results for "{searchQuery}" ({filteredBooks.length} local books, {filteredNotes.length} notes, {googleBooks.length} Google Books)
          </h2>
          {filteredBooks.length === 0 && filteredNotes.length === 0 && googleBooks.length === 0 ? (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "40px", textAlign: "center", border: "1px solid #e2e8f0" }}>
              <p style={{ color: "#64748b", fontSize: "15px", fontWeight: "600", margin: 0 }}>No matching books or notes found. Try another keyword!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              {/* Local Books & Notes */}
              {(filteredBooks.length > 0 || filteredNotes.length > 0) && (
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0d9488", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>📚 Ayushman Library Local Database</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
                    {filteredBooks.map((book) => (
                      <div key={book.id} style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#0d9488", textTransform: "uppercase" }}>{book.category}</span>
                        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: "6px 0 10px" }}>{book.title}</h3>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => onOpenReader(book)}
                            style={{ flex: 1, padding: "8px", backgroundColor: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
                          >
                            Read Book
                          </button>
                          <button
                            onClick={() => onOpenDetails(book)}
                            style={{ padding: "8px 12px", backgroundColor: "#f0fdfa", color: "#0d9488", border: "1px solid #ccfbf1", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredNotes.map((note) => (
                      <div key={note.id} style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase" }}>Note • {note.category}</span>
                        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: "6px 0 6px" }}>{note.title}</h3>
                        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{note.content}</p>
                        <button
                          onClick={() => setActiveTab("notes")}
                          style={{ width: "100%", padding: "8px", backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
                        >
                          View in Notes
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Books API Results */}
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#2563eb", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>🌐 Google Books API Search Results</h3>
                {searchingGoogle ? (
                  <p style={{ fontSize: "14px", color: "#64748b" }}>Searching Google Books API...</p>
                ) : googleBooks.length === 0 ? (
                  <p style={{ fontSize: "14px", color: "#64748b" }}>No Google Books found for this query.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
                    {googleBooks.map((gb) => (
                      <div key={gb.id} style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #bfdbfe", padding: "16px", boxShadow: "0 4px 15px rgba(37,99,235,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <span style={{ fontSize: "10px", fontWeight: "800", backgroundColor: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "10px" }}>Google Books</span>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>{gb.category}</span>
                          </div>
                          <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: "4px 0 4px" }}>{gb.title}</h4>
                          <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 12px" }}>By {gb.author}</p>
                        </div>
                        {gb.fileUrl && (
                          <a
                            href={gb.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "block",
                              textAlign: "center",
                              padding: "8px",
                              backgroundColor: "#2563eb",
                              color: "#fff",
                              borderRadius: "8px",
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
            </div>
          )}
        </div>
      ) : null}

      {/* Stats Grid */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        {[
          { label: "Total Books", value: totalBooks, icon: BookOpen, color: "#2563eb", bg: "#eff6ff", tab: "library" },
          { label: "Total Notes", value: totalNotes, icon: FileText, color: "#0d9488", bg: "#f0fdfa", tab: "notes" },
          { label: "Currently Reading", value: currentlyReading.length, icon: TrendingUp, color: "#d97706", bg: "#fffbeb", tab: "library" },
          { label: "Bookmarked Pages", value: totalBookmarks, icon: Bookmark, color: "#7c3aed", bg: "#f5f3ff", tab: "bookmarks" },
          { label: "Storage Used", value: storageFormatted, icon: HardDrive, color: "#059669", bg: "#ecfdf5", tab: "settings" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(stat.tab as ActiveTab)}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "18px",
                padding: "22px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.02)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>{stat.label}</span>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} />
                </div>
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#111827", letterSpacing: "-0.5px" }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Reading Section */}
      {continueReadingBook && (
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>Continue Reading</h2>
          </div>
          <div className="continue-reading-card" style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #e5e7eb",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
          }}>
            <img
              src={continueReadingBook.thumbnail || continueReadingBook.frontCover || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80"}
              alt={continueReadingBook.title}
              style={{ width: "80px", height: "110px", objectFit: "cover", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ backgroundColor: "rgba(13, 148, 136, 0.1)", color: "#0d9488", padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", display: "inline-block", marginBottom: "8px" }}>
                {continueReadingBook.category}
              </span>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 6px", wordBreak: "break-word" }}>{continueReadingBook.title}</h3>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px" }}>
                Page {continueReadingBook.currentPage} of {continueReadingBook.pageCount} • {continueReadingBook.readingProgress}% Complete
              </p>
              <div style={{ width: "100%", height: "8px", backgroundColor: "#f3f4f6", borderRadius: "4px", overflow: "hidden", marginBottom: "16px" }}>
                <div style={{ width: `${continueReadingBook.readingProgress}%`, height: "100%", background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)", borderRadius: "4px" }} />
              </div>
            </div>
            <button
              onClick={() => onOpenReader(continueReadingBook)}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 6px 20px rgba(13, 148, 136, 0.3)",
                flexShrink: 0
              }}
            >
              Resume Reading <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Recently Added Books */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>Recently Added Books</h2>
          <button
            onClick={() => setActiveTab("library")}
            style={{ background: "none", border: "none", color: "#0d9488", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
          >
            View All Library <ArrowRight size={16} />
          </button>
        </div>

        <div className="books-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
          {books.slice(0, 4).map((book) => (
            <div
              key={book.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
                boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ height: "200px", backgroundColor: "#f3f4f6", position: "relative", overflow: "hidden" }}>
                <img
                  src={book.thumbnail || book.frontCover || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80"}
                  alt={book.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", color: "#fff", padding: "3px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "600" }}>
                  {book.pageCount} pgs
                </span>
              </div>
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#0d9488", textTransform: "uppercase", letterSpacing: "0.5px" }}>{book.category}</span>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "4px 0 8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {book.title}
                  </h3>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button
                    onClick={() => onOpenReader(book)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      backgroundColor: "#0d9488",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    Read
                  </button>
                  <button
                    onClick={() => onOpenDetails(book)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#f0fdfa",
                      color: "#0d9488",
                      border: "1px solid #ccfbf1",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
