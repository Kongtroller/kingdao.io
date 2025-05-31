import { test, expect } from '@playwright/test';

// Routes & Navigation Tests
test.describe('Routes & Navigation', () => {
  test('should load Personal Dashboard', async ({ page }) => {
    await page.goto('/dashboard/personal');
    await expect(page).toHaveURL('/dashboard/personal');
    // Check for error banners
    const errorBanner = await page.$('[data-testid="error-banner"]');
    expect(errorBanner).toBeNull();
  });

  test('should load DAO Dashboard', async ({ page }) => {
    await page.goto('/dashboard/dao');
    await expect(page).toHaveURL('/dashboard/dao');
    const errorBanner = await page.$('[data-testid="error-banner"]');
    expect(errorBanner).toBeNull();
  });

  test('should toggle between dashboards', async ({ page }) => {
    await page.goto('/dashboard/personal');
    await page.click('[data-testid="nav-dao"]');
    await expect(page).toHaveURL('/dashboard/dao');
    await page.click('[data-testid="nav-personal"]');
    await expect(page).toHaveURL('/dashboard/personal');
  });
});

// Data Fetching Tests
test.describe('Data Fetching', () => {
  test('should show KING price chart', async ({ page }) => {
    await page.goto('/dashboard/personal');
    await expect(page.locator('[data-testid="price-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeHidden();
  });

  test('should show recent sales', async ({ page }) => {
    await page.goto('/dashboard/personal');
    const salesList = await page.locator('[data-testid="recent-sales"]');
    await expect(salesList).toBeVisible();
    
    // Check either sales items or "No sales found" message
    const hasSales = await page.$('[data-testid="sale-item"]');
    const noSalesMsg = await page.$('[data-testid="no-sales-message"]');
    expect(hasSales || noSalesMsg).toBeTruthy();
  });

  test('should show NFT pagination when needed', async ({ page }) => {
    await page.goto('/dashboard/personal');
    const pagination = await page.locator('[data-testid="nft-pagination"]');
    const totalNFTs = await page.evaluate(() => {
      return document.querySelectorAll('[data-testid="nft-item"]').length;
    });
    
    if (totalNFTs > 10) {
      await expect(pagination).toBeVisible();
    } else {
      await expect(pagination).toBeHidden();
    }
  });
});

// DAO Overview Tests
test.describe('DAO Overview & Tabs', () => {
  test('should show correct DAO summary', async ({ page }) => {
    await page.goto('/dashboard/dao');
    const totalValue = await page.locator('[data-testid="total-value"]').innerText();
    const categories = await page.$$('[data-testid="category-value"]');
    
    let categorySum = 0;
    for (const category of categories) {
      const value = await category.innerText();
      categorySum += parseFloat(value.replace(/[^0-9.-]+/g, ''));
    }
    
    const total = parseFloat(totalValue.replace(/[^0-9.-]+/g, ''));
    expect(Math.abs(categorySum - total)).toBeLessThan(0.01); // Account for rounding
  });

  test('should navigate NFT collections', async ({ page }) => {
    await page.goto('/dashboard/dao');
    await page.click('[data-testid="tab-nft"]');
    await expect(page.locator('[data-testid="collection-grid"]')).toBeVisible();
    await page.click('[data-testid="collection-card"]:first-child');
    await expect(page.locator('[data-testid="nft-grid"]')).toBeVisible();
  });

  test('should filter crypto by category', async ({ page }) => {
    await page.goto('/dashboard/dao');
    await page.click('[data-testid="tab-crypto"]');
    const categories = ['Blue Chip', 'Proven Coins', 'New Coins'];
    
    for (const category of categories) {
      await page.click(`[data-testid="category-${category}"]`);
      await expect(page.locator('[data-testid="token-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="category-total"]')).toBeVisible();
    }
  });
});

// Theme & Styling Tests
test.describe('Theme & Styling', () => {
  test('should handle theme switching', async ({ page }) => {
    await page.goto('/dashboard/personal');
    await page.click('[data-testid="theme-switch"]');
    
    // Check dark mode styles
    await expect(page.locator('body')).toHaveClass(/dark/);
    
    // Verify chart colors
    const chart = await page.locator('[data-testid="price-chart"]');
    const darkModeColor = await chart.evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('--chart-line-color');
    });
    expect(darkModeColor).toBeTruthy();
  });
});

// Mobile Responsiveness Tests
test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should stack components on mobile', async ({ page }) => {
    await page.goto('/dashboard/personal');
    
    // Check vertical stacking
    const chart = await page.locator('[data-testid="price-chart"]');
    const sales = await page.locator('[data-testid="recent-sales"]');
    
    const chartBox = await chart.boundingBox();
    const salesBox = await sales.boundingBox();
    
    expect(salesBox?.y).toBeGreaterThan(chartBox?.y || 0 + chartBox?.height || 0);
  });
});

// Error Handling Tests
test.describe('Error & Edge Cases', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Simulate API failure
    await page.route('**/api/**', (route) => route.abort());
    await page.goto('/dashboard/personal');
    
    await expect(page.locator('[data-testid="error-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeHidden();
  });

  test('should show empty state placeholders', async ({ page }) => {
    await page.goto('/dashboard/personal');
    
    // Check for empty states when no data
    const hasNFTs = await page.$('[data-testid="nft-item"]');
    const emptyNFTState = await page.$('[data-testid="empty-nft-state"]');
    expect(hasNFTs || emptyNFTState).toBeTruthy();
    
    const hasTokens = await page.$('[data-testid="token-item"]');
    const emptyTokenState = await page.$('[data-testid="empty-token-state"]');
    expect(hasTokens || emptyTokenState).toBeTruthy();
  });
}); 