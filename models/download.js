const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const download = sequelize.define('download',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      fileURL: {
        type: Sequelize.STRING,
        allowNull: false,
      }

});
module.exports=download;