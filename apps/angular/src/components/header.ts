import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { navigation, profile } from '../../../../shared/data';
import { ThemeService } from '../theme.service';
import { Icon } from './icon';
import { FrameworkSwitch } from './framework-switch';

@Component({
  selector: 'portfolio-header',
  imports: [Icon, FrameworkSwitch],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly navigation = navigation;
  readonly profile = profile;
  readonly theme = inject(ThemeService);
  readonly active = signal<string>(navigation[0].id);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) if (entry.isIntersecting) this.active.set(entry.target.id);
        },
        { rootMargin: '-15% 0px -60% 0px' },
      );
      navigation.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (section) observer.observe(section);
      });
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
