import { chromium, Page, BrowserContext, ElementHandle } from "playwright";
import * as readline from 'readline';

// Simple stagehand interface to match the signature
interface Stagehand {}


function ringBellFor(durationSeconds: number) {
  const interval = 200; // ms
  const totalBeeps = Math.floor((durationSeconds * 1000) / interval);

  let i = 0;
  const bellInterval = setInterval(() => {
    process.stdout.write('\x07'); 
    i++;
    if (i >= totalBeeps) {
      clearInterval(bellInterval);
    }
  }, interval);
}

function ringBell() {
  // process.stdout.write('\x07');
  ringBellFor(2);
  console.log("🔔 ALERT: Special condition detected!");
}

// Function to wait for user input
async function waitForUserInput(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Press Enter to continue...', () => {
      rl.close();
      resolve();
    });
  });
}

// Function to count labels in the gallery
async function countLabels(page: Page): Promise<{ bicycles: number, others: number }> {
  try {
    const labelCounts = await page.evaluate(() => {
      // Find all label spans in the gallery
      const labelSpans = document.querySelectorAll('#gallery-view span[data-tour="box-label"] span');
      
      let bicycles = 0;
      let others = 0;
      
      labelSpans.forEach(span => {
        const labelText = span.textContent?.trim().toLowerCase();
        if (labelText === 'bicycle') {
          bicycles++;
        } else if (labelText === 'others' || labelText === 'van') {
          others++;
        }
      });
      
      return { bicycles, others };
    });
    
    // console.log(`📊 Label counts - Bicycles: ${labelCounts.bicycles}, Others: ${labelCounts.others}`);
    return labelCounts;
  } catch (err) {
    console.warn("⚠️ Failed to count labels:", err);
    return { bicycles: 0, others: 0 };
  }
}

async function replaceLabels(page: Page, searchLabel: string, replaceWithLabel: string) {
  console.log(`🔄 Looking for any ‘${searchLabel}’ labels to replace with ‘${replaceWithLabel}’…`);

  const labelLocator = () => page.locator(
    '#gallery-view span[data-tour="box-label"] span',
    { hasText: searchLabel }
  );

  const initialCount = await labelLocator().count();
  console.log(`📊 Found ${initialCount} ‘${searchLabel}’ label(s).`);

  while (true) {
    const label = labelLocator().first();
    const count = await label.count();

    if (count === 0) {
      console.log(`✅ No more ‘${searchLabel}’ labels found.`);
      break;
    }

    console.log(`🔍 Clicking the first “${searchLabel}” label…`);
    await label.click();

    const dropdown = page.locator(
      'div[style*="position: absolute"][style*="z-index: 1000"]'
    ).first();

    try {
      await dropdown.waitFor({ state: 'visible', timeout: 3000 });

      const option = dropdown.locator(`div:has-text("${replaceWithLabel}")`);
      await option.click();

      console.log(`✅ Replaced with “${replaceWithLabel}”`);
    } catch (error) {
      console.warn(`⚠️ Could not find replacement option “${replaceWithLabel}” in dropdown.`);
      break;
    }
  }

  console.log(`✅ All ‘${searchLabel}’ labels (if any) have been switched to “${replaceWithLabel}.”`);
}

