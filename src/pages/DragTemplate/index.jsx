import React, {useState, useEffect, useCallback, useRef} from 'react';
import './dragTemplate.css';
import {
    LinkOutlined,
    DisconnectOutlined,
    CopyOutlined,
    DeleteOutlined,
    DragOutlined,
    RightOutlined,
    DownOutlined
} from '@ant-design/icons';
import {Button} from "antd";

// 初始数据
const initialItems = [
    {
        id: 'item-1',
        content: '完成项目需求分析-完成项目需求分析-完成项目需求分析',
        color: '#FF6B6B',
        depth: 0,
        isHovered: false,
        isSelected: false,
        draggable: false
    },
    {
        id: 'item-2',
        content: '设计UI原型图-设计UI原型图-设计UI原型图',
        color: '#4ECDC4',
        depth: 0,
        isHovered: false,
        isSelected: false,
        draggable: false
    },
    {
        id: 'item-3',
        content: '前端页面开发-前端页面开发-前端页面开发',
        color: '#FFD166',
        depth: 0,
        isHovered: false,
        isSelected: false,
        draggable: false
    },
    {
        id: 'item-4',
        content: '后端API联调-后端API联调-后端API联调',
        color: '#06D6A0',
        depth: 0,
        isHovered: false,
        isSelected: false,
        draggable: false
    },
    {
        id: 'item-5',
        content: '测试与发布上线-测试与发布上线-测试与发布上线',
        color: '#118AB2',
        depth: 0,
        isHovered: false,
        isSelected: false,
        draggable: false
    },
];

const DragTemplate = () => {
    const [ dataList, setDataList ] = useState([]);
    const [ dragOverInfo, setDragOverInfo ] = useState(null);
    const dragItemRef = useRef(null); //. 存储正在拖动的元素引用
    const dragDataRef = useRef(null); //. 拖动数据

    useEffect(() => {
        setDataList(initialItems);
    }, []);

    //. 鼠标事件
    const handleMouseAction = (e, item, action) => {
        const copyList = JSON.parse(JSON.stringify(dataList));
        copyList.map(cur => {
            if (cur.id == item.id) {
                (action == 'mouseEnter') ? (cur.isHovered = true) : (cur.isHovered = false)
            }
        });
        setDataList(copyList);
    };

    //. 选中节点
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

    //. 阻止行内元素拖动
    const preventRowDrag = e => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    //. 拖动起始
    const handleDragStart = (e, itemId) => {
        console.log('e', 'itemId')
        //. 阻止事件冒泡到父元素
        e.stopPropagation();

        //.获取整个行元素（draggable-item）
        const draggableItem = e.currentTarget.closest('.draggable-item');
        if (!draggableItem) return;

        //. 存储引用和数据
        dragItemRef.current = draggableItem;
        dragDataRef.current = { itemId };

        //. 设置拖拽数据
        e.dataTransfer.setData('text/plain', itemId);
        e.dataTransfer.effectAllowed = 'move';

        //. 设置拖拽图像为整个行元素
        const dragImage = draggableItem.cloneNode(true);
        dragImage.style.width = `${draggableItem.offsetWidth}px`;
        dragImage.style.opacity = '0.7';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 20, 20); //. 偏移量使用图标位置合适

        //. 添加拖拽中样式
        draggableItem.classList.add('dragging');

        //. 清理临时元素
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    };

    //. 放置目标处理
    const handleDragOver = (e, itemId) => {
        // console.log('e, itemId');
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        //. 防止重复计算
        if (dragOverInfo?.id === itemId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const position = mouseY < rect.height / 2 ? 'before' : 'after';
        console.log('position', position);

        setDragOverInfo({ id: itemId, position });
    };

    const handleDragLeave = e => {
        const relatedTarget = e.relatedTarget;
        console.log(relatedTarget);
        if(!e.currentTarget.contains(relatedTarget)){
            setDragOverInfo(null);
        }
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        console.log('draggedId',draggedId);
        if(!draggedId || draggedId === targetId || !dragOverInfo){
            setDragOverInfo(null);
            dragItemRef.current?.classList.remove('dragging');
            dragItemRef.current = null;
            return;
        }

        // 重新排序
        setDataList(prevItems => {
            const itemsCopy = [...prevItems];
            const draggedIndex = itemsCopy.findIndex(item => item.id === draggedId);
            const targetIndex = itemsCopy.findIndex(item => item.id == targetId);

            if(draggedIndex === -1 || targetIndex === -1) return prevItems;

            const [draggedItem] = itemsCopy.splice(draggedIndex, 1);

            let newIndex = targetIndex;
            if(dragOverInfo.position === 'after'){
                newIndex = targetIndex + (draggedIndex < targetIndex ? 0 : 1);
            } else {
                newIndex = targetIndex - (draggedIndex > targetIndex ? 0 : 1);
            }

            newIndex = Math.max(0, Math.min(itemsCopy.length, newIndex));
            itemsCopy.splice(newIndex, 0, draggedItem);
            // console.log('itemsCopy', itemsCopy);
            return itemsCopy;
        })

        setDragOverInfo(null);
        dragItemRef.current?.classList.remove('dragging');
        dragItemRef.current = null;
    };

    // 拖动结束
    const handleDragEnd = () => {
        setDragOverInfo(null);
        dragItemRef.current?.classList.remove('dragging');
        dragItemRef.current = null;
    }

    return (
        <div className="container">
            {dataList && dataList.map((item, index) => (
                <div
                    key={`drag-api-${item.id}`}
                    className="draggable-item"
                    draggable="false"
                    onDragStart={preventRowDrag}
                    //. 放置区域事件
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {handleDrop(e, item.id)}}
                    onDragEnd={handleDragEnd}

                    onMouseEnter={(e) => handleMouseAction(e, item, 'mouseEnter')}
                    onMouseLeave={(e) => handleMouseAction(e, item, 'mouseLeave')}
                >
                    <div
                        title="拖拽排序"
                        className="drag-handle"
                        draggable="true"
                        // draggable={item.draggable}
                        style={{ marginRight: 10, opacity: item.isHovered ? 1 : 0, cursor: 'move' }}
                        onDragStart={(e) => handleDragStart(e, item.id)}
                    >
                        <DragOutlined/>
                    </div>

                    <div
                        key={`drag-api-${item.id}`}
                        className={`item-content ${item.isSelected ? 'active' : ''}`}
                        onClick={e => handleSelected(e, item)}
                        draggable="false"
                        onDragStart={preventRowDrag}
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
                    {dragOverInfo?.id === item.id && (
                        <div className={`drop-indicator ${dragOverInfo.position}`} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default DragTemplate;
