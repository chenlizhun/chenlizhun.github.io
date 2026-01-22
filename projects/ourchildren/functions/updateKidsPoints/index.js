// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 硬编码的密码哈希，与前端一致 (SHA-256 )
const SAFE_PASSWORD_HASH = '6c0f3412848008d49d186d5fad7fd1482656cfb62ad3c060a14e41c3fb3f1b43'

// 云函数入口函数
exports.main = async (event, context) => {
  const { kid, delta, reason, operator, password } = event

  // 1. 安全校验
  if (password !== SAFE_PASSWORD_HASH) {
    return {
      success: false,
      message: 'Permission denied: Incorrect password'
    }
  }

  if (!['猪姐姐', '牛弟弟'].includes(kid)) {
    return {
      success: false,
      message: 'Invalid kid name'
    }
  }

  const DOC_ID = 'global_kids_data'

  try {
    // 2. 执行数据库更新
    // 使用 db.command.inc 原子更新，防止并发冲突
    const res = await db.collection('kids_data').doc(DOC_ID).update({
      data: {
        [`kids.${kid}.points`]: _.inc(delta),
        [`kids.${kid}.history`]: _.push({
          timestamp: Date.now(),
          delta,
          reason,
          operator
        })
      }
    })

    return {
      success: true,
      updated: res.stats.updated
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: e.message
    }
  }
}
