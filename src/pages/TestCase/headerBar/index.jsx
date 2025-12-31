import React from 'react';
import {LeftCircleOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import './index.css';

const HeaderBar = () => {
    return (
        <div className="header-container">
            <div className="title">
                <div>
                    <Button type="link" icon={<LeftCircleOutlined/>}/>
                    <span>返回</span>
                </div>
                <div>|</div>
                <div>更新用例</div>
            </div>
            <div className="action-bar">
                <Button type="primary" style={{ marginRight: 10 }}>调试</Button>
                <Button type="primary"  style={{ marginRight: 10 }}>保存</Button>
                <Button type="primary">调试记录</Button>
            </div>
        </div>
    );
};

export default HeaderBar;
