import Css from './mapsvg.module.scss'
import React from 'react'
import d3Service from "../../service/d3Service";
import luwangService from "../../service/luwangService";
import shortPathService from "../../service/shortPathService";
import ATable from "../atable/atable";
import utils from "../../utils/untils";
import buildService from "../../service/buildService";
import settingService from "../../service/settingService";
import {Checkbox} from 'antd'

class MapSvg extends React.Component {
  svg = React.createRef();
  svgG = React.createRef();
  positionInputRef = React.createRef();
  transformInputRef = React.createRef();
  transformRef = React.createRef(); // 当前偏移量
  transformBakRef = React.createRef();
  isRedrawRef = React.createRef();
  drawBoundary = React.createRef();
  drawBoundaryObj = React.createRef();

  columnOrigin = [
    {title: 'type', dataIndex: 'type', key: 'type', width: 80, fixed: 'left'}
    , {title: 'coorStr', dataIndex: 'coorStr', key: 'coorStr', width: 250,}
    , {title: 'filePath', dataIndex: 'filePath', key: 'filePath', width: 600,}
    , {title: 'fileBuild', dataIndex: 'fileBuild', key: 'fileBuild', width: 60, fixed: 'right'}
    , {title: 'FROM_NUM', dataIndex: 'FROM_NUM', key: 'FROM_NUM', width: 80, fixed: 'right'}
    , {title: 'BNAME', dataIndex: 'BNAME', key: 'BNAME', width: 80, fixed: 'right'}
    , {title: 'fileFloor', dataIndex: 'fileFloor', key: 'fileFloor', width: 60, fixed: 'right'}
    , {title: 'DNO', dataIndex: 'DNO', key: 'DNO', width: 50, fixed: 'right'}
    , {title: 'LEVEL', dataIndex: 'LEVEL', key: 'LEVEL', width: 50, fixed: 'right'}
    , {title: 'ARC_', dataIndex: 'ARC_', key: 'ARC_', width: 50, fixed: 'right'}
    , {title: 'CO_', dataIndex: 'CO_', key: 'CO_', width: 50, fixed: 'right'}
    , {title: 'CO_ID', dataIndex: 'CO_ID', key: 'CO_ID', width: 50, fixed: 'right'}
  ];

  constructor(props) {
    super(props);
    this.state = {
      setting: {
        scale: 1,
        offset: {x: 0, y: 0},
        lineWidth: 1,
        circleRadius: 2,
        circleRadiusMore: 3,
        fontSize: 10,
        borderColor: 'black',
      },
      paintsToDraw: '{"x":0, "y":0}',
      columns: [...this.columnOrigin],
      dataSource: [],
      dataSourceShow: [],
      isDrawDNO: true,
      isDrawId: false,
      dialogHeight: '0',
    };
    this.props.onRef && this.props.onRef(this);
  }

  // 更新输入框
  refreshTransformInputRef(str) {
    this.transformInputRef.current.value = str;
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    console.log('mapsvg 销毁')
  }

  // 初始化svg
  init() {
    let _this = this;
    this.clear();
    this.transformBakRef.current = JSON.parse(JSON.stringify(this.transformRef.current));
    console.log('mapSvg更新, componentDidMount');
    let d3 = window.d3;
    let svg = d3.select('#mainSvg');
    let g = this.svgG.current
    if (!g) { // 不存在就创建
      g = svg.append("g");
      this.svgG.current = g;
    } else {
      this.isRedrawRef.current = true;
    }

    d3Service.drawOriginPoint(g); // 绘制原点

    function zoomFunc(e) {
      if (!_this.transformRef.current) {
        _this.transformRef.current = {};
      }
      // 还原位置
      if (_this.isRedrawRef.current === true && Object.keys(_this.transformBakRef.current).length > 0) {
        e.transform.k = _this.transformBakRef.current.k;
        e.transform.x = _this.transformBakRef.current.x;
        e.transform.y = _this.transformBakRef.current.y;
        _this.isRedrawRef.current = false;
      }
      _this.transformRef.current.k = e.transform.k;
      _this.transformRef.current.x = e.transform.x;
      _this.transformRef.current.y = e.transform.y;
      _this.refreshTransformInputRef(JSON.stringify(e.transform));
      // console.log(new Date().getTime(), e.transform)
      g.attr("transform", e.transform);
      g.selectAll('path').attr("stroke-width", _this.state.setting.lineWidth / e.transform.k);
      g.selectAll('circle').attr("r", _this.state.setting.circleRadius / e.transform.k);
      g.selectAll('text').style("font-size", _this.state.setting.fontSize / e.transform.k);
      // console.log('存储偏移量', _this.transformRef.current);
    }

    const zoom = d3.zoom().on("zoom", zoomFunc);

    // zoom.translateBy(g, svg.node().clientWidth / 2, svg.node().clientHeight / 2);
    svg.call(zoom).call(zoom.transform, d3.zoomIdentity.translate(svg.node().clientWidth / 2, svg.node().clientHeight / 2))
      .on("pointermove", event => {
        // console.log(event.offsetX, event.offsetY)
        let settingTmp = {...this.state.setting};
        settingTmp.offset.x = parseFloat((event.offsetX - this.transformRef.current.x).toFixed(2));
        settingTmp.offset.y = parseFloat((event.offsetY - this.transformRef.current.y).toFixed(2));
        let input = this.positionInputRef.current;
        if (input) {
          input.value = JSON.stringify(this.state.setting.offset);
        }
        this.setState({setting: settingTmp,});
      })

    // 初始化位置
    // this.isRedrawRef.current = true;
    // this.transformBakRef.current = {k: 1};
    // this.transformBakRef.current.x = svg.node().clientWidth / 2;
    // this.transformBakRef.current.y = svg.node().clientHeight / 2;
    // g.attr("transform", `translate(${svg.node().clientWidth / 2}, ${svg.node().clientHeight / 2})`);
  }

