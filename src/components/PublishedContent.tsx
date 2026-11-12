import { BookOpen, Download } from "lucide-react";
import { supabase } from "../lib/supabase";
import { fileKind, formatSize, publicFileUrl, TYPE_LABELS, usePublishedContent } from "../lib/content";
import { SectionHeading } from "./Blocks";

export default function PublishedContent({ section, topic, eyebrow, heading, text, emptyText }: {
  section: string; topic?: string; eyebrow: string; heading: string; text?: string; emptyText?: string;
}) {
  const { rows, loading, error } = usePublishedContent(section, topic);

  if (!supabase) return null;
  if (!loading && !error && rows.length === 0 && !emptyText) return null;

  return <div className="published-content" style={{ marginTop: "2.5rem" }}>
    <SectionHeading eyebrow={eyebrow} title={heading} text={text} />
    {loading && <p className="muted" role="status">Loading…</p>}
    {error && <p className="muted" role="alert">{error}</p>}
    {!loading && !error && rows.length === 0 && emptyText && <p className="muted">{emptyText}</p>}
    <div className="resource-grid">
      {rows.map(row => {
        const c = row.content;
        const url = publicFileUrl(c);
        const size = formatSize(c?.file_size);
        return <article className="resource-card" key={row.id}>
          <BookOpen />
          <p className="eyebrow">{TYPE_LABELS[row.content_type] || "Update"}</p>
          <h3>{row.title}</h3>
          {row.summary && <p className="muted">{row.summary}</p>}
          {c?.body && <details><summary>Read more</summary><p className="muted" style={{ whiteSpace: "pre-wrap" }}>{c.body}</p></details>}
          {url && <p><a className="btn btn-secondary" href={url} target="_blank" rel="noreferrer" aria-label={`Download ${row.title} (${fileKind(c?.file_name)}${size ? ", " + size : ""})`}>
            <Download size={16} /> Download {fileKind(c?.file_name)}{size ? ` · ${size}` : ""}
          </a></p>}
        </article>;
      })}
    </div>
  </div>;
}
