import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Click = sequelize.define('Click', {
  referrer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});