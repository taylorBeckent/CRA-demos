import React, { useState, useRef, useEffect } from 'react';
import './DraggableList.css';

const InsertionDraggableList = () => {
    // 初始数据
    const initialItems = [
        { id: 'item-1', content: '完成项目需求分析', color: '#FF6B6B', depth: 0 },
        { id: 'item-2', content: '设计UI原型图', color: '#4ECDC4', depth: 0 },
        { id: 'item-3', content: '前端页面开发', color: '#FFD166', depth: 0 },
        { id: 'item-4', content: '后端API联调', color: '#06D6A0', depth: 0 },
        { id: 'item-5', content: '测试与发布上线', color: '#118AB2', depth: 0 },
    ];

    // 状态管理
    const [items, setItems] = useState(initialItems);
    const [draggingId, setDraggingId] = useState(null);
    const [dropTargetId, setDropTargetId] = useState(null);
    const [insertPosition, setInsertPosition] = useState(null); // 'before', 'after', 'inner'

    // 状态面板数据
    const [dragStatus, setDragStatus] = useState({
        draggingItem: '无',
        hoveringTarget: '无',
        insertPosition: '-'
    });

    // 更新状态面板
    const updateStatusPanel = (draggingItemName, hoveringTargetName, position) => {
        setDragStatus({
            draggingItem: draggingItemName || '无',
            hoveringTarget: hoveringTargetName || '无',
            insertPosition: position || '-'
        });
    };

    // 查找项目索引和内容
    const findItemIndex = (id) => items.findIndex(item => item.id === id);
    const findItemContent = (id) => items.find(item => item.id === id)?.content || '未知项目';

    // 🔥 核心：处理拖拽开始
    const handleDragStart = (e, id) => {
        e.stopPropagation();
        setDraggingId(id);
        e.dataTransfer.effectAllowed = 'move';
        // 设置拖拽数据 - 使用JSON字符串存储更多信息
        e.dataTransfer.setData('application/json', JSON.stringify({ id }));

        // 更新状态面板
        updateStatusPanel(findItemContent(id), '无', '-');

        // 添加延迟以确保拖拽样式生效
        setTimeout(() => {
            e.target.classList.add('dragging-source');
        }, 0);
    };

    // 🔥 核心：处理拖拽经过（计算插入位置）
    const handleDragOver = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';

        // 如果拖拽到自身，不处理
        if (id === draggingId) {
            setDropTargetId(null);
            setInsertPosition(null);
            updateStatusPanel(
                findItemContent(draggingId),
                findItemContent(id),
                '不能放入自身'
            );
            return;
        }

        const targetElement = e.currentTarget;
        const rect = targetElement.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const height = rect.height;

        // 计算插入位置：上部30% -> before，下部30% -> after，中间40% -> inner
        let position;
        if (mouseY < height * 0.3) {
            position = 'before';
        } else if (mouseY > height * 0.7) {
            position = 'after';
        } else {
            position = 'inner';
        }

        // 更新状态
        setDropTargetId(id);
        setInsertPosition(position);

        // 更新状态面板
        updateStatusPanel(
            findItemContent(draggingId),
            findItemContent(id),
            position === 'before' ? '插入到前方' :
                position === 'after' ? '插入到后方' : '放入内部'
        );

        // 移除其他元素的所有位置类
        document.querySelectorAll('.draggable-item').forEach(item => {
            item.classList.remove(
                'drag-over-before',
                'drag-over-after',
                'drag-over-inner'
            );
        });

        // 为当前目标添加对应位置类
        targetElement.classList.add(`drag-over-${position}`);
    };

    // 处理拖拽离开
    const handleDragLeave = (e) => {
        e.stopPropagation();
        // 只有当鼠标离开当前元素且没有进入其子元素时才清除样式
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove(
                'drag-over-before',
                'drag-over-after',
                'drag-over-inner'
            );
            if (e.currentTarget.dataset.id !== dropTargetId) {
                setDropTargetId(null);
                setInsertPosition(null);
            }
        }
    };

    // 🔥 核心：处理放置（执行插入操作）
    const handleDrop = (e, targetId) => {
        e.preventDefault();
        e.stopPropagation();

        // 如果没有拖拽项目或者没有目标，则返回
        if (!draggingId || !targetId || draggingId === targetId) {
            resetDragState();
            return;
        }

        // 获取拖拽数据
        const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
        const draggedId = dragData.id;

        // 如果是同一项目，不执行操作
        if (draggedId === targetId) {
            resetDragState();
            return;
        }

        // 执行插入操作
        performInsertion(draggedId, targetId, insertPosition);

        // 重置拖拽状态
        resetDragState();
    };

    // 执行插入操作
    const performInsertion = (draggedId, targetId, position) => {
        const draggedIndex = findItemIndex(draggedId);
        const targetIndex = findItemIndex(targetId);

        // 如果找不到索引，直接返回
        if (draggedIndex === -1 || targetIndex === -1) return;

        // 创建新数组
        const newItems = [...items];

        // 移除被拖拽的项目
        const [draggedItem] = newItems.splice(draggedIndex, 1);

        // 计算新的插入索引
        let newIndex;
        if (position === 'before') {
            newIndex = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
        } else if (position === 'after') {
            newIndex = targetIndex > draggedIndex ? targetIndex : targetIndex + 1;
        } else { // 'inner'
            // 这里简化为插入到目标之后，实际项目中可能需要处理嵌套结构
            newIndex = targetIndex > draggedIndex ? targetIndex : targetIndex + 1;
        }

        // 插入到新位置
        newItems.splice(newIndex, 0, draggedItem);

        // 更新状态
        setItems(newItems);

        // 更新状态面板显示操作结果
        setTimeout(() => {
            updateStatusPanel('无', '无', `已${position === 'before' ? '插入到前方' : position === 'after' ? '插入到后方' : '放入内部'}`);
        }, 10);
    };

    // 处理拖拽结束
    const handleDragEnd = (e) => {
        e.stopPropagation();
        resetDragState();
    };

    // 重置拖拽状态
    const resetDragState = () => {
        // 移除所有视觉类
        document.querySelectorAll('.draggable-item').forEach(item => {
            item.classList.remove(
                'dragging-source',
                'drag-over-before',
                'drag-over-after',
                'drag-over-inner'
            );
        });

        // 重置状态
        setDraggingId(null);
        setDropTargetId(null);
        setInsertPosition(null);

        // 重置状态面板
        if (!draggingId) {
            updateStatusPanel('无', '无', '-');
        }
    };

    // 重置列表
    const handleResetList = () => {
        setItems(initialItems);
        updateStatusPanel('无', '无', '-');
    };

    // 添加新项目
    const handleAddItem = () => {
        const newId = `item-${Date.now()}`;
        const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2'];
        const newItem = {
            id: newId,
            content: `新项目 ${items.length + 1}`,
            color: colors[items.length % colors.length],
            depth: 0
        };
        setItems([...items, newItem]);
    };

    return (
        <div className="insertion-draggable-container">
            <header className="demo-header">
                <h1>React 插入式拖拽列表</h1>
                <p>基于 HTML5 Drag API · 实现流畅的插入效果</p>
            </header>

            <div className="demo-controls">
                <button onClick={handleAddItem} className="btn btn-add">
                    + 添加新项目
                </button>
                <button onClick={handleResetList} className="btn btn-reset">
                    ↻ 重置列表
                </button>
            </div>

            <div className="instructions">
                <h3>🎯 操作指南</h3>
                <p><strong>拖拽任意项目</strong>，观察不同区域的视觉反馈：</p>
                <ul>
                    <li><span className="highlight before">上方蓝线</span> = 插入到目标前方</li>
                    <li><span className="highlight after">下方蓝线</span> = 插入到目标后方</li>
                    <li><span className="highlight inner">内部高亮</span> = 放入目标内部（示例中简化为插入后方）</li>
                </ul>
            </div>

            {/* 可拖拽列表 */}
            <div className="list-container">
                <ul className="draggable-list">
                    {items.map((item, index) => (
                        <li
                            key={item.id}
                            data-id={item.id}
                            className={`draggable-item ${draggingId === item.id ? 'is-dragging' : ''}`}
                            draggable="true"
                            style={{
                                '--item-color': item.color,
                                '--item-depth': item.depth
                            }}
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragOver={(e) => handleDragOver(e, item.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, item.id)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="item-content">
                                <span className="item-number">{index + 1}</span>
                                <span className="item-text">{item.content}</span>
                                <span className="item-hint">拖拽我</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 状态面板 */}
            <div className="status-panel">
                <h3>实时拖拽状态</h3>
                <div className="status-grid">
                    <div className="status-item">
                        <div className="status-label">当前拖拽项目</div>
                        <div className="status-value" id="status-dragging">
                            {dragStatus.draggingItem}
                        </div>
                    </div>
                    <div className="status-item">
                        <div className="status-label">悬停目标项目</div>
                        <div className="status-value" id="status-hovering">
                            {dragStatus.hoveringTarget}
                        </div>
                    </div>
                    <div className="status-item">
                        <div className="status-label">建议插入位置</div>
                        <div className="status-value" id="status-position">
                            {dragStatus.insertPosition}
                        </div>
                    </div>
                </div>
            </div>

            <footer className="demo-footer">
                <p>基于 React 18 + HTML5 Drag API 实现 | 项目间插入式拖拽</p>
            </footer>
        </div>
    );
};

export default InsertionDraggableList;
