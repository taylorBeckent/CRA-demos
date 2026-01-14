import React from 'react';
import {Tabs} from 'antd';
import styles from './index.module.css';
import RequestBody from "./RequestBody";
import RequestHeader from "./RequestHeader";
import VariableTable from './VariableTable';
import Extract from "./Extract";

const { TabPane } = Tabs;

const HttpRequest = () => {
    return (
        <div className={styles['request-container']}>
            <div className={styles['request-header']}>Request</div>
            <div className={styles['request-body']}>
                <Tabs defaultActiveKey="requestBody" tabBarGutter={40}>
                    <TabPane tab="请求体" key="requestBody" >
                        <RequestBody/>
                    </TabPane>
                    <TabPane tab="请求头" key="requestHeader" >
                        <RequestHeader/>
                    </TabPane>
                    <TabPane tab="变量" key="variable" >
                        <VariableTable/>
                    </TabPane>
                    <TabPane tab="提取" key="extract" >
                        <Extract/>
                    </TabPane>
                    <TabPane tab="断言规则" key="assert" ></TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default HttpRequest;
