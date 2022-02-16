import Css from './App.module.css';
import Atree from "./component/atree/atree";
import fileService from "./service/fileService";
import React, {useState, useRef, useEffect} from 'react'
import shapeService from "./service/shapeService";
import {useMappedState} from 'redux-react-hook'
import {Tabs} from 'antd';
import {FolderOutlined, FileOutlined} from '@ant-design/icons';
import axios from 'axios'
import Map from './component/map/map'
import DialogSetting from "./component/dialogSetting/dialogSetting";
import luwangService from "./service/luwangService";
import MapSvg from "./component/mapsvg/mapsvg";
import settingService from "./service/settingService";
import utils, {formatJSON} from './utils/untils'
import d3Service from "./service/d3Service";
import shortPathService from "./service/shortPathService";
import configService from "./service/configService";
import SplitPlane from "./component/splitPlane/splitPlane";
import mapAdminApiService from "./service/mapAdminApiService";
import {pinyin} from 'pinyin-pro';

const {TabPane} = Tabs;

function App() {
  const settingRef = useRef({
    data: [], // tree
    fileList: [], // 文件列表
  });
  // const [selectedSvgOr3d, setSelectedSvgOr3d] = useState('1'); // tab
  const [shapeTree, setShapeTree] = useState([]); // tab
  const [checkedArrShape, setCheckedArrShape] = useState([]); // 选中shape

  const [setting, setSetting] = useState({
    fileTree: [],
    filterStr: '(^ARC.shp$|^NODE.shp$|^arc.shp$|^node.shp$)',
    path: 'D:\\Develop\\Document\\luwang\\luwang',
    origin: {x: 0, y: 0},
    checkStr: '(^ARC.shp$|^NODE.shp$|^arc.shp$|^node.shp$)',
    checkedArr: [],
    scale: 1,
    offset: {x: 0, y: 0},
    lineWidth: 1,
    circleRadius: 2,
    circleRadiusMore: 3,
    fontSize: 14,
    borderColor: 'black',
    isShowDialogSetting: false,
  });
  const [apiSetting, setApiSetting] = useState({
    authorization: 'eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6ImE3NDYwMzhmLTNhNDEtNGY3Yi1hZWM5LTkyMmU2MjllNjRjZCJ9.2eSh-O0Nx9W1ekyxFSskp3nBWSLA4xy6K5WXugJiv4dwj4nJ4mBIv_BBzKsUYZY2tH84TcJGX_3YhiF2RmSB3Q',
    url: 'http://192.168.0.149:19901/aimapvision3d/shortestpath/find3?key=85718a41ed32423972eb0347c019f809',
    param: '{\n' +
      '    "end": {\n' +
      '        "floor": "F2",\n' +
      '        "id": 0,\n' +
      '        "x": 376.97,\n' +
      '        "y": -47.67,\n' +
      '        "z": 16.76\n' +
      '    },\n' +
      '    "project": "mv_bj",\n' +
      '    "start": {\n' +
      '        "floor": "F3",\n' +
      '        "id": 0,\n' +
      '        "x": 176.73,\n' +
      '        "y": -46.38,\n' +
      '        "z": 14.89\n' +
      '    }\n' +
      '}',
    res: '',
  })
  const settingGlobal = useMappedState(state => state.setting) // redux中的设置
  const svgItemGroup = useMappedState(state => state.svgItemGroup) // 是否测试路网
  const isShowLeftList = useMappedState(state => state.isShowLeftList) // 是否测试路网
  const authorization = useMappedState(state => state.authorization) // 是否测试路网
  const mapSvgInstance = useRef(); // svg的实例

  const [menus, setMenus] = useState([
    {
      title: '文件目录', onClick: (e, node) => {
        let cmdService = require('@electron/remote').app.cmdService;
        cmdService.runExec(`explorer.exe ${node.key}`)
      }
    },
    {
      title: '上传'
      , onClick: (e, node) => {
        // 获取 authorization
        if (!authorization) {
          React.$message.error('没有获取授权')
          return;
        }
        let luwangName = 'mv_' + pinyin(node.title, {toneType: 'none'}).replace(/\s/g, '')
        console.log('查询路网', luwangName)
        mapAdminApiService.searchRoutes().then(res => {
          console.log('获取路网', res);
          if (res.code === 200) {

          }
          // 判断是否存在
          // 删除路网
          // 打包
          // 重新删除
        })
      }
    },
    {
      title: '备份', onClick: (e, node) => {
        let cmdService = require('@electron/remote').app.cmdService;
        let logService = require('@electron/remote').app.logService;
        console.log(`备份到${node.key}`)
        logService.getLogger().info(node.key)
        let cmd = `cd ${node.key} &&` +
          `7z a -tzip ${node.title}-${React.$moment().format("yyyy-MM-DD-HH-mm-ss")}.zip .\\SW .\\SN -r`
        cmdService.runExec(cmd, (e) => {
          logService.getLogger().info(e);
          console.log(e)
        });
      }
    },
  ])

  const svgTabList = useRef([
    {tab: '楼层1', svgInstance: null},
    {tab: '楼层2', svgInstance: null},
  ]);

  useEffect(() => {
    return () => {
      window.$map_light?.Close();
    }
  }, [])

  useEffect(() => {
    setApiSetting(pre => {
      pre.param = utils.beautifyJSON(JSON.stringify(settingService.getSetting('luwangReq').value));
      console.log('更新参数', pre.param);
      return {...pre};
    });
  }, [settingGlobal]);

  /**
   * 构建文件列表
   */
  function getFileAll() {
    let hide = React.$message.loading('查询文件列表...', 5)
    let res = fileService.getAll(0, setting.path, setting.filterStr)

    // 设置图标
    function recursion(arr) {
      for (const itemElement of arr) {
        settingRef.current.fileList.push(itemElement); // 文件列表
        itemElement.icon = itemElement.type === 'file' ? <FileOutlined/> : <FolderOutlined/>;
        if (itemElement.children) {
          itemElement.children = itemElement.children
            // 楼层排序
            .sort((a, b) => {
              // console.log('a', a)
              if (/[\d]+/.test(a.title) || /[\d]+/.test(b.title)) {
                return parseInt(a.title) - parseInt(b.title);
              } else if (a.title.indexOf('F') === 0 || b.title.indexOf('B') === 0) { // 楼层排序
                let numA = a.title.replace('F', '').replace('B', '');
                let numB = b.title.replace('F', '').replace('B', '');
                return parseInt(numA) - parseInt(numB);
              } else {
                return a.title.localeCompare(b.title);
              }
            })
            // 空文件夹过滤
            .filter(x => x.children === undefined || x.children?.length !== 0);
          itemElement.children.forEach(x => x.parent = itemElement); // 指定父节点
          recursion(itemElement.children);
        }
      }
    }

    recursion(res);
    console.log('获取所有文件', res)
    settingRef.current.data = res;

    hide();

    setSetting(pre => {
      pre.fileTree = res;
      return {...pre}
    })
  }

  function getFileObj(key) {
    let fileObj = settingRef.current.fileList.filter(f => key === f.key)[0]
    return fileObj;
  }

  /**
   * 读取shape文件并绘制
   */
  function getShape() {
    console.log('读取shape文件')
    shapeService.clear();
    setting.checkedArr = setting.checkedArr.filter(x => {
      let fileObj = getFileObj(x)
      return fileObj && fileObj.type === 'file'
    });
    if (setting.checkedArr.length === 0) {
      React.$message.error('未选中文件, 无法读取').then(r => {});
      return;
    }
    let hide = React.$message.loading('读取文件中...')
    fileService.readFileAll(0, [], setting.checkedArr).then(res => {
      console.log('读取文件', res.map(x => x));
      shapeService.save(res);
      let tableData = shapeService.toTable(res);
      mapSvgInstance.current?.init();
      mapSvgInstance.current?.draw(tableData);
      initShapeList(tableData);
      console.log('获取shape 表格数据', tableData);
      hide();
    });
  }

  // 根据shape文件内容获取数据
  function initShapeList(shpFile) {
    console.log('根据shape文件内容获取数据', shpFile);
    shpFile = shpFile.sort((a, b) => {
      return a.fileFloor.substr(0, 1).localeCompare(b.fileFloor.substr(0, 1))
    }).sort((a, b) => {
      return parseInt(a.fileFloor.replace(/[\w]/, "")) - (parseInt(b.fileFloor.replace(/[\w]/, "")))
    }).sort((a, b) => {
      return parseInt(a.fileBuild) - (parseInt(b.fileBuild));
    })

    let parentFields = ['project', 'fileBuild', 'fileFloor']

    let root = {title: 'root', children: [], key: '', checked: true};
    let parentNode = root;
    for (let i = 0; i < shpFile.length; i++) {
      let item = shpFile[i]
      parentNode = root;
      for (let j = 0; j < parentFields.length; j++) {
        let field = parentFields[j];
        let existsItem = parentNode.children.filter(x => x.title === item[field])[0]; // tree中已存在的project
        if (existsItem) { // tree中已经存在
          parentNode = existsItem;
        } else { // tree中不存在, 添加字段node
          let node = {title: item[field], children: [], key: `${parentNode.key === '' ? '' : (parentNode.key + '_')}${item[field]}`, checked: true};
          parentNode.children.push(node);
          parentNode = node;
        }
      }
    }
    console.log('获取 shape tree', root)

    // 遍历排序

    setShapeTree(root.children);
  }

  // 选中
  function check() {
    let reg = new RegExp(setting.checkStr);
    let checkedArr = [];

    function recursionCheck(arr) {
      for (const itemElement of arr) {
        if (reg.test(itemElement.title) === true) {
          checkedArr.push(itemElement.key);
        }
        if (itemElement.children) {
          recursionCheck(itemElement.children);
        }
      }
    }

    recursionCheck(settingRef.current.data);
    console.log('选中相应文件', checkedArr);
    setSetting(pre => {
      pre.checkedArr = checkedArr;
      return {...pre};
    })
  }

  // 是否是路网节点
  function isHasShp(node) {
    return node.children && node.children.length === 2 && node.children?.filter(x => x.title.toLowerCase() === 'arc.shp').length > 0
      && node.children?.filter(x => x.title.toLowerCase() === 'node.shp').length > 0
  }

  // 选中
  function onCheck(selectedKeys, info) {
    if (isHasShp(info.node)) { // 先不添加tab
      // svgTabList.current.push({tab: info.node.title, svgInstance: null});
      // console.log('svg tab数量: ', svgTabList.current.length)
    }

    setSetting(pre => {
      pre.checkedArr = selectedKeys;
      return {...pre}
    })
  }


  function onCheckShape(selectedKeys, info) {
    console.log('显示隐藏svg item', selectedKeys, info)
    let shouldShowArr = selectedKeys.map(x => {
      let idx = x.indexOf('_')
      return x.substr(idx + 1)
    })
    console.log('需要显示的', shouldShowArr);
    let allItem = mapSvgInstance.current.svgG.current.selectAll("*")
    console.log('所有元素', allItem)
    allItem.style('display', 'none')
    shouldShowArr.forEach(x => {
      let idShouldShow = svgItemGroup[x]
      if (idShouldShow) {
        for (const idShouldShowElement of idShouldShow) {
          let needShowItems = document.getElementById(idShouldShowElement)
          // console.log('需要显示的item', needShowItems)
          if (needShowItems && needShowItems.style.display === 'none') {
            needShowItems.style.setProperty('display', '')
          }
        }
      }
    })

    setCheckedArrShape(selectedKeys)
  }

  // 请求路网
  function luwangRequest() {
    let param = JSON.parse(apiSetting.param);

    console.log('路网请求参数', JSON.parse(apiSetting.param))
    axios({
      url: apiSetting.url,
      method: 'post',
      data: param,
      headers: {Authorization: apiSetting.authorization,},
    }).then(res => {
      // console.log(res)
      let data = res.data;
      if (data.code === 200) {
        console.log('路网请求响应', data.data);
        let objs = data.data;
        // 3d地图绘制
        let obj3d = JSON.parse(JSON.stringify(objs));
        luwangService.drawRoute(obj3d.features.map(x => {
          return {
            x: x.geometry.coordinates[0] * 100,
            y: x.geometry.coordinates[1] * -100, // 反转y值
            // z: x.geometry.coordinates[2] * 100 + height,
            z: settingService.getSetting('height').value + 10,
          }
        }), settingService.getSetting('height')?.value);
        // svg绘制
        let pathArr = shortPathService.getPathArr(objs.features.map(x => x.geometry.coordinates.slice(0, 2)));
        console.log('获取路线', pathArr)
        for (const pathArrElement of pathArr) {
          d3Service.drawLine(mapSvgInstance.current.svgG.current, pathArrElement, 'yellow');
        }
      } else if (data.code === 404) {
        React.$message.error(data.msg);
      }
    })
  }

  // 请求路网2
  function luwangRequest2() {
    let str = formatJSON(apiSetting.param);
    let param = JSON.parse(str);
    let hide = React.$message.loading('路网请求中');
    console.log('路网请求参数', param)
    axios({
      url: apiSetting.url.replace('find3', 'find2'),
      method: 'post',
      data: param,
      headers: {Authorization: apiSetting.authorization,},
    }).then(res => {
      // console.log(res)
      let data = res.data;
      if (data.code === 200) {
        hide();
        console.log('路网请求响应', data.data);
        let objs = data.data;

        // 显示返回值
        setApiSetting(pre => {
          pre.res = utils.beautifyJSON(JSON.stringify(objs));
          return {...pre}
        })

        // 3d地图绘制
        let obj3d = JSON.parse(JSON.stringify(objs));

        // 绘制路网
        luwangService.drawRoute(obj3d.map(x => {
          return {
            ...x, // 包含floor
            x: x.x * 100,
            y: x.y * -100,
            z: luwangService.getFloorInfo(x.floor).height + 10,
          }
        }));

        // svg绘制 // 反转y值
        let pathArr = shortPathService.getPathArr(objs.map(x => [x.x, x.y]));
        console.log('获取路线', pathArr)
        for (const pathArrElement of pathArr) {
          d3Service.drawLine(mapSvgInstance.current.svgG.current, pathArrElement, 'yellow');
        }

        // 刷新配置
        settingService.setSetting('luwangReq', param)
        configService.refreshConfig();

      } else if (data.code === 404) {
        React.$message.error(data.msg).then();
        hide();
      }
    })
  }

  // 请求路网4
  function luwangRequest4() {
    let param = JSON.parse(apiSetting.param);
    param.start.y = -param.start.y;
    param.end.y = -param.end.y;

    console.log('路网请求参数', JSON.parse(apiSetting.param));
    axios({
      url: apiSetting.url.replace('find3', 'find4'),
      method: 'post',
      data: param,
      headers: {Authorization: apiSetting.authorization,},
    }).then(res => {
      // console.log(res)
      let data = res.data;
      if (data.code === 200) {
        console.log('路网请求响应', data.data);
        let objs = data.data;
        // 3d地图绘制
        let obj3d = JSON.parse(JSON.stringify(objs));

        luwangService.drawRoute(obj3d.map(x => {
          return {
            x: x.x,
            y: x.y,
            z: settingService.getSetting('height').value + 10,
          }
        }), settingService.getSetting('height')?.value);
        // svg绘制 // 反转y值
        let pathArr = shortPathService.getPathArr(objs.map(x => [x.x / 100, x.y / -100]));
        console.log('获取路线', pathArr)
        for (const pathArrElement of pathArr) {
          d3Service.drawLine(mapSvgInstance.current.svgG.current, pathArrElement, 'yellow');
        }
      } else if (data.code === 404) {
        React.$message.error(data.msg);
      }
    })
  }

  // 打开配置
  function openSetting(visible) {
    setSetting(pre => {
      pre.isShowDialogSetting = visible;
      console.log('App显示隐藏配置dialog', visible);
      return {...pre};
    })
  }

  return (
    <div className={Css.App}>
      <div className={Css.left} style={isShowLeftList === false ? {width: '0'} : {}}>
        <div>路径:<input value={setting.path} onChange={(e) => {
          setSetting(pre => {
            pre.path = e.target.value;
            return {...pre}
          })
        }}/></div>
        <div>过滤:<input value={setting.filterStr} onChange={(e) => {
          setSetting(pre => {
            pre.filterStr = e.target.value;
            return {...pre}
          })
        }}/></div>
        <div>选中:<input value={setting.checkStr} onChange={(e) => {
          setSetting(pre => {
            pre.filterStr = e.target.value;
            return {...pre}
          })
        }}/></div>
        <div>
          <button onClick={getFileAll}>查询</button>
          <button onClick={check}>选中</button>
          <button onClick={getShape}>读取shapefile</button>
          <button onClick={() => {openSetting(true)}}>配置</button>
        </div>

        {/* tree */}
        <div className={Css.fileList}>
          <Atree menus={menus} treeData={setting.fileTree} showIcon={true} checkedKeys={setting.checkedArr} onCheck={onCheck} onSelect={onCheck}/>
        </div>
        <div className={Css.shapeList}>
          <Atree treeData={shapeTree} showIcon={true} checkedKeys={checkedArrShape} onCheck={onCheckShape} onSelect={onCheckShape}/>
        </div>

      </div>
      {/* 请求api */}
      <div className={Css.right}>
        <div className={Css.apiTool}>
          <div className={Css.apiToolItem}>
            <span>authorization:</span><textarea value={apiSetting.authorization} onChange={(e) => {
            setApiSetting(pre => {
              pre.authorization = e.target.value;
              return {...pre};
            })
          }}/></div>
          <div className={Css.apiToolItem}><span>接口地址:</span><textarea value={apiSetting.url} onChange={(e) => {
            setApiSetting(pre => {
              pre.url = e.target.value;
              return {...pre};
            })
          }}/></div>
          <div className={Css.apiToolItem}>
            <span>参数:</span>
            <textarea style={{height: '330px'}} value={apiSetting.param} onChange={(e) => {
              setApiSetting(pre => {
                pre.param = e.target.value;
                return {...pre};
              });
            }}/></div>
          <div className={Css.apiToolItem}><span>请求结果:</span>
            <textarea style={{height: '400px'}} value={apiSetting.res} onChange={(e) => {
              setApiSetting(pre => {
                pre.res = e.target.value;
                return {...pre};
              })
            }}/></div>
          <div className={Css.apiToolItem}>
            <button onClick={luwangRequest}>请求</button>
            <button onClick={luwangRequest2}>请求2</button>
            <button onClick={luwangRequest4}>请求4</button>
            {/*<button>绘制</button>*/}
          </div>
        </div>
      </div>

      <SplitPlane className={Css.main} style={isShowLeftList === false ? {width: 'calc(100% - 300px)', margin: '0 300px 0 0'} : {}}>
        <MapSvg setting={setting} onRef={(ref) => {
          mapSvgInstance.current = ref
          d3Service.svgSelected = ref
          // x.svgInstance = ref;
        }}/>
        <Map/>
      </SplitPlane>

      <div className={Css.setting}>
        <DialogSetting isShow={setting.isShowDialogSetting} onClose={() => {openSetting(false)}}/>
      </div>
    </div>
  );
}

export default App;
