import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Layout } from '@/components/Layout'

export default function App({ Component, pageProps }: AppProps) {
  // 可以通过页面组件的自定义属性来控制是否显示标签栏
  const showTabBar = (Component as any).showTabBar

  return (
    <Layout showTabBar={showTabBar}>
      <Component {...pageProps} />
    </Layout>
  )
}
