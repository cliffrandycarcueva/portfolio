import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { socialLinks, type ContactLink } from '../../../../shared/data';
import { Icon } from './icon';

@Component({
  selector: 'portfolio-social-links',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (link of links[variant()]; track link.id) {
    <a
      [href]="link.href"
      [attr.target]="link.external ? '_blank' : null"
      [attr.rel]="link.external ? 'noopener noreferrer' : null"
      [attr.aria-label]="link.accessibleLabel"
    >
      @if (variant() === 'icons') {
        <portfolio-icon [name]="icons[link.id]" [size]="17" />
      } @else {
        {{ link.label }} <portfolio-icon name="ArrowUpRight" [size]="13" />
      }
    </a>
  }`,
})
export class SocialLinks {
  readonly variant = input.required<keyof typeof socialLinks>();
  readonly links = socialLinks;
  readonly icons: Record<ContactLink['id'], string> = {
    github: 'Github',
    linkedin: 'Linkedin',
    email: 'Mail',
    phone: 'Phone',
  };
}
