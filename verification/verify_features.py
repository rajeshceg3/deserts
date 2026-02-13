from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        # Use EGL to ensure WebGL works in headless and is performant enough
        browser = p.chromium.launch(headless=True, args=["--use-gl=egl", "--enable-unsafe-swiftshader"])
        context = browser.new_context(ignore_https_errors=True)
        page = context.new_page()

        print("Navigating to http://localhost:5173?headless=true...")
        try:
            page.goto("http://localhost:5173?headless=true", timeout=60000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            return

        print("Waiting for 'Enter Experience' button...")
        try:
            button = page.locator("button", has_text="Enter").first
            button.click(force=True, timeout=60000)
            print("Clicked Enter button.")

            # Wait for overlay
            page.wait_for_selector("text=Time of Day", timeout=30000)
        except Exception as e:
            print(f"Error entering experience: {e}")
            return

        # 1. Check Document Title
        title = page.title()
        print(f"Page Title: {title}")
        if "Ethereal Dunes" in title:
            print("SUCCESS: Document title updated correctly.")
        else:
            print(f"WARNING: Unexpected title: {title}")

        # 2. Check Journal for Wisdom
        print("Checking Journal...")
        try:
            # Click Journal button (it has an SVG, but aria-label="Open Journal")
            page.click('button[aria-label="Open Journal"]')
            page.wait_for_selector("text=Ancient Wisdom", timeout=5000)

            # Get the wisdom text
            wisdom = page.locator("p.text-black\\/70").inner_text()
            print(f"Found Wisdom: {wisdom}")

            page.screenshot(path="verification/journal_wisdom.png")
            print("Screenshot 'journal_wisdom.png' taken.")

            # Close Journal
            page.click('button[aria-label="Close Journal"]')
            time.sleep(1)
        except Exception as e:
            print(f"Error checking Journal: {e}")

        # 3. Check Breathing Guide
        print("Checking Breathing Guide...")
        try:
            # Find "Breathe" button
            # It's a magnetic button with text "Breathe" inside a hidden span, or look for aria-label
            breathe_btn = page.locator('button[aria-label="Start Breathing Exercise"]')
            if breathe_btn.count() > 0:
                print("Found Breathe button.")
                breathe_btn.click()
                time.sleep(2) # Wait for fade in

                # Check for "Inhale", "Hold", or "Exhale" text
                guide_text = page.locator("div.h-8").inner_text()
                print(f"Breathing Guide Text: {guide_text}")

                page.screenshot(path="verification/breathing_guide.png")
                print("Screenshot 'breathing_guide.png' taken.")

                # Toggle off
                page.click('button[aria-label="Stop Breathing Exercise"]')
            else:
                print("WARNING: Breathe button not found.")
        except Exception as e:
            print(f"Error checking Breathing Guide: {e}")

        browser.close()

if __name__ == "__main__":
    run()
