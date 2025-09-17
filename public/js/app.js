// app.js
// This script handles the landing page interactivity

document.addEventListener('DOMContentLoaded', () => {
  const rentButtons = document.querySelectorAll('.rent-btn');
  const modal = document.getElementById('rental-modal');
  const closeBtn = modal.querySelector('.close-btn');
  const modalTreeName = document.getElementById('modal-tree-name');
  const modalTreeDetails = document.getElementById('modal-tree-details');
  const confirmRentBtn = document.getElementById('confirm-rent-btn');

  let selectedTreeId = null;

  // Fetch tree packages from API and update tooltips and progress bars if needed
  async function fetchTrees() {
    try {
      const res = await fetch('/api/trees');
      const trees = await res.json();

      // Update tooltips and details dynamically if needed
      rentButtons.forEach(btn => {
        const treeId = btn.dataset.treeId;
        const tree = trees.find(t => t.id === treeId);
        if (tree) {
          btn.parentElement.title = `Invest ₹${tree.price}, earn ₹${tree.dailyReturn}/day for ${tree.durationDays} days, total ₹${tree.dailyReturn * tree.durationDays} (${Math.round((tree.dailyReturn * tree.durationDays / tree.price) * 100)}% return)`;
        }
      });
    } catch (error) {
      console.error('Error fetching trees:', error);
    }
  }

  fetchTrees();

  // Open modal when rent button clicked
  rentButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedTreeId = btn.dataset.treeId;
      modalTreeName.textContent = `You selected the ${btn.parentElement.querySelector('h3').textContent}`;
      modalTreeDetails.textContent = btn.parentElement.title;
      modal.style.display = 'block';
    });
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close modal if clicked outside content
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Confirm rent button click
  confirmRentBtn.addEventListener('click', async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to rent a tree.');
      window.location.href = 'login.html';
      return;
    }

    try {
      const res = await fetch('/api/rent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ treeId: selectedTreeId })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Tree rented successfully! Check your dashboard for details.');
        modal.style.display = 'none';
        window.location.href = 'dashboard.html';
      } else {
        alert(data.message || 'Error renting tree.');
      }
    } catch (error) {
      alert('Network error. Please try again later.');
    }
  });
});
