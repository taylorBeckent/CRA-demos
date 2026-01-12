import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Select, Checkbox, Space } from 'antd';

const EditableFormDataTable = ({ value = [], onChange }) => {
    const [dataSource, setDataSource] = useState([]);
    const [nextId, setNextId] = useState(1);
    const isInitialMount = useRef(true);
    const skipUpdate = useRef(false);

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
                    type: item.type || 'text',
                    description: item.description || ''
                }));
                setDataSource(dataWithId);
                setNextId(dataWithId.length + 1);
            } else {
                // 默认添加一行空数据
                const initialRow = {
                    id: 'row-0',
                    key: '',
                    value: '',
                    type: 'text',
                    description: ''
                };
                setDataSource([initialRow]);
            }
            isInitialMount.current = false;
        }
    }, [value]); // 只监听value的变化

    // 内部状态变化时通知父组件
    useEffect(() => {
        // 跳过初始化和内部更新触发的通知
        if (isInitialMount.current || skipUpdate.current) {
            skipUpdate.current = false;
            return;
        }

        // 通知父组件
        if (onChange) {
            const formattedData = dataSource.map(({ id, ...rest }) => rest);
            onChange(formattedData);
        }
    }, [dataSource, onChange]);

    // 添加新行
    const addNewRow = () => {
        const newRow = {
            id: `row-${nextId}`,
            key: '',
            value: '',
            type: 'text',
            description: ''
        };
        setNextId(nextId + 1);
        setDataSource(prev => [...prev, newRow]);
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
                console.log(record)
                if (record.type === 'file') {
                    return (
                        <div>
                            {/*<span style={{ marginRight: 8 }}>{text || '未选择文件'}</span>*/}
                            <span style={{ marginRight: 8 }}>{text}</span>
                            <input
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        updateRow(record.id, 'value', file.name);
                                        updateRow(record.id, 'file', file);
                                    }
                                }}
                            />
                        </div>
                    );
                }
                return (
                    <Input
                        value={text}
                        onChange={(e) => updateRow(record.id, 'value', e.target.value)}
                        placeholder="参数值"
                    />
                );
            },
        },
        {
            title: 'Type',
            dataIndex: 'type',
            width: '15%',
            render: (text, record) => (
                <Select
                    value={text}
                    onChange={(value) => {
                        updateRow(record.id, 'type', value);
                        // 如果是非文件类型，清除文件
                        if (value !== 'file') {
                            updateRow(record.id, 'file', null);
                        }
                    }}
                    style={{ width: '100%' }}
                >
                    <Select.Option value="text">Text</Select.Option>
                    <Select.Option value="file">File</Select.Option>
                    <Select.Option value="json">JSON</Select.Option>
                </Select>
            ),
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
