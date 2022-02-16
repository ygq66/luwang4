import React from 'react'

let modelService = {
  createModel(map, obj) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        map.OverLayerCreateObject(obj, res => {
          resolve(res)
        })
      }, 100)
    })
  },
  // 删除模型
  removeObjWithTimeout(id, t = 500) {
    setTimeout(() => {
      React.$map_light.OverLayerRemoveObjectById(id)
    }, t)
  },
  // 隐藏模型
  hideModel(map, mos) {
    for (const mo of mos) {
      map.UpdateObjectVisible(mo.gid, false);
      mo.attr.visible = false;
    }
  },
  findObjectById(view3d, gid) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        view3d.FindObjectById(gid, res => {
          resolve(res)
        })
      }, 100)
    })
  },
  // 辅助工具
  helperShapeUtil: {
    mo: null,
    // 绘制辅助工具
    createHelperShape(map, location = {x: 0, y: 0, z: 0}) {
      this.mo = {
        gid: "HELP", // 自定义gid，可以设置自定义前缀，用于点选匹配不同的对象
        type: 'cone',
        style: 'SplineOrangeHighlight1',
        radius: 2000.0,    // 半径
        height: 2200.0,    // 高
        // style: 'red',  // style 样式优先于color
        color: '#FF0000',
        location: location
      };
      modelService.createModel(map, this.mo).then(r => {});
    },
    getHelperShape() {
      return this.mo;
    },
    refreshHelperShapePos(map, pos) {
      let shape = this.getHelperShape()
      // console.log(shape)
      if (shape && pos && window.$map_light) {
        shape.location = pos;
        shape.location.pitch = 180;
        window.$map_light.OverLayerUpdateObject(shape);
      } else {
        this.createHelperShape(map, pos);
      }
    }
  },
  flyTo(map, pos) {
    map.FlyToPosition(pos)
  }
}
export default modelService