import { NavBar, Button, Image, ImageUploader } from 'antd-mobile';
import { useEffect, useState } from 'react';
import { request } from '@/utils/request';
import { useRouter } from 'next/router';

interface UserInfo {
  id: number;
  real_name: string;
  id_card: string;
  payment_qrcode: string;
}

export default function DonatePage() {
  const router = useRouter();
  const { id } = router.query;
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [uploadedImage, setUploadedImage] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!id) return;
      try {
        const res = await request<{
          success: boolean;
          data: UserInfo;
        }>(`/api/users?id=${id}`);

        if (res.success) {
          setUserInfo(res.data);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    fetchUserInfo();
  }, [id]);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await request<{success: boolean; data: {url: string}}>('/api/upload', {
        method: 'POST',
        body: formData,
        noContentType: true
      });
      if(res.success) {
        setUploadedImage(res.data.url);
        return {
          url: URL.createObjectURL(file)
        }
      }
      throw new Error('上传失败');
    } catch (error) {
      console.error('上传失败:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if(!uploadedImage) {
      alert('请先上传付款截图');
      return;
    }
    try {
      const res = await request<{success: boolean}>('/api/donations', {
        method: 'POST',
        body: JSON.stringify({
          userId: id,
          paymentProof: uploadedImage
        })
      });
      if(res.success) {
        alert('提交成功');
        //返回上一页
        router.back();
      }
    } catch(error) {
      console.error('提交失败:', error);
      alert('提交失败,请重试');
    }
  };

  return (
    <>
      <NavBar 
        onBack={() => router.back()}
        style={{
          color: '#fff',
          borderBottom: '1px solid white',
          marginBottom: '10px',
          backgroundColor: '#343c6d'
        }}
      >
        付款信息
      </NavBar>
      <div style={{
        padding: '20px',
        backgroundColor: '#343c6d',
        minHeight: '100vh'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {/* 收款人信息卡片 */}
          <div style={{
            background: '#4a5280',
            borderRadius: '8px',
            padding: '20px',
            color: '#fff'
          }}>
            <div style={{marginBottom: '8px'}}>收款人姓名: {userInfo?.real_name}</div>
            <div>身份证: {userInfo?.id_card ? userInfo.id_card.slice(0,4) + '**********' + userInfo.id_card.slice(-4) : '********************'}</div>
          </div>

          {/* 收款二维码卡片 */}
          <div style={{
            background: '#4a5280',
            borderRadius: '8px',
            padding: '20px',
            color: '#fff',
            textAlign: 'center'
          }}>
            {userInfo?.payment_qrcode && (
              <Image
                src={userInfo.payment_qrcode}
                width={200}
                height={200}
                style={{ margin: '0 auto' }}
              />
            )}
            <div style={{margin: '15px 0', color: '#fff'}}>
              请使用微信或支付宝App，扫码以上二维码付款
            </div>
            <div style={{color: '#ffeb3b'}}>
              付款时在微信或支付宝订单备注您平台认证的姓名
            </div>
          </div>

          {/* 上传付款截图卡片 */}
          <div style={{
            background: '#4a5280',
            borderRadius: '8px',
            padding: '20px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <ImageUploader
              upload={handleUpload}
              maxCount={1}
              style={{
                '--cell-size': '120px',
              }}
            >
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '8px',
                backgroundColor: '#343c6d',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                textAlign: 'center'
              }}>
                点击上传付款截图
              </div>
            </ImageUploader>
            <Button 
              color='primary' 
              onClick={handleSubmit}
              style={{
                width: '200px',
                '--background-color': '#1677ff'
              }}
            >
              提交付款凭证
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
