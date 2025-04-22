// project.js
import { supabase } from './supabase.js';

// Load on page
document.addEventListener("DOMContentLoaded", () => {
  fetchCurrencies();
  document.getElementById("convertBtn").addEventListener("click", convert);
});

// Currency Conversion
async function fetchCurrencies() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await response.json();
    const currencies = Object.keys(data.rates);

    const fromSelect = document.getElementById("fromCurrency");
    const toSelect = document.getElementById("toCurrency");

    currencies.forEach(currency => {
      const opt1 = new Option(currency, currency);
      const opt2 = new Option(currency, currency);
      fromSelect.add(opt1.cloneNode(true));
      toSelect.add(opt2.cloneNode(true));
    });

    fromSelect.value = "USD";
    toSelect.value = "INR";
  } catch {
    document.getElementById("error").innerText = "Could not load currencies.";
  }
}

async function convert() {
  const amount = parseFloat(document.getElementById("amount").value);
  const from = document.getElementById("fromCurrency").value;
  const to = document.getElementById("toCurrency").value;

  if (isNaN(amount) || amount <= 0) {
    document.getElementById("error").innerText = "Enter a valid amount.";
    return;
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await res.json();
    const rate = data.rates[to];
    const converted = (amount * rate).toFixed(2);
    document.getElementById("result").innerHTML = `${amount} ${from} = <strong>${converted} ${to}</strong>`;
  } catch {
    document.getElementById("error").innerText = "Conversion failed.";
  }
}

// Auth: Signup
window.signup = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    document.getElementById("authStatus").innerText = `Signup failed: ${error.message}`;
  } else {
    document.getElementById("authStatus").innerText = "Signup successful. Check your email to confirm!";
  }
};

// Auth: Login
window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    document.getElementById("authStatus").innerText = `Login failed: ${error.message}`;
  } else {
    document.getElementById("authStatus").innerText = "Login successful.";
    fetchEntries();
  }
};

// Auth: Logout
window.logout = async function () {
  const { error } = await supabase.auth.signOut();
  if (error) {
    document.getElementById("authStatus").innerText = `Logout failed: ${error.message}`;
  } else {
    document.getElementById("authStatus").innerText = "Logged out.";
    document.getElementById("entryList").innerHTML = "";
    document.getElementById("totalBalance").innerText = "$0.00";
  }
};

// Save Entry
window.saveEntry = async function (e) {
  e.preventDefault();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return alert("You must be logged in to save entries.");

  const amount = parseFloat(document.getElementById("entryAmount").value);
  const type = document.getElementById("entryType").value === "salary" ? "income" : "expense";
  const category = document.getElementById("entryCategory").value;
  const note = document.getElementById("entryNote").value;

  const { error } = await supabase.from("finance_entries").insert([{
    uid: user.id,
    type,
    amount,
    category,
    note
  }]);

  if (error) {
    alert("❌ Failed to save entry.");
    console.error(error);
  } else {
    alert("✅ Entry saved.");
    document.getElementById("financeForm").reset();
    fetchEntries();
  }
};

// Fetch & Render Entries
window.fetchEntries = async function () {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { data, error } = await supabase
    .from("finance_entries")
    .select("*")
    .eq("uid", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching entries:", error);
    return;
  }

  let entries = data;

  const monthFilter = document.getElementById("filterMonth").value;
  const categoryFilter = document.getElementById("filterCategory").value;

  if (monthFilter) {
    entries = entries.filter(entry => {
      const d = new Date(entry.created_at);
      return String(d.getMonth() + 1).padStart(2, '0') === monthFilter;
    });
  }

  if (categoryFilter) {
    entries = entries.filter(entry => entry.category === categoryFilter);
  }

  renderEntries(entries);
  calculateBalance(entries);
};

// Render entries
function renderEntries(entries) {
  const container = document.getElementById("entryList");
  container.innerHTML = "";

  if (entries.length === 0) {
    container.innerHTML = "<p>No entries found.</p>";
    return;
  }

  entries.forEach(entry => {
    const date = new Date(entry.created_at).toLocaleDateString();
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${entry.type.toUpperCase()}</strong> — $${entry.amount}<br>
      <em>${entry.category}</em> | ${entry.note || "-"}<br>
      <small>${date}</small>
    `;
    div.style.borderBottom = "1px solid #ccc";
    div.style.padding = "8px 0";
    container.appendChild(div);
  });
}

// Calculate total
function calculateBalance(entries) {
  let total = 0;
  entries.forEach(entry => {
    if (entry.type === "income") {
      total += Number(entry.amount);
    } else {
      total -= Number(entry.amount);
    }
  });
  document.getElementById("totalBalance").innerText = `$${total.toFixed(2)}`;
}
