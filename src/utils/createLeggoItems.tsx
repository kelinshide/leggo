import React from "react";
import StandardFormItem from "../components/StandardFormItem";
import { leggoItemStore } from "../itemStore";

export function createLeggoItems(storeKey: keyof typeof leggoItemStore) {
  const result = [];
  const selectedStore = leggoItemStore[storeKey];

  // 绑定到onDragStart 拖动开始事件
  const handleDragStart = (e: React.DragEvent) => {
    //@ts-ignore
    //这里e.target.dataset.type获取到的就是data-type={type}这里给的type
    const schemaType = e.target.dataset.type;
    //dataTransfer 是 DragEvent 提供的 API，专门用于在 拖拽开始 (onDragStart) 和 拖拽放置 (onDrop) 之间存储和传递数据
    //如果没有这个，drop之后e就变成了目标放置区域，就没办法拿到type了
    e.dataTransfer.setData("text/plain", schemaType);
  };

  for (const value of Object.values(selectedStore)) {
    const { type, StandardInput, configs } = value;
    const item = (
      <div
        key={type}
        className="item"
        // draggable默认等于draggable={true}即可拖动
        draggable
        onDragStart={handleDragStart}
        // 相当于给元素一个自定义属性  可以以 data-* 这种形式
        data-type={type}
      >
        <div className="item-forbidden">
          {/* StandardInput就是一个描述的元素，StandardInput: Input, */}
          {/* configs是基本的配置文件 */}
          <StandardFormItem StandardInput={StandardInput} configs={configs} />
        </div>
      </div>
    );
    result.push(item);
  }

  return result;
}
