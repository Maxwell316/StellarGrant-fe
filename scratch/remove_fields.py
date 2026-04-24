import re

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'r') as f:
    content = f.read()

# Remove old fields from Grant { ... }
content = re.sub(r'status:\s*GrantStatus::[^,]+,', '', content)
content = re.sub(r'quorum:\s*[^,]+,', '', content)
content = re.sub(r'total_milestones:\s*[^,]+,', '', content)
content = re.sub(r'milestones_paid_out:\s*[^,]+,', '', content)

# Remove old fields from Milestone { ... }
content = re.sub(r'idx:\s*[^,]+,', '', content)
content = re.sub(r'approvals:\s*[^,]+,', '', content)
content = re.sub(r'rejections:\s*[^,]+,', '', content)
content = re.sub(r'community_upvotes:\s*[^,]+,', '', content)

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'w') as f:
    f.write(content)
