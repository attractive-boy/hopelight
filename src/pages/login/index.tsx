import { Button, Card, Checkbox, Form, Input, Toast } from 'antd-mobile';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { request } from '@/utils/request';

export default function LoginPage() {
  const [form] = Form.useForm();
  const [rememberPassword, setRememberPassword] = useState(false);
  const router = useRouter();

  return (
    <>
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 20px',
        minHeight: '100vh',
      }}>
        <div style={{
          width: '220px',
          height: '120px', 
          background: 'transparent',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'fadeIn 1s ease-in',
          marginTop: '30px'
        }}>
          <Image 
            src="/logo.png" 
            width={100} 
            height={100} 
            alt="logo"
            loader={({ src }) => `https://www.xwzg.xn--fiqs8s/public/upload/logo/2024/09-10/f397684f42c7dd65a7e4e1d6791a2e80.jpg`}
          />
        </div>

        <Card style={{ 
          width: '100%',
          maxWidth: '400px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            marginBottom: '20px',
            textAlign: 'left',
            color: '#333'
          }}>
            登录
          </div>

          <Form
            form={form}
            layout='vertical'
            style={{ width: '100%' }}
          >
            <Form.Item 
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
              ]}
              style={{ marginBottom: '15px' }}
            >
              <Input 
                placeholder="请输入您的手机号" 
                style={{
                  height: '45px',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </Form.Item>

            <Form.Item 
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, max: 20, message: '密码长度为6-20位' }
              ]}
              style={{ marginBottom: '15px' }}
            >
              <Input 
                type="password"
                placeholder="请输入密码（6-20位字符）"
                style={{
                  height: '45px',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </Form.Item>

            <div style={{ 
              marginBottom: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Checkbox
                checked={rememberPassword}
                onChange={(checked) => setRememberPassword(checked)}
                style={{ fontSize: '14px' }}
              >
                记住密码
              </Checkbox>
              <a href="#" style={{ color: '#1677ff', fontSize: '14px' }}>忘记密码？</a>
            </div>

            <Button 
              block 
              color='primary'
              size='large'
              onClick={async () => {
                try {
                  const values = await form.validateFields();
                  const data = await request<{
                    success: boolean;
                    message: string;
                    data?: {
                      token: string;
                      user: {
                        id: number;
                        phone: string;
                        myInviteCode: string;
                      };
                    };
                  }>('/api/login', {
                    method: 'POST',
                    body: JSON.stringify(values),
                  });

                  if (data.success && data.data) {
                    // 保存token
                    localStorage.setItem('token', data.data.token);
                    
                    // 如果记住密码，保存登录信息
                    if (rememberPassword) {
                      localStorage.setItem('loginInfo', JSON.stringify({
                        phone: values.phone,
                        password: values.password
                      }));
                    } else {
                      localStorage.removeItem('loginInfo');
                    }

                    Toast.show({
                      icon: 'success',
                      content: '登录成功',
                    });
                    
                    router.push('/my');
                  }
                } catch (error) {
                  // 错误处理已在 request 函数中统一处理
                  console.error('登录失败:', error);
                }
              }}
              style={{
                height: '48px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              点击登录
            </Button>

            <div style={{
              marginTop: '15px',
              textAlign: 'center',
              color: '#666',
              fontSize: '14px'
            }}>
              还没有账号？<a href="/register" style={{ color: '#1677ff' }}>立即注册</a>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
}
