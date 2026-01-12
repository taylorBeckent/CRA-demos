import React, {useState} from 'react';
import {Tabs, Radio} from 'antd';
import styles from './iondex.module.css';
import RequestFormData from "./RequestFormData";
import RequestFormUrlencoded from "./RequestFormUrlencoded";

const RequestBody = () => {
    const [ curType, setCurType ] = useState('none');

    const onChange = (e) => {
        setCurType(e.target.value);
    };

    return (
        <div>
            <div className={styles['request-body-scene']}>
                <Radio.Group onChange={(e) => { onChange(e) }} value={curType}>
                    <Radio value="none">none</Radio>
                    <Radio value="form-data">form-data</Radio>
                    <Radio value="x-www-form-urlencoded">x-www-form-urlencoded</Radio>
                    <Radio value="json">json</Radio>
                    <Radio value="row">row</Radio>
                </Radio.Group>
            </div>
            <div className={styles['request-body-content']}>
                {curType == 'none' && <div className={styles['request-body-content-none']}>当前请求没有请求体</div>}
                {curType == 'form-data' && <RequestFormData/>}
                {curType == 'x-www-form-urlencoded' && <RequestFormUrlencoded/>}
            </div>
        </div>
    );
};

export default RequestBody;
