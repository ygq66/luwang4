import React, {useEffect} from "react";
import {Select} from 'antd';
import "./aselect.module.scss";

function ASelect(props) {

  const {Option} = Select;

  let attrOnSearch = () => {
    if (props.showSearch) {
      return {onSearch: props.onSearch || (() => { })}
    } else {
      return {}
    }
  }

  useEffect(() => {
    console.log('ASelect list', props.list)
  }, []);

  return (
    <Select defaultValue={props.defaultValue || undefined} value={props.value || undefined}
            placeholder={props.placeholder || ''}
            style={props.style || {}}
            className={props.className || ''}
            showSearch={props.showSearch || false}
            {...attrOnSearch()}
            onBlur={props.onBlur || (() => { })}
            onChange={props.onChange || (() => { })}>
      {(() => {
        let list = (props.list || []);
        if (Array.isArray(list) === false) {
          console.error('ASelect list 不是数组', list);
          return [];
        }
        return list.map((item, i) => {
          return <Option key={i} value={typeof item === 'string' ? item : item[props.optionKey]}>
            {typeof item === 'string' ? item : item[props.optionValue]}
          </Option>
        })
      })()}
    </Select>
  )
}

export default ASelect;
