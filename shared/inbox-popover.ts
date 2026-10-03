// Keep the owner popover aligned with the header bell, including on mobile.
export function anchorInbox(panel: HTMLElement, close: () => void) {
  const bell = document.getElementById('owner-inbox-bell');
  if (!bell) return () => {};
  const position = () => {
    const rect = bell.getBoundingClientRect();
    const width = Math.min(380, window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12));
    panel.style.setProperty('--inbox-top', `${rect.bottom + 12}px`);
    panel.style.setProperty('--inbox-left', `${left}px`);
    panel.style.setProperty('--inbox-pointer', `${rect.left + rect.width / 2 - left}px`);
  };
  const dismiss = (event: PointerEvent) => {
    if (
      event.target instanceof Node &&
      !panel.contains(event.target) &&
      !bell.contains(event.target)
    )
      close();
  };
  position();
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, { passive: true });
  document.addEventListener('pointerdown', dismiss);
  const resize = new ResizeObserver(position);
  resize.observe(bell);
  return () => {
    resize.disconnect();
    window.removeEventListener('resize', position);
    window.removeEventListener('scroll', position);
    document.removeEventListener('pointerdown', dismiss);
  };
}
