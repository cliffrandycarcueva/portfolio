import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { experiences, profile, type Experience as ExperienceData } from '../data';
const companyColors: Record<ExperienceData['color'], string> = {
  green: 'bg-[#edf2e8] text-[#617b4f]',
  yellow: 'bg-[#f7f3df] text-[#b39e42]',
  purple: 'bg-[#eee9f4] text-[#8c75aa]',
  blue: 'bg-[#e9eff5] text-[#638ba9]',
  peach: 'bg-[#f8ede5] text-[#b18466]',
  gray: 'bg-[#edf0ef] text-[#78847f]',
};

export function Experience() {
  const [expanded, setExpanded] = useState<string[]>(() =>
    experiences.filter((experience) => experience.current).map((experience) => experience.id),
  );
  return (
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
            setExpanded(expanded.length === experiences.length ? [] : experiences.map((e) => e.id))
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
        {experiences.map((experience) => {
          const open = expanded.includes(experience.id);
          return (
            <article
              className={`experience-item group relative mb-[11px] rounded-lg border border-line bg-surface transition-colors duration-200 hover:border-[#9cb5d5] dark:hover:border-[#6485b1] [&.is-open]:border-[#b1c6e0] dark:[&.is-open]:border-[#536f96] ${open ? 'is-open' : ''}`}
              key={experience.id}
            >
              <div className="timeline-dot absolute top-[37px] left-[-30px] h-[7px] w-[7px] rounded-full border border-[#9aafca] bg-canvas group-[.is-open]:bg-[#7095c4] group-[.is-open]:shadow-[0_0_0_4px_var(--bg)] max-mobile:top-[31px] max-mobile:left-[-20px] dark:border-[#6d8bb4] dark:group-[.is-open]:bg-[#8cb4eb]" />
              <button
                id={`trigger-${experience.id}`}
                className="experience-trigger flex w-full items-center gap-4 p-[21px] text-left max-mobile:relative max-mobile:flex-wrap max-mobile:gap-2.5 max-mobile:px-3 max-mobile:py-4"
                aria-expanded={open}
                aria-controls={`panel-${experience.id}`}
                onClick={() =>
                  setExpanded((previous) =>
                    previous.includes(experience.id)
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
                    {experience.current && (
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
        A journey that started in {profile.careerStartYear} <span>↑</span>
      </div>
    </section>
  );
}
