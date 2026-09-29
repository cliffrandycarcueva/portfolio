import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { experiences, profile, type Experience as ExperienceData } from '../../../../shared/data';
import { Icon } from './icon';

@Component({
  selector: 'portfolio-experience',
  imports: [Icon],
  templateUrl: './experience.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Experience {
  readonly experiences = experiences;
  readonly profile = profile;
  readonly expanded = signal(experiences.filter((role) => role.current).map((role) => role.id));
  readonly companyColors: Record<ExperienceData['color'], string> = {
    green: 'bg-[#edf2e8] text-[#617b4f]',
    yellow: 'bg-[#f7f3df] text-[#b39e42]',
    purple: 'bg-[#eee9f4] text-[#8c75aa]',
    blue: 'bg-[#e9eff5] text-[#638ba9]',
    peach: 'bg-[#f8ede5] text-[#b18466]',
    gray: 'bg-[#edf0ef] text-[#78847f]',
  };
  toggle(id: string) {
    this.expanded.update((ids) =>
      ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
    );
  }
  toggleAll() {
    this.expanded.update((ids) =>
      ids.length === experiences.length ? [] : experiences.map((role) => role.id),
    );
  }
}
