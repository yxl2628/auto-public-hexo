const Koa = require('koa')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const shelljs = require('shelljs')
const { log, error, getKey } = require('./util')
const { targetDir, port, secret } = require('./config')

// 获取koa实例
const app = new Koa()

app.use(async (ctx, next) => {
  log(`Process ${ctx.request.method} ${ctx.request.url}...`)
  await next()
})

router.post('/git-hooks', async (ctx) => {
  const { request, response } = ctx
  const sig = request.headers['x-hub-signature']
  const key = getKey(secret, request.body)
  // 校验通过
  if (sig === key) {
    shelljs.cd(targetDir)
    log(`切换到目录：${targetDir}`)
    const gitCmd = shelljs.exec('git pull')
    if (gitCmd.code === 0) {
      const generateCmd = shelljs.exec('hexo clean && hexo generate')
      if (generateCmd.code === 0) {
        log('网站构建成功')
        ctx.response.body = {
          code: 'success',
          message: '网站构建成功'
        };
      } else {
        error('网站构建失败, hexo generate错误', generateCmd.output)
        ctx.response.body = {
          code: 'error',
          message: '网站构建失败, hexo generate错误'
        }
      }
    } else {
      error('网站构建失败, 拉取git仓库失败', gitCmd.output)
      ctx.response.body = {
        code: 'error',
        message: '网站构建失败, 拉取git仓库失败'
      }
    }
  } else {
    error('网站构建失败,权限校验失败')
    ctx.response.body = {
      code: 'error',
      message: '网站构建失败,权限校验失败'
    }
  }
})

// 添加body解析
app.use(bodyParser())
// 添加路由配置
app.use(router.routes())
// 启动监听端口
app.listen(port)
log(`应用程序已经启动，访问地址:http://127.0.0.1:${port}`)
