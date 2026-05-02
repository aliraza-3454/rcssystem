'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Topic = sequelize.define('Topic', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // JSON array stored as TEXT - SQL Server compatible
  keywords: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('keywords');
      try { return raw ? JSON.parse(raw) : []; }
      catch { return []; }
    },
    set(val) {
      if (Array.isArray(val)) {
        this.setDataValue('keywords', JSON.stringify(val));
      } else if (typeof val === 'string') {
        this.setDataValue('keywords', JSON.stringify(
          val.split(',').map(s => s.trim()).filter(Boolean)
        ));
      } else {
        this.setDataValue('keywords', '[]');
      }
    },
  },
  domain: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  supervisorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Users', key: 'id' },
  },
  // STRING instead of ENUM
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'approved', 'rejected', 'revision']],
    },
  },
  supervisorFeedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  similarityScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'Topics',
  timestamps: true,
});

module.exports = Topic;
