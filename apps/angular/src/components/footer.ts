import { ChangeDetectionStrategy, Component } from '@angular/core';
import { profile } from '../../../../shared/data';
import { SocialLinks } from './social-links';

@Component({
  selector: 'portfolio-footer',
  imports: [SocialLinks],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly profile = profile;
  readonly year = new Date().getFullYear();
}
