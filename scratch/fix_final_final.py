import re

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'r') as f:
    content = f.read()

# Fix the broken assignments from previous script
content = re.sub(r'(\w+)\.status\(\)\s*=\s*([^;]+);', r'\1.set_status(\2);', content)
content = re.sub(r'(\w+)\.quorum\(\)\s*=\s*([^;]+);', r'\1.set_quorum(\2);', content)
content = re.sub(r'(\w+)\.total_milestones\(\)\s*=\s*([^;]+);', r'\1.set_total_milestones(\2);', content)
content = re.sub(r'(\w+)\.milestones_paid_out\(\)\s*=\s*([^;]+);', r'\1.set_milestones_paid_out(\2);', content)

# Fix MilestoneSubmission
def fix_submission(match):
    block = match.group(0)
    if 'idx:' in block:
        return block
    # Add idx: 0 as a default
    return re.sub(r'(\s*)description:', r'\1idx: 0,\1description:', block)

content = re.sub(r'MilestoneSubmission\s*\{[^}]+\}', fix_submission, content)

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'w') as f:
    f.write(content)
