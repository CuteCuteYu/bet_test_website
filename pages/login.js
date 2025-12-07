import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.is_admin) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setError(data.message || '登录失败');
      }
    } catch (err) {
      setError('发生错误');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f9f7',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        maxWidth: 400,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 40,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ marginBottom: 30, textAlign: 'center' }}>
          <h1 style={{ 
            color: '#1B5E20', 
            fontSize: '2rem',
            margin: 0,
            fontWeight: 'bold'
          }}>登录博彩网站</h1>
          <p style={{ color: '#666', margin: '10px 0 0 0' }}>欢迎回来，请输入您的账号信息</p>
        </div>
        
        {error && (
          <div style={{ 
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: 12,
            borderRadius: 5,
            marginBottom: 20,
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block',
              marginBottom: 8,
              color: '#333',
              fontSize: '1rem',
              fontWeight: '500'
            }}>用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ 
                width: '100%',
                padding: 12,
                border: '2px solid #e0e0e0',
                borderRadius: 5,
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.borderColor = '#4CAF50'}
              onBlur={(e) => e.target.borderColor = '#e0e0e0'}
              placeholder="请输入用户名"
            />
          </div>
          
          <div style={{ marginBottom: 30 }}>
            <label style={{ 
              display: 'block',
              marginBottom: 8,
              color: '#333',
              fontSize: '1rem',
              fontWeight: '500'
            }}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%',
                padding: 12,
                border: '2px solid #e0e0e0',
                borderRadius: 5,
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.borderColor = '#4CAF50'}
              onBlur={(e) => e.target.borderColor = '#e0e0e0'}
              placeholder="请输入密码"
            />
          </div>
          
          <button 
            type="submit" 
            style={{ 
              width: '100%',
              padding: 15,
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
          >
            登录
          </button>
          
          <p style={{ 
            marginTop: 25, 
            textAlign: 'center',
            color: '#666',
            fontSize: '0.95rem'
          }}>
            还没有账号？ <a href="/register" style={{ 
              color: '#4CAF50',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'color 0.3s ease'
            }} onMouseEnter={(e) => e.target.color = '#45a049'}>
              立即注册
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

// 移除不兼容的metadata API，使用Next.js Pages Router的方式
// 在Next.js Pages Router中，metadata通常通过next/head组件设置