import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AdminPanel = ({ onClose, currentUserProfile }) => {
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
  };

  const createUser = async (e) => {
    e.preventDefault();
    
    if (!newUserEmail || !newUserPassword) {
      alert('Please enter email and password');
      return;
    }

    if (newUserPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Call Supabase Edge Function to create user
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          display_name: newUserName || null
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ User created successfully!\n\nEmail: ${newUserEmail}\nPassword: ${newUserPassword}\n\n⚠️ Copy these credentials and send them to the user before closing this dialog.`);
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserName('');
        loadUsers();
      } else {
        alert('Error: ' + (result.error || 'Failed to create user'));
      }
    } catch (err) {
      alert('Error creating user: ' + err.message);
    }

    setLoading(false);
  };

  const toggleAdmin = async (userId, currentStatus, userEmail) => {
    if (!confirm(`${currentStatus ? 'Remove' : 'Grant'} admin privileges for ${userEmail}?`)) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId);

    if (error) {
      alert('Error updating admin status: ' + error.message);
    } else {
      loadUsers();
    }
  };

  const deleteUser = async (userId, email) => {
    if (!confirm(`⚠️ Delete user "${email}"?\n\nThis will permanently delete:\n- Their account\n- Their profile\n\nThis cannot be undone.`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (response.ok) {
        alert('✅ User deleted successfully');
        loadUsers();
      } else {
        const result = await response.json();
        alert('Error: ' + (result.error || 'Failed to delete user'));
      }
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  };

  const panelStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '900px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    marginBottom: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  };

  const buttonStyle = (color = '#6366f1') => ({
    padding: '0.5rem 1rem',
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  });

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>👨‍💼 Admin Panel - User Management</h2>

        <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Create New User</h3>
          <form onSubmit={createUser}>
            <input
              type="text"
              placeholder="Display Name (optional)"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Email *"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              style={inputStyle}
              required
            />
            <input
              type="password"
              placeholder="Password (min 6 characters) *"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              style={inputStyle}
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ ...buttonStyle(), opacity: loading ? 0.5 : 1, width: '100%' }}
            >
              {loading ? 'Creating User...' : '✅ Create User'}
            </button>
          </form>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', marginBottom: 0 }}>
            💡 <strong>Important:</strong> Copy the email and password from the success message and send them to the new user.
          </p>
        </div>

        <h3 style={{ marginBottom: '1rem' }}>Existing Users ({users.length})</h3>
        
        {users.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No users yet</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '700' }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '700' }}>Email</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '700' }}>Admin</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '700' }}>Created</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '700' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>{user.display_name || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>{user.email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => toggleAdmin(user.id, user.is_admin, user.email)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: user.is_admin ? '#10b981' : '#94a3b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}
                      >
                        {user.is_admin ? '✅ Admin' : 'Make Admin'}
                      </button>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => deleteUser(user.id, user.email)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={onClose}
          style={{ ...buttonStyle('#64748b'), marginTop: '2rem' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
