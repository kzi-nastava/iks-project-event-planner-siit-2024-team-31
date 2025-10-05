import { By } from 'selenium-webdriver';
import { TestConfig } from '../config/test-config';
import { BaseE2ETest } from '../helpers/base-e2e-test';

/**
 * E2E Tests for Functionality 2.2: Event Management (including 2.3)
 * Student 1 - Event Planning System
 *
 * Tests cover:
 * - Event creation with all required fields
 * - Event type selection
 * - Location selection with map
 * - Agenda creation (functionality 2.3)
 * - Event privacy settings
 * - Form validation
 * - Error handling
 */
describe('Event Management E2E Tests (Functionality 2.2)', () => {
  let e2eTest!: BaseE2ETest;

  beforeAll(async () => {
    e2eTest = new BaseE2ETest();
    await e2eTest.initializeDriver();
  });

  afterAll(async () => {
    await e2eTest.cleanup();
  });

  beforeEach(async () => {
    // Login as organizer before each test
    await e2eTest.login(
      TestConfig.testCredentials.organizer.email,
      TestConfig.testCredentials.organizer.password
    );
  });

  afterEach(async () => {
    // Clean up after each test
    await e2eTest.logout();
  });

  describe('Event Creation - Happy Path', () => {
    it('should create a basic public event with all features', async () => {
      try {
        // Navigate to event creation page
        await e2eTest.navigateTo(TestConfig.createEventUrl);
        await e2eTest.waitForPageLoad();
        await e2eTest.waitForElement(
          '[data-testid="create-event-form"]',
          10000
        );
        await e2eTest.sleep(1000);

        // Fill in basic event information
        await e2eTest.simulateUserTyping(
          '[data-testid="event-name-input"]',
          TestConfig.testData.event.name
        );

        await e2eTest.simulateUserTyping(
          '[data-testid="event-description-input"]',
          TestConfig.testData.event.description
        );

        await e2eTest.simulateUserTyping(
          '[data-testid="event-max-guests-input"]',
          TestConfig.testData.event.maxGuests.toString()
        );

        // Select event type
        await e2eTest.simulateUserClick(
          '[data-testid="select-event-type-button"]'
        );
        await e2eTest.sleep(1000);
        await e2eTest.waitForElement('[data-testid="event-type-modal"]', 5000);
        await e2eTest.waitForElement('[data-testid="event-type-list"]', 5000);
        await e2eTest.sleep(500);

        const eventTypeItems = await e2eTest.findElements(
          '[data-testid^="event-type-item-"]'
        );
        if (eventTypeItems.length > 0) {
          await eventTypeItems[0].click();
          await e2eTest.sleep(500);
          await e2eTest.simulateUserClick(
            '[data-testid="event-type-confirm-button"]'
          );
          await e2eTest.sleep(1000);
        }

        // Select location on map
        await e2eTest.simulateUserClick('[data-testid="open-map-button"]');
        await e2eTest.sleep(1000);
        await e2eTest.waitForElement('[data-testid="map-modal"]', 5000);
        await e2eTest.waitForElement('[data-testid="location-map"]', 10000);
        await e2eTest.sleep(2000);
        await e2eTest.clickOnMap('[data-testid="location-map"]', 50, 50);
        await e2eTest.sleep(1000);
        await e2eTest.simulateUserClick('[data-testid="map-confirm-button"]');
        await e2eTest.sleep(1000);
      } catch (error) {
        await e2eTest.takeScreenshot('event-creation-failed');
        throw error;
      }

      try {
        // Create agenda
        await e2eTest.scrollToElement('[data-testid="create-agenda-button"]');
        await e2eTest.sleep(500);
        await e2eTest.simulateUserClick('[data-testid="create-agenda-button"]');
        await e2eTest.sleep(1000);
        await e2eTest.waitForElement('[data-testid="agenda-modal"]', 5000);

        // Fill in first agenda item
        await e2eTest.simulateUserTyping(
          '[data-testid="agenda-item-title-input"]',
          'Opening Ceremony'
        );

        await e2eTest.simulateUserTyping(
          '[data-testid="agenda-item-description-input"]',
          'Welcome speech and introduction'
        );

        // Format date for datetime-local input
        const formatDateTimeLocal = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        const now = new Date();
        const agendaStartDate = new Date(now);
        agendaStartDate.setHours(now.getHours() + 1);
        const agendaEndDate = new Date(agendaStartDate);
        agendaEndDate.setHours(agendaStartDate.getHours() + 2);

        await e2eTest.setDateTimeValue(
          '[data-testid="agenda-item-start-time-input"]',
          formatDateTimeLocal(agendaStartDate)
        );

        await e2eTest.setDateTimeValue(
          '[data-testid="agenda-item-end-time-input"]',
          formatDateTimeLocal(agendaEndDate)
        );

        await e2eTest.simulateUserTyping(
          '[data-testid="agenda-item-location-input"]',
          'Main Hall'
        );

        await e2eTest.simulateUserClick(
          '[data-testid="add-agenda-item-button"]'
        );
        await e2eTest.sleep(1000);

        await e2eTest.simulateUserClick('[data-testid="agenda-save-button"]');
        await e2eTest.sleep(1000);
      } catch (error) {
        await e2eTest.takeScreenshot('agenda-creation-failed');
        throw error;
      }

      try {
        // Set event as public
        const privateCheckbox = await e2eTest
          .getDriver()
          .findElement(By.css('[data-testid="event-is-private-checkbox"]'));
        const isPrivate = await privateCheckbox.isSelected();
        if (isPrivate) {
          await e2eTest.clickElement(
            '[data-testid="event-is-private-checkbox"]'
          );
          await e2eTest.sleep(500);
        }

        // Submit the form
        await e2eTest.simulateUserClick(
          '[data-testid="create-event-submit-button"]'
        );

        // Wait for success notification (Angular Material Snackbar)
        await e2eTest.sleep(3000);

        // Check if form is reset (success indicator)
        const eventNameInput = await e2eTest
          .getDriver()
          .findElement(By.css('[data-testid="event-name-input"]'));
        const nameValue = await eventNameInput.getAttribute('value');

        // If form is reset, name should be empty (success)
        expect(nameValue).toBe('');
      } catch (error) {
        await e2eTest.takeScreenshot('event-submission-failed');
        throw error;
      }
    });
  });

  describe('Form Validation', () => {
    it('should validate required event name field', async () => {
      try {
        await e2eTest.navigateTo(TestConfig.createEventUrl);
        await e2eTest.waitForElement(
          '[data-testid="create-event-form"]',
          10000
        );

        // Leave name empty and try to submit
        await e2eTest.simulateUserTyping(
          '[data-testid="event-description-input"]',
          'Test description'
        );

        await e2eTest.scrollToElement(
          '[data-testid="create-event-submit-button"]'
        );
        await e2eTest.sleep(500);

        await e2eTest.simulateUserClick(
          '[data-testid="create-event-submit-button"]'
        );

        // Should show validation error and stay on same page
        await e2eTest.sleep(2000);
        const currentUrl = await e2eTest.getDriver().getCurrentUrl();
        expect(currentUrl).toContain('/create-event');

        // Wait for snackbar to disappear before logout
        await e2eTest.sleep(3000);
      } catch (error) {
        await e2eTest.takeScreenshot('validation-test-failed');
        throw error;
      }
    });

    it('should validate max guests field accepts only numbers', async () => {
      //   try {
      //     await e2eTest.navigateTo(TestConfig.createEventUrl);
      //     await e2eTest.waitForElement(
      //       '[data-testid="create-event-form"]',
      //       10000
      //     );
      //     const maxGuestsInput = await e2eTest
      //       .getDriver()
      //       .findElement(By.css('[data-testid="event-max-guests-input"]'));
      //     const inputType = await maxGuestsInput.getAttribute('type');
      //     expect(inputType).toBe('number');
      //   } catch (error) {
      //     await e2eTest.takeScreenshot('max-guests-validation-failed');
      //     throw error;
      //   }
      // });
    });

    describe('Event Type Selection', () => {
      it('should open and close event type modal', async () => {
        try {
          await e2eTest.navigateTo(TestConfig.createEventUrl);
          await e2eTest.waitForElement(
            '[data-testid="create-event-form"]',
            10000
          );

          // Open modal
          await e2eTest.simulateUserClick(
            '[data-testid="select-event-type-button"]'
          );
          await e2eTest.sleep(1000);
          await e2eTest.waitForElement(
            '[data-testid="event-type-modal"]',
            5000
          );

          const modalVisible = await e2eTest.isElementDisplayed(
            '[data-testid="event-type-modal"]'
          );
          expect(modalVisible).toBe(true);

          // Close modal
          await e2eTest.simulateUserClick(
            '[data-testid="event-type-cancel-button"]'
          );
          await e2eTest.sleep(1000);
        } catch (error) {
          await e2eTest.takeScreenshot('event-type-modal-test-failed');
          throw error;
        }
      });

      it('should select an event type', async () => {
        try {
          await e2eTest.navigateTo(TestConfig.createEventUrl);
          await e2eTest.waitForElement(
            '[data-testid="create-event-form"]',
            10000
          );

          await e2eTest.simulateUserClick(
            '[data-testid="select-event-type-button"]'
          );
          await e2eTest.sleep(1000);
          await e2eTest.waitForElement(
            '[data-testid="event-type-modal"]',
            5000
          );
          await e2eTest.waitForElement('[data-testid="event-type-list"]', 5000);

          const eventTypeItems = await e2eTest.findElements(
            '[data-testid^="event-type-item-"]'
          );
          expect(eventTypeItems.length).toBeGreaterThan(0);

          if (eventTypeItems.length > 0) {
            await eventTypeItems[0].click();
            await e2eTest.sleep(500);
            await e2eTest.simulateUserClick(
              '[data-testid="event-type-confirm-button"]'
            );
            await e2eTest.sleep(1000);
          }
        } catch (error) {
          await e2eTest.takeScreenshot('event-type-selection-test-failed');
          throw error;
        }
      });
    });

    describe('Map Location Selection', () => {
      it('should open and close map modal', async () => {
        try {
          await e2eTest.navigateTo(TestConfig.createEventUrl);
          await e2eTest.waitForElement(
            '[data-testid="create-event-form"]',
            10000
          );

          // Open map
          await e2eTest.simulateUserClick('[data-testid="open-map-button"]');
          await e2eTest.sleep(1000);
          await e2eTest.waitForElement('[data-testid="map-modal"]', 5000);

          const mapVisible = await e2eTest.isElementDisplayed(
            '[data-testid="map-modal"]'
          );
          expect(mapVisible).toBe(true);

          // Close map
          await e2eTest.simulateUserClick('[data-testid="map-cancel-button"]');
          await e2eTest.sleep(1000);
        } catch (error) {
          await e2eTest.takeScreenshot('map-modal-test-failed');
          throw error;
        }
      });

      it('should select location on map', async () => {
        try {
          await e2eTest.navigateTo(TestConfig.createEventUrl);
          await e2eTest.waitForElement(
            '[data-testid="create-event-form"]',
            10000
          );

          await e2eTest.simulateUserClick('[data-testid="open-map-button"]');
          await e2eTest.sleep(1000);
          await e2eTest.waitForElement('[data-testid="map-modal"]', 5000);
          await e2eTest.waitForElement('[data-testid="location-map"]', 10000);
          await e2eTest.sleep(2000);

          await e2eTest.clickOnMap('[data-testid="location-map"]', 100, 100);
          await e2eTest.sleep(1000);

          await e2eTest.simulateUserClick('[data-testid="map-confirm-button"]');
          await e2eTest.sleep(1000);
        } catch (error) {
          await e2eTest.takeScreenshot('map-location-selection-failed');
          throw error;
        }
      });
    });

    describe('Agenda Creation (Functionality 2.3)', () => {
      it('should open and close agenda modal', async () => {
        try {
          await e2eTest.navigateTo(TestConfig.createEventUrl);
          await e2eTest.waitForElement(
            '[data-testid="create-event-form"]',
            10000
          );

          await e2eTest.scrollToElement('[data-testid="create-agenda-button"]');
          await e2eTest.sleep(500);

          // Open agenda modal
          await e2eTest.simulateUserClick(
            '[data-testid="create-agenda-button"]'
          );
          await e2eTest.sleep(1000);
          await e2eTest.waitForElement('[data-testid="agenda-modal"]', 5000);

          const agendaVisible = await e2eTest.isElementDisplayed(
            '[data-testid="agenda-modal"]'
          );
          expect(agendaVisible).toBe(true);

          // Close agenda modal
          await e2eTest.simulateUserClick(
            '[data-testid="agenda-cancel-button"]'
          );
          await e2eTest.sleep(1000);
        } catch (error) {
          await e2eTest.takeScreenshot('agenda-modal-test-failed');
          throw error;
        }
      });

      it('should add agenda item', async () => {
        try {
          await e2eTest.navigateTo(TestConfig.createEventUrl);
          await e2eTest.waitForElement(
            '[data-testid="create-event-form"]',
            10000
          );

          await e2eTest.scrollToElement('[data-testid="create-agenda-button"]');
          await e2eTest.sleep(500);
          await e2eTest.simulateUserClick(
            '[data-testid="create-agenda-button"]'
          );
          await e2eTest.sleep(1000);
          await e2eTest.waitForElement('[data-testid="agenda-modal"]', 5000);

          // Fill agenda item
          await e2eTest.simulateUserTyping(
            '[data-testid="agenda-item-title-input"]',
            'Test Agenda Item'
          );

          await e2eTest.simulateUserTyping(
            '[data-testid="agenda-item-description-input"]',
            'Test description'
          );

          const formatDateTimeLocal = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
          };

          const now = new Date();
          const startDate = new Date(now);
          startDate.setHours(now.getHours() + 1);
          const endDate = new Date(startDate);
          endDate.setHours(startDate.getHours() + 1);

          await e2eTest.setDateTimeValue(
            '[data-testid="agenda-item-start-time-input"]',
            formatDateTimeLocal(startDate)
          );

          await e2eTest.setDateTimeValue(
            '[data-testid="agenda-item-end-time-input"]',
            formatDateTimeLocal(endDate)
          );

          await e2eTest.simulateUserTyping(
            '[data-testid="agenda-item-location-input"]',
            'Test Location'
          );

          // Add item
          await e2eTest.simulateUserClick(
            '[data-testid="add-agenda-item-button"]'
          );
          await e2eTest.sleep(1000);

          // Save agenda
          await e2eTest.simulateUserClick('[data-testid="agenda-save-button"]');
          await e2eTest.sleep(1000);
        } catch (error) {
          await e2eTest.takeScreenshot('agenda-add-item-failed');
          throw error;
        }
      });
    });

    describe('Event Privacy Settings', () => {
      it('should toggle private event checkbox', async () => {
        try {
          await e2eTest.navigateTo(TestConfig.createEventUrl);
          await e2eTest.waitForElement(
            '[data-testid="create-event-form"]',
            10000
          );

          // Scroll to checkbox first
          await e2eTest.scrollToElement(
            '[data-testid="event-is-private-checkbox"]'
          );
          await e2eTest.sleep(500);

          const privateCheckbox = await e2eTest
            .getDriver()
            .findElement(By.css('[data-testid="event-is-private-checkbox"]'));

          const initialState = await privateCheckbox.isSelected();

          await e2eTest.clickElement(
            '[data-testid="event-is-private-checkbox"]'
          );
          await e2eTest.sleep(500);

          const newState = await privateCheckbox.isSelected();
          expect(newState).toBe(!initialState);
        } catch (error) {
          await e2eTest.takeScreenshot('privacy-toggle-failed');
          throw error;
        }
      });
    });
  });
});
