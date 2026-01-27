from playwright.sync_api import sync_playwright
import sys

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        print("Navigating to http://localhost:5173...")
        page.goto("http://localhost:5173", timeout=60000)

        print("Waiting for 'Headphones Recommended'...")
        try:
            # Wait for the loader text
            page.wait_for_selector("text=Headphones Recommended", timeout=15000)
            print("Found 'Headphones Recommended'.")
        except Exception as e:
            print(f"Error waiting for text: {e}")
            page.screenshot(path="loader_error.png")

        # Take a screenshot of the loader
        page.screenshot(path="loader.png")
        print("Screenshot 'loader.png' taken.")

        print("Waiting for 'Enter Experience' button...")
        try:
            # Wait for the button
            button = page.locator("button", has_text="Enter Experience")
            button.wait_for(state="visible", timeout=15000)
            print("Found 'Enter Experience' button.")

            # Click it
            button.click()
            print("Clicked 'Enter Experience'.")

            # Wait for overlay
            # The text "01 / 05" doesn't exist because the slash is a div line.
            # Look for "Time of Day" or "Zen Mode"
            print("Waiting for 'Time of Day'...")
            page.wait_for_selector("text=Time of Day", timeout=15000)
            print("Found 'Time of Day'.")

            page.screenshot(path="overlay.png")
            print("Screenshot 'overlay.png' taken.")

        except Exception as e:
            print(f"Error interacting with button or overlay: {e}")
            page.screenshot(path="error_state.png")

        browser.close()

if __name__ == "__main__":
    run()
