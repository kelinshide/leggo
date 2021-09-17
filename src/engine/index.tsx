import { Form, FormProps, message } from "antd"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { leggoItemStore } from "../service"
import { TSchemaModel, TSchema, TConfigs, TMiddleware, TStandardInputProps } from "../interface"
import axios from 'axios'
import { wordsLimitValidator } from "../utils"


const leggoStores= new WeakMap<React.MutableRefObject<any>, Leggo>()

class Leggo{
  static createCustomizedInput(CustomizedItemFC: React.FC, StandardItemFC: React.FC<TStandardInputProps>, configs: TConfigs) {
    return ({ value, onChange }: any) =>
      <CustomizedItemFC>
        <StandardItemFC value={value} onChange={onChange} {...configs} />
      </CustomizedItemFC>
  }
  private readonly forceLeggoFormRender: () => void
  public readonly ref: React.MutableRefObject<any>
  public readonly publicStates: object
  public schemaModel: TSchemaModel
  constructor(
    keyRef: React.MutableRefObject<any>, 
    setForceRender: React.Dispatch<React.SetStateAction<number>>,
    schemaModel0: TSchemaModel,
    middleware?: (value: TSchema, index: number, array: TSchema[]) => void,
    publicStates?: object,
  ){
    const schemaModel= this.parseSchemaModel(schemaModel0)
    this.ref= keyRef
    this.publicStates= publicStates || {}
    this.schemaModel= schemaModel
    this.forceLeggoFormRender= () => setForceRender(pre => pre+1)
    middleware && schemaModel?.schemaList.forEach(middleware)
  }
  private parseSchemaModel(schemaModel0: TSchemaModel): TSchemaModel{
    try{
      schemaModel0?.schemaList.forEach(schema => {
        schema.linkingNames= new Set()
        schema.getName= () => schema.configs.itemProps.name as string
      })
    }catch(e){
      message.error('解析失败!')
      console.log(e);
    }finally{
      return schemaModel0
    }
  }
  public resetSchemaModel(newSchemaModel0: TSchemaModel, middleware?: TMiddleware){
    const newSchemaModel= this.parseSchemaModel(newSchemaModel0)
    middleware && newSchemaModel.schemaList.forEach(middleware)
    this.schemaModel= newSchemaModel
    this.forceLeggoFormRender()
  }
  public updateSchema(formItemName: string, changeSchemaFunc: (configs: TConfigs) => void){
    const targetSchema= this.schemaModel?.schemaList.find(schema => schema.getName() === formItemName)
    if (targetSchema) {
      const { configs }= targetSchema
      changeSchemaFunc(configs)
      targetSchema.forceLeggoFormItemRender?.()
    }
  }
}


function LeggoForm(props: React.PropsWithoutRef<{leggo: Leggo} & FormProps>){
  const { leggo, onValuesChange, ...overlapFormProps }= props
  const { formProps, schemaList }= leggoStores.get(leggo.ref)?.schemaModel || {}

  const handleValuesChange= (changedValues: any, allValues: any) => {
    for(const [name, value] of Object.entries(changedValues)){
      const changedSchema= schemaList.find(schema => schema.getName() === name)
      changedSchema.currentItemValue= value
      changedSchema.linkingNames.forEach(linkingName => {
        const targetSchema= schemaList.find(schema => schema.getName() === linkingName)
        targetSchema.forceLeggoFormItemRender()
      })
    }
    onValuesChange(changedValues, allValues)
  }

  return (
    <Form {...formProps} {...overlapFormProps} onValuesChange={handleValuesChange}>
      {
        schemaList?.map(schema => <LeggoItem key={schema.id} leggo={leggo} schema={schema} schemaList={schemaList} />)
      }
    </Form>
  )
}
LeggoForm.useLeggo = (schemaModel0?: TSchemaModel, middleware?: TMiddleware, publicStates?: object): Leggo => {
  let leggo= null
  const keyRef= useRef(null)
  const [ , setForceRender]= useState(0)
  if (!leggoStores.has(keyRef)) {
    leggo= new Leggo(keyRef, setForceRender, schemaModel0, middleware, publicStates)
    leggoStores.set(keyRef, leggo) 
  }
  return leggo || leggoStores.get(keyRef)
}


