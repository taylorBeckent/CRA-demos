import {Form, Table, Input, Button, Space, Popconfirm, message, Tooltip, Card, AutoComplete} from 'antd';
import {DeleteOutlined, ApiOutlined, EyeInvisibleOutlined, CopyOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from 'react';
import styles from './index.module.css'; // 如果需要额外的CSS样式

const RequestHeader = () => {
    const [ form ] = Form.useForm();

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
            render: (_, { field }) => {
                return (
                    <Form.Item
                        name={[ field.name, 'value' ]}
                        style={{ margin: 0 }}
                    >
                        <Input
                            placeholder="Enter value"
                            suffix={renderValueSuffix(field)}
                            className={styles['custom-input-with-suffix']}
                        />
                    </Form.Item>
                )
            },
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

    const [ options, setOptions ] = useState([]); //. 变量框的下拉值
    const [ variableStatus, setVariableStatus ] = useState(false); //. 变量框

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
    }, []);

    //. 运行窗口
    const variableWindow = () => {
        const variableSearch = (searchText) => {
            let filterList;
            if (searchText) {
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
                    <Button type="primary" style={{ width: '100%' }} onClick={() => {
                    }}>确定</Button>
                </Card>
            </div>
        )
    };

    // 渲染Value输入框的suffix图标
    const renderValueSuffix = (field) => {

        // console.log(text, record);
        console.log(field);

        let currentData = form.getFieldValue('list');
        console.log(currentData);

        let record = currentData[field.name];
        console.log(record);

        return (
            <Space
                key={field.name}
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
                        icon={<ApiOutlined/>}
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
        console.log('assss', field, form.getFieldValue('list'));

        let record = form.getFieldValue('list')[field.name];
        console.log(record);

        let newRecord = {...record, variableStatus: !record.variableStatus};

        let newData = form.getFieldValue('list');
        newData[field.name] = newRecord;
        console.log(newData);



        // let newData = form.getFieldValue('list')[field.name]

        // setVariableStatus(!variableStatus);
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
        <Form form={form} onFinish={onFinish}
              initialValues={{ list: [ { key: '', value: '', variableStatus: false } ] }}>
            <Form.List name="list">
                {(fields, operation) => (
                    <>
                        <Table
                            rowKey={(record) => record.field.key}
                            dataSource={fields.map((field) => ({
                                key: field.key,
                                field,
                                operation,
                                index: field.name
                            }))}
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
