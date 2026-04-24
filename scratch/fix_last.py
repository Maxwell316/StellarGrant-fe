import re

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'r') as f:
    content = f.read()

# Fix get_milestone().field to get_milestone().unwrap().field
content = re.sub(r'get_milestone\(([^)]+)\)\.([a-z_]+)', r'get_milestone(\1).unwrap().\2', content)

# Fix idx field in Milestone { ... }
content = re.sub(r'idx:\s*idx,', '', content)
content = re.sub(r'idx:\s*\d+,', '', content)

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'w') as f:
    f.write(content)