  // props 更新
  componentDidUpdate(prevProps) {
    if (prevProps.setting !== this.state.setting) {
      // console.log('更改设置', prevProps.setting);
      this.setState({setting: prevProps.setting,})
    }
  }

  // 绘制路网
  draw(tableData, pointColor = 'red') {
    let drawBoundary = settingService.getState('drawBoundary');
    drawBoundary = drawBoundary.map(x => [x[0] / 100, x[1] / -100])
    console.log('获取绘制区域', drawBoundary);

    let g = this.svgG.current;
    if (!g) return;
    let lineFunction = window.d3.line()
      .x(function (d) { return d[0]; })
      .y(function (d) { return d[1]; })
    console.log('svg绘制', tableData.map(x => x));

    let dataS = this.refreshTable(tableData); // 生成表格

    // let projectGroup = utils.groupBy(dataS, x => x.project);
    // for (const projectGroupKey in projectGroup) { // 工程
    //   let projectGroupVal = projectGroup[projectGroupKey];
    let buildGroup = utils.groupBy(dataS, x => x.fileBuild) // 建筑
    for (const buildGroupKey in buildGroup) {
      let buildGroupVal = buildGroup[buildGroupKey];
      let floorGroup = utils.groupBy(buildGroupVal, x => x.fileFloor); // 楼层分组
      for (const floorGroupKey in floorGroup) {
        let floorGroupVal = floorGroup[floorGroupKey]; // 建筑楼层分组

        let itemKey = d3Service.getKey(buildGroupKey, floorGroupKey);// 获取键

        for (const c of floorGroupVal) {
          if (c.type === 'LineString') {
            let res = c.coordinates.map(coor => { return coor; });
            for (const re of res) {
              if (drawBoundary.length === 0 || luwangService.isInPolyon(re, drawBoundary)) {
                let path = g.append('path')
                  .attr('d', lineFunction(res))
                  .attr('stroke', 'green')
                  .attr('stroke-width', this.state.setting.lineWidth)
                  .attr('fill', 'none')
                  .attr('id', d3Service.addIdToGroup(itemKey)) // 指定id
                  .on('click', e => {
                    // console.log(path)
                    this.filterTable(this.state.dataSource.filter(x => x.key.toString() === path.node().dataset.key))
                  })
                  .on('mouseover', e => {
                    e.target.style.setProperty('cursor', 'pointer');
                  })
                path.node().dataset.key = c.key;
                break;
              }
            }

          } else if (c.type === 'Point') {
            // 判断是否在界内
            if (drawBoundary.length === 0 || luwangService.isInPolyon(c.coordinates, drawBoundary)) {
              // g.append('circle')
              //   .style("fill", this.state.setting.borderColor)
              //   .style('z-index', "-1")
              //   .attr('cx', c.coordinates[0])
              //   .attr('cy', c.coordinates[1])
              //   .attr('r', this.state.setting.circleRadiusMore)
              //   .attr('id', d3Service.addIdToGroup(itemKey)) // 指定id

              let circle = g.append('circle')
                .style("fill", pointColor)
                .attr('cx', c.coordinates[0])
                .attr('cy', c.coordinates[1])
                .attr('r', this.state.setting.circleRadius)
                .attr('id', d3Service.addIdToGroup(itemKey)) // 指定id
                .on('click', e => {
                  console.log(e.target.dataset)
                  this.filterTable(this.state.dataSource.filter(x => x.key.toString() === circle.node().dataset.key))
                })
                .on('mouseover', e => {
                  e.target.style.setProperty('cursor', 'pointer');
                })
              circle.node().dataset.key = c.key

              if (c.DNO && this.state.isDrawDNO === true) {
                g.append("text")
                  .attr('x', c.coordinates[0])
                  .attr('y', c.coordinates[1])
                  .attr('id', d3Service.addIdToGroup(itemKey)) // 指定id
                  // .style("transform", "rotateY(-180deg)")
                  // .style("transform-origin", "center center")
                  .style('font-size', this.state.setting.fontSize + 'px')
                  .style("text-anchor", "left")
                  .text(c.DNO);
              }
            }
          }
        }
      }
    }
    // }
    console.log('svgItem 分组', d3Service.svgItemGroup);
    settingService.setStateByObj({svgItemGroup: d3Service.svgItemGroup})

    // 校正 缩放
    g.attr("transform", `translate(${this.transformBakRef.current.x},${this.transformBakRef.current.y}) scale(${this.transformBakRef.current.k})`);
    g.selectAll('path').attr("stroke-width", this.state.setting.lineWidth / this.transformBakRef.current.k);
    g.selectAll('circle').attr("r", this.state.setting.circleRadius / this.transformBakRef.current.k);
    g.selectAll('text').style("font-size", this.state.setting.fontSize / this.transformBakRef.current.k);

    //
    let pointSeries = tableData.filter(x => x.type === 'LineString').map(x => x.coordinates);
    // 路径串变路径对[1,2,3]=>[1,2],[2,3]
    let pathArr = []
    pointSeries.forEach(x => {
      if (x.length === 2) {
        pathArr.push(x);
      } else {
        for (let i = 0; i < x.length - 1; i++) {
          pathArr.push([x[i], x[i + 1]]);
        }
      }
    });
    console.log('获取用于路径的数据', pathArr);

    this.redrawBoundary();// 读取
  }

