import { NavBar, Button, ImageUploader, Toast } from 'antd-mobile';
import { useState } from 'react';
import { useRouter } from 'next/router';
import type { ImageUploadItem } from 'antd-mobile/es/components/image-uploader';
import { request } from '@/utils/request';

export default function DebtEntryPage() {
  const router = useRouter();
  const { type, typeName } = router.query; // 从路由获取债务类型

  const [amount, setAmount] = useState<string>('');
  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);

  // 图片上传处理
  const handleUpload = async (file: File): Promise<ImageUploadItem> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await request<{
        success: boolean;
        data: {
          url: string;
        };
      }>('/api/upload', {
        method: 'POST',
        body: formData,
        noContentType: true,
      });

      if (!res.success) {
        throw new Error('上传失败');
      }

      return {
        url: res.data.url
      };
    } catch (error) {
      Toast.show({
        content: '图片上传失败',
        icon: 'fail'
      });
      throw error;
    }
  };

  // 提交处理
  const handleSubmit = async () => {
    if (!amount) {
      Toast.show({
        content: '请输入债务金额',
        icon: 'fail',
      });
      return;
    }

    if (fileList.length === 0) {
      Toast.show({
        content: '请上传债务凭证',
        icon: 'fail',
      });
      return;
    }

    try {
      const res = await request('/api/debtcreate', {
        method: 'POST',
        body: JSON.stringify({
          type,
          amount: Number(amount),
          evidence_url: fileList[0].url
        })
      });

      Toast.show({
        icon: 'success',
        content: '提交成功'
      });
      router.back();
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: '提交失败'
      });
    }
  };

  return (
    <>
      <NavBar 
        onBack={() => router.back()}
        style={{
          color: '#fff',
          borderBottom: '1px solid white',
          backgroundColor: '#343c6d'
        }}
      >
        录入债务
      </NavBar>

      <div style={{ 
        backgroundColor: '#343c6d',
        minHeight: '100vh',
        color: '#fff',
        padding: '20px'
      }}>
        {/* 债务类型 */}
        <div style={{
          background: '#4a5280',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '15px'
        }}>
          <div style={{ opacity: 0.8 }}>债务类型</div>
          <div style={{ marginTop: '8px' }}>{typeName}</div>
        </div>

        {/* 债务金额 */}
        <div style={{
          background: '#4a5280',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '15px'
        }}>
          <div style={{ opacity: 0.8 }}>债务金额</div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="请输入债务金额"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '16px',
              width: '100%',
              marginTop: '8px',
              outline: 'none'
            }}
          />
        </div>

        {/* 上传凭证 */}
        <div style={{
          background: '#4a5280',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '30px'
        }}>
          <div style={{ opacity: 0.8, marginBottom: '10px' }}>上传债务凭证</div>
          <ImageUploader
            value={fileList}
            onChange={setFileList}
            upload={handleUpload}
            multiple={false}
            maxCount={1}
            style={{
              '--cell-size': '80px',
            }}
          />
        </div>

        {/* 提交按钮 */}
        <Button
          block
          color='primary'
          onClick={handleSubmit}
          style={{
            backgroundColor: '#4a5280',
            border: 'none'
          }}
        >
          提交审核
        </Button>
      </div>
    </>
  );
}