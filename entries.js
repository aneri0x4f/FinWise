import { supabase } from './supabase.js';
import { updateSavingsProgress } from './goal.js';

let allEntries = [];
let currentIndex = 0;
const BATCH_SIZE = 10;

// Save Entry
export async function saveEntry(e) {
  e.preventDefault();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return alert("Login required.");

  const amount = parseFloat(document.getElementById("entryAmount").value);
  const type = document.getElementById("entryType").value === "salary" ? "income" : "expense";
  const category = document.getElementById("entryCategory").value;
  const note = document.getElementById("entryNote").value;

  const { error } = await supabase.from("finance_entries").insert([
    { uid: user.id, amount, type, category, note }
  ]);

  if (error) return alert("❌ Failed to save entry.");
  document.getElementById("financeForm").reset();
  await fetchEntries(true);  // true = reset list
}

// Fetch All Entries Once
export async function fetchEntries(reset = false) {
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
  allEntries = data;

  if (month) {
    allEntries = allEntries.filter(e =>
      String(new Date(e.created_at).getMonth() + 1).padStart(2, '0') === month
    );
  }

  if (category) {
    allEntries = allEntries.filter(e => e.category === category);
  }

  currentIndex = 0;
  if (reset) document.getElementById("entryList").innerHTML = "";
  loadMoreEntries();

  calculateBalance(allEntries);
  updateSavingsProgress(allEntries);
}

// Load next batch
function loadMoreEntries() {
  const container = document.getElementById("entryList");
  const slice = allEntries.slice(currentIndex, currentIndex + BATCH_SIZE);
  slice.forEach(entry => {
    const div = document.createElement("div");
    div.classList.add("entry-card");
    div.innerHTML = `
      <strong>${entry.type.toUpperCase()}</strong> — $${entry.amount}<br>
      <em>${entry.category}</em> | ${entry.note || "-"}<br>
      <small>${new Date(entry.created_at).toLocaleDateString()}</small>
    `;
    container.appendChild(div);
  });
  currentIndex += BATCH_SIZE;
}

// Detect scroll bottom
document.addEventListener("DOMContentLoaded", () => {
  const entryList = document.getElementById("entryList");
  entryList.addEventListener("scroll", () => {
    if (entryList.scrollTop + entryList.clientHeight >= entryList.scrollHeight - 10) {
      loadMoreEntries();
    }
  });
});

// Calculate balance
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
