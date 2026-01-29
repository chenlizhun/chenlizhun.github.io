const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

const COLLECTIONS = {
  FAMILIES: 'ourchildren_families',
  USERS: 'ourchildren_users',
  KIDS: 'ourchildren_kids',
  LOGS: 'ourchildren_point_logs',
  MESSAGES: 'public_messages'
}

function hashPin(pin) {
    return crypto.createHash('sha256').update(pin).digest('hex')
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  const { action, payload } = event

  console.log(`[API] Action: ${action}, User: ${openId}`)

  try {
    switch (action) {
      case 'login':
        return await handleLogin(openId)
      case 'create_family':
        return await handleCreateFamily(openId, payload)
      case 'join_family':
        return await handleJoinFamily(openId, payload)
      case 'add_kid':
        return await handleAddKid(openId, payload)
      case 'get_family_data':
        return await handleGetFamilyData(openId, payload)
      case 'update_points':
        return await handleUpdatePoints(openId, payload)
      case 'get_history':
        return await handleGetHistory(openId, payload)
      case 'get_all_families':
        return await handleGetAllFamilies(openId, payload)
      case 'delete_family':
        return await handleDeleteFamily(openId, payload)
      case 'update_family_name':
        return await handleUpdateFamilyName(openId, payload)
      case 'update_kid_name':
        return await handleUpdateKidName(openId, payload)
      case 'update_family_pin':
        return await handleUpdateFamilyPin(openId, payload)
      case 'post_public_message':
        return await postPublicMessage(openId, payload, context)
      case 'get_public_messages':
        return await getPublicMessages(openId, payload)
      default:
        return { success: false, message: 'Unknown action' }
    }
  } catch (e) {
    console.error('[API Error]', e)
    return { success: false, message: e.message, error: e }
  }
}

// 1. Login / Init
async function handleLogin(openId) {
  // Find all user records for this openId (one per family)
  const userRes = await db.collection(COLLECTIONS.USERS)
    .where({ _openid: openId })
    .get()

  if (userRes.data.length === 0) {
    return { 
      success: true, 
      data: { status: 'unregistered', families: [], openId } 
    }
  }

  const families = []
  
  // Fetch details for each family the user belongs to
  for (const user of userRes.data) {
    try {
        const familyRes = await db.collection(COLLECTIONS.FAMILIES)
            .doc(user.family_id)
            .get()
            
        if (familyRes.data) {
            const kidsRes = await db.collection(COLLECTIONS.KIDS)
                .where({ family_id: user.family_id })
                .get()
                
            families.push({
                info: familyRes.data,
                user: user,
                kids: kidsRes.data
            })
        }
    } catch (e) {
        console.error(`Failed to load family ${user.family_id}`, e)
    }
  }

  return {
    success: true,
    data: {
      status: 'active',
      families: families,
      openId
    }
  }
}

// 2. Create Family
async function handleCreateFamily(openId, payload) {
  const { familyName, adminPin, nickname } = payload
  if (!familyName || !adminPin) throw new Error('Missing parameters')

  // Check for duplicate name
  const existCount = await db.collection(COLLECTIONS.FAMILIES).where({
    name: familyName
  }).count()

  if (existCount.total > 0) {
    throw new Error('Family name already exists')
  }

  // Use transaction to ensure atomicity
  const transaction = await db.startTransaction()
  try {
    // 1. Create Family
    const familyRes = await transaction.collection(COLLECTIONS.FAMILIES).add({
      data: {
        name: familyName,
        admin_pin: hashPin(adminPin), // Hashed PIN
        created_at: db.serverDate(),
        owner_id: openId
      }
    })
    const familyId = familyRes._id

    // 2. Create Admin User
    await transaction.collection(COLLECTIONS.USERS).add({
      data: {
        family_id: familyId,
        nickname: nickname || 'Admin',
        role: 'admin',
        joined_at: db.serverDate(),
        _openid: openId
      }
    })

    await transaction.commit()
    
    // Construct return data for immediate frontend update
    const newFamilyData = {
        info: {
            _id: familyId,
            name: familyName,
            admin_pin: adminPin,
            owner_id: openId,
            created_at: new Date()
        },
        user: {
            family_id: familyId,
            nickname: nickname || 'Admin',
            role: 'admin',
            _openid: openId,
            joined_at: new Date()
        },
        kids: []
    }
    
    return { success: true, familyId, newFamily: newFamilyData }
  } catch (e) {
    await transaction.rollback()
    throw e
  }
}

