import { ArrowDown, ArrowUpRight, MapPin } from 'lucide-react';
import { about, contactLinks, profile } from '../data';
import { DeveloperIllustration } from './DeveloperIllustration';
import { SocialLinks } from './SocialLinks';
export function Hero() {
  return (
    <section
      id="about"
      className="hero grid grid-cols-[1.05fr_1fr] items-center gap-8 px-0 pt-20.5 pb-[65px] max-tablet:gap-4.5 max-mobile:grid-cols-[1fr] max-mobile:gap-[15px] max-mobile:pt-11 max-mobile:pb-7.5 wide:pt-22.5 wide:pb-[75px]"
    >
      <div className="hero-copy">
        <div className="eyebrow flex items-center gap-[9px] text-[9px] font-[650] tracking-[1.2px] text-accent max-tablet:text-[8px] max-tablet:tracking-[.5px] max-mobile:text-[8px] max-mobile:tracking-[1px]">
          <span className="status-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#6a91bf] dark:bg-[#8cb4eb]" />{' '}
          {profile.role.toUpperCase()}{' '}
          <span className="eyebrow-divider px-1 py-0 text-[#adbed3]">/</span>{' '}
          {profile.location.short.toUpperCase()}
        </div>
        <h1>
          {profile.givenName}
          <br />
          {profile.familyName}
          <span className="name-dot text-[#688bb8] dark:text-[#93b5e8]">.</span>
        </h1>
        <p className="hero-tagline text-[23px] leading-[1.45] font-medium tracking-[-.6px] max-mobile:text-[22px]">
          {about.tagline[0]}
          <br />
          <span>{about.tagline[1]}</span>
        </p>
        <p className="hero-description mt-[19px] max-w-[390px] text-[13px] leading-[1.85] text-muted max-mobile:max-w-full max-mobile:text-[13px]">
          {about.description}
        </p>
        <div className="hero-buttons mt-[27px] flex gap-[11px] max-mobile:gap-[9px]">
          <a
            className="button primary inline-flex items-center justify-center gap-3.5 rounded-md border border-[#315d98] bg-[#315d98] px-4.5 py-[13px] text-[12px] font-medium text-white transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_#0000000c] max-mobile:px-3.5 max-mobile:py-3 max-mobile:text-[11px] dark:border-[#315d98] dark:bg-[#315d98]"
            href="#experience"
          >
            Explore my experience <ArrowDown size={16} />
          </a>
          <a
            className="button secondary inline-flex items-center justify-center gap-3.5 rounded-md border border-line bg-surface px-4.5 py-[13px] text-[12px] font-medium transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_#0000000c] max-mobile:px-3.5 max-mobile:py-3 max-mobile:text-[11px]"
            href={contactLinks.email.href}
          >
            Let’s talk <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="social-row mt-7.5 flex items-center gap-[13px] text-[10px] text-muted max-mobile:gap-3 max-mobile:text-[10px]">
          <MapPin size={14} />
          <span>{profile.location.full}</span>
          <span className="social-divider mx-[3px] my-0 h-[15px] w-[1px] bg-line" />
          <SocialLinks variant="icons" />
        </div>
      </div>
      <DeveloperIllustration />
    </section>
  );
}
