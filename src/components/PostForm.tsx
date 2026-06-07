"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, Image as ImageIcon, Tag, Plus, Send, CheckCircle } from "lucide-react";

interface PostFormProps {
  onSuccess: () => void;
}

export default function PostForm({ onSuccess }: PostFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [altText, setAltText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const compressImage = useCallback((file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize to fit maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleImageSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    // Compress image to stay under Bluesky's 2MB limit
    const compressed = await compressImage(file);

    // If still too large, reduce quality further
    if (compressed.size > 1.8 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let w = img.width;
          let h = img.height;
          if (w > 1280) {
            h = Math.round((h * 1280) / w);
            w = 1280;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const finalFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                setImage(finalFile);
                const previewReader = new FileReader();
                previewReader.onloadend = () => setPreview(previewReader.result as string);
                previewReader.readAsDataURL(finalFile);
              }
            },
            "image/jpeg",
            0.7
          );
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(compressed);
    } else {
      setImage(compressed);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(compressed);
    }
  }, [compressImage]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleImageSelect(file);
    },
    [handleImageSelect]
  );

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, "");
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("altText", altText);
      formData.append("tags", tags.join(","));

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Post failed");
        return;
      }

      // Reset form and show success toast
      setImage(null);
      setPreview("");
      setAltText("");
      setTags([]);
      setTagInput("");
      setShowSuccess(true);
      onSuccess();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image upload area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          preview
            ? "border-zinc-300 dark:border-zinc-700"
            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageSelect(file);
          }}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImage(null);
                setPreview("");
              }}
              className="absolute top-1 right-1 bg-zinc-900/80 text-white rounded-full p-1 hover:bg-zinc-900"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-zinc-500 dark:text-zinc-400">
            <ImageIcon size={32} className="mx-auto" />
            <p className="text-sm">Drop an image or click to select</p>
          </div>
        )}
      </div>

      {/* Alt text */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Description (optional)
        </label>
        <input
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="What item is this?"
          maxLength={300}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-500"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Tags <span className="text-zinc-400 font-normal">#TheEDC will be added automatically</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={14} className="absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="e.g. knife, watch"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-500"
            />
          </div>
          <button
            type="button"
            onClick={addTag}
            disabled={!tagInput.trim()}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            <Plus size={14} />
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={!image || loading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-2.5 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={14} />
        {loading ? "Posting..." : "Post to Bluesky"}
      </button>

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-green-600 text-white px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">投稿完了！</span>
        </div>
      )}
    </form>
  );
}
