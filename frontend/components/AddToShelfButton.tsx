"use client";

import { useState } from "react";
import { addBookToShelf } from "@/lib/api";

type AddToShelfButtonProps = {
  userId: string;
  bookId: string;
};

export function AddToShelfButton({ userId, bookId }: AddToShelfButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAdd() {
    setIsLoading(true);
    setMessage(null);

    try {
      await addBookToShelf(userId, bookId);
      setMessage("Added to your shelf.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to add to shelf."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={isLoading}
        onClick={handleAdd}
        className="rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? "Adding..." : "Add to My Shelf"}
      </button>

      {message && (
        <p className="mt-2 text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}
