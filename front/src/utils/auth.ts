// 存储 token 到 localStorage
export const setToken = (token: string) => {
    localStorage.setItem('auth_token', token);
  };
  
  // 获取 token
  export const getToken = (): string | null => {
    return localStorage.getItem('auth_token');
  };
  
  // 移除 token
  export const removeToken = () => {
    localStorage.removeItem('auth_token');
  };
  
  // 检查是否已登录
  export const isAuthenticated = (): boolean => {
    return !!getToken();
  };