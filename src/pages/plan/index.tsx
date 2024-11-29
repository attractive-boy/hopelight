import { NavBar } from 'antd-mobile';
import { useState, useEffect } from 'react';
import { request } from '@/utils/request';
import { Button, Toast, Modal } from 'antd-mobile';
import Image from 'next/image';
import Link from 'next/link';
import { AddOutline } from 'antd-mobile-icons'
import { useRouter } from 'next/router';

interface PlanType {
  id: number;
  name: string;
}

interface DebtDetail {
  id: number;
  amount: number;
  type: number;
}

const planTypes: PlanType[] = [
  { id: 1, name: '信用卡' },
  { id: 2, name: '房贷' }, 
  { id: 3, name: '车贷' },
  { id: 4, name: '其他' }
];

export default function PlanPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'crowdfund' | 'repayment'>('crowdfund');
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [totalAmount, setTotalAmount] = useState('0');
  const [isActivated, setIsActivated] = useState(false);
  const [debtDetails, setDebtDetails] = useState<DebtDetail[]>([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await request<{
          success: boolean;
          data: {
            total_debt: string;
            is_activated: boolean;
          }
        }>('/api/userinfo');
        if(res.success) {
          setTotalAmount(res.data.total_debt || '0');
          setIsActivated(res.data.is_activated);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    const fetchDebtDetails = async () => {
      try {
        const res = await request<{
          success: boolean;
          data: DebtDetail[];
        }>('/api/debts');
        if(res.success) {
          setDebtDetails(res.data);
        }
      } catch (error) {
        console.error('获取债务明细失败:', error);
      }
    };

    fetchUserInfo();
    fetchDebtDetails();
  }, []);

  const getTypeTotal = (typeId: number) => {
    const total = debtDetails
      .filter(debt => debt.type === typeId)
      .reduce((sum, debt) => sum + Number(debt.amount), 0);
    return total.toFixed(2);
  };

  const handleActivate = () => {
    setShowActivateModal(true);
  };

  const handleConfirmActivate = async () => {
    try {
      // 这里添加激活的API调用
      // 检查用户是否实名
      const res = await request<{
        success: boolean;
        data: {
          real_name: boolean;
          payment_qrcode: string;
        }
      }>('/api/userinfo');
      if(!res.data.real_name) {
        Toast.show({
          icon: 'fail',
          content: '请先实名认证'
        });
        //跳转实名认证页面
        router.push('/verify');
        return;
      }
      //检查是否有收款码
      if(!res.data.payment_qrcode) {
        Toast.show({
          icon: 'fail',
          content: '请先添加收款方式'
        });
        //跳转添加收款码页面
        router.push('/payment');
        return;
      }
      const activateRes = await request<{success: boolean}>('/api/activate', {
        method: 'POST'
      });
      if(activateRes.success) {
        Toast.show({
          icon: 'success',
          content: '激活成功'
        });
        setIsActivated(true);
        setShowActivateModal(false);
      }
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: '激活失败'
      });
    }
  };

  const handleDebtEntry = (type: PlanType) => {
    router.push({
      pathname: '/debtentry',
      query: {
        type: type.id,
        typeName: type.name
      }
    });
  };

  const handlePay = () => {
    router.push('/donate');
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
        计划
      </NavBar>
    <div style={{ 
      backgroundColor: '#343c6d',
      minHeight: '100vh',
      color: '#fff'
    }}>
      <div style={{
        padding: '20px'
      }}>
        {/* 标签切换 */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <span 
            onClick={() => setActiveTab('crowdfund')}
            style={{
              fontSize: '16px',
              color: activeTab === 'crowdfund' ? '#fff' : 'rgba(255,255,255,0.6)',
              borderBottom: activeTab === 'crowdfund' ? '2px solid #fff' : 'none',
              padding: '5px 0'
            }}
          >
            众筹计划
          </span>
          <span
            onClick={() => setActiveTab('repayment')}
            style={{
              fontSize: '16px', 
              color: activeTab === 'repayment' ? '#fff' : 'rgba(255,255,255,0.6)',
              borderBottom: activeTab === 'repayment' ? '2px solid #fff' : 'none',
              padding: '5px 0'
            }}
          >
            还款计划
          </span>
        </div>

        {activeTab === 'crowdfund' && (
          <>
            {/* 计划类型 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '15px',
              marginBottom: '20px'
            }}>
              {planTypes.map(type => (
                <div 
                  key={type.id}
                  onClick={() => handleDebtEntry(type)}
                  style={{
                    background: '#4a5280',
                    borderRadius: '8px',
                    padding: '15px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    fontSize: '20px', 
                    fontWeight: 'bold',
                    minHeight: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {Number(getTypeTotal(type.id)) === 0 ? (
                      <AddOutline fontSize={24} />
                    ) : (
                      <div style={{
                        fontSize: Number(getTypeTotal(type.id)) > 9999 ? '12px' : '16px',
                        lineHeight: '30px'
                      }}>
                        {getTypeTotal(type.id)}
                      </div>
                    )}
                  </div>
                  <div style={{marginTop: '8px'}}>{type.name}</div>
                </div>
              ))}
            </div>

            {/* 金额信息 */}
            <div style={{
              background: '#4a5280',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span>可还款总额：</span>
                  <span style={{
                    fontSize: Number(totalAmount) > 9999 ? '12px' : '14px',
                    lineHeight: '20px'
                  }}>￥{totalAmount}</span>
                </div>
                <Button
                  color='primary'
                  onClick={isActivated ? handlePay : handleActivate}
                  style={{
                    backgroundColor: '#343c6d',
                    border: 'none'
                  }}
                >
                  {isActivated ? '去付款' : '激活'}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* 还款计划列表 */}
        <div style={{
          background: '#4a5280',
          borderRadius: '8px',
          padding: '20px'
        }}>
          
          {activeTab === 'repayment' && (
            <>
            <div style={{fontSize: '16px', marginBottom: '10px'}}>还款计划</div>
            <div style={{textAlign: 'center', padding: '40px 0'}}>
              <Image 
                src="/images/message_no.png"
                loader={({ src }) => `https://www.xwzg.xn--fiqs8s/public/static/chuangke/images/message_no.png`}
                alt="暂无数据"
                width={100}
                height={100}
              />
              <div style={{marginTop: '10px'}}>暂无相关数据</div>
            </div>
            </>
          )}
        </div>
      </div>

      <Modal
        visible={showActivateModal}
        content='激活需24小时内打款，否则系统封号处理'
        closeOnAction
        onClose={() => setShowActivateModal(false)}
        actions={[
          {
            key: 'cancel',
            text: '取消',
            onClick: () => setShowActivateModal(false)
          },
          {
            key: 'confirm',
            text: '确定',
            onClick: handleConfirmActivate
          }
        ]}
      />
    </div>
    </>
  );
}

PlanPage.showTabBar = true;
