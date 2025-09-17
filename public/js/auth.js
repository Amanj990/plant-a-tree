// auth.js
// This script handles login and signup forms

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  // Login form submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = loginForm.username.value.trim();
      const password = loginForm.password.value;

      if (!username || !password) {
        showError('login-error', 'Please fill in all fields.');
        return;
      }

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          window.location.href = 'dashboard.html';
        } else {
          showError('login-error', data.message || 'Login failed.');
        }
      } catch (error) {
        showError('login-error', 'Network error. Please try again.');
      }
    });
  }

  // Signup form submit
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = signupForm.username.value.trim();
      const email = signupForm.email.value.trim();
      const password = signupForm.password.value;
      const referralCode = signupForm.referralCode.value.trim();

      if (!username || !email || !password) {
        showError('signup-error', 'Please fill in all required fields.');
        return;
      }

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, referralCode })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          window.location.href = 'dashboard.html';
        } else {
          showError('signup-error', data.message || 'Signup failed.');
        }
      } catch (error) {
        showError('signup-error', 'Network error. Please try again.');
      }
    });
  }

  // Show error message helper
  function showError(id, message) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = message;
    }
  }
});