import React, { useState, useEffect, useRef } from 'react';
import './DraggableList.css';
import { DragOutlined } from '@ant-design/icons';

const INITIAL_ITEMS = [
    { id: 'item-1', content: '完成项目需求分析', isSelected: false },
    { id: 'item-2', content: '设计UI原型图', isSelected: false },
    { id: 'item-3', content: '前端页面开发', isSelected: false },
    { id: 'item-4', content: '后端API联调', isSelected: false },
    { id: 'item-5', content: '测试与发布上线', isSelected: false },
];

const DragMockInsert = () => {
    const [items, setItems] = useState([]);
    const [dragOverInfo, setDragOverInfo] = useState(null);
    const dragItemRef = useRef(null); // 存储正在拖动的元素引用
    const dragDataRef = useRef(null); // 存储拖动数据

    useEffect(() => {
        setItems(INITIAL_ITEMS);
    }, []);

    /**
     * 拖动开始 - 只在图标上触发
     */
    const handleDragHandleStart = (e, itemId) => {
        // 阻止事件冒泡到父元素
        e.stopPropagation();

        // 获取整个行元素（draggable-item）
        const draggableItem = e.currentTarget.closest('.draggable-item');
        if (!draggableItem) return;

        // 存储引用和数据
        dragItemRef.current = draggableItem;
        dragDataRef.current = { itemId };

        // 设置拖拽数据
        e.dataTransfer.setData('text/plain', itemId);
        e.dataTransfer.effectAllowed = 'move';

        // 设置拖拽图像为整个行元素
        const dragImage = draggableItem.cloneNode(true);
        dragImage.style.width = `${draggableItem.offsetWidth}px`;
        dragImage.style.opacity = '0.7';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 20, 20); // 偏移量使图标位置合适

        // 添加拖拽中样式
        draggableItem.classList.add('dragging');

        // 清理临时元素
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    };

    /**
     * 阻止行元素的默认拖拽
     */
    const preventRowDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    /**
     * 放置目标处理
     */
    const handleDragOver = (e, itemId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // 防止重复计算
        if (dragOverInfo?.id === itemId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const position = mouseY < rect.height / 2 ? 'before' : 'after';

        setDragOverInfo({ id: itemId, position });
    };

    const handleDragLeave = (e) => {
        const relatedTarget = e.relatedTarget;
        if (!e.currentTarget.contains(relatedTarget)) {
            setDragOverInfo(null);
        }
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');

        if (!draggedId || draggedId === targetId || !dragOverInfo) {
            setDragOverInfo(null);
            dragItemRef.current?.classList.remove('dragging');
            dragItemRef.current = null;
            return;
        }

        // 重新排序
        setItems(prevItems => {
            const itemsCopy = [...prevItems];
            const draggedIndex = itemsCopy.findIndex(item => item.id === draggedId);
            const targetIndex = itemsCopy.findIndex(item => item.id === targetId);

            if (draggedIndex === -1 || targetIndex === -1) return prevItems;

            const [draggedItem] = itemsCopy.splice(draggedIndex, 1);

            let newIndex = targetIndex;
            if (dragOverInfo.position === 'after') {
                newIndex = targetIndex + (draggedIndex < targetIndex ? 0 : 1);
            } else {
                newIndex = targetIndex - (draggedIndex > targetIndex ? 0 : 1);
            }

            newIndex = Math.max(0, Math.min(itemsCopy.length, newIndex));
            itemsCopy.splice(newIndex, 0, draggedItem);
            return itemsCopy;
        });

        setDragOverInfo(null);
        dragItemRef.current?.classList.remove('dragging');
        dragItemRef.current = null;
    };

    /**
     * 拖动结束
     */
    const handleDragEnd = () => {
        setDragOverInfo(null);
        dragItemRef.current?.classList.remove('dragging');
        dragItemRef.current = null;
    };

    /**
     * 项目点击选中
     */
    const handleSelectItem = (itemId) => {
        setItems(prevItems =>
            prevItems.map(item => ({
                ...item,
                isSelected: item.id === itemId
            }))
        );
    };

    return (
        <div className="container">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="draggable-item"
                    // 阻止行元素自身的拖拽
                    draggable="false"
                    onDragStart={preventRowDrag}
                    // 放置区域事件
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, item.id)}
                    onDragEnd={handleDragEnd}
                >
                    {/* 拖拽手柄 - 只有这里可以触发拖拽 */}
                    <div
                        className="drag-handle"
                        draggable="true"
                        onDragStart={(e) => handleDragHandleStart(e, item.id)}
                        title="拖拽排序"
                    >
                        <DragOutlined style={{ marginRight: 10 }} />
                    </div>

                    {/* 内容区域 - 阻止拖拽 */}
                    <div
                        className={`item-content ${item.isSelected ? 'active' : ''}`}
                        onClick={() => handleSelectItem(item.id)}
                        // 阻止内容区域的拖拽
                        draggable="false"
                        onDragStart={preventRowDrag}
                    >
                        <div className="node-content">{item.content}</div>
                    </div>

                    {/* 放置位置指示器 */}
                    {dragOverInfo?.id === item.id && (
                        <div className={`drop-indicator ${dragOverInfo.position}`} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default DragMockInsert;
