import { ChangeDetectionStrategy, Component } from '@angular/core';
import { about, experiences } from '../../../../shared/data';

@Component({
  selector: 'portfolio-about',
  imports: [],
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  readonly about = about;
  readonly currentExperience = experiences.find((role) => role.current);
}
