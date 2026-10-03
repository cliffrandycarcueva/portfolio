import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  ViewChild,
  afterEveryRender,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { chat } from '../../../../shared/chat-client';
import { Icon } from './icon';
import { anchorInbox } from '../../../../shared/inbox-popover';
@Component({
  selector: 'portfolio-messaging',
  imports: [DatePipe, Icon],
  templateUrl: './messaging.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Messaging {
  readonly chat = chat;
  readonly state = signal(this.chat.state);
  @ViewChild('launcher') launcher?: ElementRef<HTMLButtonElement>;
  @ViewChild('dock') dock?: ElementRef<HTMLElement>;
  @ViewChild('log') log?: ElementRef<HTMLElement>;
  constructor() {
    let anchored: HTMLElement | undefined;
    let detach: (() => void) | undefined;
    afterEveryRender(() => {
      const panel = this.state().role === 'owner' ? this.dock?.nativeElement : undefined;
      if (panel === anchored) return;
      detach?.();
      anchored = panel;
      detach = panel ? anchorInbox(panel, () => this.chat.close()) : undefined;
    });
    const unsubscribe = this.chat.subscribe(() => {
      const previous = this.state();
      this.state.set(this.chat.state);
      if (!previous.open && this.chat.state.open)
        setTimeout(() => this.dock?.nativeElement.focus());
      if (previous.messages.at(-1)?._id !== this.chat.state.messages.at(-1)?._id)
        setTimeout(() => {
          const log = this.log?.nativeElement;
          log?.scrollTo({ top: log.scrollHeight });
        });
    });
    void this.chat.start();
    inject(DestroyRef).onDestroy(() => {
      detach?.();
      unsubscribe();
      this.chat.stop();
    });
  }
  value(event: Event) {
    return (event.target as HTMLInputElement).value;
  }
  submit(event: Event, action: 'identify' | 'login' | 'register' | 'owner' | 'send') {
    event.preventDefault();
    void this.chat[action]();
  }
  close() {
    this.chat.close();
    if (this.state().role === 'owner') document.getElementById('owner-inbox-bell')?.focus();
    else this.launcher?.nativeElement.focus();
  }
  get current() {
    return this.state().conversations.find((item) => item._id === this.state().selected);
  }
}
