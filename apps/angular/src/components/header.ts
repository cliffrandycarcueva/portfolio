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
import { trackActiveSection } from '../../../../shared/active-section';
import { chat } from '../../../../shared/chat-client';

@Component({
  selector: 'portfolio-header',
  imports: [Icon, FrameworkSwitch],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly chat = chat;
  readonly messages = signal(chat.state);
  openInbox() {
    void this.chat.select('');
    this.chat.open();
  }
  readonly navigation = navigation;
  readonly profile = profile;
  readonly theme = inject(ThemeService);
  readonly active = signal<string>(navigation[0].id);

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(chat.subscribe(() => this.messages.set(chat.state)));
    afterNextRender(() => {
      destroyRef.onDestroy(trackActiveSection((id) => this.active.set(id)));
    });
  }
}
