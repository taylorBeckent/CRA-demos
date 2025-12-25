import React, {useState, useEffect, useCallback, useRef} from 'react';
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
import TreeNode from "./TreeNode";

const TreeTemplate = () => {
    const [ dataList, setDataList ] = useState([]);
    const [ dragOverInfo, setDragOverInfo ] = useState(null);
    const dragItemRef = useRef(null);
    const dragDataRef = useRef(null);

    useEffect(() => {
        setDataList(initialItems);
    }, []);

    const DropItem = [
        { key: 1, label: (<div onClick={()=> {handleAddNode(1, null, 0)}}>完成项目需求分析</div>) },
        { key: 2, label: (<div onClick={()=> {handleAddNode(2, null, 0)}}>设计UI原型图</div>) },
        { key: 3, label: (<div onClick={()=> {handleAddNode(3, null, 0)}}>前端页面开发</div>) },
    ];

    const nodeTypeMap = {
        1: '完成项目需求分析',
        2: '设计UI原型图',
        3: '前端页面开发'
    }

    // 更新所有节点（包括嵌套的子节点）
    const updateAllNodes = useCallback((nodes, callback) => {
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
    }, [ updateAllNodes ]);

    //. 选中节点
    const handleSelected = useCallback((e, item) => {
        setDataList(prev =>
            updateAllNodes(prev, node => ({
                ...node,
                isSelected: node.id === item.id
            }))
        );
    }, [ updateAllNodes ]);

    //. 展开/折叠
    const handleCollapseSimple = useCallback((itemId) => {
        setDataList(prev => {
            const updateNode = (nodes) => {
                return nodes.map(node => {
                    if (node.id === itemId) {
                        const updatedNode = {
                            ...node,
                            collapse: !node.collapse
                        };
                        if (node.childNode && node.childNode.length > 0) {
                            updatedNode.childNode = updateNode(node.childNode);
                        }
                        return updatedNode;
                    }
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

    //. 拖动起始 - 记录父节点信息
    const handleDragStart = useCallback((e, itemId, depth) => {
        e.stopPropagation();
        const draggableItem = e.currentTarget.closest('.draggable-item');
        if (!draggableItem) return;

        // 查找拖动节点的父节点信息
        const draggedInfo = findNodeAndParent(dataList, itemId);
        const parentId = draggedInfo?.parent ? draggedInfo.parent.id : null;

        dragItemRef.current = draggableItem;
        dragDataRef.current = {
            itemId,
            depth,
            parentId // 记录父节点ID
        };

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
    }, [dataList]);

    //. 放置目标处理 - 检查是否在同一父节点下
    const handleDragOver = useCallback((e, itemId, depth) => {
        e.preventDefault();

        // 检查是否有拖动数据
        if (!dragDataRef.current) {
            e.dataTransfer.dropEffect = 'none';
            return;
        }

        const { itemId: draggedId, depth: draggedDepth, parentId: draggedParentId } = dragDataRef.current;

        // 如果是同一个节点，不允许拖放
        if (draggedId === itemId) {
            e.dataTransfer.dropEffect = 'none';
            setDragOverInfo(null);
            return;
        }

        // 查找目标节点的父节点信息
        const targetInfo = findNodeAndParent(dataList, itemId);
        const targetParentId = targetInfo?.parent ? targetInfo.parent.id : null;

        // 检查是否允许拖放：深度相同且父节点相同
        let canDrop = false;

        // 情况1: 都是根节点（parentId 都为 null）
        if (draggedDepth === 0 && depth === 0 && draggedParentId === null && targetParentId === null) {
            canDrop = true;
        }
        // 情况2: 都是子节点且父节点相同
        else if (draggedDepth > 0 && depth > 0 && draggedParentId === targetParentId) {
            canDrop = true;
        }

        if (!canDrop) {
            e.dataTransfer.dropEffect = 'none';
            setDragOverInfo(null);
            return;
        }

        e.dataTransfer.dropEffect = 'move';

        // 如果 dragOverInfo 已经设置且相同，直接返回
        if (dragOverInfo?.id === itemId && dragOverInfo?.position) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const position = mouseY < rect.height / 2 ? 'before' : 'after';

        setDragOverInfo({ id: itemId, position, depth });
    }, [dragOverInfo, dataList]);

    const handleDragLeave = useCallback(e => {
        const relatedTarget = e.relatedTarget;
        if (!e.currentTarget.contains(relatedTarget)) {
            setDragOverInfo(null);
        }
    }, []);

    // 清理拖动状态
    const cleanUpDrag = useCallback(() => {
        setDragOverInfo(null);
        if (dragItemRef.current) {
            dragItemRef.current.classList.remove('dragging');
        }
        dragItemRef.current = null;
        dragDataRef.current = null;
    }, []);

    // 从数组中删除指定节点
    const removeNodeFromArray = (nodes, id) => {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === id) {
                return nodes.splice(i, 1)[0];
            }
            if (nodes[i].childNode && nodes[i].childNode.length > 0) {
                const removed = removeNodeFromArray(nodes[i].childNode, id);
                if (removed) return removed;
            }
        }
        return null;
    };

    //. 放置处理 - 确保在同一父节点下拖动
    const handleDrop = useCallback((e, targetId, depth) => {
        e.preventDefault();
        e.stopPropagation();

        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId || draggedId === targetId || !dragOverInfo || !dragDataRef.current) {
            cleanUpDrag();
            return;
        }

        const { depth: draggedDepth, parentId: draggedParentId } = dragDataRef.current;

        // 检查是否允许拖放
        let canDrop = false;

        // 情况1: 都是根节点
        if (draggedDepth === 0 && depth === 0 && draggedParentId === null) {
            canDrop = true;
        }
        // 情况2: 都是子节点且父节点相同
        else if (draggedDepth > 0 && depth > 0 && draggedParentId) {
            const targetInfo = findNodeAndParent(dataList, targetId);
            const targetParentId = targetInfo?.parent ? targetInfo.parent.id : null;
            canDrop = draggedParentId === targetParentId;
        }

        if (!canDrop) {
            console.log('不允许跨父节点拖动');
            cleanUpDrag();
            return;
        }

        setDataList(prev => {
            const itemsCopy = JSON.parse(JSON.stringify(prev));

            // 查找拖动节点和目标节点信息（在副本中查找）
            const draggedInfo = findNodeAndParent(itemsCopy, draggedId);
            const targetInfo = findNodeAndParent(itemsCopy, targetId);

            if (!draggedInfo || !targetInfo) {
                console.log('未找到节点信息');
                return prev;
            }

            // 确定父节点数组
            let parentArray;
            if (draggedDepth === 0) {
                // 根节点，父数组就是根数组
                parentArray = itemsCopy;
            } else {
                // 子节点，找到父节点
                const parentNode = findNodeAndParent(itemsCopy, draggedParentId)?.node;
                if (!parentNode) {
                    console.log('未找到父节点');
                    return itemsCopy;
                }
                parentArray = parentNode.childNode;
            }

            // 从父数组中移除拖动节点
            const removedNode = removeNodeFromArray(parentArray, draggedId);
            if (!removedNode) {
                console.log('移除节点失败');
                return itemsCopy;
            }

            // 获取目标节点在父数组中的索引
            let targetIndex = -1;
            for (let i = 0; i < parentArray.length; i++) {
                if (parentArray[i].id === targetId) {
                    targetIndex = i;
                    break;
                }
            }

            if (targetIndex === -1) {
                console.log('未找到目标节点在父数组中的位置');
                // 回退：将移除的节点放回原位置
                if (draggedInfo.index !== undefined) {
                    parentArray.splice(draggedInfo.index, 0, removedNode);
                }
                return itemsCopy;
            }

            // 计算插入位置
            let insertIndex;

            // 如果拖动节点在目标节点之前，并且要拖动到目标节点之后
            if (draggedInfo.index < targetIndex && dragOverInfo.position === 'after') {
                insertIndex = targetIndex; // 因为已经移除了拖动节点，所以目标索引不变
            }
            // 如果拖动节点在目标节点之后，并且要拖动到目标节点之前
            else if (draggedInfo.index > targetIndex && dragOverInfo.position === 'before') {
                insertIndex = targetIndex;
            }
            // 如果拖动到目标节点之前
            else if (dragOverInfo.position === 'before') {
                insertIndex = targetIndex;
            }
            // 如果拖动到目标节点之后
            else {
                insertIndex = targetIndex + 1;
            }

            // 确保 insertIndex 在有效范围内
            insertIndex = Math.max(0, Math.min(insertIndex, parentArray.length));

            // 插入节点
            parentArray.splice(insertIndex, 0, removedNode);

            return itemsCopy;
        });

        cleanUpDrag();
    }, [dragOverInfo, dataList, cleanUpDrag]);

    // 拖动结束
    const handleDragEnd = useCallback(() => {
        cleanUpDrag();
    }, [cleanUpDrag]);

    const generateId = useCallback(() => {
        return `item-${Date.now()}-${Math.random().toString(36).substr(2,9)}`
    }, []);

    const handleAddNode = useCallback((nodeType ,parentId, depth) => {
        const newNode = {
            id: generateId(),
            content: nodeTypeMap[nodeType],
            color: '#4ECDC4',
            depth: 0,
            isHovered: false,
            isSelected: false,
            draggable: false,
            collapse: true,
            haveChild: nodeType === 1,
            childNode: []
        };

        //. 如果没有parentId,说明添加的是根节点
        if(!parentId){
            setDataList(prev => [...prev, newNode]);
            return;
        }

        //. 有parentId,找到父节点并添加子节点
        const addChildToParent = (nodes) => {
            return nodes.map(node => {
                if(node.id === parentId){
                    // 如果父节点没有子节点数组，先初始化
                    const childNode = node.childNode || [];
                    return {
                        ...node,
                        collapse: false, //. 添加子节点后自动展开父节点
                        childNode: [...childNode, newNode]
                    }
                }

                if(node.childNode && node.childNode.length > 0){
                    return {
                        ...node,
                        childNode: addChildToParent(node.childNode)
                    }
                }

                return node;
            })
        }

        setDataList(prev => addChildToParent(prev));
    }, [generateId]);

    return (
        <div>
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
                        onCollapse={handleCollapseSimple}
                        onAddNode={handleAddNode}
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
    );
};

// 初始数据
const initialItems = [
    {
        id: 'item-1',
        content: '完成项目需求分析',
        color: '#FF6B6B',
        depth: 0,
        isHovered: false,
        isSelected: false,
        draggable: false,
        collapse: true,
        haveChild: true,
        childNode: [
            {
                id: 'item-1-1',
                content: '子节点1',
                color: '#FF6B6B',
                depth: 1,
                isHovered: false,
                isSelected: false,
                draggable: false,
                collapse: true,
                haveChild: true,
                childNode: [
                    {
                        id: 'item-1-1-1',
                        content: '孙子节点1',
                        color: '#FFD166',
                        depth: 2,
                        isHovered: false,
                        isSelected: false,
                        draggable: false,
                        collapse: true,
                        haveChild: false,
                    },
                    {
                        id: 'item-1-1-2',
                        content: '孙子节点2',
                        color: '#06D6A0',
                        depth: 2,
                        isHovered: false,
                        isSelected: false,
                        draggable: false,
                        collapse: true,
                        haveChild: false,
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
                collapse: true,
                haveChild: true,
                childNode: [
                    {
                        id: 'item-1-2-1',
                        content: '孙子节点3',
                        color: '#FFD166',
                        depth: 2,
                        isHovered: false,
                        isSelected: false,
                        draggable: false,
                        collapse: true,
                        haveChild: false,
                    },
                    {
                        id: 'item-1-2-2',
                        content: '孙子节点4',
                        color: '#06D6A0',
                        depth: 2,
                        isHovered: false,
                        isSelected: false,
                        draggable: false,
                        collapse: true,
                        haveChild: false,
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
        haveChild: false,
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
        haveChild: true,
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
        haveChild: false,
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
        haveChild: true,
        childNode: []
    },
];

export default TreeTemplate;
