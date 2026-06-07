"use client";

import type { BlueskyPost } from "@/types";
import { ExternalLink, Tag as TagIcon } from "lucide-react";

interface PostCardProps {
  post: BlueskyPost;
}

export default function PostCard({ post }: PostCardProps) {
  const record = post.post.record as unknown as Record<string, unknown> & {
    text?: string;
    embed?: { images?: Array<{ image: string; alt?: string }> };
  };
  const text = record.text || "";

  // Extract tags from text (after the main content, before #TheEDC)
  const tags = extractTags(text);

  // Get image URL if available
  const imageUrl = record.embed?.images?.[0]?.image;

  // Format date
  const date = new Date(post.post.indexedAt);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Image */}
      {imageUrl && (
        <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800">
          <img
            src={`https://cdn.bsky.social/imgproxy/${imageUrl}/resize:max=1024:1024/format:jpeg`}
            alt={record.embed?.images?.[0]?.alt || "EDC item"}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback: try direct blob URL if cdn fails
              (e.target as HTMLImageElement).src = `https://cdn.bsky.social/${imageUrl}`;
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Main text (without tags) */}
        {text && (
          <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
            {text.split("#")[0].trim()}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
              >
                <TagIcon size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 pt-1">
          <time dateTime={post.post.indexedAt}>
            {formatDate(date)}
          </time>
          <a
            href={post.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <ExternalLink size={12} />
            View on Bluesky
          </a>
        </div>
      </div>
    </div>
  );
}

function extractTags(text: string): string[] {
  const tagRegex = /#(\w+)/g;
  const tags: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(text)) !== null) {
    const tag = match[1];
    if (tag !== "TheEDC" && !tags.includes(tag)) {
      tags.push(tag);
    }
  }

  return tags;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}`;
}
