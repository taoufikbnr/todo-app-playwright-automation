import test, { chromium, Page } from "@playwright/test";

const login = async (page: Page) => {
  await page.goto("https://saucedemo.com/");
  await page.pause();
  await page.locator('[data-test="username"]').fill("standard_user");
  await page.locator('[data-test="password"]').click();
  await page.locator('[data-test="password"]').fill("secret_sauce");
  await page.locator('[data-test="login-button"]').click();
  //   await page.waitForURL("**/dashboard")
};
test.beforeEach( async ({ page }) => {
 await login(page);
});
test("Home", async ({ page }) => {
          await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
});

test.afterEach("Logout",async({page})=>{
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.locator('[data-test="logout-sidebar-link"]').click();
 await page.close()
})

test.afterAll(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();


  await browser.close();
});