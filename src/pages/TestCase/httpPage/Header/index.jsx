import React from 'react';
import {Select, Input, Button, Row, Col} from "antd";
import styles from './index.module.css';

const { Option } = Select;

const HttpHeader = () => {
    return (
        <div className={styles['http-content']}>
            <div className={styles['first-row']}>
                <Row>
                    <Col span={3}>
                        <Select
                            style={{ width: '100%' }}
                        >
                            <Option key="POST" value="POST">POST</Option>
                            <Option key="GET" value="GET">GET</Option>
                            <Option key="PUT" value="PUT">PUT</Option>
                            <Option key="DELETE" value="DELETE">DELETE</Option>
                        </Select>
                    </Col>
                    <Col span={18}>
                        <Input placeholder="请输入请求路径"/>
                    </Col>
                    <Button type="primary" style={{ marginLeft: 10 }}>调试</Button>
                    {/*<Col span={4}>*/}
                    {/*    */}
                    {/*</Col>*/}
                </Row>
            </div>
            <Row style={{ alignItems: 'center', marginTop: 10 }}>
                <Col span={3}>
                    <label>请求名称：</label>
                </Col>
                <Col span={8}>
                    <Input placeholder="请输入请求名称"/>
                </Col>
            </Row>
        </div>
    );
};

export default HttpHeader;
