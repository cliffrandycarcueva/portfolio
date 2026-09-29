export type Framework = 'react' | 'angular';

/** Keep same-page navigation intact when crossing application boundaries. */
export function frameworkUrl(framework: Framework, hash = window.location.hash): string {
  return `/${framework}/${hash}`;
}
