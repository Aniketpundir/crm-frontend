import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAPI } from '../../services/api';
import './Login.css';
import './Register.css';

const ROLES = [
    { value: 'admin', label: 'Admin', icon: '👑', desc: 'Full system access' },
    { value: 'employee', label: 'Employee', icon: '👤', desc: 'Task & project access' },
    { value: 'client', label: 'Client', icon: '🏢', desc: 'View project progress' },
];

const DEPARTMENTS = ['Development', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Management'];

export default function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // step 1: role select, step 2: details
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({
        role: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        department: '',
        company: '',
    });

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const selectRole = (role) => {
        setForm(f => ({ ...f, role }));
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                phone: form.phone,
                department: form.role === 'employee' ? form.department : '',
            };
            await registerAPI(payload);
            setSuccess(`✓ ${form.name} registered successfully as ${form.role}!`);
            // Reset for next registration
            setForm({ role: '', name: '', email: '', password: '', confirmPassword: '', phone: '', department: '', company: '' });
            setStep(1);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectedRole = ROLES.find(r => r.value === form.role);

    return (
        <div className="register-page">
            <div className="register-card">

                {/* Header */}
                <div className="register-header">
                    <div className="login-logo">
                        <div className="logo-icon">C</div>
                        <span>CRM System</span>
                    </div>
                    <h1 className="login-title">Register New User</h1>
                    <p className="login-sub">
                        {step === 1 ? 'Step 1 of 2 — Select user role' : `Step 2 of 2 — Fill details for ${selectedRole?.label}`}
                    </p>
                </div>

                {/* Step indicators */}
                <div className="step-indicator">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className="step-line" />
                    <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                </div>

                {/* Success message */}
                {success && (
                    <div className="alert alert-success" style={{ marginBottom: 16 }}>
                        {success}
                        <div style={{ marginTop: 8, fontSize: 12 }}>
                            Aap aur register kar sakte hain ya{' '}
                            <span className="link-text" onClick={() => navigate('/login')}>login kar sakte hain →</span>
                        </div>
                    </div>
                )}

                {error && <div className="alert alert-error">{error}</div>}

                {/* STEP 1: Role Selection */}
                {step === 1 && (
                    <div className="role-selection">
                        <p className="role-hint">Kaun register ho raha hai?</p>
                        <div className="role-cards">
                            {ROLES.map(role => (
                                <button key={role.value} className="role-card" onClick={() => selectRole(role.value)}>
                                    <div className="role-card-icon">{role.icon}</div>
                                    <div className="role-card-label">{role.label}</div>
                                    <div className="role-card-desc">{role.desc}</div>
                                    <div className="role-card-arrow">→</div>
                                </button>
                            ))}
                        </div>
                        <div className="register-footer-link">
                            Already registered? <Link to="/login">Login here</Link>
                        </div>
                    </div>
                )}

                {/* STEP 2: Details Form */}
                {step === 2 && (
                    <form onSubmit={handleSubmit} className="register-form">

                        {/* Role badge */}
                        <div className="selected-role-badge">
                            <span>{selectedRole?.icon}</span>
                            <span>Registering as: <strong>{selectedRole?.label}</strong></span>
                            <button type="button" className="change-role-btn" onClick={() => setStep(1)}>Change</button>
                        </div>

                        {/* Common Fields */}
                        <div className="form-section-title">Personal Information</div>

                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                className="form-control"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Rahul Sharma"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address *</label>
                            <input
                                className="form-control"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="e.g. rahul@company.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                className="form-control"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="e.g. +91 98765 43210"
                            />
                        </div>

                        {/* Employee-only fields */}
                        {form.role === 'employee' && (
                            <div className="form-group">
                                <label>Department</label>
                                <select className="form-control" name="department" value={form.department} onChange={handleChange}>
                                    <option value="">Select Department</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        )}

                        {/* Client-only fields */}
                        {form.role === 'client' && (
                            <div className="form-group">
                                <label>Company Name</label>
                                <input
                                    className="form-control"
                                    name="company"
                                    value={form.company}
                                    onChange={handleChange}
                                    placeholder="e.g. ABC Pvt. Ltd."
                                />
                            </div>
                        )}

                        {/* Password */}
                        <div className="form-section-title" style={{ marginTop: 8 }}>Set Password</div>

                        <div className="form-group">
                            <label>Password *</label>
                            <input
                                className="form-control"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Min 6 characters"
                                required
                            />
                            {/* Password strength */}
                            {form.password && (
                                <div className="password-strength">
                                    <div className="strength-bars">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className={`strength-bar ${getStrength(form.password) >= i ? `strength-${getStrengthLevel(form.password)}` : ''}`} />
                                        ))}
                                    </div>
                                    <span className="strength-label">{getStrengthText(form.password)}</span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Confirm Password *</label>
                            <input
                                className="form-control"
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter password"
                                required
                            />
                            {form.confirmPassword && (
                                <div className={`password-match ${form.password === form.confirmPassword ? 'match' : 'no-match'}`}>
                                    {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="register-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                            <button type="submit" className="btn btn-primary register-btn" disabled={loading}>
                                {loading ? 'Registering...' : `Register ${selectedRole?.label}`}
                            </button>
                        </div>

                        <div className="register-footer-link" style={{ marginTop: 16 }}>
                            Already registered? <Link to="/login">Login here</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// Password strength helpers
function getStrength(pwd) {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9!@#$%^&*]/.test(pwd)) score++;
    return score;
}
function getStrengthLevel(pwd) {
    const s = getStrength(pwd);
    if (s <= 1) return 'weak';
    if (s === 2) return 'fair';
    if (s === 3) return 'good';
    return 'strong';
}
function getStrengthText(pwd) {
    const s = getStrength(pwd);
    if (s <= 1) return 'Weak';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Good';
    return 'Strong';
}
