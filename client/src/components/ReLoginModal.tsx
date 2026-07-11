import { useState, FormEvent } from 'react';
import axios from 'axios';
import { Lock } from 'lucide-react';
import { loginOrRegister } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ReLoginModalProps {
    userEmail: string;
}

export default function ReLoginModal({ userEmail }: ReLoginModalProps) {
    const { resumeSession, logout } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await loginOrRegister(userEmail, password);
            resumeSession(data.token, data.user);
        } catch (err) {
            setError(axios.isAxiosError(err) ? err.response?.data?.message ?? 'Incorrect password' : 'Incorrect password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16,
            }}
        >
            <div className="glass-card" style={{ maxWidth: 360, width: '100%', padding: 28 }}>
                <h2 style={{ margin: '0 0 6px', fontSize: 18 }}>Session expired</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                    Sign back in as <strong>{userEmail}</strong> to keep going.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-secondary)' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            style={{ paddingLeft: 42 }}
                            autoFocus
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div style={{ color: 'var(--status-urgent)', fontSize: 13 }}>{error}</div>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading || !password}>
                        {loading ? 'Signing in...' : 'Continue'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={logout}>
                        Log out instead
                    </button>
                </form>
            </div>
        </div>
    );
}