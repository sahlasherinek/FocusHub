import { useState, type FormEvent } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { loginOrRegister } from '../services/api';
import { isValidEmail } from '../utils/validation';
import axios from 'axios';

interface AuthCardProps {
    onAuthSuccess: (token: string, user: { id: string; email: string; role: string }) => void;
}


export default function AuthCard({ onAuthSuccess }: AuthCardProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);
    const [loading, setLoading] = useState(false);

    const emailIsValid = email.trim() === '' || isValidEmail(email);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password) {
            setError('Please enter both email and password');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const data = await loginOrRegister(email.trim(), password);
            onAuthSuccess(data.token, data.user); // AuthProvider's login() now handles sessionStorage internally
        } catch (err) {
            setError(axios.isAxiosError(err) ? err.response?.data?.message ?? 'Authentication failed' : 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: 36 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>FocusHub</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                    Sign in or register automatically
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setEmailTouched(true)}
                                className={`input-field ${emailTouched && !emailIsValid ? 'input-error' : ''}`}
                                style={{ paddingLeft: 42 }}
                                autoComplete="email"
                            />
                        </div>
                        {emailTouched && !emailIsValid && (
                            <p style={{ color: 'var(--status-urgent)', fontSize: 12, marginTop: 6 }}>
                                That doesn't look like a valid email address
                            </p>
                        )}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-secondary)' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            style={{ paddingLeft: 42 }}
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div
                            style={{
                                color: 'var(--status-urgent)',
                                fontSize: 13,
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '8px 12px',
                                borderRadius: 8,
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Loader2 size={16} className="spin" /> Please wait...
                            </span>
                        ) : (
                            'Continue'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}