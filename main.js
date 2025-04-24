import { signup, login, logout } from './auth.js';
import { fetchCurrencies, convert } from './currency.js';
import { saveEntry, fetchEntries, toggleCategories } from './entries.js';
import { updateSavingsGoal, loadSavingsGoal } from './goal.js';

// Initialize app when page loads
document.addEventListener("DOMContentLoaded", () => {
  fetchCurrencies();            // Populate currency dropdowns
  loadSavingsGoal();           // Load savings goal
  fetchEntries();              // Load entries on page load (if user is already logged in)

  // Auth buttons
  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("signupBtn").addEventListener("click", signup);
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // Currency conversion
  document.getElementById("convertBtn").addEventListener("click", convert);

  // Entry form interactions
  document.getElementById("financeForm").addEventListener("submit", saveEntry);
  document.getElementById("entryType").addEventListener("change", toggleCategories);

  // Savings goal button
  document.getElementById("goalBtn").addEventListener("click", updateSavingsGoal);

  // Filter dropdowns
  document.getElementById("filterMonth").addEventListener("change", fetchEntries);
  document.getElementById("filterCategory").addEventListener("change", fetchEntries);
});

// Attach all functions to window for manual testing/debugging if needed
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
