import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { TestConfig } from '../config/test-config';

export class BaseE2ETest {
  protected driver!: WebDriver;
  protected baseUrl: string;

  constructor() {
    this.baseUrl = TestConfig.baseUrl;
  }

  async initializeDriver(): Promise<void> {
    const chromeOptions = new Options();
    // chromeOptions.addArguments('--headless');
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');
    chromeOptions.addArguments('--disable-gpu');
    chromeOptions.addArguments('--window-size=1920,1080');
    // chromeOptions.addArguments('--disable-extensions');
    // chromeOptions.addArguments('--disable-background-timer-throttling');
    // chromeOptions.addArguments('--disable-backgrounding-occluded-windows');
    // chromeOptions.addArguments('--disable-renderer-backgrounding');

    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    await this.driver.manage().setTimeouts({
      implicit: TestConfig.timeouts.implicit,
      pageLoad: TestConfig.timeouts.pageLoad,
    });
  }

  async cleanup(): Promise<void> {
    if (this.driver) {
      await this.driver.quit();
    }
  }

  async navigateTo(url: string): Promise<void> {
    await this.driver.get(url);
  }

  async waitForElement(
    selector: string,
    timeout: number = TestConfig.timeouts.elementWait
  ): Promise<WebElement> {
    return await this.driver.wait(
      until.elementIsVisible(this.driver.findElement(By.css(selector))),
      timeout
    );
  }

  async waitForClickableElement(
    selector: string,
    timeout: number = TestConfig.timeouts.elementWait
  ): Promise<WebElement> {
    return await this.driver.wait(
      until.elementIsEnabled(this.driver.findElement(By.css(selector))),
      timeout
    );
  }

  async clickElement(selector: string): Promise<void> {
    const element = await this.waitForClickableElement(selector);
    await element.click();
  }

  async typeText(selector: string, text: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.clear();
    await element.sendKeys(text);
  }

  async getElementText(selector: string): Promise<string> {
    const element = await this.waitForElement(selector);
    return await element.getText();
  }

  async getElementAttribute(
    selector: string,
    attribute: string
  ): Promise<string> {
    const element = await this.waitForElement(selector);
    return await element.getAttribute(attribute);
  }

