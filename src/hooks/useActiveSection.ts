import { useEffect, useState } from 'react';
import { navigation } from '../data';
export function useActiveSection() {
  const [active, setActive] = useState<string>(navigation[0]?.id ?? '');
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -60% 0px' },
    );
    navigation.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}