async function performAnnotationFlow(page: Page) {
  // Step 1: Click Gallery View - Using the successful selector from the logs
  try {
    console.log("🖼️ Clicking on the gallery view...");
    
    // Use the successful selector directly
    const galleryViewSelector = 'summary:has(span:has-text("Gallery View"))';
    await page.click(galleryViewSelector);
    console.log(`✅ Clicked gallery view using selector: ${galleryViewSelector}`);
    
    // Brief wait for UI update
    await page.waitForTimeout(3000); // Reduced from 30 seconds
  } catch (err) {
    console.warn("⚠️ Failed to click gallery view:", err);
    
    // Fallback approach
    try {
      await page.evaluate(() => {
        const details = document.querySelector('details[data-tour="gallery-view"]');
        if (details) {
          details.setAttribute('open', '');
          return true;
        }
        return false;
      });
      console.log("🔍 Attempted to force open the gallery view via JavaScript");
      await page.waitForTimeout(300);
    } catch (fallbackErr) {
      console.error("❌ Failed to force open gallery:", fallbackErr);
    }
  }

  // Step 1.5: replace some obviously wrong labels 
  await replaceLabels(page, "Bicycle", "2-Wheeler");
  await replaceLabels(page, "Others", "Auto");
  await replaceLabels(page, "Van", "MUV");

  // Step 2: Count labels and check for special condition
  // ring bell if something left
  const labelCounts = await countLabels(page);
  
  if (labelCounts.bicycles > 0 || labelCounts.others > 0) {
    ringBell();
    await waitForUserInput();
  }

  // Step 3: Count total confirmation boxes first
  console.log("🔢 Counting total confirmation boxes...");
  const initialTicks = await page.$$('button[title="Confirm"]');
  const totalBoxes = initialTicks ? initialTicks.length : 0;
  console.log(`📊 Total confirmation boxes found: ${totalBoxes}`);

  // Step 4: Keep clicking green ticks until none left
  console.log("🎯 Looking for confirmation ticks...");
  let ticksClicked = 0;
  
  while (true) {
    // Find all confirmation tick buttons
    const ticks = await page.$$('button[title="Confirm"]');
    
    if (!ticks || ticks.length === 0) {
      console.log("✅ No more ticks left!");
      break;
    }

    console.log(`🔍 Found ${ticks.length} ticks to click`);
    
    for (const tick of ticks) {
      try {
        const isVisible = await tick.isVisible();
        if (isVisible) {
          await tick.click();
          ticksClicked++;
          await page.waitForTimeout(500); // slight delay
        }
      } catch (err) {
        console.warn("⚠️ Failed to click tick:", err);
      }
    }
  }
  
  console.log(`✅ Total ticks clicked: ${ticksClicked}`);

  // Step 5: Dynamic wait before submitting based on number of boxes
  // const waitTime = Math.max(totalBoxes, 1); // At least 1 second, or number of boxes
  let waitTime = Math.max(totalBoxes, 1); // At least 1 second, or number of boxes

  waitTime *= 1.5;
  
  console.log(`⏳ Waiting ${waitTime} seconds before clicking submit (based on ${totalBoxes} boxes)...`);
  await page.waitForTimeout(waitTime * 1000);

  // Step 6: Click submit
  try {
    console.log("🔍 Looking for submit button...");
    // Try multiple possible submit button selectors
    const submitSelectors = [
      'button:has-text("Submit for Next Image")'
    ];
    
    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        const submitButton = await page.$(selector);
        if (submitButton && await submitButton.isVisible()) {
          await submitButton.click();
          console.log(`📤 Submitted using selector: ${selector}`);
          submitted = true;
          break;
        }
      } catch (err) {
        // Try next selector
      }
    }
    
    if (!submitted) {
      console.warn("⚠️ Submit button not found");
    }
  } catch (err) {
    console.warn("⚠️ Failed to find/submit:", err);
  }
  
  // Step 7: Check for and click the "Continue" button if it appears in level-up popup
  try {
    console.log("🔍 Checking for level-up popup with Continue button...");
    
    // Wait a moment for any popup to appear after submission
    await page.waitForTimeout(2000);
    
    // Try multiple selectors for the Continue button based on the HTML structure provided
    const continueSelectors = [
      // Direct match for the button in the provided HTML
      'button:has-text("Continue")'
    ];
    
    let continueBtnClicked = false;
    for (const selector of continueSelectors) {
      try {
        // Check if the continue button exists with a short timeout
        const continueBtn = await page.waitForSelector(selector, { timeout: 1000 });
        
        if (continueBtn && await continueBtn.isVisible()) {
          await continueBtn.click();
          console.log(`✅ Clicked continue button using selector: ${selector}`);
          continueBtnClicked = true;
          // Wait briefly after clicking continue
          await page.waitForTimeout(1000);
          break;
        }
      } catch (err) {
        // Continue to next selector if this one doesn't find the button
      }
    }
    
    if (!continueBtnClicked) {
      console.log("ℹ️ No level-up popup detected or Continue button not found");
    }
  } catch (err) {
    console.warn("⚠️ Error handling Continue button:", err);
  }
}

async function main() {
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 // Increased slow down for more stability
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Initial navigation
  await page.goto("https://hack.airawat-mobility.in/login");

  // Manual login wait
  console.log("🛑 Waiting 40 seconds so you can log in manually...");
  await page.waitForTimeout(40_000);

  // Infinite loop to keep doing your thing
  try {
    while (true) {
      console.log("🔁 Starting annotation flow...");
      await performAnnotationFlow(page);

      // Small pause between rounds
      console.log("🔄 New image/page should be loaded. Waiting 2 seconds before restarting...");
      await page.waitForTimeout(2_000);
    }
  } catch (error) {
    console.error("❌ Error in main loop:", error);
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
