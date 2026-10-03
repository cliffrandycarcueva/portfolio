import { useEffect, useState } from 'react';
import { navigation } from '../data';
import { trackActiveSection } from '../../shared/active-section';
export function useActiveSection() {
  const [active, setActive] = useState<string>(navigation[0]?.id ?? '');
  useEffect(() => trackActiveSection(setActive), []);
  return active;
}
