import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Book, searchBooks } from "../lib/api";

export default function MobileSearchScreen() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) {
      setBooks([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setBooks(await searchBooks(trimmed));
    } catch (err) {
      console.error(err);
      setError("Search failed. Check that the backend is reachable from Expo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>BookShire</Text>
        <Text style={styles.title}>Search books</Text>

        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            placeholder="Title, category, tag, keyword"
            autoCapitalize="none"
            style={styles.input}
          />
          <Pressable style={styles.button} onPress={handleSearch} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "..." : "Search"}</Text>
          </Pressable>
        </View>

        <View style={styles.navRow}>
          <Link href="/" style={styles.link}>Home</Link>
          <Link href="/shelf" style={styles.link}>My Shelf</Link>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator />
            <Text style={styles.muted}>Searching...</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !loading && query.trim() ? (
              <Text style={styles.muted}>No matching books.</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <Link href={`/books/${item.id}`} asChild>
              <Pressable style={styles.card}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
                <Text style={styles.muted}>
                  {Array.from(new Set([...(item.categories || []), ...(item.tags || [])])).slice(0, 4).join(" · ") || "No categories/tags"}
                </Text>
              </Pressable>
            </Link>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  container: { flex: 1, padding: 20, gap: 14 },
  kicker: { fontSize: 12, fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: 1 },
  title: { fontSize: 30, fontWeight: "900", color: "#0f172a" },
  searchRow: { flexDirection: "row", gap: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#cbd5e1", backgroundColor: "white", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  button: { backgroundColor: "#0f172a", borderRadius: 14, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "white", fontWeight: "800" },
  navRow: { flexDirection: "row", gap: 18 },
  link: { color: "#2563eb", fontWeight: "800" },
  centerBox: { alignItems: "center", gap: 8, marginTop: 20 },
  list: { gap: 12, paddingBottom: 40 },
  card: { backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 18, padding: 16, gap: 6 },
  bookTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  subtitle: { color: "#475569" },
  muted: { color: "#64748b" },
  error: { color: "#b91c1c", backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", padding: 12, borderRadius: 14 },
});
