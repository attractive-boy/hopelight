import { NavBar, Swiper } from 'antd-mobile'
import { BellOutline, UserOutline } from 'antd-mobile-icons'
import { GetServerSideProps } from 'next';
import db from '@/db';

interface Banner {
  image_url: string;
}

interface Notice {
  title: string;
  subtitle: string;
}

interface Article {
  title: string;
  image_url: string;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const banners = await db('banners')
    .select('image_url')
    .where('status', 1)
    .orderBy('sort', 'asc');

  const notices = await db('notices')
    .select('title', 'subtitle')
    .where('status', 1)
    .orderBy('sort', 'asc');

  const articles = await db('articles')
    .select('title', 'image_url')
    .where('status', 1)
    .orderBy('sort', 'asc');

  return {
    props: {
      banners,
      notices,
      articles
    }
  };
};



export default function IndexPage({ banners, notices, articles }: { banners: Banner[], notices: Notice[], articles: Article[] }) {
  return (
    <>
      <NavBar 
        left={<BellOutline style={{color: '#fff', fontSize: 24}} />}
        right={<UserOutline style={{color: '#fff', fontSize: 24}} />}
        back={null}
        style={{
          color: '#fff',
          borderBottom: '1px solid white',
          marginBottom: '10px'
        }}
      >
        希望之光
      </NavBar>
      <Swiper autoplay loop style={{ width: '90%', height: '200px', margin: '0 auto' }}>
        {banners.map((banner, index) => (
          <Swiper.Item key={index}>
            <div style={{ width: '100%', height: '100%' }}>
              <img 
                src={banner.image_url} 
                alt={`banner${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </Swiper.Item>
        ))}
      </Swiper>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '15px 20px',
        paddingTop: '40px',
        margin: '10px 5%',
        marginTop: '40px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        position: 'relative'
      }}>
        <div style={{
          width: '120px',
          height: '40px',
          background: 'rgb(83, 225, 255)',
          clipPath: 'polygon(10% 0, 90% 0, 80% 100%, 20% 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', 
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          position: 'absolute',
          padding: '20px',
          left: '50%',
          top: '0',
          transform: 'translate(-50%, -20%)',
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }}>
          希望之光
        </div>
        <Swiper
          direction='vertical'
          autoplay
          loop
          indicator={false}
          style={{
            flex: 1,
            height: '40px'
          }}
        >
          {notices.map((notice, index) => (
            <Swiper.Item key={index}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%'
                }}>
                  <div style={{
                    color: '#fff', 
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {notice.title}
                  </div>
                  <div style={{
                    marginLeft: '15px',
                    color: '#ccc',
                    fontSize: '14px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap', 
                    textOverflow: 'ellipsis',
                    textAlign: 'center'
                  }}>
                    {notice.subtitle}
                  </div>

                  <div style={{
                    color: '#fff',
                    fontSize: '14px',
                    marginLeft: '15px'
                  }}>
                    查看更多
                  </div>
                </div>
              </div>
            </Swiper.Item>
          ))}
        </Swiper>
      </div>
      <div style={{
        padding: '20px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '5px',
          color: '#ccc'
        }}>
          希望之光学院
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px'
        }}>
          {articles.map((article, index) => (
            <div key={index} style={{
              background: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '100%',
                height: '120px',
                background: '#f5f5f5'
              }}>
                <img 
                  src={article.image_url}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  alt={article.title}
                />
              </div>
              <div style={{
                padding: '10px'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  textAlign: 'center'
                }}>
                  {article.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

IndexPage.showTabBar = true