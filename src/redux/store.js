import {createStore} from 'redux';
import reducer from './reducers';


export function makeStore() {
  return createStore(reducer, {
    objs: [],
    setting: [
      {
        key: 'mapObj', value: {
          id: "mapvision3d",
          url: "http://127.0.0.1:19901/aimapvision3d",
          projectId: "2e437e5c3d9c43158ad3c64f28ef1c4c",
          token: "c29b3043e2245e7d80128a795bc4db5a"
        }, valueStr: '', type: 'object'
      },
      {key: 'height', value: 3000, valueStr: 3000, type: 'number'},
      {key: 'pointR', value: 20, valueStr: 20, type: 'number'},
      {key: 'lineWidth', value: 12, valueStr: 12, type: 'number'},
      {key: 'helperHeight', value: 8000, valueStr: 8000, type: 'number'},
      {key: 'unConnectedDistance', value: 0.4, valueStr: 0.4, type: 'number'}, // 非连通的距离
      {
        key: 'luwangReq', value: {
          "start": {"floor": "W1", "id": 0, "x": 0, "y": 0, "z": 0}
          , "end": {"floor": "W1", "id": 0, "x": 0, "y": 0, "z": 0}
          , "project": "mv_hz_ns",
        }, valueStr: 8000, type: 'object'
      },
      {
        key: 'rootUrl', value: 'http://127.0.0.1:19901/aimapvision3d', valueStr: 'http://127.0.0.1:19901/aimapvision3d', type: 'string'
      },
      {
        key: 'heightObj', value: {
          "B1": {
            "height": -100,
            "color": "#2a5d6a"
          },
          "B2": {
            "height": -100,
            "color": "#2a5d6a"
          },
          "B3": {
            "height": -100,
            "color": "#2a5d6a"
          },
          "B4": {
            "height": -100,
            "color": "#2a5d6a"
          },
          "W1": {
            "height": 24.1943359375,
            "color": "#45f0f4"
          },
          "F1": {
            "height": 24.1943359375,
            "color": "#ff0000"
          },
          "F2": {
            "height": 410.999755859375,
            "color": "#27bff1"
          },
          "F3": {
            "height": 811.000244140625,
            "color": "#1a4180"
          },
          "F4": {
            "height": 700,
            "color": "#686669"
          },
          "F5": {
            "height": 1610.99951171875,
            "color": "#42ff35"
          },
          "F6": {
            "height": 900,
            "color": "green"
          },
          "F7": {
            "height": 1000,
            "color": "green"
          },
          "F8": {
            "height": 1100,
            "color": "green"
          },
          "F9": {
            "height": 1100,
            "color": "green"
          },
          "F10": {
            "height": 1100,
            "color": "green"
          },
          "F11": {
            "height": 1100,
            "color": "green"
          },
          "F12": {
            "height": 1100,
            "color": "green"
          },
          "F13": {
            "height": 1100,
            "color": "green"
          },
          "F14": {
            "height": 1100,
            "color": "green"
          },
          "F15": {
            "height": 1100,
            "color": "green"
          },
          "F16": {
            "height": 1100,
            "color": "green"
          },
          "F17": {
            "height": 1100,
            "color": "green"
          },
          "F18": {
            "height": 1100,
            "color": "green"
          },
          "F19": {
            "height": 1100,
            "color": "green"
          }
        }, valueStr: 8000, type: 'object'
      },
      {key: 'authorization', value: '', valueStr: '', type: 'string'},
      {key: 'license', value: '', valueStr: '', type: 'string'},
    ],
    mapRoute: [],
    svgItemGroup: {}, // 全局的svg id
    isShowLeftList: true,
    drawBoundary: [],
    authorization: '', // 登录验证码
    license: '',
  })
}