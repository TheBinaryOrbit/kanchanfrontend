const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const required = [
  'app/admin/layout.tsx',
  'app/admin/login/page.tsx',
  'app/admin/dashboard/page.tsx',
  'app/admin/customers/page.tsx',
  'app/admin/services/page.tsx',
  'app/admin/machines/page.tsx',
  'app/admin/users/page.tsx',
]

let missing = []
for (const rel of required) {
  const p = path.join(root, rel)
  if (!fs.existsSync(p)) missing.push(rel)
}

if (missing.length) {
  console.error('Missing scaffold files:')
  missing.forEach(m => console.error(' -', m))
  process.exit(2)
} else {
  console.log('Admin scaffold verification passed ✅')
  process.exit(0)
}
