import Css from './map.scss'
import React, {useEffect, useState, useRef} from 'react'
import {Build, createMap, Model} from '../../utils/map3d';
import {useMappedState} from 'redux-react-hook';
import luwangService from "../../service/luwangService";
import settingService from "../../service/settingService";
import buildService from "../../service/buildService";
import ASelect from "../aselect/aselect";
import modelService from "../../service/modelService";
import configService from "../../service/configService";
import d3Service from "../../service/d3Service";
import mapService from "../../service/mapService";

export default function Map(props) {

  const objs = useMappedState(state => state.objs);
  const setting = useMappedState(state => state.setting);
  const mapRoute = useMappedState(state => state.mapRoute);
  const heightInputRef = useRef({})
  const floorHeightInputRef = useRef({}) // 楼层高度输入框
  const [building, setBuilding] = useState([])
  const [buildingSelected, setBuildingSelected] = useState('');
  const [floor, setFloor] = useState([])
  const [floorSelected, setFloorSelected] = useState(''); // 选中的楼层
  const [floorHeightSelected, setFloorHeightSelected] = useState(''); // 楼层高度
  const [selectedPathPoint, setSelectedPathPoint] = useState(0);
  const [dialogHeight, setDialogHeight] = useState('0');

  useEffect(() => {
    // createMapsss();
  }, []);

  useEffect(() => {
    heightInputRef.current.value = settingService.getSetting('height').value;
  }, [setting]);

  // 绘制路网
  useEffect(() => {
    console.log('3d地图获取路线数据', objs.map(x => x.geometry));
    luwangService.drawLuwang(objs);
  }, [objs]);

  const createMapsss = (url) => {
    if (window.$map_light) {
      window.$map_light.OverLayerRemoveAll();
      window.$map_light.Close();
    }
    let mapObj = setting.filter(x => x.key === "mapObj")[0];
    console.log('创建地图地址', mapObj.value);
    let map_light = createMap.createMap(mapObj.value, (() => {
      console.log('地图初始化成功！')

      React.$map_light = map_light;
      window.$map_light = map_light;

      let paramers = {
        //prefix: 'M,T,J',
        prefix: 'MP,T,J,V001,CAMERA,ICON',
        path: '',
        // speedroute: 10
        speedroute: 20,
        showmouse: false,
      }
      window.$map_light.SetParameters(paramers);

      buildService.getBuilds(window.$map_light, res => {
        console.log('获取建筑', res);
        setBuilding(res);
      });
    }));
  }

  // 点击显示 points
  function selectPoints() {
    if (window.$map_light) {
      window.$map_light.SetMousePositionCallback(res => {
        console.log('绘制点位', res)
        setTimeout(() => {
          window.$map_light.OverLayerCreateObject({
            attr: {},
            type: 'circle',
            radius: 200,    // 半径
            // style : 'red',
            color: '#6cc1d2',
            location: {
              x: res.x,
              y: res.y,
              z: res.z + 10,
              pitch: 0,   // 俯仰角 0——90度
              yaw: 0,    // 偏航角 0-360度
              roll: 0     // 翻滚角
            }
          })
        }, 500);
        let resNew = {...res}
        resNew.x /= 100; // 地图和路网单位不一致
        resNew.y /= -100;
        resNew.z /= 100;

        d3Service.drawPoint(d3Service.svgSelected.svgG.current, [resNew.x, resNew.y]);
        luwangService.addPoint2Req({id: 0, floor: 'W1', x: resNew.x, y: resNew.y, z: 0});
        window.$map_light.SetMousePositionCallback(null);
      })
    }
  }

  function selectPointsToHeightUpdate() {
    if (window.$map_light && floorHeightSelected) {
      window.$map_light.SetMousePositionCallback(res => {
        luwangService.heightUpdate(res.z + 10, floorHeightSelected);
        luwangService.updateRouteHeight(res.z + 20, floorHeightSelected)
        floorHeightInputRef.current.value = res.z + 10;
        window.$map_light.SetMousePositionCallback(null);
        luwangService.saveHeightObjByFloorName(floorHeightSelected, res.z + 10); // 保存到配置
        console.log('同步的setting', settingService.settingSync);
        configService.refreshConfigByArr(settingService.settingSync); // 保存到配置
      });
    } else {
      React.$message.error('地图未初始化或未选中楼层');
    }
  }

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

  // 设置楼层高度
  function handleFloorHeightChange(e) {
    console.log('获取楼层高度', e)
    setFloorHeightSelected(e); // 设置楼层高度
    floorHeightInputRef.current.value = luwangService.getFloorInfo(e).height;
  }

  // 开始绘制
  function beginDraw() {

    let boundaryObj = {
      gid: 'BOUND',
      type: 'polygon',
      color: '#0000ff',
      linewidth: 2.0, // 边线宽度 单位米
      linestyle: 'highlight',
      linecolor: '#ff0000',
      points: []
    }

    // window.$map_light.OverLayerStartEdit(obj, res => {
    //   console.log('绘制路网边界', res.points);
    //   settingService.setStateByObj({drawBoundary: res.points});
    // });

    React.$message.success('右键结束绘制');
    if (window.$map_light) {

      window.addEventListener('mousedown', function drawRightKeyDown(e) {
        if (!window.$map_light) return;
        if (e.button === 2) { // 右击
          window.$map_light.OverLayerStopEdit();
          // 清除点击事件
          setTimeout(() => {
            window.removeEventListener('mousedown', drawRightKeyDown)
            window.$map_light.SetMousePositionCallback(null)
          }, 1000)
          React.$message.success('结束绘制')
          console.log('结束绘制', boundaryObj.points.map(x => [x.x, x.y]))
          settingService.setStateByObj({drawBoundary: boundaryObj.points.map(x => [x.x, x.y])})
        }
      });
      window.$map_light.SetMousePositionCallback(e => {
        console.log('绘制点击事件', e)
        boundaryObj.points.push(e);
        e.z += 5
        if (boundaryObj.points.length >= 3) {
          window.$map_light.OverLayerCreateObject(boundaryObj)
        } else if (boundaryObj.points.length > 3) {
          window.$map_light.OverLayerUpdateObject(boundaryObj)
        }
      })
    }
  }

  return (
    <div className="map_css">
      <div style={{
        position: 'absolute',
        height: dialogHeight === 'auto' ? "0" : 'auto',
        overflow: 'hidden',
        top: '10px', left: '10px', zIndex: 20, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', textAlign: 'left'
      }}>
        <button onClick={() => {
          setDialogHeight("auto")
        }}>显示
        </button>
      </div>
      <div style={{
        position: 'absolute',
        height: dialogHeight === 'auto' ? "auto" : '0',
        overflow: 'hidden',
        top: '10px', left: '10px', zIndex: 20, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', textAlign: 'left'
      }}>
        <button onClick={() => { setDialogHeight('0'); }}>隐藏</button>
        &nbsp;
        <button onClick={() => {
          window.$map_light.Close();
        }}>关闭
        </button>
        &nbsp;
        <button onClick={() => {createMapsss()}}>重置</button>
        &nbsp;
        <button onClick={() => {selectPoints()}}>选取点</button>
        &nbsp;
        <button onClick={() => {
          window.$map_light.SetParameters({prefix: '*'})
          mapService.setMouseCallbackOnce(window.$map_light).then(() => {
            React.$message.success('点击事件成功')
          })
        }}>点选
        </button>
        &nbsp;
        <button onClick={() => {
          let view3d = window.$map_light;
          if (!view3d) return;
          view3d.SetMouseCallback(null)
          // 过滤 对象  prefix 对象名称前缀   ，path 路径前缀
          let paramers = {prefix: '*',}
          view3d.SetParameters(paramers)
          view3d.SetMouseCallback(res => {
            console.log('点选隐藏', res)
            view3d.UpdateObjectVisible(res.gid, false);
          });
          window.addEventListener('mousedown', function rightClick(e) {
            if (e.button === 2) {
              React.$message.success('结束隐藏').then();
              view3d.SetMouseCallback(null)
              window.removeEventListener('mousedown', rightClick);
            }
          });
        }}>点选隐藏
        </button>
        &nbsp;
        <button onClick={() => {selectPointsToHeightUpdate()}}>更新高度</button>
        &nbsp;
        <button onClick={() => {beginDraw()}}>绘制区域</button>
        &nbsp;
        建筑:
        <ASelect onChange={handleChangeBuild} style={{width: '150px'}} list={building} optionKey="name" optionValue="name"/>&nbsp;
        楼层:&nbsp;
        <ASelect onChange={handleChangeFloor} style={{width: '100px'}} list={floor} optionKey="floorname" optionValue="floorname"/>&nbsp;
        各层高度:
        <ASelect style={{width: '80px'}} list={Object.keys(settingService.getSetting('heightObj').value)} onChange={handleFloorHeightChange}/>&nbsp;
        <input ref={floorHeightInputRef} onKeyDown={(e) => {
          // 传递楼层
          if (e.code === 'Enter' || e.code === 'NumpadEnter') {
            luwangService.heightUpdate(e.target.value, floorHeightSelected); // 更新指定楼层高度
            luwangService.saveHeightObjByFloorName(floorHeightSelected, e.target.value)
          }
        }}/>
        {/*路线*/}
        <div style={{height: '200px', overflowY: 'auto'}}>
          路线:{
          mapRoute[0]?.points.map((x, i) => {
            return <div key={i} className={"route_css"} style={{backgroundColor: selectedPathPoint === i ? 'red' : ''}} onClick={() => {
              setSelectedPathPoint(i)
              let pre = mapRoute[0]?.points[i - 1]
              let curr = mapRoute[0]?.points[i]
              let next = mapRoute[0]?.points[i + 1]
              x = {...x}
              if (curr && next) {
                x.yaw = Math.atan(Math.tan((next.y - curr.y) / (next.x - curr.x))) * (180 / Math.PI) + 180
              } else if (pre && curr) {
                x.yaw = Math.atan(Math.tan((pre.y - curr.y) / (pre.x - curr.x))) * (180 / Math.PI) + 180
              } else
                console.log('角度', x.yaw);
              window.$map_light.FlyToPosition(x);
            }}>{JSON.stringify(x)}</div>
          })
        }
        </div>
        <div>
          定位到:<input style={{width: '300px'}} defaultValue={'{"x":0,"y":0,"z":5000,"pitch":90}'} onKeyDown={(e) => {
          if (e.code === 'Enter' || e.code === 'NumpadEnter') {
            let pos = JSON.parse(e.target.value);
            console.log('定位到', pos)
            window.$map_light.FlyToPosition(pos)
          }
        }}/>
        </div>
      </div>
      <div id="mapvision3d" style={{width: '100%', height: '100%', objectFit: 'fill'}}/>
    </div>
  );

}