// import { chromium, Page, BrowserContext } from "playwright";

// // Counter to track submissions
// let submissionCounter = 0;

// async function performAnnotationFlow(page: Page) {
//   // Step 1: Click Gallery View - Using the successful selector from the logs
//   try {
//     console.log("🖼️ Clicking on the gallery view...");
    
//     // Use the successful selector directly
//     const galleryViewSelector = 'summary:has(span:has-text("Gallery View"))';
//     await page.click(galleryViewSelector);
//     console.log(`✅ Clicked gallery view using selector: ${galleryViewSelector}`);
    
//     // Brief wait for UI update
//     await page.waitForTimeout(300);
//   } catch (err) {
//     console.warn("⚠️ Failed to click gallery view:", err);
    
//     // Fallback approach
//     try {
//       await page.evaluate(() => {
//         const details = document.querySelector('details[data-tour="gallery-view"]');
//         if (details) {
//           details.setAttribute('open', '');
//           return true;
//         }
//         return false;
//       });
//       console.log("🔍 Attempted to force open the gallery view via JavaScript");
//       await page.waitForTimeout(300);
//     } catch (fallbackErr) {
//       console.error("❌ Failed to force open gallery:", fallbackErr);
//     }
//   }

//   // Step 2: Click all confirmation ticks efficiently
//   console.log("🎯 Looking for confirmation ticks...");
//   let tickCount = 0;
//   try {
//     // Use a more efficient approach - click all ticks at once
//     tickCount = await page.evaluate(() => {
//       const ticks = Array.from(document.querySelectorAll('button[title="Confirm"]'));
//       let count = 0;
      
//       for (const tick of ticks) {
//         if (tick instanceof HTMLElement && tick.offsetParent !== null) {
//           // Check if element is visible
//           tick.click();
//           count++;
//         }
//       }
//       return count;
//     });
    
//     console.log(`✅ Total ticks clicked: ${tickCount}`);
//   } catch (err) {
//     console.warn("⚠️ Failed to click ticks:", err);
    
//     // Fall back to original approach if the optimized approach fails
//     let ticksClicked = 0;
//     const ticks = await page.$$('button[title="Confirm"]');
    
//     for (const tick of ticks) {
//       try {
//         const isVisible = await tick.isVisible();
//         if (isVisible) {
//           await tick.click();
//           ticksClicked++;
//         }
//       } catch (tickErr) {
//         // Continue to next tick
//       }
//     }
    
//     console.log(`✅ Fallback method: ${ticksClicked} ticks clicked`);
//     tickCount = ticksClicked;
//   }

//   // Step 3: Calculate and apply dynamic delay based on tick count

//   // LOGIC 1
//   // let delayMinutes = 1; // Default delay
//   // if (tickCount < 5) {
//   //   delayMinutes = 1;
//   // } else if (tickCount < 10) {
//   //   delayMinutes = 1.5;
//   // } else if (tickCount < 20) {
//   //   delayMinutes = 2;
//   // } else {
//   //   delayMinutes = 3;
//   // }
  
//   // LOGIC 2
//   let delayMs = (tickCount * 7 * 1000) + 1000;
//   if(delayMs > 5*60*1000){
//     delayMs = 5*60*1000;
//   }
//   console.log(`⏳ Waiting for ${2} minutes`);
//   await page.waitForTimeout(2*60*1000);

//   // Step 4: Click submit button - Using the successful selector from logs
//   try {
//     console.log("🔍 Looking for submit button...");
//     const submitSelector = 'button:has-text("Submit for Next Image")';
    
//     await page.click(submitSelector);
//     console.log(`📤 Submitted using selector: ${submitSelector}`);
    
//     // Increment submission counter
//     submissionCounter++;
//     console.log(`📊 Submission count: ${submissionCounter}`);
//   } catch (err) {
//     console.warn("⚠️ Failed with primary submit selector:", err);
    
//     // Fall back to trying multiple selectors if primary fails
//     const submitSelectors = [
//       'button:has-text("Submit")',
//       '[role="button"]:has-text("Submit")',
//       'button.submit-button',
//       'button[type="submit"]',
//       'button:has-text("Next")'
//     ];
    
//     let submitted = false;
//     for (const selector of submitSelectors) {
//       try {
//         await page.click(selector);
//         console.log(`📤 Submitted using fallback selector: ${selector}`);
//         submitted = true;
        
