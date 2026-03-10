import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Click = sequelize.define('Click', {
  referrer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default Click;