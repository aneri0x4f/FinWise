import { supabase } from './supabase.js';

let savingsGoal = 0;

// Run on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchCurrencies();
  document.getElementById("convertBtn").addEventListener("click", convert);
  loadSavingsGoal();
});

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

// 🔐 Supabase Auth: Signup
window.signup = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      redirectTo: 'http://127.0.0.1:8080/project.html' // live-server redirect
    }
  });

  document.getElementById("authStatus").innerText = error
    ? `Signup failed: ${error.message}`
    : "Signup successful. Check your email to confirm!";
};

// 🔓 Supabase Auth: Login
window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  document.getElementById("authStatus").innerText = error
    ? `Login failed: ${error.message}`
    : "Login successful.";

  fetchEntries();
  loadSavingsGoal();
};

// 🔒 Logout
window.logout = async function () {
  const { error } = await supabase.auth.signOut();
  document.getElementById("authStatus").innerText = error
    ? `Logout failed: ${error.message}`
    : "Logged out.";

  document.getElementById("entryList").innerHTML = "";
  document.getElementById("totalBalance").innerText = "$0.00";
  document.getElementById("progressText").innerText = "No goal set.";
  document.getElementById("progressBar").style.width = "0%";
};

// 💾 Save Income/Expense
window.saveEntry = async function (e) {
  e.preventDefault();

  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return alert("Login required.");

  const amount = parseFloat(document.getElementById("entryAmount").value);
  const type = document.getElementById("entryType").value === "salary" ? "income" : "expense";
  const category = document.getElementById("entryCategory").value;
  const note = document.getElementById("entryNote").value;

  const { error } = await supabase.from("finance_entries").insert([{
    uid: user.id,
    amount,
    type,
    category,
    note
  }]);

  if (error) return alert("❌ Failed to save entry.");

  document.getElementById("financeForm").reset();
  fetchEntries();
};

// 📥 Fetch Entries
window.fetchEntries = async function () {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { data, error } = await supabase
    .from("finance_entries")
    .select("*")
    .eq("uid", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch error:", error);
    return;
  }

  const month = document.getElementById("filterMonth").value;
  const category = document.getElementById("filterCategory").value;

  let entries = data;

  if (month) {
    entries = entries.filter(e => {
      const d = new Date(e.created_at);
      return String(d.getMonth() + 1).padStart(2, '0') === month;
    });
  }

  if (category) {
    entries = entries.filter(e => e.category === category);
  }

  renderEntries(entries);
  calculateBalance(entries);
  updateSavingsProgress(entries);
};

// 🖼️ Render Entries
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
    div.classList.add("entry-card");
    container.appendChild(div);
  });
}

// 💰 Calculate Total Balance
function calculateBalance(entries) {
  let total = 0;
  entries.forEach(entry => {
    if (entry.type === "income") total += Number(entry.amount);
    else total -= Number(entry.amount);
  });
  document.getElementById("totalBalance").innerText = `$${total.toFixed(2)}`;
}

// 🎯 Update Goal
window.updateSavingsGoal = async function () {
  const input = document.getElementById("savingsGoal");
  const user = (await supabase.auth.getUser()).data.user;
  savingsGoal = parseFloat(input.value);

  if (!user || isNaN(savingsGoal) || savingsGoal <= 0) {
    document.getElementById("progressText").innerText = "❗ Enter valid goal.";
    return;
  }

  await supabase
    .from("savings_goals")
    .upsert([{ uid: user.id, goal_amount: savingsGoal }], { onConflict: ['uid'] });

  updateSavingsProgress();
};

// 🔁 Load Goal on Login
async function loadSavingsGoal() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { data } = await supabase
    .from("savings_goals")
    .select("goal_amount")
    .eq("uid", user.id)
    .single();

  if (data?.goal_amount) {
    savingsGoal = data.goal_amount;
    document.getElementById("savingsGoal").value = savingsGoal;
  }

  fetchEntries(); // also refresh view
}

// 📊 Update Progress Bar
function updateSavingsProgress(entries = []) {
  if (!savingsGoal) {
    document.getElementById("progressText").innerText = "Set a savings goal.";
    document.getElementById("progressBar").style.width = "0%";
    return;
  }

  const totalSaved = entries
    .filter(e => e.category === "savings" && e.type === "expense")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const percent = Math.min((totalSaved / savingsGoal) * 100, 100).toFixed(1);
  document.getElementById("progressBar").style.width = `${percent}%`;

  document.getElementById("progressText").innerText =
    percent >= 100
      ? `🎉 Goal reached! Saved $${totalSaved}.`
      : `💰 Saved $${totalSaved} of $${savingsGoal} (${percent}%)`;
}
