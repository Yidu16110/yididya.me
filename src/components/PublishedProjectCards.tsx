import { Download, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";
import { fileKind, formatSize, publicFileUrl, safeLink, TYPE_LABELS, usePublishedContent } from "../lib/content";

// Renders inside the existing project grid, so new projects appear next to the built-in ones.
export default function PublishedProjectCards() {
  const { rows, error } = usePublishedContent("projects");
  if (!supabase) return null;
  return <>
    {error && <p className="muted" role="alert" style={{ gridColumn: "1 / -1" }}>{error}</p>}
    {rows.map(row => {
      const c = row.content;
      const link = safeLink(c?.link);
      const file = publicFileUrl(c);
      const size = formatSize(c?.file_size);
      return <article className="project-card" key={row.id}>
        <div className="project-top"><span className="project-symbol">✳</span>{c?.status_label && <span className="status">{c.status_label}</span>}</div>
        <p className="eyebrow">{TYPE_LABELS[row.content_type] || "Project"}</p>
        <h3>{row.title}</h3>
        {row.summary && <p className="muted">{row.summary}</p>}
        {c?.body && <details><summary>Read more</summary><p className="muted" style={{ whiteSpace: "pre-wrap" }}>{c.body}</p></details>}
        {link && <p><a className="text-link" href={link} target="_blank" rel="noopener noreferrer">Open project <ExternalLink size={15} /></a></p>}
        {file && <p><a className="text-link" href={file} target="_blank" rel="noopener noreferrer">Download {fileKind(c?.file_name)}{size ? ` · ${size}` : ""} <Download size={15} /></a></p>}
      </article>;
    })}
  </>;
}
