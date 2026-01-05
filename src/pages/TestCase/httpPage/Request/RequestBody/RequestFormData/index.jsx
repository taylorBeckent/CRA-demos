import { Form, Table, Input, Button, Space } from 'antd';

const EditableTableWithFormList = () => {
    const [form] = Form.useForm();

    // 定义列。关键在于：在 render 函数中，根据 field 对象构建 Form.Item
    const columns = [
        {
            title: 'Key',
            dataIndex: 'key',
            render: (_, { field }) => (
                <Form.Item
                    name={[field.name, 'key']} // namePath 为 [index, 'key']
                    rules={[{ required: true, message: 'Key required' }]}
                    style={{ margin: 0 }}
                >
                    <Input placeholder="Enter key" />
                </Form.Item>
            ),
        },
        {
            title: 'Value',
            dataIndex: 'value',
            render: (_, { field }) => (
                <Form.Item
                    name={[field.name, 'value']} // namePath 为 [index, 'value']
                    style={{ margin: 0 }}
                >
                    <Input placeholder="Enter value" />
                </Form.Item>
            ),
        },
        {
            title: 'Action',
            render: (_, { field, operation }) => (
                <Button
                    danger
                    type="text"
                    onClick={() => operation.remove(field.name)} // 使用 Form.List 的 operation 移除行
                >
                    Delete
                </Button>
            ),
        },
    ];

    // 表单提交处理
    const onFinish = (values) => {
        console.log('Received values:', values);
        // 这里可以处理提交逻辑，例如发送到后端
    };

    return (
        <Form form={form} onFinish={onFinish} initialValues={{ list: [{ key: '', value: '' }] }}>
            <Form.List name="list">
                {(fields, operation) => (
                    <>
                        <Table
                            rowKey={(record) => record.field.key}
                            dataSource={fields.map((field) => ({ field, operation }))} // 映射数据源
                            columns={columns}
                            pagination={false}
                        />
                        {/* 添加新行按钮 */}
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
            <Button type="primary" htmlType="submit" style={{ marginTop: 16 }}>
                Submit
            </Button>
        </Form>
    );
};

export default EditableTableWithFormList;
