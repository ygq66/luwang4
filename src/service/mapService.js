import fileService from "./fileService";
import configService from "./configService";

let mapService = {
  // 刷新楼层信息到配置文件
  refreshFloorInfoToSetting() {
    let configStr = fileService.readFileSync(configService.configPath)
    console.log(configStr)
  },
  setMousePositionCallbackOnce(map) {
    return new Promise(resolve => {
      map.SetMousePositionCallback((res) => {
        console.log('鼠标点选位置', res)
        map.SetMousePositionCallback(null)
        resolve(res);
      })
    })
  },
  setMouseCallbackOnce(map, cb) {
    return new Promise(resolve => {
      map.SetMouseCallback((res) => {
        console.log('鼠标点选', res)
        map.SetMouseCallback(null)
        resolve(res);
      })
    })
  }
}

export default mapService;