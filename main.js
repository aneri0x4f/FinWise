import { signup, login, logout } from './auth.js';
import { fetchCurrencies, convert } from './currency.js';
import { saveEntry, fetchEntries, toggleCategories } from './entries.js';
import { updateSavingsGoal, loadSavingsGoal } from './goal.js';

// Initialize app when page loads
document.addEventListener("DOMContentLoaded", () => {
  fetchCurrencies();  // Fetch currencies on page load
  loadSavingsGoal();  // Load the savings goal
  document.getElementById("convertBtn").addEventListener("click", convert);  // Currency conversion
  document.getElementById("loginBtn").addEventListener("click", login);  // Login button
  document.getElementById("signupBtn").addEventListener("click", signup);  // Signup button
  document.getElementById("logoutBtn").addEventListener("click", logout);  // Logout button
});

// Attach all functions to window so they're globally accessible
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
