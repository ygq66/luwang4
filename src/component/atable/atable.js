import React, {useEffect, useState} from "react";
import {Table, Tag, Space} from 'antd';

function ATable(props) {
  const [columns, setColumns] = useState([])
  const [dataSource, setDataSource] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  useEffect(() => {
    if (props.columns) {
      setColumns(props.columns);
    }
  }, [props.columns]);

  useEffect(() => {
    if (props.dataSource) {
      props.dataSource.forEach((x, i) => {
        x.key = i
      })
      setDataSource(props.dataSource)
    }
    if (!props.columns) {
      setColumns(() => {
        if (!props.dataSource || props.dataSource.length === 0) return [];
        let res = Object.keys(props.dataSource[0]).map(x => {
          return {title: x, dataIndex: x, key: x,}
        });
        console.log('自动生成列表', res);
        return res;
      })
    }
  }, [props.dataSource])

  return <Table style={props.style || {}} pagination={props.pagination || {}} columns={columns} dataSource={dataSource} scroll={props.scroll || {x: 'max-content'}} rowSelection={
    {
      selectedRowKeys: selectedRowKeys
      , onChange: (i, e) => {
        setSelectedRowKeys(i);
        props.onChange && props.onChange(i, e);
      }
    }
  }/>
}

export default ATable;