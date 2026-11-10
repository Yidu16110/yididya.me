import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";

const links = [
  ["/", "Home"], ["/about", "About"], ["/technology", "Technology"],
  ["/projects", "Projects"], ["/learning", "Learning"], ["/blog", "Blog"],
  ["/services", "Services"], ["/charity", "Charity"], ["/contact", "Contact"]
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  return <div className="site-shell">
    <header className="topbar">
      <div className="container nav-wrap">
        <Link to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark">Y</span><span>YIDIDYA<span className="brand-dot">.</span>ME</span></Link>
        <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav className={open ? "nav-links open" : "nav-links"}>
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)}>{label}</NavLink>)}
        </nav>
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="footer">
      <div className="container footer-grid">
        <div><Link to="/" className="brand"><span className="brand-mark">Y</span><span>YIDIDYA<span className="brand-dot">.</span>ME</span></Link><p className="muted footer-copy">Learning, building, innovating, and creating meaningful impact through technology.</p></div>
        <div><h4>Explore</h4><Link to="/projects">Projects</Link><Link to="/learning">Learning</Link><Link to="/charity">Community impact</Link></div>
        <div><h4>Connect</h4><a href="mailto:yididyachernet@gmail.com">Email me</a><a href="https://www.linkedin.com/in/yididya-asfaw-7ab974403/" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={13}/></a><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div>
      </div>
      <div className="container copyright">© {new Date().getFullYear()} Yididya Asfaw. Built with purpose.</div>
    </footer>
  </div>;
}