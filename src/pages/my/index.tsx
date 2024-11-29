import { NavBar, List, Avatar, Toast } from 'antd-mobile';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { request } from '@/utils/request';


import { UserOutline, CouponOutline, BankcardOutline, PayCircleOutline, TeamOutline, CalendarOutline, VideoOutline } from 'antd-mobile-icons';export default function PlanPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{
    phone: string;
    avatar?: string;
    real_name?: string;
    status?: number;
    payment_channel?: string;
  }>();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await request<{ success: boolean, data: { phone: string, avatar?: string, name?: string, status?: number } }>('/api/userinfo');
        if(data.success) {
          setUserInfo(data.data);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };
    fetchUserInfo();
  }, []);

  const handleClick = () => {
    Toast.show({
      content: '正在努力开发中',
      duration: 1000,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <>
      <NavBar 
        left={null}
        right={null}
        back={null}
        style={{
          color: '#fff',
          borderBottom: '1px solid white',
          marginBottom: '10px',
          backgroundColor: '#343c6d'
        }}
      >
        我的
      </NavBar>

      <div style={{
        padding: '20px',
        background: '#4a5280',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        color: '#fff'
      }}>
        <Avatar 
          src={'https://www.xwzg.xn--fiqs8s/public/upload/logo/2024/09-10/b1ba7d07a864b1a5c63e622a56bb8b17.jpg'} 
          style={{ marginRight: '15px' }}
        />
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
            {userInfo?.real_name || '未设置昵称'}
          </div>
          <div style={{ fontSize: '14px', color: '#fff', marginTop: '4px' }}>
            {userInfo?.phone || ''}
          </div>
        </div>
      </div>

      <List style={{ 
        '--border-inner': '1px solid #eee',
        '--adm-color-background': '#4a5280',
        '--adm-color-text': '#fff',
        '--adm-color-border': '#343c6d',
        color: '#fff'
      } as any}>
        {/* <List.Item prefix={<UserOutline />} onClick={handleClick} style={{color: '#fff'}} extra={userInfo?.status === 0 ? '未审核' : '已审核'}>
          审核状态
        </List.Item> */}
        <List.Item prefix={<CouponOutline />} onClick={() => router.push('/verify')} style={{color: '#fff'}} extra={!userInfo?.real_name ? '未认证' : '已认证'}>
          实名认证
        </List.Item>
        <List.Item prefix={<VideoOutline />} onClick={handleClick} style={{color: '#fff'}}>
          我的信用卡
        </List.Item>
        <List.Item prefix={<BankcardOutline />} onClick={handleClick} style={{color: '#fff'}}>
          我的储蓄卡
        </List.Item>
        <List.Item prefix={<PayCircleOutline />} onClick={() => router.push('/payment')} style={{color: '#fff'}} extra={userInfo?.payment_channel ? '已设置' : '未设置'}>
          收款方式
        </List.Item>
        <List.Item prefix={<TeamOutline />} onClick={() => router.push('/myfriends')} style={{color: '#fff'}}>
          我的好友
        </List.Item>
        <List.Item 
          prefix={<CalendarOutline />}
          onClick={() => {
            localStorage.clear();
            Toast.show({
              icon: 'success',
              content: '清除成功'
            });
          }}
          extra="0.57M"
          style={{color: '#fff'}}
        >
          清除缓存
        </List.Item>
        <List.Item prefix={<VideoOutline />} onClick={handleClick} style={{color: '#fff'}}>
          联系我们
        </List.Item>
      </List>

      <div style={{
        padding: '20px',
        textAlign: 'center'
      }}>
        <div
          onClick={handleLogout}
          style={{
            background: '#343c6d',
            color: '#fff',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          退出登录
        </div>
      </div>
    </>
  );
}

PlanPage.showTabBar = true