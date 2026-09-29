import { ChangeDetectionStrategy, Component } from '@angular/core';
import { statistics } from '../../../../shared/data';

@Component({
  selector: 'portfolio-stats',
  imports: [],
  templateUrl: './stats.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stats {
  readonly statistics = statistics;
}
