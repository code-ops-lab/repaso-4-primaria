// Publica la app en GitHub Pages sin necesidad de un flujo de Actions:
// compila con la subruta del repositorio y sube la carpeta dist a la rama «gh-pages».
//
//   npm run deploy
//
// Requisitos: tener el remoto «origin» apuntando a GitHub y permiso de escritura.
// En Settings → Pages, elegir «Deploy from a branch» → gh-pages / (root).
import { execFileSync, execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const sh = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts })
const out = (cmd) => execSync(cmd).toString().trim()

const remote = out('git remote get-url origin')
const match = remote.replace(/\.git$/, '').match(/github\.com[/:]([^/]+)\/([^/]+)$/)
if (!match) throw new Error(`El remoto «origin» no parece de GitHub: ${remote}`)
const [, owner, repo] = match

console.log(`Compilando para /${repo}/ …`)
sh('npm run build', { env: { ...process.env, VITE_BASE: `/${repo}/` } })

writeFileSync('dist/.nojekyll', '')

const name = out('git config user.name')
const email = out('git config user.email')
const git = (...args) => execFileSync('git', args, { cwd: 'dist', stdio: 'inherit' })

console.log('Subiendo a la rama gh-pages …')
git('init', '-q', '-b', 'gh-pages')
git('add', '-A')
git('-c', `user.name=${name}`, '-c', `user.email=${email}`, 'commit', '-q', '-m', 'Publicar en GitHub Pages')
git('push', '-f', remote, 'gh-pages')

console.log(`Listo. Se publicará en https://${owner}.github.io/${repo}/`)
