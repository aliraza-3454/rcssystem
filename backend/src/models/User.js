'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  // Using STRING instead of ENUM - SQL Server Express compatible
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'student',
    validate: {
      isIn: [['student', 'supervisor', 'admin']],
    },
  },
  regNo: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING(150),
    allowNull: true,
    defaultValue: 'Computer Science',
  },
  // Store JSON array as TEXT (SQL Server compatible)
  expertise: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('expertise');
      try { return raw ? JSON.parse(raw) : []; }
      catch { return []; }
    },
    set(val) {
      if (Array.isArray(val)) {
        this.setDataValue('expertise', JSON.stringify(val));
      } else if (typeof val === 'string') {
        // Accept comma-separated string too
        this.setDataValue('expertise', JSON.stringify(
          val.split(',').map(s => s.trim()).filter(Boolean)
        ));
      } else {
        this.setDataValue('expertise', '[]');
      }
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'Users',
  timestamps: true,   // adds createdAt, updatedAt
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

User.prototype.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
