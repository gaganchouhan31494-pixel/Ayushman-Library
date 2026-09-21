export interface User {
  id: string;
  name: string;
  username: string;
  role: "Owner" | "Manager" | "User";
  createdAt: string;
}

export interface Book {
  id: string;
  userId: string;
  title: string;
  author?: string;
  originalFilename: string;
  filePath: string;
  fileSize: number;
  fileType: "book" | "document" | "notes" | "ebook";
  category: string;
  tags: string[];
  pageCount: number;
  currentPage: number;
  readingProgress: number;
  lastRead: string;
  uploadDate: string;
  thumbnail: string;
  frontCover?: string;
  backCover?: string;
  bookmarks: number[];
  isFavorite: boolean;
  fileUrl?: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginEvent {
  id: string;
  timestamp: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  status: "Success" | "Active" | "Terminated" | "Expired" | "Failed";
  logoutTime?: string;
  isCurrent?: boolean;
}

export type ActiveTab =
  | "dashboard"
  | "library"
  | "notes"
  | "bookmarks"
  | "history"
  | "activity"
  | "profile"
  | "settings";
