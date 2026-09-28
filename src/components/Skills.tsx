import { useState } from 'react';
import { Code2 } from 'lucide-react';
import { skillGroups } from '../data';
export function Skills() {
  const [category, setCategory] = useState(skillGroups[0]?.name ?? '');
  const selectedGroup = skillGroups.find((group) => group.name === category);
  return (
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
            {selectedGroup?.skills.map((skill) => (
              <span key={skill}>
                <span className="chip-dot h-1 w-1 rounded-full bg-[#779bc7] dark:bg-[#8cb4eb]" />
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
  );
}
