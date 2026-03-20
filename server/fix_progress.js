const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/finwise', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(async () => {
    try {
        const Progress = mongoose.connection.collection('progresses');
        // If courseId is missing or null, it's orphaned
        const orphaned = await Progress.find({ 
            $or: [
                { courseId: { $exists: false } }, 
                { courseId: null }
            ] 
        }).toArray();
        console.log('Found orphaned progress records:', orphaned.length);
        
        let fixed = 0;
        for (const p of orphaned) {
            if (p.topicId) {
                // Topic documents usually have moduleId
                const Topic = mongoose.connection.collection('topics');
                const topic = await Topic.findOne({ _id: p.topicId });
                
                if (topic && topic.moduleId) {
                    const Module = mongoose.connection.collection('modules');
                    const mod = await Module.findOne({ _id: topic.moduleId });
                    
                    if (mod && mod.courseId) {
                        await Progress.updateOne(
                            { _id: p._id }, 
                            { $set: { courseId: mod.courseId } }
                        );
                        fixed++;
                    }
                }
            }
        }
        console.log('Fixed orphaned records:', fixed);
    } catch (e) { 
        console.error(e); 
    }
    process.exit(0);
});
