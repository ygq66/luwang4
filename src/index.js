import React from 'react';
import ReactDOM from 'react-dom';
import {StoreContext} from 'redux-react-hook';
import {HashRouter as Router, Routes, Route,} from 'react-router-dom'

import "antd/dist/antd.css";
import './index.scss';
import reportWebVitals from './reportWebVitals';
import {makeStore} from "./redux/store";
import {message} from 'antd'
import configService from "./service/configService";
import {createHashHistory} from 'history'
import './service/eventService'
import moment from 'moment'

// 页面
import App from './App';
import Test from "./pages/test/test";
import HttpServer from "./pages/httpServer/httpServer";
import GetToken from "./pages/getToken/getToken";
import resolve from "resolve";
import Device from "./pages/device/device";
import ImgConvertor from "./pages/imgConvertor";

React.$store = makeStore();
React.$moment = moment;
React.$message = message;
/**
 * 包装 message 只弹出一次
 * @namespace
 */
React.$messageWrap = {
  msgLast: "",
  /**
   * 成功弹出
   * @function
   * @param msg
   * @param t
   * @returns {Promise<unknown>|MessageType}
   */
  success(msg, t) {
    if (msg !== this.msgLast) {
      this.msgLast = msg;
      return message.success(msg, t)
    } else {
      return new Promise(resolve => {resolve()})
    }
  },
  error(msg, t) {
    if (msg !== this.msgLast) {
      this.msgLast = msg;
      return message.error(msg, t)
    } else {
      return new Promise(resolve => {resolve()})
    }
  }
};
React.$history = createHashHistory();

configService.loadConfig(); // 加载配置

ReactDOM.render(
  <StoreContext.Provider value={React.$store}>
    <React.StrictMode>
      <Router history={React.$history}>
        <Routes>
          <Route path="/" element={<App/>}/>
          <Route path="/test" element={<Test a={1}/>}/>
          <Route path="/httpServer" element={<HttpServer/>}/>
          <Route path="/getToken" element={<GetToken/>}/>
          <Route path="/device" element={<Device/>}/>
          <Route path="/imgConvertor" element={<ImgConvertor/>}/>
        </Routes>
      </Router>
    </React.StrictMode>
  </StoreContext.Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
