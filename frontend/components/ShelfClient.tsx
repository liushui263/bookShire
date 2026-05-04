"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReadingStatus, UserBook } from "@/lib/api";
import { removeUserBook, updateUserBookStatus } from "@/lib/api";

const STATUS_LABELS: Record<ReadingStatus, string> = {
  unread: "Unread",
  reading: "Reading",
  read: "Read",
  abandoned: "Abandoned",
};

const STATUS_ORDER: ReadingStatus[] = [
  "unread",
  "reading",
  "read",
  "abandoned",
];

type ShelfClientProps = {
  initialItems: UserBook[];
  userId: string;
};

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ShelfClient({ initialItems, userId }: ShelfClientProps) {
  const [items, setItems] = useState<UserBook[]>(initialItems);
  const [message, setMessage] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const result: Record<ReadingStatus, UserBook[]> = {
      unread: [],
      reading: [],
      read: [],
      abandoned: [],
    };

    for (const item of items) {
      const status = item.status || "unread";
      result[status].push(item);
    }

    return result;
  }, [items]);

  async function handleStatusChange(item: UserBook, status: ReadingStatus) {
    const userBookId = item.id;
    const key = `${userBookId}:status`;

    setBusyKey(key);
    setMessage(null);

    try {
      const updated = await updateUserBookStatus(userId, userBookId, status);

      setItems((current) =>
        current.map((entry) =>
          entry.id === userBookId
            ? {
                ...entry,
                ...updated,
                status,
              }
            : entry
        )
      );

      setMessage(`Updated shelf item ${userBookId} to ${STATUS_LABELS[status]}.`);
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
    const userBookId = item.id;
    const key = `${userBookId}:remove`;

    setBusyKey(key);
    setMessage(null);

    try {
      await removeUserBook(userId, userBookId);

      setItems((current) =>
        current.filter((entry) => entry.id !== userBookId)
      );

      setMessage(`Removed shelf item ${userBookId}.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to remove shelf item."
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
            Add an edition to your shelf from the backend or a book detail page.
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
                    const isBusy = busyKey?.startsWith(item.id);

                    return (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                              Shelf Item
                            </p>
                            <h3 className="mt-2 break-all text-lg font-semibold text-gray-950">
                              {item.id}
                            </h3>
                          </div>

                          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                            {STATUS_LABELS[item.status]}
                          </span>
                        </div>

                        <dl className="mt-5 space-y-3 text-sm">
                          <div>
                            <dt className="font-semibold text-gray-900">
                              Edition ID
                            </dt>
                            <dd className="mt-1 break-all text-gray-600">
                              {item.edition_id}
                            </dd>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <dt className="font-semibold text-gray-900">
                                Condition
                              </dt>
                              <dd className="mt-1 text-gray-600">
                                {item.condition ?? "Unknown"}
                              </dd>
                            </div>

                            <div>
                              <dt className="font-semibold text-gray-900">
                                Visibility
                              </dt>
                              <dd className="mt-1 text-gray-600">
                                {item.visibility}
                              </dd>
                            </div>
                          </div>

                          <div>
                            <dt className="font-semibold text-gray-900">
                              Tags
                            </dt>
                            <dd className="mt-2 flex flex-wrap gap-2">
                              {item.personal_tags.length > 0 ? (
                                item.personal_tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500">No tags</span>
                              )}
                            </dd>
                          </div>

                          <div>
                            <dt className="font-semibold text-gray-900">
                              Notes
                            </dt>
                            <dd className="mt-1 text-gray-600">
                              {item.personal_notes_summary || "No notes"}
                            </dd>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <dt className="font-semibold text-gray-900">
                                Created
                              </dt>
                              <dd className="mt-1 text-gray-600">
                                {formatDate(item.created_at)}
                              </dd>
                            </div>

                            <div>
                              <dt className="font-semibold text-gray-900">
                                Updated
                              </dt>
                              <dd className="mt-1 text-gray-600">
                                {formatDate(item.updated_at)}
                              </dd>
                            </div>
                          </div>
                        </dl>

                        <div className="mt-5 flex flex-wrap gap-2">
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
