import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export const PUBLIC_BUCKET = "public-resources";

export const LEARNING_TOPICS = [
  { value: "python", label: "Python foundations", description: "Variables, conditions, loops, functions, and small projects." },
  { value: "web", label: "Web development", description: "HTML, CSS, JavaScript, responsive layouts, and React." },
  { value: "cs", label: "Computer science", description: "Problem-solving, algorithms, data structures, and core concepts." },
  { value: "ai", label: "AI foundations", description: "Understanding AI, data, machine learning, and responsible use." }
];

export const TYPE_LABELS: Record<string, string> = {
  book: "Book", project: "Project", resource: "Learning Resource", article: "Article", update: "Update"
};

export type ContentData = {
  section?: string; topic?: string; link?: string; status_label?: string; body?: string;
  file_path?: string; file_name?: string; file_type?: string; file_size?: number; file_bucket?: string;
};
export type PublishedRow = {
  id: string; content_type: string; title: string; summary: string | null; content: ContentData | null; created_at: string;
};

export function publicFileUrl(c: ContentData | null | undefined) {
  if (!supabase || !c?.file_path || c.file_bucket !== PUBLIC_BUCKET) return null;
  return supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(c.file_path).data.publicUrl;
}

export function safeLink(value: string | undefined) {
  if (!value) return null;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch { return null; }
}

export function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
export function fileKind(name?: string) {
  const ext = name?.split(".").pop()?.toUpperCase();
  return ext && ext.length <= 5 ? ext : "File";
}

export function usePublishedContent(section: string, topic?: string) {
  const [rows, setRows] = useState<PublishedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError("");
    async function load() {
      if (!supabase) { setLoading(false); return; }
      let query = supabase
        .from("site_content")
        .select("id, content_type, title, summary, content, created_at")
        .eq("status", "published")
        .eq("content->>section", section);
      if (topic) query = query.eq("content->>topic", topic);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) setError("Content could not be loaded right now. Please try again later.");
      else setRows((data || []) as PublishedRow[]);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [section, topic]);

  return { rows, loading, error };
}
