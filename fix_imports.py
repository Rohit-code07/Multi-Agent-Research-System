import os
import re

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # Base rename
        content = content.replace('agents.scraper', 'agents.scraper')
        content = content.replace('agents.reader', 'agents.reader')
        content = content.replace('agents.claim_extractor', 'agents.claim_extractor')
        content = content.replace('agents.evidence', 'agents.evidence')
        content = content.replace('agents.mapping', 'agents.mapping')
        content = content.replace('agents.verification', 'agents.verification')
        content = content.replace('agents.critic', 'agents.critic')
        content = content.replace('agents.graph', 'agents.graph')
        content = content.replace('schemas', 'schemas')
        content = content.replace('agents.', 'agents.')
        content = content.replace('pipeline', 'pipeline')
        content = content.replace('', '') # fallback for any remaining, though might be dangerous if there's other stuff

        # Also need to fix relative imports from .state import ResearchState if they need to change
        # Actually .state is fine.

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Updated {filepath}')
    except Exception as e:
        print(f'Error processing {filepath}: {e}')

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.venv' in root or '.git' in root or 'frontend' in root:
        continue
    for file in files:
        if file.endswith('.py'):
            replace_in_file(os.path.join(root, file))
