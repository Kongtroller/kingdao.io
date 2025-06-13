# Test info

- Name: DAO Overview & Tabs >> should navigate NFT collections
- Location: C:\Users\Nate\Kongtroller\kingdao.io\scripts\qa.test.ts:80:7

# Error details

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="tab-nft"]')

    at C:\Users\Nate\Kongtroller\kingdao.io\scripts\qa.test.ts:82:16
```

# Page snapshot

```yaml
- navigation:
  - link "Logo KingDAO.io":
    - /url: /
    - img "Logo"
    - text: KingDAO.io
  - button "Connect Wallet"
  - button "Toggle menu"
- main:
  - text: KingDAO.io
  - button "Toggle theme"
  - button "Personal"
  - button "DAO"
  - main:
    - paragraph: Please connect your wallet to view the dashboard
- link "Logo KingDAO.io":
  - /url: /
  - img "Logo"
  - text: KingDAO.io
- paragraph: KingDAO Hub
- link "Website":
  - /url: https://kingdao.io
- link "X":
  - /url: https://x.com/KongsDAO
  - img "X"
- link "Discord":
  - /url: https://discord.gg/FWKbnY5Bc6
  - img
- link "Opensea":
  - /url: https://opensea.io/collection/konginvestment
  - img "OpenSea"
- heading "Explore" [level=3]
- list:
  - listitem:
    - link "DAO Voting":
      - /url: https://snapshot.org/#/kongsdao.eth
  - listitem:
    - link "Contract":
      - /url: https://etherscan.io/address/0x6e3a2e08a88186f41ecd90e0683d9ca0983a4328
  - listitem:
    - link "Polygon Gnosis Safe":
      - /url: https://polygonscan.com/address/0x6df15Bf2aa8C57C6eb4A5C4Faaf53FA8795C59a0
  - listitem:
    - link "Ethereum Gnosis Safe":
      - /url: https://etherscan.io/address/0xde27cbE0DdfaDF1C8C27fC8e43f7e713DD1B23cF
  - listitem:
    - link "Whitepaper":
      - /url: https://docs.google.com/document/d/17md5LfWQX7TeMTQke43fVjAlztr3lyBiSP_gFdCxnt8/edit?usp=sharing
- heading "Legal" [level=3]
- list:
  - listitem:
    - link "Privacy Policy":
      - /url: /privacy
  - listitem:
    - link "Terms of Service":
      - /url: /terms
- text: © 2025
- link "KingDAO.io":
  - /url: https://kingdao.io
