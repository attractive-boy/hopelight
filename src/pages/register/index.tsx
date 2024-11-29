import { Button, Card, Form, Input, Toast } from 'antd-mobile';
import Image from 'next/image';
import router, { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { request } from '@/utils/request';

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const { query } = useRouter();

  useEffect(() => {
    if (query.code) {
      form.setFieldsValue({
        inviteCode: query.code
      });
    }
  }, [query.code, form]);

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
            注册
          </div>

          <Form
            form={form}
            layout='vertical'
            style={{ width: '100%' }}
          >
            <Form.Item
              name="phone"
              rules={[{ required: true, message: '请输入手机号' }]}
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
              rules={[{ required: true, message: '请输入密码' }]}
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

            <Form.Item
              name="inviteCode"
              rules={[{ required: true, message: '请输入邀请码' }]}
              style={{ marginBottom: '15px' }}
            >
              <Input
                placeholder="请输入邀请码"
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
              alignItems: 'center',
              fontSize: '14px'
            }}>
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span>我已阅读并同意<a href="/agreement" style={{ color: '#1677ff' }}>《注册协议》</a></span>
            </div>

            <Button
              block
              color='primary'
              size='large'
              disabled={!agreeToTerms}
              onClick={async () => {
                try {
                  const values = await form.validateFields();
                  const data = await request<{ success: boolean, message: string }>('/api/register', {
                    method: 'POST',
                    body: JSON.stringify(values),
                  });

                  if (data.success) {
                    Toast.show({
                      icon: 'success',
                      content: '注册成功',
                    });
                    router.push('/login');
                  }
                } catch (error) {
                  // 错误处理已在 request 函数中统一处理
                  console.error('注册失败:', error);
                }
              }}
              style={{
                height: '48px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              立即注册
            </Button>

            <div style={{
              marginTop: '15px',
              textAlign: 'center',
              color: '#666',
              fontSize: '14px'
            }}>
              已有账号？<a href="/login" style={{ color: '#1677ff' }}>立即登录</a>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
}
