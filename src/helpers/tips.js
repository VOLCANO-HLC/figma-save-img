import ora from 'ora';
import chalk from 'chalk';

const loading = ora({
  spinner: { interval: 80, frames: ['-', '\\', '|', '/'] },
});

const loadingStart = message => loading.start(chalk.cyan(message));

const loadingSuccess = message => {
  loading.stopAndPersist({
    symbol: chalk.green('✔'),
    text: chalk.green(message),
  });
};

const loadingEnd = () => loading.stop();

const logInfo = (message, tag = '📮') =>
  console.log(`${tag} ${message}`);

const logWarn = message =>
  console.log(`${chalk.yellow(' ⚠️ ')} ${chalk.yellowBright(message)}`);

const logSuccess = message =>
  console.log(`${chalk.green(' ✨ ')} ${chalk.greenBright(message)}`);

export default {
  loadingStart,
  loadingSuccess,
  loadingEnd,
  logInfo,
  logWarn,
  logSuccess,
};
