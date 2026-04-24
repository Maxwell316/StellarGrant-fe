import re

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'r') as f:
    content = f.read()

# Fix Option<Milestone> unwrapping
# If we see .status(), .quorum(), etc. after get_milestone, insert .unwrap()
content = re.sub(r'get_milestone\(([^)]+)\)\.((?:status|quorum|total_milestones|milestones_paid_out|idx|approvals|rejections|community_upvotes|pending_extension_deadline|deadline|description|amount|state|votes|reasons|status_updated_at|proof_url|submission_timestamp|community_comments|extension_votes))', r'get_milestone(\1).unwrap().\2', content)

# Remove idx from Milestone { ... } (if missed)
content = re.sub(r'idx:\s*[^,]+,', '', content)

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'w') as f:
    f.write(content)
