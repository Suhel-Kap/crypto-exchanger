import chalk from 'chalk'

// Logging class
// This class basically beautifies the console.log output
// It adds a timestamp and a color to the output

const Logging = {
  log: (args: any) => {
    Logging.info(args)
  },
  info: (args: any) => {
    console.log(
      chalk.blue(`[${new Date().toLocaleString()}][INFO]`),
      typeof args === 'string' ? chalk.blueBright(args) : args
    )
  },
  warn: (args: any) => {
    console.log(
      chalk.yellow(`[${new Date().toLocaleString()}][INFO]`),
      typeof args === 'string' ? chalk.yellowBright(args) : args
    )
  },
  error: (args: any) => {
    console.log(
      chalk.red(`[${new Date().toLocaleString()}][INFO]`),
      typeof args === 'string' ? chalk.redBright(args) : args
    )
  }
}

export default Logging
