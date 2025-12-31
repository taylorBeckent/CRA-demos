import React from 'react';
import {Button, Form, Row, Col, Input, Select} from 'antd';
import './index.css';

const TitleContent = () => {

    const [ form ] = Form.useForm();
    const { Option } = Select;

    return (
        <div className="title-content">
            <Form name={form}>
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

                    <Col span={6}>
                        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} label="脚本描述" name="description">
                            <Input placeholder="请输入脚本描述"/>
                        </Form.Item>
                    </Col>
                </Row>


                {/*<Form.Item labelCol={{ span:6 }} wrapperCol={{span:14}} label="脚本名称" name="scriptName">*/}
                {/*    <Input placeholder="请输入用例名称" />*/}
                {/*</Form.Item>*/}

                {/*<Form.Item labelCol={{ span:6 }} wrapperCol={{span:14}} label="所属项目" name="project">*/}
                {/*    <Input placeholder="请输入所属项目" />*/}
                {/*</Form.Item>*/}

                {/*<Form.Item labelCol={{ span:6 }} wrapperCol={{span:14}} label="脚本描述" name="description">*/}
                {/*    <Input placeholder="请输入脚本描述" />*/}
                {/*</Form.Item>*/}
            </Form>
        </div>
    );
};

export default TitleContent;
