import React, {useState, useRef, useEffect, useCallback} from 'react';
import './DraggableSwap.css';

const DraggableSwap = () => {
    const [ items, setItems ] = useState([
        { id: 'item1', content: '可拖拽项目 1', color: '#FF6B6B' },
        { id: 'item2', content: '可拖拽项目 2', color: '#4ECDC4' },
        { id: 'item3', content: '可拖拽项目 3', color: '#FFD166' },
        { id: 'item4', content: '可拖拽项目 4', color: '#06D6A0' },
        { id: 'item5', content: '可拖拽项目 5', color: '#118AB2' },
    ]);

    const [ draggingItem, setDraggingItem ] = useState(null);
    const [ dragOverItem, setDragOverItem ] = useState(null);
    const [ isDragging, setIsDragging ] = useState(false);

    const containerRef = useRef(null);
    const dragImageRef = useRef(null);

    // 创建拖拽图片
    useEffect(() => {
        // dragImageRef.current = document.createElement('div');
        // dragImageRef.current.style.position = 'absolute';
        // dragImageRef.current.style.top = '-1000px';
        // dragImageRef.current.style.opacity = '0.8';
        // dragImageRef.current.style.padding = '8px 16px';
        // dragImageRef.current.style.borderRadius = '8px';
        // dragImageRef.current.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        // dragImageRef.current.style.fontWeight = 'bold';
        // dragImageRef.current.style.zIndex = '9999';
        // document.body.appendChild(dragImageRef.current);
        //
        // return () => {
        //     if (dragImageRef.current) {
        //         document.body.removeChild(dragImageRef.current);
        //     }
        // };
    }, []);

    // 鼠标事件实现拖拽
    const handleMouseDown = useCallback((e, item) => {
        e.preventDefault();

        // 防止文本选中干扰
        e.currentTarget.style.userSelect = 'none';

        const itemElement = e.currentTarget;
        const rect = itemElement.getBoundingClientRect();

        // 计算鼠标在元素内的偏移量
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        // 克隆元素作为拖拽图像
        const clone = itemElement.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.zIndex = '1000';
        clone.style.pointerEvents = 'none';
        clone.style.opacity = '0.8';
        clone.style.transform = 'scale(1.05)';
        clone.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
        clone.classList.add('dragging-clone');

        document.body.appendChild(clone);

        // 存储初始数据
        const dragData = {
            item,
            element: clone,
            offsetX,
            offsetY,
            initialIndex: items.findIndex(i => i.id === item.id),
        };

        setDraggingItem(dragData);
        setIsDragging(true);

        // 添加鼠标移动和释放事件监听器
        const handleMouseMove = (moveEvent) => {
            if (!dragData.element) return;

            // 计算新位置
            const x = moveEvent.clientX - dragData.offsetX;
            const y = moveEvent.clientY - dragData.offsetY;

            dragData.element.style.left = `${x}px`;
            dragData.element.style.top = `${y}px`;

            // 检测悬停的元素
            const elements = document.elementsFromPoint(moveEvent.clientX, moveEvent.clientY);
            const hoveredElement = elements.find(el => el.classList.contains('draggable-item'));

            if (hoveredElement && hoveredElement !== itemElement) {
                const hoveredId = hoveredElement.dataset.id;
                const hoveredItem = items.find(i => i.id === hoveredId);

                if (hoveredItem && hoveredItem.id !== dragData.item.id) {
                    setDragOverItem(hoveredItem);

                    // 添加视觉反馈
                    hoveredElement.classList.add('drag-over');
                }
            } else {
                setDragOverItem(null);
                // 移除所有元素的drag-over类
                document.querySelectorAll('.draggable-item').forEach(el => {
                    el.classList.remove('drag-over');
                });
            }
        };

        const handleMouseUp = () => {
            // 执行交换逻辑
            if (dragOverItem && dragData.item.id !== dragOverItem.id) {
                const newItems = [ ...items ];
                const fromIndex = newItems.findIndex(i => i.id === dragData.item.id);
                const toIndex = newItems.findIndex(i => i.id === dragOverItem.id);

                // 交换数组元素
                [ newItems[fromIndex], newItems[toIndex] ] = [ newItems[toIndex], newItems[fromIndex] ];
                setItems(newItems);
            }

            // 清理
            if (dragData.element) {
                dragData.element.remove();
            }

            // 移除所有元素的drag-over类
            document.querySelectorAll('.draggable-item').forEach(el => {
                el.classList.remove('drag-over');
            });

            // 重置状态
            setDraggingItem(null);
            setDragOverItem(null);
            setIsDragging(false);

            // 移除事件监听器
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        // 添加事件监听器
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

    }, [ items ]);

    // HTML5 Drag API 实现（备用方案）
    const handleDragStart = useCallback((e, item) => {
        console.log('eBefore', e);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id);
        console.log('e', e);
        console.log('eStart', e.currentTarget.classList);
        console.log('eStart', e.target.classList);

        // 设置拖拽图像
        if (dragImageRef.current) {
            dragImageRef.current.textContent = item.content;
            dragImageRef.current.style.backgroundColor = item.color;
            e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
        }

        setDraggingItem({ item, method: 'drag-api' });
        setIsDragging(true);

        // 添加拖拽样式
        setTimeout(() => {
            console.log('123', e);
            e.target.classList.add('dragging');
            // e.currentTarget.classList.add('dragging');
        }, 0);
    }, []);

    const handleDragOver = useCallback((e, item) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        console.log('e-over', e);
        console.log('item-over', item);

        if (draggingItem && draggingItem.item.id !== item.id) {
            setDragOverItem(item);
            e.currentTarget.classList.add('drag-over')
        }
    }, [ draggingItem ]);

    const handleDragLeave = useCallback((e) => {
        e.currentTarget.classList.remove('drag-over');
    }, []);

    const handleDrop = useCallback((e, item) => {
        e.preventDefault();
        console.log('e-onDrop', e);
        console.log('item-onDrop', item);

        if (draggingItem && draggingItem.item.id !== item.id) {
            const newItems = [ ...items ];
            const fromIndex = newItems.findIndex(i => i.id === draggingItem.item.id);
            const toIndex = newItems.findIndex(i => i.id === item.id);

            // 交换数组元素
            [ newItems[fromIndex], newItems[toIndex] ] = [ newItems[toIndex], newItems[fromIndex] ];
            setItems(newItems);
        }

        e.currentTarget.classList.remove('drag-over');
        setDragOverItem(null);
        setIsDragging(false);
    }, [ draggingItem, items ]);

    const handleDragEnd = useCallback(() => {
        // 移除所有拖拽样式
        document.querySelectorAll('.draggable-item').forEach(el => {
            el.classList.remove('dragging', 'drag-over');
        });

        setDraggingItem(null);
        setDragOverItem(null);
        setIsDragging(false);
    }, []);

    return (
        <div className="draggable-swap-container">
            <h2>手动拖拽交换Div位置</h2>
            <p className="description">
                尝试拖拽下面的彩色方块，将其拖放到其他方块上来交换位置。
                <br/>
                <strong>支持两种实现方式：</strong>
                1. 纯鼠标事件（更灵活） 2. HTML5 Drag API（更简单）
            </p>

            <div className="implementation-section">
                <h3>方法一：鼠标事件实现（推荐）</h3>
                <p>使用mousedown/mousemove/mouseup事件手动控制拖拽</p>
                <div className="items-container" ref={containerRef}>
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className="draggable-item mouse-draggable"
                            data-id={item.id}
                            style={{
                                backgroundColor: item.color,
                                transform: isDragging && draggingItem?.item.id === item.id
                                    ? 'scale(0.95)'
                                    : 'scale(1)',
                                opacity: isDragging && draggingItem?.item.id === item.id ? 0.3 : 1,
                            }}
                            onMouseDown={(e) => handleMouseDown(e, item)}
                        >
                            <div className="item-content">
                                <span className="item-index">{index + 1}</span>
                                <span className="item-text">{item.content}</span>
                            </div>
                            <div className="item-hint">按住拖拽</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="implementation-section">
                <h3>方法二：HTML5 Drag API 实现</h3>
                <p>使用原生拖拽API，更简单但浏览器兼容性更好</p>
                <div className="items-container">
                    {items.map((item, index) => (
                        <div
                            key={`drag-api-${item.id}`}
                            className="draggable-item drag-api-draggable"
                            draggable="true"
                            style={{ backgroundColor: item.color }}
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragOver={(e) => handleDragOver(e, item)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, item)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="item-content">
                                <span className="item-index">{index + 1}</span>
                                <span className="item-text">{item.content}</span>
                            </div>
                            <div className="item-hint">拖拽我</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="drag-status">
                <div className="status-item">
                    <span className="status-label">当前拖拽项目:</span>
                    <span className="status-value">
            {draggingItem ? draggingItem.item.content : '无'}
          </span>
                </div>
                <div className="status-item">
                    <span className="status-label">悬停目标项目:</span>
                    <span className="status-value">
            {dragOverItem ? dragOverItem.content : '无'}
          </span>
                </div>
                <div className="status-item">
                    <span className="status-label">当前顺序:</span>
                    <span className="status-value">
            {items.map(item => item.content.split(' ')[2]).join(' → ')}
          </span>
                </div>
            </div>

            <div className="implementation-explanation">
                <h3>拖拽交换原理详解</h3>

                <div className="principle-card">
                    <h4>方法一：鼠标事件实现原理</h4>
                    <ol>
                        <li>
                            <strong>mousedown 事件</strong>
                            <p>记录拖拽开始时的位置信息，创建视觉反馈（克隆元素）</p>
                            <code>
                                const offsetX = e.clientX - rect.left;<br/>
                                const offsetY = e.clientY - rect.top;
                            </code>
                        </li>
                        <li>
                            <strong>mousemove 事件</strong>
                            <p>实时计算并更新克隆元素的位置，检测悬停的目标元素</p>
                            <code>
                                const x = moveEvent.clientX - offsetX;<br/>
                                const y = moveEvent.clientY - offsetY;
                            </code>
                        </li>
                        <li>
                            <strong>碰撞检测</strong>
                            <p>使用 document.elementsFromPoint() 检测鼠标位置下的元素</p>
                            <code>
                                const elements = document.elementsFromPoint(x, y);<br/>
                                const hoveredElement = elements.find(el => el.classList.contains('draggable-item'));
                            </code>
                        </li>
                        <li>
                            <strong>mouseup 事件</strong>
                            <p>执行交换逻辑，清理资源，移除事件监听器</p>
                            <code>
                                [newItems[fromIndex], newItems[toIndex]] = [newItems[toIndex], newItems[fromIndex]];
                            </code>
                        </li>
                    </ol>
                </div>

                <div className="principle-card">
                    <h4>方法二：HTML5 Drag API 原理</h4>
                    <ol>
                        <li>
                            <strong>draggable="true"</strong>
                            <p>设置元素为可拖拽，触发浏览器原生拖拽行为</p>
                        </li>
                        <li>
                            <strong>dragstart 事件</strong>
                            <p>设置拖拽数据(dataTransfer)，自定义拖拽图像</p>
                            <code>e.dataTransfer.setData('text/plain', item.id);</code>
                        </li>
                        <li>
                            <strong>dragover 事件</strong>
                            <p>必须调用 preventDefault() 才能成为有效的放置目标</p>
                            <code>e.preventDefault(); // 关键！</code>
                        </li>
                        <li>
                            <strong>drop 事件</strong>
                            <p>获取拖拽数据，执行交换操作</p>
                            <code>const draggedId = e.dataTransfer.getData('text/plain');</code>
                        </li>
                    </ol>
                </div>

                <div className="comparison-table">
                    <h4>两种方法对比</h4>
                    <table>
                        <thead>
                        <tr>
                            <th>特性</th>
                            <th>鼠标事件</th>
                            <th>Drag API</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>控制粒度</td>
                            <td>⭐️⭐️⭐️⭐️⭐️（完全控制）</td>
                            <td>⭐️⭐️⭐️（浏览器控制）</td>
                        </tr>
                        <tr>
                            <td>实现复杂度</td>
                            <td>⭐️⭐️⭐️⭐️（需要自己实现）</td>
                            <td>⭐️⭐️（API简单）</td>
                        </tr>
                        <tr>
                            <td>跨浏览器兼容性</td>
                            <td>⭐️⭐️⭐️⭐️⭐️（基于基础事件）</td>
                            <td>⭐️⭐️⭐️⭐️（现代浏览器支持好）</td>
                        </tr>
                        <tr>
                            <td>移动端支持</td>
                            <td>⭐️⭐️⭐️（需处理触摸事件）</td>
                            <td>⭐️⭐️（有限支持）</td>
                        </tr>
                        <tr>
                            <td>视觉定制能力</td>
                            <td>⭐️⭐️⭐️⭐️⭐️（完全自定义）</td>
                            <td>⭐️⭐️（受浏览器限制）</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DraggableSwap;
