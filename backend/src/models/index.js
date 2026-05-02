'use strict';
// Load all models & define associations
const User         = require('./User');
const Topic        = require('./Topic');
const Notification = require('./Notification');

// ── Associations ──────────────────────────────────────────────────────────────

// A topic belongs to a student
Topic.belongsTo(User, { as: 'student',          foreignKey: 'studentId',    onDelete: 'CASCADE'  });
User.hasMany(Topic,   { as: 'submittedTopics',   foreignKey: 'studentId'    });

// A topic belongs to a supervisor
Topic.belongsTo(User, { as: 'supervisor',        foreignKey: 'supervisorId', onDelete: 'SET NULL' });
User.hasMany(Topic,   { as: 'supervisedTopics',  foreignKey: 'supervisorId' });

// A notification belongs to a recipient user
Notification.belongsTo(User, { as: 'recipient',      foreignKey: 'recipientId', onDelete: 'CASCADE' });
User.hasMany(Notification,   { as: 'notifications',  foreignKey: 'recipientId' });

module.exports = { User, Topic, Notification };
