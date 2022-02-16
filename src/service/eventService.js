import settingService from "./settingService"
import React from 'react'

const ipcRenderer = require('electron').ipcRenderer;
ipcRenderer.on('openFileList', function (event, arg) {
  console.log('openFileList', arg); // prints "pong"
  let isShowLeftList = settingService.getState('isShowLeftList');
  settingService.setStateByObj({isShowLeftList: !isShowLeftList});
});


ipcRenderer.on('changePage', function (event, arg) {
  console.log('切换界面', arg);
  React.$history.push(arg);
});