  // 刷新表格数据
  refreshTable(dataS) {
    let columns = [...this.columnOrigin]
    // .filter(x => x.geometry.type === 'LineString')
    // let dataS = shapeService.toTable(arr);
    console.log('获取属性表', columns)
    // 存入表中
    this.setState({
      dataSource: dataS,
      dataSourceShow: [...dataS],
      columns: columns,
    });
    return dataS;
  }

  filterTable(data) {
    this.setState({dataSourceShow: data,})
  }

  // 检查出口是否对上

  // 清空
  clear() {
    console.log('清空svg')
    let svgG = this.svgG.current
    if (svgG) {
      svgG.node().innerHTML = "";
    }
  }

  // 选取点位
  selectPoints() {
    let svg = this.svg.current;
    let g = this.svgG.current;
    let transform = this.transformRef.current
    let _this = this;
    React.$message.info('点击右键结束选择');

    function listen(e) {
      // console.log('点击事件', e)
      console.log('开始选取点位', transform);
      let pointCurr = _this.getPointCurr([e.offsetX, e.offsetY]);
      // svg绘制
      d3Service.drawPoint(g
        , pointCurr
        , _this.getRadiusCurr(_this.state.setting.circleRadius));
      luwangService.addPoint2Req({x: pointCurr[0], y: pointCurr[1], z: 0, id: 0, floor: 'W1'});
      // 3d地图绘制
      luwangService.drawPoints([[pointCurr[0] * 100, -pointCurr[1] * 100]], '#27bff1');
    }

    svg.addEventListener('click', listen);
    svg.addEventListener('contextmenu', function rightClick() {
      React.$message.info('结束选择')
      svg.removeEventListener('click', listen);
      svg.removeEventListener('contextmenu', rightClick);
    })
  }

  getPointCurr(point) {
    return [(point[0] - this.transformRef.current.x) / this.transformRef.current.k, (point[1] - this.transformRef.current.y) / this.transformRef.current.k];
  }

  getPointAfterTransform(point) {
    return [(point[0] * this.transformRef.current.k + this.transformRef.current.x), (point[1] * this.transformRef.current.k + this.transformRef.current.y)];
  }

  getRadiusCurr(r) {
    return r / this.transformRef.current.k
  }

  // 判断连通行
  judgeGrahpConnectionNoDraw(data = this.state.dataSourceShow) {
    let lineStrings = data.filter(x => x.type === "LineString").map(x => x.coordinates)
    // console.log('获取所有线', lineStrings);
    let distinctList = shortPathService.getDistinct(lineStrings); // 去重
    // console.log('获取所有点去重', distinctList.sort((a, b) => a[0] - b[0]));

    let graph = shortPathService.getPointMap(lineStrings, distinctList); // 获取邻接表
    // console.log('测试邻接表', graph);
    let fathers = shortPathService.judgeGraphConnection(graph, distinctList);
    // console.log('测试连通性结果', fathers);
    let isConnected = Array.from(new Set(fathers)).length === 1;

    // 第二次判断, 相同楼层, 不同的区域
    if (isConnected === false) {
      isConnected = this.judgeGrahpConnection2(fathers, distinctList);
    }

    return {fathers, distinctList, isConnected: isConnected};
  }

