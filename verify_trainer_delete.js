const axios = require('axios');

async function testTrainerDeletion() {
    const baseURL = 'http://localhost:5000/api/admin/trainers';
    
    try {
        // 1. Create a dummy trainer
        console.log('Creating dummy trainer...');
        const createRes = await axios.post(`${baseURL}/create`, {
            name: 'Delete Me',
            email: 'deleteme@example.com',
            role: 'Other'
        });
        
        const trainerId = createRes.data._id;
        console.log(`Trainer created with ID: ${trainerId}`);

        // 2. Verify existence
        console.log('Verifying existence...');
        const listRes = await axios.get(`${baseURL}/list`);
        const exists = listRes.data.some(t => t._id === trainerId);
        if (!exists) throw new Error('Trainer not found in list after creation');
        console.log('Trainer found in list.');

        // 3. Delete trainer
        console.log('Deleting trainer...');
        await axios.delete(`${baseURL}/${trainerId}`);
        console.log('Delete request successful.');

        // 4. Verify removal
        console.log('Verifying removal...');
        const listResAfter = await axios.get(`${baseURL}/list`);
        const stillExists = listResAfter.data.some(t => t._id === trainerId);
        
        if (stillExists) {
            throw new Error('Trainer still exists after deletion!');
        } else {
            console.log('SUCCESS: Trainer successfully deleted.');
        }

    } catch (error) {
        console.error('TEST FAILED:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testTrainerDeletion();
