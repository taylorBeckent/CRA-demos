import React, {useCallback} from 'react';
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
        dragOverInfo,
        onAddNode
    } = props;

    const DropItem = [
        { key: 1, label: (<div onClick={(e)=> {handleAddClick(e,1, depth)}}>完成项目需求分析</div>) },
        { key: 2, label: (<div onClick={(e)=> {handleAddClick(e,2, depth)}}>设计UI原型图</div>) },
        { key: 3, label: (<div onClick={(e)=> {handleAddClick(e,3, depth)}}>前端页面开发</div>) },
    ];

    const handleAddClick = (e, nodeType, depth) => {
        e.stopPropagation();
        e.preventDefault();
        onAddNode(nodeType, node?.id, depth);
    };

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

    // 局部事件处理函数
    const handleLocalDragStart = useCallback((e) => {
        e.stopPropagation();
        onDragStart(e, node.id, depth);
    }, [node.id, depth, onDragStart]);

    const handleLocalDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        onDragOver(e, node.id, depth);
    }, [node.id, depth, onDragOver]);

    const handleLocalDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop(e, node.id, depth);
    }, [node.id, depth, onDrop]);

    return (
        <div
            className="draggable-item"
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
            onDragOver={handleLocalDragOver}
            onDragLeave={onDragLeave}
            onDrop={handleLocalDrop}
            onDragEnd={onDragEnd}
            onMouseEnter={(e) => onMouseAction(e, node, 'mouseEnter')}
            onMouseLeave={(e) => onMouseAction(e, node, 'mouseLeave')}
        >
            <div
                title="拖拽排序"
                className="drag-handle"
                draggable="true"
                onDragStart={handleLocalDragStart}
            >
                <DragOutlined/>
            </div>

            <div className="step-node-preview">
                <div
                    className={`item-content ${node.isSelected ? 'active' : ''} ${node.haveChild && !node.collapse ? 'is-open' : ''}`}
                    onClick={handleSelectClick}
                    draggable="false"
                    onDragStart={(e) => e.preventDefault()}
                >
                    {node.childNode && node.haveChild ? (
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
                {node.childNode && node.haveChild && !node.collapse && (
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
                                    onAddNode={onAddNode}
                                    dragOverInfo={dragOverInfo}
                                />
                            ))}
                            <div className="add-step">
                                <div style={{ width: 20, height: 36 }}></div>
                                <Dropdown menu={{items: DropItem}} placement="top" trigger={['click']}>
                                    <Button type="dashed" >添加步骤</Button>
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
