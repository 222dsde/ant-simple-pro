import axios from 'axios'
import { localStorage } from '@/assets/js/storage'
import { history } from '@/assets/js/history'
import { requestCode } from '../utils/varbile'
import { toast } from '../utils/function'
axios.defaults.withCredentials = true;
axios.defaults.baseURL = '/api'
axios.interceptors.request.use(config => {
    if (localStorage.getItem('token')) {
        config.headers['accesstoken'] = localStorage.getItem('token');
    }
    return config
}, error => {
    return Promise.reject(error)
});

axios.interceptors.response.use((response) => {
    let token = response.headers.accesstoken;
    if (token) {
        axios.defaults.headers.common['accesstoken'] = token;
    }
    if (response.status === 200) {
    }
    return response
}, (error) => {
    return Promise.reject(error)
});

export const resquest = (method: string, url: string, data: any = {}): Promise<any> => {
    return new Promise((resolve) => {
        let params = {};
        if (method === 'get') {
            Object.keys(data).forEach((key) => (data[key] == null || data[key] == '') && delete data[key]); //删除为空的字符串
            params = data;
        };
        let option = {
            method, url, params, ...data,
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: [
                function (data:any) {
                   let ret = ''
                   for (let it in data) {
                      ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                   }
                   ret = ret.substring(0, ret.lastIndexOf('&'));
                   return ret
                }
            ],
        };
        axios.request(option).then(res => {
            console.log('data', data)
            if (res.data.code === requestCode.successCode) {
                resolve(res.data);
            } else if (res.data.code === requestCode.noLoginTokenCode) {
                history.push('/login');
            } else {
                toast(requestCode.failedCode, res.data.mes);
                resolve(res.data);
            }
        }, error => {
            toast(requestCode.failedCode, '请求出错，请重试');

        }).catch((err) => {
            toast(requestCode.serverErrorCode, '服务异常');
        })
    })
}