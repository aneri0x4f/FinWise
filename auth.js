import { supabase } from './supabase.js';

export async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert('Login failed: ' + error.message);
  } else {
    alert('Logged in as: ' + data.user.email);
    document.getElementById('authStatus').innerText = `Logged in as ${data.user.email}`;
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
  }
}

export async function signup() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert('Signup failed: ' + error.message);
  } else {
    alert('Signup successful. Please check your email.');
  }
}

export function logout() {
  supabase.auth.signOut().then(() => {
    alert('Logged out!');
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('appContent').style.display = 'none';
  });
}
