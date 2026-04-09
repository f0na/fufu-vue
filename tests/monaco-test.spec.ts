import { test, expect } from '@playwright/test';

test('Monaco editor navigation test', async ({ page }) => {
  // Navigate to home first
  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(1000);
  
  // Navigate to entry page
  await page.goto('http://localhost:5174/home');
  await page.waitForTimeout(1000);
  
  // Take screenshot of home page
  await page.screenshot({ path: 'screenshots/monaco-fix/01-home.png', fullPage: true });
  
  // Click on posts in navigation
  const postsLink = page.locator('text=文章').first();
  if (await postsLink.isVisible()) {
    await postsLink.click();
    await page.waitForTimeout(1000);
  }
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/monaco-fix/02-posts.png', fullPage: true });
  
  // Click on add button
  const addBtn = page.locator('text=添加').first();
  if (await addBtn.isVisible()) {
    await addBtn.click();
    await page.waitForTimeout(2000);
  }
  
  // Take screenshot of editor
  await page.screenshot({ path: 'screenshots/monaco-fix/03-editor-first.png', fullPage: true });
  
  // Navigate to archive page
  await page.goto('http://localhost:5174/home/archive');
  await page.waitForTimeout(1000);
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/monaco-fix/04-archive.png', fullPage: true });
  
  // Navigate back to a post
  const postLink = page.locator('a[href*="/home/posts/"]').first();
  if (await postLink.isVisible()) {
    await postLink.click();
    await page.waitForTimeout(1000);
  }
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/monaco-fix/05-post.png', fullPage: true });
  
  // Navigate to add page again
  const addBtn2 = page.locator('text=添加').first();
  if (await addBtn2.isVisible()) {
    await addBtn2.click();
    await page.waitForTimeout(2000);
  }
  
  // Take screenshot of editor second time
  await page.screenshot({ path: 'screenshots/monaco-fix/06-editor-second.png', fullPage: true });
  
  // Check if Monaco editor is visible and has line numbers
  const monacoEditor = page.locator('.monaco-editor');
  const isVisible = await monacoEditor.isVisible();
  console.log('Monaco editor visible:', isVisible);
  
  const lineNumbers = page.locator('.monaco-editor .line-numbers');
  const hasLineNumbers = await lineNumbers.count() > 0;
  console.log('Has line numbers:', hasLineNumbers);
  
  // Try typing in the editor
  const textarea = page.locator('.monaco-editor textarea');
  if (await textarea.isVisible()) {
    await textarea.click();
    await textarea.fill('Test content');
    await page.waitForTimeout(500);
  }
  
  // Take final screenshot
  await page.screenshot({ path: 'screenshots/monaco-fix/07-final.png', fullPage: true });
});
