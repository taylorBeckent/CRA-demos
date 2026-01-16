import React from 'react';
import {Tabs} from 'antd';
import styles from './index.module.css';
import RunningLog from "./RunningLog";

const { TabPane } = Tabs;

const HttpResponse = () => {
    return (
        <div className={styles['response-container']}>
            <div className={styles['response-header']}>Request</div>
            <div className={styles['response-body']}>
                <Tabs defaultActiveKey="responseInfo" tabBarGutter={40}>
                    <TabPane tab="响应信息" key="responseInfo" ></TabPane>
                    <TabPane tab="请求信息" key="requestInfo" ></TabPane>
                    <TabPane tab="变量追踪" key="variableTrace" ></TabPane>
                    <TabPane tab="结果断言" key="assert" > </TabPane>
                    <TabPane tab="运行日志" key="runningLog" >
                        <RunningLog/>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default HttpResponse;
