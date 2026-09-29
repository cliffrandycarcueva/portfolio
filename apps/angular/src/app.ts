import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { Header } from './components/header';
import { Hero } from './components/hero';
import { Stats } from './components/stats';
import { About } from './components/about';
import { Experience } from './components/experience';
import { Skills } from './components/skills';
import { Education } from './components/education';
import { Contact } from './components/contact';
import { Footer } from './components/footer';

@Component({
  selector: 'portfolio-app',
  imports: [Header, Hero, Stats, About, Experience, Skills, Education, Contact, Footer],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    afterNextRender(() => {
      const id = window.location.hash.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView();
    });
  }
}