  // 同楼层, 不同建筑的连通性
  judgeGrahpConnection2(fathers, distinctList) {
    let unconnectedObj = {}
    for (let i = 0; i < fathers.length; i++) {
      let ele = fathers[i]
      if (unconnectedObj[ele]) {
        unconnectedObj[ele].push(distinctList[i])
      } else {
        unconnectedObj[ele] = [distinctList[i]]
      }
    }

    // 判断两点之间的距离
    function isDiffBuild(points1, points2) {
      for (const point1 of points1) {
        for (const point2 of points2) {
          let distance = shortPathService.getDistance(point1, point2);
          if (!shortPathService.pointEqualTo(point1, point2) &&
            (distance < settingService.getSetting('unConnectedDistance').value)) {
            return false; // 小于一定精度, 就是点没连上
          }
        }
      }
      return true;
    }

    // 如果 距离很远判断为 不同建筑
    for (let u1Key of Object.keys(unconnectedObj)) {
      let u1 = unconnectedObj[u1Key]
      for (let u2Key of Object.keys(unconnectedObj)) {
        let u2 = unconnectedObj[u2Key]
        if (u1Key !== u2Key && isDiffBuild(u1, u2) === false) { // 两片不连通区域不是不同的建筑
          return false
        }
      }
    }
    return true;
  }

  // 判断图的连通性
  judgeGraphConnection(data = this.state.dataSourceShow) {
    // 建筑_楼层 分组
    let group = utils.groupBy(data, (x) => x.fileBuild + '_' + x.fileFloor);

    console.log('数据检查分组', group);
    for (const groupKey in group) {
      let ele = group[groupKey] // 获取所有点位和线
      let {fathers, distinctList, isConnected} = this.judgeGrahpConnectionNoDraw(ele);

      for (let i = 0; i < fathers.length; i++) { // 0不绘制
        if (fathers[i] !== 0) {
          d3Service.drawText(this.svgG.current, fathers[i], distinctList[i]);
        }
      }
      if (this.state.isDrawId === true) {
        for (let i = 0; i < distinctList.length; i++) { // 绘制id
          d3Service.drawText(this.svgG.current, i, distinctList[i], 'end');
        }
      }

      if (isConnected === false) {
        React.$message.error(`${groupKey} 地图不连通`);
        console.error(`${groupKey} 地图不连通`);
      } else {
        React.$messageWrap.success(`地图连通`);
      }
    }
  }

  // 判断两个点是否太近
  judgePointSoClose(data = this.state.dataSourceShow) {
    let hide = React.$message.loading('计算中...', 0)
    let lineStrings = data.filter(x => x.type === "LineString").map(x => x.coordinates)
    // console.log('获取所有线', lineStrings);
    let distinctList = shortPathService.getDistinct(lineStrings); // 去重
    for (const datum of distinctList) {
      for (const datum2 of distinctList) {
        let distance = shortPathService.getDistance(datum, datum2)
        if (distance !== 0 && distance < 1) {
          console.log(distance)
          console.error('点距离太近');
        }
      }
    }
    hide();
    React.$message.success('查询成功')
  }

  // 判断点是否在线断点处
  judgePointOnlineEnd(data = this.state.dataSourceShow) {
    let hide = React.$message.loading('计算中...', 0)
    let points = data.filter(x => x.type === "Point").map(x => x.coordinates)
    let lineStrings = data.filter(x => x.type === "LineString").map(x => x.coordinates)
    // console.log('获取所有线', lineStrings);
    let distinctList = shortPathService.getDistinct(lineStrings); // 去重
    let isOk = true
    for (const datum of distinctList) {
      let match = points.filter(x => shortPathService.pointEqualTo(datum, x))
      if (match.length === 0) {
        React.$messageWrap.error('线段两端没有点')
        isOk = false
        d3Service.drawPoint(this.svgG.current, datum)
      }
    }
    hide();
    if (isOk) {
      React.$message.success('验证通过')
    }
  }

