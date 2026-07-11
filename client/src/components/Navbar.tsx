import { useState } from 'react';
import { LogOut, CheckSquare, Trash2, Sun, Moon } from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';
import { deleteAccount } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
    userEmail?: string;
    onLogout?: () => void;
}

export default function Navbar({ userEmail, onLogout }: NavbarProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const isAuthenticated = Boolean(userEmail && onLogout);

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await deleteAccount();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        } catch (err) {
            setDeleting(false);
            alert(axios.isAxiosError(err) ? err.response?.data?.message ?? 'Failed to delete account' : 'Failed to delete account');
        }
    };

    return (
        <>
            <nav
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 24px',
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-color)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckSquare size={22} strokeWidth={2.2} color="var(--accent)" />
                    <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
                        FocusHub
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={toggleTheme}
                        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        style={{
                            background: 'var(--input-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 8,
                            width: 34,
                            height: 34,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                        }}
                    >
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>

                    {isAuthenticated && (
                        <>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{userEmail}</span>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                title="Delete account"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                            >
                                <Trash2 size={16} />
                            </button>

                            <button
                                onClick={onLogout}
                                className="btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13 }}
                            >
                                <LogOut size={14} /> Logout
                            </button>
                        </>
                    )}
                </div>
            </nav>

            {showDeleteModal && (
                <DeleteAccountModal
                    onConfirm={handleDeleteAccount}
                    onCancel={() => setShowDeleteModal(false)}
                    loading={deleting}
                />
            )}
        </>
    );
}