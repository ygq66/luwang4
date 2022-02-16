const {app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
let mainWindow = null;
// 判断命令行脚本的第二参数是否含--debug
const isDev = require('./src/mainService/isDev');
const expressService = require('./src/mainService/expressService');
const cmdService = require('./src/mainService/cmdService');
const logService = require('./src/mainService/logService');
const excelUtil = require('./src/mainUtil/excelUtil');
const pgHelper = require('./src/mainDao/pgHelper');

function createWindow() {
  const windowOptions = {
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true,
      // 官网似乎说是默认false，但是这里必须设置contextIsolation
      contextIsolation: false,
      webSecurity: false, // 安全策略
    },
    titleBarOverlay: {
      color: '#2f3241',
      symbolColor: '#74b1be'
    }
  };

  mainWindow = new BrowserWindow(windowOptions);
  require('@electron/remote/main').initialize()
  require("@electron/remote/main").enable(mainWindow.webContents)

  let template = [
    {
      label: '设置',
      submenu: [
        {
          label: '打开配置',
          click: () => {
            console.log(`notepad ${app.getAppPath() + '\\config.json'}`)
            cmdService.runExec(`notepad ${app.getAppPath() + '\\config.json'}`)
          }
        },
        {
          label: '初始化配置并刷新',
          click: () => {
            let path = app.getAppPath() + '\\config.json';
            if (fs.existsSync(path) === true) {
              fs.unlinkSync(path);
              mainWindow.reload();
            }
          }
        },
        {
          accelerator: 'F12',
          label: '调试',
          click: () => {
            mainWindow.webContents.openDevTools();
          }
        },
        {
          accelerator: 'F5',
          label: '刷新',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: '文件列表',
          click: () => {
            console.log('mainWindow', mainWindow);
            mainWindow.webContents.send('openFileList');
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '测试页面',
          click: () => {
            mainWindow.webContents.send('changePage', '/test');
          }
        },
        {
          label: '路网检查',
          click: () => {
            mainWindow.webContents.send('changePage', '/');
          }
        },
        {
          label: '测试服务',
          click: () => {
            mainWindow.webContents.send('changePage', '/httpServer');
          }
        },
        {
          label: '获取token',
          click: () => {
            mainWindow.webContents.send('changePage', '/getToken');
          }
        },
        {
          label: '获取设备列表',
          click: () => {
            mainWindow.webContents.send('changePage', '/device');
          }
        },
        {
          label: '文件转换',
          click: () => {
            mainWindow.webContents.send('changePage', '/imgConvertor');
          }
        },
      ]
    }
  ]

  // 构建菜单
  let m = Menu.buildFromTemplate(template)
  // 应用菜单
  mainWindow.setMenu(m)
  // Menu.setApplicationMenu(m)

  mainWindow.loadURL(isDev ? 'http://localhost:3001' : url.format({
    pathname: path.join(__dirname, './build/index.html'),
    protocol: 'file:',
    slashes: true
  }))

}

// app主进程的事件和方法
app.on('ready', () => {
  createWindow();
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.expressService = expressService;
app.cmdService = cmdService;
app.logService = logService;
logService.setup()
app.excelUtil = excelUtil;
app.pgHelper = pgHelper;

module.exports = mainWindow;