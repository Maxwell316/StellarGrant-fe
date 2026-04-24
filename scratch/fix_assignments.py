import re

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'r') as f:
    content = f.read()

# Fix assignments
content = re.sub(r'(\w+)\.status\s*=\s*([^;]+);', r'\1.set_status(\2);', content)
content = re.sub(r'(\w+)\.quorum\s*=\s*([^;]+);', r'\1.set_quorum(\2);', content)
content = re.sub(r'(\w+)\.total_milestones\s*=\s*([^;]+);', r'\1.set_total_milestones(\2);', content)
content = re.sub(r'(\w+)\.milestones_paid_out\s*=\s*([^;]+);', r'\1.set_milestones_paid_out(\2);', content)

content = re.sub(r'(\w+)\.idx\s*=\s*([^;]+);', r'\1.set_idx(\2);', content)
content = re.sub(r'(\w+)\.approvals\s*=\s*([^;]+);', r'\1.set_approvals(\2);', content)
content = re.sub(r'(\w+)\.rejections\s*=\s*([^;]+);', r'\1.set_rejections(\2);', content)
content = re.sub(r'(\w+)\.community_upvotes\s*=\s*([^;]+);', r'\1.set_community_upvotes(\2);', content)

# Fix remaining field access (some might have missed in previous script)
content = re.sub(r'\b(\w+)\.status\b(?!\s*=)(?!\()', r'\1.status()', content)
content = re.sub(r'\b(\w+)\.quorum\b(?!\s*=)(?!\()', r'\1.quorum()', content)
content = re.sub(r'\b(\w+)\.total_milestones\b(?!\s*=)(?!\()', r'\1.total_milestones()', content)
content = re.sub(r'\b(\w+)\.milestones_paid_out\b(?!\s*=)(?!\()', r'\1.milestones_paid_out()', content)

content = re.sub(r'\b(\w+)\.idx\b(?!\s*=)(?!\()', r'\1.idx()', content)
content = re.sub(r'\b(\w+)\.approvals\b(?!\s*=)(?!\()', r'\1.approvals()', content)
content = re.sub(r'\b(\w+)\.rejections\b(?!\s*=)(?!\()', r'\1.rejections()', content)
content = re.sub(r'\b(\w+)\.community_upvotes\b(?!\s*=)(?!\()', r'\1.community_upvotes()', content)

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'w') as f:
    f.write(content)
