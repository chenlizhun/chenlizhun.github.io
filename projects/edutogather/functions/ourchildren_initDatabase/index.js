// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID || 'test_openid_001'
  
  // 集合名称映射
  const COLLECTIONS = {
    FAMILIES: 'ourchildren_families',
    USERS: 'ourchildren_users',
    KIDS: 'ourchildren_kids',
    LOGS: 'ourchildren_point_logs'
  }

  try {
    // 1. 创建示例家庭
    const familyRes = await db.collection(COLLECTIONS.FAMILIES).add({
      data: {
        name: '示例家庭',
        owner_id: openId,
        created_at: db.serverDate(),
        access_code: '888888', // 用于其他成员加入的口令
        status: 'active'
      }
    })
    const familyId = familyRes._id

    // 2. 创建示例用户 (当前调用者)
    await db.collection(COLLECTIONS.USERS).add({
      data: {
        _openid: openId, // 云开发会自动添加，但显式写出结构更清晰
        family_id: familyId,
        role: 'admin', // admin | member
        display_name: '管理员爸爸',
        avatar: 'https://example.com/avatar.png',
        created_at: db.serverDate()
      }
    })

    // 3. 创建示例孩子
    const kid1 = await db.collection(COLLECTIONS.KIDS).add({
      data: {
        family_id: familyId,
        name: '猪姐姐',
        avatar: 'girl_avatar.png',
        current_points: 100,
        created_at: db.serverDate(),
        gender: 'female',
        birthday: '2015-01-01'
      }
    })

    const kid2 = await db.collection(COLLECTIONS.KIDS).add({
      data: {
        family_id: familyId,
        name: '牛弟弟',
        avatar: 'boy_avatar.png',
        current_points: 50,
        created_at: db.serverDate(),
        gender: 'male',
        birthday: '2018-01-01'
      }
    })

    // 4. 创建示例积分流水
    await db.collection(COLLECTIONS.LOGS).add({
      data: {
        family_id: familyId,
        kid_id: kid1._id,
        operator_id: openId,
        operator_name: '管理员爸爸',
        delta: 5,
        reason: '认真完成作业',
        type: 'reward', // reward | expense
        timestamp: Date.now(),
        created_at: db.serverDate()
      }
    })

    await db.collection(COLLECTIONS.LOGS).add({
      data: {
        family_id: familyId,
        kid_id: kid2._id,
        operator_id: openId,
        operator_name: '管理员爸爸',
        delta: -10,
        reason: '购买玩具',
        type: 'expense',
        timestamp: Date.now(),
        created_at: db.serverDate()
      }
    })

    return {
      success: true,
      message: 'Database initialized with sample data',
      data: {
        familyId,
        kidIds: [kid1._id, kid2._id]
      }
    }

  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: 'Initialization failed',
      error: e
    }
  }
}
