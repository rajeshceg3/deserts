from playwright.sync_api import sync_playwright

def test_no_flicker():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000/?headless=true")

        # Wait for the loader to disappear
        page.wait_for_selector(".loader-container", state="hidden", timeout=10000)

        # Wait a bit for the scene to render
        page.wait_for_timeout(2000)

        # Take a screenshot
        page.screenshot(path="verification/no_flicker.png")

        browser.close()

if __name__ == "__main__":
    test_no_flicker()