//         // Increment submission counter
//         submissionCounter++;
//         console.log(`📊 Submission count: ${submissionCounter}`);
//         break;
//       } catch (selectorErr) {
//         // Try next selector
//       }
//     }
    
//     if (!submitted) {
//       console.warn("⚠️ Submit button not found with any selector");
//     }
//   }
  
//   // Check for level-up popup - Now using a more direct approach
//   try {
//     // Check for level-up popup (occurs every 15 submissions)
//     if (submissionCounter % 15 === 0 && submissionCounter > 0) {
//       console.log(`🎮 Level-up expected after ${submissionCounter} submissions!`);
      
//       // Wait for level-up popup with continue button
//       try {
//         console.log("🔍 Looking for Continue button on level-up popup...");
//         // Use the successful selector from logs
//         const continueSelector = 'button:has-text("Continue")';
        
//         // Use waitForSelector with visibility check and timeout
//         await page.waitForSelector(continueSelector, { 
//           state: 'visible',
//           timeout: 5000 
//         });
        
//         await page.click(continueSelector);
//         console.log("✅ Clicked Continue button on level-up popup");
        
//         // Brief wait after continuing
//         await page.waitForTimeout(1000);
//       } catch (err) {
//         console.warn("⚠️ Continue button not found on expected level-up:", err);
//       }
//     } else {
//       // Quick check for unexpected popup
//       try {
//         const hasPopup = await page.isVisible('button:has-text("Continue")', { timeout: 1000 });
//         if (hasPopup) {
//           await page.click('button:has-text("Continue")');
//           console.log("⚠️ Clicked Continue on unexpected popup!");
//           await page.waitForTimeout(500);
//         }
//       } catch {
//         // No popup found, which is expected
//       }
//     }
//   } catch (err) {
//     console.warn("⚠️ Error handling level-up popup:", err);
//   }
// }

// async function main() {
//   // Launch browser
//   const browser = await chromium.launch({ 
//     headless: false,
//     slowMo: 50 // Reduced slowMo from 100 to 50
//   });
  
//   const context = await browser.newContext();
//   const page = await context.newPage();

//   // Initial navigation
//   await page.goto("https://hack.airawat-mobility.in");

//   // Manual login wait
//   console.log("🛑 Waiting 40 seconds so you can log in manually...");
//   await page.waitForTimeout(40_000); 

//   // Infinite loop to keep doing your thing
//   try {
//     while (true) {
//       console.log("🔁 Starting annotation flow...");
//       await performAnnotationFlow(page);

//       // Shorter pause between rounds
//       console.log("🔄 New image/page should be loaded. Waiting 2 seconds before restarting...");
//       await page.waitForTimeout(2_000); 
//     }
//   } catch (error) {
//     console.error("❌ Error in main loop:", error);
//   } finally {
//     await browser.close();
//   }
// }

// main().catch(error => {
//   console.error("💥 Fatal error:", error);
//   process.exit(1);
// });

import { chromium, Page, BrowserContext } from "playwright";

// Simple stagehand interface to match the signature
interface Stagehand {}

