export type Campaign = {
  id: string; title: string; category: string; location: string; summary: string;
  organiser: string; status: "Demo" | "Pending review" | "Verified";
  contactLabel: string; contactValue: string; paymentNote: string;
};

export const campaigns: Campaign[] = [
  {
    id: "demo-education", title: "Education support campaign — demonstration",
    category: "Education", location: "Ethiopia",
    summary: "This is sample content to demonstrate how a community campaign listing could appear. It is not a real fundraising request.",
    organiser: "Example organiser (not verified)", status: "Demo",
    contactLabel: "No contact available", contactValue: "",
    paymentNote: "No bank details or donation instructions are provided for this demonstration."
  },
  {
    id: "demo-community", title: "Community assistance campaign — demonstration",
    category: "Community support", location: "Ethiopia",
    summary: "A second sample listing showing how an authorised organisation could explain its work and provide transparent updates.",
    organiser: "Example organisation (not verified)", status: "Demo",
    contactLabel: "No contact available", contactValue: "",
    paymentNote: "No donations are being collected through this website."
  }
];

export const projects = [
  { name: "TutorLink Ethiopia", type: "Education platform", description: "A concept for connecting students with tutors in subjects such as mathematics, English, science, and exam preparation.", url: "https://tutorlinkethiopia.base44.app", status: "Project in development" },
  { name: "Yididya.me", type: "Personal platform", description: "A home for my technology journey, projects, learning resources, services, and community initiatives.", url: "https://yididya.me", status: "Building" }
];

export const articles = [
  { title: "My journey into computer science", category: "Learning", date: "Coming soon", excerpt: "Notes from learning programming, exploring technology, and building practical projects." },
  { title: "Why technology should solve real problems", category: "Ideas", date: "Coming soon", excerpt: "Thinking about useful, accessible technology and the needs of local communities." },
  { title: "Building my first web projects", category: "Development", date: "Coming soon", excerpt: "Lessons from turning ideas into websites and learning through practice." }
];