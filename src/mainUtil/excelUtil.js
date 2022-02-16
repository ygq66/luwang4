let xlsx = require('node-xlsx');
let fs = require('fs');
let logService = require('../mainService/logService')
module.exports = {
  readExcel(fpath) {
    // let str = fs.readFileSync(fpath, {encoding: 'utf-8'})
    // let buffer = Buffer.from(str, 'utf-8')
    // logService.getLogger().info(buffer.toString())
    // // 读xlsx
    // let obj = xlsx.parse(
    //   buffer, {codepage: 936, type: 'buffer'}
    // );
    // console.log('读取excel成功', JSON.stringify(obj))
    let obj = xlsx.parse(fpath)
    return obj
  }
}