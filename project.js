import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Fetch Currencies on Page Load
document.addEventListener("DOMContentLoaded", () => {
  fetchCurrencies();
  document.getElementById("convertBtn").addEventListener("click", convert);
});

async function fetchCurrencies() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await response.json();
    const currencies = Object.keys(data.rates);

    currencies.forEach(currency => {
      const option1 = new Option(currency, currency);
      const option2 = new Option(currency, currency);
      document.getElementById("fromCurrency").add(option1.cloneNode(true));
      document.getElementById("toCurrency").add(option2.cloneNode(true));
    });

    document.getElementById("fromCurrency").value = "USD";
    document.getElementById("toCurrency").value = "INR";
  } catch (error) {
    document.getElementById("error").innerText = "Could not load currency list.";
  }
}

async function convert() {
  const amount = parseFloat(document.getElementById("amount").value);
  const from = document.getElementById("fromCurrency").value;
  const to = document.getElementById("toCurrency").value;

  if (isNaN(amount) || amount <= 0) {
    document.getElementById("error").innerText = "Invalid amount.";
    return;
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await res.json();
    const rate = data.rates[to];
    const converted = (amount * rate).toFixed(2);
    document.getElementById("result").innerHTML = `${amount} ${from} = <strong>${converted} ${to}</strong>`;
  } catch {
    document.getElementById("error").innerText = "Currency conversion failed.";
  }
}

// Auth Functions
window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    document.getElementById("authStatus").innerText = "Signup successful.";
    fetchEntries();
  } catch (err) {
    document.getElementById("authStatus").innerText = `Signup failed: ${err.message}`;
  }
};

window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("authStatus").innerText = "Login successful.";
    fetchEntries();
  } catch (err) {
    document.getElementById("authStatus").innerText = `Login failed: ${err.message}`;
  }
};

window.logout = async function () {
  try {
    await signOut(auth);
    document.getElementById("authStatus").innerText = "Logged out.";
  } catch (err) {
    document.getElementById("authStatus").innerText = "Logout failed.";
  }
};

// Save Entry to Firestore
window.saveEntry = async function (e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("entryAmount").value);
  const typeInput = document.getElementById("entryType").value;
  const type = typeInput === "salary" ? "income" : "expense";
  const category = document.getElementById("entryCategory").value;
  const note = document.getElementById("entryNote").value;

  if (!auth.currentUser) {
    alert("Please login to save entries.");
    return;
  }

  try {
    await addDoc(collection(db, "financeEntries"), {
      uid: auth.currentUser.uid,
      amount,
      type,
      category,
      note,
      createdAt: serverTimestamp()
    });
    document.getElementById("financeForm").reset();
    fetchEntries();
  } catch (err) {
    console.error("Save failed:", err);
  }
};

// Fetch + Render Entries
window.fetchEntries = async function () {
  if (!auth.currentUser) return;

  const filterMonth = document.getElementById("filterMonth").value;
  const filterCategory = document.getElementById("filterCategory").value;

  let q = query(collection(db, "financeEntries"), where("uid", "==", auth.currentUser.uid));

  const snapshot = await getDocs(q);
  let entries = [];
  snapshot.forEach(doc => entries.push({ id: doc.id, ...doc.data() }));

  // Filter by month
  if (filterMonth) {
    entries = entries.filter(entry => {
      const date = entry.createdAt?.toDate?.();
      return date && String(date.getMonth() + 1).padStart(2, '0') === filterMonth;
    });
  }

  // Filter by category
  if (filterCategory) {
    entries = entries.filter(entry => entry.category === filterCategory);
  }

  renderEntries(entries);
  calculateBalance(entries);
};

// Render Entries to DOM
function renderEntries(entries) {
  const container = document.getElementById("entryList");
  container.innerHTML = "";

  if (entries.length === 0) {
    container.innerHTML = "<p>No entries found.</p>";
    return;
  }

  entries.forEach(entry => {
    const div = document.createElement("div");
    const date = entry.createdAt?.toDate?.().toLocaleDateString() || "No date";
    div.innerHTML = `
      <strong>${entry.type.toUpperCase()}</strong> - ₹${entry.amount}<br>
      <em>${entry.category}</em> | ${entry.note || "-"} <br>
      <small>${date}</small>
    `;
    div.style.borderBottom = "1px solid #ccc";
    div.style.marginBottom = "10px";
    container.appendChild(div);
  });
}

// Calculate Balance
function calculateBalance(entries) {
  let total = 0;
  entries.forEach(entry => {
    if (entry.type === "income") total += Number(entry.amount);
    else if (entry.type === "expense") total -= Number(entry.amount);
  });

  document.getElementById("totalBalance").innerText = `₹${total.toFixed(2)}`;
}