let LogService = require('../mainService/logService')
const {QueryTypes} = require("sequelize");
module.exports = {
  dbConfig: {
    user: 'postgres', pwd: 'TYAIMAP', ip: '10.28.6.24', dbName: 'LXFmap'
  },
  getConnection() {
    const {Sequelize} = require('sequelize');
    // 方法 1: 传递一个连接 URI
    const sequelize = new Sequelize(`postgres://${this.dbConfig.user}:${this.dbConfig.pwd}@${this.dbConfig.ip}:5432/${this.dbConfig.dbName}`, {
      // 选择一种日志记录参数
      logging: (msg) => {
        LogService.getLogger().info(msg);
      }, // 默认值,显示日志函数调用的第一个参数
    }) // Postgres 示例
    return sequelize;
  },
  async testConnection(con) {
    try {
      await con.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  },
  async querySql(sql) {
    console.log('查询数据中', sql)
    const sequelize = this.getConnection()
    const {QueryTypes} = require('sequelize');
    return await sequelize.query(sql, {type: QueryTypes.SELECT});
  }
}

