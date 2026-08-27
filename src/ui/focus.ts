export function restoreArcadeFocus(container: HTMLElement, fallback?: HTMLElement): void {
  const selected = Array.from(container.querySelectorAll<HTMLElement>('.arcade-selected')).find(
    (element) => element.closest('.arcade-overlay[hidden]') === null,
  );
  const target = selected ?? fallback;

  target?.focus({ preventScroll: true });
}
