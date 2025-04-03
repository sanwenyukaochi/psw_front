import { useRouter, useRoute } from 'vue-router';

export function useJumpToPath() {
    const router = useRouter();  // 获取路由实例
    const route = useRoute();  // 获取当前路由信息

    // 返回一个异步的跳转函数
    const jumpToPath = async (path) => {
        if (route.path !== path) {
            await router.push(path);  // 跳转到指定路径
        } else {
            location.reload();  // 如果当前路径已经是目标路径，则刷新页面
        }
    };

    return { jumpToPath };  // 返回 jumpToPath 方法
}





