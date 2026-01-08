import {Form, Table, Input, Button, Space, Popconfirm, message, Tooltip, Card, AutoComplete} from 'antd';
import {DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, CopyOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from 'react';
import styles from './index.module.css'; // 如果需要额外的CSS样式

const RequestHeader = () => {
    const [ form ] = Form.useForm();

    // 用于控制每个输入框的图标显示状态
    const [ inputStates, setInputStates ] = useState({});

    const columns = [
        {
            title: 'Key',
            dataIndex: 'key',
            width: 300,
            render: (_, { field }) => (
                <Form.Item
                    name={[ field.name, 'key' ]}
                    rules={[ { required: true, message: 'Key required' } ]}
                    style={{ margin: 0 }}
                >
                    <Input placeholder="Enter key"/>
                </Form.Item>
            ),
        },
        {
            title: 'Value',
            dataIndex: 'value',
            width: 300,
            render: (_, { field }) => (
                <Form.Item
                    name={[ field.name, 'value' ]}
                    style={{ margin: 0 }}
                >
                    <Input
                        placeholder="Enter value"
                        suffix={renderValueSuffix(field)}
                        // onMouseEnter={() => handleInputMouseEnter(field.name)}
                        // onMouseLeave={() => handleInputMouseLeave(field.name)}
                        // onFocus={() => handleInputFocus(field.name)}
                        // onBlur={() => handleInputBlur(field.name)}
                        className={styles['custom-input-with-suffix']}
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            width: 300,
            render: (_, { field }) => (
                <Form.Item
                    name={[ field.name, 'remarks' ]}
                    style={{ margin: 0 }}
                >
                    <Input placeholder="Enter remarks"/>
                </Form.Item>
            ),
        },
        {
            title: '操作',
            width: 100,
            render: (_, { field, operation }) => (
                <Popconfirm
                    title="是否删除该行？"
                    onConfirm={() => handleDelete(field, operation)}
                >
                    <Button
                        danger
                        type="link"
                        icon={<DeleteOutlined/>}
                    />
                </Popconfirm>
            ),
        },
    ];

    // 处理鼠标进入输入框
    const handleInputMouseEnter = (fieldName) => {
        setInputStates(prev => ({
            ...prev,
            [fieldName]: {
                ...prev[fieldName],
                hovered: true
            }
        }));
    };

    // 处理鼠标离开输入框
    const handleInputMouseLeave = (fieldName) => {
        setInputStates(prev => ({
            ...prev,
            [fieldName]: {
                ...prev[fieldName],
                hovered: false
            }
        }));
    };

    // 处理输入框获得焦点
    const handleInputFocus = (fieldName) => {
        setInputStates(prev => ({
            ...prev,
            [fieldName]: {
                ...prev[fieldName],
                focused: true
            }
        }));
    };

    // 处理输入框失去焦点
    const handleInputBlur = (fieldName) => {
        setInputStates(prev => ({
            ...prev,
            [fieldName]: {
                ...prev[fieldName],
                focused: false
            }
        }));
    };

    const [options, setOptions] = useState([]); //. 变量框的下拉值
    const [variableStatus, setVariableStatus] = useState(false); //. 变量框

    const renderItem = (title) => ({
        value: title,
        label: (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                }}
            >
                {title}
                <span>public</span>
            </div>
        )
    });

    const variableOptions = [
        renderItem('get_timestamp()'),
        renderItem('get_timestamp1()'),
        renderItem('get_timestamp2()'),
        renderItem('get_timestamp3()'),
        renderItem('get_timestamp4()'),
        renderItem('get_timestamp5()'),
        renderItem('get_randint(min_mun=0,max_num=0)'),
    ];

    useEffect(() => {
        console.log(variableOptions);
        setOptions(variableOptions);
    },[]);

    //. 运行窗口
    const variableWindow = () => {
        const variableSearch = (searchText) => {
            let filterList;
            if(searchText){
                filterList = variableOptions.filter(item => {
                    return item.value.indexOf(searchText) !== -1;
                });
            } else {
                filterList = variableOptions;
            }
            console.log(filterList);
            setOptions(filterList);
        }

        return (
            <div className={styles['variable-wrapper']}>
                <Card title="变量名" size="small">
                    <div className={styles['variable-content']}>
                        <div className={styles['variable-input']}>
                            <AutoComplete
                                options={options}
                                onSearch={variableSearch}
                            />
                        </div>
                        <div className={styles['variable-preview']}>
                            <div>表达式：</div>
                            <div>预览：${``}</div>
                        </div>
                    </div>
                    <Button type="primary" style={{ width: '100%' }} onClick={()=>{setVariableStatus(false)}} >确定</Button>
                </Card>
            </div>
        )
    };

    // 渲染Value输入框的suffix图标
    const renderValueSuffix = (field) => {
        // const fieldState = inputStates[field.name] || {};
        // const showIcon = fieldState.hovered || fieldState.focused;
        //
        // if (!showIcon) {
        //     return null;
        // }

        return (
            <Space
                size="small"
                style={{
                    // width: 80, // 固定宽度
                    justifyContent: 'flex-end',
                    // paddingRight: 4
                }}
            >
                <Tooltip placement="right" arrowPointAtCenter={true} trigger="click" title={variableWindow()}
                         color="#fff" styles={{ root: { width: 300, maxWidth: 800 } }}
                         // open={variableStatus}
                         classNames={{ root: "variable-tooltip" }}>
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined/>}
                        onClick={() => {
                            handleViewValue(field);
                        }}
                        title="查看"
                        style={{
                            // padding: '0 4px',
                            height: 'auto',
                            minWidth: 'auto'
                        }}
                    />
                </Tooltip>
            </Space>
        );
    };

    // 查看值的处理函数
    const handleViewValue = (field) => {
        // const values = form.getFieldsValue();
        // const fieldValue = values.list?.[field.name]?.value;
        // if (fieldValue) {
        //     message.info(`Value: ${fieldValue}`);
        // };
        console.log('assss');
        setVariableStatus(true);
    };

    // 复制值的处理函数
    const handleCopyValue = (field) => {
        const values = form.getFieldsValue();
        const fieldValue = values.list?.[field.name]?.value;
        if (fieldValue) {
            navigator.clipboard.writeText(fieldValue)
                .then(() => message.success('复制成功'))
                .catch(() => message.error('复制失败'));
        }
    };

    // 删除行
    const handleDelete = (field, operation) => {
        let tableList = form.getFieldValue('list');
        if (tableList && tableList.length > 1) {
            operation.remove(field.name);
            message.success('删除成功');
        } else {
            message.error('最后一条数据不能删除');
        }
    };

    // 表单提交处理
    const onFinish = (values) => {
        console.log('Received values:', values);
    };

    return (
        <Form form={form} onFinish={onFinish} initialValues={{ list: [ { key: '', value: '' } ] }}>
            <Form.List name="list">
                {(fields, operation) => (
                    <>
                        <Table
                            rowKey={(record) => record.field.key}
                            dataSource={fields.map((field) => ({ field, operation }))}
                            columns={columns}
                            pagination={false}
                        />
                        <Button
                            type="dashed"
                            onClick={() => operation.add()}
                            style={{ marginTop: 16 }}
                            block
                        >
                            + Add Row
                        </Button>
                    </>
                )}
            </Form.List>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button type="primary" htmlType="submit" style={{ marginTop: 16 }}>
                    Submit
                </Button>
            </div>
        </Form>
    );
};

export default RequestHeader;
