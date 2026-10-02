import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Messaging as ChatClient } from '../../../../shared/messaging';
import { Icon } from './icon';
@Component({
  selector: 'portfolio-messaging',
  imports: [DatePipe, Icon],
  templateUrl: './messaging.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Messaging {
  readonly chat = new ChatClient();
  readonly state = signal(this.chat.state);
  @ViewChild('launcher') launcher?: ElementRef<HTMLButtonElement>;
  @ViewChild('dock') dock?: ElementRef<HTMLElement>;
  @ViewChild('log') log?: ElementRef<HTMLElement>;
  constructor() {
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
      unsubscribe();
      this.chat.stop();
    });
  }
  value(event: Event) {
    return (event.target as HTMLInputElement).value;
  }
  submit(event: Event, action: 'identify' | 'verify' | 'nickname' | 'owner' | 'send') {
    event.preventDefault();
    void this.chat[action]();
  }
  close() {
    this.chat.close();
    this.launcher?.nativeElement.focus();
  }
  get current() {
    return this.state().conversations.find((item) => item._id === this.state().selected);
  }
}
