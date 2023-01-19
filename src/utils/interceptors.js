import axios from "axios";
import Const from "./const";
// const _axios = axios.create({
//   baseURL: Const.base_url_head + Const.base_url_address,
// });
const _axios = axios.create();
_axios.defaults.headers.common["Authorization"] = localStorage.getItem("token");
// 添加请求拦截器
_axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
_axios.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response;
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default _axios;
