import { profile } from '../data';
import { SocialLinks } from './SocialLinks';
export function Footer() {
  return (
    <footer>
      <div>
        <a
          href="#about"
          className="brand font-heading text-[23px] font-extrabold tracking-[-2px] text-ink"
        >
          {profile.brand}
          <span>.</span>
        </a>
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
      </div>
      <span className="footer-location max-tablet:hidden">
        Built with care in {profile.location.short}
      </span>
      <div>
        <SocialLinks variant="text" />
      </div>
    </footer>
  );
}
