import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [balance, setBalance] = useState(0.00);
  const [betAmount, setBetAmount] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchMatches();
    fetchUserInfo();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      setMessage('获取比赛列表失败');
    }
  };

  const fetchUserInfo = async () => {
    try {
      const res = await fetch('/api/user-info');
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
        setUsername(data.username);
      } else {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    }
  };

  const handleBet = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!selectedMatch || !selectedTeam || !betAmount) {
      setMessage('请选择比赛、队伍并输入金额');
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) {
      setMessage('无效的押注金额');
      return;
    }

    try {
      const res = await fetch('/api/bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          match_id: selectedMatch,
          team: selectedTeam,
          amount: amount,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('押注成功');
        setBalance(data.new_balance);
        setBetAmount('');
        setSelectedMatch(null);
        setSelectedTeam(null);
        fetchMatches();
      } else {
        setMessage(data.message || '押注失败');
      }
    } catch (err) {
      setMessage('发生错误');
    }
  };

  return (
    <div style={{ 
      maxWidth: 1000, 
      margin: '0 auto', 
      padding: 20,
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f9f7',
      minHeight: '100vh'
    }}>
      {/* 头部 */}
      <header style={{ 
        backgroundColor: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
        padding: 20,
        borderRadius: 10,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: 30
      }}>
        <h1 style={{ 
          color: '#1B5E20', 
          margin: 0,
          fontSize: '2.5rem',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>博彩网站</h1>
      </header>

      {/* 用户信息 */}
      <div style={{ 
        marginBottom: 20, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div>
            <p style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>欢迎, <strong>{username}</strong></p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>当前余额:</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>${balance.toFixed(2)}</p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/login')} 
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
        >
          退出登录
        </button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div style={{ 
          padding: 15, 
          borderRadius: 5, 
          marginBottom: 20,
          color: 'white',
          backgroundColor: message.includes('成功') ? '#4CAF50' : '#f44336',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          {message}
        </div>
      )}

      {/* 即将进行的比赛 */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ 
          color: '#333', 
          fontSize: '2rem',
          marginBottom: 20,
          textAlign: 'center',
          color: '#4CAF50'
        }}>即将进行的比赛</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: 25,
          marginBottom: 30
        }}>
          {matches.filter(match => match.status === 'pending').map((match) => (
            <div key={match.id} style={{ 
              backgroundColor: 'white',
              padding: 20, 
              borderRadius: 10,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ 
                color: '#333',
                marginTop: 0,
                marginBottom: 15,
                fontSize: '1.5rem'
              }}>{match.match_name}</h3>
              <div style={{ marginBottom: 15 }}>
                <p style={{ fontSize: '1.2rem', margin: '10px 0', color: '#555' }}>{match.team1} vs {match.team2}</p>
                <p style={{ margin: '10px 0', color: '#666' }}>赔率: {match.team1} - <strong>{match.odd1}</strong>, {match.team2} - <strong>{match.odd2}</strong></p>
                <p style={{ margin: '10px 0', color: '#888' }}>状态: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{match.status === 'pending' ? '待开始' : match.status}</span></p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => {
                    setSelectedMatch(match.id);
                    setSelectedTeam('team1');
                  }}
                  style={{ 
                    flex: 1,
                    padding: 12,
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: 5,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                >
                  押注 {match.team1} ({match.odd1})
                </button>
                <button
                  onClick={() => {
                    setSelectedMatch(match.id);
                    setSelectedTeam('team2');
                  }}
                  style={{ 
                    flex: 1,
                    padding: 12,
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: 5,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                >
                  押注 {match.team2} ({match.odd2})
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 封盘区 */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ 
          color: '#333', 
          fontSize: '2rem',
          marginBottom: 20,
          textAlign: 'center',
          color: '#FF9800'
        }}>封盘区</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: 25,
          marginBottom: 30
        }}>
          {matches.filter(match => match.status === 'locked').map((match) => (
            <div key={match.id} style={{ 
              backgroundColor: 'white',
              padding: 20, 
              borderRadius: 10,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              opacity: 0.9
            }}>
              <h3 style={{ 
                color: '#333',
                marginTop: 0,
                marginBottom: 15,
                fontSize: '1.5rem'
              }}>{match.match_name}</h3>
              <div style={{ marginBottom: 15 }}>
                <p style={{ fontSize: '1.2rem', margin: '10px 0', color: '#555' }}>{match.team1} vs {match.team2}</p>
                <p style={{ margin: '10px 0', color: '#666' }}>赔率: {match.team1} - {match.odd1}, {match.team2} - {match.odd2}</p>
                <p style={{ margin: '10px 0', color: '#888' }}>状态: <span style={{ color: '#FF9800', fontWeight: 'bold' }}>已封盘</span></p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 已完成的比赛 */}
      <section>
        <h2 style={{ 
          color: '#333', 
          fontSize: '2rem',
          marginBottom: 20,
          textAlign: 'center',
          color: '#4CAF50'
        }}>已完成的比赛</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: 25
        }}>
          {matches.filter(match => match.status === 'completed').map((match) => (
            <div key={match.id} style={{ 
              backgroundColor: 'white',
              padding: 20, 
              borderRadius: 10,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              opacity: 0.8
            }}>
              <h3 style={{ 
                color: '#333',
                margin: '0 0 15px 0',
                fontSize: '1.5rem'
              }}>{match.match_name}</h3>
              <div style={{ marginBottom: 15 }}>
                <p style={{ fontSize: '1.2rem', margin: '10px 0', color: '#555' }}>{match.team1} vs {match.team2}</p>
                <p style={{ margin: '10px 0', color: '#666' }}>赔率: {match.team1} - {match.odd1}, {match.team2} - {match.odd2}</p>
                <p style={{ margin: '10px 0', color: '#888' }}>状态: <span style={{ color: '#666', fontWeight: 'bold' }}>{match.status === 'completed' ? '已完成' : match.status}</span></p>
                <p style={{ 
                  margin: '10px 0', 
                  color: '#4CAF50',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>获胜队伍: {match.winner === 'team1' ? match.team1 : match.team2}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 确认押注表单 */}
      {selectedMatch && selectedTeam && (
        <section style={{ 
          marginTop: 40,
          backgroundColor: 'white',
          padding: 30,
          borderRadius: 10,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{ 
            color: '#333', 
            fontSize: '2rem',
            marginBottom: 25,
            textAlign: 'center',
            color: '#4CAF50'
          }}>确认押注</h2>
          <form onSubmit={handleBet} style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 5, 
                color: '#555',
                fontSize: '1.1rem'
              }}>押注金额:</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={balance}
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: 12,
                  border: '2px solid #e0e0e0',
                  borderRadius: 5,
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.borderColor = '#4CAF50'}
                onBlur={(e) => e.target.borderColor = '#e0e0e0'}
              />
            </div>
            <div style={{ marginBottom: 30 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, padding: 15, backgroundColor: '#f5f9f7', borderRadius: 5 }}>
                <p style={{ margin: 0, color: '#555' }}><strong>选择的比赛:</strong></p>
                <p style={{ margin: 0, color: '#333', fontWeight: 'bold' }}>{matches.find(m => m.id === selectedMatch)?.match_name}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, padding: 15, backgroundColor: '#f5f9f7', borderRadius: 5 }}>
                <p style={{ margin: 0, color: '#555' }}><strong>选择的队伍:</strong></p>
                <p style={{ margin: 0, color: '#333', fontWeight: 'bold' }}>{selectedTeam === 'team1' ? matches.find(m => m.id === selectedMatch)?.team1 : matches.find(m => m.id === selectedMatch)?.team2}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 15, backgroundColor: '#f5f9f7', borderRadius: 5 }}>
                <p style={{ margin: 0, color: '#555' }}><strong>赔率:</strong></p>
                <p style={{ margin: 0, color: '#4CAF50', fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedTeam === 'team1' ? matches.find(m => m.id === selectedMatch)?.odd1 : matches.find(m => m.id === selectedMatch)?.odd2}</p>
              </div>
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
                cursor: 'pointer',
                fontSize: '1.2rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
            >
              确认押注
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

// 添加metadata
export async function getStaticProps() {
  return {
    props: {
      metadata: {
        title: '博彩网站 - 首页',
        language: 'zh-cn',
      },
    },
  };
}