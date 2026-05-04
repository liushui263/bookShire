import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { addBookToShelf, Book, getBook } from "../../lib/api";

const DEMO_USER_ID =
  process.env.EXPO_PUBLIC_DEMO_USER_ID ||
  "86f7818b-788e-4d0b-9e81-9c8bc918ac44";

export default function MobileBookDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const bookId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadBook() {
    if (!bookId) {
      setError("Missing book id.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getBook(bookId);
      setBook(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load book detail.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToShelf() {
    if (!book?.id) return;

    try {
      setAdding(true);
      setMessage(null);
      setError(null);

      await addBookToShelf(DEMO_USER_ID, book.id);

      setMessage("Added to My Shelf.");
    } catch (err) {
      console.error(err);
      setError("Failed to add this book to My Shelf.");
    } finally {
      setAdding(false);
    }
  }

  useEffect(() => {
    loadBook();
  }, [bookId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading book...</Text>
      </View>
    );
  }

  if (error && !book) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>

        <View style={styles.navRow}>
          <Link href="/" style={styles.link}>
            Home
          </Link>
          <Link href="/shelf" style={styles.link}>
            My Shelf
          </Link>
        </View>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Book not found.</Text>

        <View style={styles.navRow}>
          <Link href="/" style={styles.link}>
            Home
          </Link>
          <Link href="/shelf" style={styles.link}>
            My Shelf
          </Link>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.appTitle}>BookShire</Text>

      <View style={styles.card}>
        <Text style={styles.title}>{book.title}</Text>

        {book.subtitle ? <Text style={styles.subtitle}>{book.subtitle}</Text> : null}

        <View style={styles.metaBlock}>
          <Text style={styles.label}>Language</Text>
          <Text style={styles.value}>{book.original_language || "Unknown"}</Text>
        </View>

        <View style={styles.metaBlock}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.description}>
            {book.canonical_description || "No description yet."}
          </Text>
        </View>

        {book.categories?.length ? (
          <View style={styles.metaBlock}>
            <Text style={styles.label}>Categories</Text>
            <View style={styles.chips}>
              {book.categories.map((category) => (
                <Text key={category} style={styles.chip}>
                  {category}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {book.tags?.length ? (
          <View style={styles.metaBlock}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.chips}>
              {book.tags.map((tag) => (
                <Text key={tag} style={styles.chip}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        <Pressable
          style={[styles.button, adding ? styles.buttonDisabled : null]}
          onPress={handleAddToShelf}
          disabled={adding}
        >
          <Text style={styles.buttonText}>
            {adding ? "Adding..." : "Add to My Shelf"}
          </Text>
        </Pressable>

        {message ? <Text style={styles.success}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.navRow}>
        <Link href="/" style={styles.link}>
          Home
        </Link>
        <Link href="/shelf" style={styles.link}>
          My Shelf
        </Link>
      </View>
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
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 17,
    color: "#475569",
    lineHeight: 24,
  },
  metaBlock: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: "#0f172a",
  },
  description: {
    fontSize: 16,
    color: "#334155",
    lineHeight: 24,
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
  button: {
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
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
});
