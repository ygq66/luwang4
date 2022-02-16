import React from 'react'
import {Model} from "../utils/map3d";
import settingService from "./settingService";
import configService from "./configService";

let luwangService = {
  moId: 0,
  mos: [],
  addPoint2Req(point) {
    point.x = parseFloat((point.x).toFixed(2));
    point.y = parseFloat((point.y).toFixed(2));
    point.z = parseFloat((point.z).toFixed(2));
    let req = settingService.getSetting('luwangReq').value;
    req.start = {...req.end, floor: req.start.floor};
    req.end = {...point, floor:req.end.floor};
    req = {...req}
    console.log('修改全局state, luwangReq', req);
    settingService.setSetting('luwangReq', req);
    configService.refreshConfig();
  },
  getPointColor(dno) {
    switch (dno) {
      case 0:
        return '#fff'
      case 1:
        return '#1a4180'
      case 2:
        return '#1a4180'
      case 3:
        return '#1a4180'
      case 4:
        return '#1a4180'
      case 5:
        return '#1cee70'
      case 6:
        return '#1a4180'
    }

  },
  // 绘制路网
  drawLuwang(objs) {
    if (window.$map_light && objs.length > 0) {
      let drawBoundary = settingService.getState('drawBoundary');
      console.log('获取绘制区域', drawBoundary);
      let mos = [];
      for (const c of objs) {
        if (c.type === 'Feature') {
          let geometry = c.geometry;
          let properties = c.properties;
          // console.log('绘制路线', properties);
          let floorInfo = luwangService.getFloorInfo(properties.FROM_NUM); // 获取楼层高度
          if (!floorInfo) {
            React.$messageWrap.error(`不存在楼层 ${properties.FROM_NUM}, 请在配置中添加, 或者楼层为空.`).then();
            floorInfo = luwangService.getFloorInfo('W1');
          }
          if (geometry.type === 'LineString') {
            let points = geometry.coordinates.map(coor => {
              return {x: coor[0] * 100, y: -coor[1] * 100, z: floorInfo.height}; // 只是平面信息
            });
            // 判断是否在面内
            if (drawBoundary.length < 3
              || (drawBoundary.length > 2 && luwangService.isLineInPolyon(points.map(x => [x.x, x.y]), drawBoundary) === true)) {
              mos.push({
                gid: "LU_LINE_" + this.moId++,
                type: 'linestring',
                color: floorInfo.color,
                linewidth: settingService.getSetting('lineWidth').value,
                points: points,
                attr: properties,
              });
            }
          } else if (geometry.type === 'Point') {
            let point = {
              x: geometry.coordinates[0] * 100,
              y: -geometry.coordinates[1] * 100,
              z: floorInfo.height + 2,
              pitch: 0,   // 俯仰角 0——90度
              yaw: 0,    // 偏航角 0-360度
              roll: 0     // 翻滚角
            }
            // 判断是否在面内
            if (drawBoundary.length < 3
              || (drawBoundary.length > 2 && luwangService.isInPolyon([point.x, point.y], drawBoundary) === true)) {
              mos.push({
                gid: 'LU_POINT_' + this.moId++,
                attr: properties,
                type: 'circle',
                radius: settingService.getSetting('pointR').value,    // 半径
                color: this.getPointColor(properties.DNO),
                location: point,
              })
              if (properties.DNO) {
                mos.push({
                  gid: 'LU_LABEL_' + this.moId++,
                  type: 'label',
                  text: properties.DNO,
                  font: '黑体',
                  fontsize: 200,
                  halign: 'left',  // left center right
                  valign: 'center',  // bottom center top
                  attr: properties,
                  fontcolor: this.getPointColor(properties.DNO),
                  location: {
                    x: geometry.coordinates[0] * 100,
                    y: -geometry.coordinates[1] * 100,
                    z: floorInfo.height,
                    pitch: 0,   // 俯仰角 0——90度
                    yaw: 0,    // 偏航角 0-360度
                    roll: 0     // 翻滚角
                  }
                })
              }
            }
          }
        }
      }
      console.log('绘制模型', mos);
      this.mos = mos;
      Model.batchedAddModel(window.$map_light, mos, 100, () => { })
      // // 创建图层
      // window.$map_light.LayerLoad({
      //   type: 'MLT_LAYER_POS_DYNAMIC', // 普通shape图层
      //   speed: 50, //厘米/秒
      //   shapes: mos
      // }, res => {
      //   console.log('加载图层成功', res);
      // });
    }
  },
  routes: [],
  getRoute() {
    return this.routes;
  },
  // 用于绘制路网
  drawRoute(objs, color = 'green') {
    if (window.$map_light && objs.length > 0) {
      let mos = [];
      let lineWidth = settingService.getSetting('lineWidth').value;
      mos.push({
        gid: "LUWANG_" + this.moId++,
        type: 'linestring',
        // style: color,
        "style": "sim_arraw",
        // color: '#FF0000',
        linewidth: lineWidth + 20,
        points: objs, // {x,y,z}
        attr: objs,
      });
      console.log('绘制模型', mos);
      this.routes = mos;
      settingService.setStateByObj({mapRoute: mos})
      Model.batchedAddModel(window.$map_light, mos, 100, () => { });
    }
  },
  drawPoints(objs, color = '#FF0000') {
    if (window.$map_light && objs.length > 0) {
      let mos = objs.map(x => {
        return {
          attr: {},
          type: 'circle',
          radius: settingService.getSetting('pointR').value,    // 半径
          // style : 'red',
          color: color,
          location: {
            x: x[0],
            y: x[1],
            z: settingService.getSetting('height').value,
            pitch: 0,   // 俯仰角 0——90度
            yaw: 0,    // 偏航角 0-360度
            roll: 0     // 翻滚角
          }
        }
      });
      console.log('绘制模型', mos)
      Model.batchedAddModel(window.$map_light, mos, 100, () => { })
    }
  },
  // 更新路网高度
  heightUpdate(height, floorName) {
    let matchMos = luwangService.getModelByFloor(floorName)
    for (const m of matchMos) {
      if (window.$map_light) {
        if (m.location) {
          m.location.z = height + 2; // 点
        } else if (m.points) {
          m.points.forEach(p => { // 线
            p.z = height;
          })
        }
        window.$map_light.OverLayerUpdateObject(m);
      }
    }
  },
  // 更新路线高度
  updateRouteHeight(height, floor) {
    if (this.routes.length > 0) {
      this.routes[0].attr.forEach(x => {
        if (x.floor === floor) {
          x.z = height;
        }
      })
      window.$map_light.OverLayerUpdateObject(this.routes[0]);
    }
  },
  getModelByFloor(floorName) {
    return this.mos.filter(x => x.attr && x.attr.FROM_NUM === floorName);
  },
  // 获取设置的高度
  getFloorInfo(floorName) {
    let val = settingService.getSetting('heightObj').value;
    return val[floorName] ? val[floorName] : val['W1']
  },
  saveHeightObjByFloorName(floor, height) {
    settingService.getSetting('heightObj').value[floor].height = height;
    settingService.setSetting('heightObj', {...settingService.getSetting('heightObj').value})
  },
  setIsCheckLuwang(isCheck) {
    settingService.setStateByObj({isCheckLuwang: isCheck})
  },
  // 判断点是否在面内
  isInPolyon(poi, poly) {
    // console.log('是否在平面', poly)

    function isRayIntersectsSegment(poi, s_poi, e_poi) {
      //[x,y] [lng,lat]
      // 输入：判断点，边起点，边终点，都是[lng,lat]格式数组
      if (s_poi[1] === e_poi[1]) { // 排除与射线平行、重合，线段首尾端点重合的情况
        return false
      }
      if (s_poi[1] > poi[1] && e_poi[1] > poi[1]) { //线段在射线上边
        return false
      }
      if (s_poi[1] < poi[1] && e_poi[1] < poi[1]) { //线段在射线下边
        return false
      }
      if (s_poi[1] === poi[1] && e_poi[1] > poi[1]) { //交点为下端点，对应spoint
        return false
      }
      if (e_poi[1] === poi[1] && s_poi[1] > poi[1]) { //交点为下端点，对应epoint
        return false
      }
      if (s_poi[0] < poi[0] && e_poi[1] < poi[1]) { //线段在射线左边
        return false
      }
      let xseg = e_poi[0] - (e_poi[0] - s_poi[0]) * (e_poi[1] - poi[1]) / (e_poi[1] - s_poi[1]) //求交
      if (xseg < poi[0]) { //交点在射线起点的左侧
        return false
      }
      return true  // 排除上述情况之后
    }

    //输入：点，多边形三维数组
    //poly=[[[x1,y1],[x2,y2],……,[xn,yn],[x1,y1]],[[w1,t1],……[wk,tk]]] 三维数组

    //可以先判断点是否在外包矩形内
    //if not isPoiWithinBox(poi,mbr=[[0,0],[180,90]]): return False
    //但算最小外包矩形本身需要循环边，会造成开销，本处略去
    let sinsc = 0 //交点个数
    // for (let epoly of poly) { // 循环每条边的曲线->each polygon 是二维数组[[x1,y1],…[xn,yn]]
    //   for (let i = 0; i < epoly.length - 1; i++) {
    //     let s_poi = epoly[i];
    //     let e_poi = epoly[i + 1];
    //     if (isRayIntersectsSegment(poi, s_poi, e_poi) === true) {
    //       sinsc += 1; //有交点就加1
    //     }
    //   }
    // }
    for (let i = 0; i < poly.length - 1; i++) {
      let s_poi = poly[i];
      let e_poi = poly[i + 1];
      if (isRayIntersectsSegment(poi, s_poi, e_poi) === true) {
        sinsc += 1; //有交点就加1
      }
    }

    return sinsc % 2 === 1
  },
  // 判断线是否在面内
  isLineInPolyon(line, poly) {
    return this.isInPolyon(line[0], poly) || this.isInPolyon(line[1], poly);
  },
}

window.luwangService = luwangService;
export default luwangService;