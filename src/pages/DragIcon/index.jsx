import React, { useState, useEffect, useRef } from 'react';
import './DragIconComponent.css';
import { DragOutlined } from '@ant-design/icons';

const INITIAL_ITEMS = [
    { id: 'item-1', content: '完成项目需求分析', isSelected: false },
    { id: 'item-2', content: '设计UI原型图', isSelected: false },
    { id: 'item-3', content: '前端页面开发', isSelected: false },
    { id: 'item-4', content: '后端API联调', isSelected: false },
    { id: 'item-5', content: '测试与发布上线', isSelected: false },
];

/**
 * 实时拖拽排序组件
 */
const DragMockInsert = () => {
    const [items, setItems] = useState([]);
    const [draggingId, setDraggingId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const [dragPosition, setDragPosition] = useState(null); // 'before' | 'after'

    const dragItemRef = useRef(null);
    const containerRef = useRef(null);
    const lastUpdatedTime = useRef(0);
    const THROTTLE_DELAY = 50; // 节流延迟，防止过于频繁更新

    useEffect(() => {
        setItems(INITIAL_ITEMS);
    }, []);

    /**
     * 拖动开始
     */
    const handleDragStart = (e, itemId) => {
        e.stopPropagation();

        const draggableItem = e.currentTarget.closest('.draggable-item');
        if (!draggableItem) return;

        dragItemRef.current = draggableItem;

        // 设置拖拽数据
        e.dataTransfer.setData('text/plain', itemId);
        e.dataTransfer.effectAllowed = 'move';
        setDraggingId(itemId);

        // 创建拖拽预览
        const dragPreview = createDragPreview(draggableItem);
        e.dataTransfer.setDragImage(dragPreview, 20, 20);

        // 添加拖拽样式
        draggableItem.classList.add('dragging');
    };

    /**
     * 创建拖拽预览
     */
    const createDragPreview = (element) => {
        const preview = element.cloneNode(true);
        // preview.style.width = `${element.offsetWidth}px`;
        preview.style.width = `100px`;
        preview.style.opacity = '0.7';
        preview.style.position = 'fixed';
        preview.style.left = '-1000px';
        preview.style.top = '-1000px';
        preview.classList.add('drag-preview');
        document.body.appendChild(preview);

        setTimeout(() => {
            if (document.body.contains(preview)) {
                document.body.removeChild(preview);
            }
        }, 0);

        return preview;
    };

    /**
     * 拖动经过 - 实时更新位置
     */
    const handleDragOver = (e, itemId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggingId === itemId) return;

        // 节流处理，避免过于频繁的更新
        const now = Date.now();
        if (now - lastUpdatedTime.current < THROTTLE_DELAY) return;
        lastUpdatedTime.current = now;

        // 计算鼠标在目标元素中的位置
        const rect = e.currentTarget.getBoundingClientRect();
        console.log('rect',rect);
        console.log('e.clientY', e.clientY);
        const mouseY = e.clientY - rect.top;
        const position = mouseY < rect.height / 2 ? 'before' : 'after';
        console.log('position', position);

        // 如果位置没变化，不更新
        if (dragOverId === itemId && dragPosition === position) return;

        setDragOverId(itemId);
        setDragPosition(position);

        // 实时更新列表顺序
        setItems(prevItems => {
            const itemsCopy = [...prevItems];
            const draggedIndex = itemsCopy.findIndex(item => item.id === draggingId);
            const targetIndex = itemsCopy.findIndex(item => item.id === itemId);

            if (draggedIndex === -1 || targetIndex === -1) return prevItems;

            // 如果拖动元素和目标的相对位置没变，不更新
            const isSameRelativePosition =
                (draggedIndex < targetIndex && position === 'after') ||
                (draggedIndex > targetIndex && position === 'before');

            if (Math.abs(draggedIndex - targetIndex) === 1 && isSameRelativePosition) {
                return prevItems;
            }

            // 移除被拖动的元素
            const [draggedItem] = itemsCopy.splice(draggedIndex, 1);

            // 计算新的插入位置
            let newIndex = targetIndex;
            if (position === 'after' && draggedIndex < targetIndex) {
                newIndex = targetIndex; // 从上往下拖，放在目标后面
            } else if (position === 'after' && draggedIndex > targetIndex) {
                newIndex = targetIndex + 1; // 从下往上拖，放在目标后面
            } else if (position === 'before' && draggedIndex > targetIndex) {
                newIndex = targetIndex; // 从下往上拖，放在目标前面
            } else if (position === 'before' && draggedIndex < targetIndex) {
                newIndex = targetIndex - 1; // 从上往下拖，放在目标前面
            }

            // 确保索引有效
            newIndex = Math.max(0, Math.min(itemsCopy.length, newIndex));

            // 插入到新位置
            itemsCopy.splice(newIndex, 0, draggedItem);
            return itemsCopy;
        });
    };

    /**
     * 拖动离开
     */
    const handleDragLeave = (e) => {
        // 只有当鼠标离开当前元素且没有进入子元素时，才清除指示器
        const relatedTarget = e.relatedTarget;
        if (!e.currentTarget.contains(relatedTarget)) {
            setDragOverId(null);
            setDragPosition(null);
        }
    };

    /**
     * 放置处理
     */
    const handleDrop = (e, targetId) => {
        e.preventDefault();

        // 获取拖动的数据
        const draggedId = e.dataTransfer.getData('text/plain');

        // 如果拖动的是同一个元素，不做处理
        if (!draggedId || draggedId === targetId) {
            cleanupDrag();
            return;
        }

        // 列表已经在dragOver中更新过了，这里只需要同步确保正确
        setItems(prevItems => {
            const itemsCopy = [...prevItems];
            const draggedIndex = itemsCopy.findIndex(item => item.id === draggedId);
            const targetIndex = itemsCopy.findIndex(item => item.id === targetId);

            // 如果元素已经在新位置，直接返回
            if (draggedIndex === -1 || targetIndex === -1) return prevItems;

            // 检查是否已经在正确位置
            const expectedPosition = dragPosition === 'before' ? targetIndex - 1 : targetIndex;
            if (draggedIndex === expectedPosition) return prevItems;

            // 重新排序确保正确
            const [draggedItem] = itemsCopy.splice(draggedIndex, 1);
            const newIndex = dragPosition === 'before' ? targetIndex - 1 : targetIndex + 1;
            const adjustedIndex = Math.max(0, Math.min(itemsCopy.length, newIndex));
            itemsCopy.splice(adjustedIndex, 0, draggedItem);

            return itemsCopy;
        });

        cleanupDrag();
    };

    /**
     * 拖动结束
     */
    const handleDragEnd = () => {
        cleanupDrag();
    };

    /**
     * 清理拖拽状态
     */
    const cleanupDrag = () => {
        setDraggingId(null);
        setDragOverId(null);
        setDragPosition(null);
        lastUpdatedTime.current = 0;

        // 移除拖拽样式
        if (dragItemRef.current) {
            dragItemRef.current.classList.remove('dragging');
            dragItemRef.current = null;
        }
    };

    /**
     * 处理项目选中
     */
    const handleSelectItem = (itemId) => {
        setItems(prevItems =>
            prevItems.map(item => ({
                ...item,
                isSelected: item.id === itemId
            }))
        );
    };

    /**
     * 阻止默认拖拽行为
     */
    const preventDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    return (
        <div className="container" ref={containerRef}>
            {items.map((item) => (
                <div
                    key={item.id}
                    className={`draggable-item ${draggingId === item.id ? 'dragging' : ''}`}
                    // 放置区域事件
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, item.id)}
                    onDragEnd={handleDragEnd}
                    // 阻止行元素自身的拖拽
                    draggable="false"
                    onDragStart={preventDrag}
                >
                    {/* 拖拽手柄 */}
                    <div
                        className="drag-handle"
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        title="拖拽排序"
                    >
                        <DragOutlined style={{ marginRight: 10 }} />
                    </div>

                    {/* 内容区域 */}
                    <div
                        className={`item-content ${item.isSelected ? 'active' : ''}`}
                        onClick={() => handleSelectItem(item.id)}
                        draggable="false"
                        onDragStart={preventDrag}
                    >
                        <div className="node-content">{item.content}</div>
                    </div>

                    {/* 动态位置指示器 */}
                    {dragOverId === item.id && dragPosition === 'before' && (
                        <div className="drop-indicator before" />
                    )}
                </div>
            ))}
        </div>
    );
};

export default DragMockInsert;
