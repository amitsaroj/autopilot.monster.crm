import { test, expect } from '@playwright/test';

const apiReadyUrl =
  process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8000/api/v1/health/ready';

const demoEmail = process.env.E2E_EMAIL ?? 'user@autopilotmonster.com';
const demoPassword = process.env.E2E_PASSWORD ?? 'SecureP@ssw0rd!';

async function isApiReady(): Promise<boolean> {
  try {
    const response = await fetch(apiReadyUrl);
    return response.ok;
  } catch {
    return false;
  }
}

test.describe('login', () => {
  test('login page smoke', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('login → dashboard', async ({ page }) => {
    const apiReady = await isApiReady();
    test.skip(!apiReady, 'API not ready — start docker-compose and seed demo users');

    await page.goto('/login');
    await page.getByLabel('Email').fill(demoEmail);
    await page.getByLabel('Password').fill(demoPassword);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