  // 检查不同楼层连通性
  checkConnectionDiffFloor() {
    let isOk = true;

    function errorShow(msg, obj = '') {
      // React.$message.error(msg);
      console.error(msg, obj);
    }

    let group = utils.groupBy(this.state.dataSourceShow.filter(x => x.type === 'Point'), (x) => x.fileBuild + '_' + x.fileFloor);
    console.log('数据检查分组', group);
    // 检测是否有出口,电梯
    let pointTypeArr = {
      DEFAULT: 0,
      ZHITI: 1,
      SHOPBUXING: 2,
      BUXING: 3,
      BUXING2: 4, // 向下走
      CHUKOU: 5,
      BUXING3: 6, // 向上走
    }
    // 电梯数组
    let elevatorArr = [pointTypeArr.ZHITI, pointTypeArr.SHOPBUXING, pointTypeArr.BUXING, pointTypeArr.BUXING2, pointTypeArr.BUXING3]

    for (const groupKey in group) {
      let ele = group[groupKey] // 获取所有点位和线
      // 和上层是否连通
      let upFloor = this.getUpFloor(groupKey);
      let upUpFloor = this.getUpFloor(upFloor);
      let eleUp = group[upFloor];
      let eleUpUp = group[upUpFloor];
      // 和下层是否连通
      let downFloor = this.getDownFloor(groupKey);
      let eleDown = group[downFloor];
      let eleGround = group['W1_W1'];

      // let pointTypeArr = ele.map(x => x.DNO);
      let groupKeyArr = groupKey.split('_');
      let hasUpDown = ele.filter(x => elevatorArr.indexOf(x.DNO) > -1).length > 0; // 是否能上下
      let hasChuKou = ele.filter(x => x.DNO === pointTypeArr.CHUKOU).length > 0; // 是否能上下
      let floor = groupKeyArr[1]; // F1
      let floorType = groupKeyArr[1].substr(0, 1) // B,W,F
      let floorNum = groupKeyArr[1].replace(/[A-z]*/, '') // 楼层号
      switch (floorType) {
        case 'B':
          if (floorNum === '1' && hasChuKou === false) {
            errorShow(`${groupKey} 没有出口`);
            isOk = false;
          }
          if (hasUpDown === false) {
            errorShow(`${groupKey} 没有电梯, 楼梯点`);
            isOk = false;
          } else {
            // console.log('检查楼层4,6点', groupKey, upFloor)
            if (eleUp && eleUpUp) { // 非顶楼
              let exists = this.isChuKou46Ok(ele, eleUp);
              if (exists === false) {
                errorShow(`${groupKey} 到 ${upFloor} 4,6点位没有相距两米`);
                isOk = false;
              }
            } else if (eleUp && !eleUpUp) {
              let exists = this.isChuKou46Ok(ele, eleUp, true);
              if (exists === false) {
                errorShow(`${groupKey} 到 ${upFloor}顶楼 4,6点位没有相距两米`);
                isOk = false;
              }
            } else if (eleUp) {
              let exists = this.isChuKouOneOk(ele, eleUp);
              if (exists === false) {
                errorShow(`${groupKey} 到 ${upFloor} 1点位 没有相距两米`);
                isOk = false;
              }
              let exists3 = this.isChuKouThreeOk(ele, eleUp);
              if (exists3 === false) {
                errorShow(`${groupKey} 到 ${upFloor} 3点位 没有相距两米`);
                isOk = false;
              }
            }
          }
          break;
        case 'W': // 主要检查到F1的出口
          if (hasChuKou === false) {
            errorShow(`${groupKey} 没有出口`);
            isOk = false;
          }
          break;
        case 'F':
          if (floorNum === '1' && hasChuKou === false) {
            errorShow(`${groupKey} 没有出口`);
            isOk = false;
          } else if (floorNum === '1') { // 检测出口
            if (eleGround) {
              let exists = this.isChukouOk(ele, eleGround)
              if (exists === false) {
                errorShow(`${groupKey} 到 W1 出口没有重合`);
                isOk = false;
              }
            }
          }
          if (hasUpDown === false) {
            errorShow(`${groupKey} 没有电梯楼梯点`);
            isOk = false;
          } else {
            // console.log('检查楼层4,6点', groupKey, upFloor)
            if (eleUp && eleUpUp) { // 非顶楼
              let exists = this.isChuKou46Ok(ele, eleUp);
              if (exists === false) {
                errorShow(`${groupKey} 到 ${upFloor} 4,6点位没有相距两米`);
                isOk = false;
              }
            } else if (eleUp && !eleUpUp) {
              let exists = this.isChuKou46Ok(ele, eleUp, true);
              if (exists === false) {
                errorShow(`${groupKey} 到 ${upFloor}顶楼 4,6点位没有相距两米`);
                isOk = false;
              }
            } else if (eleUp) {
              let exists = this.isChuKouOneOk(ele, eleUp);
              if (exists === false) {
                errorShow(`${groupKey} 到 ${upFloor} 1点位 没有相距两米`);
                isOk = false;
              }
              let exists3 = this.isChuKouThreeOk(ele, eleUp);
              if (exists3 === false) {
                errorShow(`${groupKey} 到 ${upFloor} 3点位 没有相距两米`);
                isOk = false;
              }
            }
          }
          break;
        default:
          break
      }
    }

    if (isOk === true) {
      React.$message.success('楼层点位设置正确');
    } else {
      React.$message.info('楼层点位设置错误');
    }
  }

