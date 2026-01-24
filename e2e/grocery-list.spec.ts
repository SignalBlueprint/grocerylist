import { test, expect } from '@playwright/test';

test.describe('Grocery List Generator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and clear any existing data
    await page.goto('/');

    // Wait for the app to load
    await expect(page.getByRole('heading', { name: 'Grocery List Generator' })).toBeVisible();

    // Clear localStorage to start fresh
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Reload to ensure clean state
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Grocery List Generator' })).toBeVisible();
  });

  test('should select recipes from the library', async ({ page }) => {
    // Verify we're on the recipes view
    await expect(page.getByRole('button', { name: 'Recipes', pressed: true })).toBeVisible();

    // Verify recipe library is visible
    await expect(page.getByRole('heading', { name: 'Recipe Library' })).toBeVisible();

    // Select the first recipe (should be available in the default recipes)
    const firstRecipe = page.locator('[data-recipe-card]').first();
    await expect(firstRecipe).toBeVisible();

    // Click to select the recipe
    await firstRecipe.click();

    // Verify the recipe appears in the selected recipes section
    const selectedSection = page.locator('text=Selected Recipes').locator('..');
    await expect(selectedSection).toBeVisible();

    // Wait a bit for the selection to be processed
    await page.waitForTimeout(500);

    // Select a second recipe
    const secondRecipe = page.locator('[data-recipe-card]').nth(1);
    await secondRecipe.click();

    // Wait for the selection to be processed
    await page.waitForTimeout(500);

    // Verify that we have selected recipes (check for the Generate List button)
    await expect(page.getByRole('button', { name: /Generate.*List/i })).toBeVisible();
  });

  test('should generate a grocery list from selected recipes', async ({ page }) => {
    // Select recipes first
    const firstRecipe = page.locator('[data-recipe-card]').first();
    await firstRecipe.click();
    await page.waitForTimeout(500);

    const secondRecipe = page.locator('[data-recipe-card]').nth(1);
    await secondRecipe.click();
    await page.waitForTimeout(500);

    // Click the Generate List button
    const generateButton = page.getByRole('button', { name: /Generate.*List/i });
    await expect(generateButton).toBeVisible();
    await generateButton.click();

    // Verify we're now on the list view
    await expect(page.getByRole('button', { name: 'List', pressed: true })).toBeVisible();

    // Verify that grocery items are displayed
    // The list should have items with checkboxes
    const groceryItems = page.locator('[data-grocery-item]');
    await expect(groceryItems.first()).toBeVisible();

    // Verify we can see the Back to Recipes button
    await expect(page.getByRole('button', { name: 'Back to Recipes' })).toBeVisible();

    // Verify the List button in header shows a count
    const listButton = page.getByRole('button', { name: /List \(\d+\)/ });
    await expect(listButton).toBeVisible();
  });

  test('should check off items in the grocery list', async ({ page }) => {
    // First, select recipes and generate a list
    const firstRecipe = page.locator('[data-recipe-card]').first();
    await firstRecipe.click();
    await page.waitForTimeout(500);

    const generateButton = page.getByRole('button', { name: /Generate.*List/i });
    await generateButton.click();

    // Wait for the list view to load
    await expect(page.getByRole('button', { name: 'List', pressed: true })).toBeVisible();

    // Get the first grocery item
    const firstItem = page.locator('[data-grocery-item]').first();
    await expect(firstItem).toBeVisible();

    // Find the checkbox within the first item
    const checkbox = firstItem.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();

    // Verify it's initially unchecked
    await expect(checkbox).not.toBeChecked();

    // Click the checkbox to check it
    await checkbox.click();

    // Verify it's now checked
    await expect(checkbox).toBeChecked();

    // Verify the item has the checked styling (should have bg-gray-50 class when checked)
    await expect(firstItem).toHaveClass(/bg-gray-50/);

    // Uncheck the item
    await checkbox.click();

    // Verify it's unchecked again
    await expect(checkbox).not.toBeChecked();

    // Check multiple items
    const secondItem = page.locator('[data-grocery-item]').nth(1);
    if (await secondItem.isVisible()) {
      const secondCheckbox = secondItem.locator('input[type="checkbox"]');
      await secondCheckbox.click();
      await expect(secondCheckbox).toBeChecked();
    }
  });

  test('should persist selections across page reloads', async ({ page }) => {
    // Select a recipe
    const firstRecipe = page.locator('[data-recipe-card]').first();
    await firstRecipe.click();
    await page.waitForTimeout(500);

    // Generate a list
    const generateButton = page.getByRole('button', { name: /Generate.*List/i });
    await generateButton.click();

    // Check off an item
    const firstItem = page.locator('[data-grocery-item]').first();
    const checkbox = firstItem.locator('input[type="checkbox"]');
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Reload the page
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Grocery List Generator' })).toBeVisible();

    // Navigate to the list view
    const listButton = page.getByRole('button', { name: /List/ }).first();
    await listButton.click();

    // Verify the checked state persisted
    const reloadedFirstItem = page.locator('[data-grocery-item]').first();
    const reloadedCheckbox = reloadedFirstItem.locator('input[type="checkbox"]');
    await expect(reloadedCheckbox).toBeChecked();
  });

  test('should allow editing servings before generating list', async ({ page }) => {
    // Select a recipe
    const firstRecipe = page.locator('[data-recipe-card]').first();
    await firstRecipe.click();
    await page.waitForTimeout(500);

    // Check if we're on mobile (drawer scenario) or desktop
    const mobileDrawerButton = page.getByRole('button', { name: /View Selected.*Generate List/i });
    const isMobile = await mobileDrawerButton.isVisible().catch(() => false);

    if (isMobile) {
      // Click the mobile drawer button to open it
      await mobileDrawerButton.click();
      await page.waitForTimeout(300);
    }

    // Find the servings buttons (- and + buttons)
    const increaseButton = page.getByRole('button', { name: 'Increase servings' }).first();
    await expect(increaseButton).toBeVisible();

    // Click increase servings a couple times
    await increaseButton.click();
    await page.waitForTimeout(200);
    await increaseButton.click();
    await page.waitForTimeout(200);

    // Close mobile drawer if we opened it
    if (isMobile) {
      // Click outside the drawer to close it
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(300);
    }

    // Generate the list with updated servings
    const generateButton = page.getByRole('button', { name: /Generate.*List/i });
    await generateButton.click();

    // Verify the list was generated
    await expect(page.getByRole('button', { name: 'List', pressed: true })).toBeVisible();
    await expect(page.locator('[data-grocery-item]').first()).toBeVisible();
  });
});
