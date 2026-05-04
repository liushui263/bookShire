import { Link, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  getUserBooks,
  updateUserBookStatus,
  UserBook,
} from "../lib/api";

const DEMO_USER_ID =
  process.env.EXPO_PUBLIC_DEMO_USER_ID ||
  "86f7818b-788e-4d0b-9e81-9c8bc918ac44";

const STATUS_OPTIONS = [
  { value: "want_to_read", label: "Want to Read" },
  { value: "reading", label: "Reading" },
  { value: "finished", label: "Finished" },
  { value: "abandoned", label: "Abandoned" },
];

function getShelfTitle(item: UserBook): string {
  return (
    item.book_title ||
    item.edition_title ||
    item.book_id ||
    item.edition_id ||
    "Untitled Book"
  );
}

function getShelfSubtitle(item: UserBook): string | null {
  return item.book_subtitle || item.edition_language || null;
}

export default function MobileShelfScreen() {
  const [items, setItems] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadShelf() {
    try {
      setLoading(true);
      setError(null);

      const data = await getUserBooks(DEMO_USER_ID);
      setItems(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load My Shelf.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(userBookId: string, status: string) {
    try {
      setUpdatingId(userBookId);
      setMessage(null);
      setError(null);

      const updated = await updateUserBookStatus(
        DEMO_USER_ID,
        userBookId,
        status
      );

      setItems((current) =>
        current.map((item) => (item.id === userBookId ? updated : item))
      );

      setMessage("Shelf item updated.");
    } catch (err) {
      console.error(err);
      setError("Failed to update shelf item.");
    } finally {
      setUpdatingId(null);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadShelf();
    }, [])
  );

  const groupedItems = useMemo(() => {
    return STATUS_OPTIONS.map((status) => ({
      ...status,
      items: items.filter((item) => item.status === status.value),
    }));
  }, [items]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading My Shelf...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>BookShire</Text>
        <Text style={styles.title}>My Shelf</Text>
        <Text style={styles.subtitle}>
          Track books you want to read, are reading, finished, or abandoned.
        </Text>
      </View>

      <View style={styles.navRow}>
        <Link href="/" style={styles.link}>
          Home
        </Link>
        <Link href="/search" style={styles.link}>
          Search
        </Link>
      </View>

      {message ? <Text style={styles.success}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Your shelf is empty.</Text>
          <Text style={styles.muted}>
            Go back to Home or Search and add a book to My Shelf.
          </Text>
        </View>
      ) : null}

      {groupedItems.map((group) => (
        <View key={group.value} style={styles.section}>
          <Text style={styles.sectionTitle}>
            {group.label} · {group.items.length}
          </Text>

          {group.items.length === 0 ? (
            <Text style={styles.emptySection}>No books here yet.</Text>
          ) : (
            group.items.map((item) => {
              const bookId = item.book_id;
              const title = getShelfTitle(item);
              const subtitle = getShelfSubtitle(item);

              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    {bookId ? (
                      <Link href={`/books/${bookId}`} style={styles.bookTitle}>
                        {title}
                      </Link>
                    ) : (
                      <Text style={styles.bookTitle}>{title}</Text>
                    )}

                    {subtitle ? (
                      <Text style={styles.bookSubtitle}>{subtitle}</Text>
                    ) : null}
                  </View>

                  {item.book_categories?.length ? (
                    <View style={styles.chips}>
                      {item.book_categories.map((category) => (
                        <Text key={category} style={styles.chip}>
                          {category}
                        </Text>
                      ))}
                    </View>
                  ) : null}

                  {item.book_tags?.length ? (
                    <View style={styles.chips}>
                      {item.book_tags.map((tag) => (
                        <Text key={tag} style={styles.chip}>
                          {tag}
                        </Text>
                      ))}
                    </View>
                  ) : null}

                  <View style={styles.statusBlock}>
                    <Text style={styles.label}>Change Status</Text>

                    <View style={styles.statusButtons}>
                      {STATUS_OPTIONS.map((status) => {
                        const active = item.status === status.value;
                        const disabled = updatingId === item.id;

                        return (
                          <Pressable
                            key={status.value}
                            style={[
                              styles.statusButton,
                              active ? styles.statusButtonActive : null,
                              disabled ? styles.statusButtonDisabled : null,
                            ]}
                            disabled={disabled || active}
                            onPress={() =>
                              handleStatusChange(item.id, status.value)
                            }
                          >
                            <Text
                              style={[
                                styles.statusButtonText,
                                active ? styles.statusButtonTextActive : null,
                              ]}
                            >
                              {status.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 18,
    backgroundColor: "#f8fafc",
    minHeight: "100%",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#f8fafc",
  },
  header: {
    gap: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    color: "#475569",
    fontSize: 16,
    lineHeight: 24,
  },
  navRow: {
    flexDirection: "row",
    gap: 18,
    flexWrap: "wrap",
  },
  link: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 16,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptySection: {
    color: "#64748b",
    fontStyle: "italic",
  },
  emptyCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    gap: 4,
  },
  bookTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
  },
  bookSubtitle: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#e2e8f0",
    color: "#0f172a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 13,
    overflow: "hidden",
  },
  statusBlock: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "white",
  },
  statusButtonActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  statusButtonDisabled: {
    opacity: 0.6,
  },
  statusButtonText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 13,
  },
  statusButtonTextActive: {
    color: "white",
  },
  success: {
    color: "#166534",
    fontWeight: "700",
  },
  error: {
    color: "#b91c1c",
    fontWeight: "700",
  },
  muted: {
    color: "#64748b",
  },
});
