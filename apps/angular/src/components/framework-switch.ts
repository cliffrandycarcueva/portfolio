import { ChangeDetectionStrategy, Component } from '@angular/core';
import { frameworkUrl } from '../../../../shared/framework';

@Component({
  selector: 'portfolio-framework-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button
    type="button"
    class="framework-switch"
    role="switch"
    aria-checked="true"
    aria-label="Use Angular version"
    (click)="switchFramework()"
  >
    <span>React</span><span class="selected">Angular</span>
  </button>`,
})
export class FrameworkSwitch {
  switchFramework() {
    window.location.assign(frameworkUrl('react'));
  }
}
