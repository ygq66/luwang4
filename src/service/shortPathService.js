let shortPathService = {
  pathArr: [],
  startEndPoint: {start: [50, 50], end: [400, 400]}, // 开始结束点位
  getAngle: ({x: x1, y: y1}, {x: x2, y: y2}) => {
    const dot = x1 * x2 + y1 * y2
    const det = x1 * y2 - y1 * x2
    const angle = Math.atan2(det, dot) / Math.PI * 180
    return Math.round(angle + 360) % 360
  },
  // 获取点到一条最近点
  getNearestPointForLine(pointCurr, line) {
    let linePoint1 = line[0]
    let linePoint2 = line[1]
    let angle = shortPathService.getAngle({
      x: linePoint1[0] - linePoint2[0],
      y: linePoint1[1] - linePoint2[1],
    }, {
      x: pointCurr[0] - linePoint2[0],
      y: pointCurr[1] - linePoint2[1],
    });
    angle = angle > 180 ? 360 - angle : angle;
    console.log('获取角度angle', angle);

    let angle2 = shortPathService.getAngle({
      x: linePoint2[0] - linePoint1[0],
      y: linePoint2[1] - linePoint1[1],
    }, {
      x: pointCurr[0] - linePoint1[0],
      y: pointCurr[1] - linePoint1[1],
    });
    angle2 = angle2 > 180 ? 360 - angle2 : angle2
    console.log('获取角度angle2', angle2);

    let nextPoint;
    if (angle > 90 || angle2 > 90) { // 钝角
      if (angle > 90) {
        nextPoint = linePoint2
      } else {
        nextPoint = linePoint1
      }
    } else {
      // 计算斜率, 线段
      let k = (linePoint1[1] - linePoint2[1]) / (linePoint1[0] - linePoint2[0]);
      let b = linePoint1[1] - k * linePoint1[0]
      console.log('计算斜率', k)
      console.log('垂直线段的斜率', 1 / k);
      // 垂直的线段
      let k2 = -1 / k;
      let b2 = pointCurr[1] - k2 * pointCurr[0];

      let pointIntersectionX = (b2 - b) / (k - k2)
      let pointIntersectionY = k * pointIntersectionX + b;
      nextPoint = [pointIntersectionX, pointIntersectionY]

      console.log('计算垂直线段的交点', nextPoint);
      // 直线交点
    }
    console.log('最近点是', nextPoint);
    // 绘制nextPoint
    // shortPathService.drawLine([pointCurr, nextPoint]);
    return [pointCurr, nextPoint];
  },
  // 点到多条线段最短的路径
  getNearestPointMin(pointCurr, lines) {
    let minLine = {};
    for (const item of lines) {
      let lineTmp = shortPathService.getNearestPointForLine(pointCurr, item); // 获取的线段
      let nextPoint = lineTmp[1];
      let distanceTmp = shortPathService.getDistance(pointCurr, lineTmp[1]);
      if (Object.keys(minLine).length === 0 || minLine.distance > distanceTmp) {
        minLine.line = lineTmp;
        minLine.point = lineTmp[1];
        minLine.distance = distanceTmp;
        if (!shortPathService.pointEqualTo(nextPoint, item[0]) && !shortPathService.pointEqualTo(nextPoint, item[1])) { // 垂直
          minLine.path = [[item[0], nextPoint], [item[1], nextPoint], [pointCurr, nextPoint]];
        } else {
          minLine.path = [[pointCurr, nextPoint]]; // 钝角
        }
      }
    }
    return minLine;
  },
  // 获取两点的距离
  getDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
  },
  // 获取点的去重[[[],[]],[[],[]]] => [[],[],[],[]]
  getDistinct(map, res = []) {
    // 遍历所有节点, 去重
    for (const mapArr of map) {
      for (const mapElement of mapArr) {
        let ele = res.filter(resElement => shortPathService.pointEqualTo(mapElement, resElement))[0]
        if (!ele) {
          res.push(mapElement);
        }
      }
    }
    return res;
  },
  getAll(map, res = []) {
    // 遍历所有节点, 去重
    for (const mapArr of map) {
      for (const mapElement of mapArr) {
        res.push(mapElement);
      }
    }
    return res;
  },
  getPointMap(map, res = []) {
    // res = shortPathService.getDistinct(map, res);
    let resMap = []
    let targetObj = [];
    for (let i = 0; i < res.length; i++) {
      let resElement = res[i];
      targetObj = {point: resElement, idx: i, target: []}; // 起点
      for (const mapElement of map) { // 所有能到达的节点
        if (shortPathService.pointEqualTo(mapElement[0], resElement)) {
          targetObj.target.push(shortPathService.findIndex(res, mapElement[1]));
        } else if (shortPathService.pointEqualTo(mapElement[1], resElement)) {
          targetObj.target.push(shortPathService.findIndex(res, mapElement[0]));
        }
      }
      resMap.push(targetObj);
    }
    return resMap;
  },
  // 获取点在数组中的索引
  findIndex(res, point) {
    for (let i = 0; i < res.length; i++) {
      if (shortPathService.pointEqualTo(res[i], point)) {
        return i
      }
    }
    return -1;
  },
  // 判断两点相等
  pointEqualTo(point1, point2) {
    return point1[0] === point2[0] && point1[1] === point2[1];
    // return Math.abs(point1[0] - point2[0]) < 0.001 && Math.abs(point1[1] - point2[1]) < 0.001;
  },
  // bfs最短路径
  allPathsSourceTarget(graph, begin, target) {
    let ans = [];
    let nodeQ = [begin];
    let visited = []
    let pathQ = [[begin]];
    while (nodeQ.length !== 0) {
      let node = nodeQ.shift();
      let path = pathQ.shift();
      // eslint-disable-next-line no-loop-func
      graph[node].forEach(x => {
        if (x === target) {
          ans.push([...path, x]);
          visited = [];
        } else if (visited.indexOf(x) < 0) {
          nodeQ.push(x);
          visited.push(x)
          pathQ.push([...path, x]);
        }
      })
    }
    return ans;
  },
  selectTwoPoint(point) {
    shortPathService.startEndPoint.start = shortPathService.startEndPoint.end;
    shortPathService.startEndPoint.end = point;
  },
  getPaths() {
    // 计算所有路径
    shortPathService.drawPoint(shortPathService.startEndPoint.start)
    shortPathService.drawPoint(shortPathService.startEndPoint.end)

    let minLineStart = shortPathService.getNearestPointMin(shortPathService.startEndPoint.start, shortPathService.pathArr);
    let minLineEnd = shortPathService.getNearestPointMin(shortPathService.startEndPoint.end, shortPathService.pathArr);
    // 绘制最短的线段
    shortPathService.drawLine(minLineStart.line);
    shortPathService.drawLine(minLineEnd.line);

    // 添加垂直点的path
    shortPathService.pathArr = shortPathService.pathArr.concat(minLineStart.path).concat(minLineEnd.path);
    console.log('添加起始点, 结束点的位置', shortPathService.pathArr);

    let distinctArr = shortPathService.getDistinct(shortPathService.pathArr, [shortPathService.startEndPoint.start, shortPathService.startEndPoint.end]);
    for (let i = 0; i < distinctArr.length; i++) {
      shortPathService.drawText(i, distinctArr[i]);
    }
    let edges = shortPathService.getPointMap(shortPathService.pathArr, distinctArr); //
    console.log('获取所有边', edges);
    let allPath = shortPathService.allPathsSourceTarget(edges.map(x => x.target), 0, 1);
    console.log('获取所有路径', allPath);
  },
  // 路径串变路径对[1,2,3]=>[1,2],[2,3]
  getPathArr(arr) {
    let pathArr = []
    for (let i = 0; i < arr.length - 1; i++) {
      pathArr.push([arr[i], arr[i + 1]]);
    }
    return pathArr;
  },
  // 判断连通性
  judgeGraphConnection(graph, distinctList) {

    // Union-Find Set
    let father = distinctList.map((x, i) => i);
    let len = graph.length;

    function find(x) {
      let a = x; // 存储a
      while (x !== father[x]) {
        x = father[x];
      } // 找到根节点
      while (a !== father[a]) {
        a = father[a];
        father[a] = x;
      } // 更新根节点
      return x;
    }

    function union(a, b) {
      let fA = find(a);
      let fB = find(b);
      let faSave = fA
      let fbSave = fB
      father[a] = father[b] = Math.min(fA, fB); // 合并
      for (let i = 0; i < father.length; i++) { // 更新子节点
        if (father[i] === faSave) {
          father[i] = father[a];
        }
        if (father[i] === fbSave) {
          father[i] = father[a];
        }
      }
    }

    for (let i = 0; i < len; i++) {
      for (let j = 0; j < graph[i].target.length; j++) {
        if (father[i] !== father[graph[i].target[j]]) { // 是能连接的
          // console.log('合并', i, graph[i].target[j]);
          union(i, graph[i].target[j]);
        }
      }
    }

    return father;
  },
}

export default shortPathService;