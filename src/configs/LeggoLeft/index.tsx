import React, { useMemo, useState } from "react";
import { Form, Menu } from "antd";
import { leggoItemStore } from "../../itemStore";
import { createLeggoItems } from "../../utils/createLeggoItems";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

function LeggoLeft() {
  const [storeKey, setStoreKey] = useState("antd");
  //这一块就是把大类中的组件渲染出来并给他们添加拖拽事件
  const leggoItems = useMemo(
    // 这里其实本质上就是传入一个字符串
    // typeof 是用来获取leggoItemStore的类型  js中运行结果是'object', ts中运行结果是:{ total: { /* 对象 */ },  antd: { /* 对象 */ }}
    // keyof 是用来获取leggoItemStore的key
    //as 关键字在 TypeScript 中用于类型断言，即告诉 TypeScript 把某个值视为特定类型，但不会影响运行时行为。
    // 所以这里就是告诉ts这个storeKey是leggoItemStore的key
    // createLeggoItems这个函数就是根据传入的key渲染可拖动的部分
    () => createLeggoItems(storeKey as keyof typeof leggoItemStore),
    [storeKey]
  );
  // 这里就是渲染出三个大类
  // useMemo用于缓存计算结果，防止不必要的计算
  const menuItems = useMemo(
    () =>
      // 这里keys()会默认把key值转换成字符串
      Object.keys(leggoItemStore).map((item) => (
        <Menu.Item key={item}>{item}</Menu.Item>
      )),
    []
  );

  return (
    <>
      <div>
        <div className="top-area">
          <strong>组件库</strong>
        </div>
        <Menu
          defaultSelectedKeys={["antd"]}
          mode="inline"
          onSelect={({ key }) => setStoreKey(key)}
        >
          {menuItems}
        </Menu>
      </div>
      <div className="leggo-configs-left">
        {/* 可拖动的属性 */}
        <Form {...layout}>
          {/* leggoItems是可拖动到部分 */}
          <div className="leggo-configs-left-form-content">{leggoItems}</div>
        </Form>
      </div>
    </>
  );
}

export default React.memo(LeggoLeft);
