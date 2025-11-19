# Automated Test Suite – Premium Calculation Validation

This project contains Playwright automation scripts to validate premium calculations for Ditto Insurance products.

## Steps to Run and View the Report

1. **Run the tests**
   - Open a terminal in the project directory.
   - Execute the command:
     ```bash
     npx playwright test
     ```

2. **View the report**
   - Once the test run is completed, Playwright generates an HTML report.
   - Open the following file in your browser:
     ```
     playwright-report/index.html
     ```

   > Note: The report folder is created automatically after the test run. You can also run:
   > ```bash
   > npx playwright show-report
   > ```
   > to open the report directly.

---

## Project Structure

- `tests/` → Contains test scripts.
- `playwright.config.ts` → Playwright configuration (reporters, screenshots, etc.).
- `playwright-report/` → Generated HTML report after test execution.

---

## Requirements

- Node.js (>=16)
- Playwright installed:
  ```bash
  npm install @playwright/test
  npx playwright install