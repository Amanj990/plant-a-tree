const userTable = document.getElementById('userTable');
const token = localStorage.getItem('token');
const socket = io(); // connect to server

async function loadUsers() {
  const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
  const users = await res.json();
  renderUsers(users);
}

function renderUsers(users) {
  userTable.innerHTML = '';
  users.forEach(u => addUserRow(u));
}

function addUserRow(user) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td class="border px-4 py-2">${user.username}</td>
    <td class="border px-4 py-2">${user.email}</td>
    <td class="border px-4 py-2">${user.role}</td>
    <td class="border px-4 py-2">
      <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded" data-id="${user.id}">Delete</button>
    </td>
  `;
  userTable.appendChild(row);

  row.querySelector('.delete-btn').addEventListener('click', async () => {
    await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    row.remove();
  });
}

// Real-time listener
socket.on('newUser', user => addUserRow(user));

// Initial load
loadUsers();
