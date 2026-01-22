const cloud = require('wx-server-sdk')

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
  LOGS: 'ourchildren_point_logs'
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
      case 'update_family_series':
        return await handleUpdateFamilySeries(openId, payload)
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
        admin_pin: adminPin, // Should be hashed in production
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
  
  if (familyRes.data.admin_pin !== adminPin) {
      throw new Error('Invalid PIN')
  }
  
  // Check if already joined
  const existCount = await db.collection(COLLECTIONS.USERS).where({
      _openid: openId,
      family_id: familyId
  }).count()
  
  // Get Kids for this family to return full object
  const kidsRes = await db.collection(COLLECTIONS.KIDS).where({
      family_id: familyId
  }).get()

  if (existCount.total > 0) {
      return { 
          success: true, 
          message: 'Already joined', 
          familyId,
          family: {
              info: familyRes.data,
              kids: kidsRes.data || []
          }
      }
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
  
  return { 
      success: true, 
      familyId,
      family: {
          info: familyRes.data,
          kids: kidsRes.data || []
      }
  }
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
    if (familyRes.data.admin_pin !== adminPin) {
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

// 13. Update Family Series
async function handleUpdateFamilySeries(openId, payload) {
    const { familyId, seriesId } = payload
    
    if (!familyId || !seriesId) throw new Error('Missing parameters')
    
    // 1. Permission Check: Must be member
    const userRes = await db.collection(COLLECTIONS.USERS).where({
        _openid: openId,
        family_id: familyId
    }).count()
    
    if (userRes.total === 0) throw new Error('Permission denied')
    
    // 2. Update
    await db.collection(COLLECTIONS.FAMILIES).doc(familyId).update({
        data: {
            display_series: seriesId
        }
    })
    
    return { success: true }
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
    if (familyRes.data.admin_pin !== oldPin) {
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
            admin_pin: newPin
        }
    })
    
    return { success: true }
}
