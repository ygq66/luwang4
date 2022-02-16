import axios from "axios"
import {Common} from './mapMethods'

var createObj = null;
var Polygon = null;
var paopao = []; //气泡gid
let mapView = null
//创建地图类
export const createMap = {
  getMapView() {
    return mapView
  },
  createMap(options, callback) {
    //创建实例
    /* global MapVision */
    let view3d = new MapVision.View3d({
      id: options.id,
      url: options.url,
      projectId: options.projectId,
      token: options.token
    });
    view3d.Open(res => {
      console.log("MapVision View3d " + JSON.stringify(res))
      createMap.closeWkWang(view3d);
      view3d.OverLayerRemoveAll();
      createObj = null;
      view3d.OverLayerStopEdit();
      view3d.SetNorthControl(true, 0, 0, 0.5);
      mapView = view3d
      mapView.__success__ = true
      if (callback) {
        callback();
      }
    });
    //延迟执行
    setTimeout(function () {
      SetResolution(options, view3d);
    }, 5000);

    window.onkeydown = function (event) {
      if (event.code === "F11") {
        setTimeout(function () {
          SetResolution(options, view3d);
        }, 500);
      }
      if (event.code === "F5") {
        window.location.reload();
      }
      if (event.code === 'F10') {
        console.log('重新布局')
        SetResolution(options, view3d);
      }
    }
    return view3d;
  },
  closeAll(view3d) {
    if (view3d) {
      view3d.OverLayerRemoveAll();
    }
  },
  //设置屏幕
  SetResolution(id, view3d) {
    if (view3d) {
      let divObj = document.getElementById(id);
      if (!divObj) {
        alert("error");
        return;
      }
      let width = divObj.clientWidth;
      let height = divObj.clientHeight;
      view3d.SetResolution(width, height);
    }
  },
  // 获取当前视角位置
  getCurrent(view3d, callback) {
    view3d.GetCurrentPosition(pos => {
      let strPos = JSON.stringify(pos);
      callback(strPos);
    })
  },
  // 点击获取坐标值
  getMousePosition(view3d, callback) {
    view3d.SetMousePositionCallback(res => {
      let data = {
        switchName: 'MousePosition',
        Personnel: res
      }
      window.parent.postMessage(data, '*');
      if (callback) {
        callback(res)
      }
    });
  },
  //返回初始位置
  initialPosition(view3d) {
    view3d.ResetHome();
  },
  eanbleKeyboard(view3d) {
    if (view3d) {
      view3d.enableKeyboard = false;
      view3d.enableMouse = true;
    }
  },
  //飞到位置点
  FlyToPosition(view3d, pos) {
    // const pos = {
    //     x : -4843.27783203125,
    //     y : 2181.056640625,
    //     z : 2000,
    //     pitch : 90,  // 俯仰角 0——90度
    //     yaw : 0,   // 偏航角 0-360度
    //     roll : 0     // 翻滚角
    // };
    view3d.FlyToPosition(pos);
  },
  flawto(view3d, location) {
    const pos = {
      x: location.x,
      y: location.y,
      z: location.z,
      pitch: 0, // 俯仰角 0——90度
      yaw: location.yaw, // 偏航角 0-360度
      roll: 0 // 翻滚角
    };

    view3d.FlyToPosition(pos);
  },
  // 根据id查找对象
  findObjectById(view3d, gid, callback) {
    // 注意,此功能为异步操作
    // FindObjectByName  同  FindObjectById  一样功能
    view3d.FindObjectById(gid, res => {
      if (callback) {
        callback(res);
      }
    });
  },
  // 删除所有外壳炫光----呼和浩特定制
  closeWkWang(view3d) {
    for (let i = 0; i <= 22; i++) {
      Model.showModel(view3d, "FW_V001_JZ00" + (i < 10 ? "0" + i : i) + "_WK", false);
    }
  },

  // closeWkWangTwo(view3d) {
  //     console.log("111")
  //     Model.showModel(view3d, "FW_V001_JZ0001_WK", false);
  // }
  //地面显示隐藏
  showDM(groundVisible, view3d) {
    groundVisible = !groundVisible;
    view3d.SetGroundVisible(groundVisible);
  }
}
//模型标注类
export const Model = {
  //创建模型
  creatmodel(view3d, videoType, callback) {
    var obj = {
      type: 'model',
      filename: videoType.fileName, // box, capsule, cone, cube, cylinder, pipe, pyramid, sphere, capsule
      radius: 1,
      scale: 1,
      attr: videoType.attr
    }
    view3d.OverLayerStartEdit(obj, res => {
      var strObj = JSON.stringify(res);
      createObj = res;
      // var myDate = new Date()
      view3d.OverLayerStopEdit();
      // return strObj
      callback(strObj)
    });
  },
  //模型高亮
  modelHighlight(view3d, gid) {
    view3d.SetObjectHighlight(gid);
  },
  //去除地图高亮
  clearHighlight(view3d) {
    view3d.ClearHighlight();
  },
  //关闭编辑
  endEditing(view3d) {
    view3d.OverLayerStopEdit();
  },
  // 删除圆
  closeCircle(view3d) {
    var types = [10302];
    view3d.OverLayerRemoveAll(types);
  },
  // 绘制折线
  drawLine(view3d, callback) {
    const obj = {
      type: 'linestring',
      color: '#ff0f00',
      points: []
    };
    view3d.OverLayerStartEdit(obj, res => {
      if (callback) {
        callback(res);
      }
    });
  },
  // 删除折线
  closeLine(view3d) {
    var types = [10200];
    view3d.OverLayerRemoveAll(types);
  },
  //修改坐标
  modify(view3d, locations) {
    if (!createObj) {
      // alert("请先创建对象！");
      return;
    }
    var location = {
      x: locations.x,
      y: locations.y,
      z: locations.z,
      pitch: 0,
      yaw: locations.yaw,
      roll: 0
    }
    createObj.location = location
    view3d.OverLayerUpdateObject(createObj);
  },
  //删除所有模型
  allmove(view3d) {
    view3d.OverLayerRemoveAll();
    // createObj = null;
    // view3d.OverLayerStopEdit();
  },
  //加载模型
  modelLoading(view3d, strObj, callback) {
    var obj = {
      gid: strObj.gid,
      type: 'model',
      filename: strObj.filename, // box, capsule, cone, cube, cylinder, pipe, pyramid, sphere, capsule
      radius: 1,
      scale: 1,
      attr: strObj.attr,
      name: strObj.name || '',
      location: {
        x: strObj.location.x,
        y: strObj.location.y,
        z: strObj.location.z,
        pitch: 0,
        yaw: strObj.location.yaw,
        roll: 0
      }
    }

    // 注意,此功能为异步操作
    view3d.OverLayerCreateObject(obj, res => {
      callback && callback(res)
    })
  },

  addImageLabel(mapView, config, callback) {
    var obj = {
      gid: config.gid,
      // filename: config.filename,
      type: 'imagelabel',
      iconstyle: config.iconstyle,
      scale: 1,
      attr: config.attr,
      name: config.name || '',
      location: {
        x: config.location.x,
        y: config.location.y,
        z: config.location.z,
        pitch: 0,
        yaw: config.location.yaw,
        roll: 0
      }
    }
    // 注意,此功能为异步操作
    mapView.OverLayerCreateObject(obj, res => {
      callback(res)
    })
  },

  //加载标注
  labelLoading(view3d, strObj, callback) {
    let obj = {
      type: 'label',
      text: strObj.text,
      font: '黑体',
      fontcolor: strObj.fontcolor,
      fontsize: strObj.fontsize,
      halign: 'center',  // left center right
      valign: 'bottom',  // bottom center top
      location: strObj.location,
      attr: strObj.attr ? strObj.attr : {}
    }
    if (strObj.gid) {
      obj["gid"] = strObj.gid;
    }
    view3d.OverLayerCreateObject(obj, res => {
      //  view3d.SetMouseCallback(null);
      if (callback) {
        callback(res);
      }
    });
  },
  //删除当前模型对象
  delectObj(view3d) {
    view3d.OverLayerRemoveObject(createObj);
    createObj = null;
    view3d.OverLayerStopEdit();
  },
  //创建文本模型
  LabelModel(view3d, strObj, callback) {
    const obj = {
      type: 'label',
      text: strObj.text,
      font: '黑体',
      fontcolor: strObj.color,
      fontsize: strObj.size,
      halign: 'left', // left center right
      valign: 'top' // bottom center top
    };
    view3d.OverLayerStartEdit(obj, res => {
      var strObj = JSON.stringify(res);
      view3d.OverLayerStopEdit();
      if (callback) {
        callback(strObj);
      }
    });
  },
  // 编辑文本模型
  updeteLabelModel(view3d, obj) {
    view3d.OverLayerUpdateObject(obj);
  },
  //绘制面
  playPolygon(view3d, callback) {
    const obj = {
      type: 'polygon',
      color: '#00ff00',
      points: []
    };
    view3d.OverLayerStartEdit(obj, res => {
      var strObj = JSON.stringify(res);
      Polygon = res;
      view3d.OverLayerStopEdit();
      if (callback) {
        callback(strObj);
      }
    });
  },
  //创建面
  createPolygon(view3d, point, callback, Color, style) {
    // 注意,此功能为异步操作
    const obj = {
      type: 'polygon',
      style: style ? style : "",
      color: Color ? Color : '#00ff00',
      points: point
    };
    view3d.OverLayerCreateObject(obj, res => {
      // view3d.SetMouseCallback(null);
      createObj = res;
      var strObj = JSON.stringify(createObj);
      callback(strObj)
    });
  },
  // 创建折线
  createZheLine(view3d, points, callback) {
    const obj = {
      type: 'linestring',
      style: 'red',
      linewidth: 20.0,
      points: points
    };
    view3d.OverLayerCreateObject(obj, res => {
      if (callback) {
        callback(res);
      }
    });
  },
  // 创建线柱子
  createLine(view3d, gid, points, text, fontsize, fontcolor, radius, height) {
    // const obj = {
    //     type: 'linestring',
    //     style: 'SplineOrangeHighlight',
    //     linewidth: 20.0,
    //     points: [points,
    //         {
    //             ...points,
    //             y: points.y + 1,
    //             z: points.z + 2500
    //         }
    //     ]
    // };
    const obj = {
      gid: "BjX_" + gid,
      type: 'cylinder',
      radius: 1000.0, // 半径
      height: 100.0, // 高
      style: 'SplineOrangeHighlight1', // style 样式优先于color
      location: {
        x: points.x,
        y: points.y,
        z: points.z,
        pitch: 0, // 俯仰角 0——90度
        yaw: 0, // 偏航角 0-360度
        roll: 0 // 翻滚角
      }
    };
    view3d.OverLayerCreateObject(obj, res => {
      Model.labelLoading(view3d, {
        gid: "BjZ_" + gid,
        text: text,
        fontcolor: fontcolor ? fontcolor : "#000000",
        fontsize: fontsize ? fontsize : "200",
        location: {
          x: points.x,
          y: points.y,
          z: Number(points.z) + height ? height + 1000 : 4000,
          pitch: 330, // 俯仰角 0——90度
          yaw: 90, // 偏航角 0-360度
          roll: 0 // 翻滚角
        },
      })
    });
  },
  // 创建报警线
  createLineBj(view3d, gid, points, text, fontsize, fontcolor) {
    // let point = Model.calculateCenterPoint(points);
    Model.createLine(view3d, gid, points, text, fontsize, fontcolor)
  },
  // 圆柱和文字
  closeLineAndText(view3d) {
    var types = [10101, 10327];
    view3d.OverLayerRemoveAll(types);
  },
  // 计算中心点公式
  calculateCenterPoint(points) {
    var area = 0.0 // 多边形面积
    var gravityLat = 0.0 // 重心点 latitude
    var gravityLng = 0.0 // 重心点 longitude
    for (let i = 0; i < points.length; i++) {
      let coordinate = points[i];
      // 1
      let lat = coordinate.x
      let lng = coordinate.y
      let nextLat = points[(i + 1) % points.length].x
      let nextLng = points[(i + 1) % points.length].y
      // 2
      let tempArea = (nextLat * lng - nextLng * lat) / 2.0
      // 3
      area += tempArea
      // 4
      gravityLat += tempArea * (lat + nextLat) / 3
      gravityLng += tempArea * (lng + nextLng) / 3
    }
    // 5
    gravityLat = gravityLat / area
    gravityLng = gravityLng / area
    return {
      x: gravityLat,
      y: gravityLng,
      z: points[0].z
    }
  },
  // 报警材质区域面
  createPolygonBj(view3d, point, style) {
    let pointArr = [...point, point[0]];
    (function loop() {
      let G1 = {
        "x": pointArr[0].x,
        "y": pointArr[0].y,
        "z": pointArr[0].z + 5000
      };
      let G2 = {
        "x": pointArr[1].x,
        "y": pointArr[1].y,
        "z": pointArr[1].z + 5000
      };
      let pointArrBj = [pointArr[0], G1, G2, pointArr[1]];
      Model.createPolygon(view3d, pointArrBj, res => {
        pointArr.splice(0, 1);
        if (pointArr.length > 1) {
          loop();
        }
      }, "", style)
    }())
  },
  // 绘制多边形
  playPolygon2(view3d, item, callback) {
    const obj = {
      type: 'polygon',
      color: item.color,
      points: []
    };

    view3d.OverLayerStartEdit(obj, res => {
      var strObj = JSON.stringify(res);
      Polygon = res;
      // console.log(Polygon, strObj);
      view3d.OverLayerStopEdit();
      if (callback) {
        callback(strObj);
      }
    });
  },
  //删除面
  delectPolygon(view3d) {
    if (!Polygon) {
      // alert("请先创建对象！");
      return;
    }

    view3d.OverLayerRemoveObject(Polygon);
    Polygon = null;
    view3d.OverLayerStopEdit();
  },
  // 删除单个覆盖物
  delectMulch(view3d, selObj) {
    if (!selObj) {
      // alert("请先创建/选择对象！");
      return;
    }
    // alert("删除对象：" + selObj.gid);
    view3d.OverLayerRemoveObjectById(selObj.gid);
    // view3d.OverLayerRemoveObject(selObj);
    selObj = null;
  },
  removeGid(view3d, gid) {
    view3d.OverLayerRemoveObjectById(gid);
  },
  // 显示隐藏模型
  showModel(view3d, id, flag) {
    view3d.UpdateObjectVisible(id, flag);
  },
  // 修改模型高亮颜色
  updateModelStyle(view3d, gid, style) {
    view3d.UpdateObjectStyle(gid, style);
  },
  // 修改面
  updatePolygon(view3d, obj, style, color) {
    obj.style = style && style !== "" ? style : null;
    obj.color = color ? color : '#00ff00';
    view3d.OverLayerUpdateObject(obj);
  },
  // 创建图标
  createIcon(view3d, style, callback) {


    // 注意,此功能为异步操作
    const obj = {
      gid: style.gid,
      type: 'image', // 10102  或  image
      style: style.typeStyle,
      scale: style.scale || 1,
      location: {
        x: style.location.x,
        y: style.location.y,
        z: style.location.z + 300,
        pitch: style.location.pitch, // 俯仰角 0——90度
        yaw: style.location.yaw, // 偏航角 0-360度
        roll: style.location.roll // 翻滚角
      },
      attr: style.attr
    };
    view3d.OverLayerCreateObject(obj, res => {
      // console.log(res);
      createObj = res;
      var strObj = JSON.stringify(createObj);
      console.log(strObj);
      callback(res)
    });
  },
  createIconTwo(view3d, style, callback) {
    // 注意,此功能为异步操作
    const obj = {
      type: 'image', // 10102  或  image
      style: style.typeStyle,
      scale: 1,
      gid: style.gid,
      location: {
        x: style.location.x,
        y: style.location.y,
        z: style.location.z,
        pitch: style.location.pitch, // 俯仰角 0——90度
        yaw: style.location.yaw, // 偏航角 0-360度
        roll: style.location.roll // 翻滚角
      }
    };
    view3d.OverLayerCreateObject(obj, res => {
      // console.log(res);
      if (callback) {
        callback(res)
      }
    });
  },
  // 图标清除
  closeIcon(view3d) {
    var types = [10102];
    if (view3d) {
      view3d.OverLayerRemoveAll(types);
    }
  },
  // 泡泡清除
  closeAllPaopao(view3d) {
    if (paopao.length > 0) {
      paopao.forEach(item => {
        Model.removeGid(view3d, item)
      });
      paopao = [];
    }
  },
  // 创建广告牌气泡窗口
  createBillboardBubble(view3d, style) {
    const obj = {
      type: 'webbrowser',
      style: 'white',
      url: style.url,
      billborad: false, // 是否公告板,跟随屏幕旋转
      scale: 1.0, // 缩放比例
      width: style.width, // 宽度（厘米）
      height: style.height, // 高度（厘米）
      pwidth: style.pwidth, // 立柱的宽度（厘米）
      pheight: style.pheight, // 立柱的高度（厘米）
      location: {
        x: style.location.x,
        y: style.location.y,
        z: style.location.z + 100,
        pitch: style.location.pitch, // 俯仰角 0——90度
        yaw: style.location.yaw, // 偏航角 0-360度
        roll: style.location.roll // 翻滚角
      }
    };

    view3d.OverLayerCreateObject(obj, res => {
      paopao.push(res.gid)
    });
  },
  // 创建圆
  creatCircle(view3d, style, callback) {
    // 注意,此功能为异步操作
    const obj = {
      type: 'circle',
      radius: style.radius ? style.radius : 100, // 半径
      // style : 'red',
      color: style.color ? style.color : '#FF0000',
      location: style.location
    };
    view3d.OverLayerCreateObject(obj, res => {
      if (callback) {
        callback(res);
      }
    });
  },

  createModelConfig(data, id = '') {
    let position = data.list_style ? data.list_style : data.center
    return {
      gid: data.gid + '_' + id,
      type: 'model',
      filename: data.model_name, // box, capsule, cone, cube, cylinder, pipe, pyramid, sphere, capsule
      radius: 1,
      scale: 1,
      attr: data,
      name: data.name || '',
      location: {
        x: Common.filter(position.x),
        y: Common.filter(position.y),
        z: Common.filter(position.z),
        pitch: Common.filter(position.pitch),
        yaw: Common.filter(position.yaw),
        roll: Common.filter(position.roll)
      }
    }
  },

  createGanModelConfig(data) {
    let position = data.list_style ? data.list_style : data.center
    return {
      gid: data.gid,
      // type: 'dg', 		    // 10102  或  image
      // iconstyle: "dg", 	// 资源图片里面是否有这个文件
      // // text: "",                   // 文本内容
      // // fontcolor : "#FFFFFF",      // 文本颜色
      // // fontbg : "#ff0000",         // 文本背景颜色
      // // fontsize : 200.0,           // 文本大小
      // style: "white",             // 立柱的颜色样式
      // pwidth : 1,    				      // 立柱的宽度
      // pheight : 300.0, 			      // 立柱的高度
      type: 'model',
      filename: 'ligan', // dg ,dg0,ligan,ligan0
      radius: 1,
      scale: data.scale || 3,
      attr: data,
      location: {
        x: Common.filter(position.x) + 100,
        y: Common.filter(position.y),
        z: Common.filter(position.z) - 800,
        pitch: Common.filter(position.pitch),
        yaw: Common.filter(position.yaw),
        roll: Common.filter(position.roll)
      }
    }
  },

  createImageConfig(data, id = '') {
    let position = data.list_style ? data.list_style : data.center
    return {
      gid: data.gid + '_' + id,
      type: 'image', // 10102  或  image
      style: data.style,
      radius: 1,
      scale: data.scale || 1,
      attr: data,
      name: data.name || '',
      location: {
        x: Common.filter(position.x),
        y: Common.filter(position.y),
        z: Common.filter(position.z) + 150,
        pitch: Common.filter(position.pitch),
        yaw: Common.filter(position.yaw),
        roll: Common.filter(position.roll)
      }
    }
  },

  createCameraModelSource(source) {
    return source.map(data => {
      let isCameraModel = data.category_id === '10001'
      let modelGid = data.model_url
      return {
        ...data,
        gid: isCameraModel ? 'CAMERA_' + modelGid : modelGid
      }
    })
  },

  createCameraIconSource(source) {
    // 主要的几种摄像头和对应图标
    const cameraTypeToIconMap = {
      "banqiu": "banqiu_icon",     // 半球
      "qiangji": 'qiangji_icon',   // 枪机
      "qiuji": 'qiuji_icon'        // 球机
    }
    return source.filter(data => data.category_id === '10001').map(data => ({
      ...data,
      gid: 'ICON_CAMERA_' + data.model_url,
      style: cameraTypeToIconMap[data.model_name]
    }))
  },

  createCameraGanSource(source) {
    return source.map(data => ({
      ...data,
      gid: 'GAN_' + data.gid
    }))
  },

  /**
   * 批量添加模型
   * @param mapV   {Object}
   * @param source {Array}
   * @param size  {Number} 每次最多添加200个。不能再多。多了数据传输会失败。
   * @param cb    {Function}
   */
  batchedAddModel(mapV, source, size = 200, cb) {
    if (!Array.isArray(source)) {
      return
    }
    const sourceSize = source.length
    const addModel = (startOffset, endOffset = 0) => {
      const sourceSlice = source.slice(startOffset, endOffset);
      // 结束绘制
      if (startOffset > sourceSize - 1) {
        console.log('batchedAddModel: ', startOffset, sourceSlice)
        // map.Stop()
        setTimeout(() => {
          cb && cb()
        }, 20);
        return
      }

      // 注意,此功能为异步操作
      setTimeout(() => {
        mapV.OverLayerCreateObjects(sourceSlice, res => {
          console.log('添加成功', res);
        })
        if (startOffset < sourceSize) {
          addModel(endOffset, endOffset + size);
        }
      }, 500);
    }

    addModel(0, size)
  },

  //点击获取当前模型信息
  getModel(view3d, callback) {
    if (!view3d) return;
    view3d.SetMouseCallback(null)

    // 过滤 对象  prefix 对象名称前缀   ，path 路径前缀
    let paramers = {
      prefix: 'V',
      path: '',
      speedroute: 20
    }
    view3d.SetParameters(paramers)
    view3d.SetMouseCallback(res => {
      console.log('鼠标点击事件', res)
      if (callback) {
        callback();
      }
    });
  },
}
// 建筑楼层类
export const Build = {
  getBuild(view3d, callback) {
    view3d.GetBuildingNames(res => {
      var strObj = JSON.stringify(res);
      callback(strObj)
    });
  },
  getFloor(view3d, buildingName, callback) {
    view3d.GetFloorNames(buildingName, res => {
      var strObj = JSON.stringify(res);
      callback(strObj)
    });
  },

  // 楼层显示隐藏
  showFloor(view3d, buildingName, floorName, floor) {
    console.log(buildingName, floorName, floor)

    let floorNum = Number(floorName.substring(floorName.length - 2)) >= 10 ? Number(floorName.substring(floorName.length - 2)) : Number(floorName.slice(-1))
    let FLOOR = floorName.substr(0, 1);

    if (FLOOR === "B") {
      floorNum = -floorNum
    }
    view3d.SetBuildingVisible(buildingName, floorName === "all");

    console.log('判断是楼上楼下', FLOOR);
    if (FLOOR === "B") {
      createMap.showDM(true, view3d);
    } else {
      createMap.showDM(false, view3d);
    }

    Build.showTextLabelOnSelectedFloor(view3d, buildingName, floorName)

    function floorLessEq(f1, f2) {
      let arr = ['B', 'W', 'F']
      let floorFlag1 = f1.substr(0, 1)
      let floorFlag2 = f2.substr(0, 1)

      let floorNum1 = Number(f1.substr(1))
      let floorNum2 = Number(f2.substr(1))

      let floorFlagTmp1 = floorFlag1 === 'M' ? 'F' : floorFlag1
      let floorFlagTmp2 = floorFlag2 === 'M' ? 'F' : floorFlag2

      let floorFlagIdx1 = arr.indexOf(floorFlagTmp1)
      let floorFlagIdx2 = arr.indexOf(floorFlagTmp2)

      if (floorFlagIdx1 !== floorFlagIdx2) {
        return floorFlagIdx1 < floorFlagIdx2
      } else { // 同是地上,地下
        if (floorFlagTmp1 !== 'F') { // 同是地下B, 地面
          return floorNum1 >= floorNum2
        } else { // 同是地上
          if (floorNum1 !== floorNum2) { // 地上楼层不相等
            return floorNum1 < floorNum2
          } else { // 地上楼层相等
            if (floorFlag1 === floorFlag2) { // 完全相等
              return true
            } else {
              return floorFlag1 !== 'M';
            }
          }
        }
      }
    }

    floor.forEach(item => {
      view3d.SetFloorVisible(buildingName, item, floorLessEq(item, floorName));
    })
  },
  // 整个建筑显示隐藏
  allShow(view3d, buildVisible) {
    Build.getBuild(view3d, res => {
      JSON.parse(res).forEach(item => {

        console.log(item);
        view3d.SetBuildingVisible(item.id, buildVisible);
      })
      view3d._command = 100107
      createMap.closeWkWang(view3d)
    })
    //createMap.closeWkWang(view3d)
  },
  // 爆炸分离
  splitBuild(view3d, buildingName, floorHeight) {
    view3d.SplitBuilding(buildingName, floorHeight);
  },
  // 分离恢复
  splitBuildReset(view3d, buildingName) {
    view3d.SplitBuildingReset(buildingName);
  },

  // 显示当前楼层对应的文字标注
  showTextLabelOnSelectedFloor(view3d, buildingName, floorName) {
    // 没有接口来查询文字标签，所以这里直接在地图上查找所有对象。然后过滤出文字标签
    view3d.GetObjectsVisible(res => {
      console.log('获取所有对象', res)
      let allObjects = []

      allObjects = res.slice();
      allObjects.forEach(obj => {
        // 文字标签的GID是这样的形式：Text_JZ0001_F002_5
        if (obj.gid.startsWith('Text')) {
          let gidSplitGroup = obj.gid.split('_')
          let objBuilding = gidSplitGroup[1]; // 根据文字标签的GID提取出对应的建筑ID    如：JZ001
          let objFloor = gidSplitGroup[2]; // 根据文字标签的GID提取出对应的楼层名字ID 如：Foo2
          let visible = false;

          // 判断，文字标签是当前建筑，当前楼层的才显示
          if (objFloor === floorName && objBuilding === buildingName.split('_')[1]) {
            visible = true;
          }
          view3d.UpdateObjectVisible(obj.gid, visible);
        }
      })
    })
  }
}
// 功能块
export const Event = {
  // 获取路网
  LwList: [],
  getLuWang(view3d, data, routeData, project, url, floorHeight) {
    let Luwang = data;
    if (Luwang.length < 2) {
      return;
    }
    let json = {
      "end": {
        "floor": Luwang[1].floor,
        "id": 0,
        "x": Luwang[1].x / 100,
        "y": Luwang[1].y / 100,
        "z": Luwang[1].z / 100
      },
      "project": project,
      "start": {
        "floor": Luwang[0].floor,
        "id": 0,
        "x": Luwang[0].x / 100,
        "y": Luwang[0].y / 100,
        "z": Luwang[0].z / 100
      }
    }
    axios.post(url, json).then(res => {
      if (res.data.msg === "OK") {
        let list = res.data.data;
        list.forEach(msg => {
          let z = Number(msg.floor.slice(-1)) * floorHeight;
          let obj = {
            ...msg,
            x: Number(msg.x) + 120,
            y: Number(msg.y) - 150,
            z: z
          };
          Event.LwList.push(obj);
        });
        Luwang.splice(0, 1);
        if (Luwang.length > 1) {
          Event.getLuWang(view3d, Luwang, routeData, project, url, floorHeight);
        } else {
          let routedata = {
            ...routeData,
            geom: Event.LwList.slice(1, Event.LwList.length - 1)
          };
          console.log(routedata, "routeData")
          view3d.CreateRoute(routedata);
        }
      }
    })
  },
  // 创建路线
  createRoute(view3d, routeData, flag, project, url, floorHeight) {
    Event.LwList = [];
    if (flag) {
      Event.getLuWang(view3d, routeData.geom, routeData, project, url, floorHeight)
    } else {
      view3d.CreateRoute(routeData);
    }
  },
  // 开始迅游
  playPatrolPath(view3d, callback) {
    view3d.PlayRoute(res => {
      // 返回播放结束节点的位置和索引
      if (callback) {
        callback(res);
      }
    });
  },
  // 继续播放
  continuePatrolPath(view3d) {
    view3d.ResumeRoute();
  },
  // 暂停播放
  pausePatrolPath(view3d) {
    view3d.PauseRoute();
  },
  // 停止播放
  stopPatrolPath(view3d) {
    view3d.StopRoute();
  },
  // 路径迅游清除
  clearPatrolPath(view3d) {
    view3d.Clear();
  },
  // 动画暂停
  stopMan(view3d) {
    view3d.Stop();
  },
  // 点线追查
  pointTracing(view3d, pointPosition, callback) {
    const json = {
      radius: 100, // 半径
      color: '#FF0000',
      location: pointPosition
    };
    Model.creatCircle(view3d, json, msg => {
      createMap.getMousePosition(view3d);
      if (callback) {
        callback(msg);
      }
    })
  },
  pointLineTracing(view3d, pointPosition) {

    // if (pointPosition.length > 1) {
    //     const points = pointPosition
    //     Model.createZheLine(view3d, points, msg => {
    //         createMap.getMousePosition(view3d)
    //     });
    // }
  }
}

//设置屏幕
function SetResolution(options, view3d) {
  if (view3d) {
    var divObj = document.getElementById(options.id);
    if (!divObj) {
      alert("error");
      return;
    }
    var width = divObj.clientWidth;
    var height = divObj.clientHeight;
    view3d.SetResolution(width, height);
    // Model.getModel(view3d);
  }
}

window.addEventListener("beforeunload", function () {
  const mapView = createMap.getMapView()
  // Model.closeIcon(mapView);
  Build.allShow(mapView, true);
  mapView.OverLayerRemoveAll()
})