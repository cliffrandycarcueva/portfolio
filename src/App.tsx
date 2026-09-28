import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { About } from './components/About';
import { Experience } from './components/Experience';
import { Skills } from './components/Skills';
import { Education } from './components/Education';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export function App() {
  return (
    <>
      <a
        className="skip-link fixed top-[-60px] left-2.5 z-[100] bg-surface p-3 focus:top-2.5"
        href="#main"
      >
        Skip to content
      </a>
      <Header />
      <main
        id="main"
        className="page-shell m-auto max-w-[1120px] px-9.5 py-0 max-tablet:pr-[25px] max-tablet:pl-[25px] max-mobile:px-5.5 max-mobile:py-0 wide:max-w-[1200px]"
      >
        <Hero />
        <Stats />
        <About />
        <Experience />
        <Skills />
        <Education />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
