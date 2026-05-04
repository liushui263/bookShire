const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type Book = {
  id: string;
  title: string;
  subtitle?: string | null;
  normalized_title?: string | null;
  original_language?: string | null;
  canonical_cover_url?: string | null;
  canonical_description?: string | null;
  avg_rating?: number | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  tags?: string[] | null;
  categories?: string[] | null;
};

export type ReadingStatus = "unread" | "reading" | "read" | "abandoned";

export type UserBook = {
  id: string;
  user_id: string;
  edition_id: string;
  status: ReadingStatus;
  condition?: number | null;
  visibility: string;
  personal_tags: string[];
  personal_notes_summary?: string | null;
  created_at: string;
  updated_at: string;

  book_id: string;
  book_title: string;
  book_subtitle?: string | null;
  book_cover_url?: string | null;
  book_tags: string[];
  book_categories: string[];

  edition_title?: string | null;
  edition_language?: string | null;
  edition_cover_url?: string | null;
};

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;

    try {
      const body = await res.json();
      detail = body.detail ? JSON.stringify(body.detail) : JSON.stringify(body);
    } catch {
      // Keep HTTP detail.
    }

    throw new Error(`API request failed: ${detail}`);
  }

  return res.json();
}

export function getBooks(): Promise<Book[]> {
  return fetchJson<Book[]>("/api/v1/books/");
}

export function getBook(bookId: string): Promise<Book> {
  return fetchJson<Book[]>(`/api/v1/books/${encodeURIComponent(bookId)}`) as unknown as Promise<Book>;
}

export function searchBooks(query: string): Promise<Book[]> {
  return fetchJson<Book[]>(
    `/api/v1/books/search?q=${encodeURIComponent(query)}`
  );
}

export function getUserBooks(userId: string): Promise<UserBook[]> {
  return fetchJson<UserBook[]>(
    `/api/v1/users/${encodeURIComponent(userId)}/books`
  );
}

export function addBookToShelf(
  userId: string,
  bookId: string
): Promise<UserBook> {
  return fetchJson<UserBook>(
    `/api/v1/users/${encodeURIComponent(userId)}/books/by-book/${encodeURIComponent(bookId)}`,
    { method: "POST" }
  );
}

export function updateUserBookStatus(
  userId: string,
  userBookId: string,
  status: ReadingStatus
): Promise<UserBook> {
  return fetchJson<UserBook>(
    `/api/v1/users/${encodeURIComponent(userId)}/books/${encodeURIComponent(userBookId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}
