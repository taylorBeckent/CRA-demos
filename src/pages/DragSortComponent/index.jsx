import React, { useState, useRef, useCallback, useMemo } from 'react';
import { DragOutlined, DeleteOutlined, CopyOutlined, PlusOutlined } from '@ant-design/icons';
import './dragSort.css';

/**
 * 优化版拖拽排序组件
 *
 * 核心优化策略：
 * 1. 使用固定高度的占位符，避免 DOM 重排
 * 2. 对 dragover 事件进行防抖处理，减少频繁的 DOM 更新
 * 3. 使用 CSS transform 而非改变 margin，避免重排
 * 4. 预先计算所有位置信息，减少运行时计算
 */
export default function OptimizedDragSortComponent({ onDataChange = () => {} }) {
    const [items, setItems] = useState([
        { id: '1', name: 'Step 1: Login', description: '登录系统' },
        { id: '2', name: 'Step 2: Navigate', description: '导航到首页' },
        { id: '3', name: 'Step 3: Search', description: '搜索功能' },
        { id: '4', name: 'Step 4: Filter', description: '筛选结果' },
        { id: '5', name: 'Step 5: Verify', description: '验证数据' },
    ]);

    const [draggedItem, setDraggedItem] = useState(null);
    const [insertIndex, setInsertIndex] = useState(null);
    const [dragOffset, setDragOffset] = useState(0);

    const containerRef = useRef(null);
    const itemRefs = useRef({});
    const dragOverTimeoutRef = useRef(null);

    // 计算项目的位置信息（高度、Y坐标等）
    const itemPositions = useMemo(() => {
        const positions = {};
        let currentY = 0;

        items.forEach((item, index) => {
            const height = 60; // 固定高度
            positions[item.id] = {
                index,
                top: currentY,
                height,
                bottom: currentY + height,
            };
            currentY += height + 16; // 16px 是 gap
        });

        return positions;
    }, [items]);

    // 防抖处理 dragover 事件
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // 清除之前的超时
        if (dragOverTimeoutRef.current) {
            clearTimeout(dragOverTimeoutRef.current);
        }

        // 防抖：延迟 50ms 后才更新位置
        dragOverTimeoutRef.current = setTimeout(() => {
            if (!draggedItem || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const mouseY = e.clientY - containerRect.top;

            // 计算应该插入的位置
            let newInsertIndex = items.length;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.id === draggedItem.id) continue;

                const pos = itemPositions[item.id];
                const midpoint = pos.top + pos.height / 2;

                if (mouseY < midpoint) {
                    newInsertIndex = i;
                    break;
                }
            }

            setInsertIndex(newInsertIndex);
            setDragOffset(mouseY);
        }, 50); // 50ms 防抖延迟
    }, [draggedItem, items, itemPositions]);

    const handleDragStart = useCallback((e, item) => {
        // 只有拖拽图标才能触发拖拽
        if (!e.target.closest('.drag-handle')) {
            e.preventDefault();
            return;
        }

        setDraggedItem(item);
        setInsertIndex(null);
        e.dataTransfer.effectAllowed = 'move';

        // 设置拖拽图像
        const dragImage = new Image();
        dragImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        e.dataTransfer.setDragImage(dragImage, 0, 0);
    }, []);

    const handleDragEnd = useCallback((e) => {
        e.preventDefault();

        // 清除防抖超时
        if (dragOverTimeoutRef.current) {
            clearTimeout(dragOverTimeoutRef.current);
        }

        if (draggedItem && insertIndex !== null && insertIndex !== draggedItem.id) {
            const newItems = items.filter(item => item.id !== draggedItem.id);
            newItems.splice(insertIndex, 0, draggedItem);

            setItems(newItems);
            onDataChange(newItems);
        }

        setDraggedItem(null);
        setInsertIndex(null);
        setDragOffset(0);
    }, [draggedItem, insertIndex, items, onDataChange]);

    const handleDragLeave = useCallback((e) => {
        // 只在完全离开容器时才清除
        if (e.target === containerRef.current) {
            setInsertIndex(null);
        }
    }, []);

    const handleCopy = useCallback((item) => {
        const newItem = {
            ...item,
            id: `${item.id}-copy-${Date.now()}`,
            name: `${item.name} (Copy)`,
        };
        const newItems = [...items, newItem];
        setItems(newItems);
        onDataChange(newItems);
    }, [items, onDataChange]);

    const handleDelete = useCallback((itemId) => {
        const newItems = items.filter(item => item.id !== itemId);
        setItems(newItems);
        onDataChange(newItems);
    }, [items, onDataChange]);

    const handleAddItem = useCallback(() => {
        const newItem = {
            id: `new-${Date.now()}`,
            name: `Step ${items.length + 1}: New Step`,
            description: '新步骤描述',
        };
        const newItems = [...items, newItem];
        setItems(newItems);
        onDataChange(newItems);
    }, [items, onDataChange]);

    return (
        <div className="optimized-drag-container">
            <div className="drag-header">
                <h2>拖拽排序组件（优化版）</h2>
                <button className="add-btn" onClick={handleAddItem}>
                    <PlusOutlined /> 添加步骤
                </button>
            </div>

            <div
                ref={containerRef}
                className="drag-items-container"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDragEnd}
            >
                {items.map((item, index) => {
                    const isDragging = draggedItem?.id === item.id;
                    const shouldShowPlaceholder = insertIndex === index && draggedItem?.id !== item.id;

                    return (
                        <React.Fragment key={item.id}>
                            {/* 占位符 - 固定高度，避免重排 */}
                            {shouldShowPlaceholder && (
                                <div className="drag-placeholder" />
                            )}

                            {/* 拖拽项 */}
                            <div
                                ref={(el) => {
                                    if (el) itemRefs.current[item.id] = el;
                                }}
                                draggable
                                className={`drag-item ${isDragging ? 'dragging' : ''}`}
                                onDragStart={(e) => handleDragStart(e, item)}
                                onDragEnd={handleDragEnd}
                            >
                                {/* 拖拽手柄 */}
                                <div className="drag-handle">
                                    <DragOutlined className="drag-icon" />
                                </div>

                                {/* 内容区域 */}
                                <div className="item-content">
                                    <div className="item-title">{item.name}</div>
                                    <div className="item-description">{item.description}</div>
                                </div>

                                {/* 操作按钮 */}
                                <div className="item-actions">
                                    <button
                                        className="action-btn copy-btn"
                                        onClick={() => handleCopy(item)}
                                        title="复制"
                                    >
                                        <CopyOutlined />
                                    </button>
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDelete(item.id)}
                                        title="删除"
                                    >
                                        <DeleteOutlined />
                                    </button>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}

                {/* 最后的占位符 - 用于在列表末尾插入 */}
                {insertIndex === items.length && draggedItem && (
                    <div className="drag-placeholder" />
                )}
            </div>

            {/* 统计信息 */}
            <div className="drag-stats">
                <p>总步骤数：{items.length}</p>
                {draggedItem && <p className="dragging-info">正在拖拽：{draggedItem.name}</p>}
            </div>
        </div>
    );
}
