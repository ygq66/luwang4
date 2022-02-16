const {exec} = require('child_process')

let cmdService = {
  runExec(cmdStr, callback) {
    let workerProcess = exec(cmdStr, {});
    // 打印正常的后台可执行程序输出
    workerProcess.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
      callback && callback(data);
    });
    // 打印错误的后台可执行程序输出
    workerProcess.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
    // 退出之后的输出
    workerProcess.on('close', function (code) {
      console.log('out code：' + code);
    });
  }
}

module.exports = cmdService