function LeggoItem(props: React.PropsWithoutRef<{
  leggo: Leggo,
  schema: TSchema,
  schemaList: TSchema[],
}>){
  const { leggo, schema, schemaList }= props
  const { type, configs, needDefineGetterProps }= schema
  const { itemProps, extra, postman, CustomizedItemFC } = configs
  const postmanParamsValueList = postman?.params?.map(item => item.value) || []
  const postmanDataValueList= postman?.data?.map(item => item.value) || []
  const StandardItemFC= leggoItemStore.total[type]?.StandardItemFC || (() => <div />)
  const CustomizedInput= CustomizedItemFC && Leggo.createCustomizedInput(CustomizedItemFC, StandardItemFC, configs)
  const [ , setForceRender] = useState(0)
  const rules = useMemo(() => {
    if (extra?.wordsLimit) {
      return [...itemProps.rules, { validator: wordsLimitValidator.bind(null, extra.wordsLimit) }]
    } else {
      return itemProps.rules
    }
  }, [itemProps, extra])
  
  useMemo(() => {
    Object.values(needDefineGetterProps).forEach(getterInfo => {
      const { observedName, namepath, publicStateKey, reference, rule } = getterInfo
      const isFromPublicStates= observedName === 'publicStates'
      const linkedSchema= schemaList.find(schema => schema.getName() === observedName)
      //@ts-ignore
      const targetProp= namepath.slice(0, -1).reduce((pre, cur) => pre[cur], configs)
      const targetKey= namepath.slice(-1)[0]
      const targetType= typeof targetProp[targetKey]
      !isFromPublicStates && linkedSchema.linkingNames.add(schema.getName())
      Reflect.defineProperty(targetProp, targetKey, {
        get: () => {
          // @ts-ignore
          let targetValue= isFromPublicStates ? leggo.publicStates[publicStateKey] : linkedSchema.currentItemValue
          if(reference && rule){
            targetValue= targetValue?.toString()
            switch(rule){
              case '<':
                return targetValue < reference
              case '<=':
                return targetValue <= reference
              case '===':
                return targetValue === reference
              case '>=':
                return targetValue >= reference
              case '>':
                return targetValue > reference
            }
          }else{
            switch(targetType){
              case 'boolean':
                return Boolean(targetValue)
              case 'number':
                return Number(targetValue)
              case 'string':
                return targetValue?.toString()
              default:
                return targetValue
            }
          }
        }
      }) 
    })
  }, [])

  useEffect(() => {
    schema.forceLeggoFormItemRender= () => setForceRender(pre => pre+1)
  }, [])

  useEffect(() => {
    const { method, url, params, data }= postman || {}
    if(method && url){
      const paramsParsed = params?.reduce((pre, cur) => {
        //@ts-ignore
        pre[cur.key]= cur.value === '' ? undefined : cur.value
        return pre
      }, {})
      const dataParsed= data?.reduce((pre, cur) => {
        //@ts-ignore
        pre[cur.key]= cur.value
        return pre
      }, {})
      axios({ method, url, params: paramsParsed, data: dataParsed })
      .then(res => {
        configs.inputProps.options= res.data.data
        setForceRender(pre => pre+1)
      })
    }
  }, [...postmanParamsValueList, ...postmanDataValueList])

  return (
    <Form.Item {...configs.itemProps} rules={rules}>
      {
        CustomizedInput ? <CustomizedInput /> : <StandardItemFC {...configs} />
      }
    </Form.Item>
  )
}




export { LeggoForm }