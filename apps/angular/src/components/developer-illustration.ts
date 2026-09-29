import { ChangeDetectionStrategy, Component } from '@angular/core';
import { profile } from '../../../../shared/data';
import { Icon } from './icon';

@Component({
  selector: 'portfolio-developer-illustration',
  imports: [Icon],
  templateUrl: './developer-illustration.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeveloperIllustration {
  readonly profile = profile;
}
