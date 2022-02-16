import React, {useEffect, useRef, useState} from 'react'
import {useMappedState} from "redux-react-hook";
import Css from './test.module.scss'
import mapService from "../../service/mapService";
import utils, {formatJSON} from "../../utils/untils";
import ASelect from "../../component/aselect/aselect";
import buildService from "../../service/buildService";
import modelService from "../../service/modelService";
import settingService from "../../service/settingService";
import {Build} from "../../utils/map3d";

function Test(props) {
  const setting = useMappedState(state => state.setting);
  const [properties, setProperties] = useState("");
  const [onPropOk, setOnPropOk] = useState(() => {});
  const [enableKeyboard, setEnableKeyboard] = useState(false);
  const [building, setBuilding] = useState([])
  const [buildingSelected, setBuildingSelected] = useState('');
  const [floor, setFloor] = useState([])
  const [floorSelected, setFloorSelected] = useState(''); // 选中的楼层

  const drawOneSecond = useRef(utils.throttle((res) => {
    const obj = {
      gid: 'TEST', // 自定义gid，可以设置自定义前缀，用于点选匹配不同的对象
      type: 'cone',
      radius: 2.0,    // 半径
      height: 1.2,    // 高
      // style: 'red',  // style 样式优先于color
      color: '#FF0000',
      location: res,
    };
    window.$map_light.OverLayerCreateObject(obj, res => {
      console.log('创建成功', res)
    });
  }, 1000))

  const [drawType, setDrawType] = useState([
    {
      title: 'box', obj: {
        "type": "box",
        "length": 200.0,
        "width": 180.0,
        "height": 120.0
      }
    },
    {
      title: '圆锥', obj: {
        gid: 'TEST', // 自定义gid，可以设置自定义前缀，用于点选匹配不同的对象
        type: 'cone',
        radius: 200.0,    // 半径
        height: 120.0,    // 高
        // style: 'red',  // style 样式优先于color
        color: '#FF0000',
      }
    },
    {
      title: '图标', obj: {
        type: 'image', // 10102  或  image
        style: 'shipin',
        scale: 1,
        screen: true,
        text: "6666666666",
        attr: {1: 1}
        // location: res,
      }
    },
    {
      title: '文字', obj: {
        // gid: 'CUSTOM_ID', // 自定义gid，可以设置自定义前缀，用于点选匹配不同的对象
        type: 'label',
        text: "666",
        font: '黑体',
        fontcolor: '#FF0000',
        fontsize: 100.0,
        halign: 'left',  // left center right
        valign: 'top',  // bottom center top
      }
    },
    {
      title: '模型', obj: {
        // gid: 'CUSTOM_ID', // 自定义gid，可以设置自定义前缀，用于点选匹配不同的对象
        type: 'model',
        scale: 1.0,    // 缩放比例
        filename: 'capsule',   // 模型文件名称： box, capsule, cone, cube, cylinder, pipe, pyramid, sphere
        style: 'red',
        color: '#FF0000',
      }
    },
    {
      title: 'imagelabel', obj: {
        // gid: 'CUSTOM_ID', 		// 自定义gid，可以设置自定义前缀，用于点选匹配不同的对象
        type: 'imagelabel', 		// 10102  或  image
        iconstyle: 'whh.png', 	// 资源图片里面是否有这个文件
        text: "中华人民共和国",      // 文本内容
        fontcolor: "#FFFFFF",      // 文本颜色
        // fontbg: "transparent",     // 文本背景颜色
        fontsize: 100.0,           // 文本大小
        screen: true,           // 文本大小
        style: "white",            // 立柱的颜色样式
        pwidth: 2,    				     // 立柱的宽度
        pheight: 0, 			     // 立柱的高度
        scale: 1,                  // 整个对象的缩放比例
        // location: res
      }
    },
    {
      title: 'niagara', obj: {
        type: 'niagara',
        scale: 1.0,
        filename: 'P_Marker_8',
      }
    },
    {
      title: '金字塔', obj: {
        type: 'pyramid',
        radius: 200.0,    // 半径
        height: 120.0,    // 高
        // style: 'red',  // style 样式优先于color
        color: '#FF0000',
      }
    },
    {
      title: '广告版', obj: {
        type: 'webbrowser',
        url: 'http://192.168.0.149:5557/luwangcheck4/test/testA.html?_ij_reload',
        screen: true,      // 屏幕坐标系 or 世界场景坐标系
        scale: 1.0,        // 缩放比例
        width: 200,       // 宽度（屏幕：像素   世界场景：米）
        height: 100,       //  高度（屏幕：像素   世界场景：米）
        // location: res
      }
    },
    {
      title: '视频', obj: {
        // gid: 'CUSTOM_ID', // 自定义gid，可以设置自定义前缀，用于点选匹配不同的对象
        type: 'vlcmedia',
        style: 'white',
        url: 'rtsp://admin:hk123456@192.168.0.235/h264/ch1/main/av_stream',
        screen: false,      // 屏幕坐标系 or 世界场景坐标系
        scale: 1.0,       // 缩放比例
        width: 200,     // 宽度（屏幕：像素   世界场景：米）
        height: 220,      //  高度（屏幕：像素   世界场景：米）
      }
    },
    {
      title: '视频投影', obj: {
        gid: 'CUSTOM_ID', // 自定义gid，可以设置自定义前缀，用于点选匹配不同的对象
        type: 'media2',
        url: 'rtsp://admin:hk123456@192.168.0.235/h264/ch1/main/av_stream',
        scale: 1.0,       // 缩放比例
        width: 200,     // 宽度（屏幕：像素   世界场景：米）
        height: 220,      //  高度（屏幕：像素   世界场景：米）
        location: {
          pitch: 90
        }
      }
    },
  ])

  // 显示隐藏
  function showHide(e) {
    if (e.target.tagName === 'P') {
      let height = e.currentTarget.style.height;
      height = height === 'auto' ? '30px' : 'auto';
      e.currentTarget.style.setProperty('height', height);
      e.preventDefault();
    }
  }

  useEffect(() => {
    let mapObj = setting.filter(x => x.key === "mapObj")[0];
    console.log('创建地图地址', mapObj.value);
    window.$map_light = new window.MapVision.View3d(mapObj.value);
    window.$map_light.Open(res => {
      console.log("创建成功", res);
      window.$map_light.SetParameters({
        showmouse: false
      })

      window.$map_light.enableKeyboard = false;

      buildService.getBuilds(window.$map_light, res => {
        console.log('获取建筑', res);
        setBuilding(res);
      });

      window.onkeydown = function (e) {
        if (e.code === 'F5') {
          window.location.reload();
        }
        if (e.code === 'F10') {
          let dom = document.getElementById('streamingVideo')
          window.$map_light.SetResolution(dom.clientWidth, dom.clientHeight);
        }
      }
    });
    return () => {
      console.log('销毁map')
      window.$map_light.Close();
    }
  }, [])

  // 选择建筑
  function handleChangeBuild(e) {
    console.log('选取建筑', e)
    setBuildingSelected(e)
    buildService.getFloors(window.$map_light, e, res => {
      console.log('获取楼层信息', res)
      res.unshift({buildname: 'all', floorname: 'all'})
      setFloor(res);

      modelService.findObjectById(window.$map_light, e).then(res => {
        console.log('获取详细建筑信息', res)
        modelService.helperShapeUtil.refreshHelperShapePos(window.$map_light
          , {x: res.position.x, y: res.position.y, z: settingService.getSetting('helperHeight').value, pitch: 180,})
        // modelService.flyTo(window.$map_light, res.position)
      })
    });
  }

  // 选择楼层
  function handleChangeFloor(e) {
    setFloorSelected(e);
    setFloorSelected(e.replace(/([\w])[0]*(\d)+/, '$1$2'));
    Build.showFloor(window.$map_light, buildingSelected, e, floor.map(x => x.floorname));
    console.log('获取楼层', e);
  }

  return <div style={{width: '100%', height: '100%'}}>
    <div className={Css.left}>
      <div className={Css.left_item}>模型</div>
      <div className={Css.left_item} onClick={() => {
        window.$map_light.ResetHome();
      }}>恢复原位</div>
      <div className={Css.left_item} onClick={() => {
        mapService.setMousePositionCallbackOnce(window.$map_light).then(res => {
          console.log('获取位置', JSON.stringify(res))
        });
      }}>点选获取位置</div>
      <div className={Css.left_item} onClick={() => {
        window.$map_light.GetCurrentPosition(console.log)
      }}>获取当前位置</div>

      <div className={Css.left_item} onClick={() => {
        window.$map_light.enableKeyboard = !enableKeyboard;
        setEnableKeyboard(window.$map_light.enableKeyboard);
      }}>{enableKeyboard === true ? '禁用' : '启用'}键盘事件</div>
      参数:
      <textarea id={'distance'} defaultValue={utils.beautifyJSON(JSON.stringify({
        prefix: '*',// MP,TEMP,JZ,V
        speedroute: 10, // 路径巡游的速率,每渲染帧的步长，单位，厘米/帧
        keyboardrate: 1.0, // 键盘移动速率 范围：0.001——1.0
        showmouse: true, // 是否显示地图内部的鼠标
        mouse_selected: true, // 鼠标点选效果高亮，是否起作用
        distance: 0,
        max_distance: 20000, // 1万米，最远缩放距离
        unit: 'm' // 场景返回数据单位， 默认厘米   输入m返回为米   其他值为厘米
      }))} style={{width: '100%', height: '200px'}}/>
      <div className={Css.left_item} onClick={() => {
        let paramers = JSON.parse(formatJSON(document.getElementById('distance').value))
        setProperties(utils.beautifyJSON(JSON.stringify(paramers)))
        window.$map_light.SetParameters(paramers);
        React.$message.success('设置参数成功').then();
      }}>设置全局参数</div>
      <div className={Css.left_item} onClick={() => {
        window.$map_light.GetCurrentPosition(pos => {
          console.log('获取相机坐标', pos)
        });
      }}>获取相机坐标</div>
      <div className={Css.left_item} onClick={() => {
        window.$map_light.SetParameters({prefix: '*'})
        window.$map_light.SetMouseCallback(res => {
          document.getElementById('obj').value = utils.beautifyJSON(JSON.stringify(res))
          window.$map_light.GetScrrenPosition([{gid: res.gid}], pos => {
            console.log('点选获取对象屏幕坐标', pos[0])
          });
          React.$message.success(`点击事件成功 ${res.gid}`).then()
        })
        window.addEventListener('mousedown', function rightClick(e) {
          if (e.button === 2) {
            React.$message.success('结束点击').then()
            window.$map_light.SetMouseCallback(null)
            window.removeEventListener('mousedown', rightClick)
          }
        });
      }}>点选获取对象屏幕坐标
      </div>

      <div className={Css.left_item} onClick={() => {
        window.$map_light.SetParameters({prefix: '*'})
        window.$map_light.SetMouseCallback(res => {
          console.log('点选定位', res);
          let location = {...res.location};
          location.pitch = 90;
          location.z += 1000;
          window.$map_light.FlyToPosition(location);
          React.$message.success(`点击事件成功 ${res.gid}`).then()
        })
        window.addEventListener('mousedown', function rightClick(e) {
          if (e.button === 2) {
            React.$message.success('结束点击').then();
            window.$map_light.SetMouseCallback(null);
            window.removeEventListener('mousedown', rightClick);
          }
        });
      }}>点选定位</div>
      <div className={Css.left_item} onClick={() => {
        window.$map_light.SetParameters({prefix: '*'})
        window.$map_light.SetMouseCallback(res => {
          console.log('点选清除', res);
          window.$map_light.OverLayerRemoveObjectById(res.gid)
          React.$message.success(`点选清除成功 ${res.gid}`).then()
        })
        window.addEventListener('mousedown', function rightClick(e) {
          if (e.button === 2) {
            React.$message.success('结束点选清除').then();
            window.$map_light.SetMouseCallback(null);
            window.removeEventListener('mousedown', rightClick);
          }
        });
      }}>点选清除</div>
      <div className={Css.left_item} onClick={() => {
        window.$map_light.SetParameters({prefix: '*'})
        window.$map_light.SetMouseCallback(res => {
          console.log('点选隐藏', res);
          window.$map_light.UpdateObjectVisible(res.gid, false)
          React.$message.success(`点选隐藏成功 ${res.gid}`).then()
        })
        window.addEventListener('mousedown', function rightClick(e) {
          if (e.button === 2) {
            React.$message.success('结束点选隐藏').then();
            window.$map_light.SetMouseCallback(null);
            window.removeEventListener('mousedown', rightClick);
          }
        });
      }}>点选隐藏</div>

      <div className={Css.left_item} onClick={() => {
        let obj = JSON.parse(document.getElementById('obj').value);
        console.log('要修改的对象', obj)
        if (obj) {
          window.$map_light.UpdateObject(obj);
        }
      }}>更新获取对象</div>
      <div className={Css.left_item} onClick={() => {
        window.$map_light.SetParameters({prefix: '*'})
        mapService.setMouseCallbackOnce(window.$map_light).then((res) => {
          window.$map_light.SetObjectHighlight(res.gid)
          React.$message.success('点击事件成功')
        })
      }}>点选高亮</div>
      <div className={Css.left_item} onClick={() => {
        window.$map_light.ClearHighlight();
      }}>清除高亮</div>
      前缀<input defaultValue={'B'} id={'findPrefix'}/>
      <div className={Css.left_item} onClick={() => {
        let val = document.getElementById('findPrefix').value
        window.$map_light.FindObjectByPrefix(val, 100, res => {
          console.log(res)
        });
      }}>批量查询</div>

      {/* 路径巡游 */}
      <div className={Css.title} onClick={(e) => {showHide(e)}}>
        <p>路径巡游</p>
        参数:<textarea style={{height: '180px'}} id={'tRoute'} defaultValue={utils.beautifyJSON(JSON.stringify({
        "iselev": true,// 是否依赖地形高程值
        "visible": true,  // 显示隐藏路径
        "style": "sim_arraw",  // 路径的样式  sim_arraw, sim_dot, sim_dashed, sim_flash, sim_scan, sim_dot
        "showloc": true, // 是否显示起始点图标loc
        "width": 100, // 路径的宽度，单位米
        "speed": 200,// 路径的播放，默认20   厘米/每秒   米/秒
        "distance": 100,// 可视距离  > 0.01 单位米
        "pitch": 30,// 俯仰角， 范围：0——90度
        // "geom": obj.points.map(x => {return {...x}})
        gemo: [],
      }))}/>
        <div className={Css.left_item} onClick={() => {
          window.$map_light.Clear();

          let obj = {
            gid: 'route',
            type: 'linestring',
            color: '#ff0f00',
            points: []
          };
          window.$map_light.OverLayerStartEdit(obj, res => {
            obj = res;
          });

          window.addEventListener('mousedown', function rightClick(e) {
            if (e.button === 2) {
              React.$message.success('创建成功').then()
              window.$map_light.OverLayerStopEdit();

              setTimeout(() => {
                let routeData = JSON.parse(document.getElementById('tRoute').value);
                routeData.geom = obj.points.map(x => {return {...x}})
                console.log('获取路径巡游位置信息', routeData);
                window.$map_light.CreateRoute(routeData, res => {
                  React.$message.success('创建路径巡游成功');
                });
              }, 2000);

              window.$map_light.OverLayerRemoveObjectById(obj.gid);

              window.removeEventListener('mousedown', rightClick);
            }
          });

        }}>创建路径巡游</div>
        <div className={Css.left_item} onClick={() => {
          let routeData = JSON.parse(document.getElementById('tRoute').value);
          routeData.geom = []
          console.log('获取路径巡游位置信息', routeData);
          window.$map_light.CreateRoute(routeData, res => {
            React.$message.success('创建路径巡游成功');
          });
        }}>创建空路径巡游</div>
        <div className={Css.left_item} onClick={() => {
          window.$map_light.PlayRoute(res => {
            console.log('开始路径巡游成功', res);// 返回播放结束节点的位置和索引
            drawOneSecond.current(res);
          });
        }}>开始路径巡游</div>
        <div className={Css.left_item} onClick={() => {
          window.$map_light.PauseRoute(res => {
            // 返回播放结束节点的位置和索引
            React.$message.success('暂停路径巡游成功');
          });
        }}>暂停路径巡游</div>
        <div className={Css.left_item} onClick={() => {
          window.$map_light.ResumeRoute(res => {
            // 返回播放结束节点的位置和索引
            console.log('继续路径巡游成功', res)
            drawOneSecond.current(res)
          });
        }}>继续路径巡游</div>
        <div className={Css.left_item} onClick={() => {
          window.$map_light.StopRoute(res => {
            // 返回播放结束节点的位置和索引
            React.$message.success('停止路径巡游成功')
          });
        }}>停止路径巡游</div>
        <div className={Css.left_item} onClick={() => {
          window.$map_light.Clear();
          React.$message.success('关闭路径巡游成功')
        }}>关闭路径巡游</div>
      </div>

      {/* 绘制 */}
      <div className={Css.title} onClick={(e) => {showHide(e)}}>
        <p>绘制</p>
        gid:<input defaultValue={''} id={'flyObjGid'}/>
        speed:<input defaultValue={10} id={'flyObjSpeed'}/>
        <div className={Css.left_item} onClick={() => {
          let val = document.getElementById('flyObjGid').value;
          let speed = parseInt(document.getElementById('flyObjSpeed').value)
          window.$map_light.FlyToObjectById(val, false, speed);
        }}>定位到对象</div>
        <div className={Css.left_item} onClick={() => {
          mapService.setMousePositionCallbackOnce(window.$map_light).then(res => {
            let speed = parseInt(document.getElementById('flyObjSpeed').value)
            window.$map_light.FlyToPosition(res, false, speed);
          })
        }}>定位到位置</div>
        <div className={Css.left_item} onClick={() => {
          // 注意,此功能为异步操作
          const obj = {
            type: 'polygon3d',
            style: 'sim_arraw', // 基础样式
            color: '#0000ff', // 基础样式颜色
            linewidth: 5.0, // 边线宽度 单位米
            linestyle: 'green',// 边线样式，优先级高于linecolor
            linecolor: '#0000ff',// 边线颜色，linestyle=null才会起作用
            linevisible: true, // 边线启用
            roofvisible: false, // 顶部面是否启用
            roofheight: 100.0,  // 顶部面的高度  单位米
            edgestyle: "sim_arraw",   // 边缘立面样式，优先级高于edgecolor
            edgecolor: "#0000ff", // 边缘立面颜色，edgestyle=null才会起作用
            edgeheight: 100.0, // 边缘立面高度  单位米
            points: []
          };
          window.$map_light.OverLayerStartEdit(obj, res => {
            console.log(res)
          });
          window.addEventListener('mousedown', function rightClick(e) {
            if (e.button === 2) {
              React.$message.success('创建成功').then()
              window.$map_light.OverLayerStopEdit();
              window.removeEventListener('mousedown', rightClick)
            }
          });
        }}>绘制polyon3d</div>
        <div className={Css.left_item} onClick={() => {
          const obj = {
            type: 'linestring',
            color: '#ff0f00',
            points: [],
            linewidth: 10,
          };
          window.$map_light.OverLayerStartEdit(obj, res => {
            console.log('折线', res);
          });
          window.addEventListener('mousedown', function rightClick(e) {
            if (e.button === 2) {
              React.$message.success('创建成功').then();
              window.$map_light.OverLayerStopEdit();
              window.removeEventListener('mousedown', rightClick);
            }
          });
        }}>绘制折线 <img src={require('../../assets/折线.png').default}/> </div>
        <div className={Css.left_item} onClick={() => {
          const obj = {
            gid: 'linestring2',
            type: 'linestring',
            color: '#ff0f00',
            points: [],
          };
          window.$map_light.SetMousePositionCallback(res => {
            res.z += 10
            obj.points.push(res);
            window.$map_light.OverLayerRemoveObjectById('linestring2')
            window.$map_light.OverLayerCreateObject(obj)
          })
          window.addEventListener('mousedown', function rightClick(e) {
            if (e.button === 2) {
              React.$message.success('创建成功').then()
              window.$map_light.SetMousePositionCallback(null);
              window.removeEventListener('mousedown', rightClick)
            }
          });
        }}>绘制折线2 <img src={require('../../assets/折线.png').default}/> </div>
        <div className={Css.left_item} onClick={() => {
          const obj = {
            type: 'polygon',
            color: '#ff0000',
            linewidth: 2.0, // 边线宽度 单位米
            linestyle: 'highlight',
            linecolor: '#ff0000',
            points: []
          };
          window.$map_light.OverLayerStartEdit(obj, res => {
            console.log('绘制面', res)
          });
          window.addEventListener('mousedown', function rightClick(e) {
            if (e.button === 2) {
              React.$message.success('创建成功').then()
              window.$map_light.OverLayerStopEdit();
              window.removeEventListener('mousedown', rightClick)
            }
          });
        }}>绘制面</div>

        <div className={Css.left_item} onClick={() => {
          mapService.setMousePositionCallbackOnce(window.$map_light).then((res) => {
            res.z += 1100
            res.pitch = -30

            let res1 = {...res}
            res1.x += 100
            let res2 = {...res}
            res2.x += 100

            const obj = {
              // gid: 'CUSTOM_ID', // 自定义gid，可以设置自定义前缀，用于点选匹配不同的对象
              type: 'routemodel',
              scale: 5.0,   // 缩放比例
              speed: 20.0,  // 播放速度，20米每秒
              location: res,
              filename: "cylinder",
              points: [res, res1, res2]
            };
            window.$map_light.OverLayerCreateObject(obj, res => {
              React.$message.success('创建成功').then()
            });
          });
        }}>创建模型动画</div>
        {
          drawType.map((x, i) => {
            return <button onClick={() => {
              document.getElementById('batchVideo').value = utils.beautifyJSON(JSON.stringify(x.obj))
            }
            }>{x.title} </button>
          })
        }

        <textarea id={'batchVideo'} defaultValue={utils.beautifyJSON(JSON.stringify({
          gid: 'CUSTOM_ID', // 自定义gid，可以设置自定义前缀，用于点选匹配不同的对象
          type: 'image',
          style: 'shipin',
          scale: 1.0,   // 缩放比例
          screen: true,
          attr: {
            1: "11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
          },
        }))} style={{width: '100%', height: '200px'}}/>
        数量:<input id={'batchVideoNum'} defaultValue={20}/>
        <div className={Css.left_item} onClick={() => {
          mapService.setMousePositionCallbackOnce(window.$map_light).then((res) => {
            let obj = JSON.parse(document.getElementById('batchVideo').value)
            let num = parseInt(document.getElementById('batchVideoNum').value)
            obj.location = {...res};
            let objs = []
            for (let i = 0; i < num; i++) {
              let objTmp = {...obj}
              objTmp.location = {...objTmp.location}
              objTmp.gid = 'BATCH_' + i;
              objTmp.location.z += 200 * i;
              objs.push(objTmp)
            }
            console.log('批量创建', objs.map(x => x.location))
            window.$map_light.OverLayerCreateObjects(objs, res => {
              React.$message.success('批量创建成功').then()
            });
          });
        }}>批量创建</div>
        <div className={Css.left_item} onClick={() => {
          mapService.setMousePositionCallbackOnce(window.$map_light).then((res) => {
            let obj = JSON.parse(document.getElementById('batchVideo').value);
            if (!obj.location) {
              obj.location = {}
            }
            obj.location.x = res.x;
            obj.location.y = res.y;
            obj.location.z = res.z;
            window.$map_light.OverLayerCreateObject(obj, res => {
              React.$message.success('单个创建成功').then()
              console.log('单个创建成功', res)
              document.getElementById("updateObj").value = JSON.stringify(res)
            });
          });
        }}>单个创建</div>
        <div className={Css.left_item} onClick={() => {
          const obj = {
            type: 'heatmap_rect',
            pheight: 100.0,    // 对象的高度，单位米
            minx: 120.1369948618892, // 热力图范围  minx  单位 经纬度 或者 厘米
            miny: 30.17894981866537,
            maxx: 120.14234250302855,
            maxy: 30.181703356000295,
            // style : 'red',
            gradient: {              // 热力图等级颜色
              level1: '#00ffff',   //00ff00
              level2: '#fdff00',   //d0000ff
              level3: '#009fff',   //ffff00
              level4: '#f300ff',   //ffa500
              level5: '#ff0000'    //ff0000
            },
            points: [ // 热力点
              {
                "x":-129944.21875,"y":6467.85546875,"z":40.00006103515625,
                radius: 20.0,           // 热力点半径
                value: 55               // 热力值 0——100
              }
            ]
          };


          window.$map_light.OverLayerCreateObject(obj, res => {
            window.$map_light.FlyToPosition({
              "x":-129944.21875,"y":6467.85546875,"z":40.00006103515625,
            })
            let strObj = JSON.stringify(res);
            console.log(strObj);
          });
        }}>创建热力图</div>
      </div>

      {/* 动画 */}
      <div className={Css.title} onClick={(e) => {showHide(e)}}>
        <p>动画</p>
        id:<input defaultValue={'Sequence'} id={'Sequence'}/>
        <div className={Css.left_item} onClick={() => {
          window.$map_light.PlaySequence(document.getElementById('Sequence').value)
        }}>开始动画
        </div>
        <div className={Css.left_item} onClick={() => {
          window.$map_light.PauseSequence()
        }}>暂停动画
        </div>
        <div className={Css.left_item} onClick={() => {
          window.$map_light.StopSequence(document.getElementById('Sequence').value);
        }}>停止动画
        </div>
      </div>

      {/* 楼层管理 */}
      <div className={Css.title} onClick={(e) => {showHide(e)}}>
        <p>楼层管理</p>
        建筑:
        <ASelect value={buildingSelected} onChange={handleChangeBuild} style={{width: '150px'}} list={building} optionKey="name" optionValue="name"/>&nbsp;
        楼层:&nbsp;
        <ASelect value={floorSelected} onChange={handleChangeFloor} style={{width: '100px'}} list={floor} optionKey="floorname" optionValue="floorname"/>&nbsp;

        <div className={Css.left_item} onClick={() => {
          window.$map_light.SplitBuilding(buildingSelected, 10);
        }}>楼层分离</div>
        <div className={Css.left_item} onClick={() => {
          window.$map_light.SplitBuildingReset(buildingSelected);
        }}>楼层恢复</div>

      </div>

      <div className={Css.left_item} onClick={() => {
        let obj = {
          gid: 'highPolygon',
          type: 'polygon',
          color: '#ff0000',
          linewidth: 0.1, // 边线宽度 单位米
          linestyle: 'highlight',
          linecolor: '#ff0000',
          points: []
        };
        window.$map_light.OverLayerStartEdit(obj, res => {
          obj = res;
          console.log(res)
        });

        window.addEventListener('mousedown', function rightClick(e) {
          if (e.button === 2) {
            React.$message.success('创建区域高亮');
            window.$map_light.OverLayerStopEdit()
            window.$map_light.ClearHighlightRegion();
            obj.geom = obj.points
            window.$map_light.OverLayerRemoveObjectById(obj.gid)
            setTimeout(() => {
              window.$map_light.SetHighlightRegion(obj);
            }, 1000);
            window.removeEventListener('mousedown', rightClick);
          }
        });

      }}>创建区域高亮</div>
      <div className={Css.left_item} onClick={() => {
        window.$map_light.ClearHighlightRegion();
      }}>
        清除区域高亮
      </div>


    </div>
    <div className={Css.right}>
      <input id={'deleteIdInput'}/>
      <div className={Css.left_item} onClick={() => {
        let val = document.getElementById('deleteIdInput').value
        window.$map_light.OverLayerRemoveObjectById(val);
      }}>通过id删除</div>
      <div className={Css.left_item} onClick={() => {
        window.$map_light.OverLayerRemoveAll();
      }}>清除全部</div>
      <div className={Css.left_item} onClick={() => {
        window.$map_light.SetParameters({prefix: '*'})
        window.$map_light.SetMouseCallback(res => {
          document.getElementById('updateObj').value = utils.beautifyJSON(JSON.stringify(res))
          React.$message.success(`点击事件成功 ${res.gid}`).then()
        })
        window.addEventListener('mousedown', function rightClick(e) {
          if (e.button === 2) {
            React.$message.success('结束点击').then()
            window.$map_light.SetMouseCallback(null)
            window.removeEventListener('mousedown', rightClick)
          }
        });
      }}>点选获取对象</div>
      <textarea id={'updateObj'} style={{width: '100%', height: '300px'}}/>
      <div className={Css.left_item} onClick={() => {
        let obj = JSON.parse(document.getElementById('updateObj').value);
        console.log('要修改的对象', obj)
        if (obj) {
          window.$map_light.OverLayerUpdateObject(obj);
        }
      }}>更新获取对象</div>
      <div className={Css.left_item} onClick={() => {
        let obj = JSON.parse(document.getElementById('updateObj').value);
        console.log('要修改的对象', obj)
        if (obj) {
          window.$map_light.OverLayerRemoveObjectById(obj.gid);
          window.$map_light.OverLayerCreateObject(obj);
        }
      }}>强制更新获取对象</div>
    </div>
    <div id="mapvision3d" style={{width: '100%', height: '100%', objectFit: 'fill'}}/>
  </div>
}

export default Test