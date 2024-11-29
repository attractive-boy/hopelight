import { NavBar } from 'antd-mobile';
import { useEffect, useState } from 'react';
import { request } from '@/utils/request';

export default function PlanPage() {
  const [totalDebt, setTotalDebt] = useState('0.00');
  const [crowdfundBalance, setCrowdfundBalance] = useState('0.00');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await request<{
          success: boolean;
          data: {
            total_debt?: string;
            crowdfund_balance?: string;
          };
        }>('/api/userinfo');

        if (res.success && res.data) {
          setTotalDebt(res.data.total_debt || '0.00');
          setCrowdfundBalance(res.data.crowdfund_balance || '0.00');
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <>
      <NavBar 
        left={null}
        right={null}
        back={null}
        style={{
          color: '#fff',
          borderBottom: '1px solid white',
          marginBottom: '10px'
        }}
      >
        我的钱包
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
          {/* 总负债金额卡片 */}
          <div style={{
            background: '#4a5280',
            borderRadius: '8px',
            padding: '20px',
            color: '#fff',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              marginBottom: '10px',
              opacity: 0.8
            }}>
              总负债金额
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              ¥ {totalDebt}
            </div>
          </div>

          {/* 众筹账户卡片 */}
          <div style={{
            background: '#4a5280', 
            borderRadius: '8px',
            padding: '20px',
            color: '#fff',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              marginBottom: '10px',
              opacity: 0.8
            }}>
              众筹账户
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              ¥ {crowdfundBalance}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

PlanPage.showTabBar = true