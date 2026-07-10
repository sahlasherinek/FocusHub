import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteAccountModalProps {
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}

export default function DeleteAccountModal({ onConfirm, onCancel, loading }: DeleteAccountModalProps) {
    const [confirmText, setConfirmText] = useState('');
    const canDelete = confirmText === 'DELETE';

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                padding: 16,
            }}
            onClick={onCancel}
        >
            <div
                className="glass-card"
                style={{ maxWidth: 380, width: '100%', padding: 28 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <AlertTriangle size={20} color="var(--status-urgent)" />
                    <h2 style={{ margin: 0, fontSize: 18 }}>Delete your account?</h2>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 18 }}>
                    This permanently deletes your account and all your tasks. This action cannot be undone.
                </p>

                <p style={{ fontSize: 13, marginBottom: 8 }}>
                    Type <strong>DELETE</strong> to confirm:
                </p>

                <input
                    className="input-field"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    style={{ marginBottom: 20 }}
                />

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn-secondary" onClick={onCancel} disabled={loading}>
                        Cancel
                    </button>
                    <button className="btn-danger" onClick={onConfirm} disabled={!canDelete || loading}>
                        {loading ? 'Deleting...' : 'Delete Account'}
                    </button>
                </div>
            </div>
        </div>
    );
}