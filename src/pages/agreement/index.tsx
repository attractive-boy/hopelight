import { NavBar } from 'antd-mobile';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import db from '@/db';

interface AgreementPageProps {
  agreement: {
    content: string;
  }
}
export const getServerSideProps: GetServerSideProps = async () => {
  const agreement = await db('agreement').first();
  
  return {
    props: {
      agreement: {
        content: agreement?.content || ''
      }
    }
  };
};

export default function AgreementPage({ agreement }: AgreementPageProps) {
  const router = useRouter();

  return (
    <>
      <NavBar 
        onBack={() => router.back()}
        style={{
          color: '#fff',
          borderBottom: '1px solid white',
          marginBottom: '10px'
        }}
      >
        注册协议
      </NavBar>

      <div style={{
        padding: '20px',
        color: '#333',
        fontSize: '14px',
        lineHeight: '1.8'
      }}>
        <div 
          dangerouslySetInnerHTML={{ __html: agreement.content }}
        />
      </div>
    </>
  );
}