import { signup, login, logout } from './auth.js';
import { fetchCurrencies, convert } from './currency.js';
import { saveEntry, fetchEntries, toggleCategories } from './entries.js';
import { updateSavingsGoal, loadSavingsGoal, resetAllData } from './goal.js';

// ✅ App initialization
document.addEventListener("DOMContentLoaded", () => {
  fetchCurrencies();                // Load currency options
  loadSavingsGoal();               // Load saved goal
  document.getElementById("convertBtn").addEventListener("click", convert);
  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("signupBtn").addEventListener("click", signup);
  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("financeForm").addEventListener("submit", saveEntry);
  document.getElementById("goalBtn").addEventListener("click", updateSavingsGoal);

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAllData);  // 🔁 Attach reset logic
  }

  const typeSelect = document.getElementById("entryType");
  if (typeSelect) {
    typeSelect.addEventListener("change", toggleCategories);  // Toggle expense category
  }

  // Initial load
  fetchEntries();
});

// 🔁 Export for testing/debug if needed
window.signup = signup;
window.login = login;
window.logout = logout;
window.fetchCurrencies = fetchCurrencies;
window.convert = convert;
window.saveEntry = saveEntry;
window.fetchEntries = fetchEntries;
window.toggleCategories = toggleCategories;
window.updateSavingsGoal = updateSavingsGoal;
window.loadSavingsGoal = loadSavingsGoal;
window.resetAllData = resetAllData;
