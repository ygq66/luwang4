import Css from './atree.module.css'
import {Tree} from 'antd';
import {useRef, useState} from "react";

export default function Atree(props) {
  const treeParentRef = useRef()
  const treeRef = useRef()
  const treeData = [
    {
      title: 'parent 1',
      key: '0-0',
      children: [
        {
          title: 'parent 1-0',
          key: '0-0-0',
          disabled: true,
          children: [
            {
              title: 'leaf',
              key: '0-0-0-0',
              disableCheckbox: true,
            },
            {
              title: 'leaf',
              key: '0-0-0-1',
            },
          ],
        },
        {
          title: 'parent 1-1',
          key: '0-0-1',
          children: [
            {
              title: (
                <span
                  style={{
                    color: '#1890ff',
                  }}
                >
                sss
              </span>
              ),
              key: '0-0-1-0',
            },
          ],
        },
      ],
    },
  ];

  const onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
    if (props.onSelect) {
      props.onSelect(selectedKeys, info);
    }
  };

  const onCheck = (checkedKeys, info) => {
    // console.log('onCheck', checkedKeys, info);
    if (props.onCheck) {
      props.onCheck(checkedKeys, info);
    }
  };

  const [menuState, setMenuState] = useState({
    pageX: "",
    pageY: "",
    id: "",
    categoryName: ""
  })

  // tree列表上右键事件
  function onRightClick(e) {
    let x = treeParentRef.current.getBoundingClientRect().left;
    let y = treeParentRef.current.getBoundingClientRect().top;
    console.log('弹出右键菜单', treeParentRef.current, e.event.pageX, e.event.pageY, x, y)

    setMenuState({
      pageX: e.event.pageX - x + 10,
      pageY: e.event.pageY - y + 10,
      node: e.node,
      show: true,
    });
    document.documentElement.addEventListener('click', hideMenu)
  }

  // 自定义右键菜单内容
  function hideMenu() {
    let obj = {...menuState}
    obj.show = false
    setMenuState(obj)
    document.documentElement.removeEventListener('click', hideMenu)
  }

  function getNodeTreeRightClickMenu() {
    const {pageX, pageY, show, node} = menuState;
    const tmpStyle = {
      position: "absolute",
      left: `${pageX}px`,
      top: `${pageY}px`,
      display: show === true ? 'inline-block' : 'none'
    };
    const menu = (
      <div id={'menuItem'} style={tmpStyle} className={Css.rightMenu}>
        {(props.menus || []).map((x, i) => {
          return <div key={i} className={Css.menuItem} onClick={e => {
            x.onClick(e, node)
          }}>{x.title}</div>
        })}
      </div>
    );
    return menuState.show === false ? "" : menu;
  }

  return (
    <div ref={treeParentRef}>
      <Tree
        ref={treeRef}
        checkable
        defaultExpandedKeys={['0-0-0', '0-0-1']}
        defaultSelectedKeys={props.checkedArr || []}
        checkedKeys={props.checkedKeys || []}
        onSelect={onSelect}
        onCheck={onCheck}
        onRightClick={onRightClick}
        showIcon={props.showIcon || false}
        treeData={props.treeData || treeData}
      />
      {getNodeTreeRightClickMenu()}
    </div>

  );

}