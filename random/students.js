/**
 * 学生管理模块
 * 处理学生数据的存储和管理
 */

// 默认学生数据
window.defaultStudents = [
  "赵子杰", "陈金浩", "钟浩翔", "何军标", "温彬泓", "许增灿", "李浩文", "刘家祈",
  "吴卓希", "张尚岳", "林承熙"
];

// 当前学生列表
let students = [...window.defaultStudents];
const STORAGE_KEY_STUDENTS = 'random_students';

// DOM元素
// const namesLine = window.getElement("#namesLine"); // 不再需要输出到页面
const studentInput = window.getElement("#studentInput");
const btnUpdateNames = window.getElement("#btnUpdateNames");
const btnResetNames = window.getElement("#btnResetNames");

/**
 * 获取当前学生列表
 * @returns {string[]} 当前学生数组
 */
window.getStudents = function() {
    return [...students];
};

/**
 * 设置新的学生列表
 * @param {string[]} newStudents - 新的学生数组
 */
window.setStudents = function(newStudents) {
    students = [...newStudents];
    try {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch (e) {}
    try {
        window.updateGames(); // 更新游戏中的学生名单
    } catch (error) {
        console.error('更新游戏学生名单时出错:', error);
    }
};

/**
 * 更新学生名单显示
 * 不再需要输出到页面，保留函数定义以防其他地方调用
 */
function updateNamesLine() {
    // 不再将学生名单输出到页面
    return;
}

/**
 * 更新学生名单
 */
function updateNames() {
    const next = window.parseStudentInput(studentInput.value || "");
    if (next.length > 0) {
        students = next;
        try {
            localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
        } catch (e) {}
        try {
            window.updateGames(); // 更新游戏中的学生名单
        } catch (error) {
            console.error('更新游戏学生名单时出错:', error);
        }
        alert("已更新 " + students.length + " 名学生");
    } else {
        alert("请输入有效的学生名单");
    }
}

/**
 * 重置学生名单
 */
function resetNames() {
    students = [...window.defaultStudents];
    studentInput.value = window.defaultStudents.join('、'); // 统一使用顿号分隔
    updateNamesLine();
    try {
        window.updateGames(); // 更新游戏中的学生名单
    } catch (error) {
        console.error('更新游戏学生名单时出错:', error);
    }
    try {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch (e) {}
    alert("已重置为默认学生名单");
}

/**
 * 初始化学生管理模块
 */
window.initStudents = function() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                students = parsed;
            }
        }
    } catch (e) {}
    studentInput.value = students.join('、');
    
    // 更新初始显示
    updateNamesLine();
    
    // 添加事件监听
    btnUpdateNames.addEventListener("click", updateNames);
    btnResetNames.addEventListener("click", resetNames);
};
