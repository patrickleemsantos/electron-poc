import { createServer } from 'http'
import { createReadStream, statSync } from 'fs'
import { extname, join } from 'path'

const ROOT = join(process.cwd(), 'release')
const PORT = 8080

const MIME = {
  '.yml': 'text/yaml',
  '.exe': 'application/octet-stream',
  '.blockmap': 'application/octet-stream'
}

createServer((req, res) => {
  const filePath = join(ROOT, decodeURIComponent(req.url ?? '/').split('?')[0])
  try {
    const stat = statSync(filePath)
    if (stat.isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' })
      createReadStream(filePath).pipe(res)
      return
    }
  } catch {
    // fall through to 404
  }
  res.writeHead(404)
  res.end('Not found')
}).listen(PORT, () => {
  console.log(`Serving ${ROOT} at http://localhost:${PORT}/`)
})
