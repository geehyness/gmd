export type ProjectLink = {
    label: string;
    url: string;
    note?: string;
};

export type Project = {
    id: string;
    name: string;
    shortDescription?: string;
    longDescription?: string;
    tech?: string[];
    links?: ProjectLink[];
    credentials?: { username?: string; password?: string; note?: string } | null;
    year?: number;
    role?: string;
    repo?: string;
    screenshotAlt?: string;
};

export const projectsData: Project[] = [
    {
        id: 'chairapp',
        name: 'The Chair App',
        shortDescription: 'A modern restaurant POS built with Next.js and Sanity.',
        longDescription: 'Kimmy\'s is a full-featured point-of-sale system: real-time menu management and staff dashboards. Built with Next.js App Router, Sanity.io, and Chakra UI.',
        tech: ['Next.js', 'Sanity', 'TypeScript', 'Chakra UI', 'Postgres'],
        links: [
            { label: 'Customer site', url: 'https://kimmys.vercel.app/' },
            { label: 'Admin dashboard', url: 'https://kimmys-dash.vercel.app/login', note: 'Login required' },
        ],
        credentials: { username: 'demo@caterflow.com', password: 'DemoPass123', note: 'Reset every 24h' },
        year: 2025,
        role: 'Lead developer',
        repo: 'https://github.com/geehyness/kimmys-site/',
        screenshotAlt: 'Kimmy\'s homepage with menu and order modal',
    },
    {
        id: 'kimmys',
        name: 'Kimmy\'s Food Orders',
        shortDescription: 'A modern restaurant POS built with Next.js and Sanity.',
        longDescription: 'Kimmy\'s is a full-featured point-of-sale system: real-time menu management and staff dashboards. Built with Next.js App Router, Sanity.io, and Chakra UI.',
        tech: ['Next.js', 'Sanity', 'TypeScript', 'Chakra UI', 'Postgres'],
        links: [
            { label: 'Customer site', url: 'https://kimmys.vercel.app/' },
            { label: 'Admin dashboard', url: 'https://kimmys-dash.vercel.app/login', note: 'Login required' },
        ],
        credentials: { username: 'demo@caterflow.com', password: 'DemoPass123', note: 'Reset every 24h' },
        year: 2025,
        role: 'Lead developer',
        repo: 'https://github.com/geehyness/kimmys-site/',
        screenshotAlt: 'Kimmy\'s homepage with menu and order modal',
    },
    {
        id: 'house-viewer',
        name: '3D House Viewer',
        shortDescription: 'An interactive 3D house explorer using Three.js and Cannon.js.',
        longDescription: 'A walkable, physics-enabled 3D house viewer with day-night cycle, mobile joystick controls and model collision. Great for showcasing frontend and real-time interaction skills.',
        tech: ['Three.js', 'Cannon.js', 'React', 'TypeScript'],
        links: [{ label: 'Live demo', url: 'https://houseviewer.example.com' }],
        credentials: null,
        year: 2025,
        role: 'Frontend engineer',
        repo: 'https://github.com/yourusername/house-viewer',
        screenshotAlt: '3D house viewer scene with sunlight and UI',
    },
    // Add more projects here as needed
];