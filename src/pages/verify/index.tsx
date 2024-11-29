import { NavBar, Form, Input, Button, Toast } from 'antd-mobile';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { request } from '@/utils/request';

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verifyInfo, setVerifyInfo] = useState<{
    real_name?: string;
    id_card?: string;
    status?: number;
  }>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVerifyInfo = async () => {
      try {
        const data = await request<{
          success: boolean;
          data: {
            real_name?: string;
            id_card?: string;
            status?: number;
          };
        }>('/api/userinfo');
        if (data.success) {
          setVerifyInfo(data.data);
        }
      } catch (error) {
        console.error('获取认证信息失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVerifyInfo();
  }, []);

  const onFinish = async (values: { name: string; idCard: string }) => {
    try {
      setLoading(true);
      const res = await request<{ success: boolean }>('/api/userverify', {
        method: 'POST',
        body: JSON.stringify(values)
      });

      if (res.success) {
        Toast.show({
          icon: 'success',
          content: '实名认证成功'
        });
        router.back();
      }
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: '认证失败，请重试'
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#fff'
      }}>
        加载中...
      </div>
    );
  }

  return (
    <>
      <NavBar 
        onBack={() => router.back()}
        style={{
          backgroundColor: '#343c6d',
          color: '#fff'
        }}
      >
        实名认证
      </NavBar>

      <div style={{ padding: '20px' }}>
        {verifyInfo?.real_name ? (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={"https://www.xwzg.xn--fiqs8s/public/static/chuangke/images/sh01.png"}
              alt="认证成功"
              style={{ 
                width: '100px',
                height: '80px',
                margin: '20px auto'
              }}
            />
            <div style={{ 
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '30px'
            }}>
              您的实名认证审核已通过
            </div>
            
            <div style={{ 
              background: '#4a5280',
              padding: '20px',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '16px'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <span>真实姓名：</span>
                <span>{verifyInfo.real_name}</span>
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <span>证件类型：</span>
                <span>身份证</span>
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <span>证件号码：</span>
                <span>{verifyInfo.id_card?.replace(/(\d{4})\d*(\d{4})/, '$1****$2')}</span>
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>状态：</span>
                <span>已认证</span>
              </div>
            </div>
          </div>
        ) : (
          <Form
            onFinish={onFinish}
            footer={
              <Button
                block
                type="submit"
                color="primary"
                loading={loading}
                style={{
                  backgroundColor: '#4a5280',
                  marginTop: '20px'
                }}
              >
                提交认证
              </Button>
            }
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: '请输入姓名' }]}
              style={{ backgroundColor: '#4a5280', color: '#fff' }}
            >
              <Input placeholder="请输入姓名" style={{ '--adm-color-text': '#fff' } as any} />
            </Form.Item>
            <Form.Item
              name="idCard"
              rules={[
                { required: true, message: '请输入身份证号' },
                { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号' }
              ]}
              style={{ backgroundColor: '#4a5280', color: '#fff' }}
            >
              <Input placeholder="请输入身份证号码" style={{ '--adm-color-text': '#fff' } as any} />
            </Form.Item>
          </Form>
        )}
      </div>
    </>
  );
}