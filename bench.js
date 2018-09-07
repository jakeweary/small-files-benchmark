const Bluebird = require('bluebird')
const path = require('path')
const util = require('util')
const fs = require('fs')

const readSync = fs.readFileSync
const readExperimental = fs.promises.readFile
const readPromisified = util.promisify(fs.readFile)

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
      arr.push(readSync(paths[i]))
    return arr
  })

  await bench('sync (map)', () => {
    return paths.map(path => readSync(path))
  })

  await bench('Promise.all (experimental)', async () => {
    return Promise.all(paths.map(path => readExperimental(path)))
  })

  await bench('Promise.all', async () => {
    return Promise.all(paths.map(path => readPromisified(path)))
  })

  await bench('Bluebird.map', async () => {
    return Bluebird.map(paths, path => readPromisified(path))
  })

  for (const concurrency of [100, 500, 1000, 2000, 4000, 8000])
    await bench(`Bluebird.map (concurrency: ${concurrency})`, async () => {
      return Bluebird.map(paths, path => readPromisified(path), { concurrency })
    })
}

main()
