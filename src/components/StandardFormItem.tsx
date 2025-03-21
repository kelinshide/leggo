import React from "react";
import { Form } from "antd";
import { TConfigs } from "../interface";
import { Leggo } from "../utils/Leggo";

export default function StandardFormItem(
  props: React.PropsWithoutRef<{
    StandardInput: any;
    configs: TConfigs;
  }>
) {
  const { StandardInput, configs } = props;
  const { itemProps, inputProps, extra } = configs;

  //这里注释全部以StandardInput: Input举例

  return (
    <Form.Item
      {...itemProps}
      // itemProps.rules itemProps里面的rules rules: [{ required: true, message: '请输入标题！' }],
      //wordsLimit: null
      rules={Leggo.createRules(itemProps.rules, extra?.wordsLimit)}
    >
      {/* inputProps是默认的属性比如 
      StandardInput: Input,
        configs: {
          itemProps: {
            name: 'input',
            label: '标题',
            initialValue: undefined,
            rules: [{ required: true, message: '请输入标题！' }],
            noStyle: false,
            trigger: 'onChange',
            hidden: false,
      },*/}
      <StandardInput {...inputProps}>
        {/* createChildren 如果childrenNode是组件则返回渲染结果，如果是字符串直接返回字符串 */}
        {/*  目前只有这两个：childrenNode: "Submit",   和  childrenNode: () => (
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        ), */}
        {Leggo.createChildren(extra?.childrenNode)}
      </StandardInput>
    </Form.Item>
  );
}
