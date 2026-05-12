const form = document.querySelector("#invoiceForm");
const preview = document.querySelector("#invoicePreview");
const lineItemsRoot = document.querySelector("#lineItems");
const itemTemplate = document.querySelector("#lineItemTemplate");
const saveStatus = document.querySelector("#saveStatus");

const STORAGE_KEY = "freelance-invoice-generator:v1";

const fields = [
  "businessName",
  "businessEmail",
  "businessAddress",
  "clientName",
  "clientEmail",
  "clientAddress",
  "invoiceNumber",
  "issueDate",
  "dueDate",
  "currency",
  "taxRate",
  "discount",
  "paymentInstructions",
  "footerNote",
];

const today = new Date();
const dueDate = new Date();
dueDate.setDate(today.getDate() + 14);

const defaultState = {
  businessName: "Northline Studio",
  businessEmail: "hello@northline.example",
  businessAddress: "18 Ledger Street\nAustin, TX\nUnited States",
  clientName: "Acme Co.",
  clientEmail: "ap@acme.example",
  clientAddress: "400 Market Avenue\nSan Francisco, CA\nUnited States",
  invoiceNumber: "INV-001",
  issueDate: formatDateInput(today),
  dueDate: formatDateInput(dueDate),
  currency: "USD",
  taxRate: "0",
  discount: "0",
  paymentInstructions: "Payment due within 14 days. Bank transfer or PayPal accepted.",
  footerNote: "Thank you for your business.",
  items: [
    { description: "Landing page design", quantity: "1", rate: "850" },
    { description: "Copy refinement", quantity: "1", rate: "250" },
  ],
};

let saveTimer;

init();

function init() {
  const stored = loadState();
  applyState(stored || defaultState);
  bindEvents();
  render();
}

function bindEvents() {
  form.addEventListener("input", () => {
    render();
    scheduleSave();
  });

  document.querySelector("#addItemButton").addEventListener("click", () => {
    addLineItem({ description: "", quantity: "1", rate: "0" });
    render();
    scheduleSave();
  });

  document.querySelector("#loadDemoButton").addEventListener("click", () => {
    applyState(defaultState);
    render();
    saveNow("Sample loaded");
  });

  document.querySelector("#printButton").addEventListener("click", () => {
    window.print();
  });

  document.querySelector("#downloadButton").addEventListener("click", downloadInvoiceHtml);
  document.querySelector("#copySummaryButton").addEventListener("click", copyInvoiceSummary);

  document.querySelector("#resetButton").addEventListener("click", () => {
    const shouldReset = window.confirm("Reset the invoice form?");
    if (!shouldReset) return;
    localStorage.removeItem(STORAGE_KEY);
    applyState({ ...defaultState, items: [{ description: "", quantity: "1", rate: "0" }] });
    render();
    saveStatus.textContent = "Reset";
  });
}

function applyState(state) {
  fields.forEach((field) => {
    const input = document.querySelector(`#${field}`);
    input.value = state[field] ?? "";
  });

  lineItemsRoot.innerHTML = "";
  const items = Array.isArray(state.items) && state.items.length ? state.items : defaultState.items;
  items.forEach(addLineItem);
}

function addLineItem(item) {
  const fragment = itemTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".line-item");
  row.querySelector(".item-description").value = item.description ?? "";
  row.querySelector(".item-quantity").value = item.quantity ?? "1";
  row.querySelector(".item-rate").value = item.rate ?? "0";
  row.querySelector(".remove-item").addEventListener("click", () => {
    if (lineItemsRoot.children.length === 1) {
      row.querySelector(".item-description").value = "";
      row.querySelector(".item-quantity").value = "1";
      row.querySelector(".item-rate").value = "0";
    } else {
      row.remove();
    }
    render();
    scheduleSave();
  });
  lineItemsRoot.appendChild(fragment);
}

function getState() {
  const state = {};
  fields.forEach((field) => {
    state[field] = document.querySelector(`#${field}`).value;
  });
  state.items = [...lineItemsRoot.querySelectorAll(".line-item")].map((row) => ({
    description: row.querySelector(".item-description").value,
    quantity: row.querySelector(".item-quantity").value,
    rate: row.querySelector(".item-rate").value,
  }));
  return state;
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function scheduleSave() {
  saveStatus.textContent = "Saving...";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveNow("Saved"), 250);
}

function saveNow(message = "Saved") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
  saveStatus.textContent = message;
  setTimeout(() => {
    saveStatus.textContent = "Saved";
  }, 1200);
}

