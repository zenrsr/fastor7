const sequelize = require('../config/database');
const Employee = require('./employee');
const Enquiry = require('./enquiry');

Employee.hasMany(Enquiry, {
  foreignKey: 'counselorId',
  as: 'enquiries',
});

Enquiry.belongsTo(Employee, {
  foreignKey: 'counselorId',
  as: 'counselor',
});

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (error) {
    console.error('Database init failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Employee,
  Enquiry,
  initDatabase,
};
