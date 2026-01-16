import React, {useState} from 'react';
import {Collapse, Form, Input, Select, Button, Tag, Radio} from 'antd';
import styles from './index.module.css';
import {DeleteOutlined} from '@ant-design/icons';

const { Panel } = Collapse;
const { Option } = Select;

const CollapseComponent = (props) => {
    const {
        currentData,
        currentIndex,
        onDelete,
        onUpdateData
    } = props;

    const form = Form.useForm();
    const [ nameVal, setNameVal ] = useState(); //. 变量名称
    const [ sourceVal, setSourceVal ] = useState('Response Text'); //. 提取来源
    const [ scaleVal, setScaleVal ] = useState(2); //. 提取范围
    const [ expressionVal, setExpressionVal ] = useState(); //. 表达式

    const sourceOption = [
        'Response Text',
        'Response Json',
        'Response XML',
        'Response Header',
        'Response Cookie',
        '耗时'
    ];

    const HeaderRender = () => {
        return (
            <div className={styles['header']}>
                <div className={styles['content']}>
                    <Tag color="processing">{nameVal}</Tag>
                    <span>{sourceVal}</span>
                    （<Tag color="processing">{expressionVal}</Tag>）
                </div>
                <div className={styles['button-group']}>
                    <Button type="link" icon={<DeleteOutlined/>} onClick={(e) => onDelete(e, currentData)}/>
                </div>
            </div>
        )
    };

    const updateCurrentData = (field, value) => {
        let newData = { ...currentData, [field]: value };
        onUpdateData(newData);
    };

    return (
        <div className={styles['collapse-container']} key={currentData.id}>
            <Collapse>
                <Panel header={HeaderRender()} key="1">
                    {/*<p>{text}</p>*/}
                    <Form name={form}>
                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="变量名称" name="name">
                            <Input value={nameVal} onChange={(e) => setNameVal(e.target.value)}
                                   onBlur={() => updateCurrentData('name', nameVal)} placeholder="变量名称"/>
                        </Form.Item>

                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="提取来源" name="source"
                                   initialValue="Response Text"
                        >
                            <Select
                                value={sourceVal}
                                onChange={(e) => {
                                    setSourceVal(e);
                                    updateCurrentData('source', e);
                                }}
                                placeholder="请选择提取来源"
                            >
                                {sourceOption.map(item => (
                                    <Option key={item} value={item}>{item}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 6 }} label="提取范围" name="scale"
                                   initialValue={2}
                        >
                            <Radio.Group onChange={(e) => {
                                setScaleVal(e.target.value);
                                updateCurrentData('scale', e.target.value);
                            }} value={scaleVal}>
                                <Radio value={1}>整个返回数据</Radio>
                                <Radio value={2}>提取部分</Radio>
                            </Radio.Group>
                        </Form.Item>

                        {scaleVal == 2 && (
                            <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="提取表达式" name="expression">
                                <Input value={expressionVal} onChange={(e) => setExpressionVal(e.target.value)}
                                       onBlur={() => updateCurrentData('expression', expressionVal)}
                                       placeholder="提取表达式"/>
                            </Form.Item>
                        )}
                    </Form>
                </Panel>
            </Collapse>
        </div>

    );
};

export default CollapseComponent;
