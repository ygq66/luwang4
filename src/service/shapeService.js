import React from 'react'

let shapeService = {
  read(path) {
    let shapefile = require("shapefile");
    let arr = [];
    // console.log('开始读取shape文件成功', path)
    return new Promise((resolve, reject) => {
      shapefile.open(path)
        .then(source => source.read()
          .then(function log(result) {
            if (result.done) {
              // console.log('读取shape文件成功');
              resolve(arr);
              return;
            }
            arr.push(result.value)
            // console.log(result.value);
            return source.read().then(log);
          }))
        .catch(error => console.error(error.stack));

    })
  },
  add(arr) {
    let state = React.$store.getState();
    React.$store.dispatch({type: 'simple', objs: state.objs.concat(arr)})
  },
  // 获取svg中的模型
  getObjs() {
    return React.$store.getState().objs;
  },
  save(arr) {
    React.$store.dispatch({type: 'simple', objs: arr});
  },
  clear() {
    React.$store.dispatch({type: 'simple', objs: []})
  },
  toTable(arr) { // shape文件转表格形式
    let dataS = arr.map((x, i) => {
      let arr = [];
      let fileFloor = this.getFloorInfoByPath(x.filePath)

      // 获取属性, 添加到表格列表
      function addCol(pros) {
        // Object.keys(pros).forEach(k => {
        //   let existsCol = columns.filter(c => c.dataIndex === k);
        //   if (existsCol.length === 0) {
        //     let width = 80;
        //     switch (k) {
        //       case "":
        //         width = 120
        //     }
        //     columns.push({key: k, dataIndex: k, title: k, width: width})
        //   }
        // })
      }

      if (x.geometry.type === 'LineString') {
        arr = x.geometry.coordinates.map(c => {
          let item = [];
          item[0] = parseFloat(c[0].toFixed(2));
          item[1] = parseFloat(c[1].toFixed(2));
          return item;
        });
        addCol(x.properties)
        return {
          ...x.geometry, key: i, coorStr: JSON.stringify(arr), ...x.properties
          , LEVEL: (x.properties.LEVEL && x.properties.LEVEL.length > 5) ? '' : x.properties.LEVEL, filePath: x.filePath, project: fileFloor.project, fileFloor: fileFloor.floor, fileBuild: fileFloor.build
        }
      } else if (x.geometry.type === 'Point') {
        // x.geometry.coordinates[0] = parseFloat(x.geometry.coordinates[0].toFixed(2));
        // x.geometry.coordinates[1] = parseFloat(x.geometry.coordinates[1].toFixed(2));
        // 获取属性, 添加到表格列表
        addCol(x.properties);
        arr = [Number(x.geometry.coordinates[0].toFixed(2)), Number(x.geometry.coordinates[1].toFixed(2))]
        return {
          ...x.geometry, key: i, coorStr: JSON.stringify(arr), ...x.properties
          , LEVEL: (x.properties.LEVEL && x.properties.LEVEL.length > 5) ? '' : x.properties.LEVEL
          , filePath: x.filePath
          , project: fileFloor.project
          , fileFloor: fileFloor.floor
          , fileBuild: fileFloor.build
        }
      } else {
        return null;
      }
    }).sort((a, b) => a.coordinates[0][0] - b.coordinates[0][0]);

    dataS.forEach(x => {
      if (x.LENGTH) {
        x.LENGTH = parseFloat(x.LENGTH.toFixed(2))
      }
    })
    return dataS;
  },
  // 通过路径获取建筑, 楼层id
  getFloorInfoByPath(path) {
    let match = /.*\\(.*)\\(SW)\\.*[\w]+[.]shp/.exec(path);
    let matchSN = /.*\\(.*)\\SN\\([\w][\d]+)\\[\w]+[.]shp/.exec(path);
    let matchSNMoreBuilding = /.*\\(.*)\\SN\\([\d]+)\\([\w][\d]+)\\[\w]+[.]shp/.exec(path);
    // /.*\\(SW)\\([\w][.]shp)/.exec('D:\Develop\Document\luwang\luwang\枣庄学院路网1111\SW\ARC.shp')
    if (match && match[1] && match[2] === 'SW') {
      return {project: match[1], build: 'W1', floor: 'W1'};
    } else if (matchSN && matchSN[1] && matchSN[2]) {
      return {project: matchSN[1], build: 1, floor: matchSN[2]};
    } else if (matchSNMoreBuilding && matchSNMoreBuilding[1] && matchSNMoreBuilding[2] && matchSNMoreBuilding[3]) {
      return {project: matchSNMoreBuilding[1], build: matchSNMoreBuilding[2], floor: matchSNMoreBuilding[3]};
    }
  },
}

export default shapeService;