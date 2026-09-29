import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(this.readTheme());

  constructor() {
    document.documentElement.dataset['theme'] = this.dark() ? 'dark' : 'light';
  }

  toggle() {
    this.dark.update((value) => !value);
    const theme = this.dark() ? 'dark' : 'light';
    document.documentElement.dataset['theme'] = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* Theme works without storage. */
    }
  }

  private readTheme() {
    try {
      return localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  }
}
