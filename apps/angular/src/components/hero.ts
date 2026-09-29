import { ChangeDetectionStrategy, Component } from '@angular/core';
import { about, contactLinks, profile } from '../../../../shared/data';
import { Icon } from './icon';
import { DeveloperIllustration } from './developer-illustration';
import { SocialLinks } from './social-links';

@Component({
  selector: 'portfolio-hero',
  imports: [Icon, DeveloperIllustration, SocialLinks],
  templateUrl: './hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  readonly about = about;
  readonly contactLinks = contactLinks;
  readonly profile = profile;
}
