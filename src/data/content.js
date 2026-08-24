// ─────────────────────────────────────────────────────────────
// EVERY word on the site lives in this file. Edit here only.
// Items marked TODO are placeholders you must replace before
// deploying — especially the social links and project URLs.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: 'Anas Abdulmajeed',
  // The hero prints each word of `name` on its own line.
  role: 'Full-Stack Developer',
  focus: 'Laravel · React · TypeScript',
  tagline:
    'Seven years shipping web platforms in Saudi Arabia — from national-event frontends to multi-tenant SaaS.',
  location: 'Jeddah, Saudi Arabia',
  availability: 'Open to full-time & freelance', // TODO: adjust to your actual availability
  email: 'anasabdulmajeed687@gmail.com',

  socials: [
    { label: 'GitHub', url: '#' }, // TODO: add your GitHub URL
    { label: 'LinkedIn', url: '#' }, // TODO: add your LinkedIn URL
  ],

  about: [
    'I build complete products — design file to production. Since 2019 I have delivered 25+ client sites at Koraspond in Jeddah, working from Figma through custom WordPress builds, JavaScript and GSAP motion, multilingual delivery, and REST API integrations.',
    'The last few years shifted toward product engineering: a multi-tenant restaurant platform on Laravel 11 with Inertia and React, a browser PDF and EPUB reader engine, GCC payment architecture on HyperPay, and interactive tools for the Islamic Development Bank Group.',
  ],

  clients:
    'Saudi Games · IsDB Group · Mitsubishi · Jetour · Petromin · Sheel · Durrah · Namariq',

  stats: [
    { value: 7, suffix: '+', label: 'Years shipping' },
    { value: 25, suffix: '+', label: 'Client sites delivered' },
    { value: 4, suffix: '', label: 'Products engineered' },
  ],

  // Marquee rows — row one is the stack, row two is the practice.
  stack: ['Laravel', 'React', 'TypeScript', 'WordPress', 'GSAP', 'Tailwind', 'Vite', 'PHP'],
  practice: [
    'Figma to production',
    'Multilingual builds',
    'Payment integration',
    'Motion design',
    'REST APIs',
    'Accessibility',
  ],

  projects: [
    {
      title: 'Lightforma',
      category: 'Creative Development',
      year: '2026',
      description: 'An immersive digital experience for Lightforma, blending interactive visuals, motion, and 3D elements to create a modern web presence.',
      meta: 'React . GSAP . Three Js',
      link: 'https://light-forma.vercel.app',
      image: '/work/lightforma.jpg',
      tint: 'rgba(238, 170, 60, 0.13)',
    },
    {
      title: 'Mall Wayfinding',
      category: 'Web app + kiosk',
      year: '2024',
      description:
        'Interactive wayfinding for a shopping mall — a web app and a fixed touch-screen kiosk, redesigned for tourists, families and accessibility.',
      meta: 'React · TypeScript · Leaflet',
      link: 'https://wayfindr.me', // TODO
      image: '/work/wayfindr.jpg',
      tint: 'rgba(120, 160, 150, 0.14)',
    },
    {
      title: 'Restaurant Platform',
      category: 'Multi-tenant SaaS',
      year: '2025',
      description:
        'Role-based management platform — owner, manager, staff and kitchen views with per-restaurant permission overrides and accessibility-first theming.',
      meta: 'Laravel 13 · Inertia · React 18 · TypeScript',
      link: 'https://thefoodmenu.app', // TODO
      image: '/work/thefoodmenu.jpg',
      tint: 'rgba(90, 130, 190, 0.16)',
    },
    {
      title: 'PDF Reader Engine',
      category: 'Product · in development',
      year: '2026',
      description:
        'Browser reader and annotation engine: text markup, notes, bookmarks, search and offline support for documents past 500 MB and 10,000 pages.',
      meta: 'React · PDF.js · Zustand · TanStack Query',
      link: 'https://read.isdbinstitute.org', // TODO
      image: '/work/isdb-reader.jpg',
      tint: 'rgba(238, 122, 60, 0.12)',
    },
    {
      title: 'IsDB Group Portfolio',
      category: 'Multi-year institutional work',
      year: '2019–24',
      description:
        'Annual reports, annual meetings, the 50th-anniversary site and a React-based publications reader for the Islamic Development Bank Group.',
      meta: 'WordPress · WooCommerce · React',
      link: 'https://isdbinstitute.org', // TODO
      image: '/work/isdb-institute.jpg',
      tint: 'rgba(200, 170, 110, 0.14)',
    },
    {
      title: 'Red Sea Mall',
      category: 'Retail & destination experiences',
      year: '2023–24',
      description:
        'A high-visibility digital experience for Red Sea Mall, Jeddah — designed and developed to showcase the destination, its brands, experiences, and visitor information across a multilingual frontend.',
      meta: 'Laravel · GSAP · Multilingual · Blade',
      link: 'https://redseamall.com', // TODO
      image: '/work/redseamall.jpg',
      tint: 'rgba(238, 122, 60, 0.16)',
    },
    {
      title: 'Petrolube',
      category: 'Corporate & industrial',
      year: '2023–24',
      description:
        'A modern corporate digital experience for Petrolube — Saudi Arabia’s largest independent lubricants producer. Designed and developed to present its product portfolio, industries, capabilities, sustainability initiatives, and global presence through a multilingual, performance-focused frontend.',
      meta: 'WordPress · GSAP · Multilingual · Blade',
      link: 'https://www.petrolubegroup.com',
      image: '/work/petrolube.jpg',
      tint: 'rgba(238, 122, 60, 0.16)',
    },
  ],

  contact: {
    eyebrow: 'Got a project?',
    heading: 'Let’s build something that ships.',
    note: 'Tell me what you’re making — I’ll reply within a day.',
  },
}
