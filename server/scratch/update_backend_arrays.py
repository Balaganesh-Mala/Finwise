import os

filepath = 'd:/Projects/Finwise/server/controllers/mockInterviewController.js'

if os.path.exists(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    target_block = """        // Clean topicScores: Filter out any entries with empty topic names
        const topicScores = rawTopicScores.filter(ts => ts.topic && ts.topic.trim() !== '');

        // 1. Strict Validation"""

    new_block = """        // Clean topicScores: Filter out any entries with empty topic names
        const topicScores = rawTopicScores.filter(ts => ts.topic && ts.topic.trim() !== '');

        // Safely parse array fields to strings for Mongoose schema compatibility
        const parseStringField = (field) => Array.isArray(field) ? field.join('\\n') : field;
        const parsedStrengths = parseStringField(strengths);
        const parsedWeaknesses = parseStringField(weaknesses);
        const parsedSuggestions = parseStringField(suggestions);

        // 1. Strict Validation"""

    insert_block = """            topicScores, strengths: parsedStrengths, weaknesses: parsedWeaknesses, suggestions: parsedSuggestions,
            improvementPlan, improvementPlanText, overallRemark,"""

    old_insert = """            topicScores, strengths, weaknesses, suggestions,
            improvementPlan, improvementPlanText, overallRemark,"""

    if 'parsedStrengths' not in content:
        content = content.replace(target_block, new_block)
        content = content.replace(old_insert, insert_block)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated backend controller in {filepath}")
    else:
        print("Backend controller already patched.")
else:
    print(f"Not found: {filepath}")
