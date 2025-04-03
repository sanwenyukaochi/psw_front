import axios from 'axios';
const baseURL = '/api'
const httpRequest = axios.create({
    // 请求的后端接口的基础路径
    // baseURL:'http://localhost:8088',
    baseURL:baseURL,
    // 接口超时响应时间
    timeout:10000
});


//请求拦截器
httpRequest.interceptors.request.use(function (config){

    const jwt = localStorage.getItem('Authorization');
    if(jwt && jwt !== ''){
        config.headers['Authorization'] = "Bearer " + jwt;
    }
    return config;

});

//响应拦截器
httpRequest.interceptors.response.use(function (response){
    const data = response.data;
    if(data){
        if(data.code === '500'){
            // window.alert(data.message);
            throw new Error(data.message);
        }
        console.log("代码:" + data.code + " 信息:" + data.message);
        console.log(data.data);
    }
    return data;
})

export default httpRequest