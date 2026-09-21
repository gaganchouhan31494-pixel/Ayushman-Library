import React, { useState, useEffect } from "react";
import { User, Book, Note, ActiveTab } from "./types";
import { Navbar } from "./components/Navbar";
import { AuthModal } from "./components/AuthModal";
import { DashboardView } from "./components/DashboardView";
import { LibraryView } from "./components/LibraryView";
import { NotesView } from "./components/NotesView";
import { ReaderView } from "./components/ReaderView";
import { UploadModal } from "./components/UploadModal";
import { RenameModal } from "./components/RenameModal";
import { BookDetailsModal } from "./components/BookDetailsModal";
import { ProfileView } from "./components/ProfileView";
import { LoginActivityView } from "./components/LoginActivityView";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [books, setBooks] = useState<Book[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [renameModalBook, setRenameModalBook] = useState<Book | null>(null);
  const [detailsModalBook, setDetailsModalBook] = useState<Book | null>(null);
  const [activeReaderBook, setActiveReaderBook] = useState<Book | null>(null);

  useEffect(() => {
    // Check existing session on server
    fetch("/api/auth/me")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized");
      })
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(e => {
        setUser(null);
      });
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [booksRes, notesRes] = await Promise.all([
        fetch(`/api/books`),
        fetch(`/api/notes`)
      ]);
      const booksData = await booksRes.json();
      const notesData = await notesRes.json();
      if (Array.isArray(booksData)) setBooks(booksData);
      if (Array.isArray(notesData)) setNotes(notesData);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setActiveTab("dashboard");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    setUser(null);
  };

  const handleUploadedBook = (newBook: Book) => {
    setBooks([newBook, ...books]);
    setUploadModalOpen(false);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Delete this book from your private library?")) return;
    try {
      await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      setBooks(books.filter(b => b.id !== bookId));
    } catch (e) {
      setBooks(books.filter(b => b.id !== bookId));
    }
  };

  const handleToggleFavorite = async (bookId: string) => {
    setBooks(books.map(b => b.id === bookId ? { ...b, isFavorite: !b.isFavorite } : b));
    try {
      await fetch(`/api/books/${bookId}/favorite`, { method: "PUT" });
    } catch (e) {}
  };

  const handleRenameBook = async (bookId: string, newTitle: string) => {
    setBooks(books.map(b => b.id === bookId ? { ...b, title: newTitle } : b));
    try {
      await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle })
      });
    } catch (e) {}
  };

  const handleUpdateProgress = async (bookId: string, newPage: number, bookmarks: number[]) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    const progress = Math.round((newPage / book.pageCount) * 100);
    setBooks(books.map(b => b.id === bookId ? { ...b, currentPage: newPage, readingProgress: progress, bookmarks } : b));
    try {
      await fetch(`/api/books/${bookId}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPage: newPage, bookmarks })
      });
    } catch (e) {}
  };

  if (!user) {
    return <AuthModal onLogin={handleLogin} />;
  }

  if (activeReaderBook) {
    return (
      <ReaderView
        book={activeReaderBook}
        onBack={() => { setActiveReaderBook(null); fetchData(); }}
        onUpdateProgress={handleUpdateProgress}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fcfcfc", color: "#111827", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setUploadModalOpen(true)}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main style={{ paddingBottom: "60px" }}>
        {activeTab === "dashboard" && (
          <DashboardView
            books={books}
            notes={notes}
            user={user}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setActiveTab={setActiveTab}
            onOpenUpload={() => setUploadModalOpen(true)}
            onOpenReader={(b) => setActiveReaderBook(b)}
            onOpenDetails={(b) => setDetailsModalBook(b)}
          />
        )}

        {(activeTab === "library" || activeTab === "bookmarks") && (
          <LibraryView
            books={activeTab === "bookmarks" ? books.filter(b => (b.bookmarks?.length || 0) > 0) : books}
            user={user}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenUpload={() => setUploadModalOpen(true)}
            onOpenReader={(b) => setActiveReaderBook(b)}
            onOpenDetails={(b) => setDetailsModalBook(b)}
            onOpenRename={(b) => setRenameModalBook(b)}
            onDeleteBook={handleDeleteBook}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === "notes" && (
          <NotesView
            notes={notes}
            user={user}
            onNotesUpdated={fetchData}
          />
        )}

        {activeTab === "activity" && (
          <LoginActivityView />
        )}

        {activeTab === "profile" && (
          <ProfileView user={user} onLogout={handleLogout} />
        )}
      </main>

      <UploadModal
        user={user}
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploaded={handleUploadedBook}
      />

      <RenameModal
        book={renameModalBook}
        onClose={() => setRenameModalBook(null)}
        onRename={handleRenameBook}
      />

      <BookDetailsModal
        book={detailsModalBook}
        onClose={() => setDetailsModalBook(null)}
        onOpenReader={(b) => setActiveReaderBook(b)}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
