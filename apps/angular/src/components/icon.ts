import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'portfolio-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: inline-flex; flex-shrink: 0; vertical-align: middle' },
  template: `<svg
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <use [attr.href]="'/icons.svg#' + name()" />
  </svg>`,
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(24);
}
