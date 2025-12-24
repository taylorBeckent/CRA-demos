import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import './index.css';
import {
    LinkOutlined,
    CopyOutlined,
    DeleteOutlined,
    DragOutlined,
    RightOutlined,
    DownOutlined
} from '@ant-design/icons';
import {Button, Dropdown} from "antd";

const TreeNode = (props) => {
    const {
        node,
        index,
        parentPath = '',
        depth = 0,
        onMouseAction,
        onSelect,
        onDragStart,
        onDragOver,
        onDragLeave,
        onDrop,
        onDragEnd,
        onCollapse,
        dragOverInfo
    } = props;

    const DropItem = [
        { key: 1, label: (<div>完成项目需求分析</div>) },
        { key: 2, label: (<div>设计UI原型图</div>) },
        { key: 3, label: (<div>前端页面开发</div>) },
    ]

    const nodePath = parentPath ? `${parentPath}-${index}` : `${index}`;

    // 使用防抖的点击处理器
    const handleCollapseClick = useCallback((e, nodeId) => {
        e.stopPropagation();
        e.preventDefault();

        onCollapse(nodeId);
    }, [onCollapse]);

    const handleSelectClick = useCallback((e) => {
        e.stopPropagation();
        onSelect(e, node);
    }, [onSelect, node]);

    return (
        <div
            className="draggable-item"
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
            onDragOver={(e) => onDragOver(e, node.id, depth)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, node.id, depth)}
            onDragEnd={onDragEnd}
            onMouseEnter={(e) => onMouseAction(e, node, 'mouseEnter')}
            onMouseLeave={(e) => onMouseAction(e, node, 'mouseLeave')}
        >
            <div
                title="拖拽排序"
                className="drag-handle"
                draggable="true"
                onDragStart={(e) => onDragStart(e, node.id, depth)}
            >
                <DragOutlined/>
            </div>

            <div className="step-node-preview">
                <div
                    className={`item-content ${node.isSelected ? 'active' : ''} ${node.childNode?.length > 0 && !node.collapse ? 'is-open' : ''}`}
                    onClick={handleSelectClick}
                    draggable="false"
                    onDragStart={(e) => e.preventDefault()}
                >
                    {node.childNode && node.childNode.length > 0 ? (
                        <span
                            onClick={(e) => handleCollapseClick(e, node.id)}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          {node.collapse ?
                              <RightOutlined style={{ fontSize: 12 }} /> :
                              <DownOutlined style={{ fontSize: 12 }} />
                          }
                        </span>
                    ) : (
                        <span style={{ width: 16, display: 'inline-block' }}></span>
                    )}

                    {/*<span>{`${index + 1}. `}</span>*/}

                    <div className="node-content">{node.content}</div>

                    <div className="action-icon">
                        <Button
                            type="link"
                            icon={<LinkOutlined/>}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        />
                        <Button
                            type="link"
                            icon={<CopyOutlined/>}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        />
                        <Button
                            type="link"
                            icon={<DeleteOutlined/>}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        />
                    </div>
                </div>

                {/* 递归渲染子节点 */}
                {node.childNode && node.childNode.length > 0 && !node.collapse && (
                    <div className={`sub-step-node ${node.isSelected ? 'active' : ''}`}>
                        <div className="case-step-box">
                            {node.childNode.map((child, childIndex) => (
                                <TreeNode
                                    key={`${node.id}-child-${child.id}`}
                                    node={child}
                                    index={childIndex}
                                    parentPath={nodePath}
                                    depth={depth + 1}
                                    onMouseAction={onMouseAction}
                                    onSelect={onSelect}
                                    onDragStart={onDragStart}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                    onDragEnd={onDragEnd}
                                    onCollapse={onCollapse}
                                    dragOverInfo={dragOverInfo}
                                />
                            ))}
                            <div className="add-step">
                                <div style={{ width: 20, height: 36 }}></div>
                                <Dropdown menu={{items: DropItem}} placement="top" trigger={['click']}>
                                    <Button type="dashed">添加步骤</Button>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {dragOverInfo?.id === node.id && (
                <div className={`drop-indicator ${dragOverInfo.position}`}/>
            )}
        </div>
    );
};

export default TreeNode;