// 3. Join Family
async function handleJoinFamily(openId, payload) {
  const { familyId, adminPin, nickname } = payload
  
  const familyRes = await db.collection(COLLECTIONS.FAMILIES).doc(familyId).get()
  if (!familyRes.data) throw new Error('Family not found')
  
  if (familyRes.data.admin_pin !== hashPin(adminPin)) {
      throw new Error('Invalid PIN')
  }
  
  // Check if already joined
  const existCount = await db.collection(COLLECTIONS.USERS).where({
      _openid: openId,
      family_id: familyId
  }).count()
  
  if (existCount.total > 0) {
      return { success: true, message: 'Already joined', familyId }
  }
  
  await db.collection(COLLECTIONS.USERS).add({
      data: {
        family_id: familyId,
        nickname: nickname || 'Member',
        role: 'member',
        joined_at: db.serverDate(),
        _openid: openId
      }
  })
  
  return { success: true, familyId }
}

// 4. Add Kid
async function handleAddKid(openId, payload) {
    const { familyId, name, gender, initialPoints } = payload
    
    // Check permission (optional: check if user is admin or parent)
    const userRes = await db.collection(COLLECTIONS.USERS).where({
        _openid: openId,
        family_id: familyId
    }).get()
    
    if (userRes.data.length === 0) throw new Error('Permission denied')
    
    const res = await db.collection(COLLECTIONS.KIDS).add({
        data: {
            family_id: familyId,
            name,
            gender,
            current_points: parseInt(initialPoints) || 0,
            created_at: db.serverDate()
        }
    })
    
    return { success: true, kidId: res._id }
}

// 5. Get Family Data (Refresh)
async function handleGetFamilyData(openId, payload) {
    const { familyId } = payload
    
    // Verify membership
    const userRes = await db.collection(COLLECTIONS.USERS).where({
        _openid: openId,
        family_id: familyId
    }).get()
    
    if (userRes.data.length === 0) throw new Error('Not a member')
    
    const kidsRes = await db.collection(COLLECTIONS.KIDS).where({
        family_id: familyId
    }).get()
    
    return {
        success: true,
        data: {
            kids: kidsRes.data
        }
    }
}

// 9. Delete Family
async function handleDeleteFamily(openId, payload) {
    const { familyId, adminPin } = payload
    
    const familyRes = await db.collection(COLLECTIONS.FAMILIES).doc(familyId).get()
    if (!familyRes.data) throw new Error('Family not found')
    
    // Security check: Must provide correct PIN
    if (familyRes.data.admin_pin !== hashPin(adminPin)) {
        throw new Error('Invalid PIN')
    }
    
    // Only owner can delete
    if (familyRes.data.owner_id !== openId) {
         throw new Error('Only the owner can delete the family')
    }

    try {
        await db.collection(COLLECTIONS.FAMILIES).doc(familyId).remove()
        await db.collection(COLLECTIONS.USERS).where({ family_id: familyId }).remove()
        await db.collection(COLLECTIONS.KIDS).where({ family_id: familyId }).remove()
        await db.collection(COLLECTIONS.LOGS).where({ family_id: familyId }).remove()
        
        return { success: true }
    } catch (e) {
        throw e
    }
}

// 6. Update Points
async function handleUpdatePoints(openId, payload) {
    const { familyId, kidId, delta, reason, operatorName } = payload
    
    // Security Fix: Verify user is a member of the family
    const userRes = await db.collection(COLLECTIONS.USERS).where({
        _openid: openId,
        family_id: familyId
    }).count()
    
    if (userRes.total === 0) throw new Error('Permission denied: You are not a member of this family')

    const cmd = db.command
    const transaction = await db.startTransaction()
    
    try {
        // Update Kid
        await transaction.collection(COLLECTIONS.KIDS).doc(kidId).update({
            data: {
                current_points: cmd.inc(delta)
            }
        })
        
        // Add Log
        await transaction.collection(COLLECTIONS.LOGS).add({
            data: {
                family_id: familyId,
                kid_id: kidId,
                delta,
                reason,
                operator_name: operatorName,
                timestamp: db.serverDate(),
                _openid: openId
            }
        })
        
        await transaction.commit()
        return { success: true }
    } catch (e) {
        await transaction.rollback()
        throw e
    }
}

