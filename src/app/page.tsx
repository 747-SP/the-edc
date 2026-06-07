"use client";

import { useState, useEffect } from "react";
import LoginScreen from "@/components/LoginScreen";
import PostForm from "@/components/PostForm";
import { LogOut, Calendar as CalendarIcon } from "lucide-react";
import PostCard from "@/components/PostCard";

interface Session {
  did: string;
  handle: string;
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if session exists via a quick API call
    fetch("/api/posts/history")
      .then((res) => {
        if (res.ok) setSession({ did: "authenticated", handle: "user" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="flex flex-1 w-full items-center justify-center">
        <p className="text-zinc-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className="flex flex-1 w-full max-w-5xl mx-auto flex-col lg:flex-row gap-6 p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between w-full lg:col-span-2 mb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            The EDC
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            Everyday Carry &middot; Bluesky
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/posts"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <CalendarIcon size={14} />
            Archive
          </a>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>

      {/* Post form */}
      <div className="lg:w-96 flex-shrink-0">
        <PostForm onSuccess={() => {}} />
      </div>

      {/* Recent posts preview */}
      <RecentPosts />
    </div>
  );
}

function RecentPosts() {
  const [posts, setPosts] = useState<BlueskyPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts/history")
      .then((res) => res.json())
      .then((data) => {
        // Sort by date descending, take last 5
        const sorted = (data.posts || []).sort(
          (a: BlueskyPost, b: BlueskyPost) =>
            new Date(b.post.indexedAt).getTime() - new Date(a.post.indexedAt).getTime()
        );
        setPosts(sorted.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <div className="flex-1 min-w-0 space-y-4">
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Recent Posts
      </h2>
      {posts.map((post) => (
        <PostCard key={post.uri} post={post} />
      ))}
    </div>
  );
}

interface BlueskyPost {
  uri: string;
  cid: string;
  post: {
    record: any;
    author: any;
    indexedAt: string;
  };
}
