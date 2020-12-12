const fs = require('fs')
const {
    join
} = require('path')

const pkg = require('../package.json')

pkg.name = `@hi-imcodeman/${pkg.name}`

fs.writeFileSync(join(__dirname, '../package.json'), JSON.stringify(pkg))