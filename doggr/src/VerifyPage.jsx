import { useState } from 'react';
import axios from 'axios';

function EmailVerification() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // Assuming your Express endpoint is /verify and expecting POST
            const response = await axios.post('http://localhost:3000/verify', { email, password, code });
            setSuccess(response.data.message);
        } catch (err) {
            setError(err.response ? err.response.data.error : 'An unknown error occurred');
        }
    };

    return (
        <div>
            <h2>Verify Your Email</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <label>Email:
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </label>
                <br />
                <label>Password:
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </label>
                <br />
                <label>Code:
                    <input type="text" value={code} maxLength="6" onChange={e => setCode(e.target.value)} required />
                </label>
                <br />
                <button type="submit">Verify Email</button>
            </form>
        </div>
    );
}

export default EmailVerification;
