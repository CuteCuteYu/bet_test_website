import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Admin() {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [isAddingMatch, setIsAddingMatch] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBets, setUserBets] = useState([]);
  const [selectedMatchForResult, setSelectedMatchForResult] = useState(null);
  const [winner, setWinner] = useState('');
  const router = useRouter();

  // 比赛表单状态
  const [matchForm, setMatchForm] = useState({
    match_name: '',
    team1: '',
    team2: '',
    odd1: '',
    odd2: '',
  });

  // 用户余额更新状态
  const [userBalanceUpdate, setUserBalanceUpdate] = useState({
    user_id: '',
    balance: '',
  });

  // 获取用户押注历史
  const fetchUserBets = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/bets`);
      const data = await res.json();
      setUserBets(data);
      setSelectedUser(userId);
    } catch (err) {
      setMessage('获取用户押注历史失败');
    }
  };

  // 处理比赛结果结算
  const handleSetMatchResult = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`/api/admin/matches/${selectedMatchForResult}/result`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winner }),
      });

      if (res.ok) {
        setMessage('比赛结果处理成功');
        fetchMatches();
        setSelectedMatchForResult(null);
        setWinner('');
      } else {
        const data = await res.json();
        setMessage(data.message || '处理比赛结果失败');
      }
    } catch (err) {
      setMessage('发生错误');
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchUsers();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/admin/matches');
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      setMessage('获取比赛列表失败');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setMessage('获取用户列表失败');
    }
  };

  const handleMatchSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const method = editingMatch ? 'PUT' : 'POST';
      const url = editingMatch ? `/api/admin/matches/${editingMatch}` : '/api/admin/matches';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchForm),
      });

      if (res.ok) {
        setMessage('比赛保存成功');
        fetchMatches();
        setMatchForm({ match_name: '', team1: '', team2: '', odd1: '', odd2: '' });
        setIsAddingMatch(false);
        setEditingMatch(null);
      } else {
        const data = await res.json();
        setMessage(data.message || '保存比赛失败');
      }
    } catch (err) {
      setMessage('发生错误');
    }
  };

  const handleEditMatch = (match) => {
    setEditingMatch(match.id);
    setMatchForm({
      match_name: match.match_name,
      team1: match.team1,
      team2: match.team2,
      odd1: match.odd1.toString(),
      odd2: match.odd2.toString(),
    });
    setIsAddingMatch(true);
  };

  // 删除比赛处理函数
  const handleDeleteMatch = async (matchId) => {
    if (confirm('确定要删除这个比赛吗？相关的押注记录也会被删除。')) {
      try {
        const res = await fetch(`/api/admin/matches/${matchId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          setMessage('比赛删除成功');
          fetchMatches();
        } else {
          const data = await res.json();
          setMessage(data.message || '删除比赛失败');
        }
      } catch (err) {
        setMessage('发生错误');
      }
    }
  };

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`/api/admin/users/${userBalanceUpdate.user_id}/balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ balance: parseFloat(userBalanceUpdate.balance) }),
      });

      if (res.ok) {
        setMessage('余额更新成功');
        fetchUsers();
        setUserBalanceUpdate({ user_id: '', balance: '' });
      } else {
        const data = await res.json();
        setMessage(data.message || '更新余额失败');
      }
    } catch (err) {
      setMessage('发生错误');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h1>管理面板</h1>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>管理博彩网站</h2>
        <button onClick={() => router.push('/login')} style={{ padding: 10 }}>
          退出登录
        </button>
      </div>
      {message && <p style={{ color: message.includes('成功') ? 'green' : 'red', marginBottom: 20 }}>{message}</p>}

      {/* 比赛管理 */}
      <div style={{ marginBottom: 40 }}>
        <h2>管理比赛</h2>
        <button
          onClick={() => setIsAddingMatch(!isAddingMatch)}
          style={{ padding: 10, marginBottom: 20 }}
        >
          {isAddingMatch ? '取消' : '添加新比赛'}
        </button>

        {isAddingMatch && (
          <div style={{ marginBottom: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
            <h3>{editingMatch ? '编辑比赛' : '添加新比赛'}</h3>
            <form onSubmit={handleMatchSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label>比赛名称:</label>
                  <input
                    type="text"
                    value={matchForm.match_name}
                    onChange={(e) => setMatchForm({ ...matchForm, match_name: e.target.value })}
                    required
                    style={{ width: '100%', padding: 8, marginTop: 5 }}
                  />
                </div>
                <div>
                  <label>队伍1:</label>
                  <input
                    type="text"
                    value={matchForm.team1}
                    onChange={(e) => setMatchForm({ ...matchForm, team1: e.target.value })}
                    required
                    style={{ width: '100%', padding: 8, marginTop: 5 }}
                  />
                </div>
                <div>
                  <label>队伍2:</label>
                  <input
                    type="text"
                    value={matchForm.team2}
                    onChange={(e) => setMatchForm({ ...matchForm, team2: e.target.value })}
                    required
                    style={{ width: '100%', padding: 8, marginTop: 5 }}
                  />
                </div>
                <div>
                  <label>队伍1赔率:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.00"
                    value={matchForm.odd1}
                    onChange={(e) => setMatchForm({ ...matchForm, odd1: e.target.value })}
                    required
                    style={{ width: '100%', padding: 8, marginTop: 5 }}
                  />
                </div>
                <div>
                  <label>队伍2赔率:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.00"
                    value={matchForm.odd2}
                    onChange={(e) => setMatchForm({ ...matchForm, odd2: e.target.value })}
                    required
                    style={{ width: '100%', padding: 8, marginTop: 5 }}
                  />
                </div>
              </div>
              <button type="submit" style={{ padding: 10 }}>{editingMatch ? '更新' : '添加'}比赛</button>
            </form>
          </div>
        )}

        <h3>现有比赛</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {matches.map((match) => (
            <div key={match.id} style={{ border: '1px solid #ccc', padding: 15, borderRadius: 5 }}>
              <h4>{match.match_name}</h4>
              <p>{match.team1} vs {match.team2}</p>
              <p>赔率: {match.team1} - {match.odd1}, {match.team2} - {match.odd2}</p>
              <p>状态: {match.status === 'pending' ? '待开始' : match.status === 'completed' ? '已完成' : match.status}</p>
              <p>{match.status === 'completed' && `获胜队伍: ${match.winner === 'team1' ? match.team1 : match.team2}`}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                <button onClick={() => handleEditMatch(match)} style={{ 
                  flex: 1,
                  padding: 8,
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 5,
                  cursor: 'pointer'
                }}>
                  编辑
                </button>
                {match.status === 'pending' && (
                  <button 
                    onClick={() => {
                      setSelectedMatchForResult(match.id);
                      setWinner('');
                    }} 
                    style={{ 
                      flex: 1,
                      padding: 8,
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: 5,
                      cursor: 'pointer'
                    }}
                  >
                    设置结果
                  </button>
                )}
                {match.status === 'pending' && (
                  <button 
                    onClick={async () => {
                      if (confirm('确定要封盘该比赛吗？封盘后将不允许用户继续下注。')) {
                        try {
                          const res = await fetch(`/api/admin/matches/${match.id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ action: 'lock' }),
                          });
                          if (res.ok) {
                            setMessage('比赛封盘成功');
                            fetchMatches();
                          } else {
                            const data = await res.json();
                            setMessage(data.message || '封盘失败');
                          }
                        } catch (err) {
                          setMessage('发生错误');
                        }
                      }
                    }} 
                    style={{ 
                      flex: 1,
                      padding: 8,
                      backgroundColor: '#FF9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: 5,
                      cursor: 'pointer'
                    }}
                  >
                    封盘
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteMatch(match.id)} 
                  style={{ 
                    flex: 1,
                    padding: 8,
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: 5,
                    cursor: 'pointer'
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 设置比赛结果表单 */}
        {selectedMatchForResult && (
          <div style={{ marginTop: 30, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
            <h3>设置比赛结果</h3>
            <form onSubmit={handleSetMatchResult}>
              <div style={{ marginBottom: 10 }}>
                <label>选择获胜队伍:</label>
                <select
                  value={winner}
                  onChange={(e) => setWinner(e.target.value)}
                  required
                  style={{ width: '100%', padding: 8, marginTop: 5 }}
                >
                  <option value="">选择获胜队伍</option>
                  {matches.find(m => m.id === selectedMatchForResult) && (
                    <>
                      <option value="team1">{matches.find(m => m.id === selectedMatchForResult).team1}</option>
                      <option value="team2">{matches.find(m => m.id === selectedMatchForResult).team2}</option>
                    </>
                  )}
                </select>
              </div>
              <button type="submit" style={{ padding: 10 }}>处理结果</button>
            </form>
          </div>
        )}
      </div>

      {/* 用户余额管理 */}
      <div>
        <h2>管理用户余额</h2>
        <div style={{ marginBottom: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
          <h3>更新用户余额</h3>
          <form onSubmit={handleUpdateBalance}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label>选择用户:</label>
                <select
                  value={userBalanceUpdate.user_id}
                  onChange={(e) => setUserBalanceUpdate({ ...userBalanceUpdate, user_id: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8, marginTop: 5 }}
                >
                  <option value="">选择用户</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} (当前余额: $${typeof user.balance === 'number' ? user.balance.toFixed(2) : parseFloat(user.balance || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>新余额:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  value={userBalanceUpdate.balance}
                  onChange={(e) => setUserBalanceUpdate({ ...userBalanceUpdate, balance: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8, marginTop: 5 }}
                />
              </div>
            </div>
            <button type="submit" style={{ padding: 10 }}>更新余额</button>
          </form>
        </div>

        <h3>用户列表</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>ID</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>用户名</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>余额</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>管理员</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{user.id}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{user.username}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>${typeof user.balance === 'number' ? user.balance.toFixed(2) : parseFloat(user.balance || 0).toFixed(2)}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{user.is_admin ? '是' : '否'}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  <button onClick={() => fetchUserBets(user.id)} style={{ marginRight: 10, padding: 8 }}>
                    查看押注
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 用户押注历史 */}
        {selectedUser && (
          <div style={{ marginTop: 30 }}>
            <h3>用户押注历史</h3>
            {userBets.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>押注ID</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>比赛名称</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>队伍1</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>队伍2</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>押注队伍</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>押注金额</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>赔率</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>状态</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>押注时间</th>
                  </tr>
                </thead>
                <tbody>
                  {userBets.map((bet) => (
                    <tr key={bet.id}>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>{bet.id}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>{bet.match_name}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>{bet.team1}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>{bet.team2}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>{bet.team === 'team1' ? bet.team1 : bet.team2}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>${typeof bet.amount === 'number' ? bet.amount.toFixed(2) : parseFloat(bet.amount || 0).toFixed(2)}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>{typeof bet.odd === 'number' ? bet.odd.toFixed(2) : parseFloat(bet.odd || 0).toFixed(2)}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>{bet.status === 'pending' ? '待结算' : bet.status === 'won' ? '获胜' : '失败'}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>{new Date(bet.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>该用户没有押注历史。</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 添加metadata
export async function getStaticProps() {
  return {
    props: {
      metadata: {
        title: '管理面板 - 博彩网站',
        language: 'zh-cn',
      },
    },
  };
}