import test, { chromium, expect } from "@playwright/test";


test("Assertion test",async({page})=>{
    const brower = chromium.launch()
    const context = (await brower).newContext()
    const p = (await context).newPage()
    await page.goto("https://kitchen.applitools.com/")
    await page.pause();
    await expect(page.locator("text=The Kitchen")).toHaveCount(1)
   if( await page.$('text=The Kitchen')){
    await page.locator('text=The Kitchen').click()
   }
})