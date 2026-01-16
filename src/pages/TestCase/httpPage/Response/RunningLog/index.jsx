import React from 'react';
import styles from './index.module.css';

const text = `
[2026-01-14 16:08:26] [HTTP请求]  开始
[2026-01-14 16:08:26] [HTTP请求]  错误: 缺少基本的url 请检查url是否正确！
[2026-01-14 16:08:26] [HTTP请求]  结束
`;

const RunningLog = () => {
    return (
        <div className={styles['log-style']}>
            {text}
        </div>
    );
};

export default RunningLog;
