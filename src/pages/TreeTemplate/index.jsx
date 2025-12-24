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
import {Button} from "antd";
import TreeNode from "./TreeNode";

const TreeTemplate = () => {
    const [ dataList, setDataList ] = useState([]);
    const [ dragOverInfo, setDragOverInfo ] = useState(null);
    const dragItemRef = useRef(null);
    const dragDataRef = useRef(null);

    // 用于防抖的引用
    const isProcessingRef = useRef(false);
    const pendingUpdateRef = useRef(null);

    useEffect(() => {
        setDataList(initialItems);
    }, []);

    // 更新所有节点（包括嵌套的子节点）
    const updateAllNodes = useCallback((nodes, callback) => {
        // console.log(nodes,callback);
        return nodes.map(node => {
            const updatedNode = callback(node);
            if (updatedNode.childNode && updatedNode.childNode.length > 0) {
                updatedNode.childNode = updateAllNodes(updatedNode.childNode, callback);
            }
            return updatedNode;
        });
    }, []);

    //. 鼠标事件
    const handleMouseAction = useCallback((e, item, action) => {
        setDataList(prev =>
            updateAllNodes(prev, node => {
                if (node.id === item.id) {
                    return {
                        ...node,
                        isHovered: action === 'mouseEnter'
                    };
                }
                return node;
            })
        );
    }, [updateAllNodes]);

    //. 选中节点
    const handleSelected = useCallback((e, item) => {
        console.log(item);
        setDataList(prev =>
            updateAllNodes(prev, node => ({
                ...node,
                isSelected: node.id === item.id
            }))
        );
    }, [updateAllNodes]);

    //. 展开/折叠 - 使用防抖避免重复执行
    const handleCollapse = useCallback((itemId) => {
        // 如果正在处理中，忽略此次调用
        if (isProcessingRef.current) {
            // console.log('忽略重复调用:', itemId);
            return;
        }

        // console.log('handleCollapse called for:', itemId);
        isProcessingRef.current = true;

        setDataList(prev => {
            const newList = updateAllNodes(prev, node => {
                if (node.id === itemId) {
                    console.log(`Toggling collapse for ${node.id}: ${node.collapse} -> ${!node.collapse}`);
                    return {
                        ...node,
                        collapse: !node.collapse
                    };
                }
                return node;
            });
            // console.log('New state:', newList);
            return newList;
        });

        // 100ms后重置处理状态
        setTimeout(() => {
            isProcessingRef.current = false;
        }, 100);
    }, [updateAllNodes]);

    // 或者使用更简单的版本，移除依赖
    const handleCollapseSimple = useCallback((itemId) => {
        // console.log('handleCollapseSimple called for:', itemId);

        setDataList(prev => {
            const updateNode = (nodes) => {
                return nodes.map(node => {
                    if (node.id === itemId) {
                        // console.log(`Toggling collapse for ${node.id}: ${node.collapse} -> ${!node.collapse}`);
                        const updatedNode = {
                            ...node,
                            collapse: !node.collapse
                        };
                        if (node.childNode && node.childNode.length > 0) {
                            updatedNode.childNode = updateNode(node.childNode);
                        }
                        return updatedNode;
                    }
                    // 检查子节点
                    if (node.childNode && node.childNode.length > 0) {
                        const updatedChildNode = updateNode(node.childNode);
                        if (updatedChildNode !== node.childNode) {
                            return {
                                ...node,
                                childNode: updatedChildNode
                            };
                        }
                    }
                    return node;
                });
            };

            const newList = updateNode(prev);
            return newList;
        });
    }, []);

    // 查找节点和父节点
    const findNodeAndParent = (nodes, id, parent = null, depth = 0) => {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.id === id) {
                return { node, index: i, parent, depth };
            }
            if (node.childNode && node.childNode.length > 0) {
                const result = findNodeAndParent(node.childNode, id, node, depth + 1);
                if (result) return result;
            }
        }
        return null;
    };

    //. 拖动起始
    const handleDragStart = useCallback((e, itemId, depth) => {
        e.stopPropagation();
        const draggableItem = e.currentTarget.closest('.draggable-item');
        if (!draggableItem) return;

        dragItemRef.current = draggableItem;
        dragDataRef.current = { itemId, depth };

        e.dataTransfer.setData('text/plain', itemId);
        e.dataTransfer.effectAllowed = 'move';

        const dragImage = draggableItem.cloneNode(true);
        dragImage.style.width = `${draggableItem.offsetWidth}px`;
        dragImage.style.opacity = '0.7';
        dragImage.style.position = 'absolute';
        dragImage.style.left = '-1000px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 20, 20);

        draggableItem.classList.add('dragging');

        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }, []);

    //. 放置目标处理
    const handleDragOver = useCallback((e, itemId, depth) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (dragOverInfo?.id === itemId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const position = mouseY < rect.height / 2 ? 'before' : 'after';

        setDragOverInfo({ id: itemId, position, depth });
    }, [dragOverInfo]);

    const handleDragLeave = useCallback(e => {
        const relatedTarget = e.relatedTarget;
        if (!e.currentTarget.contains(relatedTarget)) {
            setDragOverInfo(null);
        }
    }, []);

    // 删除节点
    const removeNode = (nodes, id) => {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === id) {
                return nodes.splice(i, 1)[0];
            }
            if (nodes[i].childNode && nodes[i].childNode.length > 0) {
                const removed = removeNode(nodes[i].childNode, id);
                if (removed) return removed;
            }
        }
        return null;
    };

    // 插入节点
    const insertNode = (nodes, node, targetId, position, depth) => {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === targetId) {
                let insertIndex = i;
                if (position === 'after') {
                    insertIndex = i + 1;
                }
                nodes.splice(insertIndex, 0, node);
                return true;
            }
            if (nodes[i].childNode && nodes[i].childNode.length > 0) {
                const inserted = insertNode(nodes[i].childNode, node, targetId, position, depth - 1);
                if (inserted) return true;
            }
        }
        return false;
    };

    const handleDrop = useCallback((e, targetId, depth) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        console.log(draggedId, targetId, dragOverInfo)
        if (!draggedId || draggedId === targetId || !dragOverInfo) {
            setDragOverInfo(null);
            dragItemRef.current?.classList.remove('dragging');
            dragItemRef.current = null;
            return;
        }

        setDataList(prev => {
            const itemsCopy = JSON.parse(JSON.stringify(prev));

            // 移除被拖动的节点
            const draggedNode = removeNode(itemsCopy, draggedId);
            if (!draggedNode) return prev;

            // 插入到目标位置
            const inserted = insertNode(
                itemsCopy,
                draggedNode,
                targetId,
                dragOverInfo.position,
                depth
            );

            if (!inserted) {
                // 如果插入失败，回退到原始位置
                const { node: targetNode, parent, index } = findNodeAndParent(itemsCopy, targetId);
                if (parent) {
                    parent.childNode.splice(index, 0, draggedNode);
                } else {
                    itemsCopy.splice(index, 0, draggedNode);
                }
            }
            console.log(itemsCopy);
            return itemsCopy;
        });

        setDragOverInfo(null);
        dragItemRef.current?.classList.remove('dragging');
        dragItemRef.current = null;
    }, [dragOverInfo]);

    // 拖动结束
    const handleDragEnd = useCallback(() => {
        console.log('dragEnd')
        setDragOverInfo(null);
        dragItemRef.current?.classList.remove('dragging');
        dragItemRef.current = null;
    }, []);

    // 添加一个重置函数用于测试
    const resetToInitial = useCallback(() => {
        // console.log('Resetting to initial state');
        setDataList(JSON.parse(JSON.stringify(initialItems)));
    }, []);

    return (
        <div>
            {/*<div style={{ marginBottom: 20, padding: '10px 0' }}>*/}
            {/*    <Button onClick={resetToInitial} type="primary" size="small">*/}
            {/*        重置数据*/}
            {/*    </Button>*/}
            {/*    <div style={{ fontSize: 12, color: '#666', marginTop: 5 }}>*/}
            {/*        当前数据长度: {dataList.length} | 拖拽指示器: {dragOverInfo ? '显示' : '隐藏'}*/}
            {/*    </div>*/}
            {/*</div>*/}

            <div className="container">
                {dataList.map((item, index) => (
                    <TreeNode
                        key={`tree-node-${item.id}-${index}`}
                        node={item}
                        index={index}
                        depth={0}
                        onMouseAction={handleMouseAction}
                        onSelect={handleSelected}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        onCollapse={handleCollapseSimple}  // 使用简单版本
                        dragOverInfo={dragOverInfo}
                    />
                ))}
            </div>
        </div>
    );
};

