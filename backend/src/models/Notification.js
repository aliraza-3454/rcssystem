'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // STRING instead of ENUM
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'info',
    validate: {
      isIn: [['info', 'success', 'warning', 'error']],
    },
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'Notifications',
  timestamps: true,
});

module.exports = Notification;
