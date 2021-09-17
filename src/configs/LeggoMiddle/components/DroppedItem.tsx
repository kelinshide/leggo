import React from 'react'
import { Button, Form } from 'antd'
import { TSchema } from '../../../interface'
import { leggoItemStore } from '../../../service'


export function DroppedItem(props: React.PropsWithoutRef<{
  activeSchema: React.MutableRefObject<TSchema>,
  schema: TSchema,
  setSchemaList: React.Dispatch<React.SetStateAction<TSchema[]>>,
  forceRender: () => void,
}>){
  const { activeSchema, schema, setSchemaList, forceRender }= props
  const { id, type, configs }= schema
  const StandardItemFC= leggoItemStore.total[type].StandardItemFC
  const active= activeSchema.current === schema

  const deleteSchema= (e: React.MouseEvent) => {
    e.stopPropagation()
    if(active){ activeSchema.current= null }
    setSchemaList(pre => pre.filter(it => it.id !== id))
    forceRender()
  }

  const activateSchema= (e: React.MouseEvent) => {
    e.stopPropagation()
    activeSchema.current= schema
    forceRender()
  }

  return (
    <div className={`dropped-item ${active ? 'active-item' : ''}`} onClick={activateSchema}>
      <Button type="text" className="delete-butt" onClick={deleteSchema}>X</Button>
      <Form.Item {...configs.itemProps}>
        <StandardItemFC {...configs} />
      </Form.Item>
    </div>
  )
}
