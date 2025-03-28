import React from "react";
import { message } from "antd";
import { TConfigs, TMiddleware, TSchemaModel, TWordsLimit } from "../interface";
import { wordsLimitValidator } from "./wordsLimitValidator";

export class Leggo {
  // 如果没有字符限制wordsLimit 返回rules   有的话就带上wordsLimit
  static createRules(rules: any, wordsLimit: TWordsLimit) {
    return wordsLimit
      ? [...rules, { validator: wordsLimitValidator.bind(null, wordsLimit) }]
      : rules;
  }
  static createChildren(childrenNode: string | React.FC) {
    if (!childrenNode) {
      return;
    }
    const childrenType = typeof childrenNode;
    if (childrenType === "function") {
      const Node = childrenNode;
      /**
       * <Node />相当于React.createElement(Node) 调用Node组件并返回结果(JSX  <div><div/>这种)
      但是不能写成 return Node()  
      因为直接 Node() 执行时，它是在 普通 JavaScript 函数上下文 中运行的，而不是 React 组件树中。 
      React Hooks 必须在组件内部调用，否则会报错。
       */
      return <Node />;
    }
    if (childrenType === "string") {
      return childrenNode;
    }
  }
  private readonly forceLeggoFormRender: () => void;
  public readonly ref: React.MutableRefObject<any>;
  public schemaModel: TSchemaModel;
  public publicStates = {};
  public allDisabledIsLockedToTrue = false;
  public forceRenderMark = false;
  constructor(
    keyRef: React.MutableRefObject<any>,
    setForceRender: React.Dispatch<React.SetStateAction<number>>,
    schemaModel0: TSchemaModel,
    middleware?: TMiddleware,
    publicStates?: object
  ) {
    this.ref = keyRef;
    this.schemaModel = this.parseSchemaModel(schemaModel0, middleware);
    if (publicStates) {
      this.publicStates = publicStates;
    }
    this.forceLeggoFormRender = () => {
      this.forceRenderMark = !this.forceRenderMark;
      setForceRender((pre) => pre + 1);
    };
  }
  private parseSchemaModel(
    schemaModel0: TSchemaModel,
    middleware?: TMiddleware
  ): TSchemaModel {
    try {
      schemaModel0?.schemaList.forEach((schema, index) => {
        schema.linkingStringedNames = new Set();
        schema.getStringedName = () => String(schema.configs.itemProps.name);
        middleware && middleware(schema.configs, index);
      });
    } catch (e) {
      message.error("解析失败!");
      console.log(e);
    } finally {
      return schemaModel0;
    }
  }
  public resetSchemaModel(
    newSchemaModel0: TSchemaModel,
    middleware?: TMiddleware,
    publicStates?: object
  ) {
    this.schemaModel = this.parseSchemaModel(newSchemaModel0, middleware);
    if (publicStates) {
      this.publicStates = publicStates;
    }
    this.forceLeggoFormRender();
  }
  public updateSchema(
    formItemName: string,
    changeSchemaFunc: (configs: TConfigs) => void
  ) {
    const targetSchema = this.schemaModel?.schemaList.find(
      (schema) => schema.getStringedName() === String(formItemName)
    );
    if (targetSchema) {
      const { configs } = targetSchema;
      changeSchemaFunc(configs);
      targetSchema.forceLeggoFormItemRender?.();
    }
  }
  public lockAllDisabledToTrue(status: boolean = true) {
    this.allDisabledIsLockedToTrue = status;
    this.schemaModel.schemaList.forEach(
      (schema) => (schema.configs.inputProps.disabled = status)
    );
    this.forceLeggoFormRender();
  }
}
