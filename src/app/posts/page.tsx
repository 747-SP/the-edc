"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import PostCard from "@/components/PostCard";
import type { BlueskyPost } from "@/types";

export default function PostsPage() {
  const [postsByDate, setPostsByDate] = useState<Record<string, BlueskyPost[]>>({});
  const [selectedPosts, setSelectedPosts] = useState<BlueskyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/posts/history");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      // Group by date
      const grouped: Record<string, BlueskyPost[]> = {};
      for (const post of data.posts) {
        const dateStr = new Date(post.post.indexedAt).toISOString().split("T")[0];
        if (!grouped[dateStr]) grouped[dateStr] = [];
        grouped[dateStr].push(post);
      }

      setPostsByDate(grouped);
    } catch {
      setError("Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  function handleDayClick(dateStr: string) {
    const posts = postsByDate[dateStr] || [];
    setSelectedPosts(posts);
  }

  return (
    <div className="flex flex-1 w-full max-w-5xl mx-auto flex-col lg:flex-row gap-6 p-4 sm:p-8">
      {/* Calendar */}
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="text-center py-12 text-zinc-400">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <Calendar postsByDate={postsByDate} />
        )}
      </div>

      {/* Selected day posts */}
      {selectedPosts.length > 0 && (
        <div className="lg:w-96 flex-shrink-0 space-y-4">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {new Date(selectedPosts[0].post.indexedAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
          {selectedPosts.map((post) => (
            <PostCard key={post.uri} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
