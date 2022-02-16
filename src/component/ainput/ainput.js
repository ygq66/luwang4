import React, {useEffect} from "react";
import {Select} from 'antd';
import "./ainput.module.scss";

function Ainput(props) {

  useEffect(() => {
  }, []);

  return (
    <input style={props.style || {}} onKeyDown={(e) => {
      props.onKeyDown && props.onKeyDown(e)
    }} type={props.type || "text"} value={props.value || ''} onChange={(e) => {props.setValue && props.setValue(e.target.value)}}/>
  )
}

export default Ainput;
