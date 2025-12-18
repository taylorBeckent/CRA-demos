import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function MainLayout() {
    return (
        <div className="main-layout">
            <header>
                <h1>我的应用</h1>
                <nav>
                    <Link to="/">首页</Link> |
                    <Link to="/dashboard">仪表板</Link>
                </nav>
            </header>

            <main>
                <Outlet /> {/* 子路由将在这里渲染 */}
            </main>

            <footer>
                <p>&copy; 2023 我的应用</p>
            </footer>
        </div>
    );
}

export default MainLayout;
