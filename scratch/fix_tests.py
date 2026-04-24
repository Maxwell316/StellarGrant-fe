import re

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'r') as f:
    content = f.read()

# 1. Replace field access with method calls for Grant
content = re.sub(r'grant\.status\b(?!\()', 'grant.status()', content)
content = re.sub(r'grant\.quorum\b(?!\()', 'grant.quorum()', content)
content = re.sub(r'grant\.total_milestones\b(?!\()', 'grant.total_milestones()', content)
content = re.sub(r'grant\.milestones_paid_out\b(?!\()', 'grant.milestones_paid_out()', content)

# 2. Fix Milestone { ... } initializations
def fix_milestone(match):
    block = match.group(0)
    if 'pending_extension_deadline' in block:
        return block
    # Insert before packed_stats or before closing }
    if 'packed_stats' in block:
        new_block = re.sub(r'(\s+)packed_stats:', r'\1pending_extension_deadline: None,\1extension_votes: Map::new(&env),\1packed_stats:', block)
    else:
        new_block = re.sub(r'(\s*)\}', r',\1    pending_extension_deadline: None,\1    extension_votes: Map::new(&env),\1}', block)
    return new_block

content = re.sub(r'Milestone\s*\{[^}]+\}', fix_milestone, content)

# 3. Fix Grant { ... } - just add packed_config and remove status, quorum etc.
def fix_grant(match):
    block = match.group(0)
    if 'packed_config' in block:
        return block
    # Add packed_config: 0
    new_block = re.sub(r'(\s*)id:', r'\1packed_config: 0,\1id:', block)
    return new_block

content = re.sub(r'Grant\s*\{[^}]+\}', fix_grant, content)

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'w') as f:
    f.write(content)
