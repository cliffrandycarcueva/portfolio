import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Moon,
  Sun,
  Terminal,
} from 'lucide-react';
import { experiences, profile, skillGroups } from './data';
import './styles.css';

const companyColors: Record<string, string> = {
  green: 'bg-[#edf2e8] text-[#617b4f]',
  yellow: 'bg-[#f7f3df] text-[#b39e42]',
  purple: 'bg-[#eee9f4] text-[#8c75aa]',
  blue: 'bg-[#e9eff5] text-[#638ba9]',
  peach: 'bg-[#f8ede5] text-[#b18466]',
  gray: 'bg-[#edf0ef] text-[#78847f]',
};

function App() {
  const [expanded, setExpanded] = useState<string[]>([experiences[0].id]);
  const [category, setCategory] = useState('Frontend');
  const [active, setActive] = useState('about');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      /* Theme still works without storage. */
    }
  }, [dark]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -60% 0px' },
    );
    document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  return (
    <>
      <a
        className="skip-link fixed top-[-60px] left-2.5 z-[100] bg-surface p-3 focus:top-2.5"
        href="#main"
      >
        Skip to content
      </a>
      <header className="header sticky top-0 z-[20] border-b border-line bg-canvas">
        <div className="header-inner m-auto flex h-20.5 max-w-[1120px] items-center justify-between px-9.5 py-0 max-tablet:pr-[25px] max-tablet:pl-[25px] max-mobile:h-17 max-mobile:px-[19px] max-mobile:py-0 wide:max-w-[1200px]">
          <a
            href="#about"
            className="brand font-heading text-[31px] font-extrabold tracking-[-2px] max-mobile:text-[27px]"
            aria-label="Cliff Carcueva home"
          >
            crc<span>.</span>
          </a>
          <nav className="max-[360px]:gap-2.5" aria-label="Main navigation">
            {['about', 'experience', 'skills', 'contact'].map((item) => (
              <a key={item} href={`#${item}`} className={active === item ? 'active' : ''}>
                {item}
              </a>
            ))}
          </nav>
          <div className="header-actions flex items-center gap-4.5 max-mobile:gap-[3px]">
            <button
              className="icon-button theme grid place-items-center p-2"
              onClick={() => setDark(!dark)}
              aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href="/Cliff_Randy_Carcueva_Resume.pdf"
              download
              className="resume-link flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2.5 text-[12px] font-semibold max-mobile:border-0 max-mobile:bg-transparent max-mobile:p-2"
            >
              <Download size={15} />
              <span>Resume</span>
            </a>
          </div>
        </div>
      </header>
      <main
        id="main"
        className="page-shell m-auto max-w-[1120px] px-9.5 py-0 max-tablet:pr-[25px] max-tablet:pl-[25px] max-mobile:px-5.5 max-mobile:py-0 wide:max-w-[1200px]"
      >
        <section
          id="about"
          className="hero grid grid-cols-[1.05fr_1fr] items-center gap-8 px-0 pt-20.5 pb-[65px] max-tablet:gap-4.5 max-mobile:grid-cols-[1fr] max-mobile:gap-[15px] max-mobile:pt-11 max-mobile:pb-7.5 wide:pt-22.5 wide:pb-[75px]"
        >
          <div className="hero-copy">
            <div className="eyebrow flex items-center gap-[9px] text-[9px] font-[650] tracking-[1.2px] text-accent max-tablet:text-[8px] max-tablet:tracking-[.5px] max-mobile:text-[8px] max-mobile:tracking-[1px]">
              <span className="status-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#73945e] dark:bg-[#8cb4eb]" />{' '}
              FULL STACK DEVELOPER{' '}
              <span className="eyebrow-divider px-1 py-0 text-[#b9c0b3]">/</span> DAVAO, PH
            </div>
            <h1>
              Cliff Randy
              <br />
              Carcueva<span className="name-dot text-[#769064] dark:text-[#93b5e8]">.</span>
            </h1>
            <p className="hero-tagline text-[23px] leading-[1.45] font-medium tracking-[-.6px] max-mobile:text-[22px]">
              Thoughtful code.
              <br />
              <span>Reliable experiences.</span>
            </p>
            <p className="hero-description mt-[19px] max-w-[390px] text-[13px] leading-[1.85] text-muted max-mobile:max-w-full max-mobile:text-[13px]">
              I build enterprise web applications from interface to infrastructure. 15+ years of
              turning complex requirements into software that works.
            </p>
            <div className="hero-buttons mt-[27px] flex gap-[11px] max-mobile:gap-[9px]">
              <a
                className="button primary inline-flex items-center justify-center gap-3.5 rounded-md border border-[#284b37] bg-[#284b37] px-4.5 py-[13px] text-[12px] font-medium text-white transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_#0000000c] max-mobile:px-3.5 max-mobile:py-3 max-mobile:text-[11px] dark:border-[#315d98] dark:bg-[#315d98]"
                href="#experience"
              >
                Explore my experience <ArrowDown size={16} />
              </a>
              <a
                className="button secondary inline-flex items-center justify-center gap-3.5 rounded-md border border-line bg-surface px-4.5 py-[13px] text-[12px] font-medium transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_#0000000c] max-mobile:px-3.5 max-mobile:py-3 max-mobile:text-[11px]"
                href={`mailto:${profile.email}`}
              >
                Let’s talk <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="social-row mt-7.5 flex items-center gap-[13px] text-[10px] text-muted max-mobile:gap-3 max-mobile:text-[10px]">
              <MapPin size={14} />
              <span>Davao City, Philippines</span>
              <span className="social-divider mx-[3px] my-0 h-[15px] w-[1px] bg-line" />
              <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <Github size={17} />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Linkedin size={17} />
              </a>
              <a href={`mailto:${profile.email}`} aria-label="Email Cliff">
                <Mail size={17} />
              </a>
            </div>
          </div>
          <div
            className="hero-art relative flex min-h-[420px] items-center justify-center max-tablet:min-h-[360px] max-mobile:mt-6.5 max-mobile:min-h-[380px] wide:min-h-[440px]"
            aria-label="Developer profile illustration"
          >
            <div className="art-grid max-mobile:inset-x-0" />
            <div className="floating-label absolute top-[3px] right-1.5 z-[2] flex rotate-3 items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-[11px] text-[10px] shadow-[0_4px_15px_#00000005] max-tablet:text-[8px] max-mobile:right-0 max-mobile:text-[9px]">
              <span className="status-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#73945e] dark:bg-[#8cb4eb]" />{' '}
              From frontend to backend
            </div>
            <div className="code-card relative w-full max-w-[410px] -rotate-2 rounded-[10px] border border-line bg-surface shadow-[0_17px_36px_-18px_#2b3c3033] max-mobile:w-[94%] max-mobile:max-w-[370px] wide:max-w-[440px]">
              <div className="code-toolbar flex h-10.5 items-center justify-between border-b border-line px-[15px] py-0 font-mono text-[10px] text-muted">
                <div>
                  <i />
                  <i />
                  <i />
                </div>
                <span>developer.ts</span>
                <Code2 size={14} />
              </div>
              <div className="code-content px-5 pt-5.5 pb-[25px] font-code text-[11px] leading-[1.95] text-ink max-tablet:px-[13px] max-tablet:py-4.5 max-tablet:text-[9px] max-mobile:px-4 max-mobile:py-5 max-mobile:text-[10px] wide:text-[12px]">
                <p>
                  <span className="syntax text-[#9c79ac]">const</span> developer = {'{'}
                </p>
                <p>
                  &nbsp; name: <span className="string text-leaf">'Cliff Carcueva'</span>,
                </p>
                <p>
                  &nbsp; role: <span className="string text-leaf">'Full Stack Developer'</span>,
                </p>
                <p>
                  &nbsp; experience: <span className="number text-[#bd9560]">15</span> +{' '}
                  <span className="string text-leaf">' years'</span>,
                </p>
                <p>&nbsp; stack: [</p>
                <p>
                  &nbsp;&nbsp;&nbsp; <span className="string text-leaf">'React'</span>,{' '}
                  <span className="string text-leaf">'Next.js'</span>,
                </p>
                <p>
                  &nbsp;&nbsp;&nbsp; <span className="string text-leaf">'TypeScript'</span>,{' '}
                  <span className="string text-leaf">'Node.js'</span>
                </p>
                <p>&nbsp; ],</p>
                <p>
                  &nbsp; mindset: <span className="string text-leaf">'Always learning'</span>
                </p>
                <p>{'}'};</p>
                <p className="code-comment">// Built on experience. Driven by curiosity.</p>
              </div>
              <div className="code-footer flex justify-between border-t border-line px-[15px] py-[11px] text-[9px] text-muted">
                <span>
                  <span className="status-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#73945e] dark:bg-[#8cb4eb]" />{' '}
                  Crafting better software
                </span>
                <span>TypeScript</span>
              </div>
            </div>
            <div className="small-art-label absolute bottom-[1px] left-5.5 z-[2] flex rotate-2 items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-[11px] text-[10px] text-accent shadow-[0_4px_15px_#00000005] max-tablet:text-[8px] max-mobile:bottom-0 max-mobile:left-0.5 max-mobile:text-[9px]">
              <Terminal size={16} />
              <span>Ideas → interfaces → impact</span>
            </div>
          </div>
        </section>
        <div className="stats grid grid-cols-[.9fr_.9fr_1fr_1.2fr] border-t border-b border-line px-0 py-7.5 max-mobile:grid-cols-[1fr_1fr] max-mobile:gap-y-[25px] max-mobile:px-0 max-mobile:py-[25px]">
          <div>
            <strong>
              15<span>+</span>
            </strong>
            <span>Years in development</span>
          </div>
          <div>
            <strong>7</strong>
            <span>Roles along the way</span>
          </div>
          <div>
            <strong>Full stack</strong>
            <span>Frontend to database</span>
          </div>
          <div>
            <strong>
              Always learning<span>↗</span>
            </strong>
            <span>Engineering with curiosity</span>
          </div>
        </div>
        <section className="overview grid grid-cols-[1fr_2.2fr] gap-[35px] border-b border-line px-0 py-[65px] max-tablet:grid-cols-[1fr_2.5fr] max-tablet:gap-5.5 max-mobile:grid-cols-[1fr] max-mobile:gap-2 max-mobile:px-0 max-mobile:py-10">
          <div className="section-kicker mb-4 text-[10px] font-[650] tracking-[1.7px] text-muted max-mobile:text-[9px] max-mobile:tracking-[1.5px]">
            01 / A LITTLE ABOUT ME
          </div>
          <div>
            <h2>
              Built on experience.
              <br />
              <span>Focused on what’s next.</span>
            </h2>
            <p>
              I’m a Senior Full Stack Developer with experience building and maintaining enterprise
              web applications for local and international clients. My work spans frontend
              architecture, REST APIs, database design, and performance optimization.
            </p>
            <p>
              Beyond writing code, I enjoy helping teams grow through code reviews and technical
              mentoring. I bring a hands-on approach to production support and Agile collaboration,
              with AI-assisted tools as part of my development workflow.
            </p>
            <div className="inline-note mt-6 flex flex-wrap items-center gap-1.5 text-[10px] text-muted max-mobile:text-[9px] max-mobile:leading-[1.8]">
              <span className="status-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#73945e] dark:bg-[#8cb4eb]" />{' '}
              Currently Senior Full Stack Developer at <strong>Jairosoft Inc.</strong>
            </div>
          </div>
        </section>
        <section id="experience" className="experience section-block pt-[65px] max-mobile:pt-11">
          <div className="section-heading mb-[27px] flex items-end justify-between gap-5 max-mobile:relative max-mobile:mb-4.5 max-mobile:block max-mobile:items-start">
            <div>
              <div className="section-kicker mb-4 text-[10px] font-[650] tracking-[1.7px] text-muted max-mobile:text-[9px] max-mobile:tracking-[1.5px]">
                02 / THE JOURNEY
              </div>
              <h2>
                Professional experience<span className="heading-dot text-leaf">.</span>
              </h2>
              <p>A career of building, improving, and moving things forward.</p>
            </div>
            <button
              className="text-button flex items-center gap-2 px-0 py-2 text-[11px] whitespace-nowrap text-accent max-mobile:text-[10px]"
              onClick={() =>
                setExpanded(
                  expanded.length === experiences.length ? [] : experiences.map((e) => e.id),
                )
              }
            >
              {expanded.length === experiences.length ? 'Collapse all' : 'Expand all'}
              <ChevronDown
                size={15}
                className={expanded.length === experiences.length ? 'rotate-180' : ''}
              />
            </button>
          </div>
          <div className="timeline ml-[5px] border-l border-line pl-[25px] max-mobile:ml-[3px] max-mobile:pl-[15px]">
            {experiences.map((experience, index) => {
              const open = expanded.includes(experience.id);
              return (
                <article
                  className={`experience-item group relative mb-[11px] rounded-lg border border-line bg-surface transition-colors duration-200 hover:border-[#adbaa4] dark:hover:border-[#6485b1] [&.is-open]:border-[#bdcbb5] dark:[&.is-open]:border-[#536f96] ${open ? 'is-open' : ''}`}
                  key={experience.id}
                >
                  <div className="timeline-dot absolute top-[37px] left-[-30px] h-[7px] w-[7px] rounded-full border border-[#a8b39f] bg-canvas group-[.is-open]:bg-[#769165] group-[.is-open]:shadow-[0_0_0_4px_var(--bg)] max-mobile:top-[31px] max-mobile:left-[-20px] dark:border-[#6d8bb4] dark:group-[.is-open]:bg-[#8cb4eb]" />
                  <button
                    id={`trigger-${experience.id}`}
                    className="experience-trigger flex w-full items-center gap-4 p-[21px] text-left max-mobile:relative max-mobile:flex-wrap max-mobile:gap-2.5 max-mobile:px-3 max-mobile:py-4"
                    aria-expanded={open}
                    aria-controls={`panel-${experience.id}`}
                    onClick={() =>
                      setExpanded((previous) =>
                        open
                          ? previous.filter((id) => id !== experience.id)
                          : [...previous, experience.id],
                      )
                    }
                  >
                    <span
                      className={`company-icon relative grid h-10 w-10 shrink-0 place-content-center rounded-lg font-heading text-[20px] font-semibold max-mobile:h-[33px] max-mobile:w-[33px] max-mobile:text-[17px] ${companyColors[experience.color]}`}
                    >
                      {experience.monogram}
                      <span>.</span>
                    </span>
                    <span className="experience-title flex flex-col gap-[7px] max-mobile:w-[calc(100%_-_77px)] max-mobile:gap-1.5">
                      <span className="role-line flex items-center gap-2.5 max-mobile:flex-wrap max-mobile:gap-[5px]">
                        <strong>{experience.role}</strong>
                        {index === 0 && (
                          <span className="current-badge rounded border border-line bg-soft px-1.5 py-[3px] text-[8px] text-accent max-mobile:px-[5px] max-mobile:py-0.5 max-mobile:text-[7px]">
                            Current
                          </span>
                        )}
                      </span>
                      <span className="company-name text-[11px] text-muted max-mobile:text-[10px]">
                        {experience.company}
                      </span>
                    </span>
                    <span className="experience-date ml-auto text-[10px] whitespace-nowrap text-muted max-tablet:text-[9px] max-mobile:ml-[43px] max-mobile:text-[9px]">
                      {experience.start} — {experience.end}
                    </span>
                    <span className="expand-icon ml-2 grid h-[25px] w-[25px] shrink-0 place-items-center rounded-full border border-line text-muted max-mobile:absolute max-mobile:top-[23px] max-mobile:right-3 max-mobile:h-5.5 max-mobile:w-5.5">
                      <ChevronDown size={18} />
                    </span>
                  </button>
                  <div
                    id={`panel-${experience.id}`}
                    role="region"
                    aria-labelledby={`trigger-${experience.id}`}
                    hidden={!open}
                    className="experience-details animate-reveal pt-0 pr-7.5 pb-6 pl-[77px] max-mobile:pt-0 max-mobile:pr-4 max-mobile:pb-4.5 max-mobile:pl-5"
                  >
                    <div className="tags mb-[21px] flex flex-wrap gap-1.5 border-b border-line px-0 pt-0 pb-[21px] max-mobile:mb-[15px] max-mobile:gap-[5px] max-mobile:pb-[15px]">
                      {experience.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="responsibility-label mb-[13px] text-[8px] font-[650] tracking-[1.4px] text-muted max-mobile:text-[7px] max-mobile:tracking-[1px]">
                      RESPONSIBILITIES & CONTRIBUTIONS
                    </div>
                    <ul>
                      {experience.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="journey-start pt-[9px] pr-0 pb-0 pl-8 text-[10px] text-muted">
            A journey that started in 2011 <span>↑</span>
          </div>
        </section>
        <section id="skills" className="section-block skills pt-[65px] max-mobile:pt-11">
          <div className="section-kicker mb-4 text-[10px] font-[650] tracking-[1.7px] text-muted max-mobile:text-[9px] max-mobile:tracking-[1.5px]">
            03 / THE TOOLKIT
          </div>
          <h2>
            The right tools. A strong foundation<span className="heading-dot text-leaf">.</span>
          </h2>
          <p>Technologies and practices I bring to the table.</p>
          <div className="skill-layout mt-[27px] grid grid-cols-[210px_1fr] gap-7.5 max-mobile:mt-5 max-mobile:grid-cols-[1fr] max-mobile:gap-[15px]">
            <div
              className="skill-tabs flex flex-col gap-1 max-mobile:flex-row max-mobile:flex-wrap max-mobile:gap-[5px]"
              role="tablist"
              aria-label="Skill categories"
            >
              {skillGroups.map((group, index) => (
                <button
                  className="flex items-center justify-between rounded-md px-[15px] py-[13px] text-left text-[12px] text-muted aria-selected:bg-soft aria-selected:text-accent max-mobile:gap-[7px] max-mobile:border max-mobile:border-line max-mobile:px-2.5 max-mobile:py-[9px] max-mobile:text-[10px]"
                  role="tab"
                  id={`tab-${index}`}
                  aria-selected={category === group.name}
                  aria-controls="skill-panel"
                  key={group.name}
                  tabIndex={category === group.name ? 0 : -1}
                  onClick={() => setCategory(group.name)}
                  onKeyDown={(event) => {
                    const next =
                      event.key === 'ArrowRight' || event.key === 'ArrowDown'
                        ? (index + 1) % skillGroups.length
                        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
                          ? (index + skillGroups.length - 1) % skillGroups.length
                          : event.key === 'Home'
                            ? 0
                            : event.key === 'End'
                              ? skillGroups.length - 1
                              : -1;
                    if (next >= 0) {
                      event.preventDefault();
                      setCategory(skillGroups[next].name);
                      document.getElementById(`tab-${next}`)?.focus();
                    }
                  }}
                >
                  <span>{group.name}</span>
                  <span className="skill-count font-mono text-[9px] opacity-[.7]">
                    {group.skills.length}
                  </span>
                </button>
              ))}
            </div>
            <div
              className="skill-panel rounded-lg border border-line bg-surface px-7 py-[25px] max-mobile:p-[21px]"
              id="skill-panel"
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={`tab-${skillGroups.findIndex((g) => g.name === category)}`}
            >
              <div className="skill-panel-title mb-5.5 flex items-center gap-2.5 text-accent">
                <Code2 size={21} />
                <h3>{category}</h3>
              </div>
              <div className="skill-chips flex flex-wrap gap-[9px] max-mobile:gap-[7px]">
                {skillGroups
                  .find((g) => g.name === category)!
                  .skills.map((skill) => (
                    <span key={skill}>
                      <span className="chip-dot h-1 w-1 rounded-full bg-[#8ca579] dark:bg-[#8cb4eb]" />
                      {skill}
                    </span>
                  ))}
              </div>
              <p className="skill-footnote mt-[25px] text-[10px] text-muted">
                A toolkit shaped by real-world enterprise development.
              </p>
            </div>
          </div>
        </section>
        <section className="education section-block pt-[65px] max-mobile:pt-11">
          <div>
            <div className="section-kicker mb-4 text-[10px] font-[650] tracking-[1.7px] text-muted max-mobile:text-[9px] max-mobile:tracking-[1.5px]">
              04 / THE FOUNDATION
            </div>
            <h2>
              Learning & language<span className="heading-dot text-leaf">.</span>
            </h2>
          </div>
          <div className="education-grid mt-6 grid grid-cols-[1.2fr_1fr] gap-5 max-mobile:grid-cols-[1fr] max-mobile:gap-[13px]">
            <div className="education-card flex items-center gap-4.5 rounded-lg border border-line bg-surface p-6.5 max-tablet:p-5">
              <div className="education-icon rounded-lg bg-soft p-3.5 text-accent max-tablet:hidden max-mobile:block max-mobile:p-3">
                <GraduationCap size={23} />
              </div>
              <div>
                <span className="small-label text-[8px] font-[650] tracking-[1.2px] text-muted">
                  EDUCATION
                </span>
                <h3>BS in Information Technology</h3>
                <p>
                  STI College Davao <span>·</span> 2011
                </p>
              </div>
            </div>
            <div className="language-card rounded-lg border border-line bg-surface p-6.5 max-tablet:p-5">
              <span className="small-label text-[8px] font-[650] tracking-[1.2px] text-muted">
                LANGUAGES
              </span>
              <div>
                <strong>English</strong>
                <span>Professional working proficiency</span>
              </div>
              <div>
                <strong>Filipino</strong>
                <span>Native</span>
              </div>
            </div>
          </div>
        </section>
        <section
          id="contact"
          className="contact relative mt-17.5 overflow-hidden rounded-[10px] border border-line bg-soft px-[25px] pt-13.5 pb-[31px] text-center max-mobile:mt-[45px] max-mobile:px-4 max-mobile:pt-[37px] max-mobile:pb-[23px]"
        >
          <div className="section-kicker mb-4 text-[10px] font-[650] tracking-[1.7px] text-muted max-mobile:text-[9px] max-mobile:tracking-[1.5px]">
            05 / LET’S CONNECT
          </div>
          <h2>
            Good software starts
            <br />
            with a conversation<span>.</span>
          </h2>
          <p>
            Have a project in mind or a role that could be a good fit?
            <br />
            I’d love to hear from you.
          </p>
          <div className="contact-actions mt-6 flex justify-center gap-2.5">
            <a
              className="button primary inline-flex items-center justify-center gap-3.5 rounded-md border border-[#284b37] bg-[#284b37] px-4.5 py-[13px] text-[12px] font-medium text-white transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_#0000000c] max-mobile:px-3.5 max-mobile:py-3 max-mobile:text-[11px] dark:border-[#315d98] dark:bg-[#315d98]"
              href={`mailto:${profile.email}`}
            >
              Say hello <ArrowUpRight size={17} />
            </a>
            <button
              className="button secondary inline-flex items-center justify-center gap-3.5 rounded-md border border-line bg-surface px-4.5 py-[13px] text-[12px] font-medium transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_#0000000c] max-mobile:px-3.5 max-mobile:py-3 max-mobile:text-[11px]"
              onClick={copyEmail}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? 'Email copied!' : 'Copy email'}</span>
            </button>
          </div>
          <a
            className="contact-email mt-5.5 inline-block text-[11px] text-muted max-mobile:text-[10px]"
            href={`mailto:${profile.email}`}
          >
            {profile.email}
          </a>
          <div className="copy-status mt-1.5 h-[15px] text-[10px] text-accent" role="status">
            {copyError
              ? 'Please select and copy the email address above.'
              : copied
                ? 'Email address copied to clipboard.'
                : ''}
          </div>
        </section>
        <footer>
          <div>
            <a
              href="#about"
              className="brand font-heading text-[23px] font-extrabold tracking-[-2px] text-ink"
            >
              crc<span>.</span>
            </a>
            <span>© {new Date().getFullYear()} Cliff Randy D. Carcueva</span>
          </div>
          <span className="footer-location max-tablet:hidden">Built with care in Davao, PH</span>
          <div>
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight size={13} />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn <ArrowUpRight size={13} />
            </a>
            <a
              href={`tel:${profile.phone.replace(/\s/g, '')}`}
              aria-label={`Call ${profile.phone}`}
            >
              Call <ArrowUpRight size={13} />
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
