import { supabase } from './supabase.js';
import { fetchEntries } from './entries.js';

// 🌟 Set or update overall savings goal
export async function updateSavingsGoal() {
  const input = document.getElementById("savingsGoal");
  const user = (await supabase.auth.getUser()).data.user;
  const savingsGoal = parseFloat(input.value);

  if (!user || isNaN(savingsGoal) || savingsGoal <= 0) {
    document.getElementById("progressText").innerText = "❗ Enter valid goal.";
    return;
  }

  await supabase
    .from("savings_goals")
    .upsert([{ uid: user.id, goal_amount: savingsGoal }], { onConflict: ['uid'] });

  updateSavingsProgress(); // Update the goal bar
}

// 📥 Load overall savings goal
export async function loadSavingsGoal() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { data } = await supabase
    .from("savings_goals")
    .select("goal_amount")
    .eq("uid", user.id)
    .single();

  if (data?.goal_amount) {
    document.getElementById("savingsGoal").value = data.goal_amount;
  }

  fetchEntries(); // Also refresh entries
}

// 📊 Update progress bars
export async function updateSavingsProgress(entries = []) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const incomeSum = entries
    .filter(e => e.type === "income")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const expensesByCategory = {};
  entries.forEach(e => {
    if (e.type === "expense") {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + Number(e.amount);
    }
  });

  const container = document.getElementById("categoryProgressBars");
  if (!container) return;
  container.innerHTML = "";

  for (const [category, spent] of Object.entries(expensesByCategory)) {
    let goal = incomeSum * 0.05;

    const { data: goalData } = await supabase
      .from("category_goals")
      .select("goal_amount")
      .eq("uid", user.id)
      .eq("category", category)
      .single();

    if (goalData?.goal_amount) {
      goal = goalData.goal_amount;
    }

    const percent = Math.min((spent / goal) * 100, 100).toFixed(1);
    const color = getColorForCategory(category, percent);

    const div = document.createElement("div");
    div.style.marginBottom = "20px";
    div.innerHTML = `
      <h4>${category.toUpperCase()}</h4>
      <div class="progress-container">
        <div class="progress-bar" style="width: ${percent}%; background: ${color}"></div>
      </div>
      <p class="goal-status">$${spent.toFixed(2)} / $${goal} (${percent}%)</p>
    `;
    container.appendChild(div);
  }

  updateOverallBar(entries, incomeSum);
}

// 🎯 Update main goal progress bar
function updateOverallBar(entries, incomeSum) {
  const savingsGoal = parseFloat(document.getElementById("savingsGoal").value);
  if (!savingsGoal || savingsGoal <= 0) {
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
      ? `🎉 Goal reached! Saved $${totalSaved}`
      : `Progress: $${totalSaved} / $${savingsGoal} (${percent}%)`;
}

// 🌈 Gradient color logic for progress bars
function getColorForCategory(category, percent) {
  if (category === "savings") {
    return `linear-gradient(to right, #b2f2bb, #006400)`;
  } else {
    if (percent < 40) return '#00c853';        // Green
    else if (percent < 60) return '#ffeb3b';    // Yellow
    else if (percent < 80) return '#ff9800';    // Orange
    else return '#d50000';                      // Red
  }
}

// 🧹 Clear all entries, goals, and reset dashboard
export async function resetAllData() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return alert("Login required.");

  // Confirm before reset
  const confirmReset = confirm("Are you sure you want to clear all data and reset everything?");
  if (!confirmReset) return;

  // Delete all finance entries
  await supabase.from("finance_entries").delete().eq("uid", user.id);

  // Delete overall goal
  await supabase.from("savings_goals").delete().eq("uid", user.id);

  // Delete category goals
  await supabase.from("category_goals").delete().eq("uid", user.id);

  // Reset UI
  document.getElementById("savingsGoal").value = "";
  document.getElementById("progressBar").style.width = "0%";
  document.getElementById("progressText").innerText = "No goal set.";
  document.getElementById("categoryProgressBars").innerHTML = "";
  document.getElementById("entryList").innerHTML = "";
  document.getElementById("totalBalance").innerText = "$0.00";
  document.getElementById("transactionHistory").innerHTML = "";

  alert("✅ All data cleared!");
}

// 👇 Export alias for category bars
export const updateCategoryProgress = updateSavingsProgress;
