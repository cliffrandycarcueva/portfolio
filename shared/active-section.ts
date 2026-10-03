import { navigation } from './data';

// Recalculate from all sections: observer entry order is not scroll order, and
// the final section may never reach the top of the viewport on a short page.
export function trackActiveSection(onChange: (id: string) => void) {
  let frame = 0;
  const update = () => {
    frame = 0;
    const sections = navigation
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    if (!sections.length) return;
    const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
    const marker = Math.max(headerBottom + 24, window.innerHeight * 0.25);
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= marker) active = section;
    }
    if (
      window.scrollY > 0 &&
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
    ) {
      active = sections[sections.length - 1];
    }
    onChange(active.id);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  const resize = new ResizeObserver(schedule);
  resize.observe(document.body);
  schedule();
  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  };
}
