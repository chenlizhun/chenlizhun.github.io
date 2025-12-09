// 测试脚本：检查 POEMS 对象是否可用
console.log('Checking window.POEMS...');
if (typeof window !== 'undefined') {
  console.log('window exists:', window);
  console.log('POEMS exists:', typeof window.POEMS !== 'undefined');
  if (window.POEMS) {
    console.log('POEMS keys:', Object.keys(window.POEMS));
    console.log('Mountain poems count:', window.POEMS.mountain ? window.POEMS.mountain.length : 'undefined');
    if (window.POEMS.mountain && window.POEMS.mountain.length > 0) {
      console.log('First mountain poem:', window.POEMS.mountain[0]);
    }
  }
} else {
  console.log('window does not exist (this is not a browser environment)');
}