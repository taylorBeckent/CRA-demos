import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './DragIconComponent.css';
import { DragOutlined } from '@ant-design/icons';

const INITIAL_ITEMS = [
    { id: 'item-1', content: '完成项目需求分析', isSelected: false },
    { id: 'item-2', content: '设计UI原型图', isSelected: false },
    { id: 'item-3', content: '前端页面开发', isSelected: false },
    { id: 'item-4', content: '后端API联调', isSelected: false },
    { id: 'item-5', content: '测试与发布上线', isSelected: false },
];

// 防抖函数
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const DragMockInsert = () => {
    const [items, setItems] = useState([]);
    const [draggingId, setDraggingId] = useState(null);
    const [dragOverInfo, setDragOverInfo] = useState(null);

    const containerRef = useRef(null);
    const itemRefs = useRef(new Map());
    const positionsRef = useRef(new Map());
    const animationFrameRef = useRef(null);
    const draggingIdRef = useRef(null);
    const lastValidTargetRef = useRef(null); // 存储最后一个有效的目标元素

    useEffect(() => {
        setItems(INITIAL_ITEMS);
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // 存储元素引用
    const setItemRef = useCallback((id, element) => {
        if (element) {
            itemRefs.current.set(id, element);
        } else {
            itemRefs.current.delete(id);
        }
    }, []);

    // 获取所有元素位置信息
    const updatePositions = useCallback(() => {
        positionsRef.current.clear();
        itemRefs.current.forEach((element, id) => {
            if (element && element.isConnected) { // 检查元素是否仍在DOM中
                const rect = element.getBoundingClientRect();
                positionsRef.current.set(id, {
                    element,
                    top: rect.top,
                    height: rect.height,
                    index: items.findIndex(item => item.id === id)
                });
            }
        });
    }, [items]);

    // 创建拖拽预览
    const createDragPreview = useCallback((element) => {
        const preview = element.cloneNode(true);
        preview.style.width = `${element.offsetWidth}px`;
        preview.style.position = 'fixed';
        preview.style.left = '-1000px';
        preview.style.top = '-1000px';
        preview.style.zIndex = '1000';
        preview.style.opacity = '0.8';
        preview.style.transform = 'scale(1.02)';
        preview.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
        preview.classList.add('drag-preview');
        document.body.appendChild(preview);
        return preview;
    }, []);

    // 拖拽开始
    const handleDragStart = useCallback((e, itemId) => {
        e.stopPropagation();

        const draggableItem = e.currentTarget.closest('.draggable-item');
        if (!draggableItem) return;

        // 更新位置信息
        updatePositions();

        // 设置拖拽数据
        e.dataTransfer.setData('text/plain', itemId);
        e.dataTransfer.effectAllowed = 'move';
        setDraggingId(itemId);
        draggingIdRef.current = itemId;

        // 创建拖拽预览
        const dragPreview = createDragPreview(draggableItem);

        // 设置拖拽图像
        const dragImageOffset = 20;
        e.dataTransfer.setDragImage(dragPreview, dragImageOffset, dragImageOffset);

        // 添加拖拽样式
        draggableItem.classList.add('dragging');

        // 清理临时元素
        setTimeout(() => {
            if (document.body.contains(dragPreview)) {
                document.body.removeChild(dragPreview);
            }
        }, 0);
    }, [updatePositions, createDragPreview]);

    // 安全地获取元素位置
    const getSafeElementRect = useCallback((element) => {
        if (!element || !element.isConnected) {
            return null;
        }

        try {
            return element.getBoundingClientRect();
        } catch (error) {
            console.warn('无法获取元素位置:', error);
            return null;
        }
    }, []);

    // 更新元素动画状态
    const updateItemAnimations = useCallback((newItems) => {
        const currentDraggingId = draggingIdRef.current;

        if (!currentDraggingId) return;

        requestAnimationFrame(() => {
            newItems.forEach((item, index) => {
                const element = itemRefs.current.get(item.id);
                if (element && element.isConnected && item.id !== currentDraggingId) {
                    const currentPos = positionsRef.current.get(item.id);
                    if (currentPos) {
                        const newTop = index * (currentPos.height + 16);
                        const diff = newTop - currentPos.top;

                        if (Math.abs(diff) > 2) {
                            element.style.transform = `translateY(${diff}px)`;
                        }
                    }
                }
            });

            // 更新位置缓存
            setTimeout(() => {
                updatePositions();
            }, 300);
        });
    }, [updatePositions]);

    // 使用防抖的拖拽经过处理 - 修复版本
    const debouncedHandleDragOver = useMemo(() =>
            debounce((event, itemId) => {
                const currentDraggingId = draggingIdRef.current;

                if (!currentDraggingId || currentDraggingId === itemId) return;

                const positions = positionsRef.current;
                if (!positions.has(currentDraggingId) || !positions.has(itemId)) return;

                // 安全地获取目标元素
                const targetElement = itemRefs.current.get(itemId);
                if (!targetElement || !targetElement.isConnected) return;

                // 安全地获取位置信息
                const targetRect = getSafeElementRect(targetElement);
                if (!targetRect) return;

                // 计算插入位置
                let position;
                if (event.type === 'dragover') {
                    // 对于拖拽事件，使用event.clientY
                    const mouseY = event.clientY - targetRect.top;
                    position = mouseY < targetRect.height / 2 ? 'before' : 'after';
                } else {
                    // 对于touch事件或其他情况，使用默认值
                    position = 'after';
                }

                // 如果位置没变化，不更新
                if (dragOverInfo?.id === itemId && dragOverInfo?.position === position) return;

                setDragOverInfo({ id: itemId, position });

                // 实时重新排序
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }

                animationFrameRef.current = requestAnimationFrame(() => {
                    setItems(prevItems => {
                        const itemsCopy = [...prevItems];
                        const draggedPos = positions.get(currentDraggingId);
                        const targetPos = positions.get(itemId);

                        if (!draggedPos || !targetPos) return prevItems;

                        const draggedIndex = draggedPos.index;
                        const targetIndex = targetPos.index;

                        if (draggedIndex === -1 || targetIndex === -1) return prevItems;

                        // 计算元素应该移动的方向
                        const [draggedItem] = itemsCopy.splice(draggedIndex, 1);

                        let newIndex = targetIndex;
                        if (position === 'after' && draggedIndex < targetIndex) {
                            newIndex = targetIndex;
                        } else if (position === 'after' && draggedIndex > targetIndex) {
                            newIndex = targetIndex + 1;
                        } else if (position === 'before' && draggedIndex > targetIndex) {
                            newIndex = targetIndex;
                        } else if (position === 'before' && draggedIndex < targetIndex) {
                            newIndex = targetIndex - 1;
                        }

                        newIndex = Math.max(0, Math.min(itemsCopy.length, newIndex));
                        itemsCopy.splice(newIndex, 0, draggedItem);

                        // 更新动画状态
                        updateItemAnimations(itemsCopy);

                        return itemsCopy;
                    });
                });
            }, 8),
        [dragOverInfo, updateItemAnimations, getSafeElementRect]);

    // 拖动经过 - 修复版本
    const handleDragOver = useCallback((e, itemId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // 存储有效的目标元素
        const targetElement = e.currentTarget;
        if (targetElement && targetElement.isConnected) {
            lastValidTargetRef.current = { element: targetElement, itemId };
        }

        // 传递事件和itemId到防抖函数
        debouncedHandleDragOver(e, itemId);
    }, [debouncedHandleDragOver]);

    // 拖动离开
    const handleDragLeave = useCallback((e) => {
        // 只有当鼠标离开当前元素且没有进入子元素时，才清除指示器
        const relatedTarget = e.relatedTarget;
        const currentTarget = e.currentTarget;

        if (!currentTarget) return;

        if (!currentTarget.contains(relatedTarget)) {
            setDragOverInfo(null);
        }
    }, []);

    // 放置处理 - 修复版本
    const handleDrop = useCallback((e, targetId) => {
        e.preventDefault();

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId || draggedId === targetId) {
            cleanupDrag();
            return;
        }

        // 确保正确的最终顺序
        setItems(prevItems => {
            const itemsCopy = [...prevItems];
            const draggedIndex = itemsCopy.findIndex(item => item.id === draggedId);
            const targetIndex = itemsCopy.findIndex(item => item.id === targetId);

            if (draggedIndex === -1 || targetIndex === -1) return prevItems;

            const [draggedItem] = itemsCopy.splice(draggedIndex, 1);

            let newIndex = targetIndex;
            if (dragOverInfo?.position === 'after') {
                newIndex = draggedIndex < targetIndex ? targetIndex : targetIndex + 1;
            } else {
                newIndex = draggedIndex > targetIndex ? targetIndex : targetIndex - 1;
            }

            newIndex = Math.max(0, Math.min(itemsCopy.length, newIndex));
            itemsCopy.splice(newIndex, 0, draggedItem);

            // 重置所有transform
            itemRefs.current.forEach((element) => {
                if (element && element.isConnected) {
                    element.style.transform = '';
                }
            });

            return itemsCopy;
        });

        cleanupDrag();
    }, [dragOverInfo]);

    // 拖动结束
    const handleDragEnd = useCallback(() => {
        cleanupDrag();
    }, []);

    // 清理拖拽状态
    const cleanupDrag = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        setDraggingId(null);
        draggingIdRef.current = null;
        setDragOverInfo(null);
        lastValidTargetRef.current = null;

        // 重置所有transform
        itemRefs.current.forEach((element) => {
            if (element && element.isConnected) {
                element.style.transform = '';
                element.classList.remove('dragging');
            }
        });
    }, []);

    // 阻止默认拖拽
    const preventDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, []);

    // 项目点击选中
    const handleSelectItem = useCallback((itemId) => {
        setItems(prevItems =>
            prevItems.map(item => ({
                ...item,
                isSelected: item.id === itemId
            }))
        );
    }, []);

    // 处理拖拽结束的全局事件
    useEffect(() => {
        const handleGlobalDragEnd = () => {
            cleanupDrag();
        };

        // 监听全局的dragend事件，防止事件未正确触发
        document.addEventListener('dragend', handleGlobalDragEnd);

        return () => {
            document.removeEventListener('dragend', handleGlobalDragEnd);
        };
    }, [cleanupDrag]);

    return (
        <div className="container" ref={containerRef}>
            {items.map((item) => (
                <div
                    key={item.id}
                    ref={(el) => setItemRef(item.id, el)}
                    className={`draggable-item ${draggingId === item.id ? 'dragging' : ''}`}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, item.id)}
                    onDragEnd={handleDragEnd}
                    draggable="false"
                    onDragStart={preventDrag}
                    style={{
                        transition: draggingId && draggingId !== item.id
                            ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            : 'none',
                        zIndex: draggingId === item.id ? 1000 : 1
                    }}
                >
                    {/* 拖拽手柄 */}
                    <div
                        className="drag-handle"
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onMouseDown={(e) => e.stopPropagation()} // 防止事件冒泡
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

                    {/* 放置位置指示器 */}
                    {dragOverInfo?.id === item.id && dragOverInfo?.position === 'before' && (
                        <div className="drop-indicator before show" />
                    )}
                    {dragOverInfo?.id === item.id && dragOverInfo?.position === 'after' && (
                        <div className="drop-indicator after show" />
                    )}
                </div>
            ))}
        </div>
    );
};

export default DragMockInsert;
