import shapeService from "./shapeService";
import fs from "fs";

let fileService = {
  getAll: function (level, dir, filterStr = '') {
    let path = require('path');
    let fs = require('fs');
    let filesNameArr = []

    function readdirs(dir, filterStr) {
      let result = { //构造文件夹数据
        key: dir,
        title: path.basename(dir),
        type: 'directory',
      }
      let files = fs.readdirSync(dir) // 同步拿到文件目录下的所有文件名
      files = files.filter(x => {
        let subPath = path.join(dir, x) // 拼接为相对路径
        let stats = fs.statSync(subPath) // 拿到文件信息对象
        if (stats.isDirectory()) {
          return fs.existsSync(subPath);
        } else {
          // console.log('过滤', x, new RegExp(filterStr).test(x))
          return new RegExp(filterStr).test(x) === true && fs.existsSync(subPath);
        }
      }) // 过滤文件

      // console.log('过滤后文件', files)
      result.children = files.map(function (file) {
        //var subPath = path.resolve(dir, file) //拼接为绝对路径
        let subPath = path.join(dir, file) //拼接为相对路径

        let stats = fs.statSync(subPath) //拿到文件信息对象
        if (stats.isDirectory()) { //判断是否为文件夹类型
          return readdirs(subPath, filterStr) //递归读取文件夹
        }
        return { //构造文件数据
          key: subPath,
          title: file,
          type: 'file'
        }
      })
      return result //返回数据
    }

    filesNameArr.push(readdirs(dir, filterStr))
    return filesNameArr
  },
  // 读取所有checkbox
  readFileAll(idx, res, files) {
    return new Promise((resolve, reject) => {
      let path = files[idx]
      shapeService.read(path).then(function getArr(arr) {
        arr.forEach(x => {x.filePath = path}); // 保存文件路径
        res = res.concat(arr);
        idx++;
        if (idx === files.length) {
          resolve(res);
        } else {
          path = files[idx];
          return shapeService.read(path).then(getArr);
        }
      });
    })
  },
  readFileSync(filePath, code = 'utf8') {
    let fs = require('fs');
    let data = fs.readFileSync(filePath, code);
    return data
  },
  /**
   * 读取文件
   * @param dir
   * @returns {string[]}
   */
  listFiles(dir) {
    let files = fs.readdirSync(dir);
    return files;
  },
  writeFileSync(filePath, txt) {
    let fs = require('fs');
    //同步方法
    fs.writeFileSync(filePath, txt);
  },
  existsSync(filePath) {
    let fs = require('fs');
    //同步方法
    return fs.existsSync(filePath);
  },
  removeSync(filePath) {
    let fs = require('fs');
    // 同步方法
    return fs.unlinkSync(filePath);
  },
  mkdirSync(filePath) {
    let fs = require('fs');
    // 同步方法
    return fs.mkdirSync(filePath);
  }

}

export default fileService;