export interface Experience {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  current?: boolean;
  monogram: string;
  color: 'green' | 'yellow' | 'purple' | 'blue' | 'peach' | 'gray';
  tags: string[];
  bullets: string[];
}
export interface SkillGroup {
  name: string;
  skills: string[];
}
export interface ContactLink {
  id: 'github' | 'linkedin' | 'email' | 'phone';
  label: string;
  href: string;
  external: boolean;
  accessibleLabel: string;
}
export const profile = {
  name: 'Cliff Randy D. Carcueva',
  givenName: 'Cliff Randy',
  familyName: 'Carcueva',
  shortName: 'Cliff Carcueva',
  brand: 'crc',
  role: 'Full Stack Developer',
  location: { short: 'Davao, PH', full: 'Davao City, Philippines' },
  resumeUrl: '/Cliff_Randy_Carcueva_Resume.pdf',
  careerStartYear: 2011,
  yearsExperience: 15,
  featuredStack: ['React', 'Next.js', 'TypeScript', 'Node.js'],
  mindset: 'Always learning',
  email: 'cliffrandycarcueva@gmail.com',
  phone: '+63 999 995 2843',
  github: 'https://github.com/cliffrandycarcueva',
  linkedin: 'https://linkedin.com/in/cliff-randy-carcueva-9b556975/',
};
export const experiences: Experience[] = [
  {
    id: 'jairosoft-senior',
    current: true,
    company: 'Jairosoft Inc.',
    role: 'Senior Full Stack Developer',
    start: 'Jun 2024',
    end: 'Present',
    monogram: 'J',
    color: 'green',
    tags: ['React', 'Angular', 'NestJS', 'TypeScript', 'PostgreSQL'],
    bullets: [
      'Design and develop enterprise web applications using React, Angular, NestJS, TypeScript, and PostgreSQL.',
      'Leverage AI-assisted development tools, including OpenAI Codex and Claude Code, to accelerate development of reusable components, API endpoints, and frontend implementations.',
      'Use Codex and Claude Code to translate Figma designs into reusable, production-ready React/Next.js components while maintaining consistency with established UI patterns and coding standards.',
      'Integrate GitHub Copilot into the development workflow to assist with code reviews, coding standards, and pull-request quality checks.',
      'Build frontend interfaces and backend REST APIs following clean architecture principles.',
      'Participate in application architecture discussions and technical solution planning.',
      'Perform peer code reviews to maintain code quality, consistency, and engineering standards.',
      'Conduct technical training and mentor developers on Bubble and Sitecore technologies.',
      'Diagnose and resolve complex production issues while improving application reliability and performance.',
      'Collaborate with product owners, QA engineers, designers, and developers throughout the Agile software development lifecycle.',
    ],
  },
  {
    id: 'jairosoft-frontend',
    company: 'Jairosoft Inc.',
    role: 'Frontend Developer',
    start: 'Jun 2021',
    end: 'Jun 2024',
    monogram: 'J',
    color: 'green',
    tags: ['AngularJS', 'jQuery', 'JavaScript', 'REST APIs'],
    bullets: [
      'Developed and maintained enterprise web applications using AngularJS, jQuery, HTML, CSS, and JavaScript.',
      'Integrated REST APIs with frontend applications to deliver dynamic user experiences.',
      'Maintained legacy applications while implementing new features and resolving production issues.',
      'Participated in code reviews and application testing to support software quality.',
      'Collaborated with backend developers, QA engineers, and project stakeholders throughout development.',
    ],
  },
  {
    id: 'lemontech',
    company: 'Lemontech IT Solutions',
    role: 'Frontend Developer',
    start: 'Oct 2019',
    end: 'Jun 2021',
    monogram: 'L',
    color: 'yellow',
    tags: ['React', 'Redux', 'Ant Design'],
    bullets: [
      'Built modern React applications using Redux and Ant Design.',
      'Developed reusable UI components to improve maintainability and consistency.',
      'Optimized frontend performance and responsiveness across multiple browsers.',
      'Collaborated with cross-functional teams throughout software development projects.',
      'Conducted code reviews and assisted in improving development standards.',
    ],
  },
  {
    id: 'nutnull',
    company: 'Nutnull IT Solutions',
    role: 'Web Developer',
    start: 'Sep 2018',
    end: 'Oct 2019',
    monogram: 'N',
    color: 'purple',
    tags: ['Angular', 'Responsive UI'],
    bullets: [
      'Developed Angular-based enterprise web applications and responsive user interfaces.',
      'Debugged production issues and optimized existing application features.',
      'Worked with project teams to implement business requirements.',
    ],
  },
  {
    id: 'dslc',
    company: 'DSLC Data Support Inc.',
    role: 'Web Developer',
    start: 'Nov 2016',
    end: 'Apr 2018',
    monogram: 'D',
    color: 'blue',
    tags: ['ASP.NET', 'C#', 'SQL'],
    bullets: [
      'Developed ASP.NET and C# business applications.',
      'Designed and maintained SQL database features and reusable application modules.',
      'Assisted with system enhancements and production support.',
    ],
  },
  {
    id: 'lanes',
    company: 'Lanes Systems Inc.',
    role: 'Web Developer',
    start: 'Sep 2014',
    end: 'Aug 2016',
    monogram: 'L',
    color: 'peach',
    tags: ['ASP.NET', 'VB.NET'],
    bullets: [
      'Developed enterprise applications using ASP.NET and VB.NET.',
      'Provided application maintenance and technical support.',
      'Resolved production issues while improving system stability.',
    ],
  },
  {
    id: 'exerius',
    company: 'Exerius International Ltd.',
    role: 'Junior Software Developer',
    start: 'Jul 2011',
    end: 'Jul 2014',
    monogram: 'E',
    color: 'gray',
    tags: ['ASP.NET', 'Application Support'],
    bullets: [
      'Developed and maintained ASP.NET applications.',
      'Assisted senior developers throughout the software development lifecycle.',
      'Fixed software defects, supported feature enhancements, and addressed client requirements.',
    ],
  },
];
export const skillGroups: SkillGroup[] = [
  {
    name: 'Frontend',
    skills: [
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript',
      'Angular',
      'AngularJS',
      'Redux',
      'Tailwind CSS',
      'HTML5',
      'CSS3',
      'Ant Design',
      'Bootstrap',
      'Bulma',
      'jQuery',
    ],
  },
  {
    name: 'Backend',
    skills: [
      'Node.js',
      'NestJS',
      'REST API Development',
      'ASP.NET',
      'C#',
      'VB.NET',
      'PHP (Minimal knowledge)',
      'Laravel (Minimal knowledge)',
    ],
  },
  {
    name: 'Database',
    skills: [
      'PostgreSQL',
      'Microsoft SQL Server',
      'MySQL',
      'TypeORM',
      'Database Design',
      'Query Optimization',
    ],
  },
  {
    name: 'AI & tooling',
    skills: [
      'Claude Code',
      'GitHub Copilot',
      'OpenAI Codex',
      'AI-assisted coding',
      'Code generation',
      'Code review',
    ],
  },
  {
    name: 'Engineering',
    skills: [
      'Frontend Architecture',
      'API Integration',
      'Performance Optimization',
      'Code Reviews',
      'Technical Mentoring',
      'Agile/Scrum',
      'Git',
      'Production Support',
      'Azure DevOps — Deployments & Pipelines (Minimal knowledge)',
    ],
  },
];

