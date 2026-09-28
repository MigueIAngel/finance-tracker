// Builds the empty demo database once (used by deploy/demo/Dockerfile).
import { writeDemoSnapshot } from '../db/demo.js'

const path = process.argv[2] ?? 'demo-db.tgz'
await writeDemoSnapshot(path)
console.log(`demo database snapshot written to ${path}`)
