import os

files_to_update = [
    'd:/Projects/Finwise/admin/src/pages/Interviews/ConductMockInterview.jsx',
    'd:/Projects/Finwise/trainer/src/pages/MockInterviewForm.jsx'
]

orig_block = """                if (data.topics && Array.isArray(data.topics)) {
                    newState.topicScores = data.topics.map(t => ({
                        topic: t.topic || '',
                        score: t.score || 0,
                        remark: t.remark || ''
                    }));
                }"""

new_block = """                if (data.topics && Array.isArray(data.topics)) {
                    const newCustomTopicInput = {};
                    newState.topicScores = data.topics.map((t, index) => {
                        if (dbSettings && dbSettings.topics && !dbSettings.topics.includes(t.topic)) {
                            newCustomTopicInput[index] = true;
                        }
                        return {
                            topic: t.topic || '',
                            score: t.score || 0,
                            remark: t.remark || ''
                        };
                    });
                    // Queue state update for custom inputs
                    setTimeout(() => setCustomTopicInput(newCustomTopicInput), 0);
                }"""

for filepath in files_to_update:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if orig_block in content:
            content = content.replace(orig_block, new_block)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated topics logic in {filepath}")
        else:
            print(f"Could not find block in {filepath}")

