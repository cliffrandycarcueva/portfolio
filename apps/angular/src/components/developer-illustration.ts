import { ChangeDetectionStrategy, Component } from '@angular/core';
import { codeExamples } from '../../../../shared/code-examples';
import { Icon } from './icon';

@Component({
  selector: 'portfolio-developer-illustration',
  imports: [Icon],
  templateUrl: './developer-illustration.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeveloperIllustration {
  readonly example = codeExamples.angular;
}
