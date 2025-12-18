import React, { useState, useRef, useEffect } from 'react';
import './DragIconComponent.css';

const DragIconComponent = () => {
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isIconDragging, setIsIconDragging] = useState(false);
    const [showIcon, setShowIcon] = useState(false);

    const containerRef = useRef(null);
    const dragIconRef = useRef(null);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const containerStartPos = useRef({ x: 0, y: 0 });

    // 鼠标移入显示图标（延迟显示，防止误触）
    useEffect(() => {
        let timeoutId;

        const handleMouseEnter = () => {
            timeoutId = setTimeout(() => {
                setShowIcon(true);
            }, 300); // 延迟300ms显示，避免鼠标快速划过时显示
        };

        const handleMouseLeave = () => {
            clearTimeout(timeoutId);
            if (!isIconDragging) {
                setShowIcon(false);
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mouseenter', handleMouseEnter);
            container.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                container.removeEventListener('mouseenter', handleMouseEnter);
                container.removeEventListener('mouseleave', handleMouseLeave);
                clearTimeout(timeoutId);
            };
        }
    }, [isIconDragging]);

    // 处理拖拽图标鼠标按下
    const handleIconMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsIconDragging(true);
        setIsDragging(true);

        // 记录初始位置
        dragStartPos.current = {
            x: e.clientX,
            y: e.clientY
        };

        containerStartPos.current = { ...position };

        // 添加全局事件监听器
        document.addEventListener('mousemove', handleIconMouseMove);
        document.addEventListener('mouseup', handleIconMouseUp);

        // 添加拖拽样式
        if (containerRef.current) {
            containerRef.current.classList.add('dragging');
        }
        if (dragIconRef.current) {
            dragIconRef.current.classList.add('icon-active');
        }
    };

    // 处理拖拽图标鼠标移动
    const handleIconMouseMove = (e) => {
        if (!isIconDragging) return;

        // 计算移动距离
        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;

        // 更新容器位置
        const newX = containerStartPos.current.x + deltaX;
        const newY = containerStartPos.current.y + deltaY;

        // 边界检查（防止拖出可视区域）
        const maxX = window.innerWidth - (containerRef.current?.offsetWidth || 300);
        const maxY = window.innerHeight - (containerRef.current?.offsetHeight || 200);

        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
    };

    // 处理拖拽图标鼠标释放
    const handleIconMouseUp = () => {
        setIsIconDragging(false);
        setIsDragging(false);

        // 移除全局事件监听器
        document.removeEventListener('mousemove', handleIconMouseMove);
        document.removeEventListener('mouseup', handleIconMouseUp);

        // 移除拖拽样式
        if (containerRef.current) {
            containerRef.current.classList.remove('dragging');
        }
        if (dragIconRef.current) {
            dragIconRef.current.classList.remove('icon-active');
        }

        // 如果鼠标不在容器内，隐藏图标
        if (!isHovered) {
            setTimeout(() => {
                if (!isIconDragging) {
                    setShowIcon(false);
                }
            }, 500); // 延迟500ms隐藏
        }
    };

    // 处理容器点击（阻止拖拽图标时触发容器点击）
    const handleContainerClick = (e) => {
        if (isIconDragging) {
            e.stopPropagation();
        }
    };

    return (
        <div className="drag-icon-page">
            <div className="header">
                <h1>✨ 悬浮拖拽按钮组件</h1>
                <p className="subtitle">悬停显示拖拽按钮 · 拖拽按钮移动整个容器</p>
            </div>

            <div className="instructions">
                <div className="instruction-card">
                    <div className="instruction-icon">🎯</div>
                    <div className="instruction-content">
                        <h3>操作指南</h3>
                        <p>将鼠标<strong>悬停</strong>在彩色卡片上，右上角会出现拖拽按钮。</p>
                        <p><strong>拖拽按钮</strong>即可移动整个卡片，卡片内容本身不可拖拽。</p>
                    </div>
                </div>

                <div className="instruction-card">
                    <div className="instruction-icon">⚙️</div>
                    <div className="instruction-content">
                        <h3>实现原理</h3>
                        <ul>
                            <li>通过 <code>mouseenter/mouseleave</code> 控制按钮显示</li>
                            <li>在按钮上监听 <code>mousedown/mousemove/mouseup</code></li>
                            <li>计算鼠标位移，更新容器位置</li>
                            <li>添加边界检测和流畅动画</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 可拖拽容器 */}
            <div
                ref={containerRef}
                className="drag-container"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    cursor: isDragging ? 'grabbing' : 'default'
                }}
                onClick={handleContainerClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* 悬浮拖拽按钮 */}
                <div
                    ref={dragIconRef}
                    className={`drag-icon ${showIcon ? 'visible' : ''} ${isIconDragging ? 'dragging' : ''}`}
                    onMouseDown={handleIconMouseDown}
                    title="拖拽此处移动"
                >
                    <div className="icon-dots">
            <span className="dot-row">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
                        <span className="dot-row">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
                    </div>
                </div>

                {/* 容器内容 */}
                <div className="container-content">
                    <div className="content-header">
                        <div className="content-badge">可拖拽容器</div>
                        <div className="content-status">
                            {isDragging ? (
                                <span className="status-dragging">拖拽中...</span>
                            ) : (
                                <span className="status-idle">等待拖拽</span>
                            )}
                        </div>
                    </div>

                    <div className="content-body">
                        <h2>悬浮按钮拖拽示例</h2>
                        <p>这是一个通过悬浮按钮控制拖拽的演示容器。</p>
                        <p>只有右上角的拖拽按钮可以拖拽移动此容器，容器内容本身不可拖拽。</p>

                        <div className="content-features">
                            <div className="feature">
                                <span className="feature-icon">🎨</span>
                                <span className="feature-text">平滑动画</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">📏</span>
                                <span className="feature-text">边界限制</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">⏱️</span>
                                <span className="feature-text">延迟显示</span>
                            </div>
                        </div>

                        <div className="content-coordinates">
                            <div className="coordinate">
                                <span className="coord-label">X坐标:</span>
                                <span className="coord-value">{Math.round(position.x)}px</span>
                            </div>
                            <div className="coordinate">
                                <span className="coord-label">Y坐标:</span>
                                <span className="coord-value">{Math.round(position.y)}px</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 状态面板 */}
            <div className="status-panel">
                <div className="status-header">
                    <h3>📊 实时状态</h3>
                    <div className="status-indicators">
                        <div className={`indicator ${showIcon ? 'active' : ''}`}>
                            <div className="indicator-light"></div>
                            <span>按钮显示</span>
                        </div>
                        <div className={`indicator ${isIconDragging ? 'active' : ''}`}>
                            <div className="indicator-light"></div>
                            <span>拖拽中</span>
                        </div>
                        <div className={`indicator ${isHovered ? 'active' : ''}`}>
                            <div className="indicator-light"></div>
                            <span>悬停中</span>
                        </div>
                    </div>
                </div>

                <div className="status-details">
                    <div className="status-detail">
                        <span className="detail-label">容器位置:</span>
                        <span className="detail-value">
                          ({position.x}, {position.y})
                        </span>
                    </div>
                    <div className="status-detail">
                        <span className="detail-label">拖拽按钮:</span>
                        <span className="detail-value">
                          {showIcon ? '可见' : '隐藏'} • {isIconDragging ? '激活中' : '未激活'}
                        </span>
                    </div>
                    <div className="status-detail">
                        <span className="detail-label">交互提示:</span>
                        <span className="detail-value">
              {showIcon
                  ? '请拖拽右上角按钮移动容器'
                  : '请将鼠标悬停在容器上显示拖拽按钮'}
            </span>
                    </div>
                </div>
            </div>

            <div className="explanation">
                <h3>💡 技术要点</h3>
                <div className="code-snippet">
          <pre>{`// 1. 显示/隐藏控制（延迟避免误触）
useEffect(() => {
  const handleMouseEnter = () => {
    timeoutId = setTimeout(() => setShowIcon(true), 300);
  };
}, []);

// 2. 拖拽逻辑（计算位置增量）
const handleIconMouseMove = (e) => {
  const deltaX = e.clientX - dragStartPos.current.x;
  const deltaY = e.clientY - dragStartPos.current.y;
  setPosition({
    x: containerStartPos.current.x + deltaX,
    y: containerStartPos.current.y + deltaY
  });
};

// 3. 边界检测（防止拖出屏幕）
const maxX = window.innerWidth - containerWidth;
const maxY = window.innerHeight - containerHeight;
setPosition({
  x: Math.max(0, Math.min(newX, maxX)),
  y: Math.max(0, Math.min(newY, maxY))
});`}</pre>
                </div>
            </div>
        </div>
    );
};

export default DragIconComponent;