- text: . All Rights Reserved.
- region "Notifications alt+T"
- alert: /dashboard
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // Routes & Navigation Tests
   4 | test.describe('Routes & Navigation', () => {
   5 |   test('should load Personal Dashboard', async ({ page }) => {
   6 |     await page.goto('/dashboard/personal');
   7 |     await expect(page).toHaveURL('/dashboard/personal');
   8 |     // Check for error banners
   9 |     const errorBanner = await page.$('[data-testid="error-banner"]');
   10 |     expect(errorBanner).toBeNull();
   11 |   });
   12 |
   13 |   test('should load DAO Dashboard', async ({ page }) => {
   14 |     await page.goto('/dashboard/dao');
   15 |     await expect(page).toHaveURL('/dashboard/dao');
   16 |     const errorBanner = await page.$('[data-testid="error-banner"]');
   17 |     expect(errorBanner).toBeNull();
   18 |   });
   19 |
   20 |   test('should toggle between dashboards', async ({ page }) => {
   21 |     await page.goto('/dashboard/personal');
   22 |     await page.click('[data-testid="nav-dao"]');
   23 |     await expect(page).toHaveURL('/dashboard/dao');
   24 |     await page.click('[data-testid="nav-personal"]');
   25 |     await expect(page).toHaveURL('/dashboard/personal');
   26 |   });
   27 | });
   28 |
   29 | // Data Fetching Tests
   30 | test.describe('Data Fetching', () => {
   31 |   test('should show KING price chart', async ({ page }) => {
   32 |     await page.goto('/dashboard/personal');
   33 |     await expect(page.locator('[data-testid="price-chart"]')).toBeVisible();
   34 |     await expect(page.locator('[data-testid="loading-spinner"]')).toBeHidden();
   35 |   });
   36 |
   37 |   test('should show recent sales', async ({ page }) => {
   38 |     await page.goto('/dashboard/personal');
   39 |     const salesList = await page.locator('[data-testid="recent-sales"]');
   40 |     await expect(salesList).toBeVisible();
   41 |     
   42 |     // Check either sales items or "No sales found" message
   43 |     const hasSales = await page.$('[data-testid="sale-item"]');
   44 |     const noSalesMsg = await page.$('[data-testid="no-sales-message"]');
   45 |     expect(hasSales || noSalesMsg).toBeTruthy();
   46 |   });
   47 |
   48 |   test('should show NFT pagination when needed', async ({ page }) => {
   49 |     await page.goto('/dashboard/personal');
   50 |     const pagination = await page.locator('[data-testid="nft-pagination"]');
   51 |     const totalNFTs = await page.evaluate(() => {
   52 |       return document.querySelectorAll('[data-testid="nft-item"]').length;
   53 |     });
   54 |     
   55 |     if (totalNFTs > 10) {
   56 |       await expect(pagination).toBeVisible();
   57 |     } else {
   58 |       await expect(pagination).toBeHidden();
   59 |     }
   60 |   });
   61 | });
   62 |
   63 | // DAO Overview Tests
   64 | test.describe('DAO Overview & Tabs', () => {
   65 |   test('should show correct DAO summary', async ({ page }) => {
   66 |     await page.goto('/dashboard/dao');
   67 |     const totalValue = await page.locator('[data-testid="total-value"]').innerText();
   68 |     const categories = await page.$$('[data-testid="category-value"]');
   69 |     
   70 |     let categorySum = 0;
   71 |     for (const category of categories) {
   72 |       const value = await category.innerText();
   73 |       categorySum += parseFloat(value.replace(/[^0-9.-]+/g, ''));
   74 |     }
   75 |     
   76 |     const total = parseFloat(totalValue.replace(/[^0-9.-]+/g, ''));
   77 |     expect(Math.abs(categorySum - total)).toBeLessThan(0.01); // Account for rounding
   78 |   });
   79 |
   80 |   test('should navigate NFT collections', async ({ page }) => {
   81 |     await page.goto('/dashboard/dao');
>  82 |     await page.click('[data-testid="tab-nft"]');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
   83 |     await expect(page.locator('[data-testid="collection-grid"]')).toBeVisible();
   84 |     await page.click('[data-testid="collection-card"]:first-child');
   85 |     await expect(page.locator('[data-testid="nft-grid"]')).toBeVisible();
   86 |   });
   87 |
   88 |   test('should filter crypto by category', async ({ page }) => {
   89 |     await page.goto('/dashboard/dao');
   90 |     await page.click('[data-testid="tab-crypto"]');
   91 |     const categories = ['Blue Chip', 'Proven Coins', 'New Coins'];
   92 |     
   93 |     for (const category of categories) {
   94 |       await page.click(`[data-testid="category-${category}"]`);
   95 |       await expect(page.locator('[data-testid="token-list"]')).toBeVisible();
   96 |       await expect(page.locator('[data-testid="category-total"]')).toBeVisible();
   97 |     }
   98 |   });
   99 | });
  100 |
  101 | // Theme & Styling Tests
  102 | test.describe('Theme & Styling', () => {
  103 |   test('should handle theme switching', async ({ page }) => {
  104 |     await page.goto('/dashboard/personal');
  105 |     await page.click('[data-testid="theme-switch"]');
  106 |     
  107 |     // Check dark mode styles
  108 |     await expect(page.locator('body')).toHaveClass(/dark/);
  109 |     
  110 |     // Verify chart colors
  111 |     const chart = await page.locator('[data-testid="price-chart"]');
  112 |     const darkModeColor = await chart.evaluate((el) => {
  113 |       return window.getComputedStyle(el).getPropertyValue('--chart-line-color');
  114 |     });
  115 |     expect(darkModeColor).toBeTruthy();
  116 |   });
  117 | });
  118 |
  119 | // Mobile Responsiveness Tests
  120 | test.describe('Mobile Responsiveness', () => {
  121 |   test.beforeEach(async ({ page }) => {
  122 |     await page.setViewportSize({ width: 375, height: 667 });
  123 |   });
  124 |
  125 |   test('should stack components on mobile', async ({ page }) => {
  126 |     await page.goto('/dashboard/personal');
  127 |     
  128 |     // Check vertical stacking
  129 |     const chart = await page.locator('[data-testid="price-chart"]');
  130 |     const sales = await page.locator('[data-testid="recent-sales"]');
  131 |     
  132 |     const chartBox = await chart.boundingBox();
  133 |     const salesBox = await sales.boundingBox();
  134 |     
  135 |     expect(salesBox?.y).toBeGreaterThan(chartBox?.y || 0 + chartBox?.height || 0);
  136 |   });
  137 | });
  138 |
  139 | // Error Handling Tests
  140 | test.describe('Error & Edge Cases', () => {
  141 |   test('should handle API errors gracefully', async ({ page }) => {
  142 |     // Simulate API failure
  143 |     await page.route('**/api/**', (route) => route.abort());
  144 |     await page.goto('/dashboard/personal');
  145 |     
  146 |     await expect(page.locator('[data-testid="error-banner"]')).toBeVisible();
  147 |     await expect(page.locator('[data-testid="loading-spinner"]')).toBeHidden();
  148 |   });
  149 |
  150 |   test('should show empty state placeholders', async ({ page }) => {
  151 |     await page.goto('/dashboard/personal');
  152 |     
  153 |     // Check for empty states when no data
  154 |     const hasNFTs = await page.$('[data-testid="nft-item"]');
  155 |     const emptyNFTState = await page.$('[data-testid="empty-nft-state"]');
  156 |     expect(hasNFTs || emptyNFTState).toBeTruthy();
  157 |     
  158 |     const hasTokens = await page.$('[data-testid="token-item"]');
  159 |     const emptyTokenState = await page.$('[data-testid="empty-token-state"]');
  160 |     expect(hasTokens || emptyTokenState).toBeTruthy();
  161 |   });
  162 | }); 
```