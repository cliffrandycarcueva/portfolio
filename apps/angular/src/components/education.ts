import { ChangeDetectionStrategy, Component } from '@angular/core';
import { education, languages } from '../../../../shared/data';
import { Icon } from './icon';

@Component({
  selector: 'portfolio-education',
  imports: [Icon],
  templateUrl: './education.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Education {
  readonly education = education;
  readonly languages = languages;
}