  // 检查数据正确性
  // 判断是否缺失楼层
  checkData() {
    let data = JSON.parse(JSON.stringify(this.state.dataSourceShow))
    let isOk = true;

    function errorShow(msg, obj = '') {
      // React.$message.error(msg);
      console.error(msg, obj);
    }

    // 检查楼层设置错误
    let preError = "";
    for (const x of data) {
      let isOkTmp = x.fileFloor === x.FROM_NUM;
      if (isOkTmp === false) {
        let nowError = `${x.fileBuild} ${x.fileFloor}与${x.FROM_NUM}不同 楼层设置错误`
        if (preError !== nowError) {
          preError = `${x.fileBuild} ${x.fileFloor}与${x.FROM_NUM}不同 楼层设置错误`;
          errorShow(preError, x);
        }
        isOk = false;
      }
    }
    isOk === true ? React.$message.success('楼层设置正确') : React.$message.error('楼层设置错误');

    // 建筑_楼层 分组
    // let group = utils.groupBy(data, (x) => x.fileBuild + '_' + x.fileFloor);
    let buildFloorDistinct = Array.from(new Set(data.map(x => JSON.stringify({build: x.fileBuild, floor: x.fileFloor})))).map(x => JSON.parse(x))
    buildFloorDistinct = utils.groupBy2(buildFloorDistinct, (x) => x.build, x => x.floor);
    console.log('建筑文件去重', buildFloorDistinct);

    // 检查楼层, 建筑是否匹配
    let buildGroup = Object.keys(utils.groupBy(data, (x) => x.fileBuild));
    if (window.$map_light) {
      buildService.getBuilds(window.$map_light, res => {
        console.log('获取建筑', res);
        let builds = res.map(x => parseInt(x.id.replace(/V[0]*1_JZ/, ''))).map(x => x.toString());
        console.log('存在建筑', builds);
        console.log('存在路网建筑', buildGroup);
        let notExistsBuilds = builds.filter(x => buildGroup.indexOf(x) < 0)
        if (notExistsBuilds.length > 0) {
          errorShow(`${notExistsBuilds}, 建筑不存在`);
        }

        async function checkFloor() {
          for (const buildInfo of res) {
            let floorNum = parseInt(buildInfo.id.replace(/V[0]*1_JZ/, ''));
            let floorRes = await buildService.getFloorsAsync(window.$map_light, buildInfo.id)
            console.log('查询楼层', floorRes);
            if (!floorRes || !(floorRes instanceof Array)) return;
            // 路网中的楼层
            let matchFloors = buildFloorDistinct[floorNum]
            if (matchFloors) {
              let floorInLuwang = matchFloors.map(x => x.replace(/[\w]/, ''))
              console.log('路网中的楼层', floorInLuwang)
              let floorIn3d = floorRes.map(x => x.floorname.replace(/[\w][0]*/, ''))
              console.log('模型中的楼层', floorIn3d)
              let notExistsFloorInLuwang = floorIn3d.filter(x => floorInLuwang.indexOf(x) < 0)
              if (notExistsFloorInLuwang.length > 0) {
                errorShow(`${buildInfo.id}, 模型中的楼层没有路网`, notExistsFloorInLuwang);
                isOk = false;
              }
            } else {
              errorShow(`${buildInfo.id}建筑 没有路网`);
              isOk = false;
            }
          }
        }

        checkFloor().then(r => {
          if (isOk === true) {
            React.$message.success('楼层点位设置正确');
          } else {
            React.$message.info('楼层点位设置错误');
          }
        });

      })
    } else {
      if (isOk === true) {
        React.$message.success('楼层点位设置正确');
      } else {
        React.$message.info('楼层点位设置错误');
      }
    }
  }

  // 获取上一楼层
  getUpFloor(floorKey) {
    if (floorKey === "") return "";
    let buildAndFloor = floorKey.split('_');
    let build = buildAndFloor[0];
    let floor = buildAndFloor[1];
    let floorFlag = floor.replace(/[\d]+/, "");
    let floorNum = parseInt(floor.replace(/[A-z]+/, ""));
    // 地面无法确定那个建筑
    if (floorFlag === 'B' && floorNum === 1) {
      return `${build}_F1`
    } else if (build !== "W1" && floorFlag === "F") {
      return `${build}_${floorFlag}${++floorNum}`
    } else if (build !== "W1" && floorFlag === "B") {
      return `${build}_${floorFlag}${--floorNum}`
    }
    return ""
  }

