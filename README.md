# Freelance Invoice Generator

A free browser-based invoice generator for freelancers and solo service businesses.

## What it does

- Creates a polished invoice preview in the browser
- Adds, removes, and calculates line items
- Supports tax, discount, dates, and common currencies
- Saves draft data in local browser storage
- Prints or saves the invoice as PDF through the browser print dialog
- Downloads a standalone invoice HTML file
- Includes a natural upgrade block for a paid template pack

## How to run locally

Open `index.html` in a browser.

For local testing with a server:

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173/
```

## How to deploy to GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, and this `README.md`.
3. Go to repository settings.
4. Open Pages.
5. Choose deploy from the main branch.
6. Use the root folder as the Pages source.

## Monetization setup

After publishing your paid template pack, replace the `href="#"` value for `paidProductLink` in `index.html` with your product link.

Suggested copy:

```text
Replace with your $5 template link
```

Suggested first paid product:

```text
Freelance Client Onboarding Kit
```

## Notes

This tool stores invoice data only in the user's browser using `localStorage`. It does not send data to a server.
