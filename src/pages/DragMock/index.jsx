import React, {useState, useRef, useEffect, useCallback} from 'react';
import './DragMock.css';

const DragMock = () => {

    const [ dataList, setDataList ] = useState([
        { id: 'item1', content: '可拖拽项目 1', color: '#FF6B6B' },
        { id: 'item2', content: '可拖拽项目 2', color: '#4ECDC4' },
        { id: 'item3', content: '可拖拽项目 3', color: '#FFD166' },
        { id: 'item4', content: '可拖拽项目 4', color: '#06D6A0' },
        { id: 'item5', content: '可拖拽项目 5', color: '#118AB2' },
    ]);

    const [ draggingItem, setDraggingItem ] = useState(null);
    const [ targetItem, setTargetItem ] = useState(null);
    const [ isDragging, setIsDragging ] = useState(false);
    const [ insertPosition, setInsertPosition ] = useState(false); // 插入位置

    const containerRef = useRef(null);
    const dragImageRef = useRef(null);

    useEffect(() => {

    }, []);

    const handleDragStart = useCallback((e, item) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id);

        setDraggingItem({ item });
        setIsDragging(true);

        console.log('e', e);
        console.log('item-start', item);
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    }, []);

    const handleDragOver = useCallback((e, item) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        console.log(draggingItem);
        console.log(item);

        if (draggingItem && draggingItem.item.id == item.id) {
            setTargetItem(null);
            setInsertPosition(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const height = rect.height;

        //. 计算插入位置： 上部30% -> before, 下部30% -> after, 中间40% -> inner
        let position;
        if (mouseY < height * 0.4) {
            position = 'before';
        } else if (mouseY > height * 0.4) {
            position = 'after';
        }

        console.log(item);
        setTargetItem({ item });
        setInsertPosition(position);

        // 移除其他元素的所有位置类
        document.querySelectorAll('.draggable-item').forEach(item => {
            item.classList.remove(
                'drag-over-before',
                'drag-over-after'
            )
        })

        e.currentTarget.classList.add(`drag-over-${position}`);

        // if (draggingItem && draggingItem.item.id != item.id) {
        //
        //     e.currentTarget.classList.add('drag-over');
        // }
    }, [ draggingItem ]);

    const handleDragLeave = useCallback(e => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove(
                'drag-over-before',
                'drag-over-after'
            );
            // console.log(targetItem);
            if (targetItem && e.currentTarget.dataset.id != targetItem.item.id) {
                setTargetItem(null);
                setInsertPosition(null);
            }
        }
        // e.currentTarget.classList.remove('drag-over');
    }, []);

    const handleDrop = useCallback((e, item) => {
        e.preventDefault();

        // if(!draggingItem || ){}

        //. 交换
        if (draggingItem && draggingItem.item.id != item.id) {
            const newItems = [ ...dataList ];
            const fromIndex = newItems.findIndex(i => i.id === draggingItem.item.id);
            const toIndex = newItems.findIndex(i => i.id === item.id);
            let newList = swapArrayData(newItems, fromIndex, toIndex);
            setDataList(newList);
        }

        // const dragData = J

        e.currentTarget.classList.remove('drag-over');
        setIsDragging(false);
    }, [ draggingItem, dataList ]);

    const handleDragEnd = useCallback(() => {
        // 移除所有拖拽样式
        document.querySelectorAll('.draggable-item').forEach(el => {
            el.classList.remove('dragging', 'drag-over');
        });

        setDraggingItem(null);
    }, [])

    const swapArrayData = (array, fromIndex, toIndex) => {
        let newList = JSON.parse(JSON.stringify(array));
        let templateData = newList[fromIndex];
        newList[fromIndex] = newList[toIndex];
        newList[toIndex] = templateData;
        return newList;
    };

    return (
        <div className="drag-mock">
            <div className="items-container">
                {dataList.map((item, index) => (
                    <div
                        key={`drag-api-${item.id}`}
                        className="draggable-item drag-api-draggable"
                        draggable={true}
                        style={{ backgroundColor: item.color }}
                        onDragStart={(e) => {
                            handleDragStart(e, item)
                        }}
                        onDragOver={(e) => {
                            handleDragOver(e, item)
                        }}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, item)}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="item-content">
                            <span className="item-index">{index + 1}</span>
                            <span className="item-text">{item.content}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DragMock;
