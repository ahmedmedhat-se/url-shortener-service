import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Url = sequelize.define('Url', {
  originalUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  shortCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});