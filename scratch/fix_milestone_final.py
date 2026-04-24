import re

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'r') as f:
    content = f.read()

def fix_milestone(match):
    block = match.group(0)
    if 'pending_extension_deadline' in block and 'packed_stats' in block:
        return block
    
    if 'pending_extension_deadline' not in block:
        if 'packed_stats' in block:
             block = re.sub(r'(\s+)packed_stats:', r'\1pending_extension_deadline: None,\1extension_votes: Map::new(&env),\1packed_stats:', block)
        else:
             block = re.sub(r'(\s*)\}', r',\1    pending_extension_deadline: None,\1    extension_votes: Map::new(&env),\1}', block)
    
    if 'packed_stats' not in block:
         block = re.sub(r'(\s*)\}', r',\1    packed_stats: 0,\1}', block)
         
    return block

content = re.sub(r'Milestone\s*\{[^}]+\}', fix_milestone, content)

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'w') as f:
    f.write(content)
