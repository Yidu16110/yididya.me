import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase, backendConfigured } from "./lib/supabase";

const ADMIN_EMAIL = "yididyachernet@gmail.com";
const PRIVATE_BUCKET = "website-files";
const PUBLIC_BUCKET = "public-resources";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
type ContentData = { body?: string; file_path?: string; file_name?: string; file_type?: string; file_size?: number; file_bucket?: string };
type Item = { id: string; content_type: string; title: string; summary: string | null; content: ContentData | null; status: "draft" | "published" | "archived" };

function bucketFor(item: ContentData | null | undefined) {
  return item?.file_bucket === PUBLIC_BUCKET ? PUBLIC_BUCKET : PRIVATE_BUCKET;
}

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState("book");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState<ContentData | null>(null);

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session?.user?.email === ADMIN_EMAIL) void loadItems(); }, [session]);

  async function loadItems() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from("site_content").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message); else setItems((data || []) as Item[]);
    setLoading(false);
  }

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setError(error.message); return; }
    if (data.user?.email !== ADMIN_EMAIL) { await supabase.auth.signOut(); setError("This account is not authorized."); }
  }

  async function saveItem(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setError(""); setNotice(""); setSaving(true);
    let newlyUploaded: { bucket: string; path: string } | null = null;
    let oldFileToRemove: { bucket: string; path: string } | null = null;
    let cleanupWarning = "";
    try {
      let fileData: ContentData = { ...(existingFile || {}), body };
      const targetBucket = status === "published" ? PUBLIC_BUCKET : PRIVATE_BUCKET;

      if (selectedFile) {
        const safeName = selectedFile.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
        const path = `resources/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from(targetBucket).upload(path, selectedFile, {
          cacheControl: "3600", upsert: false, contentType: selectedFile.type || "application/octet-stream"
        });
        if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`);
        newlyUploaded = { bucket: targetBucket, path };
        if (existingFile?.file_path) oldFileToRemove = { bucket: bucketFor(existingFile), path: existingFile.file_path };
        fileData = { ...fileData, file_path: path, file_bucket: targetBucket, file_name: selectedFile.name, file_type: selectedFile.type, file_size: selectedFile.size };
      } else if (existingFile?.file_path && bucketFor(existingFile) !== targetBucket) {
        const sourceBucket = bucketFor(existingFile);
        const sourcePath = existingFile.file_path;
        const { data: downloaded, error: downloadError } = await supabase.storage.from(sourceBucket).download(sourcePath);
        if (downloadError || !downloaded) throw new Error(`Could not move existing file: ${downloadError?.message || "Download failed"}`);
        const { error: uploadError } = await supabase.storage.from(targetBucket).upload(sourcePath, downloaded, {
          cacheControl: "3600", upsert: false, contentType: existingFile.file_type || "application/octet-stream"
        });
        if (uploadError) throw new Error(`Could not move file to ${targetBucket}: ${uploadError.message}`);
        newlyUploaded = { bucket: targetBucket, path: sourcePath };
        oldFileToRemove = { bucket: sourceBucket, path: sourcePath };
        fileData = { ...fileData, file_bucket: targetBucket };
      }

      const record = { content_type: type, title: title.trim(), summary: summary.trim(), content: fileData, status };
      const result = editingId
        ? await supabase.from("site_content").update(record).eq("id", editingId)
        : await supabase.from("site_content").insert(record);
      if (result.error) throw new Error(`Content save failed: ${result.error.message}`);

      if (oldFileToRemove && (oldFileToRemove.bucket !== newlyUploaded?.bucket || oldFileToRemove.path !== newlyUploaded?.path)) {
        const { error: removeError } = await supabase.storage.from(oldFileToRemove.bucket).remove([oldFileToRemove.path]);
        if (removeError) cleanupWarning = `Saved successfully, but the old file could not be removed: ${removeError.message}`;
      } else if (oldFileToRemove && newlyUploaded && oldFileToRemove.bucket !== newlyUploaded.bucket) {
        const { error: removeError } = await supabase.storage.from(oldFileToRemove.bucket).remove([oldFileToRemove.path]);
        if (removeError) cleanupWarning = `Saved successfully, but the old file could not be removed: ${removeError.message}`;
      }
      resetForm();
      setNotice(cleanupWarning || (status === "published" ? "Published successfully. The attached file is in the public-resources bucket." : "Saved as a draft. The attached file is in the private website-files bucket."));
      await loadItems();
    } catch (e) {
      if (newlyUploaded) await supabase.storage.from(newlyUploaded.bucket).remove([newlyUploaded.path]);
      setError(e instanceof Error ? e.message : "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  function editItem(item: Item) {
    setEditingId(item.id); setType(item.content_type); setTitle(item.title);
    setSummary(item.summary || ""); setBody(item.content?.body || "");
    setExistingFile(item.content?.file_path ? item.content : null);
    setSelectedFile(null);
    setStatus(item.status === "archived" ? "draft" : item.status);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null); setType("book"); setTitle(""); setSummary(""); setBody("");
    setStatus("draft"); setSelectedFile(null); setExistingFile(null);
  }

  async function deleteItem(item: Item) {
    if (!supabase || !window.confirm("Delete this item permanently?")) return;
    setError(""); setNotice("");
    const { error } = await supabase.from("site_content").delete().eq("id", item.id);
    if (error) { setError(error.message); return; }
    if (item.content?.file_path) {
      const { error: fileError } = await supabase.storage.from(bucketFor(item.content)).remove([item.content.file_path]);
      if (fileError) setError(`Content deleted, but its stored file could not be removed: ${fileError.message}`);
    }
    await loadItems();
  }

  function publicUrl(item: Item) {
    if (!supabase || !item.content?.file_path || bucketFor(item.content) !== PUBLIC_BUCKET || item.status !== "published") return null;
    return supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(item.content.file_path).data.publicUrl;
  }

  if (checking) return <main className="admin-page"><p>Checking secure session…</p></main>;
  if (!backendConfigured || !supabase) return <main className="admin-page"><h1>Admin setup required</h1><p>Check the Netlify environment variables and redeploy.</p></main>;

  if (session?.user?.email !== ADMIN_EMAIL) return (
    <main className="admin-page"><form className="admin-panel admin-login" onSubmit={signIn}>
      <p className="eyebrow">PRIVATE AREA</p><h1>Admin sign in</h1>
      <p className="muted">Sign in with the authorized administrator account.</p>
      <label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" />
      <label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
      {error && <p className="admin-error">{error}</p>}<button className="btn btn-primary" type="submit">Sign in</button>
    </form></main>
  );

  return <main className="admin-page"><div className="admin-wrap">
    <header className="admin-header"><div><p className="eyebrow">PRIVATE CONTENT MANAGER</p><h1>Admin dashboard</h1><p className="muted">Signed in as {ADMIN_EMAIL}</p></div><button className="btn btn-secondary" onClick={() => void supabase!.auth.signOut()}>Sign out</button></header>
    <section className="admin-panel"><h2>{editingId ? "Edit content" : "Add content"}</h2><form onSubmit={saveItem} className="admin-form">
      <label>Content category</label><select value={type} onChange={e => setType(e.target.value)}><option value="book">Book</option><option value="project">Project</option><option value="resource">Learning resource</option><option value="article">Blog article</option></select>
      <label>Title</label><input value={title} onChange={e => setTitle(e.target.value)} required maxLength={160} />
      <label>Short description</label><textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2} />
      <label>Full content or details</label><textarea value={body} onChange={e => setBody(e.target.value)} rows={5} />
      <label>Attach a file (PDF, DOC, DOCX, or image; maximum 20 MB)</label>
      {existingFile?.file_name && <p className="muted">Current file: {existingFile.file_name} ({bucketFor(existingFile) === PUBLIC_BUCKET ? "public" : "private"}). Choose another file to replace it.</p>}
      <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
      {selectedFile && <p className="muted">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>}
      {selectedFile && selectedFile.size > MAX_FILE_SIZE && <p className="admin-error">This file is larger than 20 MB.</p>}
      <label>Publication status</label><select value={status} onChange={e => setStatus(e.target.value as "draft" | "published")}><option value="draft">Draft (private)</option><option value="published">Published (public)</option></select>
      <p className="muted">Draft files stay in private storage. Published files are placed in the public-resources bucket and can be downloaded by anyone with their link.</p>
      {error && <p className="admin-error">{error}</p>}{notice && <p className="admin-notice">{notice}</p>}
      <div className="admin-actions"><button className="btn btn-primary" type="submit" disabled={saving || (!!selectedFile && selectedFile.size > MAX_FILE_SIZE)}>{saving ? "Saving and uploading…" : editingId ? "Save changes" : "Add item"}</button>{editingId && <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel edit</button>}</div>
    </form></section>
    <section className="admin-panel"><div className="admin-list-heading"><h2>Website content</h2><button className="btn btn-secondary" onClick={() => void loadItems()}>Refresh</button></div>
      {loading ? <p className="muted">Loading…</p> : items.length === 0 ? <p className="muted">No content yet. Add your first item above.</p> : <div className="admin-items">{items.map(item => { const url = publicUrl(item); return <article className="admin-item" key={item.id}><div><span className="admin-tag">{item.content_type}</span> <span className="admin-tag">{item.status}</span><h3>{item.title}</h3><p className="muted">{item.summary}</p>{item.content?.file_name && <p className="muted">📎 {item.content.file_name} ({bucketFor(item.content) === PUBLIC_BUCKET ? "public" : "private"})</p>}{url && <p><a href={url} target="_blank" rel="noreferrer">Open public download link</a></p>}</div><div className="admin-actions"><button className="btn btn-secondary" onClick={() => editItem(item)}>Edit</button><button className="btn btn-danger" onClick={() => void deleteItem(item)}>Delete</button></div></article>; })}</div>}
    </section><p className="admin-footnote">Only published files are stored in the public bucket. Draft files remain private. The public download link can be shared directly; website resource pages still need to be connected to these records.</p>
  </div></main>;
}