async function performAnnotationFlow(page: Page) {
  // Step 1: Click Gallery View - Updated with selectors that match the HTML structure
  try {
    console.log("🖼️ Clicking on the gallery view...");
    
    // Based on the HTML structure you shared, we need to target the summary element within the details tag
    const galleryViewSelectors = [
      // Target the summary element specifically which contains the Gallery View text
      'summary:has(span:has-text("Gallery View"))',
      // Try the details element that has data-tour="gallery-view"
      'details[data-tour="gallery-view"] summary',
      // The span containing the text inside the summary
      'summary span:has-text("Gallery View")',
      // Try with the SVG sibling
      'summary span:has(svg + text("Gallery View"))',
      // Try with a more generic approach
      'details[open] summary',
      // Last resort approaches
      'summary',
      // XPath as fallback
      '//summary[contains(., "Gallery View")]'
    ];
    
    let clicked = false;
    for (const selector of galleryViewSelectors) {
      try {
        // Check if element exists and is visible
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          await element.click();
          console.log(`✅ Clicked gallery view using selector: ${selector}`);
          clicked = true;
          // Wait briefly for any UI changes after clicking
          await page.waitForTimeout(800);
          break;
        }
      } catch (err) {
        // Continue to next selector
      }
    }
    
    if (!clicked) {
      // If no specific selector worked, try a direct approach with the entire structure
      try {
        // Try to force open the details element by setting the 'open' attribute
        await page.evaluate(() => {
          const details = document.querySelector('details[data-tour="gallery-view"]');
          if (details) {
            details.setAttribute('open', '');
            return true;
          }
          return false;
        });
        console.log("🔍 Attempted to force open the gallery view via JavaScript");
        // Give it time to render
        await page.waitForTimeout(1000);
      } catch (err) {
        console.error("❌ Failed to force open gallery:", err);
      }
    }
  } catch (err) {
    console.warn("⚠️ Failed to click gallery view:", err);
  }

  // Step 2: Keep clicking green ticks until none left
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
          await page.waitForTimeout(100); // slight delay
        }
      } catch (err) {
        console.warn("⚠️ Failed to click tick:", err);
      }
    }
  }
  
  console.log(`✅ Total ticks clicked: ${ticksClicked}`);

  // Step 3: Wait before submitting
  console.log("⏳ Waiting 2 minute before clicking submit...");
  await page.waitForTimeout(2* 60 * 1000);

  // Step 4: Click submit
  try {
    console.log("🔍 Looking for submit button...");
    // Try multiple possible submit button selectors
    const submitSelectors = [
      'button:has-text("Submit for Next Image")',
      'button:has-text("Submit")',
      '[role="button"]:has-text("Submit")',
      ':text("Submit for Next Image")',
      // More general approaches
      'button.submit-button',
      'button[type="submit"]',
      // Try navigation-like buttons
      'button:has-text("Next")',
      'button.next-button'
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
  
  // NEW STEP: Check for and click the "Continue" button if it appears in level-up popup
  try {
    console.log("🔍 Checking for level-up popup with Continue button...");
    
    // Wait a moment for any popup to appear after submission
    await page.waitForTimeout(2000);
    
    // Try multiple selectors for the Continue button based on the HTML structure provided
    const continueSelectors = [
      // Direct match for the button in the provided HTML
      'button:has-text("Continue")',
      // More specific targeting based on the provided HTML
      '.p-6 .flex-1 button:has-text("Continue")',
      // Target using parent elements
      'div:has-text("Level Up!") button:has-text("Continue")',
      'div:has-text("Total Score") button:has-text("Continue")',
      // Even more specific from the HTML structure
      'div.p-6 div.flex div.flex-1 div.flex button.bg-blue-600:has-text("Continue")',
      // Using the blue background color as a hint
      'button.bg-blue-600:has-text("Continue")',
      'button.hover\\:bg-blue-700:has-text("Continue")',
      // Generic approach for any Continue button
      ':text("Continue")'
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
  await page.goto("https://hack.airawat-mobility.in");

  // Manual login wait
  console.log("🛑 Waiting 40 seconds so you can log in manually...");
  await page.waitForTimeout(40_000);

  // Infinite loop to keep doing your thing
  try {
    while (true) {
      console.log("🔁 Starting annotation flow...");
      await performAnnotationFlow(page);

      // Small pause between rounds
      console.log("🔄 New image/page should be loaded. Waiting 5 seconds before restarting...");
      await page.waitForTimeout(5_000);
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

// import { chromium, Page, BrowserContext } from "playwright";

// // Simple stagehand interface to match the signature
// interface Stagehand {}

// // Counter to track submissions
// let submissionCounter = 0;

// async function performAnnotationFlow(page: Page) {
//   // Step 1: Click Gallery View - Updated with selectors that match the HTML structure
//   try {
//     console.log("🖼️ Clicking on the gallery view...");
    
//     // Based on the HTML structure you shared, we need to target the summary element within the details tag
//     const galleryViewSelectors = [
//       // Target the summary element specifically which contains the Gallery View text
//       'summary:has(span:has-text("Gallery View"))',
//       // Try the details element that has data-tour="gallery-view"
//       'details[data-tour="gallery-view"] summary',
//       // The span containing the text inside the summary
//       'summary span:has-text("Gallery View")',
//       // Try with the SVG sibling
//       'summary span:has(svg + text("Gallery View"))',
//       // Try with a more generic approach
//       'details[open] summary',
//       // Last resort approaches
//       'summary',
//       // XPath as fallback
//       '//summary[contains(., "Gallery View")]'
//     ];
    
//     let clicked = false;
//     for (const selector of galleryViewSelectors) {
//       try {
//         // Check if element exists and is visible
//         const element = await page.$(selector);
//         if (element && await element.isVisible()) {
//           await element.click();
//           console.log(`✅ Clicked gallery view using selector: ${selector}`);
//           clicked = true;
//           // Wait briefly for any UI changes after clicking
//           await page.waitForTimeout(800);
//           break;
//         }
//       } catch (err) {
//         // Continue to next selector
//       }
//     }
    
//     if (!clicked) {
//       // If no specific selector worked, try a direct approach with the entire structure
//       try {
//         // Try to force open the details element by setting the 'open' attribute
//         await page.evaluate(() => {
//           const details = document.querySelector('details[data-tour="gallery-view"]');
//           if (details) {
//             details.setAttribute('open', '');
//             return true;
//           }
//           return false;
//         });
//         console.log("🔍 Attempted to force open the gallery view via JavaScript");
//         // Give it time to render
//         await page.waitForTimeout(1000);
//       } catch (err) {
//         console.error("❌ Failed to force open gallery:", err);
//       }
//     }
//   } catch (err) {
//     console.warn("⚠️ Failed to click gallery view:", err);
//   }

//   // Step 2: Keep clicking green ticks until none left
//   console.log("🎯 Looking for confirmation ticks...");
//   let ticksClicked = 0;
  
//   while (true) {
//     // Find all confirmation tick buttons
//     const ticks = await page.$('button[title="Confirm"]');
    
//     if (!ticks || ticks.length === 0) {
//       console.log("✅ No more ticks left!");
//       break;
//     }

//     console.log(`🔍 Found ${ticks.length} ticks to click`);
    
//     for (const tick of ticks) {
//       try {
//         const isVisible = await tick.isVisible();
//         if (isVisible) {
//           await tick.click();
//           ticksClicked++;
//           await page.waitForTimeout(50); // slight delay
//         }
//       } catch (err) {
//         console.warn("⚠️ Failed to click tick:", err);
//       }
//     }
//   }
  
//   console.log(`✅ Total ticks clicked: ${ticksClicked}`);

//   // Step 3: Wait before submitting
//   console.log("⏳ Waiting 2 minute before clicking submit...");
//   await page.waitForTimeout(2* 60 * 1000);

//   // Step 4: Click submit
//   try {
//     console.log("🔍 Looking for submit button...");
//     // Try multiple possible submit button selectors
//     const submitSelectors = [
//       'button:has-text("Submit for Next Image")',
//       'button:has-text("Submit")',
//       '[role="button"]:has-text("Submit")',
//       ':text("Submit for Next Image")',
//       // More general approaches
//       'button.submit-button',
//       'button[type="submit"]',
//       // Try navigation-like buttons
//       'button:has-text("Next")',
//       'button.next-button'
//     ];
    
//     let submitted = false;
//     for (const selector of submitSelectors) {
//       try {
//         const submitButton = await page.$(selector);
//         if (submitButton && await submitButton.isVisible()) {
//           await submitButton.click();
//           console.log(`📤 Submitted using selector: ${selector}`);
//           submitted = true;
          
//           // Increment submission counter after successful submission
//           submissionCounter++;
//           console.log(`📊 Submission count: ${submissionCounter}`);
//           break;
//         }
//       } catch (err) {
//         // Try next selector
//       }
//     }
    
//     if (!submitted) {
//       console.warn("⚠️ Submit button not found");
//     }
//   } catch (err) {
//     console.warn("⚠️ Failed to find/submit:", err);
//   }
  
//   // Check if this is the 15th submission or a multiple of 15
//   const isLevelUpExpected = submissionCounter % 15 === 0 && submissionCounter > 0;
  
//   // Handle the "Continue" button after level-up popup
//   try {
//     // If we expect a level-up popup based on submission count
//     if (isLevelUpExpected) {
//       console.log(`🎮 Level-up expected after ${submissionCounter} submissions!`);
//       console.log("🔍 Looking for Level Up popup with Continue button...");
      
//       // Wait a bit longer for the level-up popup as it's expected
//       await page.waitForTimeout(3000);
      
//       // Try multiple selectors for the Continue button based on the HTML structure provided
//       const continueSelectors = [
//         // Direct match for the button in the provided HTML
//         'button:has-text("Continue")',
//         // More specific targeting based on the provided HTML
//         '.p-6 .flex-1 button:has-text("Continue")',
//         // Target using parent elements
//         'div:has-text("Level Up!") button:has-text("Continue")',
//         'div:has-text("Total Score") button:has-text("Continue")',
//         // Even more specific from the HTML structure
//         'div.p-6 div.flex div.flex-1 div.flex button.bg-blue-600:has-text("Continue")',
//         // Using the blue background color as a hint
//         'button.bg-blue-600:has-text("Continue")',
//         'button.hover\\:bg-blue-700:has-text("Continue")',
//         // Generic approach for any Continue button
//         ':text("Continue")'
//       ];
      
//       // Try to find and click the Continue button with increased timeout
//       let continueBtnClicked = false;
//       for (const selector of continueSelectors) {
//         try {
//           // Use a longer timeout when we expect the popup
//           const continueBtn = await page.waitForSelector(selector, { timeout: 5000 });
          
//           if (continueBtn && await continueBtn.isVisible()) {
//             await continueBtn.click();
//             console.log(`✅ Clicked continue button using selector: ${selector}`);
//             continueBtnClicked = true;
//             // Wait a bit longer after clicking continue on level-up
//             await page.waitForTimeout(2000);
//             break;
//           }
//         } catch (err) {
//           // Continue to next selector if this one doesn't find the button
//         }
//       }
      
//       if (!continueBtnClicked) {
//         console.warn("⚠️ Expected level-up popup, but Continue button not found!");
        
//         // As a fallback, also check for any popup in general
//         try {
//           const anyPopup = await page.$('div:has-text("Level Up!")');
//           if (anyPopup) {
//             console.log("🔍 Level-up popup found but couldn't click Continue button");
            
//             // Try to close it using JavaScript as a last resort
//             await page.evaluate(() => {
//               const closeButton = Array.from(document.querySelectorAll('button')).find(
//                 button => button.textContent?.includes('Continue')
//               );
//               if (closeButton) {
//                 closeButton.click();
//                 return true;
//               }
//               return false;
//             });
//             await page.waitForTimeout(1000);
//           }
//         } catch (err) {
//           // Continue if this also fails
//         }
//       }
//     } else {
//       // Quick check for unexpected popup with shorter timeout
//       try {
//         console.log("🔍 Quick check for any unexpected popup...");
//         const unexpectedPopup = await page.waitForSelector('button:has-text("Continue")', { timeout: 1000 });
//         if (unexpectedPopup && await unexpectedPopup.isVisible()) {
//           await unexpectedPopup.click();
//           console.log("⚠️ Clicked Continue on unexpected popup!");
//           await page.waitForTimeout(1000);
//         }
//       } catch (err) {
//         // No popup found, which is expected
//         console.log("✅ No popup detected as expected");
//       }
//     }
//   } catch (err) {
//     console.warn("⚠️ Error handling Continue button:", err);
//   }
// }

// async function main() {
//   // Launch browser
//   const browser = await chromium.launch({ 
//     headless: false,
//     slowMo: 100 // Increased slow down for more stability
//   });
//   const context = await browser.newContext();
//   const page = await context.newPage();

//   // Initial navigation
//   await page.goto("https://hack.airawat-mobility.in/game");

//   // Manual login wait
//   console.log("🛑 Waiting 40 seconds so you can log in manually...");
//   await page.waitForTimeout(40_000);

//   // Infinite loop to keep doing your thing
//   try {
//     while (true) {
//       console.log("🔁 Starting annotation flow...");
//       await performAnnotationFlow(page);

//       // Small pause between rounds
//       console.log("🔄 New image/page should be loaded. Waiting 5 seconds before restarting...");
//       await page.waitForTimeout(5_000);
//     }
//   } catch (error) {
//     console.error("❌ Error in main loop:", error);
//   } finally {
//     await browser.close();
//   }
// }

// main().catch(error => {
//   console.error("💥 Fatal error:", error);
//   process.exit(1);
// });