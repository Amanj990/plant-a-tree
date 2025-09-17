const bcrypt = require('bcryptjs');

// Test the admin password
const plainPassword = 'amanadmin123';
const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // Example hash

bcrypt.compare(plainPassword, hashedPassword).then(result => {
  console.log('Password match:', result);
});

// Hash the admin password to see what it should be
bcrypt.hash(plainPassword, 10).then(hash => {
  console.log('New hash for amanadmin123:', hash);
});