import { existsSync, promises as fsPromises } from "fs"
import { fail } from "assert"
import { App } from "../app"

describe("App.run", () => {
  
  test("should create correct index file", async () => {

    const testFileName = "example1.txt"

    if (!existsSync(`${__dirname}/${testFileName}`)) {
      fail(`Test file ${testFileName} not found`)
    }

    process.argv.push(`${__dirname}/${testFileName}`)
    process.argv.push("1")

    await App.run()

    process.argv.pop()
    process.argv.pop()

    const indexFileName = testFileName.replace(".txt", ".idx")

    if (!existsSync(`${__dirname}/../indexes/${indexFileName}`)) {
      fail(`Index file ${indexFileName} was not created`)
    }

    let index: string

    try {
      index = (await fsPromises.readFile(`${__dirname}/../indexes/${indexFileName}`, { encoding: "utf-8" }))
    } catch {
      fail("Failed to read index file")
    }

    expect.assertions(1)
    expect(index).toEqual("5\n12\n19\n24\n31\n41")

  })

  describe("should return correct output", () => {
    test.each([
      [ 3, "3" ],
      [ 999999, "999999" ],
    ])("line: %d", async (line: number, expectedOutput: string) => {

      const testFileName = "example2.txt"

      if (!existsSync(`${__dirname}/${testFileName}`)) {
        fail(`Test file ${testFileName} not found`)
      }

      process.argv.push(`${__dirname}/${testFileName}`)
      process.argv.push(line.toString())

      let result = await App.run()

      process.argv.pop()
      process.argv.pop()

      expect.assertions(1)
      expect(result).toEqual(expectedOutput)

    })

  })

})