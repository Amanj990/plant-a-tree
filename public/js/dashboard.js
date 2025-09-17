// dashboard.js
// This script handles user dashboard functionality

document.addEventListener('DOMContentLoaded', () => {
  const usernameDisplay = document.getElementById('username-display');
  const walletBalanceEl = document.getElementById('wallet-balance');
  const rentalsList = document.getElementById('rentals-list');
  const referralCodeEl = document.getElementById('referral-code');
  const referralCountEl = document.getElementById('referral-count');
  const transactionsTbody = document.getElementById('transactions-tbody');
  const withdrawBtn = document.getElementById('withdraw-btn');
  const withdrawMsg = document.getElementById('withdraw-msg');
  const logoutBtn = document.getElementById('logout-btn');
  const copyReferralBtn = document.getElementById('copy-referral-btn');
  const shareWhatsappBtn = document.getElementById('share-whatsapp');
  const shareFacebookBtn = document.getElementById('share-facebook');
  const shareTwitterBtn = document.getElementById('share-twitter');

  // Check if user is logged in
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  if (!token) {
    alert('Please login first.');
    window.location.href = 'login.html';
    return;
  }

  usernameDisplay.textContent = username;

  // Fetch user dashboard data
  async function fetchDashboard() {
    try {
      // Decode token to get user id (simple way)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;

      const res = await fetch(`/api/user/${userId}`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to load dashboard.');
        if (res.status === 401 || res.status === 403) {
          logout();
        }
        return;
      }

      // Update wallet balance
      walletBalanceEl.textContent = `₹${data.user.credits.toFixed(2)}`;

      // Enable withdraw button if balance >= 150
      if (data.user.credits >= 150) {
        withdrawBtn.disabled = false;
        withdrawMsg.textContent = '';
      } else {
        withdrawBtn.disabled = true;
        withdrawMsg.textContent = 'Minimum ₹150 required to withdraw.';
      }

      // Show referral code and count
      referralCodeEl.textContent = data.user.referralCode;
      referralCountEl.textContent = data.referralCount;

      // Show rentals
      rentalsList.innerHTML = '';
      if (data.rentals.length === 0) {
        rentalsList.innerHTML = '<p>No current rentals.</p>';
      } else {
        data.rentals.forEach(rental => {
          const treeName = getTreeNameById(rental.treeId);
          const card = document.createElement('div');
          card.className = 'rental-card';

          card.innerHTML = `
            <h4>${treeName} Plan</h4>
            <p>Start Date: ${new Date(rental.startDate).toLocaleDateString()}</p>
            <p>End Date: ${new Date(rental.endDate).toLocaleDateString()}</p>
            <p>Returns Collected: ₹${rental.returnsCollected}</p>
            <div class="rental-progress-bar">
              <div class="progress" style="width: ${rental.progress}%;"></div>
            </div>
            <button class="btn btn-secondary certificate-btn" data-rental-id="${rental.id}">Download Certificate</button>
          `;

          rentalsList.appendChild(card);
        });
      }

      // Show transactions
      transactionsTbody.innerHTML = '';
      if (data.transactions.length === 0) {
        transactionsTbody.innerHTML = '<tr><td colspan="4">No transactions yet.</td></tr>';
      } else {
        data.transactions.forEach(tx => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${new Date(tx.date).toLocaleDateString()}</td>
            <td>${capitalizeFirstLetter(tx.type)}</td>
            <td>${tx.amount.toFixed(2)}</td>
            <td>${tx.description}</td>
          `;
          transactionsTbody.appendChild(tr);
        });
      }
    } catch (error) {
      alert('Network error. Please try again later.');
    }
  }

  // Helper to get tree name by id (static)
  function getTreeNameById(id) {
    const map = {
      marigold: 'Marigold',
      rose: 'Rose',
      tulsi: 'Tulsi',
      mango: 'Mango'
    };
    return map[id] || 'Unknown';
  }

  // Capitalize first letter helper
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Withdraw button click
  withdrawBtn.addEventListener('click', async () => {
    const amountStr = prompt('Enter amount to withdraw (minimum ₹150):');
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < 150) {
      alert('Invalid amount. Minimum ₹150 required.');
      return;
    }

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchDashboard();
      } else {
        alert(data.message || 'Withdrawal failed.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  });

  // Logout button
  logoutBtn.addEventListener('click', () => {
    logout();
  });

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
  }

  // Copy referral code
  copyReferralBtn.addEventListener('click', () => {
    const code = referralCodeEl.textContent;
    navigator.clipboard.writeText(code).then(() => {
      alert('Referral code copied to clipboard!');
    });
  });

  // Share buttons
  shareWhatsappBtn.addEventListener('click', () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Join Plant a Tree and grow your wealth by growing a plant! Use my referral code: ${referralCodeEl.textContent}`);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  });

  shareFacebookBtn.addEventListener('click', () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  });

  shareTwitterBtn.addEventListener('click', () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Join Plant a Tree and grow your wealth by growing a plant! Use my referral code: ${referralCodeEl.textContent}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  });

  // Download certificate buttons
  rentalsList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('certificate-btn')) {
      const rentalId = e.target.dataset.rentalId;
      try {
        const res = await fetch(`/api/certificate/${rentalId}`, {
          headers: { Authorization: 'Bearer ' + token }
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.message || 'Certificate not available yet.');
          return;
        }
        // Download PDF
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate_${rentalId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        alert('Error downloading certificate.');
      }
    }
  });

  // Initial fetch
  fetchDashboard();
});
