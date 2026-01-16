import React from 'react';
import {Button, Form, Row, Col, Input, Select, Cascader} from 'antd';
import './index.css';

const TitleContent = () => {

    const [ form ] = Form.useForm();
    const { Option } = Select;

    const options = [
        {
            label: 'light',
            value: 'light',
            children: new Array(20).fill(null).map((_, index) => ({
                label: `Number ${index}`,
                value: index
            }))
        },
        {
            label: '微服务',
            value: 'microserver',
            children: [
                {
                    label: 'tag1',
                    value: 'tag1'
                },
                {
                    label: 'tag2',
                    value: 'tag2'
                },
                {
                    label: 'tag3',
                    value: 'tag3'
                },
            ]
        },
        {
            label: '接口类型',
            value: 'interfaceType',
            children: [
                {
                    label: 'tag4',
                    value: 'tag4'
                },
                {
                    label: 'tag5',
                    value: 'tag5'
                },
                {
                    label: 'tag6',
                    value: 'tag6'
                },
            ]
        },
        {
            label: '业务条线',
            value: 'businessType',
            children: [
                {
                    label: 'tag7',
                    value: 'tag7'
                },
                {
                    label: 'tag8',
                    value: 'tag8'
                },
                {
                    label: 'tag9',
                    value: 'tag9'
                },
            ]
        },
    ];

    const handleTest = () => {
        console.log('test', form.getFieldValue('tags'));
        console.log('test', form.getFieldValue('scriptName'));
    }

    return (
        <div className="title-content">
            <Form form={form}>
                <Row>
                    <Col span={6}>
                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} label="脚本名称" name="scriptName"
                                   initialValue="测试脚本1"
                        >
                            <Input placeholder="请输入脚本名称"/>
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} label="所属项目" name="project"
                                   initialValue={1}
                        >
                            {/*<Input placeholder="请输入所属项目" />*/}
                            <Select
                                showSearch
                                allowClear
                                placeholder="请选择所属项目"
                            >
                                <Option key={1} value={1}>示例项目一</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={10}>
                        <Form.Item labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} label="标签" name="tags"
                            // initialValue="测试脚本1"
                        >
                            <Cascader
                                style={{ width: '100%' }}
                                options={options}
                                // onChange={onchange}
                                multiple
                                maxTagCount="responsive"
                                showCheckedStrategy={Cascader.SHOW_CHILD}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={18}>
                        <Form.Item labelCol={{ span: 2 }} wrapperCol={{ span: 16 }} label="脚本描述" name="description">
                            <Input placeholder="请输入脚本描述"/>
                        </Form.Item>
                    </Col>

                    <Col span={2}>
                        <Button onClick={handleTest}>测试</Button>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default TitleContent;
