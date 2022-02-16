import React, {useEffect, useState} from 'react'
import Css from './device.module.scss'
import Ainput from "../../component/ainput/ainput";
import ATable from "../../component/atable/atable";
import axios from "axios";
import appService from "../../service/appService";
import {v4 as uuidv4} from 'uuid'
import utils from "../../utils/untils";

export default function Device() {
  const [requestUrl, setRequestUrl] = useState('http://10.28.6.21:9097/scp3dvs/api/v1/scp3dvs/provider/resourceFull/list?pageNum=1&pageSize=2000')
  const [excelUrl, setExcelUrl] = useState('D:\\Develop\\Document\\tongwei\\document\\点位\\通威点位2.xlsx')
  const [columns, setColumns] = useState([
    {title: 'type', dataIndex: 'type', key: 'type', width: 80, fixed: 'left'}
    , {title: 'coorStr', dataIndex: 'coorStr', key: 'coorStr', width: 250,}
    , {title: 'filePath', dataIndex: 'filePath', key: 'filePath', width: 600,}
    , {title: 'fileBuild', dataIndex: 'fileBuild', key: 'fileBuild', width: 60, fixed: 'right'}
    , {title: 'fileFloor', dataIndex: 'fileFloor', key: 'fileFloor', width: 60, fixed: 'right'}
    , {title: 'FROM_NUM', dataIndex: 'FROM_NUM', key: 'FROM_NUM', width: 80, fixed: 'right'}
    , {title: 'DNO', dataIndex: 'DNO', key: 'DNO', width: 50, fixed: 'right'}
    , {title: 'LEVEL', dataIndex: 'LEVEL', key: 'LEVEL', width: 50, fixed: 'right'}
  ])
  const [dataOrigin, setDataOrigin] = useState([]);
  const [dataDB, setDataDB] = useState([]);
  const [dataNoMatch, setDataNoMatch] = useState([]);
  const [ip, setIp] = useState('10.28.6.24');
  const [database, setDatabase] = useState('Map5.5');
  const [user, setUser] = useState('postgres');
  const [pwd, setPwd] = useState('TYAIMAP');

  useEffect(() => {

  }, [])

  // 读取excel中的数据
  function readExcel() {
    let excelUtil = appService.getApp().excelUtil;
    let obj = excelUtil.readExcel(excelUrl);
    let list = excelToList(obj[0].data);
    console.log('读取excel', list);
    list.forEach((x, i) => x.key = i)
    setDataOrigin(list)
  }

  // excel 数据转 list
  function excelToList(datas) {
    // 生成obj
    let fields = datas[0];
    console.log('获取所有字段', fields);
    let res = []
    let obj = {}
    for (let i = 1; i < datas.length; i++) { // 从第一行开始
      obj = {};
      for (let j = 0; j < fields.length; j++) { // 从第一列开始
        obj[fields[j]] = datas[i][j];
      }
      res.push(obj);
    }
    // 生成list
    return res;
  }

  // 从数据库中获取数据
  function getDataFromDB() {
    let app = appService.getApp()
    let helper = app.pgHelper
    // 我们不需要在这里分解结果 - 结果会直接返回
    helper.querySql('SELECT * FROM device_camera').then(res => {
      console.log('查询数据库', res);
      setDataDB(res);
      React.$message.success('查询成功')
    });
  }

  function searchDevice() {
    getDataFromDB();
  }

  // 查询数据在数据库中是否存在
  function checkDataExists() {
    let matchArr = []
    let notMatchArr = []
    dataOrigin.forEach(x => {
      let match = dataDB.filter(r => r.device_code === x.id)[0]
      if (match) {
        matchArr.push({...x})
      } else {
        notMatchArr.push({...x})
      }
    })
    console.log('excel中的设备存在', matchArr)
    console.log('excel中的设备不存在', notMatchArr)
    setDataNoMatch(notMatchArr)
  }

  function importNoMatch() {
    let sqls = []
    let minOrder = 309
    //INSERT INTO "public"."device_camera" VALUES ('C5A4899E4A504E431CAAFF013D4D2CDA', '10001', '摄像机', '10001_02_04', '人脸',
    // '西区前台出门方向', 'TEMP_SHAPE_D112',
    // '{"gid":"TEMP_SHAPE_D114","name":"","type":10300,"typename":"polygon","style":"","color":"#00ff00","location":{"x":0,"y":0,"z":0,"pitch":0,"yaw":0,"roll":0},"attr":null,"linewidth":0,"points":[{"x":16387.9296875,"y":-8697.21484375,"z":290.7581787109375},{"x":15990.3017578125,"y":-9115.2578125,"z":25},{"x":16025.0791015625,"y":-7967.39501953125,"z":10}],"linestyle":"","linecolor":"","onMouse":false}',
    // '{"x":14621.1220703125,"y":-8383.0400390625,"z":1146.1612548828125,"pitch":14.999996185302734,"yaw":-0.207366943359375,"roll":0.000040517446905141696}',
    // 'f9f42cd4853c416ea53bb50d3f5e79fa',

    // '{"x":"16384.10546875","y":-8668.7236328125,"z":283.543701171875,"pitch":"","yaw":"180","roll":""}', 'f',
    // '330C4609F26586409EF8E4EC19082629', NULL, 'f', NULL, 'renlian', '0101000000000000A08F8ECC4000000020855FC0C0', 85,
    // '{"cameraIndexCode":"f9f42cd4853c416ea53bb50d3f5e79fa","cameraName":"西区前台出门方向"}');
    sqls = dataNoMatch.map((x, i) => {
      return `INSERT INTO public.device_camera(
\t id, category_id, category_name, type_id, type_name
\t , device_name, model_url, "position", center, device_code
\t , list_style, enable, region_id, build_id, indoor
\t , floor_id, model_name, geom, "order", detail_info)
\t VALUES ('${uuidv4().replace(/-/g,'').toUpperCase()}', '10001', '摄像机', '10001_02_04', '人脸'
\t\t\t , '${x.resource_name}', '${'TEMP_'+(minOrder+i)}', '{}', '{}', '${x.id}'
\t\t\t , '{}', 'f', '330C4609F26586409EF8E4EC19082629', NULL, 'f'
\t\t\t , NULL, 'renlian', '0101000000000000A08F8ECC4000000020855FC0C0', ${minOrder+i}, '{"cameraIndexCode":"${x.id}","cameraName":"${x.resource_name}"}');`
    })
    console.log('导入数据', sqls);
    let sqlStr = sqls.join('')

    let app = appService.getApp()
    let helper = app.pgHelper
    // 我们不需要在这里分解结果 - 结果会直接返回
    helper.querySql(sqlStr).then(res => {
      console.log('导入成功', res);
      React.$message.success('导入成功')
    });

  }

  return <div>
    设备地址:<Ainput style={{width: '100%'}} value={requestUrl} setValue={setRequestUrl}/>
    <button onClick={() => {
      axios({
        url: requestUrl,
        method: 'get',
      }).then(res => {
        console.log('获取所有设备', res.data.data.list);
        res.data.data.list.forEach((x, i) => x.key = i)
        setDataOrigin(res.data.data.list);
      })
    }}>查询
    </button>
    excel:<Ainput style={{width: '100%'}} value={excelUrl} setValue={setExcelUrl}/>
    <button onClick={() => {
      readExcel();
    }}>读取excel
    </button>
    <ATable dataSource={dataOrigin}/>
    生成设备数据:
    <div style={{display: 'flex'}}>
      <div>ip</div><Ainput value={ip} setValue={setIp}/>
      <div>数据库</div><Ainput value={database} setValue={setDatabase}/>
      <div>账号</div><Ainput value={user} setValue={setUser}/>
      <div>密码</div><Ainput value={pwd} type={'password'} setValue={setPwd}/>
      <button onClick={searchDevice}>查询</button>
      <button onClick={checkDataExists}>判断数据是否存在</button>
    </div>
    <ATable dataSource={dataDB}/>
    <div>
      <span>未导入的设备</span>
      <button onClick={importNoMatch}>导入</button>
    </div>
    <ATable dataSource={dataNoMatch}/>
  </div>
}