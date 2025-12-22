import {lazy} from "react";

const Home = lazy(() => import('../pages/Home'));
const DragDiv = lazy(() => import('../pages/DragDiv'));
const DragMock = lazy(() => import('../pages/DragMock'));
const DragMockInsert = lazy(() => import('../pages/DragMockInsert'));
const DragInsert = lazy(() => import('../pages/DragInsert'));
const DragIcon = lazy(() => import('../pages/DragIcon'));
const DragSort = lazy(() => import('../pages/DragSortComponent'));
const DragTemplate = lazy(() => import('../pages/DragTemplate'));
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
        path: '/DragMockInsert',
        element: <DragMockInsert/>,
        exact: true,
    },
    {
        path: '/DragInsert',
        element: <DragInsert/>,
        exact: true,
    },
    {
        path: '/DragIcon',
        element: <DragIcon/>,
        exact: true,
    },
    {
        path: '/DragSort',
        element: <DragSort/>,
        exact: true,
    },
    {
        path: '/DragTemplate',
        element: <DragTemplate/>,
        exact: true,
    },
]

export default routes;
