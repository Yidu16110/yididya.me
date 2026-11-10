import { ArrowUpRight, CheckCircle2, Code2, GraduationCap, HeartHandshake, Lightbulb, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

export function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <section className="page-intro"><div className="container"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lead">{text}</p></div></section>;
}
export function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{text && <p className="muted">{text}</p>}</div>;
}
export function FeatureCards() {
  const items = [
    { icon: <Code2/>, title: "Technology", text: "Exploring software development, AI, and practical digital tools.", to: "/technology" },
    { icon: <Rocket/>, title: "Projects", text: "Turning ideas into useful products and learning through building.", to: "/projects" },
    { icon: <GraduationCap/>, title: "Learning", text: "Sharing resources, notes, and a growing computer science journey.", to: "/learning" },
    { icon: <HeartHandshake/>, title: "Community impact", text: "Exploring responsible ways technology can connect people and help communities.", to: "/charity" }
  ];
  return <div className="feature-grid">{items.map(x => <Link className="feature-card" to={x.to} key={x.title}><span className="icon-box">{x.icon}</span><h3>{x.title}</h3><p>{x.text}</p><span className="card-arrow">Explore <ArrowUpRight size={15}/></span></Link>)}</div>;
}
export function Notice({ children }: { children: React.ReactNode }) { return <div className="notice"><Lightbulb size={18}/><div>{children}</div></div>; }
export function Pill({ children }: { children: React.ReactNode }) { return <span className="pill"><CheckCircle2 size={13}/>{children}</span>; }