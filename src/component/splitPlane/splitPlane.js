import React, {useEffect, useRef, useState} from 'react'
import Css from './splitPlane.module.scss'

export default function SplitPlane(props) {

  const posBegin = useRef({})
  const posCurr = useRef({})
  // const posUp = useRef({})
  const isMouseDown = useRef({})

  const [heightStrTop, setHeightStrTop] = useState('calc(50% - 5px)')
  const [heightStrBottom, setHeightStrBottom] = useState('calc(50% - 5px)')

  useEffect(() => {
    console.log('获取子组件', props.children)
  }, [])

  function splitStart(e) {
    if (e.target.id === 'splitPlane') {
      if (Object.keys(posBegin.current).length === 0) {
        console.log('begin 赋值')
        posBegin.current.x = e.clientX;
        posBegin.current.y = e.clientY;
      }
      isMouseDown.current.value = true;
    }
  }

  function spliting(e) {
    if (isMouseDown.current.value === true) {
      posCurr.current.x = e.clientX;
      posCurr.current.y = e.clientY;
      // console.log('当前位置', posCurr.current);
      let move = posCurr.current.y - posBegin.current.y;
      let moveAbs = Math.abs(move);

      setHeightStrTop(`calc(50% - 5px ${move < 0 ? '- ' + moveAbs : '+ ' + moveAbs}px)`);
      // console.log('设置高度', `calc(50% - 5px ${move < 0 ? '- ' + moveAbs : '+ ' + moveAbs}px)`);
      setHeightStrBottom(`calc(50% - 5px ${move > 0 ? '- ' + moveAbs : '+ ' + moveAbs}px)`);
    }
  }

  function splitEnd(e) {
    isMouseDown.current.value = false;
  }

  return <div onMouseDown={splitStart} onMouseMove={spliting} onMouseUp={splitEnd} style={props.style ? props.style : ''} className={`${Css.splitPlane} ${props.className ? props.className : ''}`}>
    <div style={{height: heightStrTop}}>
      {props.children[0]}
    </div>
    <div id={'splitPlane'} className={`${Css.splitLine}`}/>
    <div style={{height: heightStrBottom}}>
      {props.children[1]}
    </div>
  </div>
}