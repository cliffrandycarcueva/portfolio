import { ArrowUpRight, Github, Linkedin, Mail, Phone, type LucideIcon } from 'lucide-react';
import { socialLinks, type ContactLink } from '../data';

const icons: Record<ContactLink['id'], LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  phone: Phone,
};

export function SocialLinks({ variant }: { variant: keyof typeof socialLinks }) {
  return socialLinks[variant].map((link) => {
    const Icon = icons[link.id];
    return (
      <a
        key={link.id}
        href={link.href}
        target={link.external ? '_blank' : undefined}
        rel={link.external ? 'noopener noreferrer' : undefined}
        aria-label={link.accessibleLabel}
      >
        {variant === 'icons' ? (
          <Icon size={17} />
        ) : (
          <>
            {link.label} <ArrowUpRight size={13} />
          </>
        )}
      </a>
    );
  });
}
