import React, {useEffect, useRef, useState} from 'react'
import Css from './httpServer.module.scss'
import Ainput from "../../component/ainput/ainput";
import configService from "../../service/configService";
import ASelect from "../../component/aselect/aselect";
import fileService from "../../service/fileService";
import utils from "../../utils/untils";
import highlight from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

/**
 * 测试服务
 * @returns {JSX.Element}
 * @constructor
 */
export default function HttpServer() {
  const [path, setPath] = useState('')
  const [files, setFiles] = useState([])
  const [pathSelected, setPathSelected] = useState('')
  const [routes, setRoutes] = useState([
    {route: '/', res: 'helloword', type: 'get', desc: ''}
  ])
  const app = useRef({})
  const [serverStatus, setServerStatus] = useState('已关闭')

  useEffect(() => {
    let filePath = configService.exePath + '\\request'
    setPath(filePath);
    let isExists = fileService.existsSync(filePath)
    console.log('请求文件是否存在', isExists)
    if (isExists === false) {
      fileService.mkdirSync(filePath)
    }
    let fs = fileService.listFiles(filePath)
    console.log('获取所有文件', fs);
    setFiles(fs);

    app.current = require('@electron/remote').app

    window.onbeforeunload = () => {
      close();
      window.onbeforeunload = () => {};
    }

    return () => {
      close();
    }
  }, [])

  useEffect(() => {
    if (pathSelected) {
      let str = fileService.readFileSync(path + '\\' + pathSelected);
      // eslint-disable-next-line no-eval
      eval(str);
      console.log(window.routesJs);
      window.routesJs.forEach(x => {
        x.resStr = utils.beautifyJSON(JSON.stringify(x.res))
      })

      setTimeout(() => {
        document.querySelectorAll(".code").forEach(block => {
          console.log(block)
          try {
            highlight.highlightElement(block);
          } catch (e) {
            console.log(e);
          }
        });
      }, 200)

      setRoutes(window.routesJs);
    }
  }, [pathSelected])

  function open() {
    close(() => {
      let service = app.current.expressService;
      service.server = service.listen(routes, res => {
        React.$message.success('打开成功').then()
        setServerStatus('已打开');
      });
      console.log('服务', service.server);
    });
  }

  // 关闭
  function close(success) {
    let service = app.current.expressService;
    if (service.server && Object.keys(service.server).length > 0) {
      let hide = React.$message.loading('关闭中', 10)
      service.connections.forEach(x => {
        x.destroy();
      })
      service.connections = [];
      service.server.close(res => {
        console.log('结束成功', res)
        hide();
        setServerStatus('已关闭')
        service.server = null;
        success && success();
      })
    } else {
      console.log('已关闭,无需关闭');
      success && success();
    }
  }

  return <div style={{width: '100%'}}>
    配置文件路径:<Ainput style={{width: '500px'}} value={path} setValue={setPath}/>
    <ASelect list={files} style={{width: '200px'}} value={pathSelected} onChange={(e) => {
      // console.log(e)
      setPathSelected(e);
    }}/>
    <button onClick={() => {
      open()
    }}>开启服务
    </button>
    <button onClick={() => {
      close();
    }}>结束服务
    </button>
    <span>{serverStatus}</span>
    <div className={Css.route_item}>
      <div style={{width: '200px'}} className={Css.route_txt}>路由</div>
      <div style={{width: '50px'}} className={Css.route_txt}>类型</div>
      <div style={{width: 'calc(100% - 470px)'}} className={Css.route_txt}>结果</div>
      <div style={{width: '200px'}} className={Css.route_txt}>描述</div>
    </div>
    {routes.map((x, i) => {
      return <div key={i} className={Css.route_item}>
        <div style={{width: '200px'}} className={Css.route_txt}>{x.route}</div>
        <div style={{width: '50px'}} className={Css.route_txt}>{x.type}</div>
        <div style={{width: 'calc(100% - 470px)'}} className={Css.route_txt + ' code'}>{x.resStr}</div>
        <div style={{width: '200px'}} className={Css.route_txt}>{x.desc}</div>
      </div>
    })}
  </div>
}