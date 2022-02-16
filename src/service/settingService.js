import React from 'react'

let settingService = {
  settingSync: '', // 同步的setting
  getSettingArr() {
    return React.$store.getState().setting;
  },
  getSetting(name) {
    this.settingSync = React.$store.getState().setting
    return this.settingSync.filter(x => x.key === name)[0]
  },
  setSetting(name, value) {
    let settingObj = settingService.getSetting(name);
    settingObj.value = value;
    React.$store.dispatch({type: 'simple', setting: [...settingService.getSettingArr()]});
  },
  // 改变store
  setState(name, value) {
    let obj = {type: 'simple'};
    obj[name] = value;
    React.$store.dispatch(obj);
  },
  // 改变store
  setStateByObj(obj) {
    obj.type = 'simple';
    React.$store.dispatch(obj);
  },
  getState(name) {
    return React.$store.getState()[name]
  },
}
export default settingService;