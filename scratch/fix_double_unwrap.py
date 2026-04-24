import re

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'r') as f:
    content = f.read()

# Fix the double unwrap() introduced by previous script
content = content.replace('.unwrap().unwrap().', '.unwrap().')

with open('stellargrant-contracts/contracts/stellar-grants/src/test.rs', 'w') as f:
    f.write(content)