  async isElementDisplayed(selector: string): Promise<boolean> {
    try {
      const element = await this.driver.findElement(By.css(selector));
      return await element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  async waitForPageTitle(
    title: string,
    timeout: number = TestConfig.timeouts.pageLoad
  ): Promise<void> {
    await this.driver.wait(until.titleContains(title), timeout);
  }

  async login(email: string, password: string): Promise<void> {
    // Navigate to login page
    await this.navigateTo(TestConfig.loginUrl);
    await this.waitForPageLoad();

    // Wait for form to be ready
    await this.waitForElement('form', 10000);
    await this.sleep(1000);

    // Fill in credentials
    await this.simulateUserTyping('#email', email);
    await this.sleep(500);
    await this.simulateUserTyping('#password', password);
    await this.sleep(500);

    // Submit login form
    await this.simulateUserClick('button[type="submit"]');

    // Wait for navigation away from login page
    try {
      await this.driver.wait(async () => {
        const currentUrl = await this.driver.getCurrentUrl();
        return !currentUrl.includes('/login');
      }, TestConfig.timeouts.pageLoad);

      // Additional wait for page to stabilize
      await this.waitForPageLoad();
      await this.sleep(2000);
    } catch (error) {
      await this.takeScreenshot('login-failed');

      // Check for error messages
      try {
        const errorElement = await this.driver.findElement(
          By.css('.text-red-600')
        );
        const errorText = await errorElement.getText();
        console.log(`Login error: ${errorText}`);
      } catch (e) {
        // No error message found
      }

      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Wait for any snackbars/notifications to disappear
      await this.sleep(3000);

      // Close any open snackbars by clicking outside
      try {
        const snackbar = await this.driver.findElement(
          By.css('.mat-mdc-snack-bar-container')
        );
        if (snackbar) {
          await this.sleep(2000); // Wait for snackbar to auto-close
        }
      } catch (e) {
        // No snackbar present, continue
      }

      // Open user menu dropdown
      await this.simulateUserClick(
        '[data-testid="authenticatedOptionsDropdown"]'
      );

      // Wait for dropdown menu to appear
      await this.waitForElement('[data-testid="user-dropdown-menu"]', 5000);
      await this.sleep(500);

      // Click logout button
      await this.simulateUserClick('[data-testid="logout"]');

      // Wait for redirect to login page
      await this.driver.wait(
        until.urlContains('/login'),
        TestConfig.timeouts.elementWait
      );

      await this.waitForPageLoad();
    } catch (error) {
      await this.takeScreenshot('logout-failed');
      throw error;
    }
  }

  async wait(ms: number = TestConfig.timeouts.shortWait): Promise<void> {
    await this.driver.sleep(ms);
  }

  getDriver(): WebDriver {
    return this.driver;
  }

  async findElements(selector: string): Promise<WebElement[]> {
    return await this.driver.findElements(By.css(selector));
  }

  async waitForUrl(
    urlPart: string,
    timeout: number = TestConfig.timeouts.pageLoad
  ): Promise<void> {
    await this.driver.wait(until.urlContains(urlPart), timeout);
  }

  // ==================== VISUAL TESTING METHODS ====================
  // These methods simulate real user behavior with delays and visual feedback

  async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async typeTextSlowly(
    selector: string,
    text: string,
    delay: number = 100
  ): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.clear();
    await this.sleep(200);

    for (const char of text) {
      await element.sendKeys(char);
      await this.sleep(delay);
    }
    await this.sleep(300);
  }

  async clickElementSlowly(
    selector: string,
    delay: number = 500
  ): Promise<void> {
    await this.sleep(delay);

    try {
      const element = await this.waitForClickableElement(selector);

      // Scroll element into view first
      await this.driver.executeScript(
        'arguments[0].scrollIntoView(true);',
        element
      );
      await this.sleep(300);

      // Click the element
      await element.click();
    } catch (error) {
      throw error;
    }

    await this.sleep(delay);
  }

  async takeScreenshot(name: string): Promise<void> {
    try {
      const screenshot = await this.driver.takeScreenshot();
      const fs = require('fs');
      const path = require('path');

      const screenshotDir = path.join(process.cwd(), 'e2e', 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const filename = `${name}-${Date.now()}.png`;
      const filepath = path.join(screenshotDir, filename);

      fs.writeFileSync(filepath, screenshot, 'base64');
    } catch (error) {
      // Screenshot failed
    }
  }

  async hoverOverElement(selector: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await this.driver.actions().move({ origin: element }).perform();
    await this.sleep(500);
  }

  async scrollToElement(selector: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await this.driver.executeScript(
      "arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });",
      element
    );
    await this.sleep(800);
  }

  async waitForPageLoad(): Promise<void> {
    await this.driver.wait(async () => {
      const readyState = await this.driver.executeScript(
        'return document.readyState'
      );
      return readyState === 'complete';
    }, TestConfig.timeouts.pageLoad);
    await this.sleep(1000);
  }

  async simulateUserTyping(selector: string, text: string): Promise<void> {
    // Focus on the element first
    const element = await this.waitForElement(selector);
    await element.click();
    await this.sleep(200);

    // Clear existing text
    await element.clear();
    await this.sleep(300);

    // Type character by character with random delays
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      await element.sendKeys(char);

      // Random delay between 50-150ms to simulate human typing
      const randomDelay = Math.random() * 100 + 50;
      await this.sleep(randomDelay);

      // Occasional longer pause (like thinking)
      if (Math.random() < 0.1 && i > 0) {
        await this.sleep(200 + Math.random() * 300);
      }
    }

    await this.sleep(500);
  }

  async simulateUserClick(selector: string): Promise<void> {
    // Scroll to element first
    await this.scrollToElement(selector);

    // Hover over element
    await this.hoverOverElement(selector);

    // Small pause before clicking (like user aiming)
    await this.sleep(200 + Math.random() * 300);

    // Click the element
    const element = await this.waitForClickableElement(selector);
    await element.click();

    await this.sleep(500);
  }

  async clickOnMap(
    mapSelector: string,
    offsetX: number = 0,
    offsetY: number = 0
  ): Promise<void> {
    const mapElement = await this.waitForElement(mapSelector, 10000);

    // Use Actions API to click at specific coordinates
    const actions = this.driver.actions({ async: true });

    if (offsetX === 0 && offsetY === 0) {
      // Click in the center of the map
      await actions.move({ origin: mapElement }).click().perform();
    } else {
      // Click at specific offset from center
      await actions
        .move({ origin: mapElement, x: offsetX, y: offsetY })
        .click()
        .perform();
    }

    await this.sleep(1000);
  }

  async setDateTimeValue(
    selector: string,
    dateTimeValue: string
  ): Promise<void> {
    // For datetime-local inputs, we need to set the value directly via JavaScript
    // because some digits may be disabled due to min/max constraints
    await this.driver.executeScript(
      `document.querySelector('${selector}').value = '${dateTimeValue}';`
    );

    // Trigger change event to ensure Angular detects the change
    await this.driver.executeScript(
      `document.querySelector('${selector}').dispatchEvent(new Event('input', { bubbles: true }));`
    );
    await this.driver.executeScript(
      `document.querySelector('${selector}').dispatchEvent(new Event('change', { bubbles: true }));`
    );

    await this.sleep(500);
  }
}
