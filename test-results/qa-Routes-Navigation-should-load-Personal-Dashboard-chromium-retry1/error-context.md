# Test info

- Name: Routes & Navigation >> should load Personal Dashboard
- Location: C:\Users\Nate\Kongtroller\kingdao.io\scripts\qa.test.ts:5:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected string: "http://localhost:3000/dashboard/personal"
Received string: "http://localhost:3000/dashboard"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html lang="en" class="light">…</html>
      - unexpected value "http://localhost:3000/dashboard"

    at C:\Users\Nate\Kongtroller\kingdao.io\scripts\qa.test.ts:7:24
```

# Page snapshot

```yaml
- navigation:
  - link "Logo KingDAO.io":
    - /url: /
    - img "Logo"
    - text: KingDAO.io
  - list:
    - listitem:
      - link "FAQ":
        - /url: "#faq"
    - listitem:
      - link "Dashboard":
        - /url: /dashboard
  - button "Connect Wallet"
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
>  7 |     await expect(page).toHaveURL('/dashboard/personal');
     |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
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
   82 |     await page.click('[data-testid="tab-nft"]');
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
```