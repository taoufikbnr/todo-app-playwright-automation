Playwright : End-to-End Automation

A complete E2E test automation project built using Playwright 

This project demonstrates modern UI automation practices including:

Cross-browser testing
Page Object Model (POM)
Reusable test structure
Assertions and validations
Test reporting
Automated workflows


# Connecting Playwright to a Real Chrome Session (via CDP)

### 1. Close Chrome Completely

Make sure all Chrome windows and background processes are closed before proceeding.

### 2. Create a Dedicated Debug Profile Folder

Create a folder that will be used as the Chrome user data directory for debugging, for example:

```text
C:\Users\<YourUsername>\Desktop\profile
```

### 3. Copy Your Existing Chrome Profile

Copy your current Chrome profile into the debug folder.

Default profile location:

```text
C:\Users\<YourUsername>\AppData\Local\Google\Chrome\User Data\Default
```

If you use a different Chrome profile, copy the corresponding `Profile X` folder instead.

### 4. Launch Chrome with Remote Debugging Enabled

Open Command Prompt and run the following command (replace the paths and profile name as needed):

```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\Users\<YourUsername>\Desktop\profile" --profile-directory="<Profile Name>"
```

Example:

```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\Users\John\Desktop\profile" --profile-directory="Default"
```

### 5. Connect Playwright to Chrome

Use Playwright's CDP connection API to attach to the running Chrome instance:

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  await page.goto('https://example.com');
})();
```
