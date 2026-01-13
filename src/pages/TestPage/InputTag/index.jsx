import React, { useState, useRef, useEffect } from 'react';
import { Input, Tag, Button, Modal, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const TagInput = () => {
    const [tags, setTags] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);

    // 新增：编辑状态
    const [editingTag, setEditingTag] = useState({
        index: null,
        value: ''
    });
    const editInputRef = useRef(null);

    // 手动输入标签
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputConfirm = () => {
        if (inputValue && !tags.includes(inputValue)) {
            setTags([...tags, inputValue]);
            setInputValue('');
        }
    };

    // 删除标签
    const handleClose = (removedTag, index) => {
        // const newTags = tags.filter(tag => tag !== removedTag);
        // setTags(newTags);
        setTags(prev => {
            const newList = prev.filter((_, itemIndex) => itemIndex !== index);
            return newList;
        });

        // 如果正在编辑的被删除，清除编辑状态
        if (editingTag.index === index) {
            setEditingTag({ index: null, value: '' });
        }
    };

    // 新增：开始编辑标签
    const startEditing = (tag, index) => {
        setEditingTag({
            index,
            value: tag
        });
        // 清空输入框
        setInputValue('');
    };

    // 新增：处理编辑输入变化
    const handleEditChange = (e) => {
        setEditingTag(prev => ({
            ...prev,
            value: e.target.value
        }));
    };

    // 新增：完成编辑
    const handleEditConfirm = (index) => {
        if (!editingTag.value.trim()) {
            // 如果编辑后为空，删除标签
            const newTags = [...tags];
            newTags.splice(index, 1);
            setTags(newTags);
        } else if (!tags.includes(editingTag.value) || editingTag.value === tags[index]) {
            // 新值不重复或是原来的值，直接更新
            const newTags = [...tags];
            newTags[index] = editingTag.value;
            setTags(newTags);
        }
        // 结束编辑
        setEditingTag({ index: null, value: '' });
    };

    // 新增：处理编辑时按回车
    const handleEditKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            handleEditConfirm(index);
        } else if (e.key === 'Escape') {
            // ESC键取消编辑
            setEditingTag({ index: null, value: '' });
        }
    };

    // 新增：处理输入框失焦
    const handleEditBlur = (index) => {
        handleEditConfirm(index);
    };

    // 新增：自动聚焦到编辑输入框
    useEffect(() => {
        if (editingTag.index !== null && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingTag.index]);

    // 弹窗选择标签
    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        // const newTags = [...tags, ...selectedTags].filter(
        //     (tag, index, array) => array.indexOf(tag) === index
        // );
        const newTags = [...tags, ...selectedTags];
        setTags(newTags);
        setSelectedTags([]);
        setIsModalVisible(false);
    };

    const handleModalCancel = () => {
        setSelectedTags([]);
        setIsModalVisible(false);
    };

    const handleSelectChange = (value) => {
        setSelectedTags(value);
    };

    // 弹窗中可选的标签
    const tagOptions = [
        { value: '标签1', label: '标签1' },
        { value: '标签2', label: '标签2' },
        { value: '标签3', label: '标签3' },
        { value: '标签4', label: '标签4' },
        { value: '标签5', label: '标签5' },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <div
                    style={{
                        border: '1px solid #d9d9d9',
                        borderRadius: 6,
                        padding: '4px 8px',
                        minHeight: 32,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                    }}
                >
                    {/* 已选择的标签 */}
                    {tags.map((tag, index) => (
                        <div key={`${tag}-${index}`} style={{ margin: '2px 4px', display: 'inline-block' }}>
                            {editingTag.index === index ? (
                                <Input
                                    ref={editInputRef}
                                    value={editingTag.value}
                                    onChange={handleEditChange}
                                    onKeyDown={(e) => handleEditKeyDown(e, index)}
                                    onBlur={() => handleEditBlur(index)}
                                    size="small"
                                    style={{
                                        width: 80,
                                        height: 24,
                                    }}
                                />
                            ) : (
                                <Tag
                                    closable
                                    onClose={() => handleClose(tag, index)}
                                    onClick={() => startEditing(tag, index)}
                                    style={{
                                        margin: 0,
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                    }}
                                >
                                    {tag}
                                </Tag>
                            )}
                        </div>
                    ))}

                    {/* 新增标签的输入框 */}
                    <Input
                        value={inputValue}
                        onChange={handleInputChange}
                        onPressEnter={handleInputConfirm}
                        onBlur={handleInputConfirm}
                        bordered={false}
                        placeholder={tags.length === 0 ? '请输入标签，回车确认' : ''}
                        style={{
                            flex: 1,
                            minWidth: 60,
                        }}
                        suffix={
                            <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={showModal}
                                size="small"
                            />
                        }
                    />
                </div>
            </div>

            <Modal
                title="选择标签"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Select
                    mode="multiple"
                    placeholder="请选择标签"
                    value={selectedTags}
                    onChange={handleSelectChange}
                    style={{ width: '100%' }}
                    options={tagOptions}
                />
            </Modal>
        </div>
    );
};

export default TagInput;
