const log4js = require('log4js')
const chalk = require('chalk')
const crypto = require('crypto')

log4js.configure({
  appenders: { access: { type: 'file', filename: './logs/access.log' } },
  categories: { default: { appenders: ['access'], level: 'error' } }
})
// 将日志输出
const logger = log4js.getLogger('access')

// 封装日志
const log = (msg, color = 'limegreen') => {
  logger.info(msg)
  // eslint-disable-next-line no-console
  console.log(chalk.keyword(color)(msg))
}
// 错误日志
const error = (msg, e, color = 'orangered ') => {
  logger.error(msg)
  // eslint-disable-next-line no-console
  console.log(chalk.keyword(color)(msg), e)
}

const getKey = (secret, body) => {
  return 'sha1=' + crypto.createHmac('sha1', secret).update(JSON.stringify(body)).digest('hex');
}

module.exports = {
  log, error, getKey
}