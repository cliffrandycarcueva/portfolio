import { test, expect } from '@playwright/test';
import { profile } from '../src/data';

test('shared contact links and clipboard feedback work across sections', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          window.sessionStorage.setItem('copied-email', text);
        },
      },
    });
  });
  await page.goto('./');
  for (const name of ['GitHub', 'LinkedIn'] as const) {
    const links = page.getByRole('link', { name, exact: true });
    await expect(links).toHaveCount(2);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute(
        'href',
        name === 'GitHub' ? profile.github : profile.linkedin,
      );
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  }
  await expect(page.locator('.contact-email')).toHaveAttribute('href', `mailto:${profile.email}`);
  await page.getByRole('button', { name: 'Copy email', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Email address copied to clipboard.');
  expect(await page.evaluate(() => sessionStorage.getItem('copied-email'))).toBe(profile.email);
  await expect(page.getByRole('button', { name: 'Copy email', exact: true })).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('Clipboard unavailable');
        },
      },
    });
  });
  await page.getByRole('button', { name: 'Copy email', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Please select and copy the email address above.',
  );
});

test('experience accordion preserves resume content and supports bulk controls', async ({
  page,
}) => {
  await page.goto('./');
  const current = page.locator('#trigger-jairosoft-senior');
  await expect(current).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#panel-jairosoft-senior li')).toHaveCount(10);
  await page.screenshot({
    path: `test-results/${test.info().project.name}-desktop.png`,
    fullPage: true,
  });
  await current.click();
  await expect(page.locator('#panel-jairosoft-senior')).toBeHidden();
  await current.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#panel-jairosoft-senior')).toBeVisible();
  await page.getByRole('button', { name: 'Expand all' }).click();
  await expect(page.locator('.experience-trigger[aria-expanded="true"]')).toHaveCount(7);
  await page.getByRole('button', { name: 'Collapse all' }).click();
  await expect(page.locator('.experience-trigger[aria-expanded="true"]')).toHaveCount(0);
});

test('skill tabs, theme persistence, resume, and browser errors', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await page.getByRole('tab', { name: 'Backend' }).click();
  await expect(page.getByRole('tabpanel')).toContainText('NestJS');
  await expect(page.getByRole('tabpanel')).toContainText('PHP (Minimal knowledge)');
  await expect(page.getByRole('tabpanel')).toContainText('Laravel (Minimal knowledge)');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Database' })).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('PostgreSQL');
  await page.getByRole('tab', { name: 'Engineering' }).click();
  await expect(page.getByRole('tabpanel')).toContainText(
    'Azure DevOps — Deployments & Pipelines (Minimal knowledge)',
  );
  const lightBackground = await page
    .locator('.skill-panel')
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(
    await page.locator('.skill-panel').evaluate((el) => getComputedStyle(el).backgroundColor),
  ).not.toBe(lightBackground);
  const response = await request.get('/Cliff_Randy_Carcueva_Resume.pdf');
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('application/pdf');
  expect(errors).toEqual([]);
});

test('responsive Tailwind layouts, reduced motion, and printed responsibilities', async ({
  page,
}) => {
  await page.goto('./');
  for (const width of [320, 640, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('tab', { name: 'Engineering' }).click();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy();
    const columns = await page
      .locator('.hero')
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width < 640 ? 1 : 2);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#trigger-lemontech').click();
  await expect(page.locator('#panel-lemontech')).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Expand all' }).click();
  await page.getByRole('button', { name: 'Collapse all' }).click();
  await page.emulateMedia({ media: 'print' });
  for (const panel of await page.locator('.experience-details').all()) {
    await expect(panel).toBeVisible();
  }
});

test('mobile fits viewport and experience details remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('./');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy();
  await page.locator('#trigger-lemontech').click();
  await expect(page.locator('#panel-lemontech')).toBeVisible();
  await page.screenshot({
    path: `test-results/${test.info().project.name}-mobile.png`,
    fullPage: true,
  });
});
