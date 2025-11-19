import { test, expect } from '@playwright/test';

test('Validate premium calculation for Optima Secure', async ({ page }) => {
  const age = '28', pincode = '530008';

  // --- Locators ---
  const productOptimaSecure = page.locator('//span[text()="Optima Secure"]');
  const nextButton = page.getByRole('button', { name: 'Next' });
  const continueButton = page.getByRole('button', { name: 'Continue' });
  const selfOption = page.getByText('Self', { exact: true });
  const maleOption = page.getByText('Male').first();
  const nextStepButton = page.getByRole('button', { name: 'Next step' });
  const ageTextbox = page.getByRole('textbox', { name: 'Your age' });
  const pincodeTextbox = page.getByRole('textbox', { name: "Proposer's Pincode" });
  const calculatePremiumButton = page.getByRole('button', { name: 'Calculate Premium' });
  const calculatingPremiumBanner = page.getByText('Calculating Premium');

  const unlimitedRestoration = page.locator('//input[@name="Unlimited Restoration" and @type="checkbox"]').first();
  const optimaWellbeing = page.locator('//input[@name="Optima Well-being" and @type="checkbox"]').first();
  const abcdCheckbox = page.locator('//input[@name="ABCD" and @type="checkbox"]').first();

  const selfCheckbox = page.getByRole('checkbox', { name: `Self (M) (${age} Years)` });
  const confirmButton = page.getByRole('button', { name: 'Confirm' });

  const otherAddOnsButton = page.locator('button:has-text("Other Add-ons")').nth(1);
  const hospitalCashBenefit = page.locator('//input[@name="Hospital Cash Benefit" and @type="checkbox"]').nth(1);
  const limitlessCheckbox = page.locator('//input[@name="Limitless" and @type="checkbox"]').nth(1);

  const basePremiumLocator = page.locator('//*[text()="Base Premium"]/following-sibling::node()');
  const recommendedAddOnsLocator = page.locator('//*[text()="Recommended Add-ons"]/following-sibling::node()');
  const otherAddOnsLocator = page.locator('//*[text()="Other Add-ons"]/following-sibling::node()');
  const totalPremiumLocator = page.locator('//*[text()="Total Premium"]/following-sibling::node()');

  // --- Helpers ---
  const parseCurrency = async (locator) => {
    const text = await locator.textContent();
    return parseFloat(text?.replace(/[^0-9.-]+/g, '') || '0');
  };

  // helper: wait for premium API to return 200
  async function waitForPremiumApiResponse() {
    await page.waitForResponse(
      (resp) =>
        resp.url().includes('/health/v2/premium') &&
        resp.status() === 200,
      { timeout: 8000 }
    );
  }

  // --- Flow ---
  await page.goto('https://app.joinditto.in/fq');
  await productOptimaSecure.click();
  await page.waitForURL('https://app.joinditto.in/health/fq/optima-secure/policy');

  await nextButton.click();
  await nextButton.click();
  await nextButton.click();
  await continueButton.click();

  await selfOption.click();
  await maleOption.click();
  await nextStepButton.click();

  await ageTextbox.fill(age);
  await pincodeTextbox.fill(pincode);
  await calculatePremiumButton.click();
  await waitForPremiumApiResponse();
  await calculatingPremiumBanner.waitFor({ state: 'hidden' });

  await unlimitedRestoration.check();
  await waitForPremiumApiResponse();

  await optimaWellbeing.check();
  await waitForPremiumApiResponse();

  await abcdCheckbox.click();

  await selfCheckbox.check();
  await confirmButton.click();

  await otherAddOnsButton.click();

  await hospitalCashBenefit.check();
  await waitForPremiumApiResponse();

  await limitlessCheckbox.check();
  await waitForPremiumApiResponse();

  // --- Premium values ---
  const basePremium = await parseCurrency(basePremiumLocator);
  const recommendedAddOns = await parseCurrency(recommendedAddOnsLocator);
  const otherAddOns = await parseCurrency(otherAddOnsLocator);
  const totalPremium = await parseCurrency(totalPremiumLocator);

  const calculatedTotal = basePremium + recommendedAddOns + otherAddOns;

  console.log(`Base Premium: ${basePremium}`);
  console.log(`Recommended Add-ons: ${recommendedAddOns}`);
  console.log(`Other Add-ons: ${otherAddOns}`);
  console.log(`Total Premium (UI): ${totalPremium}`);
  console.log(`Calculated Total Premium: ${calculatedTotal}`);

  // --- Validation ---
  expect.soft(totalPremium, `Validate total premium. Actual: ${totalPremium}, Expected: ${calculatedTotal}`).toBe(calculatedTotal);
  expect.soft(totalPremium, `Validate total premium is greater than 0. Actual: ${totalPremium}`).toBeGreaterThan(0);
  expect.soft(basePremium, `Validate base premium is greater than 0. Actual: ${basePremium}`).toBeGreaterThan(0);
  expect.soft(recommendedAddOns, `Validate recommended add-ons are >= 0. Actual: ${recommendedAddOns}`).toBeGreaterThanOrEqual(0);
  expect.soft(otherAddOns, `Validate other add-ons are >= 0. Actual: ${otherAddOns}`).toBeGreaterThanOrEqual(0);


  console.log('Premium calculation validated successfully.');

  const screenshotPath = `screenshots/${Date.now()}_premium_calculation_full_page.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await test.info().attach('premium_calculation_full_page', {
    path: screenshotPath,
    contentType: 'image/png',
  });
  await page.close();
});