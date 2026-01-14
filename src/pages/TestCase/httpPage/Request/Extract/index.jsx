import React, {useState} from 'react';
import CollapseComponent from "../../../../CollapseComponent";
import {Button} from "antd";
// import {generateUUID} from '@/utils/utils.js';
import utils from "../../../../../utils/utils";

const { generateUUID } = utils;

const Extract = () => {

    const [ extractData, setExtractData ] = useState([]);

    const handleAdd = () => {
        setExtractData(prev => {
            let newObj = {
                id: generateUUID(),
                name: '',
                source: 'Response Text',
                scale: 2,
                expression: ''
            }
            const newData = [ ...prev, newObj ];
            // console.log(newData);
            return newData;
        })
    };

    const handleDelete = (e, record) => {
        e.preventDefault();
        e.stopPropagation();
        // console.log(record);
        setExtractData(prev => {
            const newData = prev.filter(item => item.id !== record.id);
            // console.log(newData);
            return newData;
        });
    };

    const handleUpdateData = (record) => {
        setExtractData(prev => {
            // console.log(prev)
            const newData = prev.map(item => {
                if(item.id == record.id){
                    return {...item, ...record};
                }
                return item;
            });

            // console.log(newData);
            return newData;
        })
    };

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {extractData.map((item, index) => (
                    <CollapseComponent
                        key={item.id}
                        currentData={item}
                        currentIndex={index}
                        onDelete={handleDelete}
                        onUpdateData={handleUpdateData}
                    />
                ))}
            </div>

            <Button style={{ width: '100%', marginTop: 10 }} type="dashed" onClick={handleAdd}>添加提取</Button>

        </div>
    );
};

export default Extract;
