//格式化时间
export function timeFormat(date) {
  var json_date = new Date(date).toJSON();
  return new Date(new Date(json_date) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
}

export function formatJSON(str) {
  return str
    .replace(/[\s\t]*/g, '')
    .replace(/\\r/g, '').replace(/\\n/g, '').replace(/\r/g, '')
    .replace(/\n/g, '').replace(/\\"/g, "\"")
    .replace(/"{/g, "{").replace(/}"/g, "}")
}

let utils = {
  beautifyJSON(json, options) {
    let reg = null,
      formatted = '',
      pad = 0,
      PADDING = '    ';
    options = options || {};
    options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true : false;
    options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;
    if (typeof json !== 'string') {
      json = JSON.stringify(json);
    } else {
      json = JSON.parse(json);
      json = JSON.stringify(json);
    }
    reg = /([{}])/g;
    json = json.replace(reg, '\r\n$1\r\n');
    reg = /([\[\]])/g;
    json = json.replace(reg, '\r\n$1\r\n');
    reg = /(\,)/g;
    json = json.replace(reg, '$1\r\n');
    reg = /(\r\n\r\n)/g;
    json = json.replace(reg, '\r\n');
    reg = /\r\n\,/g;
    json = json.replace(reg, ',');
    if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
      reg = /\:\r\n\{/g;
      json = json.replace(reg, ':{');
      reg = /\:\r\n\[/g;
      json = json.replace(reg, ':[');
    }
    if (options.spaceAfterColon) {
      reg = /\:/g;
      json = json.replace(reg, ':');
    }
    (json.split('\r\n')).forEach(function (node, index) {
        let i = 0,
          indent = 0,
          padding = '';
        if (node.match(/\{$/) || node.match(/\[$/)) {
          indent = 1;
        } else if (node.match(/\}/) || node.match(/\]/)) {
          if (pad !== 0) {
            pad -= 1;
          }
        } else {
          indent = 0;
        }
        for (i = 0; i < pad; i++) {
          padding += PADDING;
        }
        if (node !== "") {
          formatted += padding + node + '\r\n';
        }
        pad += indent;
      }
    );
    return formatted;
  },
  groupBy: (list, fn) => {
    const groups = {};
    list.forEach(function (o) {
      let key = fn(o);
      let group;
      if (typeof key === 'string') {
        group = key;
      } else {
        group = JSON.stringify(key);
      }
      groups[group] = groups[group] || [];
      groups[group].push(o);
    });
    // return Object.keys(groups).map(function (group) {
    //     return groups[group];
    // });
    return groups;
  },
  groupBy2: (list, fn, valueFn) => {
    const groups = {};
    list.forEach(function (o) {
      let key = fn(o);
      let group;
      if (typeof key === 'string') {
        group = key;
      } else {
        group = JSON.stringify(key);
      }
      groups[group] = groups[group] || [];
      if (valueFn) {
        groups[group].push(valueFn(o));
      } else {
        groups[group].push(o);
      }
    });
    // return Object.keys(groups).map(function (group) {
    //     return groups[group];
    // });
    return groups;
  },
  // 防抖, 只执行第一次
  throttle(fn, interval) {
    // 维护上次执行的时间
    let last = 0;

    return function () {
      const context = this;
      const args = arguments;
      const now = Date.now();
      // 根据当前时间和上次执行时间的差值判断是否频繁
      if (now - last >= interval) {
        last = now;
        fn.apply(context, args);
      } else {
        // console.log('防抖')
      }
    };
  },
  // 只执行最后一次
  debounce(fn, delay = 500) {
    // 记录定时器返回的ID
    let timer = null;

    return function () {
      const context = this;
      const args = arguments;
      // 当有事件触发时清除上一个定时任务

      if (timer) {
        console.log('限流')
        clearTimeout(timer);
      } else {
        console.log('未限流')
      }
      // 重新发起一个定时任务
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, delay);
    };
  },
  //生成从minNum到maxNum的随机数
  randomNum(minNum, maxNum) {
    return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
  }
}

export default utils;