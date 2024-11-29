import { Toast } from 'antd-mobile';
import Router from 'next/router';

interface RequestOptions extends RequestInit {
  showError?: boolean;
  noContentType?: boolean;
  params?: Record<string, any>;
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  const defaultOptions: RequestOptions = {
    showError: true,
    ...options
  };

  // 处理 URL 参数
  if (options.params) {
    const queryString = new URLSearchParams(options.params).toString();
    url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
    delete defaultOptions.params;
  }

  // 如果有token则加入Authorization header
  if (token) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  // 如果不是noContentType,则设置Content-Type
  if (!options.noContentType) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      'Content-Type': 'application/json'
    };
  }

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        Router.push('/login');
        throw new Error('未授权,请重新登录');
      }
      throw new Error(data.message || '请求失败');
    }

    if (!data.success && defaultOptions.showError) {
      Toast.show({
        icon: 'fail',
        content: data.message,
      });
    }

    return data;
  } catch (error) {
    if (defaultOptions.showError) {
      Toast.show({
        icon: 'fail',
        content: error instanceof Error ? error.message : '请求失败',
      });
    }
    throw error;
  }
}