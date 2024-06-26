import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3000; 

const supabaseUrl = 'https://oewelgbnnzgyamhpxyqs.supabase.co';
const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld2VsZ2JubnpneWFtaHB4eXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkzMzQ0MDIsImV4cCI6MjAzNDkxMDQwMn0.wrKCzM1wbzyTLwBN7xbYu2mzS2GzQ6zAWHNe9Wv1BBo`;

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

app.get('/allusr', async (req, res) => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



// const userData = {

//     created_at: '2024-06-25T18:11:49+00:00',
//     human_first_name: '22Carter',
//     human_last_name: '22VanHaren',
//     email: '2carter.vanharen@gmail.com',
//     dog_name: 'Juilo',
//     address: '1215 radiant drive brookfield 53005 wi',
//     last_active: '2024-06-25T18:12:26+00:00',
//     user_level: 1
// };

// async function insertUserData() {
//     const { data, error } = await supabase.from('users').insert([userData]);
//     if (error) {
//         console.error('Error inserting data:', error);
//     } else {
//         console.log('Data inserted successfully:', data);
//     }
// }

// insertUserData();