const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key (First 5 chars):', supabaseServiceKey ? supabaseServiceKey.substring(0, 5) : 'MISSING');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('ERROR: Missing Credentials in .env');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testInvite() {
    // Attempt to invite a fake user to see if API responds (validates key)
    // We use a dummy email that won't actually annoy anyone ideally, or we just check if it throws "Invalid API Key"
    
    // Actually, listing users is a safer check for Admin privileges
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (error) {
        console.error('CONNECTION FAILED:', error.message);
    } else {
        console.log('CONNECTION SUCCESS! Retrieved users list:', data.users.length);
        console.log('Service Role Key is valid.');
    }
}

testInvite();
