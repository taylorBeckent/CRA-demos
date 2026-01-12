import React, {useState, useEffect, useRef} from 'react';
import {Table, Input, Button, Select, Checkbox, Space, Card, AutoComplete, Tooltip} from 'antd';
import {ApiOutlined} from '@ant-design/icons';
import styles from "./index.module.css";

const EditableFormDataTable = ({ value = [], onChange }) => {
    const [ dataSource, setDataSource ] = useState([]);
    const [ nextId, setNextId ] = useState(1);
    const isInitialMount = useRef(true);
    const skipUpdate = useRef(false);
    const [ autoCompleteOptions, setAutoCompleteOptions ] = useState([]); //. 变量函数下拉


    // 初始化数据 - 只在初始加载时或value改变时更新
    useEffect(() => {
        // 如果是外部value变化，且不是我们内部触发的更新
        if (isInitialMount.current) {
            // 首次加载
            if (value && value.length > 0) {
                const dataWithId = value.map((item, index) => ({
                    ...item,
                    id: item.id || `row-${index}`,
                    key: item.key || '',
                    value: item.value || '',
                    description: item.description || '',
                    variableStatus: false
                }));
                setDataSource(dataWithId);
                setNextId(dataWithId.length + 1);
            } else {
                // 默认添加一行空数据
                const initialRow = {
                    id: 'row-0',
                    key: '',
                    value: '',
                    description: '',
                    variableStatus: false
                };
                setDataSource([ initialRow ]);
            }
            isInitialMount.current = false;
        }

        setAutoCompleteOptions(variableOptions);
    }, []); // 只监听value的变化

    // 内部状态变化时通知父组件
    // useEffect(() => {
    //     // 跳过初始化和内部更新触发的通知
    //     if (isInitialMount.current || skipUpdate.current) {
    //         skipUpdate.current = false;
    //         return;
    //     }
    //
    //     // 通知父组件
    //     if (onChange) {
    //         const formattedData = dataSource.map(({ id, ...rest }) => rest);
    //         onChange(formattedData);
    //     }
    // }, [dataSource, onChange]);

    // 列定义
    const columns = [
        {
            title: 'Key',
            dataIndex: 'key',
            width: '25%',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => updateRow(record.id, 'key', e.target.value)}
                    placeholder="参数名"
                />
            ),
        },
        {
            title: 'Value',
            dataIndex: 'value',
            width: '25%',
            render: (text, record) => {
                return (
                    <Input
                        value={text}
                        suffix={renderValueSuffix(record)}
                        onChange={(e) => updateRow(record.id, 'value', e.target.value)}
                        placeholder="参数值"
                    />
                );
            },
        },
        {
            title: 'Description',
            dataIndex: 'description',
            width: '20%',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => updateRow(record.id, 'description', e.target.value)}
                    placeholder="描述"
                />
            ),
        },
        {
            title: '操作',
            width: '5%',
            render: (_, record) => (
                <Button
                    type="link"
                    danger
                    onClick={() => deleteRow(record.id)}
                    disabled={dataSource.length === 1}
                >
                    删除
                </Button>
            ),
        },
    ];

    //. 后缀相关------------
    const renderItem = (context) => ({
        value: context,
        label: (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                }}
            >
                {context}
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

    const variableWindow = (record) => {
        const variableSearch = (searchText) => {
            let filterList;
            if (searchText) {
                filterList = variableOptions.filter(item => {
                    return item.value.indexOf(searchText) !== -1;
                });
            } else {
                filterList = variableOptions;
            }

            setAutoCompleteOptions(filterList);
        };

        const handleVariableOk = (record) => {
            openAndCloseDialog(record);
        };

        return (
            <div className={styles['variable-wrapper']}>
                <Card title="变量名" size="small">
                    <div className={styles['variable-content']}>
                        <div className={styles['variable-input']}>
                            <AutoComplete
                                style={{ width: '100%' }}
                                options={autoCompleteOptions}
                                onSearch={variableSearch}
                                placeholder="请输入表达式"
                            />
                        </div>
                        <div className={styles['variable-preview']}>
                            <div>表达式：</div>
                            <div>预览：${``}</div>
                        </div>
                    </div>
                    <Button type="primary" style={{ width: '100%' }} onClick={() => { handleVariableOk(record) }}>确定</Button>
                </Card>
            </div>
        )
    };

    // 渲染Value输入框的suffix图标
    const renderValueSuffix = (record) => {
        return (
            <Space
                key={record.id}
                size="small"
                style={{
                    // width: 80, // 固定宽度
                    justifyContent: 'flex-end',
                    // paddingRight: 4
                }}>
                <Tooltip placement="right" arrowPointAtCenter={true} trigger="click" title={variableWindow(record)}
                         color="#fff" styles={{ root: { width: 300, maxWidth: 800 } }}
                         open={record?.variableStatus}
                         classNames={{ root: "variable-tooltip" }}>
                    <Button
                        type="link"
                        size="small"
                        icon={<ApiOutlined/>}
                        onClick={() => {
                            handleTooltipView(record);
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
        )
    };

    //. 查看变量提示框
    const handleTooltipView = (record) => {
        openAndCloseDialog(record);
    };

    //. 打开/关闭弹窗
    const openAndCloseDialog = (record) => {
        let copyData = JSON.parse(JSON.stringify(dataSource));
        copyData.map(item => {
            if (item.id == record.id) {
                item.variableStatus = !item.variableStatus;
            }
        })
        console.log(copyData);
        setDataSource(copyData);
    };

    //. 后缀相关------------

    // 添加新行
    const addNewRow = () => {
        const newRow = {
            id: `row-${nextId}`,
            key: '',
            value: '',
            description: '',
            variableStatus: false
        };
        setNextId(nextId + 1);
        setDataSource(prev => [ ...prev, newRow ]);
    };

    // 删除行
    const deleteRow = (id) => {
        setDataSource(prev => prev.filter(item => item.id !== id));
    };

    // 更新行数据
    const updateRow = (id, field, value) => {
        setDataSource(prev =>
            prev.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    return (
        <div>
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
                pagination={false}
                size="small"
                footer={() => (
                    <Button
                        type="dashed"
                        onClick={addNewRow}
                        block
                    >
                        + 添加参数
                    </Button>
                )}
            />
        </div>
    );
};

export default EditableFormDataTable;