// 7. Get History
async function handleGetHistory(openId, payload) {
    const { familyId, kidId, page = 1, pageSize = 20 } = payload
    
    let query = db.collection(COLLECTIONS.LOGS).where({
        family_id: familyId
    })
    
    if (kidId) {
        query = query.where({ kid_id: kidId })
    }
    
    const total = await query.count()
    
    const res = await query.orderBy('timestamp', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()
        
    return {
        success: true,
        data: {
            logs: res.data,
            total: total.total,
            hasMore: (page * pageSize) < total.total
        }
    }
}

// 8. Get All Families (Directory)
async function handleGetAllFamilies(openId, payload) {
    const { page = 1, pageSize = 20 } = payload
    
    const total = await db.collection(COLLECTIONS.FAMILIES).count()
    
    const res = await db.collection(COLLECTIONS.FAMILIES)
        .orderBy('created_at', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()
        
    // Fetch kids for each family to display summary
    const families = []
    for (const f of res.data) {
        const kidsRes = await db.collection(COLLECTIONS.KIDS)
            .where({ family_id: f._id })
            .get()
            
        families.push({
            _id: f._id,
            name: f.name,
            created_at: f.created_at,
            owner_id: f.owner_id,
            kids: kidsRes.data.map(k => ({
                name: k.name,
                gender: k.gender,
                current_points: k.current_points
            }))
        })
    }
    
    return {
        success: true,
        data: {
            families,
            total: total.total,
            hasMore: (page * pageSize) < total.total
        }
    }
}

// 10. Update Family Name
async function handleUpdateFamilyName(openId, payload) {
    const { familyId, newName } = payload
    
    if (!familyId || !newName) throw new Error('Missing parameters')
    
    // 1. Get Family
    const familyRes = await db.collection(COLLECTIONS.FAMILIES).doc(familyId).get()
    if (!familyRes.data) throw new Error('Family not found')
    
    // 2. Permission Check: Must be member of the family
    const userRes = await db.collection(COLLECTIONS.USERS).where({
        _openid: openId,
        family_id: familyId
    }).count()
    
    if (userRes.total === 0) throw new Error('Permission denied')
    
    // 3. Check Duplicate Name
    const countRes = await db.collection(COLLECTIONS.FAMILIES).where({
        name: newName,
        _id: _.neq(familyId) // Exclude current family
    }).count()
    
    if (countRes.total > 0) {
        return { success: false, message: '该家庭名称已被使用' }
    }
    
    // 4. Update
    await db.collection(COLLECTIONS.FAMILIES).doc(familyId).update({
        data: {
            name: newName
        }
    })
    
    return { success: true }
}

// 13. Post Public Message
async function postPublicMessage(openId, payload, context) {
    const { content, kidId } = payload

    // 1. Basic Validation
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return { success: false, message: '留言内容不能为空' }
    }
    if (content.length > 100) {
        return { success: false, message: '留言太长啦，请控制在100字以内' }
    }
    if (!kidId) {
        return { success: false, message: '请先选择发布留言的小朋友' }
    }
    
    // 2. Sensitive Word Filter (Basic)
    const badWords = ['脏话', '笨蛋', '坏蛋', '傻瓜', '去死'] 
    const hasBadWord = badWords.some(word => content.includes(word))
    if (hasBadWord) {
        return { success: false, message: '留言包含不文明用语，请修改' }
    }

    try {
        // 3. Fetch Kid and Family Info
        // Try to find kid by _id or id
        const kidRes = await db.collection(COLLECTIONS.KIDS)
            .where(_.or([
                { _id: kidId },
                { id: kidId }
            ]))
            .get()

        if (!kidRes.data || kidRes.data.length === 0) {
             return { success: false, message: '未找到对应的小朋友信息' }
        }
        const kid = kidRes.data[0]

        // Fetch Family
        let familyName = '未知家庭'
        let familyId = kid.family_id
        
        if (familyId) {
            try {
                const familyRes = await db.collection(COLLECTIONS.FAMILIES).doc(familyId).get()
                if (familyRes.data) {
                    familyName = familyRes.data.name
                }
            } catch (err) {
                console.warn('Failed to fetch family info', err)
            }
        }

        // 4. Write to DB
        let clientIp = 'unknown'
        if (context) {
            clientIp = context.CLIENTIP || context.ip || context.sourceIp || 'unknown'
        }

        const res = await db.collection(COLLECTIONS.MESSAGES).add({
            data: {
                content: content.trim(),
                author: {
                    nickname: kid.name || kid.nickname || '小朋友',
                    age: kid.age || 0,
                    kid_id: kid._id || kid.id, // Store the actual ID found
                    openid: openId
                },
                family: {
                    name: familyName,
                    id: familyId
                },
                created_at: db.serverDate(),
                timestamp: Date.now(),
                client_ip: clientIp
            }
        })

        return { success: true, message: '留言成功！', data: { id: res._id } }
    } catch (e) {
        console.error('发布留言失败', e)
        // Try to auto-create collection if missing
        try {
            await db.createCollection(COLLECTIONS.MESSAGES)
            return { success: false, message: '系统初始化完成，请重新发送' }
        } catch (createError) {
             return { success: false, message: `发布失败: ${e.message}`, error: e }
        }
    }
}

// 14. Get Public Messages
async function getPublicMessages(openId, payload) {
    const page = payload.page || 1
    const pageSize = payload.pageSize || 20
    const skip = (page - 1) * pageSize

    try {
        // 1. Get Total Count
        const countResult = await db.collection(COLLECTIONS.MESSAGES).count()
        const total = countResult.total

        // 2. Get Data
        const res = await db.collection(COLLECTIONS.MESSAGES)
            .orderBy('created_at', 'desc')
            .skip(skip)
            .limit(pageSize)
            .field({
                content: true,
                'author.nickname': true,
                'author.age': true,
                'family.name': true,
                created_at: true
            })
            .get()

        return {
            success: true,
            data: {
                messages: res.data,
                total: total,
                page: page,
                hasMore: (skip + res.data.length) < total
            }
        }
    } catch (e) {
        console.error('获取留言列表失败', e)
        // Try to auto-create collection if missing
        try {
             await db.createCollection(COLLECTIONS.MESSAGES)
             // Return empty list success response immediately
             return {
                success: true,
                data: {
                    messages: [],
                    total: 0,
                    page: 1,
                    hasMore: false
                },
                message: '系统初始化完成'
            }
        } catch (createError) {
             return { success: false, message: `获取留言失败: ${e.message}`, error: e }
        }
    }
}

// 11. Update Kid Name
async function handleUpdateKidName(openId, payload) {
    const { familyId, kidId, newName } = payload
    
    if (!familyId || !kidId || !newName) throw new Error('Missing parameters')
    
    // 1. Permission Check: Must be member of the family
    const userRes = await db.collection(COLLECTIONS.USERS).where({
        _openid: openId,
        family_id: familyId
    }).count()
    
    if (userRes.total === 0) throw new Error('Permission denied')
    
    // 2. Get Kid to ensure it belongs to the family
    const kidRes = await db.collection(COLLECTIONS.KIDS).doc(kidId).get()
    if (!kidRes.data) throw new Error('Kid not found')
    
    if (kidRes.data.family_id !== familyId) throw new Error('Kid does not belong to this family')
    
    // 3. Update
    await db.collection(COLLECTIONS.KIDS).doc(kidId).update({
        data: {
            name: newName
        }
    })
    
    return { success: true }
}

// 12. Update Family PIN
async function handleUpdateFamilyPin(openId, payload) {
    const { familyId, oldPin, newPin } = payload
    
    if (!familyId || !oldPin || !newPin) throw new Error('Missing parameters')
    
    // 1. Get Family
    const familyRes = await db.collection(COLLECTIONS.FAMILIES).doc(familyId).get()
    if (!familyRes.data) throw new Error('Family not found')
    
    // 2. Validate Old PIN
    if (familyRes.data.admin_pin !== hashPin(oldPin)) {
        return { success: false, message: '旧密码错误' }
    }
    
    // 3. Permission Check (Must be member)
    const userRes = await db.collection(COLLECTIONS.USERS).where({
        _openid: openId,
        family_id: familyId
    }).count()
    
    if (userRes.total === 0) throw new Error('Permission denied')
    
    // 4. Update
    await db.collection(COLLECTIONS.FAMILIES).doc(familyId).update({
        data: {
            admin_pin: hashPin(newPin)
        }
    })
    
    return { success: true }
}
