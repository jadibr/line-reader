import { App } from "./app"

async function run(): Promise<void> {
  await App.run()
}

(async() => {
  await run()
})()