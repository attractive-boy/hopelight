import { NavBar, Form, Input, Button, ImageUploader, Toast } from 'antd-mobile';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ImageUploadItem } from 'antd-mobile/es/components/image-uploader';
import { request } from '@/utils/request';

export default function PaymentPage() {
  const router = useRouter();
  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        const res = await request<{
          success: boolean;
          data: {
            payment_channel?: string;
            payment_phone?: string;
            payment_qrcode?: string;
          };
        }>('/api/userinfo');

        if (res.success && res.data) {
          form.setFieldsValue({
            payment_channel: res.data.payment_channel,
            phone: res.data.payment_phone,
          });

          if (res.data.payment_qrcode) {
            setFileList([{
              url: res.data.payment_qrcode
            }]);
          }
        }
      } catch (error) {
        console.error('获取支付信息失败:', error);
      }
    };

    fetchPaymentInfo();
  }, []);

  const onFinish = async (values: {
    payment_channel: string;
    phone: string;
  }) => {
    try {
      if (fileList.length === 0) {
        return Toast.show({
          content: '请上传收款二维码',
          icon: 'fail',
        });
      }

      const jsonData = {
        payment_channel: values.payment_channel,
        payment_phone: values.phone,
        qrcode: fileList[0].url
      };

      const res = await request<{ success: boolean }>('/api/paymentsetup', {
        method: 'POST',
        body: JSON.stringify(jsonData)
      });

      if (res.success) {
        Toast.show({
          icon: 'success',
          content: '设置成功',
        });
        router.back();
      }
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: '设置失败',
      });
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#343c6d', 
      minHeight: '100vh',
      color: '#fff'
    }}>
      <NavBar 
        onBack={() => router.back()}
        style={{
          backgroundColor: '#343c6d',
          color: '#fff',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        收款方式
      </NavBar>

      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        style={{
          padding: '20px',
          '--adm-color-text': '#fff',
          '--adm-color-primary': '#4a5280',
          '--adm-color-background': '#4a5280',
        } as any}
        footer={
          <Button 
            block 
            type='submit' 
            color='primary' 
            size='large'
            style={{
              marginTop: '24px',
              backgroundColor: '#4a5280',
              border: 'none'
            }}
          >
            保存
          </Button>
        }
      >
        <Form.Item
          name='payment_channel'
          rules={[{ required: true, message: '请输入收款渠道' }]}
        >
          <Input 
            placeholder='请输入收款渠道（如：支付宝/微信）'
            style={{
              '--background-color': '#4a5280',
              '--placeholder-color': 'rgba(255,255,255,0.5)',
              color: '#fff'
            } as any}
          />
        </Form.Item>

        <Form.Item
          name='phone'
          rules={[{ required: true, message: '请输入手机号码' }]}
        >
          <Input 
            placeholder='请输入收款手机号码'
            style={{
              '--background-color': '#4a5280',
              '--placeholder-color': 'rgba(255,255,255,0.5)',
              color: '#fff'
            } as any}
          />
        </Form.Item>

        <Form.Item 
         style={{ '--text-color': '#fff', color: '#fff' } as any}>
            <div style={{
              marginBottom: '10px',
              fontSize: '16px',
              fontWeight: '500',
              width: '100%'
            }}>
              收款二维码
            </div>
          <div style={{
            padding: '20px',
            backgroundColor: '#4a5280',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '10px',
            color: '#fff'
          }}>
            
            <ImageUploader
              value={fileList}
              onChange={setFileList}
              upload={async (file) => {
                // 这里需要实现文件上传逻辑，返回图片URL
                const formData = new FormData();
                formData.append('file', file);
                const res = await request<{ success: boolean, data: { url: string } }>('/api/upload', {
                  method: 'POST',
                  body: formData,
                  noContentType: true,
                });
                return { url: res.data.url };
              }}
              maxCount={1}
              style={{
                '--cell-size': '200px',
                '--text-color': '#fff',
                color: '#fff'
              } as any}
            >
              <div style={{
                width: '200px',
                height: '200px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '32px',
                color: '#fff'
              }}>
                +
              </div>
            </ImageUploader>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}