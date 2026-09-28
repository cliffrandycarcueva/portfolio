import { Code2, Terminal } from 'lucide-react';
import { profile } from '../data';
export function DeveloperIllustration() {
  return (
    <div
      className="hero-art relative flex min-h-[420px] items-center justify-center max-tablet:min-h-[360px] max-mobile:mt-6.5 max-mobile:min-h-[380px] wide:min-h-[440px]"
      aria-label="Developer profile illustration"
    >
      <div className="art-grid max-mobile:inset-x-0" />
      <div className="floating-label absolute top-[3px] right-1.5 z-[2] flex rotate-3 items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-[11px] text-[10px] shadow-[0_4px_15px_#00000005] max-tablet:text-[8px] max-mobile:right-0 max-mobile:text-[9px]">
        <span className="status-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#6a91bf] dark:bg-[#8cb4eb]" />{' '}
        From frontend to backend
      </div>
      <div className="code-card relative w-full max-w-[410px] -rotate-2 rounded-[10px] border border-line bg-surface shadow-[0_17px_36px_-18px_#263f6033] max-mobile:w-[94%] max-mobile:max-w-[370px] wide:max-w-[440px]">
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
            &nbsp; name: <span className="string text-leaf">'{profile.shortName}'</span>,
          </p>
          <p>
            &nbsp; role: <span className="string text-leaf">'{profile.role}'</span>,
          </p>
          <p>
            &nbsp; experience:{' '}
            <span className="number text-[#bd9560]">{profile.yearsExperience}</span> +{' '}
            <span className="string text-leaf">' years'</span>,
          </p>
          <p>&nbsp; stack: [</p>
          {profile.featuredStack.map((technology, index) => (
            <span key={technology}>
              {index % 2 === 0 ? <>&nbsp;&nbsp;&nbsp; </> : ' '}
              <span className="string text-leaf">'{technology}'</span>
              {index < profile.featuredStack.length - 1 ? ',' : ''}
              {(index % 2 === 1 || index === profile.featuredStack.length - 1) && <br />}
            </span>
          ))}
          <p>&nbsp; ],</p>
          <p>
            &nbsp; mindset: <span className="string text-leaf">'{profile.mindset}'</span>
          </p>
          <p>{'}'};</p>
          <p className="code-comment">// Built on experience. Driven by curiosity.</p>
        </div>
        <div className="code-footer flex justify-between border-t border-line px-[15px] py-[11px] text-[9px] text-muted">
          <span>
            <span className="status-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#6a91bf] dark:bg-[#8cb4eb]" />{' '}
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
  );
}
