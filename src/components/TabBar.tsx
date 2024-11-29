import { TabBar } from 'antd-mobile'
import { 
 AppOutline,
  CalendarOutline,
  PayCircleOutline,
  UserOutline
} from 'antd-mobile-icons'
import { useRouter } from 'next/router'

export function BottomTabBar() {
  const router = useRouter()
  
  const tabs = [
    {
      key: '/index',
      title: '首页',
      icon: <AppOutline />,
    },
    {
      key: '/plan',
      title: '计划',
      icon: <CalendarOutline />,
    },
    {
      key: '/wallet',
      icon: <PayCircleOutline />,
    },
    {
      key: '/my',
      title: '我的',
      icon: <UserOutline />,
    },
  ]

  return (
    <TabBar
    activeKey={router.pathname}
    onChange={(key) => router.push(key)}
    style={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      background: '#343c6d',
      borderTop: '1px solid white',
      '--adm-color-text': '#8890b5',
      '--adm-color-primary': 'rgb(83, 225, 255)',
      '--adm-color-text-secondary': '#8890b5'
    } as React.CSSProperties}
  >
      {tabs.map(item => (
        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
      ))}
    </TabBar>
  )
}