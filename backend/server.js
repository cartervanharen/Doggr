import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = 'https://oewelgbnnzgyamhpxyqs.supabase.co';
const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld2VsZ2JubnpneWFtaHB4eXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkzMzQ0MDIsImV4cCI6MjAzNDkxMDQwMn0.wrKCzM1wbzyTLwBN7xbYu2mzS2GzQ6zAWHNe9Wv1BBo`;
import jwt from 'jsonwebtoken';

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

app.get('/allusr', async (req, res) => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

app.post('/adduser', async (req, res) => {
    const { first_name, last_name, email, address, dog_name, password } = req.body;


    try {
        const { user, error: signUpError } = await supabase.auth.signUp({
            email,
            password
        });

        if (signUpError) throw signUpError;

        const { data, error } = await supabase.from('users').insert([
            {
                user_id: user.id, 
                first_name,
                last_name,
                address,
                dog_name
            }
        ]);

        if (error) throw error;

        res.status(201).json({ message: 'User created successfully', user: data });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ error: error.message });
    }
});


app.post('/login', async (req, res) => {
    console.log("Login route hit");

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const { user, session, error } = await supabase.auth.signIn({
            email: email,
            password: password
        });

        if (error) throw error;

        return res.status(200).json({ message: 'Login successful', user, session });
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }

    
});




app.post('/verify-token', async (req, res) => {
    const token = req.body.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(403).json({ error: 'A token is required for authentication' });
    }

    try {
        const { data: user, error } = await supabase.auth.api.getUser(token);

        if (error) {
            throw error;
        }

        return res.status(200).json({ message: 'Token is valid', user });
    } catch (error) {
        return res.status(401).json({ error: 'Invalid Token or Token Expired' });
    }
});

async function signUp(email, password) {
    const { user, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    if (error) {
      console.error('Error signing up:', error.message)
    } else {
      console.log('User signed up:', user)
    }
  }
  signUp('user@example.com', 'password123')



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});