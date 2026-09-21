import React, { useState, useEffect, useRef } from "react";
import { Book } from "../types";
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark, Sparkles, ZoomIn, ZoomOut, Download, Maximize, Search, BookOpen } from "lucide-react";

interface ReaderViewProps {
  book: Book;
  onBack: () => void;
  onUpdateProgress: (bookId: string, newPage: number, bookmarks: number[]) => void;
}

export function ReaderView({ book, onBack, onUpdateProgress }: ReaderViewProps) {
  // Total pages = Front Cover (if book) + book.pageCount + Back Cover (if book)
  const isBookMode = book.fileType === "book" || book.frontCover;
  const hasFrontCover = isBookMode && !!book.frontCover;
  const hasBackCover = isBookMode && !!book.backCover;

  const frontCoverOffset = hasFrontCover ? 1 : 0;
  const totalInternalPages = book.pageCount || 50;
  const totalVirtualPages = frontCoverOffset + totalInternalPages + (hasBackCover ? 1 : 0);

  const [virtualPage, setVirtualPage] = useState<number>(() => {
    // Map initial currentPage to virtual page
    let initialV = book.currentPage || 1;
    if (hasFrontCover) initialV += 1;
    return Math.min(Math.max(1, initialV), totalVirtualPages);
  });

  const [zoom, setZoom] = useState<number>(100);
  const [bookmarks, setBookmarks] = useState<number[]>(book.bookmarks || []);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Determine current page type
  const isFrontCoverPage = hasFrontCover && virtualPage === 1;
  const isBackCoverPage = hasBackCover && virtualPage === totalVirtualPages;

  // Actual PDF page number (1-indexed) if viewing PDF pages
  let pdfPageNumber = null;
  if (!isFrontCoverPage && !isBackCoverPage) {
    pdfPageNumber = virtualPage - frontCoverOffset;
  }

  const isBookmarked = bookmarks.includes(virtualPage);

  useEffect(() => {
    // Update parent progress when virtualPage changes
    if (pdfPageNumber && pdfPageNumber >= 1 && pdfPageNumber <= totalInternalPages) {
      onUpdateProgress(book.id, pdfPageNumber, bookmarks);
    }
  }, [virtualPage, bookmarks]);

  const toggleBookmark = () => {
    if (isBookmarked) {
      const next = bookmarks.filter(p => p !== virtualPage);
      setBookmarks(next);
    } else {
      const next = [...bookmarks, virtualPage].sort((a, b) => a - b);
      setBookmarks(next);
    }
  };

  const handlePrev = () => {
    if (virtualPage > 1) setVirtualPage(virtualPage - 1);
  };

  const handleNext = () => {
    if (virtualPage < totalVirtualPages) setVirtualPage(virtualPage + 1);
  };

  const handleDownload = () => {
    window.open(`/api/books/${book.id}/file`, "_blank");
  };

  return (
    <div
      ref={readerContainerRef}
      style={{
        minHeight: "100vh",
        backgroundColor: "#111827",
        color: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
        position: isFullscreen ? "fixed" : "relative",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: isFullscreen ? 9999 : 1
      }}
    >
      {/* Reader Topbar */}
      <div style={{
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={onBack}
            style={{
              padding: "10px 18px",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)"
            }}
          >
            <ArrowLeft size={18} /> Back to Library
          </button>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>{book.title}</h2>
            <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{book.author || book.category}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={toggleBookmark}
            style={{
              padding: "8px 14px",
              backgroundColor: isBookmarked ? "#dc2626" : "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "10px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px"
            }}
          >
            <Bookmark size={16} fill={isBookmarked ? "#ffffff" : "none"} /> {isBookmarked ? "Bookmarked" : "Bookmark"}
          </button>

          <button
            onClick={handleDownload}
            style={{
              padding: "8px 14px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "10px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px"
            }}
          >
            <Download size={16} /> Download Original PDF
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "rgba(255,255,255,0.08)", padding: "4px", borderRadius: "10px" }}>
            <button onClick={() => setZoom(Math.max(70, zoom - 15))} style={{ background: "none", border: "none", color: "#fff", padding: "6px", cursor: "pointer" }}><ZoomOut size={16} /></button>
            <span style={{ fontSize: "13px", padding: "0 6px", fontWeight: "600" }}>{zoom}%</span>
            <button onClick={() => setZoom(Math.min(160, zoom + 15))} style={{ background: "none", border: "none", color: "#fff", padding: "6px", cursor: "pointer" }}><ZoomIn size={16} /></button>
          </div>
        </div>
      </div>

      {/* Reader Main Stage */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        overflow: "auto",
        position: "relative"
      }}>
        {/* Previous Page Button */}
        <button
          onClick={handlePrev}
          disabled={virtualPage <= 1}
          style={{
            position: "absolute",
            left: "20px",
            zIndex: 10,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: virtualPage <= 1 ? "not-allowed" : "pointer",
            opacity: virtualPage <= 1 ? 0.4 : 1,
            transition: "all 0.2s"
          }}
        >
          <ChevronLeft size={24} />
        </button>

        {/* Book Page Container */}
        <div style={{
          width: `${Math.round(650 * (zoom / 100))}px`,
          height: `${Math.round(850 * (zoom / 100))}px`,
          backgroundColor: isFrontCoverPage || isBackCoverPage ? "#1f2937" : "#ffffff",
          color: isFrontCoverPage || isBackCoverPage ? "#ffffff" : "#1f1f1f",
          borderRadius: "8px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "50px",
          position: "relative",
          transition: "all 0.2s ease"
        }}>
          {isFrontCoverPage ? (
            <div style={{ textAlign: "center", margin: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "220px", height: "300px", borderRadius: "8px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", marginBottom: "30px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <img src={book.frontCover} alt="Front Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h1 style={{ fontSize: "26px", fontWeight: "700", margin: "0 0 10px", color: "#ffffff" }}>{book.title}</h1>
              <p style={{ fontSize: "16px", color: "#9ca3af", margin: 0 }}>By {book.author || "Author"}</p>
              <span style={{ marginTop: "40px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", color: "#dc2626", fontWeight: "700" }}>Front Cover</span>
            </div>
          ) : isBackCoverPage ? (
            <div style={{ textAlign: "center", margin: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "220px", height: "300px", borderRadius: "8px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", marginBottom: "30px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <img src={book.backCover} alt="Back Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 10px", color: "#ffffff" }}>The End</h2>
              <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>AuraLibrary Private Digital Edition</p>
              <span style={{ marginTop: "40px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", color: "#dc2626", fontWeight: "700" }}>Back Cover</span>
            </div>
          ) : (
            <>
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px", color: "#6b7280", fontSize: "13px", fontWeight: "600", maxHeight: "40px" }}>
                <span>{book.title}</span>
                <span>Page {pdfPageNumber} of {totalInternalPages}</span>
              </div>

              <div style={{ flex: 1, width: "100%", height: "100%", position: "relative", overflow: "hidden", marginTop: "10px", borderRadius: "8px" }}>
                <iframe
                  src={book.fileUrl || `/api/books/${book.id}/file`}
                  style={{ width: "100%", height: "100%", border: "none", backgroundColor: "#ffffff" }}
                  title={book.title}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: "15px", color: "#9ca3af", fontSize: "12px" }}>
                <span>AuraLibrary Secure Reader</span>
                <span>{book.category}</span>
              </div>
            </>
          )}
        </div>

        {/* Next Page Button */}
        <button
          onClick={handleNext}
          disabled={virtualPage >= totalVirtualPages}
          style={{
            position: "absolute",
            right: "20px",
            zIndex: 10,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: virtualPage >= totalVirtualPages ? "not-allowed" : "pointer",
            opacity: virtualPage >= totalVirtualPages ? 0.4 : 1,
            transition: "all 0.2s"
          }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Reader Footer Controls */}
      <div style={{
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 50
      }}>
        <div style={{ fontSize: "14px", color: "#9ca3af" }}>
          Reading Progress: <strong style={{ color: "#ffffff" }}>{book.readingProgress || 0}%</strong>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600" }}>
            Virtual Page {virtualPage} of {totalVirtualPages}
          </span>
        </div>

        <div style={{ fontSize: "14px", color: "#9ca3af" }}>
          Secure Private Mode
        </div>
      </div>
    </div>
  );
}
