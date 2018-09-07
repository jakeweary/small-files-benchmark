const Bluebird = require('bluebird')
const path = require('path')
const util = require('util')
const fs = require('fs')

for (const [key, value] of Object.entries(fs))
  if (!key.endsWith('Sync') && typeof value === 'function')
    fs[key + 'Promise'] = util.promisify(value)

const bench = async (name, fn) => {
  try {
    const a = Date.now()
    await fn()
    const b = Date.now()
    console.log(`${name} - ${b - a}ms`)
  }
  catch(e) {
    console.error(`${name} failed:\n`, e)
  }
}

const main = async () => {
  const paths = fs
    .readdirSync('small-files')
    .map(name => path.resolve('small-files', name))

  await bench('sync (for-loop)', () => {
    const arr = []
    for (let i = 0; i < paths.length; i++)
      arr.push(fs.readFileSync(paths[i]))
    return arr
  })

  await bench('sync (map)', () => {
    return paths.map(path => fs.readFileSync(path))
  })

  await bench('Promise.all (experimental)', async () => {
    return Promise.all(paths.map(path => fs.promises.readFile(path)))
  })

  await bench('Promise.all', async () => {
    return Promise.all(paths.map(path => fs.readFilePromise(path)))
  })

  await bench('Bluebird.map', async () => {
    return Bluebird.map(paths, path => fs.readFilePromise(path))
  })

  for (const concurrency of [2, 3, 5, 10, 50, 100, 500, 1000])
    await bench(`Bluebird.map (concurrency: ${concurrency})`, async () => {
      return Bluebird.map(paths, path => fs.readFilePromise(path), { concurrency })
    })
}

main()
