import {createMap, Event, Model} from './map3d';

export const Common = {
  //格式化坐标
  filter(value) {
    return value ? parseInt(value) : 0;
  },
  //飞行定位
  mapFly(map, data) {
    createMap.FlyToPosition(map, {
      x: Common.filter(data.center.x),
      y: Common.filter(data.center.y),
      z: Common.filter(data.center.z),
      pitch: Common.filter(data.center.pitch),
      yaw: Common.filter(data.center.yaw),
      roll: Common.filter(data.center.roll)
    })
  },
  //飞行定位2
  mapFly2(map, data) {
    createMap.FlyToPosition(map, {
      x: -3237.720703125,
      y: 9709.26953125,
      z: 9782.849609375,
      pitch: 50.181209564208984,
      yaw: -88.37496948242188,
      roll: 0.0017332484712824225
    })
  },

  removeModel(source) {
    const map = createMap.getMapView()
    source.forEach(model => map.OverLayerRemoveObjectById(model.gid))
  },

  //往地图递归添加图标
  add_iconModel(index, data, map3d) {
    let iccon = data[index].model_name + "_icon"
    if (data[index].model_name === null) {
      iccon = "menjin_icon"
    }
    Model.createIcon(map3d, {
      typeStyle: iccon,
      attr: data[index],
      location: {
        x: Common.filter(data[index].center.x),
        y: Common.filter(data[index].center.y),
        z: Common.filter(data[index].center.z),
        pitch: Common.filter(data[index].center.pitch),
        yaw: Common.filter(data[index].center.yaw),
        roll: Common.filter(data[index].center.roll)
      }
    }, (msg) => {
      if (++index < data.length) {
        setTimeout(() => {
          Common.add_iconModel(index, data, map3d)
        })
      } else {
        console.log('图标模型加载完毕')
        Model.getModel(map3d);
      }
    })
  },
  //导航地图效果清除
  navigationClose(map3d) {
    Model.closeIcon(map3d);
    Event.clearPatrolPath(map3d);
    Model.getModel(map3d);
  }
}