// 初始数据 - 修正：初始 collapse 为 true，id 确保唯一
const initialItems = [
    {
        id: 'item-1',
        content: '完成项目需求分析',
        color: '#FF6B6B',
        depth: 0,
        isHovered: false,
        isSelected: false,
        draggable: false,
        collapse: true, // 初始为折叠状态
        childNode: [
            {
                id: 'item-1-1',
                content: '子节点1',
                color: '#FF6B6B',
                depth: 1,
                isHovered: false,
                isSelected: false,
                draggable: false,
                collapse: true, // 初始为折叠状态
                childNode: [
                    {
                        id: 'item-1-1-1',
                        content: '孙子节点1',
                        color: '#FFD166',
                        depth: 2,
                        isHovered: false,
                        isSelected: false,
                        draggable: false,
                        collapse: true
                    },
                    {
                        id: 'item-1-1-2',
                        content: '孙子节点2',
                        color: '#06D6A0',
                        depth: 2,
                        isHovered: false,
                        isSelected: false,
                        draggable: false,
                        collapse: true
                    }
                ]
            },
            {
                id: 'item-1-2',
                content: '子节点2',
                color: '#4ECDC4',
                depth: 1,
                isHovered: false,
                isSelected: false,
                draggable: false,
                collapse: true, // 初始为折叠状态
                childNode: [
                    {
                        id: 'item-1-2-1',
                        content: '孙子节点3',
                        color: '#FFD166',
                        depth: 2,
                        isHovered: false,
                        isSelected: false,
                        draggable: false,
                        collapse: true
                    },
                    {
                        id: 'item-1-2-2',
                        content: '孙子节点4',
                        color: '#06D6A0',
                        depth: 2,
                        isHovered: false,
                        isSelected: false,
                        draggable: false,
                        collapse: true
                    }
                ]
            },
        ]
    },
    {
        id: 'item-2',
        content: '设计UI原型图',
        color: '#4ECDC4',
        depth: 0,
        isHovered: false,
        isSelected: false,
        draggable: false,
        collapse: true,
        childNode: []
    },
    {
        id: 'item-3',
        content: '前端页面开发',
        color: '#FFD166',
        depth: 0,
        isHovered: false,
        isSelected: false,
        draggable: false,
        collapse: true,
        childNode: [
            {
                id: 'item-3-1',
                content: 'React组件开发',
                color: '#FFD166',
                depth: 1,
                isHovered: false,
                isSelected: false,
                draggable: false,
                collapse: true,
                childNode: []
            }
        ]
    },
    {
        id: 'item-4',
        content: '后端API联调',
        color: '#06D6A0',
        depth: 0,
        isHovered: false,
        isSelected: false,
        draggable: false,
        collapse: true,
        childNode: []
    },
    {
        id: 'item-5',
        content: '测试与发布上线',
        color: '#118AB2',
        depth: 0,
        isHovered: false,
        isSelected: false,
        draggable: false,
        collapse: true,
        childNode: []
    },
];


export default TreeTemplate;
