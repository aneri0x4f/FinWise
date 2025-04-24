import { supabase } from './supabase.js';
import { updateSavingsProgress } from './goal.js';

export async function saveEntry(e) {
  e.preventDefault();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return alert("Login required.");

  const amount = parseFloat(document.getElementById("entryAmount").value);
  const type = document.getElementById("entryType").value === "salary" ? "income" : "expense";
  const category = document.getElementById("entryCategory").value;
  const note = document.getElementById("entryNote").value;

  const { error } = await supabase.from("finance_entries").insert([{
    uid: user.id, amount, type, category, note
  }]);

  if (error) return alert("❌ Failed to save entry.");

  document.getElementById("financeForm").reset();
  fetchEntries();
}

export async function fetchEntries() {
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
    entries = entries.filter(e => new Date(e.created_at).getMonth() + 1 === parseInt(month));
  }

  if (category) {
    entries = entries.filter(e => e.category === category);
  }

  renderEntries(entries);
  calculateBalance(entries);
  updateSavingsProgress(entries);
}

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

function calculateBalance(entries) {
  let total = 0;
  entries.forEach(entry => {
    total += entry.type === "income" ? Number(entry.amount) : -Number(entry.amount);
  });
  document.getElementById("totalBalance").innerText = `$${total.toFixed(2)}`;
}

export function toggleCategories() {
  const entryType = document.getElementById("entryType").value;
  const categorySection = document.getElementById("categorySection");
  categorySection.style.display = entryType === "expense" ? "block" : "none";
}
