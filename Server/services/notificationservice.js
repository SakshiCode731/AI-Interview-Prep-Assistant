const Notification = require('../models/notification');
const { emitToUser } = require('../socket');

async function createNotification(userId, { type, title, message, link }) {
  const notification = await Notification.create({ user: userId, type, title, message, link });
  emitToUser(userId, 'notification:new', notification);
  return notification;
}

module.exports = { createNotification };