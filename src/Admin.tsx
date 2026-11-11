import { FormEvent, useEffect, useState } from "react";
import { supabase, backendConfigured } from "./lib/supabase";

const ADMIN_EMAIL = "yididyachernet@gmail.com";
type Item = { id: string; content_type: string; title: string; summary: string | null; content: { body?: string } | null; status: "draft" | "published" | "archived" };

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("book");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [editingId, setEditingId] = useState<string | null>(null);

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
    setError("");
    const record = { content_type: type, title: title.trim(), summary: summary.trim(), content: { body }, status };
    const result = editingId
      ? await supabase.from("site_content").update(record).eq("id", editingId)
      : await supabase.from("site_content").insert(record);
    if (result.error) { setError(result.error.message); return; }
    resetForm();
    await loadItems();
  }

  function editItem(item: Item) {
    setEditingId(item.id); setType(item.content_type); setTitle(item.title);
    setSummary(item.summary || ""); setBody(item.content?.body || "");
    setStatus(item.status === "archived" ? "draft" : item.status);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null); setType("book"); setTitle(""); setSummary(""); setBody(""); setStatus("draft");
  }

  async function deleteItem(id: string) {
    if (!supabase || !window.confirm("Delete this item permanently?")) return;
    const { error } = await supabase.from("site_content").delete().eq("id", id);
    if (error) setError(error.message); else await loadItems();
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
    <header className="admin-header"><div><p className="eyebrow">PRIVATE CONTENT MANAGER</p><h1>Admin dashboard</h1><p className="muted">Signed in as {ADMIN_EMAIL}</p></div><button className="btn btn-secondary" onClick={() => supabase.auth.signOut()}>Sign out</button></header>
    <section className="admin-panel"><h2>{editingId ? "Edit content" : "Add content"}</h2><form onSubmit={saveItem} className="admin-form">
      <label>Content category</label><select value={type} onChange={e => setType(e.target.value)}><option value="book">Book</option><option value="project">Project</option><option value="resource">Learning resource</option><option value="article">Blog article</option></select>
      <label>Title</label><input value={title} onChange={e => setTitle(e.target.value)} required maxLength={160} />
      <label>Short description</label><textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2} />
      <label>Full content or details</label><textarea value={body} onChange={e => setBody(e.target.value)} rows={5} />
      <label>Publication status</label><select value={status} onChange={e => setStatus(e.target.value as "draft" | "published")}><option value="draft">Draft (private)</option><option value="published">Published (public)</option></select>
      {error && <p className="admin-error">{error}</p>}<div className="admin-actions"><button className="btn btn-primary" type="submit">{editingId ? "Save changes" : "Add item"}</button>{editingId && <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel edit</button>}</div>
    </form></section>
    <section className="admin-panel"><div className="admin-list-heading"><h2>Website content</h2><button className="btn btn-secondary" onClick={() => void loadItems()}>Refresh</button></div>
      {loading ? <p className="muted">Loading…</p> : items.length === 0 ? <p className="muted">No content yet. Add your first item above.</p> : <div className="admin-items">{items.map(item => <article className="admin-item" key={item.id}><div><span className="admin-tag">{item.content_type}</span> <span className="admin-tag">{item.status}</span><h3>{item.title}</h3><p className="muted">{item.summary}</p></div><div className="admin-actions"><button className="btn btn-secondary" onClick={() => editItem(item)}>Edit</button><button className="btn btn-danger" onClick={() => void deleteItem(item.id)}>Delete</button></div></article>)}</div>}
    </section><p className="admin-footnote">Charity campaign management will be added separately. Never publish beneficiary payment details without explicit consent and review.</p>
  </div></main>;
}
