import { GraduationCap } from 'lucide-react';
import { education, languages } from '../data';
export function Education() {
  return (
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
            <h3>{education.degree}</h3>
            <p>
              {education.school} <span>·</span> {education.year}
            </p>
          </div>
        </div>
        <div className="language-card rounded-lg border border-line bg-surface p-6.5 max-tablet:p-5">
          <span className="small-label text-[8px] font-[650] tracking-[1.2px] text-muted">
            LANGUAGES
          </span>
          {languages.map((language) => (
            <div key={language.name}>
              <strong>{language.name}</strong>
              <span>{language.proficiency}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