  // 获取下一楼层
  getDownFloor(floorKey) {
    if (floorKey === "") return "";
    let buildAndFloor = floorKey.split('_');
    let build = buildAndFloor[0];
    let floor = buildAndFloor[1];
    let floorFlag = floor.replace(/[\d]+/, "");
    let floorNum = parseInt(floor.replace(/[A-z]+/, ""));
    // 地面无法确定那个建筑
    if (floorFlag === 'F' && floorNum === 1) {
      return `${build}_B1`;
    } else if (build !== "W1" && floorFlag === 'F') {
      return `${build}_${floorFlag}${--floorNum}`;
    } else if (build !== "W1" && floorFlag === 'B') {
      return `${build}_${floorFlag}${++floorNum}`;
    }
    return ""
  }

  getDNOCoincide(points1, points2, dno1, dno2, cond) {
    let exits = []
    let exits1 = points1.filter(x => x.DNO === dno1)
    let exits2 = points2.filter(x => x.DNO === dno2)
    for (const e1 of exits1) {
      for (const e2 of exits2) {
        if (cond(e1.coordinates, e2.coordinates) === true) {
          exits.push(e1);
        }
      }
    }
    return exits;
  }

  getDNOCoincideBothExists(points1, points2, dno1, dno2, cond) {
    let exits = []
    let exits1 = points1.filter(x => x.DNO === dno1)
    let exits2 = points2.filter(x => x.DNO === dno2)
    if (exits1.length > 0 && exits2.length > 0) {
      for (const e1 of exits1) {
        for (const e2 of exits2) {
          if (cond(e1.coordinates, e2.coordinates) === true) {
            exits.push(e1)
          }
        }
      }
      return exits.length > 0;
    } else {
      return true;
    }
  }

  // 判断出口是否合并
  isChukouOk(points1, points2) {
    // let exits = this.getDNOCoincide(points1, points2, 5, 5
    //   , (p1, p2) => shortPathService.pointEqualTo(p1, p2))
    let exits = this.getDNOCoincide(points1, points2, 5, 5
      , (p1, p2) => shortPathService.getDistance(p1, p2) < 0.099) // 相机0.5米
    return exits.length > 0;
  }

  // 判断 电梯是否合并
  isChuKouOneOk(points1, points2) {
    return this.getDNOCoincideBothExists(points1, points2, 1, 1, (p1, p2) => shortPathService.getDistance(p1, p2) < 2)
  }

  // 判断 电梯是否合并
  isChuKouThreeOk(points1, points2) {
    return this.getDNOCoincideBothExists(points1, points2, 3, 3, (p1, p2) => shortPathService.getDistance(p1, p2) < 2)
  }

  // 检查楼梯
  isChuKou46Ok(points1, points2, isTop = false) {
    let distanceStair = 4
    if (isTop) {
      let exits = this.getDNOCoincide(points1, points2, 6, 4
        , (p1, p2) => shortPathService.getDistance(p1, p2) < distanceStair) // 顶楼需要4点
      return exits.length > 0;
    } else {
      let exits4 = this.getDNOCoincide(points1, points2, 4, 6
        , (p1, p2) => shortPathService.getDistance(p1, p2) < distanceStair); // 2米之内, 可以连通
      let exits6 = this.getDNOCoincide(points1, points2, 6, 4
        , (p1, p2) => shortPathService.getDistance(p1, p2) < distanceStair); // 2米之内, 可以连通
      return exits4.length > 0 && exits6.length > 0;
    }
  }

  // 绘制区域
  drawBoundaryFunc() {
    let _this = this;
    _this.drawBoundary.current = []
    _this.drawBoundaryObj.current = null;
    console.log('添加点击事件', this.svg.current)

    function drawPolyon(e) {
      let pointCurr = _this.getPointCurr([e.offsetX, e.offsetY])

      _this.drawBoundary.current.push(pointCurr);

      d3Service.drawPoint(_this.svgG.current, pointCurr) // 画点

      console.log('点击事件', _this.drawBoundary.current);
      if (!_this.drawBoundaryObj.current) {
        _this.drawBoundaryObj.current = _this.svgG.current.append('polygon');
      }
      _this.drawBoundaryObj.current.attr('points', _this.drawBoundary.current.join(' '))
        .attr("fill", "rgba(0,0,0,0.2)");
    }

    _this.svg.current.addEventListener('click', drawPolyon)
    _this.svg.current.addEventListener('contextmenu', function rightClick(e) {
      React.$message.success('绘制结束')

      // 保存到state
      settingService.setStateByObj({'drawBoundary': _this.drawBoundary.current.map(x => [x[0] * 100, x[1] * -100])})

      _this.svg.current.removeEventListener('contextmenu', rightClick);
      _this.svg.current.removeEventListener('click', drawPolyon);
      e.preventDefault();
    });
  }

