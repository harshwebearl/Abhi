import { BASEURL } from '../BASEURL.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('admin-login-form');
  const message = document.getElementById('login-message');
  const submitBtn = form.querySelector('button[type="submit"]');
  const rawResponseEl = document.getElementById('raw-response');
  const showRawCheckbox = document.getElementById('show-raw-response');
  const autofillBtn = document.getElementById('autofill-demo');
  const TEST_EMAIL = 'Abhisekh@gmail.com';
  const TEST_PASSWORD = 'Abhisekh@1709';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.textContent = '';
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      message.textContent = 'Please enter both email and password.';
      message.className = 'text-danger small mb-2';
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';

    try {
      const response = await fetch(`${BASEURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Always capture raw response text for debugging
      const rawText = await response.clone().text();
      let data = null;
      try { data = JSON.parse(rawText); } catch (_) { /* non-JSON */ }

      if (response.ok) {
        if (data && data.token) {
          try { localStorage.setItem('adminToken', data.token); } catch (_) {}
          window.location.href = 'admin-dashboard.html';
          return;
        }

        // Detect 'echo' responses where server returns the sent credentials
        if (data && data.email && data.password &&
            data.email === email && data.password === password) {
          console.warn('Server returned an echo of the posted credentials. Check your API endpoint or server-side logic.');
          message.textContent = 'Unexpected response from server — it returned the submitted credentials. Verify your API route.';
          message.className = 'text-danger small mb-2';
        } else if (data && (data.success || data.status === 'ok')) {
          window.location.href = 'admin-dashboard.html';
          return;
        } else {
          const errMsg = (data && (data.message || data.error)) || rawText || 'Invalid email or password.';
          message.textContent = errMsg;
          message.className = 'text-danger small mb-2';
        }
      } else {
        const errMsg = (data && (data.message || data.error)) || rawText || 'Invalid email or password.';
        message.textContent = errMsg;
        message.className = 'text-danger small mb-2';
      }
      // Show raw response if user opted in
      if (rawResponseEl) {
        rawResponseEl.textContent = `HTTP ${response.status} ${response.statusText}\n\n${rawText}`;
        rawResponseEl.style.display = showRawCheckbox && showRawCheckbox.checked ? 'block' : 'none';
      }
    } catch (err) {
      message.textContent = 'Network error. Please try again.';
      message.className = 'text-danger small mb-2';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  // Autofill demo credentials (developer convenience)
  if (autofillBtn) {
    autofillBtn.addEventListener('click', () => {
      form.elements['email'].value = TEST_EMAIL;
      form.elements['password'].value = TEST_PASSWORD;
    });
  }

  // Toggle raw response visibility
  if (showRawCheckbox && rawResponseEl) {
    showRawCheckbox.addEventListener('change', () => {
      rawResponseEl.style.display = showRawCheckbox.checked ? 'block' : 'none';
    });
  }
});
