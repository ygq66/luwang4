import Css from './dialogSetting.module.scss'
import React, {useEffect, useState} from 'react'
import {useMappedState} from 'redux-react-hook'
import utils, {formatJSON} from "../../utils/untils";
import configService from "../../service/configService";
import settingService from "../../service/settingService";

export default function DialogSetting(props) {

  const [isShow, setIsShow] = useState(false)
  const setting = useMappedState(state => state.setting);

  useEffect(() => {
    setting.forEach(x => {
      if (x.type === 'object') {
        x.valueStr = utils.beautifyJSON(JSON.stringify(x.value))
      }
    })
  }, []);


  useEffect(() => {
    console.log('显示隐藏配置dialog', props.isShow);
    setIsShow(props.isShow);
  }, [props.isShow])

  function onChange(e, obj) {
    let matchSetting = setting.filter(x => x.key === obj.key)[0]
    console.log('修改对应配置', matchSetting);
    if (matchSetting) {
      matchSetting.valueStr = e.target.value;
    }
    React.$store.dispatch({type: 'simple', setting: [...setting]});
  }

  // 确定
  function ok() {
    let isOk = true;
    setting.forEach(x => {
      try {
        if (x.type === 'object') {
          x.value = JSON.parse(formatJSON(x.valueStr));
        } else if (x.type === 'number') {
          x.value = parseFloat(x.valueStr);
        }
      } catch (e) {
        console.error(`${x.key} 的值 无效`);
        React.$message.error(`${x.key} 的值 无效`)
        isOk = false;
      }
    })
    if (isOk === true) {
      props?.onClose();
      settingService.setStateByObj({setting: [...setting]})
      configService.refreshConfig(); // 刷新配置
    }
  }

  function getHeightByType(type) {
    switch (type) {
      case 'number':
        return 30
      case 'object':
        return ''
      default:
        return 30;
    }
  }

  return (isShow === true
      ? <div className={Css.main}>
        {setting.map((x, i) => {
          return <div key={i} style={{textAlign: 'left', display: 'flex', justifyContent: 'space-between', width: '100%'}}>
            <span>{x.key}</span>
            <textarea className={Css.textareaCss} onChange={(e) => {
              onChange(e, x);
            }} value={x.valueStr} style={{height: getHeightByType(x.type)}}/>
          </div>
        })}
        <div>
          <button onClick={ok}>确定</button>
          <button onClick={() => {
            props?.onClose();
          }}>取消
          </button>
        </div>
      </div>
      : ''
  );

}