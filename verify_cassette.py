from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:3000/hi-fi-cassette-physics/")

        # Wait for the cassette to be visible
        # I'll wait for the "TAP TO EDIT" text or something distinctive
        page.wait_for_selector("text=TAP TO EDIT", timeout=10000)

        # Take a screenshot of the whole page
        page.screenshot(path="verification.png")
        print("Screenshot taken")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
