import React, {useState, useEffect, useCallback} from 'react';
import './dragMockInsert.css';
import {LinkOutlined, DisconnectOutlined, CopyOutlined, DeleteOutlined, DragOutlined} from '@ant-design/icons';
import {Button} from "antd";

// 初始数据
const initialItems = [
    { id: 'item-1', content: '完成项目需求分析-完成项目需求分析-完成项目需求分析', color: '#FF6B6B', depth: 0, isHovered: false, isSelected: false, draggable: false  },
    { id: 'item-2', content: '设计UI原型图-设计UI原型图-设计UI原型图', color: '#4ECDC4', depth: 0, isHovered: false, isSelected: false, draggable: false },
    { id: 'item-3', content: '前端页面开发-前端页面开发-前端页面开发', color: '#FFD166', depth: 0, isHovered: false, isSelected: false, draggable: false },
    { id: 'item-4', content: '后端API联调-后端API联调-后端API联调', color: '#06D6A0', depth: 0, isHovered: false, isSelected: false, draggable: false },
    { id: 'item-5', content: '测试与发布上线-测试与发布上线-测试与发布上线', color: '#118AB2', depth: 0, isHovered: false, isSelected: false, draggable: false },
];

const DragMockInsert = () => {
    const [ dataList, setDataList ] = useState([]);

    useEffect(() => {
        setDataList(initialItems);
    }, []);

    const handleMouseAction = (e, item, action) => {
        const copyList = JSON.parse(JSON.stringify(dataList));
        copyList.map(cur => {
            if (cur.id == item.id) {
                (action == 'mouseEnter') ? (cur.isHovered = true) : (cur.isHovered = false)
            }
        });
        setDataList(copyList);
        // setDataList(prevItems => {
        //     prevItems.map(cur =>
        //         cur.id === item.id
        //             ? {...cur, isHovered: action == 'mouseEnter'}
        //             : cur
        //     )
        // })
    };

    const handleSelected = (e, item) => {
        const copyList = JSON.parse(JSON.stringify(dataList));
        copyList.map(cur => {
            if (cur.id == item.id) {
                cur.isSelected = true;
            } else {
                cur.isSelected = false;
            }
        });
        setDataList(copyList);
    };

    return (
        <div className="container">
            {dataList && dataList.map((item, index) => (
                <div
                    key={`drag-api-${item.id}`}
                    className="draggable-item"
                    onMouseEnter={(e) => handleMouseAction(e, item, 'mouseEnter')}
                    onMouseLeave={(e) => handleMouseAction(e, item, 'mouseLeave')}
                >
                    <DragOutlined
                        style={{ marginRight: 10, opacity: item.isHovered ? 1 : 0, cursor: 'move' }}

                    />
                    <div
                        key={`drag-api-${item.id}`}
                        className={`item-content ${item.isSelected ? 'active' : ''}`}
                        onClick={e => handleSelected(e, item)}
                    >
                        <span>{`${index + 1}. `}</span>
                        <div className="node-content">{item.content}</div>
                        <div className="action-icon">
                            <Button type="link" icon={<LinkOutlined/>} size="small"
                                    style={{ display: item.isHovered ? 'block' : 'none', cursor: 'pointer' }}/>
                            <Button type="link" icon={<CopyOutlined/>} size="small"
                                    style={{ display: item.isHovered ? 'block' : 'none', cursor: 'pointer' }}/>
                            <Button type="link" icon={<DeleteOutlined/>} size="small"
                                    style={{ display: item.isHovered ? 'block' : 'none', cursor: 'pointer' }}/>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DragMockInsert;
