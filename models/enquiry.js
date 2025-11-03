const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enquiry = sequelize.define('Enquiry', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  courseInterest: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'course_interest',
  },
  claimed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  counselorId: {
    type: DataTypes.INTEGER,
    field: 'counselor_id',
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id',
    },
  },
}, {
  tableName: 'enquiries',
  underscored: true,
});

module.exports = Enquiry;
