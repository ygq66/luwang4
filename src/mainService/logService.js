const path = require('path');
const log4js = require('log4js');
let exePath = require('electron').app.getAppPath()

module.exports = {
  setup() {
    log4js.configure({
      replaceConsole: true,
      pm2: true,
      appenders: {
        stdout: {//控制台输出
          type: 'console'
        },
        req: {  //请求转发日志
          type: 'dateFile',    //指定日志文件按时间打印
          filename: path.join(exePath, 'logs/reqlog/req'),  //指定输出文件路径
          pattern: 'yyyy-MM-dd.log',
          alwaysIncludePattern: true
        },
        err: {  //错误日志
          type: 'dateFile',
          filename: path.join(exePath, 'logs/errlog/err'),
          pattern: 'yyyy-MM-dd.log',
          alwaysIncludePattern: true
        },
        oth: {  //其他日志
          type: 'dateFile',
          filename: path.join(exePath, 'logs/othlog/oth'),
          pattern: 'yyyy-MM-dd.log',
          alwaysIncludePattern: true
        }

      },
      categories: {
        //appenders:采用的appender,取appenders项,level:设置级别
        default: {appenders: ['stdout', 'req'], level: 'debug'},
        err: {appenders: ['stdout', 'err'], level: 'error'},
      }
    });
  },
  getLogger(name) {//name取categories项
    return log4js.getLogger(name || 'default')
  }
}