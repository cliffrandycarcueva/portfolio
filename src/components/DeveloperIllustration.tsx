import { Code2, Terminal } from 'lucide-react';
import { codeExamples } from '../../shared/code-examples';
export function DeveloperIllustration() {
  const example = codeExamples.react;
  return (
    <div
      className="hero-art relative flex min-h-[420px] items-center justify-center max-tablet:min-h-[360px] max-mobile:mt-6.5 max-mobile:min-h-[380px] wide:min-h-[440px]"
      aria-label="React component code preview"
    >
      <div className="art-grid max-mobile:inset-x-0" />
      <div className="floating-label absolute top-[3px] right-1.5 z-[2] flex rotate-3 items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-[11px] text-[10px] shadow-[0_4px_15px_#00000005] max-tablet:text-[8px] max-mobile:right-0 max-mobile:text-[9px]">
        <span className="status-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#6a91bf] dark:bg-[#8cb4eb]" />{' '}
        {example.label}
      </div>
      <div className="code-card relative w-full max-w-[410px] -rotate-2 rounded-[10px] border border-line bg-surface shadow-[0_17px_36px_-18px_#263f6033] max-mobile:w-[94%] max-mobile:max-w-[370px] wide:max-w-[440px]">
        <div className="code-toolbar flex h-10.5 items-center justify-between border-b border-line px-[15px] py-0 font-mono text-[10px] text-muted">
          <div>
            <i />
            <i />
            <i />
          </div>
          <span>{example.filename}</span>
          <Code2 size={14} />
        </div>
        <div className="code-content px-5 pt-5.5 pb-[25px] font-code text-[11px] leading-[1.95] text-ink max-tablet:px-[13px] max-tablet:py-4.5 max-tablet:text-[9px] max-mobile:px-4 max-mobile:py-5 max-mobile:text-[10px] wide:text-[12px]">
          <pre className="framework-code" aria-label="React LikeButton source code">
            <code>
              {example.lines.map((line, index) => (
                <span
                  key={index}
                  className={`code-line ${'tone' in line ? `code-${line.tone}` : ''}`}
                >
                  {line.text}
                  {'\n'}
                </span>
              ))}
            </code>
          </pre>
        </div>
        <div className="code-footer flex justify-between border-t border-line px-[15px] py-[11px] text-[9px] text-muted">
          <span>
            <span className="status-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#6a91bf] dark:bg-[#8cb4eb]" />{' '}
            React component preview
          </span>
          <span>{example.language}</span>
        </div>
      </div>
      <div className="small-art-label absolute bottom-[1px] left-5.5 z-[2] flex rotate-2 items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-[11px] text-[10px] text-accent shadow-[0_4px_15px_#00000005] max-tablet:text-[8px] max-mobile:bottom-0 max-mobile:left-0.5 max-mobile:text-[9px]">
        <Terminal size={16} />
        <span>Ideas → interfaces → impact</span>
      </div>
    </div>
  );
}
