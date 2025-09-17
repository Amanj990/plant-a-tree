const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

db.defaults({
  users: [],
  trees: [
    { id: 'marigold', name: 'Marigold', price: 300, dailyReturn: 3, durationDays: 30, description: 'Entry level plan - Perfect for beginners', badge: 'Perfect for beginners' },
    { id: 'rose', name: 'Rose', price: 500, dailyReturn: 6, durationDays: 45, description: 'Popular choice - Most popular', badge: 'Most popular' },
    { id: 'tulsi', name: 'Tulsi', price: 800, dailyReturn: 10, durationDays: 60, description: 'Value option - Best value', badge: 'Best value' },
    { id: 'mango', name: 'Mango', price: 1500, dailyReturn: 20, durationDays: 90, description: 'Premium investment - Premium investor', badge: 'Premium investor' }
  ],
  rentals: [],
  transactions: [],
  referrals: []
}).write();

module.exports = { db };