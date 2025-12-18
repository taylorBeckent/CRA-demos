import {lazy} from "react";

const Home = lazy(() => import('../pages/Home'));
const DragDiv = lazy(() => import('../pages/DragDiv'));
const DragMock = lazy(() => import('../pages/DragMock'));
const DragInsert = lazy(() => import('../pages/DragInsert'));
const MainLayout = lazy(() => import('../layouts/MainLayout'));

// const routes = [
//     {
//         path: '/',
//         element: <MainLayout/>,
//         children: [
//             {
//                 path: '',
//                 element: <Home/>,
//                 exact: true
//             }
//         ]
//     }
// ]

const routes = [
    {
        path: '/',
        element: <Home/>,
        exact: true,
    },
    {
        path: '/DragDiv',
        element: <DragDiv/>,
        exact: true,
    },
    {
        path: '/DragMock',
        element: <DragMock/>,
        exact: true,
    },
    {
        path: '/DragInsert',
        element: <DragInsert/>,
        exact: true,
    },
]

export default routes;
