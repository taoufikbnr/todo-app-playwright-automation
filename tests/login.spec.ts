import { test } from '@playwright/test';


test('Login',async ({page})=>{
    
   await page.goto('https://demo.applitools.com/')
   await page.pause()
   await page.locator('id=username').fill('user')
   await page.locator('id=password').fill('password')
   await page.waitForSelector('text=Sign in',{timeout:3000})
   await page.locator('text=Sign in').click()
})

test.only('Login 2',async({page})=>{
   await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')
   await page.pause();
   await page.locator('[placeholder="Username"]').fill('admin')
   await page.locator('[placeholder="Password"]').fill('admin123')
   await page.locator("button[type=Submit]").click()
   await page.waitForURL("https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index")
   await page.locator("#app > div.oxd-layout.orangehrm-upgrade-layout > div.oxd-layout-navigation > header > div.oxd-topbar-header > div.oxd-topbar-header-userarea > ul > li > span > p").click()
   await page.click("text=Logout")
})