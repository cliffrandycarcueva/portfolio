import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { contactLinks, profile } from '../data';
import { Messaging } from './Messaging';
export function Contact() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

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
      setCopied(false);
      setCopyError(true);
    }
  };

  return (
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
          className="button primary inline-flex items-center justify-center gap-3.5 rounded-md border border-[#315d98] bg-[#315d98] px-4.5 py-[13px] text-[12px] font-medium text-white transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_#0000000c] max-mobile:px-3.5 max-mobile:py-3 max-mobile:text-[11px] dark:border-[#315d98] dark:bg-[#315d98]"
          href={contactLinks.email.href}
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
        href={contactLinks.email.href}
      >
        {profile.email}
      </a>
      <Messaging />
      <div className="copy-status mt-1.5 h-[15px] text-[10px] text-accent" role="status">
        {copyError
          ? 'Please select and copy the email address above.'
          : copied
            ? 'Email address copied to clipboard.'
            : ''}
      </div>
    </section>
  );
}
