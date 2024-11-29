'use client';

import {
  CaretDownFilled,
  DoubleRightOutlined,
  GithubFilled,
  InfoCircleFilled,
  PlusCircleFilled,
  QuestionCircleFilled,
  SearchOutlined,
  KeyOutlined,
  EllipsisOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { ProSettings } from '@ant-design/pro-components';
import { PageContainer, ProCard, ProLayout, ActionType, ProColumns, ProTable, TableDropdown, ProList } from '@ant-design/pro-components';
import { Divider, Input, Popover, theme, Button, Dropdown, Space, Tag, Modal, Form, Image, List } from 'antd';
import { useState, useRef, useEffect } from 'react';
import { request } from '@/utils/request';

const defaultProps = {
  route: {
    path: '/',
    routes: [
      {
        path: '/users',
        name: '用户管理',
      }
    ],
  },
  location: {
    pathname: '/',
  },
};

interface UserItem {
  id: number;
  phone: string;
  password: string;
  invite_code: string;
  my_invite_code: string;
  real_name?: string;
  id_card?: string;
  status: number;
  created_at?: string;
  updated_at?: string;
  payment_channel?: string;
  payment_qrcode?: string;
  total_debt?: number;
  crowdfunding_account?: number;
  payment_phone?: string;
  is_activated: number;
  activated_at?: string;
  is_priority_repayment: number;
  priority_set_at?: string;
}

interface DonationItem {
  id: number;
  user_id: number;
  payment_proof: string;
  created_at: string;
  submitter_id: number;
  user_real_name: string;
  user_id_card: string;
}

const waitTimePromise = async (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

const waitTime = async (time: number = 100) => {
  await waitTimePromise(time);
};

const columns: ProColumns<UserItem>[] = [
  {
    dataIndex: 'index',
    valueType: 'indexBorder',
    width: 48,
    fixed: 'left',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    copyable: true,
    ellipsis: true,
    width: 140,
  },
  {
    title: '真实姓名',
    dataIndex: 'real_name',
    ellipsis: true,
    width: 120,
  },
  {
    title: '身份证号',
    dataIndex: 'id_card',
    ellipsis: true,
    width: 200,
  },
  {
    title: '审核状态',
    dataIndex: 'status',
    valueType: 'select',
    width: 120,
    valueEnum: {
      0: { text: '待审核', status: 'Processing' },
      1: { text: '已审核', status: 'Success' },
    },
  },
  {
    title: '激活状态',
    dataIndex: 'is_activated',
    valueType: 'select',
    width: 120,
    valueEnum: {
      0: { text: '未激活', status: 'Default' },
      1: { text: '已激活', status: 'Success' },
    },
  },
  {
    title: '优先还款',
    dataIndex: 'is_priority_repayment',
    valueType: 'select',
    width: 120,
    valueEnum: {
      0: { text: '否', status: 'Default' },
      1: { text: '是', status: 'Success' },
    },
  },
  {
    title: '总负债金额',
    dataIndex: 'total_debt',
    valueType: 'money',
    width: 140,
  },
  {
    title: '众筹账户',
    dataIndex: 'crowdfunding_account', 
    valueType: 'money',
    width: 140,
  },
  {
    title: '收款渠道',
    dataIndex: 'payment_channel',
    width: 120,
  },
  {
    title: '收款手机号',
    dataIndex: 'payment_phone',
    width: 140,
  },
  {
    title: '收款二维码',
    dataIndex: 'payment_qrcode',
    width: 120,
    render: (_, record) => (
      record.payment_qrcode ? 
      <Image 
        src={record.payment_qrcode}
        width={50}
        height={50}
      /> : '-'
    )
  },
  {
    title: '注册邀请码',
    dataIndex: 'invite_code',
    width: 140,
  },
  {
    title: '个人邀请码',
    dataIndex: 'my_invite_code',
    width: 140,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    valueType: 'dateTime',
    sorter: true,
    hideInSearch: true,
    width: 180,
  },
  {
    title: '激活时间',
    dataIndex: 'activated_at',
    valueType: 'dateTime',
    hideInSearch: true,
    width: 180,
  },
  {
    title: '优先还款设置时间',
    dataIndex: 'priority_set_at',
    valueType: 'dateTime',
    hideInSearch: true,
    width: 180,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    valueType: 'dateTimeRange',
    hideInTable: true,
    search: {
      transform: (value) => {
        return {
          startTime: value[0],
          endTime: value[1],
        };
      },
    },
  },
  {
    title: '操作',
    valueType: 'option',
    key: 'option',
    fixed: 'right',
    width: 200,
    render: (text, record, _, action) => [
      // <a
      //   key="editable"
      //   onClick={() => {
      //     action?.startEditable?.(record.id);
      //   }}
      // >
      //   编辑
      // </a>,
      <a key="delete" onClick={() => action?.reload()}>删除</a>,
      // <a key="audit" onClick={() => action?.reload()}>审核</a>,
      // <a key="activate" onClick={() => action?.reload()}>激活</a>,
      <a 
        key="setPriority" 
        style={{ color: record.is_priority_repayment ? '#ff4d4f' : undefined }}
        onClick={async () => {
          try {
            const data = await request<{success: boolean}>('/api/userspriority', {
              method: 'POST',
              body: JSON.stringify({
                userId: record.id,
                isPriority: !record.is_priority_repayment
              })
            });
            
            if(data.success) {
              Modal.success({
                title: '成功',
                content: record.is_priority_repayment ? '已取消优先还款' : '已设置为优先还款'
              });
              action?.reload();
            }
          } catch(err) {
            console.error(err);
          }
        }}
      >
        {record.is_priority_repayment ? '取消优先还款' : '设置优先还款'}
      </a>,
      <a key="viewDonations" onClick={async () => {
        try {
          const data = await request<{success: boolean, data: DonationItem[]}>('/api/donations', {
            method: 'GET',
            params: {
              userId: record.id
            }
          });
          
          if(data.success) {
            Modal.info({
              title: '捐赠记录',
              width: 800,
              content: (
                <ProList<DonationItem>
                  rowKey="id"
                  dataSource={data.data}
                  showActions="hover"
                  metas={{
                    title: {
                      dataIndex: 'created_at',
                      title: '捐赠时间',
                      render: (_, row) => (
                        <span>{new Date(row.created_at).toLocaleString()}</span>
                      ),
                    },
                    avatar: {
                      dataIndex: 'payment_proof',
                      search: false,
                      render: (_, row) => (
                        <Image
                          width={100}
                          height={100}
                          src={row.payment_proof}
                        />
                      ),
                    },
                    description: {
                      dataIndex: 'id',
                      search: false,
                      render: (_, row) => (
                        <div>
                          <div>捐赠ID: {row.id}</div>
                          <div>收款人姓名: {row.user_real_name}</div>
                          <div>收款人身份证: {row.user_id_card}</div>
                        </div>
                      ),
                    },
                  }}
                />
              )
            });
          }
        } catch(err) {
          console.error(err);
        }
      }}>查看捐赠</a>
    ],
  },
];

const ManagePage = () => {
  const actionRef = useRef<ActionType>();
  const [pathname, setPathname] = useState('/users');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setIsModalVisible(true);
  }, []);

  const settings: ProSettings | undefined = {
    fixSiderbar: true,
    layout: 'top',
    splitMenus: true,
  };

  const handlePasswordSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = await request<{success: boolean}>('/api/authverify', {
        method: 'POST',
        body: JSON.stringify({
          password: values.password
        })
      });
      
      if(data.success) {
        setIsAuthenticated(true);
        setIsModalVisible(false);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      const data = await request<{success: boolean}>('/api/changepassword', {
        method: 'POST',
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword
        })
      });
      
      if(data.success) {
        Modal.success({
          title: '成功',
          content: '密码修改成功'
        });
        setIsChangePasswordVisible(false);
        passwordForm.resetFields();
      }
    } catch(err) {
      console.error(err);
    }
  };

  if (!mounted) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Modal
        title="请输入密码"
        open={isModalVisible}
        onOk={handlePasswordSubmit}
        closable={false}
        maskClosable={false}
        keyboard={false}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <Form form={form}>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  return (
    <div
      id="test-pro-layout"
      style={{
        height: '100vh',
      }}
    >
      <ProLayout
        {...defaultProps}
        location={{
          pathname,
        }}
        menu={{
          type: 'group',
        }}
        avatarProps={{
          src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
          size: 'small',
          title: '七妮妮',
          render: (props, dom) => {
            return (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'changePassword',
                      icon: <KeyOutlined />,
                      label: '修改密码',
                      onClick: () => setIsChangePasswordVisible(true)
                    },
                  ],
                }}
              >
                {dom}
              </Dropdown>
            );
          },
        }}
        {...settings}
      >
        <PageContainer>
          <ProCard>
            <ProTable<UserItem>
              columns={columns}
              actionRef={actionRef}
              cardBordered
              scroll={{ x: 2200 }}
              request={async (params, sort, filter) => {
                const { current, pageSize, ...searchParams } = params;
                const queryParams = new URLSearchParams({
                  current: current?.toString() || '',
                  pageSize: pageSize?.toString() || '',
                  ...Object.fromEntries(
                    Object.entries(searchParams).filter(([_, v]) => v != null)
                  )
                }).toString();
                const data = await request<{data: UserItem[], total: number}>(`/api/users?${queryParams}`);
                return {
                  data: data.data,
                  total: data.total,
                  success: true,
                };
              }}
              editable={{
                type: 'multiple',
              }}
              columnsState={{
                persistenceKey: 'pro-table-singe-demos',
                persistenceType: 'localStorage',
                defaultValue: {
                  option: { fixed: 'right', disable: true },
                },
                onChange(value) {
                  console.log('value: ', value);
                },
              }}
              rowKey="id"
              search={{
                labelWidth: 'auto',
              }}
              options={{
                setting: {
                  listsHeight: 400,
                },
              }}
              form={{
                syncToUrl: (values, type) => {
                  if (type === 'get') {
                    return {
                      ...values,
                      created_at: [values.startTime, values.endTime],
                    };
                  }
                  return values;
                },
              }}
              pagination={{
                pageSize: 10,
              }}
              dateFormatter="string"
              headerTitle="用户管理"
            />
          </ProCard>
        </PageContainer>
      </ProLayout>

      <Modal
        title="修改密码"
        open={isChangePasswordVisible}
        onOk={handleChangePassword}
        onCancel={() => {
          setIsChangePasswordVisible(false);
          passwordForm.resetFields();
        }}
      >
        <Form form={passwordForm}>
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagePage;