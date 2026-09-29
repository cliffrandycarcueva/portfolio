import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { skillGroups } from '../../../../shared/data';
import { Icon } from './icon';

@Component({
  selector: 'portfolio-skills',
  imports: [Icon],
  templateUrl: './skills.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skills {
  readonly skillGroups = skillGroups;
  readonly category = signal(skillGroups[0]?.name ?? '');
  readonly selectedIndex = computed(() =>
    skillGroups.findIndex((group) => group.name === this.category()),
  );
  readonly selectedGroup = computed(() =>
    skillGroups.find((group) => group.name === this.category()),
  );

  onTabKey(event: KeyboardEvent, index: number) {
    const count = skillGroups.length;
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? (index + 1) % count
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? (index + count - 1) % count
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? count - 1
              : -1;
    if (next < 0) return;
    event.preventDefault();
    this.category.set(skillGroups[next].name);
    document.getElementById(`tab-${next}`)?.focus();
  }
}
