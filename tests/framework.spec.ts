import { test, expect } from '@playwright/test';

test('navigation follows Contact, direct links, and scrolling back to About', async ({ page }) => {
  await page.goto('./');
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  const contact = nav.getByRole('link', { name: 'contact', exact: true });
  await contact.click();
  await expect(contact).toHaveAttribute('aria-current', 'location');
  await expect(nav.locator('[aria-current]')).toHaveCount(1);
  const underline = await contact.evaluate((link) => {
    const style = getComputedStyle(link, '::after');
    return { width: parseFloat(style.width), height: parseFloat(style.height) };
  });
  expect(underline.width).toBeGreaterThan(underline.height * 5);
  await page.reload();
  await expect(contact).toHaveAttribute('aria-current', 'location');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(nav.getByRole('link', { name: 'about', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
  await page.goto('./#skills');
  await expect(nav.getByRole('link', { name: 'skills', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
});

test('framework switch preserves theme and section through navigation and reload', async ({
  page,
}, testInfo) => {
  const source = testInfo.project.name;
  const target = source === 'react' ? 'angular' : 'react';
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./#skills');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  const toggle = page.getByRole('switch', { name: 'Use Angular version' });
  await expect(toggle).toHaveAttribute('aria-checked', String(source === 'angular'));
  await toggle.click();
  await expect(page).toHaveURL(new RegExp(`/${target}/#skills$`));
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAttribute('aria-checked', String(target === 'angular'));
  await expect(page.getByRole('heading', { name: /The right tools/ })).toBeInViewport();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await toggle.click();
  await expect(page).toHaveURL(new RegExp(`/${source}/#skills$`));
  await expect(page.getByRole('tab', { name: 'Frontend' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('each route bootstraps its own application and shares public assets', async ({
  page,
  request,
}, testInfo) => {
  await page.goto('./');
  if (testInfo.project.name === 'angular') {
    await expect(page.locator('portfolio-app')).toHaveAttribute('ng-version', /^21\./);
    await expect(page.locator('#root')).toHaveCount(0);
    await expect(page.locator('script[src*="/react/"]')).toHaveCount(0);
  } else {
    await expect(page.locator('#root')).toContainText('Cliff Randy');
    await expect(page.locator('portfolio-app')).toHaveCount(0);
    await expect(page.locator('script[src*="/angular/"]')).toHaveCount(0);
  }
  for (const asset of ['/favicon.svg', '/icons.svg', '/Cliff_Randy_Carcueva_Resume.pdf']) {
    expect((await request.get(asset)).ok()).toBeTruthy();
  }
});

test('framework and theme controls fit small screens and are keyboard accessible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto('./');
  const toggle = page.getByRole('switch', { name: 'Use Angular version' });
  await expect(toggle).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeInViewport();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  const originalUrl = page.url();
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(page).not.toHaveURL(originalUrl);
  await expect(toggle).toBeInViewport();
});
