import { NavBar, Toast } from 'antd-mobile';
import { useEffect, useState } from 'react';
import { request } from '@/utils/request';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function PlanPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [showButtons, setShowButtons] = useState(true);
  const [bgImageLoaded, setBgImageLoaded] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await request<{
          success: boolean;
          data: {
            my_invite_code?: string;
          };
        }>('/api/userinfo');

        if (res.success && res.data) {
          setInviteCode(res.data.my_invite_code || '');
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    fetchUserInfo();

    // 使用 Next.js Image 组件预加载背景图片
    const bgImg = document.createElement('img');
    bgImg.onload = () => setBgImageLoaded(true);
    bgImg.onerror = () => {
      Toast.show({
        icon: 'fail',
        content: '背景图片加载失败'
      });
    };
    bgImg.src = '/api/proxyimage?url=' + encodeURIComponent('https://www.xwzg.xn--fiqs8s/public/upload/logo/2024/09-10/d44f22c3832ed9979b88c52220ea2fb4.jpg');
  }, []);

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/register?code=${inviteCode}`;
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(link).then(() => {
        Toast.show({
          icon: 'success',
          content: '复制成功'
        });
      });
    }
  };

  const handleSaveImage = async () => {
    if (!bgImageLoaded) {
      Toast.show({
        icon: 'fail',
        content: '请等待背景图片加载完成'
      });
      return;
    }

    if (typeof document !== 'undefined') {
      try {
        setShowButtons(false);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const element = document.getElementById('qrcode-container');
        if (!element) {
          throw new Error('找不到二维码容器元素');
        }

        const canvas = await html2canvas(element, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          onclone: function(clonedDoc) {
            const clonedElement = clonedDoc.getElementById('qrcode-container');
            if (clonedElement) {
              clonedElement.style.height = '100vh';
              clonedElement.style.width = '100%';
              clonedElement.style.position = 'relative';
            }
          }
        });

        const link = document.createElement('a');
        link.download = '邀请二维码.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        Toast.show({
          icon: 'success',
          content: '保存成功'
        });
      } catch (error) {
        console.error('保存图片失败:', error);
        Toast.show({
          icon: 'fail',
          content: '保存失败,请重试'
        });
      } finally {
        setShowButtons(true);
      }
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

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
        好友列表
      </NavBar>
      <div
        id='qrcode-container'
        style={{
          minHeight: '100vh',
          backgroundImage: `url('/api/proxyimage?url=${encodeURIComponent('https://www.xwzg.xn--fiqs8s/public/upload/logo/2024/09-10/d44f22c3832ed9979b88c52220ea2fb4.jpg')}')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '20px'
        }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          padding: '30px',
          borderRadius: '12px',
          marginTop: '200px'
        }}>
          <QRCodeSVG 
            value={`${origin}/register?code=${inviteCode}`}
            size={150}
            level="H"
          />
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#fff'
          }}>
            邀请码：{inviteCode}
          </div>
        </div>

        {showButtons && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginTop: '30px'
          }}>
            <button
              onClick={handleCopyLink}
              style={{
                background: '#343c6d',
                color: '#fff',
                padding: '12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '16px'
              }}
            >
              复制邀请链接
            </button>
            <button
              onClick={handleSaveImage}
              style={{
                background: '#4a5280',
                color: '#fff', 
                padding: '12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '16px'
              }}
            >
              保存为图片
            </button>
          </div>
        )}
      </div>
    </>
  );
}
