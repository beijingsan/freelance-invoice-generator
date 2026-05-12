# Freelance Invoice Generator

A free browser-based invoice generator for freelancers and solo service businesses.

[Live tool](https://beijingsan.github.io/freelance-invoice-generator/)

## What it does

- Creates a polished invoice preview in the browser
- Adds, removes, and calculates line items
- Supports tax, discount, dates, and common currencies
- Saves draft data in local browser storage
- Prints or saves the invoice as PDF through the browser print dialog
- Downloads a standalone invoice HTML file
- Includes a paid customization request path through GitHub Issues

## Paid customization

Need this invoice generator customized for your business or client workflow?

Open a request here:

[Request custom invoice setup](https://github.com/beijingsan/freelance-invoice-generator/issues/new?template=custom-invoice.yml)

Suggested service packages:

- Quick setup: $29 for logo/color/text customization
- Business invoice template: $99 for custom fields, payment wording, and branded layout
- Client-ready mini tool: $199 for a tailored public invoice tool page

Payment details and final scope are confirmed privately before work begins.

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

## Notes

This tool stores invoice data only in the user's browser using `localStorage`. It does not send data to a server.
