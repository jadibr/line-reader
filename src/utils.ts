import { createWriteStream } from "fs"

export abstract class Utils {

  public static async generateTestFile(): Promise<void> {
    const filePath = `${__dirname}/tests/generateExample.txt`

    return new Promise((resolve, reject) => {
      const stream = createWriteStream(filePath, { flags: 'a'})

      stream.on('error', err => reject(err))

      stream.on('finish', () => console.log('Finished generating test file'))

      for (let i = 0; i < 1000000; i++) {
        stream.write(`${i.toString()}\n`)
      }

      stream.end()
      resolve()
    })

  }

}