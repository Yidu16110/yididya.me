
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import {
  About, Blog, Charity, Contact, Home, Learning, Privacy,
  Projects, Services, Technology, Terms
} from "./pages";
import { PageIntro } from "./components/Blocks";
import Admin from "./Admin";

function NotFound() {
  return <PageIntro eyebrow="404" title="Page not found" text="The page you are looking for may have moved or may not exist." />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="technology" element={<Technology />} />
        <Route path="projects" element={<Projects />} />
        <Route path="learning" element={<Learning />} />
        <Route path="blog" element={<Blog />} />
        <Route path="services" element={<Services />} />
        <Route path="charity" element={<Charity />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
