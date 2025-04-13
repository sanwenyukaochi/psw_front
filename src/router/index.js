import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'

//定义路由关系
const routes = [
    {path: '/', redirect: '/userLogin'},
    {path: '/userLogin',component: () => import('@/views/user/UserLogin.vue'),},
    {path: '/userRegister',component: () => import('@/views/user/UserRegister.vue'),},
    {path: '/userHome',component: () => import('@/views/user/layout/UserHome.vue'),
        children: [
            {path: '/main',component: () => import('@/views/user/views/Home.vue'),},
            {path: '/pet',component: () => import('@/views/user/views/Pet.vue'),},
            {path: '/pet/:id',component: () => import('@/views/user/views/PetInfo.vue'),},
            {path: '/good',component: () => import('@/views/user/views/Good.vue'),},
            {path: '/forum',component: () => import('@/views/user/views/Forum.vue'),},
            {path: '/notice',component: () => import('@/views/user/views/Notice.vue'),},
            {path: '/user',component: () => import('@/views/user/views/User.vue'),},
            {path: '/petOrder',component: () => import('@/views/user/views/PetOrder.vue'),},
            {path: '/chat',component: () => import('@/views/Chat.vue'),},
        ]
    },
    {path: '/adminLogin',component: () => import('@/views/admin/AdminLogin.vue'),},
    {path: '/adminHome',component: () => import('@/views/admin/layout/AdminHome.vue'),
        children: [
            {path: '/userList',component: () => import('@/views/admin/views/UserList.vue'),},
            {path: '/typeList',component: () => import('@/views/admin/views/TypeList.vue'),},
            {path: '/petList',component: () => import('@/views/admin/views/PetList.vue'),},
            {path: '/goodList',component: () => import('@/views/admin/views/GoodList.vue'),},
            {path: '/goodOrderList',component: () => import('@/views/admin/views/GoodOrderList.vue'),},
            {path: '/noticeList',component: () => import('@/views/admin/views/NoticeList.vue'),},
            {path: '/forumList',component: () => import('@/views/admin/views/ForumList.vue'),},
            {path: '/petOrderList',component: () => import('@/views/admin/views/PetOrderList.vue'),},
            {path: '/mainList',component: () => import('@/views/admin/views/MainList.vue'),},
            {path: '/chat',component: () => import('@/views/Chat.vue'),},
        ]
    },
]

//创建路由器
const router = createRouter({
    // history: createWebHistory(),
    history: createWebHashHistory(), // 这里使用 Hash 模式
    routes: routes
})

//导出路由
export default router