export const navigation = [
  { id: 'about', label: 'about' },
  { id: 'experience', label: 'experience' },
  { id: 'skills', label: 'skills' },
  { id: 'contact', label: 'contact' },
] as const;
export const contactLinks = {
  github: {
    id: 'github',
    label: 'GitHub',
    href: profile.github,
    external: true,
    accessibleLabel: 'GitHub',
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    href: profile.linkedin,
    external: true,
    accessibleLabel: 'LinkedIn',
  },
  email: {
    id: 'email',
    label: 'Email',
    href: `mailto:${profile.email}`,
    external: false,
    accessibleLabel: `Email ${profile.shortName}`,
  },
  phone: {
    id: 'phone',
    label: 'Call',
    href: `tel:${profile.phone.replace(/\s/g, '')}`,
    external: false,
    accessibleLabel: `Call ${profile.phone}`,
  },
} satisfies Record<ContactLink['id'], ContactLink>;
export const socialLinks = {
  icons: [contactLinks.github, contactLinks.linkedin, contactLinks.email],
  text: [contactLinks.github, contactLinks.linkedin, contactLinks.phone],
};
export const about = {
  tagline: ['Thoughtful code.', 'Reliable experiences.'],
  description: `I build enterprise web applications from interface to infrastructure. ${profile.yearsExperience}+ years of turning complex requirements into software that works.`,
  heading: ['Built on experience.', 'Focused on what\u2019s next.'],
  paragraphs: [
    'I\u2019m a Senior Full Stack Developer with experience building and maintaining enterprise web applications for local and international clients. My work spans frontend architecture, REST APIs, database design, and performance optimization.',
    'Beyond writing code, I enjoy helping teams grow through code reviews and technical mentoring. I bring a hands-on approach to production support and Agile collaboration, with AI-assisted tools as part of my development workflow.',
  ],
};
export const statistics = [
  { value: profile.yearsExperience, suffix: '+', label: 'Years in development' },
  { value: experiences.length, label: 'Roles along the way' },
  { value: 'Full stack', label: 'Frontend to database' },
  { value: profile.mindset, suffix: '\u2197', label: 'Engineering with curiosity' },
];
export const education = {
  degree: 'BS in Information Technology',
  school: 'STI College Davao',
  year: 2011,
};
export const languages = [
  { name: 'English', proficiency: 'Professional working proficiency' },
  { name: 'Filipino', proficiency: 'Native' },
];
