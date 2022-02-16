import React, {useEffect, useState} from 'react'
import Css from './getToken.module.scss'
import Ainput from "../../component/ainput/ainput";
import axios from "axios";
import settingService from "../../service/settingService";
import {useMappedState} from "redux-react-hook";
import configService from "../../service/configService";
import {ReloadOutlined} from '@ant-design/icons'

export default function GetToken() {
  const [user, setUser] = useState('admin')
  const [pwd, setPwd] = useState('admin123')
  const [code, setCode] = useState();
  const [uuid, setUUID] = useState();
  const [authImg, setAuthImg] = useState();
  const [projects, setProjects] = useState([]);

  const [root, setRoot] = useState('http://127.0.0.1:19901/aimapvision3d')

  let authorization = settingService.getSetting('authorization').value
  let license = settingService.getSetting('license').value

  function refreshAutoImg() {
    axios({
      url: `${root}/captchaImage`,
      method: 'get',
    }).then(res => {
      console.log('获取验证码', res)
      setAuthImg('data:image/gif;base64,' + res.data.img)
      setUUID(res.data.uuid)
    })
  }

  function login() {
    let url = `${root}/login`
    axios({
      url: url,
      method: 'post',
      data: {
        code: code,
        password: pwd,
        username: user,
        uuid: uuid,
      }
    }).then(res => {
      console.log('登录', res);
      if (res.data.code === 200) {
        settingService.setStateByObj({authorization: res.data.token})
        settingService.setSetting('authorization', res.data.token)
        axios({
          url: `${root}/common/license/info`,
          method: 'get',
          headers: {
            Authorization: res.data.token,
          }
        }).then(resLicense => {
          console.log('获取授权信息', resLicense);
          settingService.setStateByObj({license: resLicense.data.data.token})
          settingService.setSetting('license', resLicense.data.data.token)

          configService.refreshConfig();
        })
      } else {
        React.$message.error(res.data.msg).then();
        refreshAutoImg();
      }
    })
  }

  function getProjects() {
    axios({
      url: `${root}/project3d/list`,
      method: 'get',
      headers: {
        Authorization: authorization,
      }
    }).then(res => {
      console.log('获取工程列表', res)
      if (res.data.code === 200) {
        setProjects(res.data.data)
      } else {
        React.$message.error(res.data.msg).then()
      }
    })
  }

  function connection(id) {
    settingService.setSetting('mapObj', {
      id: "mapvision3d",
      url: root,
      projectId: id,
      token: license
    })
    configService.refreshConfig();
  }

  useEffect(() => {
    let mapObj = settingService.getSetting('mapObj').value
    setRoot(mapObj.url)
    settingService.setStateByObj({license: mapObj.token});
    refreshAutoImg();
  }, [])

  function refreshRootUrl() {
    settingService.setSetting('rootUrl', root)
    configService.refreshConfig();
    React.$message.success('刷新地址配置成功')
  }

  return <div>
    <div>
      后台地址:
      <Ainput style={{width: '300px'}} value={root} setValue={setRoot}/>
      <ReloadOutlined onClick={refreshRootUrl} style={{border: '1px solid black', padding: '5px'}}/>
    </div>
    <div>loginName:<Ainput value={user} setValue={setUser}/>
    </div>
    <div>loginPwd:<Ainput type={'password'} value={pwd} setValue={setPwd}/>
    </div>
    <div>authCode: <img onClick={() => {refreshAutoImg()}} src={authImg}/>
      <Ainput value={code} setValue={setCode} onKeyDown={(e) => {
        console.log('enter', e)
        if (e.key === 'Enter') {
          login()
        }
      }}/>
    </div>
    <button onClick={() => {
      login();
    }}>登录
    </button>
    <button onClick={() => {
      getProjects();
    }}>获取工程列表
    </button>
    <div>
      <div>authorization:</div>
      {authorization}
    </div>
    <div>
      <div>license:</div>
      {license}
    </div>
    <div style={{height: '400px', overflow: 'scroll'}}>工程列表
      {projects.map((x, i) => {
        return <div key={i} style={{border: '1px solid black'}}>
          <div>{x.id}</div>
          <div>{x.name}</div>
          <div>{x.status}</div>
          <button onClick={() => {
            connection(x.id)
            React.$message.success('连接成功')
          }}>连接
          </button>
        </div>
      })}
    </div>
  </div>
}