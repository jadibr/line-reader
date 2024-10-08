import { createReadStream, readFile, writeFile, promises as fsPromises, constants as fsConstants } from "fs"
import path from "path"

export abstract class App {

  public static async run(): Promise<string | undefined> {

    let parsedParams: Params

    try {
      parsedParams = await this.validateAndParseParams()
    } catch {
      return
    }

    const {filePath, lineNumber, overwriteIndexFile} = parsedParams
    let index: number[]

    try {
      index = await this.createOrLoadIndex(filePath, overwriteIndexFile)
    } catch (err) {
      console.error(err)
      return
    }

    if (lineNumber > index.length - 1) {
      console.error(`Line number parameter: ${lineNumber} is greater than the total number of lines in the input file: ${index.length - 1} (0 based)`)
      return
    }

    let line: string
    const startingPosition = lineNumber == 0 ? 0 : index[lineNumber - 1] + 1
    const endingPosition = lineNumber == index.length - 1 ? index[lineNumber] : index[lineNumber] - 1

    try {
      line = await App.readLine(filePath, startingPosition, endingPosition)
    } catch (err) {
      console.error(err)
      return
    }

    console.log(`${line}`)
    return line
  }

  private static async validateAndParseParams(): Promise<Params> {

    const filePath = process.argv.at(2)
    const lineNumber = process.argv.at(3)

    if (!filePath || !lineNumber) {
      console.error("2 arguments are required to run this program. Please pass in the file path followed by the line number.")
      throw new Error("Parameters missing")
    }

    try {
      await fsPromises.access(filePath, fsConstants.R_OK)
    } catch {
      console.error(`File: ${filePath} does not exist`)
      throw new Error("Invalid file path")
    }

    const parsedLineNumber = Number(lineNumber)

    if (Number.isNaN(parsedLineNumber) || parsedLineNumber < 0) {
      console.error("Line number must be a number greater or equal to 0")
      throw new Error("Invalid line number")
    }

    return new Params(filePath, parsedLineNumber, process.argv.at(4)?.toLowerCase() == 'true')
  }

  private static async createOrLoadIndex(filePath: string, overwriteIndexFile: boolean): Promise<number[]> {

    const indexFilePath = `${__dirname}/indexes/${path.parse(filePath).name}.idx`

    let indexFileExists = true

    try {
      await fsPromises.access(indexFilePath, fsConstants.R_OK)
    } catch (err) {
      indexFileExists = false
    }

    if (!overwriteIndexFile && indexFileExists) {
      console.info(`Index file ${indexFilePath} was found. Loading index...`)
      return await App.loadIndex(indexFilePath)
    }

    console.info(`Index file ${indexFilePath} was not found. Creating index...`)

    let indexesDirExists = true

    try {
      await fsPromises.access(`${__dirname}/indexes`, fsConstants.W_OK)
    } catch {
      indexesDirExists = false
    }

    if (!indexesDirExists) {
      try {
        await fsPromises.mkdir(`${__dirname}/indexes`)
      } catch (err) {
        console.error("Failed to create a directory for storing index files")
        throw new Error("Couldn't create /indexes directory")
      }
    }

    return new Promise((resolve, reject) => {

      const newLineIdxs: number[] = []
      const readStream = createReadStream(filePath, { encoding: 'utf-8' })
      let offset = 0

      readStream.on('end', () => {
        newLineIdxs.push(offset)
        writeFile(indexFilePath, newLineIdxs.join('\n'), err => {
          if (err) return reject(err)
          console.info('Finished creating index file')
          resolve(newLineIdxs)
        })
      })

      readStream.on('data', chunk => {
        for (let i = 0; i < chunk.length; i++) {
          if (chunk[i] == '\n') {
            newLineIdxs.push(offset + i)
          }
        }
        offset += chunk.length
      })

      readStream.on('error', err => reject(err))

    })
  }

  private static async loadIndex(filePath: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      readFile(filePath, 'utf-8', (err, data) => {
        if (err) return reject(err)
        console.info('Finished loading index file.')
        resolve(data.split('\n').map(Number))
      })
    })
  }

  private static async readLine(filePath: string, lineStartPosition: number, lineEndPosition: number): Promise<string> {
    return new Promise((resolve, reject) => {

      let line: string

      const readStream = createReadStream(filePath, {
        encoding: 'utf-8',
        start: lineStartPosition,
        end: lineEndPosition
      })

      readStream.on('end', () => {
        return resolve(line)
      })

      readStream.on('data', chunk => {
        line = chunk as string
      })

      readStream.on('error', err => reject(err))

    })
  }

}

class Params {
  constructor(
      public filePath: string,
      public lineNumber: number,
      public overwriteIndexFile: boolean){}
}