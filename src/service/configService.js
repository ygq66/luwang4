import fileService from "./fileService";
import React from 'react'
import settingService from "./settingService";
import utils, {formatJSON} from "../utils/untils";

const {app} = require('@electron/remote')
const path = require('path');


let configService = {
  exePath: app.getAppPath(),
  configPath: path.join(app.getAppPath(), '/config.json'),
  existsConfig() {
    return fileService.existsSync(configService.configPath);
  },
  loadConfig() {
    // console.log('文件路径', electron)
    if (this.existsConfig(this.configPath) === true) {
      let data = fileService.readFileSync(this.configPath)
      let config = JSON.parse(formatJSON(data))
      settingService.setStateByObj({setting: config});
    } else {
      this.createConfig();
    }
  },
  initConfig() {
    fileService.removeSync(this.configPath);
  },
  createConfig() {
    this.refreshConfig();
  },
  /**
   * 刷新配置到本地文件
   */
  refreshConfig() {
    let setting = JSON.parse(JSON.stringify(React.$store.getState().setting))
    setting.forEach(x => {
      if (x.type === 'object') {
        x.valueStr = "";
      }
    })
    configService.refreshConfigByArr(setting)
    // 2022-1-13 20:42:35
    // fileService.writeFileSync(this.configPath, utils.beautifyJSON(JSON.stringify(setting)));
  },
  refreshConfigByArr(arr) {
    let setting = [...arr]
    setting.forEach(x => {
      if (x.type === 'object') {
        x.valueStr = "";
      }
    })
    fileService.writeFileSync(this.configPath, utils.beautifyJSON(JSON.stringify(setting)));
  }


}

export default configService;