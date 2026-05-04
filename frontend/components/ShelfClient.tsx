"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReadingStatus, UserBook } from "@/lib/api";
import { removeUserBook, updateUserBookStatus } from "@/lib/api";

const STATUS_LABELS: Record<ReadingStatus, string> = {
  want_to_read: "Want to Read",
  reading: "Reading",
  finished: "Finished",
  abandoned: "Abandoned",
};

const STATUS_ORDER: ReadingStatus[] = [
  "want_to_read",
  "reading",
  "finished",
  "abandoned",
];

type ShelfClientProps = {
  initialItems: UserBook[];
  userId: string;
};

function getBookId(item: UserBook) {
  return item.book?.id || item.book_id;
}

function getBookTitle(item: UserBook) {
  return item.book?.title || item.title || `Book ${item.book_id}`;
}

function getBookSubtitle(item: UserBook) {
  return item.book?.subtitle || item.subtitle || null;
}

function getBookCoverUrl(item: UserBook) {
  return (
    item.book?.cover_url ||
    item.book?.canonical_cover_url ||
    item.cover_url ||
    item.canonical_cover_url ||
    null
  );
}

function getBookTags(item: UserBook) {
  return item.book?.tags || item.book?.categories || item.tags || item.categories || [];
}

export function ShelfClient({ initialItems, userId }: ShelfClientProps) {
  const [items, setItems] = useState<UserBook[]>(initialItems);
  const [message, setMessage] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const result: Record<ReadingStatus, UserBook[]> = {
      want_to_read: [],
      reading: [],
      finished: [],
      abandoned: [],
    };

    for (const item of items) {
      const status = item.status || "want_to_read";
      if (result[status]) {
        result[status].push(item);
      }
    }

    return result;
  }, [items]);

  async function handleStatusChange(item: UserBook, status: ReadingStatus) {
    const bookId = getBookId(item);
    const key = `${bookId}:status`;

    setBusyKey(key);
    setMessage(null);

    try {
      const updated = await updateUserBookStatus(userId, bookId, status);

      setItems((current) =>
        current.map((entry) =>
          getBookId(entry) === bookId
            ? {
                ...entry,
                ...updated,
                status,
                book: entry.book || updated.book,
              }
            : entry
        )
      );

      setMessage(`Updated "${getBookTitle(item)}" to ${STATUS_LABELS[status]}.`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update reading status."
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function handleRemove(item: UserBook) {
    const bookId = getBookId(item);
    const key = `${bookId}:remove`;

    setBusyKey(key);
    setMessage(null);

    try {
      await removeUserBook(userId, bookId);

      setItems((current) =>
        current.filter((entry) => getBookId(entry) !== bookId)
      );

      setMessage(`Removed "${getBookTitle(item)}" from your shelf.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to remove book."
      );
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div>
      {message && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
          {message}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-xl font-bold text-gray-950">
            Your shelf is empty.
          </h2>
          <p className="mt-2 text-gray-600">
            Open a book detail page and add books to your shelf.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {STATUS_ORDER.map((status) => (
            <section key={status}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-950">
                  {STATUS_LABELS[status]}
                </h2>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                  {grouped[status].length}
                </span>
              </div>

              {grouped[status].length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                  No books in this section.
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {grouped[status].map((item) => {
                    const bookId = getBookId(item);
                    const title = getBookTitle(item);
                    const subtitle = getBookSubtitle(item);
                    const coverUrl = getBookCoverUrl(item);
                    const tags = getBookTags(item);
                    const isBusy = busyKey?.startsWith(bookId);

                    return (
                      <article
                        key={item.id || bookId}
                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex gap-4">
                          <Link
                            href={`/books/${bookId}`}
                            className="flex h-28 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400"
                          >
                            {coverUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={coverUrl}
                                alt={title}
                                className="h-full w-full rounded-xl object-cover"
                              />
                            ) : (
                              <span>Cover</span>
                            )}
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/books/${bookId}`}
                              className="line-clamp-2 text-lg font-semibold text-gray-950 hover:underline"
                            >
                              {title}
                            </Link>

                            {subtitle && (
                              <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                {subtitle}
                              </p>
                            )}

                            {tags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                              <select
                                value={item.status}
                                disabled={isBusy}
                                onChange={(event) =>
                                  handleStatusChange(
                                    item,
                                    event.target.value as ReadingStatus
                                  )
                                }
                                className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                              >
                                {STATUS_ORDER.map((option) => (
                                  <option key={option} value={option}>
                                    {STATUS_LABELS[option]}
                                  </option>
                                ))}
                              </select>

                              <button
                                disabled={isBusy}
                                onClick={() => handleRemove(item)}
                                className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