  // 读取时重新绘制区域
  redrawBoundary() {
    let drawBoundary = settingService.getState('drawBoundary')
    this.drawBoundary.current = drawBoundary.map(x => [x[0] / 100, x[1] / -100])
    this.drawBoundaryObj.current = this.svgG.current.append('polygon');

    this.drawBoundaryObj.current.attr('points', this.drawBoundary.current.join(' '))
      .attr("fill", "rgba(0,0,0,0.2)");
  }

  render() {
    return <div style={{width: '100%', height: '100%', position: 'relative'}}>
      <div className={Css.mainTool} style={{height: this.state.dialogHeight === 'auto' ? '0' : 'auto', overflow: 'hidden'}}>
        <button onClick={() => {
          this.setState({
            dialogHeight: 'auto'
          });
        }}>显示
        </button>
      </div>
      <div className={Css.mainTool} style={{height: this.state.dialogHeight, overflow: 'hidden'}}>
        <button onClick={() => {
          this.setState({dialogHeight: '0'});
        }}>隐藏
        </button>
        <button onClick={() => { this.judgeGraphConnection();}}>连通性</button>
        <button onClick={() => { this.judgePointSoClose();}}>连通性所有点</button>
        <button onClick={() => { this.judgePointOnlineEnd();}}>判断线段两端是否有点</button>
        <button onClick={() => { this.checkConnectionDiffFloor();}}>连通性(不同楼层)</button>
        &nbsp;
        <button onClick={() => { this.checkData(this.state.dataSourceShow);}}>正确性</button>
        &nbsp;
        <button onClick={() => { this.drawBoundaryFunc();}}>绘制区域</button>
        &nbsp;
        <Checkbox checked={this.state.isDrawDNO} onChange={(e) => { this.setState({isDrawDNO: e.target.checked})}}>显示DNO</Checkbox>
        <Checkbox checked={this.state.isDrawId} onChange={(e) => { this.setState({isDrawId: e.target.checked})}}>显示id</Checkbox>
        &nbsp;
        <button onClick={() => { this.selectPoints() }}>选取点</button>
        &nbsp;
        <input value={this.state.paintsToDraw} onChange={(e) => {
          this.setState({paintsToDraw: e.target.value});
        }}/>
        <button onClick={() => {
          let point = JSON.parse(this.state.paintsToDraw);
          d3Service.drawPoint(this.svgG.current, [point.x, point.y])
          luwangService.addPoint2Req({...point, z: 0, id: 0, floor: 'W1'});
        }}>绘制点
        </button>
        &nbsp;
        <button onClick={() => {this.init()}}>清空</button>
        <button onClick={() => {
          let tran = this.svg.current.style.transform;
          let match = tran.match(/rotateX\((.*)deg\) rotateY\((.*)deg\)/)
          console.log('正则匹配翻转角度', tran, match)
          let res = match[1] === '180' ? '0' : '180';
          this.svg.current.style.setProperty('transform'
            , `rotateX(${res}deg) rotateY(${match[2]}deg)`);
        }}>x反转
        </button>
        <button onClick={() => {
          let tran = this.svg.current.style.transform;
          let match = tran.match(/rotateX\((.*)deg\) rotateY\((.*)deg\)/)
          console.log('正则匹配翻转角度', tran, match)
          let res = match[2] === '180' ? '0' : '180';
          this.svg.current.style.setProperty('transform'
            , `rotateX(${match[1]}deg) rotateY(${res}deg)`);
        }}>y反转
        </button>
        &nbsp;mousePosition:
        <input ref={this.positionInputRef} type="text" defaultValue={JSON.stringify(this.state.setting.offset)}/>
        &nbsp;transform:
        <input ref={this.transformInputRef} type="text" defaultValue={JSON.stringify(this.transformRef.current)} style={{width: '500px'}}/>
        <div style={{color: 'red'}}>顶楼必须有4点, 底楼必须有6点</div>
        <div style={{position: 'relavtive'}}>
          <ATable style={{width: 'calc(100% - 10px)'}} columns={this.state.columns} pagination={{pageSize: 5}} dataSource={this.state.dataSourceShow} onChange={(i, e) => {
            console.log('点击行', i, e);
            console.log('绘制路径', e.map(x => x.coordinates));
            for (const p of e) {
              d3Service.drawLine(this.svgG.current, p.coordinates, 'yellow');
            }
          }} scroll={{y: 250}}/>
        </div>

      </div>

      <div className={Css.svgContainer}>
        <svg ref={this.svg} id="mainSvg" className={Css.mainSvg} style={{transform: `scale(${this.state.setting.scale}) rotateX(0) rotateY(0)`}}/>
      </div>
    </div>
  }
}

export default MapSvg;