import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  addBookToShelf,
  Book,
  createBookReview,
  updateReview,
  getBook,
  getBookReviews,
  Review,
} from "../../lib/api";

const DEMO_USER_ID =
  process.env.EXPO_PUBLIC_DEMO_USER_ID ||
  "86f7818b-788e-4d0b-9e81-9c8bc918ac44";

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function renderStars(rating?: number | null) {
  if (!rating) return "No rating";
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export default function MobileBookDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const bookId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [myReviewId, setMyReviewId] = useState<string | null>(null);
  const [reviewContent, setReviewContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const averageRating = useMemo(() => {
    const ratedReviews = reviews.filter(
      (review) => typeof review.rating === "number",
    );
    if (!ratedReviews.length) return null;

    const total = ratedReviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0,
    );
    return total / ratedReviews.length;
  }, [reviews]);

  function syncMyReview(reviewData: Review[]) {
    const mine = reviewData.find((review) => review.user_id === DEMO_USER_ID);

    if (mine) {
      setMyReviewId(mine.id);
      setSelectedRating(mine.rating || 5);
      setReviewContent(mine.content || "");
    } else {
      setMyReviewId(null);
      setSelectedRating(5);
      setReviewContent("");
    }
  }

  async function loadBook() {
    if (!bookId) {
      setError("Missing book id.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setReviewError(null);

      const [bookData, reviewData] = await Promise.all([
        getBook(bookId),
        getBookReviews(bookId),
      ]);

      setBook(bookData);
      setReviews(reviewData);
      syncMyReview(reviewData);
    } catch (err) {
      console.error(err);
      setError("Failed to load book detail.");
    } finally {
      setLoading(false);
    }
  }

  async function reloadReviews() {
    if (!bookId) return;

    try {
      setReviewError(null);
      const reviewData = await getBookReviews(bookId);
      setReviews(reviewData);
      syncMyReview(reviewData);
    } catch (err) {
      console.error(err);
      setReviewError("Failed to refresh reviews.");
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

  async function handleSubmitReview() {
    if (!book?.id) return;

    const trimmedContent = reviewContent.trim();

    if (!selectedRating && !trimmedContent) {
      setReviewError("Choose a rating or write a short review.");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError(null);
      setReviewMessage(null);

      if (myReviewId) {
        await updateReview(myReviewId, {
          rating: selectedRating,
          content: trimmedContent || null,
          visibility: "public",
        });
      } else {
        await createBookReview(book.id, {
          user_id: DEMO_USER_ID,
          rating: selectedRating,
          content: trimmedContent || null,
          visibility: "public",
        });
      }

      setReviewMessage(myReviewId ? "Review updated." : "Review saved.");
      await reloadReviews();
    } catch (err) {
      console.error(err);
      setReviewError(err instanceof Error ? err.message : "Failed to save review.");
    } finally {
      setSubmittingReview(false);
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

        {book.subtitle ? (
          <Text style={styles.subtitle}>{book.subtitle}</Text>
        ) : null}

        <View style={styles.metaBlock}>
          <Text style={styles.label}>Language</Text>
          <Text style={styles.value}>
            {book.original_language || "Unknown"}
          </Text>
        </View>

        <View style={styles.metaBlock}>
          <Text style={styles.label}>Rating</Text>
          <Text style={styles.ratingText}>
            {averageRating
              ? `${averageRating.toFixed(1)} / 5 from ${reviews.length} review${reviews.length === 1 ? "" : "s"}`
              : "No reviews yet"}
          </Text>
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

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Rate & Review</Text>
        <Text style={styles.muted}>
          {myReviewId
            ? "You already reviewed this book. Update your rating or note below."
            : "Share a quick rating or note for this book."}
        </Text>

        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <Pressable
              key={rating}
              onPress={() => setSelectedRating(rating)}
              style={styles.starButton}
            >
              <Text
                style={[
                  styles.star,
                  rating <= selectedRating
                    ? styles.starSelected
                    : styles.starMuted,
                ]}
              >
                ★
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.reviewInput}
          multiline
          value={reviewContent}
          onChangeText={setReviewContent}
          placeholder="Write a short review..."
          textAlignVertical="top"
        />

        <Pressable
          style={[
            styles.button,
            submittingReview ? styles.buttonDisabled : null,
          ]}
          onPress={handleSubmitReview}
          disabled={submittingReview}
        >
          <Text style={styles.buttonText}>
            {submittingReview
              ? "Saving..."
              : myReviewId
                ? "Update Review"
                : "Save Review"}
          </Text>
        </Pressable>

        {reviewMessage ? (
          <Text style={styles.success}>{reviewMessage}</Text>
        ) : null}
        {reviewError ? <Text style={styles.error}>{reviewError}</Text> : null}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <Text style={styles.reviewCount}>{reviews.length}</Text>
        </View>

        {reviews.length ? (
          <View style={styles.reviewList}>
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewStars}>
                    {renderStars(review.rating)}
                  </Text>
                  <Text style={styles.reviewDate}>
                    {formatDate(review.created_at)}
                  </Text>
                </View>

                {review.content ? (
                  <Text style={styles.reviewContent}>{review.content}</Text>
                ) : (
                  <Text style={styles.muted}>No written review.</Text>
                )}

                <Text style={styles.reviewMeta}>
                  Visibility: {review.visibility}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>
            No reviews yet. Be the first to add one.
          </Text>
        )}
      </View>

      <View style={styles.navRow}>
        <Link href="/" style={styles.link}>
          Home
        </Link>
        <Link href="/search" style={styles.link}>
          Search
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  reviewCount: {
    backgroundColor: "#e2e8f0",
    color: "#0f172a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "800",
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
  ratingText: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "700",
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
  starRow: {
    flexDirection: "row",
    gap: 4,
  },
  starButton: {
    paddingRight: 6,
    paddingVertical: 2,
  },
  star: {
    fontSize: 32,
  },
  starSelected: {
    color: "#ca8a04",
  },
  starMuted: {
    color: "#cbd5e1",
  },
  reviewInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  reviewList: {
    gap: 12,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 14,
    gap: 8,
    backgroundColor: "#f8fafc",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  reviewStars: {
    color: "#ca8a04",
    fontSize: 17,
    fontWeight: "800",
  },
  reviewDate: {
    color: "#64748b",
    fontSize: 13,
  },
  reviewContent: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 22,
  },
  reviewMeta: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
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
