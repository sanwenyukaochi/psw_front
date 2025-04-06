import AuthApi from "@/api/auth/authApi.js";
import JSEncrypt from 'jsencrypt';

// 判断是否使用刷新令牌
export const usingRefreshToken = false;

// 用户密码 RSA 加密
export function encryptPassword(password, publicKey) {
    const encryptStr = new JSEncrypt();
    encryptStr.setPublicKey(publicKey.toString()); // 设置加密公钥
    return encryptStr.encrypt(password); // 进行加密
}

// 用户登录
export async function userLogin(account, password) {
    try {
        let response = await AuthApi.getRsaPublicKey();
        const { data: rsaPk } = response;
        let encryptPwd = encryptPassword(password, rsaPk);
        const params = {
            username: account,
            password: encryptPwd
        };
        response = await AuthApi.getUserToken(params);
        
        // 检查响应状态
        if (response.code !== '0') {
            throw new Error(response.message || '登录失败');
        }

        const { data: accessToken } = response;
        if (!accessToken || accessToken === 'null') {
            throw new Error('登录失败：未获取到有效的访问令牌');
        }
        
        localStorage.setItem('Authorization', accessToken);
    } catch (error) {
        // 直接抛出错误，不在这里打印日志
        throw error;
    }
}

// 退出登录
export function logout() {
    localStorage.removeItem('token');
    location.reload(); // 刷新页面
}

// 判断用户是否登录
export function isUserLoggedIn() {
    let token = localStorage.getItem('token');
    return token && token !== 'null';
}
