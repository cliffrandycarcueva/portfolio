import { about, experiences } from '../data';
export function About() {
  const currentExperience = experiences.find((experience) => experience.current);
  return (
    <section className="overview grid grid-cols-[1fr_2.2fr] gap-[35px] border-b border-line px-0 py-[65px] max-tablet:grid-cols-[1fr_2.5fr] max-tablet:gap-5.5 max-mobile:grid-cols-[1fr] max-mobile:gap-2 max-mobile:px-0 max-mobile:py-10">
      <div className="section-kicker mb-4 text-[10px] font-[650] tracking-[1.7px] text-muted max-mobile:text-[9px] max-mobile:tracking-[1.5px]">
        01 / A LITTLE ABOUT ME
      </div>
      <div>
        <h2>
          {about.heading[0]}
          <br />
          <span>{about.heading[1]}</span>
        </h2>
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <div className="inline-note mt-6 flex flex-wrap items-center gap-1.5 text-[10px] text-muted max-mobile:text-[9px] max-mobile:leading-[1.8]">
          <span className="status-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#6a91bf] dark:bg-[#8cb4eb]" />{' '}
          {currentExperience && (
            <>
              Currently {currentExperience.role} at <strong>{currentExperience.company}</strong>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
