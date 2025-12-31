import React from 'react';
import './index.css';
import HeaderBar from './headerBar';
import TreeTemplate from "../TreeTemplate";
import TitleContent from "./titleContent";


const TestCase = () => {
    return (
        <div className="wrapper">
            <div className="header-bar">
                <HeaderBar/>
            </div>

            <div className="content">
                <div className="top-side">
                    <TitleContent/>
                </div>
                <div className="body-side">
                    <div className="left-side">
                        <TreeTemplate
                            initialItems={initialItems}
                        />
                    </div>
                    <div className="right-side"></div>
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

export default TestCase;
