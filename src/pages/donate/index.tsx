import { NavBar, Button } from 'antd-mobile';
import { useEffect, useState } from 'react';
import { request } from '@/utils/request';
import { useRouter } from 'next/router';

interface UserInfo {
  id: number;
  real_name: string;
  id_card: string;
}

export default function DonatePage() {
  const router = useRouter();
  const [userList, setUserList] = useState<UserInfo[]>([]);

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const res = await request<{
          success: boolean;
          data: UserInfo[];
        }>('/api/donatelist');

        if (res.success) {
          setUserList(res.data);
        }
      } catch (error) {
        console.error('获取用户列表失败:', error);
      }
    };

    fetchUserList();
  }, []);

  const handleDonate = (userId: number) => {
    router.push(`/donate/${userId}`);
  };

  return (
    <>
      <NavBar 
        back="返回"
        style={{
          color: '#fff',
          borderBottom: '1px solid white',
          marginBottom: '10px',
          backgroundColor: '#343c6d'
        }}
      >
        爱心捐赠
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
          {userList.map(user => (
            <div 
              key={user.id}
              style={{
                background: '#4a5280',
                borderRadius: '8px',
                padding: '20px',
                color: '#fff'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div>
                  <div style={{marginBottom: '8px'}}>姓名: {user.real_name}</div>
                  <div>身份证: {user.id_card ? user.id_card.slice(0,4) + '**********' + user.id_card.slice(-4) : '********************'}</div>
                </div>
                <Button
                  color='primary'
                  onClick={() => handleDonate(user.id)}
                  style={{
                    backgroundColor: '#343c6d',
                    border: 'none'
                  }}
                >
                  去捐赠
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
