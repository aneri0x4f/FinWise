import { supabase } from './supabase.js';

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

  updateSavingsProgress();
}

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

  const { fetchEntries } = await import('./entries.js');
  fetchEntries();
}

export function updateSavingsProgress(entries = []) {
  const savingsGoal = parseFloat(document.getElementById("savingsGoal").value);
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
      ? `🎉 Goal reached! Saved $${totalSaved}`
      : `Progress: $${totalSaved} / $${savingsGoal}`;
}
