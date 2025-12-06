import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度必须至少为6个字符');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('注册成功！正在跳转到登录页面...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || '注册失败');
      }
    } catch (err) {
      setError('发生错误');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
      <h1>注册</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>用户名:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 5 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>密码:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 5 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>确认密码:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 5 }}
          />
        </div>
        <button type="submit" style={{ padding: 10, width: '100%' }}>
          注册
        </button>
        <p style={{ marginTop: 20, textAlign: 'center' }}>
          已经有账号？ <a href="/login">立即登录</a>
        </p>
      </form>
    </div>
  );
}

// 添加metadata
export async function getStaticProps() {
  return {
    props: {
      metadata: {
        title: '注册 - 博彩网站',
        language: 'zh-cn',
      },
    },
  };
}