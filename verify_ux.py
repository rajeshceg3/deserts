from playwright.sync_api import sync_playwright
import sys
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use EGL to ensure WebGL works in headless
        context = browser.new_context(ignore_https_errors=True)
        page = context.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        print("Navigating to http://localhost:5173...")
        try:
            page.goto("http://localhost:5173", timeout=60000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            return

        print("Waiting for 'Headphones Recommended'...")
        try:
            # Wait for the loader text
            page.wait_for_selector("text=Headphones Recommended", timeout=30000)
            print("Found 'Headphones Recommended'.")

            # Check Grain Animation
            grain_overlay = page.locator(".noise-overlay").first
            # We need to wait for it to be attached
            grain_overlay.wait_for(state="attached")
            style = grain_overlay.evaluate("element => window.getComputedStyle(element).animationDuration")
            print(f"Grain Animation Duration: {style}")
            if style != "0.5s":
                 print(f"WARNING: Grain animation duration is {style}, expected 0.5s!")

        except Exception as e:
            print(f"Error waiting for loader: {e}")
            page.screenshot(path="loader_error.png")
            return

        # Take a screenshot of the loader
        page.screenshot(path="loader.png")
        print("Screenshot 'loader.png' taken.")

        print("Waiting for 'Enter Experience' button or 'Enter Anyway'...")
        try:
            # Wait for the button
            # It might be "Enter Experience" or "Enter Anyway"
            button = page.locator("button", has_text="Enter")
            button.wait_for(state="visible", timeout=30000)
            print(f"Found button: {button.inner_text()}")

            # Click it
            button.click()
            print("Clicked Enter button.")

            # Wait for overlay
            print("Waiting for 'Time of Day'...")
            page.wait_for_selector("text=Time of Day", timeout=30000)
            print("Found 'Time of Day'.")

            # Check Slider Gradient
            # Locate the track: div with h-0.5 rounded-full
            # It's hard to select by class, but let's try
            # Alternatively, find the input range's sibling or parent
            slider_track = page.locator("div.h-0\\.5.rounded-full")
            if slider_track.count() > 0:
                bg = slider_track.first.evaluate("element => window.getComputedStyle(element).backgroundImage")
                print(f"Slider Gradient: {bg}")
                if "linear-gradient" not in bg:
                     print("WARNING: Slider does not have linear-gradient!")
                else:
                     print("Slider gradient confirmed.")
            else:
                print("WARNING: Could not find slider track element.")

            time.sleep(2) # Wait for fade in
            page.screenshot(path="overlay.png")
            print("Screenshot 'overlay.png' taken.")

        except Exception as e:
            print(f"Error interacting with button or overlay: {e}")
            page.screenshot(path="error_state.png")

        browser.close()

if __name__ == "__main__":
    run()
