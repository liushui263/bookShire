import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link } from "expo-router";
import { Book, getBooks } from "../lib/api";

export default function HomeScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBooks() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data = await getBooks();
        setBooks(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load books."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadBooks();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>BookShire</Text>
        <Text style={styles.title}>Build your personal book world.</Text>
        <Text style={styles.subtitle}>
          Browse books from the same FastAPI backend used by the web app.
        </Text>

        <View style={styles.navRow}>
          <Link href="/search" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Search</Text>
            </Pressable>
          </Link>

          <Link href="/shelf" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>My Shelf</Text>
            </Pressable>
          </Link>
        </View>

        {isLoading && (
          <View style={styles.centerBox}>
            <ActivityIndicator />
            <Text style={styles.mutedText}>Loading books...</Text>
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Book API failed</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {!isLoading && !errorMessage && (
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const tags = item.tags || item.categories || [];

              return (
                <Link href={`/books/${item.id}`} asChild>
                  <Pressable style={styles.card}>
                    <View style={styles.cover}>
                      <Text style={styles.coverText}>Cover</Text>
                    </View>

                    <View style={styles.cardBody}>
                      <Text style={styles.bookTitle}>{item.title}</Text>
                      {item.subtitle ? (
                        <Text style={styles.bookSubtitle}>{item.subtitle}</Text>
                      ) : null}

                      <View style={styles.tagRow}>
                        {tags.slice(0, 3).map((tag) => (
                          <Text key={tag} style={styles.tag}>
                            {tag}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </Pressable>
                </Link>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 10,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    color: "#030712",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: "#4b5563",
  },
  navRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#030712",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "700",
  },
  centerBox: {
    marginTop: 30,
    alignItems: "center",
    gap: 10,
  },
  mutedText: {
    color: "#6b7280",
  },
  errorBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorTitle: {
    fontWeight: "800",
    color: "#7f1d1d",
  },
  errorText: {
    marginTop: 8,
    color: "#991b1b",
    fontSize: 12,
  },
  listContent: {
    gap: 14,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cover: {
    width: 64,
    height: 92,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  coverText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  cardBody: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  bookSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  tag: {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
});
