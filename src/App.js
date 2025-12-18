import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Suspense } from 'react';
import routes from './routes';
import './App.css';

function App() {
  return (
      <Router>
        <div className="App">
          {/* 导航栏 */}
          {/*<nav>*/}
          {/*  <ul>*/}
          {/*    <li><Link to="/">首页</Link></li>*/}
          {/*    <li><Link to="/about">关于</Link></li>*/}
          {/*    <li><Link to="/contact">联系</Link></li>*/}
          {/*    <li><Link to="/user/123">用户123</Link></li>*/}
          {/*  </ul>*/}
          {/*</nav>*/}

          {/* 路由内容 */}
          <Suspense fallback={<div>加载中...</div>}>
            <Routes>
              {routes.map((route, index) => (
                  <Route
                      key={index}
                      path={route.path}
                      element={route.element}
                      exact={route.exact}
                  />
              ))}
            </Routes>
          </Suspense>
        </div>
      </Router>
  );
}

export default App;
