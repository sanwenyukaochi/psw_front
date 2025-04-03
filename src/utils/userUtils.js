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
        const { data: accessToken } = response;
        if (accessToken && accessToken !== 'null') {
            localStorage.setItem('Authorization', accessToken);
        }
    } catch (error) {
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
