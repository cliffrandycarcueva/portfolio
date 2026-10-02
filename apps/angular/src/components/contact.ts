import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { contactLinks, profile } from '../../../../shared/data';
import { Icon } from './icon';
import { Messaging } from './messaging';

@Component({
  selector: 'portfolio-contact',
  imports: [Icon, Messaging],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  readonly profile = profile;
  readonly contactLinks = contactLinks;
  readonly copied = signal(false);
  readonly copyError = signal(false);
  private timer?: ReturnType<typeof setTimeout>;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  async copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      if (this.destroyRef.destroyed) return;
      this.copied.set(true);
      this.copyError.set(false);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), 2500);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.copied.set(false);
      this.copyError.set(true);
    }
  }
}
