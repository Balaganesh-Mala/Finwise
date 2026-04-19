import os

files_to_update = [
    'd:/Projects/Finwise/admin/src/pages/Interviews/ConductMockInterview.jsx',
    'd:/Projects/Finwise/trainer/src/pages/MockInterviewForm.jsx'
]

orig_block = """                if (data.strengths) newState.strengths = data.strengths;
                if (data.weaknesses) newState.weaknesses = data.weaknesses;
                if (data.suggestions) newState.suggestions = data.suggestions;"""

new_block = """                if (data.strengths) newState.strengths = Array.isArray(data.strengths) ? data.strengths.join('\\n') : data.strengths;
                if (data.weaknesses) newState.weaknesses = Array.isArray(data.weaknesses) ? data.weaknesses.join('\\n') : data.weaknesses;
                if (data.suggestions) newState.suggestions = Array.isArray(data.suggestions) ? data.suggestions.join('\\n') : data.suggestions;"""

for filepath in files_to_update:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if orig_block in content:
            content = content.replace(orig_block, new_block)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated array stringification logic in {filepath}")
        else:
            print(f"Could not find block in {filepath}")

