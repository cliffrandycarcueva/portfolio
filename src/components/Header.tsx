import { Download, Moon, Sun } from 'lucide-react';
import { navigation, profile } from '../data';
import { useTheme } from '../hooks/useTheme';
import { useActiveSection } from '../hooks/useActiveSection';
export function Header() {
  const { dark, toggleTheme } = useTheme();
  const active = useActiveSection();
  return (
    <header className="header sticky top-0 z-[20] border-b border-line bg-canvas">
      <div className="header-inner m-auto flex h-20.5 max-w-[1120px] items-center justify-between px-9.5 py-0 max-tablet:pr-[25px] max-tablet:pl-[25px] max-mobile:h-17 max-mobile:px-[19px] max-mobile:py-0 wide:max-w-[1200px]">
        <a
          href="#about"
          className="brand font-heading text-[31px] font-extrabold tracking-[-2px] max-mobile:text-[27px]"
          aria-label={`${profile.name} home`}
        >
          {profile.brand}
          <span>.</span>
        </a>
        <nav className="max-[360px]:gap-2.5" aria-label="Main navigation">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={active === item.id ? 'location' : undefined}
              className={active === item.id ? 'active' : ''}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions flex items-center gap-4.5 max-mobile:gap-[3px]">
          <button
            className="icon-button theme grid place-items-center p-2"
            onClick={toggleTheme}
            aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a
            href={profile.resumeUrl}
            download
            className="resume-link flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2.5 text-[12px] font-semibold max-mobile:border-0 max-mobile:bg-transparent max-mobile:p-2"
          >
            <Download size={15} />
            <span>Resume</span>
          </a>
        </div>
      </div>
    </header>
  );
}
