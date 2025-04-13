import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "@/router";
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import * as Icon from "@ant-design/icons-vue";
import * as echarts from 'echarts';

const app = createApp(App);

app.use(router);
app.use(Antd);

// 注册 ECharts 为全局属性
app.config.globalProperties.$echarts = echarts;

app.mount('#app');

for (const i in Icon) {
    app.component(i, Icon[i]);
}