function render() {
  const state = getState();
  const totals = calculateTotals(state);
  const rows = state.items
    .filter((item) => item.description.trim() || toNumber(item.quantity) || toNumber(item.rate))
    .map((item) => {
      const quantity = toNumber(item.quantity);
      const rate = toNumber(item.rate);
      const amount = quantity * rate;
      return `
        <tr>
          <td>${escapeHtml(item.description || "Service")}</td>
          <td>${formatPlainNumber(quantity)}</td>
          <td>${formatMoney(rate, state.currency)}</td>
          <td>${formatMoney(amount, state.currency)}</td>
        </tr>
      `;
    })
    .join("");

  preview.innerHTML = `
    <div class="invoice-head">
      <div>
        <h2 class="invoice-title">Invoice</h2>
        <p>${escapeHtml(state.businessName || "Your business")}</p>
      </div>
      <div class="invoice-meta">
        <strong>${escapeHtml(state.invoiceNumber || "INV-001")}</strong>
        <p>Issued: ${escapeHtml(formatDisplayDate(state.issueDate))}</p>
        <p>Due: ${escapeHtml(formatDisplayDate(state.dueDate))}</p>
      </div>
    </div>

    <div class="party-grid">
      <section class="party">
        <h3>From</h3>
        <strong>${escapeHtml(state.businessName || "Your business")}</strong>
        <p>${escapeHtml(state.businessEmail)}</p>
        <p>${escapeHtml(state.businessAddress)}</p>
      </section>
      <section class="party">
        <h3>Bill to</h3>
        <strong>${escapeHtml(state.clientName || "Client")}</strong>
        <p>${escapeHtml(state.clientEmail)}</p>
        <p>${escapeHtml(state.clientAddress)}</p>
      </section>
    </div>

    <table class="invoice-table">
      <thead>
        <tr>
          <th scope="col">Description</th>
          <th scope="col">Qty</th>
          <th scope="col">Rate</th>
          <th scope="col">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="4">Add a line item to build your invoice.</td></tr>`}
      </tbody>
    </table>

    <div class="invoice-summary">
      <section class="invoice-note">
        <strong>Payment instructions</strong>
        <p>${escapeHtml(state.paymentInstructions)}</p>
      </section>
      <section class="totals" aria-label="Invoice totals">
        <h3 class="sr-only">Totals</h3>
        <div class="total-row">
          <span>Subtotal</span>
          <strong>${formatMoney(totals.subtotal, state.currency)}</strong>
        </div>
        <div class="total-row">
          <span>Discount</span>
          <strong>${formatMoney(totals.discount, state.currency)}</strong>
        </div>
        <div class="total-row">
          <span>Tax</span>
          <strong>${formatMoney(totals.tax, state.currency)}</strong>
        </div>
        <div class="total-row grand">
          <span>Total</span>
          <strong>${formatMoney(totals.total, state.currency)}</strong>
        </div>
      </section>
    </div>

    <footer class="invoice-footer">${escapeHtml(state.footerNote)}</footer>
  `;
}

function calculateTotals(state) {
  const subtotal = state.items.reduce((sum, item) => {
    return sum + toNumber(item.quantity) * toNumber(item.rate);
  }, 0);
  const discount = Math.min(toNumber(state.discount), subtotal);
  const taxable = Math.max(subtotal - discount, 0);
  const tax = taxable * (toNumber(state.taxRate) / 100);
  return {
    subtotal,
    discount,
    tax,
    total: taxable + tax,
  };
}

function downloadInvoiceHtml() {
  const state = getState();
  const documentHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(state.invoiceNumber || "invoice")}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="app-shell">
    <section class="preview-panel" style="position:static">
      ${preview.outerHTML}
    </section>
  </main>
</body>
</html>`;
  const blob = new Blob([documentHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeFileName(state.invoiceNumber || "invoice")}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyInvoiceSummary() {
  const state = getState();
  const totals = calculateTotals(state);
  const summary = [
    `Invoice ${state.invoiceNumber || "INV-001"}`,
    `Client: ${state.clientName || "Client"}`,
    `Due: ${formatDisplayDate(state.dueDate)}`,
    `Total: ${formatMoney(totals.total, state.currency)}`,
  ].join("\n");

  try {
    await navigator.clipboard.writeText(summary);
    saveStatus.textContent = "Copied";
  } catch {
    saveStatus.textContent = "Copy failed";
  }
}

function formatMoney(value, currency) {
  const safeCurrency = currency || "USD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: safeCurrency,
    currencyDisplay: "narrowSymbol",
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDateInput(date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(value) {
  if (!value) return "Not set";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatPlainNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function toNumber(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
}

function sanitizeFileName(value) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
