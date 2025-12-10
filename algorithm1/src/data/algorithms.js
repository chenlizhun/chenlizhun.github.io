// Sample data for Algorithm1 Web App

const algorithms = [
    {
        title: "认识算法与力扣环境",
        description: "介绍算法的基本概念、时间复杂度分析以及力扣(LeetCode)平台的使用方法",
        problems: [
            {
                title: "两数之和 (LeetCode 1)",
                description: "给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出 和为目标值 target 的那 两个 整数，并返回它们的数组下标。",
                input: "整数数组 nums 和整数 target",
                output: "两个整数的数组下标",
                example: "输入: nums = [2, 7, 11, 15], target = 9\n输出: [0, 1]",
                leetCodeUrl: "https://leetcode.cn/problems/two-sum/",
                code: `class Solution { 
  List<int> twoSum(List<int> nums, int target) { 
    for (int i = 0; i < nums.length; i++) { 
      for (int j = i + 1; j < nums.length; j++) { 
        if (nums[i] + nums[j] == target) { 
          return [i, j]; 
        } 
      } 
    } 
    return []; 
  } 
}`,
                steps: [
                    {
                        title: "外层循环开始",
                        description: "设置外层循环指针 i，从数组的第一个元素开始遍历",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>外层循环索引</p><p>i = 0</p></div>"
                    },
                    {
                        title: "内层循环开始",
                        description: "设置内层循环指针 j，从 i+1 开始遍历剩余元素",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [<span class='text-blue-600'>2</span>, 7, 11, 15] <span class='text-blue-600'>(i=0)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>内层循环索引</p><p>j = 1</p></div>"
                    },
                    {
                        title: "第一次比较",
                        description: "计算 nums[0] + nums[1] = 2 + 7 = 9，与目标值 9 相等",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>计算:</strong> 2 + 7 = 9 <span class='text-green-600'>✓</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>找到匹配对！索引为0和1</div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回找到的两个元素的索引 [0, 1]",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: [0, 1]</div>"
                    }
                ]
            },
            {
                title: "存在重复元素 (LeetCode 217)",
                description: "给定一个整数数组，判断是否存在重复元素。如果存在一值在数组中出现至少两次，函数返回 true 。如果数组中每个元素都不相同，则返回 false 。",
                input: "整数数组 nums",
                output: "布尔值，表示是否存在重复元素",
                example: "输入: nums = [1, 2, 3, 1]\n输出: true",
                leetCodeUrl: "https://leetcode.cn/problems/contains-duplicate/",
                code: `bool containsDuplicate(List<int> nums) {
    Set<int> seen = {};
    for (int num in nums) {
        if (seen.contains(num)) {
            return true;
        }
        seen.add(num);
    }
    return false;
}`,
                steps: [
                    {
                        title: "初始化集合",
                        description: "创建一个空的集合来存储已遍历过的元素",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>集合</p><p>当前为空</p></div>"
                    },
                    {
                        title: "处理第一个元素 (1)",
                        description: "检查集合中是否存在1，不存在则添加",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [1, 2, 3, 1] <span class='text-blue-600'>(当前元素: 1)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>集合</p><p>1</p></div>"
                    },
                    {
                        title: "处理第二个元素 (2)",
                        description: "检查集合中是否存在2，不存在则添加",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [1, 2, 3, 1] <span class='text-blue-600'>(当前元素: 2)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>集合</p><p>1, 2</p></div>"
                    },
                    {
                        title: "处理第三个元素 (3)",
                        description: "检查集合中是否存在3，不存在则添加",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [1, 2, 3, 1] <span class='text-blue-600'>(当前元素: 3)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>集合</p><p>1, 2, 3</p></div>"
                    },
                    {
                        title: "处理第四个元素 (1)",
                        description: "检查集合中是否存在1，存在则返回true",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>比较:</strong> 1 == 1 <span class='text-green-600'>✓</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>找到重复元素！返回true</div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回是否存在重复元素的布尔值",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: true</div>"
                    }
                ]
            }
        ]
    },
    {
        title: "数组遍历与条件判断",
        description: "学习数组的基本操作，包括遍历、条件判断和基本算法实现",
        problems: [
            {
                title: "删除有序数组中的重复项 (LeetCode 26)",
                description: "给你一个有序数组 nums ，请你原地删除重复出现的元素，使每个元素只出现一次 ，返回删除后数组的新长度。",
                input: "有序整数数组 nums",
                output: "删除重复元素后的新长度",
                example: "输入: nums = [1, 1, 2]\n输出: 2, nums = [1, 2]",
                leetCodeUrl: "https://leetcode.cn/problems/remove-duplicates-from-sorted-array/",
                code: `int removeDuplicates(List<int> nums) {
    if (nums.isEmpty) {
        return 0;
    }
    
    int slow = 1;
    for (int fast = 1; fast < nums.length; fast++) {
        if (nums[fast] != nums[slow - 1]) {
            nums[slow] = nums[fast];
            slow++;
        }
    }
    
    return slow;
}`,
                steps: [
                    {
                        title: "初始化指针",
                        description: "slow指针指向当前可放置新元素的位置，fast指针用于遍历数组",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>指针状态</p><p>slow: 1, fast: 1</p></div>"
                    },
                    {
                        title: "处理第一个重复元素 (1)",
                        description: "nums[fast] == nums[slow-1]，不执行复制操作，fast指针后移",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [1, <span class='text-red-600'>1</span>, 2] <span class='text-blue-600'>(slow: 1, fast: 1)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>slow: 1, fast: 2</p></div>"
                    },
                    {
                        title: "处理新元素 (2)",
                        description: "nums[fast] != nums[slow-1]，执行复制操作，slow指针后移",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>数组:</strong> [1, <span class='text-green-600'>2</span>, 2] <span class='text-blue-600'>(slow: 1, fast: 2)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>slow: 2, fast: 3</p></div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回删除重复元素后的新长度",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: 2, nums = [1, 2]</div>"
                    }
                ]
            },
            {
                title: "移除元素 (LeetCode 27)",
                description: "给你一个数组 nums 和一个值 val，你需要原地移除所有数值等于 val 的元素，并返回移除后数组的新长度。",
                input: "整数数组 nums 和整数 val",
                output: "移除指定元素后的新长度",
                example: "输入: nums = [3, 2, 2, 3], val = 3\n输出: 2, nums = [2, 2]",
                leetCodeUrl: "https://leetcode.cn/problems/remove-element/",
                code: `int removeElement(List<int> nums, int val) {
    int slow = 0;
    for (int fast = 0; fast < nums.length; fast++) {
        if (nums[fast] != val) {
            nums[slow] = nums[fast];
            slow++;
        }
    }
    
    return slow;
}`,
                steps: [
                    {
                        title: "初始化指针",
                        description: "slow指针指向当前可放置新元素的位置，fast指针用于遍历数组",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>指针状态</p><p>slow: 0, fast: 0</p></div>"
                    },
                    {
                        title: "处理第一个待移除元素 (3)",
                        description: "nums[fast] == val，不执行复制操作，fast指针后移",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [<span class='text-red-600'>3</span>, 2, 2, 3] <span class='text-blue-600'>(slow: 0, fast: 0)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>slow: 0, fast: 1</p></div>"
                    },
                    {
                        title: "处理第一个保留元素 (2)",
                        description: "nums[fast] != val，执行复制操作，slow指针后移",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>数组:</strong> [<span class='text-green-600'>2</span>, 2, 2, 3] <span class='text-blue-600'>(slow: 0, fast: 1)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>slow: 1, fast: 2</p></div>"
                    },
                    {
                        title: "处理第二个保留元素 (2)",
                        description: "nums[fast] != val，执行复制操作，slow指针后移",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>数组:</strong> [2, <span class='text-green-600'>2</span>, 2, 3] <span class='text-blue-600'>(slow: 1, fast: 2)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>slow: 2, fast: 3</p></div>"
                    },
                    {
                        title: "处理第二个待移除元素 (3)",
                        description: "nums[fast] == val，不执行复制操作，fast指针后移",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [2, 2, 2, <span class='text-red-600'>3</span>] <span class='text-blue-600'>(slow: 2, fast: 3)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>slow: 2, fast: 4</p></div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回移除元素后的新长度",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: 2, nums = [2, 2]</div>"
                    }
                ]
            }
        ]
    },
    {
        title: "数组插入与查找",
        description: "掌握数组的插入、删除和查找操作，了解哈希表等数据结构",
        problems: [
            {
                title: "搜索插入位置 (LeetCode 35)",
                description: "给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。",
                input: "有序整数数组 nums 和整数 target",
                output: "目标值的索引或插入位置",
                example: "输入: nums = [1, 3, 5, 6], target = 5\n输出: 2",
                leetCodeUrl: "https://leetcode.cn/problems/search-insert-position/",
                code: `int searchInsert(List<int> nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) ~/ 2;
        
        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return left;
}`,
                steps: [
                    {
                        title: "初始化指针",
                        description: "left指针指向数组起始位置，right指针指向数组结束位置",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>指针状态</p><p>left: 0, right: 3</p></div>"
                    },
                    {
                        title: "第一次比较",
                        description: "计算mid=1，nums[mid]=3 < 5，调整left指针到mid+1=2",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [1, <span class='text-blue-600'>3</span>, 5, 6] <span class='text-blue-600'>(mid: 1)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>left: 2, right: 3</p></div>"
                    },
                    {
                        title: "第二次比较",
                        description: "计算mid=2，nums[mid]=5 == 5，找到目标值",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>数组:</strong> [1, 3, <span class='text-green-600'>5</span>, 6] <span class='text-blue-600'>(mid: 2)</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>找到目标值！索引为2</div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回目标值的索引",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: 2</div>"
                    }
                ]
            },
            {
                title: "加一 (LeetCode 66)",
                description: "给定一个由 整数 组成的 非空 数组所表示的非负整数，在该数的基础上加一。",
                input: "整数数组 digits，代表一个非负整数",
                output: "加一后的整数数组",
                example: "输入: digits = [1, 2, 3]\n输出: [1, 2, 4]",
                leetCodeUrl: "https://leetcode.cn/problems/plus-one/",
                code: `List<int> plusOne(List<int> digits) {
    int n = digits.length;
    
    for (int i = n - 1; i >= 0; i--) {
        if (digits[i] < 9) {
            digits[i]++;
            return digits;
        }
        digits[i] = 0;
    }
    
    List<int> result = List.filled(n + 1, 0);
    result[0] = 1;
    return result;
}`,
                steps: [
                    {
                        title: "处理最后一位 (3)",
                        description: "最后一位小于9，直接加1后返回结果",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [1, 2, <span class='text-blue-600'>3</span>] <span class='text-blue-600'>(当前位)</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>最后一位+1: 3+1=4</div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回加一后的数组",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: [1, 2, 4]</div>"
                    }
                ]
            }
        ]
    },
    {
        title: "数组合并结合排序思维",
        description: "学习数组合并技巧、排序算法的基本思想以及动态规划的初步应用",
        problems: [
            {
                title: "合并两个有序数组 (LeetCode 88)",
                description: "给你两个按 非递减顺序 排列的整数数组 nums1 和 nums2，另有两个整数 m 和 n ，分别表示 nums1 和 nums2 中的元素数目。请你 合并 nums2 到 nums1 中，使合并后的数组同样按 非递减顺序 排列。",
                input: "有序整数数组 nums1, nums2，以及整数 m, n",
                output: "合并后的有序数组 nums1",
                example: "输入: nums1 = [1, 2, 3, 0, 0, 0], m = 3, nums2 = [2, 5, 6], n = 3\n输出: [1, 2, 2, 3, 5, 6]",
                leetCodeUrl: "https://leetcode.cn/problems/merge-sorted-array/",
                code: `void merge(List<int> nums1, int m, List<int> nums2, int n) {
    int i = m - 1; // nums1 有效部分末尾
    int j = n - 1; // nums2 末尾
    int k = m + n - 1; // 合并后的末尾

    while (j >= 0) {
        if (i >= 0 && nums1[i] > nums2[j]) {
            nums1[k--] = nums1[i--];
        } else {
            nums1[k--] = nums2[j--];
        }
    }
}`,
                steps: [
                    {
                        title: "初始化指针",
                        description: "i指向nums1的最后一个有效元素，j指向nums2的最后一个元素，k指向nums1的最后一个位置",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>指针状态</p><p>i: 2, j: 2, k: 5</p></div>"
                    },
                    {
                        title: "第一次比较",
                        description: "nums1[i]=3 < nums2[j]=6，将6放到nums1[k]位置",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>nums1:</strong> [1, 2, 3, 0, 0, <span class='text-green-600'>6</span>] <span class='text-blue-600'>(i: 2, j: 2, k: 5)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>i: 2, j: 1, k: 4</p></div>"
                    },
                    {
                        title: "第二次比较",
                        description: "nums1[i]=3 < nums2[j]=5，将5放到nums1[k]位置",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>nums1:</strong> [1, 2, 3, 0, <span class='text-green-600'>5</span>, 6] <span class='text-blue-600'>(i: 2, j: 1, k: 4)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>i: 2, j: 0, k: 3</p></div>"
                    },
                    {
                        title: "第三次比较",
                        description: "nums1[i]=3 > nums2[j]=2，将3放到nums1[k]位置",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>nums1:</strong> [1, 2, 3, <span class='text-green-600'>3</span>, 5, 6] <span class='text-blue-600'>(i: 2, j: 0, k: 3)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>i: 1, j: 0, k: 2</p></div>"
                    },
                    {
                        title: "第四次比较",
                        description: "nums1[i]=2 == nums2[j]=2，将2放到nums1[k]位置",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>nums1:</strong> [1, 2, <span class='text-green-600'>2</span>, 3, 5, 6] <span class='text-blue-600'>(i: 1, j: 0, k: 2)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>i: 1, j: -1, k: 1</p></div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回合并后的有序数组nums1",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: [1, 2, 2, 3, 5, 6]</div>"
                    }
                ]
            },
            {
                title: "移动零 (LeetCode 283)",
                description: "给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。",
                input: "整数数组 nums",
                output: "移动零后的数组",
                example: "输入: nums = [0, 1, 0, 3, 12]\n输出: [1, 3, 12, 0, 0]",
                leetCodeUrl: "https://leetcode.cn/problems/move-zeroes/",
                code: `void moveZeroes(List<int> nums) {
    int slow = 0;
    
    for (int fast = 0; fast < nums.length; fast++) {
        if (nums[fast] != 0) {
            nums[slow] = nums[fast];
            slow++;
        }
    }
    
    for (int i = slow; i < nums.length; i++) {
        nums[i] = 0;
    }
}`,
                steps: [
                    {
                        title: "初始化指针",
                        description: "slow指针指向当前可放置非零元素的位置，fast指针用于遍历数组",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>指针状态</p><p>slow: 0, fast: 0</p></div>"
                    },
                    {
                        title: "处理第一个零元素",
                        description: "nums[fast] == 0，不执行复制操作，fast指针后移",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [<span class='text-red-600'>0</span>, 1, 0, 3, 12] <span class='text-blue-600'>(slow: 0, fast: 0)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>slow: 0, fast: 1</p></div>"
                    },
                    {
                        title: "处理第一个非零元素 (1)",
                        description: "nums[fast] != 0，执行复制操作，slow指针后移",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>数组:</strong> [<span class='text-green-600'>1</span>, 1, 0, 3, 12] <span class='text-blue-600'>(slow: 0, fast: 1)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>slow: 1, fast: 2</p></div>"
                    },
                    {
                        title: "处理第二个零元素",
                        description: "nums[fast] == 0，不执行复制操作，fast指针后移",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [1, 1, <span class='text-red-600'>0</span>, 3, 12] <span class='text-blue-600'>(slow: 1, fast: 2)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>slow: 1, fast: 3</p></div>"
                    },
                    {
                        title: "处理第二个非零元素 (3)",
                        description: "nums[fast] != 0，执行复制操作，slow指针后移",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>数组:</strong> [1, <span class='text-green-600'>3</span>, 0, 3, 12] <span class='text-blue-600'>(slow: 1, fast: 3)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>slow: 2, fast: 4</p></div>"
                    },
                    {
                        title: "处理第三个非零元素 (12)",
                        description: "nums[fast] != 0，执行复制操作，slow指针后移",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>数组:</strong> [1, 3, <span class='text-green-600'>12</span>, 3, 12] <span class='text-blue-600'>(slow: 2, fast: 4)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>slow: 3, fast: 5</p></div>"
                    },
                    {
                        title: "填充剩余位置为零",
                        description: "将slow指针之后的所有位置填充为0",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [1, 3, 12, <span class='text-red-600'>0</span>, <span class='text-red-600'>0</span>] <span class='text-blue-600'>(填充后)</span></div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回移动零后的数组",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: [1, 3, 12, 0, 0]</div>"
                    }
                ]
            },
            {
                title: "选择排序思想 (Select Sort)",
                description: "选择排序是一种简单直观的排序算法，它的工作原理是每次从待排序的数据元素中选出最小（或最大）的一个元素，存放在序列的起始位置，直到全部待排序的数据元素排完。",
                input: "无序整数数组 nums",
                output: "有序整数数组",
                example: "输入: nums = [64, 25, 12, 22, 11]\n输出: [11, 12, 22, 25, 64]",
                leetCodeUrl: "",
                code: `List<int> selectionSort(List<int> nums) {
    int n = nums.length;
    
    for (int i = 0; i < n - 1; i++) {
        int minIndex = i;
        
        for (int j = i + 1; j < n; j++) {
            if (nums[j] < nums[minIndex]) {
                minIndex = j;
            }
        }
        
        if (minIndex != i) {
            int temp = nums[i];
            nums[i] = nums[minIndex];
            nums[minIndex] = temp;
        }
    }
    
    return nums;
}`,
                steps: [
                    {
                        title: "第一轮选择",
                        description: "找到最小元素11，与第一个元素64交换",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [<span class='text-red-600'>64</span>, 25, 12, 22, <span class='text-green-600'>11</span>] <span class='text-blue-600'>(第一轮)</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>交换后: [11, 25, 12, 22, 64]</div>"
                    },
                    {
                        title: "第二轮选择",
                        description: "找到剩余元素中的最小元素12，与第二个元素25交换",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [11, <span class='text-red-600'>25</span>, <span class='text-green-600'>12</span>, 22, 64] <span class='text-blue-600'>(第二轮)</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>交换后: [11, 12, 25, 22, 64]</div>"
                    },
                    {
                        title: "第三轮选择",
                        description: "找到剩余元素中的最小元素22，与第三个元素25交换",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [11, 12, <span class='text-red-600'>25</span>, <span class='text-green-600'>22</span>, 64] <span class='text-blue-600'>(第三轮)</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>交换后: [11, 12, 22, 25, 64]</div>"
                    },
                    {
                        title: "第四轮选择",
                        description: "找到剩余元素中的最小元素25，位置不变",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [11, 12, 22, <span class='text-green-600'>25</span>, <span class='text-red-600'>64</span>] <span class='text-blue-600'>(第四轮)</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>无需交换: [11, 12, 22, 25, 64]</div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回排序后的数组",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: [11, 12, 22, 25, 64]</div>"
                    }
                ]
            }
        ]
    },
    {
        title: "字符串处理与前缀匹配",
        description: "学习字符串的基本操作、前缀匹配算法以及相关应用场景",
        problems: [
            {
                title: "最长公共前缀 (LeetCode 14)",
                description: "编写一个函数来查找字符串数组中的最长公共前缀。如果不存在公共前缀，返回空字符串 \"\"。",
                input: "字符串数组 strs",
                output: "字符串，表示最长公共前缀",
                example: "输入: strs = [\"flower\", \"flow\", \"flight\"]\n输出: \"fl\"",
                leetCodeUrl: "https://leetcode.cn/problems/longest-common-prefix/",
                code: `class Solution { 
   String longestCommonPrefix(List<String> strs) { 
     if (strs.isEmpty) return ""; 
     String prefix = strs[0]; 
     for (int i = 1; i < strs.length; i++) { 
       while (!strs[i].startsWith(prefix)) { 
         prefix = prefix.substring(0, prefix.length - 1); 
         if (prefix.isEmpty) return ""; 
       } 
     } 
     return prefix; 
   } 
 }`,
                steps: [
                    {
                        title: "初始化前缀",
                        description: "将第一个字符串作为初始前缀",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>初始前缀</p><p>flower</p></div>"
                    },
                    {
                        title: "处理第二个字符串 (flow)",
                        description: "检查\"flow\"是否以\"flower\"开头，不是则缩短前缀",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> flow.startsWith(flower) = false <span class='text-red-600'>✗</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>缩短前缀</p><p>flower → flowe</p></div>"
                    },
                    {
                        title: "继续检查第二个字符串",
                        description: "检查\"flow\"是否以\"flowe\"开头，不是则继续缩短前缀",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> flow.startsWith(flowe) = false <span class='text-red-600'>✗</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>缩短前缀</p><p>flowe → flow</p></div>"
                    },
                    {
                        title: "匹配第二个字符串",
                        description: "检查\"flow\"是否以\"flow\"开头，是则继续处理下一个字符串",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>比较:</strong> flow.startsWith(flow) = true <span class='text-green-600'>✓</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>当前公共前缀: flow</div>"
                    },
                    {
                        title: "处理第三个字符串 (flight)",
                        description: "检查\"flight\"是否以\"flow\"开头，不是则缩短前缀",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> flight.startsWith(flow) = false <span class='text-red-600'>✗</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>缩短前缀</p><p>flow → flo</p></div>"
                    },
                    {
                        title: "继续处理第三个字符串",
                        description: "检查\"flight\"是否以\"flo\"开头，不是则继续缩短前缀",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> flight.startsWith(flo) = false <span class='text-red-600'>✗</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>缩短前缀</p><p>flo → fl</p></div>"
                    },
                    {
                        title: "匹配第三个字符串",
                        description: "检查\"flight\"是否以\"fl\"开头，是则完成遍历",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>比较:</strong> flight.startsWith(fl) = true <span class='text-green-600'>✓</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>最终公共前缀: fl</div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回找到的最长公共前缀",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: \"fl\"</div>"
                    }
                ]
            },
            {
                title: "验证回文串 (LeetCode 125)",
                description: "给定一个字符串 s ，验证它是否是回文串，只考虑字母和数字字符，可以忽略字母的大小写。",
                input: "字符串 s",
                output: "布尔值，表示是否为回文串",
                example: "输入: s = \"A man, a plan, a canal: Panama\"\n输出: true\n解释: \"amanaplanacanalpanama\" 是回文串。",
                leetCodeUrl: "https://leetcode.cn/problems/valid-palindrome/",
                code: `class Solution { 
  bool isPalindrome(String s) { 
    s = s.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '').toLowerCase(); 
    int l = 0, r = s.length - 1; 
    while (l < r) { 
      if (s[l] != s[r]) return false; 
      l++; 
      r--; 
    } 
    return true; 
  } 
}`,
                steps: [
                    {
                        title: "预处理字符串",
                        description: "移除所有非字母数字字符并将字符串转换为小写",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>原字符串</p><p>\"A man, a plan, a canal: Panama\"</p></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>处理后: \"amanaplanacanalpanama\"</div>"
                    },
                    {
                        title: "初始化双指针",
                        description: "左指针l指向字符串开始，右指针r指向字符串末尾",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>字符串:</strong> <span class='text-blue-600'>a</span>manaplanacanalpanama <span class='text-blue-600'>(l: 0, r: 20)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>l: 0, r: 20</p></div>"
                    },
                    {
                        title: "第一次比较",
                        description: "比较左右指针指向的字符，相同则继续移动指针",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>比较:</strong> s[0]='a' == s[20]='a' <span class='text-green-600'>✓</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针移动</p><p>l: 1, r: 19</p></div>"
                    },
                    {
                        title: "第二次比较",
                        description: "继续比较左右指针指向的字符，相同则继续移动指针",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>比较:</strong> s[1]='m' == s[19]='m' <span class='text-green-600'>✓</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针移动</p><p>l: 2, r: 18</p></div>"
                    },
                    {
                        title: "持续比较",
                        description: "重复比较过程，直到左右指针相遇或发现不匹配字符",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>过程:</strong> 持续比较字符对...</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态变化</p><p>l: ..., r: ...</p></div>"
                    },
                    {
                        title: "指针相遇",
                        description: "当左指针大于等于右指针时，说明所有字符都匹配，是回文串",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>状态:</strong> l >= r</div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: true (是回文串)</div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回true表示该字符串是回文串",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>最终结果: true</div>"
                    }
                ]
            }
        ]
    },
    {
        title: "括号与栈的基础",
        description: "学习栈数据结构的基本概念和应用，掌握括号匹配等经典问题的解决方法",
        problems: [
            {
                title: "有效的括号 (LeetCode 20)",
                description: "给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效。有效字符串需满足：左括号必须用相同类型的右括号闭合，左括号必须以正确的顺序闭合，每个右括号都有一个对应的相同类型的左括号。",
                input: "字符串 s，仅包含括号字符",
                output: "布尔值，表示字符串是否有效",
                example: "输入: s = \"()[]{}\"\n输出: true\n\n输入: s = \"([)]\"\n输出: false",
                leetCodeUrl: "https://leetcode.cn/problems/valid-parentheses/",
                code: `class Solution { 
  bool isValid(String s) { 
    List<String> stack = []; 
    Map<String, String> pairs = { 
      ')': '(', 
      ']': '[', 
      '}': '{', 
    }; 
  
    for (var c in s.split('')) { 
      if (pairs.containsValue(c)) { 
        // 左括号入栈 
        stack.add(c); 
      } else if (pairs.containsKey(c)) { 
        // 右括号检查匹配 
        if (stack.isEmpty || stack.removeLast() != pairs[c]) { 
          return false; 
        } 
      } 
    } 
    return stack.isEmpty; 
  } 
 }`,
                steps: [
                    {
                        title: "初始化栈和映射关系",
                        description: "创建空栈用于存储左括号，建立右括号到左括号的映射关系",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>栈状态</p><p>[]</p></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>映射关系</p><p>')'→'(', ']'→'[', '}'→'{'</p></div>"
                    },
                    {
                        title: "处理第一个字符 '('",
                        description: "遇到左括号'('，将其压入栈中",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>字符:</strong> <span class='text-blue-600'>(</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>栈操作: 入栈'('</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>栈状态</p><p>['(']</p></div>"
                    },
                    {
                        title: "处理第二个字符 '['",
                        description: "遇到左括号'['，将其压入栈中",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>字符:</strong> <span class='text-blue-600'>[</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>栈操作: 入栈'['</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>栈状态</p><p>['(', '[']</p></div>"
                    },
                    {
                        title: "处理第三个字符 '{'",
                        description: "遇到左括号'{'，将其压入栈中",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>字符:</strong> <span class='text-blue-600'>{</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>栈操作: 入栈'{'</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>栈状态</p><p>['(', '[', '{']</p></div>"
                    },
                    {
                        title: "处理第四个字符 '}'",
                        description: "遇到右括号'}'，检查栈顶元素是否匹配",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>字符:</strong> <span class='text-red-600'>}</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>栈顶元素</p><p>'{'</p></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>匹配成功: 出栈'{'</div>"
                    },
                    {
                        title: "处理第五个字符 ']'",
                        description: "遇到右括号']'，检查栈顶元素是否匹配",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>字符:</strong> <span class='text-red-600'>]</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>栈顶元素</p><p>'['</p></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>匹配成功: 出栈'['</div>"
                    },
                    {
                        title: "处理第六个字符 ')'",
                        description: "遇到右括号')'，检查栈顶元素是否匹配",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>字符:</strong> <span class='text-red-600'>)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>栈顶元素</p><p>'('</p></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>匹配成功: 出栈'('</div>"
                    },
                    {
                        title: "检查栈状态",
                        description: "遍历完成后检查栈是否为空，空则说明所有括号都正确匹配",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>栈状态</p><p>[]</p></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>栈为空，所有括号匹配成功</div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回true表示字符串是有效的括号序列",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: true</div>"
                    }
                ]
            },
            {
                title: "用栈实现队列 (LeetCode 232)",
                description: "请你仅使用两个栈实现先入先出队列。队列应当支持一般队列支持的所有操作（push、pop、peek、empty）。",
                input: "一系列push、pop、peek、empty操作",
                output: "对应操作的返回值",
                example: "输入:\n[\"MyQueue\", \"push\", \"push\", \"peek\", \"pop\", \"empty\"]\n[[], [1], [2], [], [], []]\n输出:\n[null, null, null, 1, 1, false]",
                leetCodeUrl: "https://leetcode.cn/problems/implement-queue-using-stacks/",
                code: `class MyQueue { 
  List<int> inStack = []; 
  List<int> outStack = []; 
  
  void push(int x) { 
    inStack.add(x); 
  } 
  
  int pop() { 
    if (outStack.isEmpty) { 
      while (inStack.isNotEmpty) { 
        outStack.add(inStack.removeLast()); 
      } 
    } 
    return outStack.removeLast(); 
  } 
  
  int peek() { 
    if (outStack.isEmpty) { 
      while (inStack.isNotEmpty) { 
        outStack.add(inStack.removeLast()); 
      } 
    } 
    return outStack.last; 
  } 
  
  bool empty() { 
    return inStack.isEmpty && outStack.isEmpty; 
  } 
 }`,
                steps: [
                    {
                        title: "初始化两个栈",
                        description: "创建输入栈(inStack)和输出栈(outStack)用于实现队列",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>数据结构</p><p>inStack: []</p><p>outStack: []</p></div>"
                    },
                    {
                        title: "Push操作",
                        description: "将元素压入输入栈，保持栈的特性",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>Push 1:</strong> inStack.add(1)</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>栈状态</p><p>inStack: [1]</p><p>outStack: []</p></div>"
                    },
                    {
                        title: "再次Push操作",
                        description: "继续将元素压入输入栈",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>Push 2:</strong> inStack.add(2)</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>栈状态</p><p>inStack: [1, 2]</p><p>outStack: []</p></div>"
                    },
                    {
                        title: "Pop操作",
                        description: "当输出栈为空时，将输入栈的所有元素转移到输出栈",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>Pop:</strong> 转移元素</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>转移过程</p><p>inStack: [1, 2] → inStack: []</p><p>outStack: [] → outStack: [2, 1]</p></div>"
                    },
                    {
                        title: "执行Pop",
                        description: "从输出栈弹出顶部元素，即为队列的第一个元素",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>Pop:</strong> outStack.removeLast() = 1</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>栈状态</p><p>inStack: []</p><p>outStack: [2]</p></div>"
                    },
                    {
                        title: "Peek操作",
                        description: "查看队列的第一个元素但不移除它",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>Peek:</strong> outStack.last = 2</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>栈状态</p><p>inStack: []</p><p>outStack: [2]</p></div>"
                    },
                    {
                        title: "Empty操作",
                        description: "检查两个栈是否都为空来判断队列是否为空",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>Empty:</strong> inStack.isEmpty && outStack.isEmpty</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>检查结果</p><p>inStack: [] (isEmpty: true)</p><p>outStack: [2] (isEmpty: false)</p><p>结果: false</p></div>"
                    },
                    {
                        title: "返回结果",
                        description: "根据操作类型返回相应的结果",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>操作完成，返回相应结果</div>"
                    }
                ]
            }
        ]
    },
    {
        title: "哈希表与查找",
        description: "学习哈希表数据结构的基本概念和应用，掌握基于哈希表的高效查找算法",
        problems: [
            {
                title: "有效的字母异位词 (LeetCode 242)",
                description: "给定两个字符串 s 和 t ，编写一个函数来判断 t 是否是 s 的字母异位词。若 s 和 t 中每个字符出现的次数都相同，则称 s 和 t 互为字母异位词。",
                input: "两个字符串 s 和 t",
                output: "布尔值，表示 t 是否是 s 的字母异位词",
                example: "输入: s = \"anagram\", t = \"nagaram\"\n输出: true\n\n输入: s = \"rat\", t = \"car\"\n输出: false",
                leetCodeUrl: "https://leetcode.cn/problems/valid-anagram/",
                code: `class Solution { 
  bool isAnagram(String s, String t) { 
    if (s.length != t.length) return false; 
  
    Map<String, int> count = {}; 
    for (var c in s.split('')) { 
      count[c] = (count[c] ?? 0) + 1; 
    } 
  
    for (var c in t.split('')) { 
      if (!count.containsKey(c)) return false; 
      count[c] = count[c]! - 1; 
      if (count[c]! < 0) return false; 
    } 
  
    return true; 
  } 
 }`,
                steps: [
                    {
                        title: "长度检查",
                        description: "首先检查两个字符串长度是否相等，不相等则直接返回false",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> s.length = 6, t.length = 6</div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>长度相等，继续检查</div>"
                    },
                    {
                        title: "初始化哈希表",
                        description: "创建一个空的哈希表用于统计字符出现次数",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>哈希表</p><p>{}</p></div>"
                    },
                    {
                        title: "统计字符串s的字符",
                        description: "遍历字符串s，统计每个字符出现的次数",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理字符串s:</strong> \"anagram\"</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>哈希表更新过程</p><p>'a': 1 → 'a': 2 → 'a': 3</p><p>'n': 1, 'g': 1, 'r': 1, 'm': 1</p></div>"
                    },
                    {
                        title: "检查字符串t的字符",
                        description: "遍历字符串t，检查每个字符是否在哈希表中，并减少计数",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理字符串t:</strong> \"nagaram\"</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>哈希表更新过程</p><p>'n': 1→0, 'a': 3→2→1→0</p><p>'g': 1→0, 'r': 1→0, 'm': 1→0</p></div>"
                    },
                    {
                        title: "验证计数",
                        description: "检查是否有字符计数变为负数，如果有则不是字母异位词",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>检查:</strong> 所有字符计数≥0</div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>无负数计数，验证通过</div>"
                    },
                    {
                        title: "返回结果",
                        description: "所有检查通过，返回true表示t是s的字母异位词",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: true</div>"
                    }
                ]
            },
            {
                title: "存在重复元素 II (LeetCode 219)",
                description: "给你一个整数数组 nums 和一个整数 k ，判断数组中是否存在两个不同的索引 i 和 j ，满足 nums[i] == nums[j] 且 abs(i - j) <= k 。如果存在，返回 true ；否则，返回 false 。",
                input: "整数数组 nums 和整数 k",
                output: "布尔值，表示是否存在符合条件的重复元素",
                example: "输入: nums = [1,2,3,1], k = 3\n输出: true\n\n输入: nums = [1,0,1,1], k = 1\n输出: true\n\n输入: nums = [1,2,3,1,2,3], k = 2\n输出: false",
                leetCodeUrl: "https://leetcode.cn/problems/contains-duplicate-ii/",
                code: `class Solution { 
  bool containsNearbyDuplicate(List<int> nums, int k) { 
    Map<int, int> map = {}; 
    for (int i = 0; i < nums.length; i++) { 
      if (map.containsKey(nums[i]) && (i - map[nums[i]]!) <= k) { 
        return true; 
      } 
      map[nums[i]] = i; 
    } 
    return false; 
  } 
 }`,
                steps: [
                    {
                        title: "初始化哈希表",
                        description: "创建一个空的哈希表用于存储元素值和其最近一次出现的索引",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>哈希表</p><p>{}</p></div>"
                    },
                    {
                        title: "处理第一个元素 1",
                        description: "遍历数组第一个元素，将其值和索引存入哈希表",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>索引:</strong> 0, <strong>元素:</strong> 1</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>哈希表更新</p><p>{1: 0}</p></div>"
                    },
                    {
                        title: "处理第二个元素 2",
                        description: "遍历数组第二个元素，检查是否已存在且满足索引差条件",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>索引:</strong> 1, <strong>元素:</strong> 2</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>检查</p><p>元素2不存在于哈希表</p></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>哈希表更新</p><p>{1: 0, 2: 1}</p></div>"
                    },
                    {
                        title: "处理第三个元素 3",
                        description: "遍历数组第三个元素，检查是否已存在且满足索引差条件",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>索引:</strong> 2, <strong>元素:</strong> 3</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>检查</p><p>元素3不存在于哈希表</p></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>哈希表更新</p><p>{1: 0, 2: 1, 3: 2}</p></div>"
                    },
                    {
                        title: "处理第四个元素 1",
                        description: "遍历数组第四个元素，检查是否已存在且满足索引差条件",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>索引:</strong> 3, <strong>元素:</strong> 1</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>检查</p><p>元素1存在于哈希表，索引为0</p></div><div class='bg-green-100 p-3 rounded mb-2'><strong>距离计算:</strong> |3 - 0| = 3 ≤ k(3)</div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>满足条件，返回true</div>"
                    },
                    {
                        title: "返回结果",
                        description: "找到满足条件的重复元素，返回true",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: true</div>"
                    }
                ]
            }
        ]
    },
    {
        title: "数学与逻辑判断",
        description: "学习基础数学运算和逻辑判断技巧，掌握数字处理相关的算法问题",
        problems: [
            {
                title: "回文数 (LeetCode 9)",
                description: "给你一个整数 x ，如果 x 是一个回文整数，返回 true ；否则，返回 false 。回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。例如，121 是回文，而 123 不是。",
                input: "整数 x",
                output: "布尔值，表示 x 是否为回文数",
                example: "输入: x = 121\n输出: true\n\n输入: x = -121\n输出: false\n解释: 从左向右读, 为 -121 。 从右向左读, 为 121- 。因此它不是一个回文数。\n\n输入: x = 10\n输出: false\n解释: 从右向左读, 为 01 。因此它不是一个回文数。",
                leetCodeUrl: "https://leetcode.cn/problems/palindrome-number/",
                code: `class Solution { 
  bool isPalindrome(int x) { 
    if (x < 0) return false; 
  
    int original = x; 
    int reversed = 0; 
    while (x != 0) { 
      int digit = x % 10; 
      reversed = reversed * 10 + digit; 
      x ~/= 10; 
    } 
  
    return original == reversed; 
  } 
 }`,
                steps: [
                    {
                        title: "负数检查",
                        description: "首先检查输入是否为负数，负数不可能是回文数",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>检查:</strong> x = 121 ≥ 0</div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>非负数，继续检查</div>"
                    },
                    {
                        title: "保存原始值",
                        description: "保存原始数值用于后续比较",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>变量初始化</p><p>original = 121</p><p>reversed = 0</p></div>"
                    },
                    {
                        title: "提取最后一位数字",
                        description: "使用模运算(%)提取数字的最后一位",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第一次迭代:</strong> digit = 121 % 10 = 1</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>变量更新</p><p>reversed = 0 * 10 + 1 = 1</p><p>x = 121 ~/ 10 = 12</p></div>"
                    },
                    {
                        title: "构建反转数",
                        description: "将提取的数字添加到反转数的末尾",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第二次迭代:</strong> digit = 12 % 10 = 2</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>变量更新</p><p>reversed = 1 * 10 + 2 = 12</p><p>x = 12 ~/ 10 = 1</p></div>"
                    },
                    {
                        title: "继续处理剩余数字",
                        description: "重复提取和构建过程直到处理完所有数字",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第三次迭代:</strong> digit = 1 % 10 = 1</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>变量更新</p><p>reversed = 12 * 10 + 1 = 121</p><p>x = 1 ~/ 10 = 0</p></div>"
                    },
                    {
                        title: "比较原始数与反转数",
                        description: "比较原始数值与构建的反转数是否相等",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> original(121) == reversed(121)</div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>相等，是回文数</div>"
                    }
                ]
            },
            {
                title: "x 的平方根 (LeetCode 69)",
                description: "给你一个非负整数 x ，计算并返回 x 的算术平方根。由于返回类型是整数，结果只保留整数部分，小数部分将被舍去。",
                input: "非负整数 x",
                output: "x 的算术平方根的整数部分",
                example: "输入: x = 4\n输出: 2\n\n输入: x = 8\n输出: 2\n解释: 8 的算术平方根是 2.82842..., 由于返回类型是整数，小数部分将被舍去。",
                leetCodeUrl: "https://leetcode.cn/problems/sqrtx/",
                code: `class Solution { 
  int mySqrt(int x) { 
    if (x < 2) return x; 
    int left = 1, right = x ~/ 2, ans = 0; 
  
    while (left <= right) { 
      int mid = (left + right) ~/ 2; 
      int sq = mid * mid; 
      if (sq == x) return mid; 
      if (sq < x) { 
        ans = mid; 
        left = mid + 1; 
      } else { 
        right = mid - 1; 
      } 
    } 
    return ans; 
  } 
 }`,
                steps: [
                    {
                        title: "边界情况处理",
                        description: "处理特殊情况，当x小于2时，直接返回x",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>检查:</strong> x = 8 ≥ 2</div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>需要进一步计算</div>"
                    },
                    {
                        title: "初始化搜索范围",
                        description: "设置二分查找的左右边界，右边界设为x的一半",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>初始变量</p><p>left = 1</p><p>right = 4</p><p>ans = 0</p></div>"
                    },
                    {
                        title: "第一次二分查找",
                        description: "计算中间值mid，比较mid的平方与x的大小关系",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第一次迭代:</strong> mid = (1 + 4) ~/ 2 = 2</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>比较</p><p>sq = 2 * 2 = 4</p><p>4 < 8</p></div>"
                    },
                    {
                        title: "更新答案和搜索范围",
                        description: "由于平方小于x，更新答案并向右搜索",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> ans = 2</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>搜索范围</p><p>left = 2 + 1 = 3</p><p>right = 4</p></div>"
                    },
                    {
                        title: "第二次二分查找",
                        description: "继续二分查找，计算新的中间值",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第二次迭代:</strong> mid = (3 + 4) ~/ 2 = 3</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>比较</p><p>sq = 3 * 3 = 9</p><p>9 > 8</p></div>"
                    },
                    {
                        title: "调整搜索范围",
                        description: "由于平方大于x，向左搜索",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>搜索范围</p><p>left = 3</p><p>right = 3 - 1 = 2</p></div><div class='bg-gray-100 p-3 rounded mb-2'><strong>检查:</strong> left(3) > right(2)</div>"
                    },
                    {
                        title: "返回结果",
                        description: "循环结束，返回记录的答案",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: 2</div>"
                    }
                ]
            }
        ]
    },
    {
        title: "模拟与遍历练习",
        description: "通过模拟实际场景问题，练习数组遍历和状态跟踪技巧",
        problems: [
            {
                title: "买卖股票的最佳时机 (LeetCode 121)",
                description: "给定一个数组 prices ，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。你只能选择某一天买入这只股票，并选择在未来的某一个不同的日子卖出该股票。设计一个算法来计算你所能获取的最大利润。返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0 。",
                input: "整数数组 prices ，表示股票每天的价格",
                output: "能获取的最大利润值",
                example: "输入: [7,1,5,3,6,4]\n输出: 5\n解释: 在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。\n\n输入: [7,6,4,3,1]\n输出: 0\n解释: 在这种情况下, 没有交易完成, 所以最大利润为 0。",
                leetCodeUrl: "https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/",
                code: `class Solution { 
  int maxProfit(List<int> prices) { 
    int minPrice = 1 << 30; // 初始化为极大值 
    int maxProfit = 0; 
  
    for (int p in prices) { 
      if (p < minPrice) { 
        minPrice = p; 
      } else if (p - minPrice > maxProfit) { 
        maxProfit = p - minPrice; 
      } 
    } 
    return maxProfit; 
  } 
 }`,
                steps: [
                    {
                        title: "初始化变量",
                        description: "设置最低价格为极大值，最大利润为0",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>初始状态</p><p>minPrice = ∞</p><p>maxProfit = 0</p></div>"
                    },
                    {
                        title: "处理第一天价格",
                        description: "遍历第一天价格7，更新最低价格",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第1天:</strong> 价格 = 7</div><div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> minPrice = 7</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>当前状态</p><p>minPrice = 7</p><p>maxProfit = 0</p></div>"
                    },
                    {
                        title: "处理第二天价格",
                        description: "遍历第二天价格1，更新最低价格",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第2天:</strong> 价格 = 1</div><div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> minPrice = 1 (1 < 7)</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>当前状态</p><p>minPrice = 1</p><p>maxProfit = 0</p></div>"
                    },
                    {
                        title: "处理第三天价格",
                        description: "遍历第三天价格5，计算利润并更新最大利润",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第3天:</strong> 价格 = 5</div><div class='bg-green-100 p-3 rounded mb-2'><strong>计算利润:</strong> 5 - 1 = 4</div><div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> maxProfit = 4 (4 > 0)</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>当前状态</p><p>minPrice = 1</p><p>maxProfit = 4</p></div>"
                    },
                    {
                        title: "处理第四天价格",
                        description: "遍历第四天价格3，计算利润",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第4天:</strong> 价格 = 3</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>计算利润:</strong> 3 - 1 = 2</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> 2 < 4 (不更新)</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>当前状态</p><p>minPrice = 1</p><p>maxProfit = 4</p></div>"
                    },
                    {
                        title: "处理第五天价格",
                        description: "遍历第五天价格6，计算利润并更新最大利润",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第5天:</strong> 价格 = 6</div><div class='bg-green-100 p-3 rounded mb-2'><strong>计算利润:</strong> 6 - 1 = 5</div><div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> maxProfit = 5 (5 > 4)</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>当前状态</p><p>minPrice = 1</p><p>maxProfit = 5</p></div>"
                    },
                    {
                        title: "处理第六天价格",
                        description: "遍历第六天价格4，计算利润",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第6天:</strong> 价格 = 4</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>计算利润:</strong> 4 - 1 = 3</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> 3 < 5 (不更新)</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>最终状态</p><p>minPrice = 1</p><p>maxProfit = 5</p></div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回计算得到的最大利润",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: 5</div>"
                    }
                ]
            },
            {
                title: "快乐数 (LeetCode 202)",
                description: "编写一个算法来判断一个数 n 是不是快乐数。快乐数定义如下：对于一个正整数，每一次将该数替换为它每个位置上的数字的平方和，然后重复这个过程直到这个数变为 1，也可能是无限循环但始终变不到 1。如果这个过程结果为 1，那么这个数就是快乐数。",
                input: "正整数 n",
                output: "布尔值，表示 n 是否为快乐数",
                example: "输入: n = 19\n输出: true\n解释:\n1² + 9² = 82\n8² + 2² = 68\n6² + 8² = 100\n1² + 0² + 0² = 1\n\n输入: n = 2\n输出: false",
                leetCodeUrl: "https://leetcode.cn/problems/happy-number/",
                code: `class Solution { 
  bool isHappy(int n) { 
    Set<int> seen = {}; 
  
    int getNext(int x) { 
      int sum = 0; 
      while (x > 0) { 
        int d = x % 10; 
        sum += d * d; 
        x ~/= 10; 
      } 
      return sum; 
    } 
  
    while (n != 1 && !seen.contains(n)) { 
      seen.add(n); 
      n = getNext(n); 
    } 
    return n == 1; 
  } 
 }`,
                steps: [
                    {
                        title: "初始化集合",
                        description: "创建一个空集合用于存储已经出现过的数字，检测循环",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>初始状态</p><p>seen = {}</p><p>n = 19</p></div>"
                    },
                    {
                        title: "第一次计算",
                        description: "计算19各位数字的平方和：1² + 9² = 1 + 81 = 82",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>计算getNext(19):</strong></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>过程</p><p>19 % 10 = 9, sum = 0 + 9² = 81</p><p>19 ~/ 10 = 1</p><p>1 % 10 = 1, sum = 81 + 1² = 82</p><p>1 ~/ 10 = 0</p></div><div class='bg-green-100 p-3 rounded mb-2'><strong>结果:</strong> getNext(19) = 82</div>"
                    },
                    {
                        title: "更新状态",
                        description: "将19加入已见集合，更新n为82",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> seen = {19}</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>新状态</p><p>n = 82</p></div>"
                    },
                    {
                        title: "第二次计算",
                        description: "计算82各位数字的平方和：8² + 2² = 64 + 4 = 68",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>计算getNext(82):</strong></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>过程</p><p>82 % 10 = 2, sum = 0 + 2² = 4</p><p>82 ~/ 10 = 8</p><p>8 % 10 = 8, sum = 4 + 8² = 68</p><p>8 ~/ 10 = 0</p></div><div class='bg-green-100 p-3 rounded mb-2'><strong>结果:</strong> getNext(82) = 68</div>"
                    },
                    {
                        title: "继续更新",
                        description: "将82加入已见集合，更新n为68",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> seen = {19, 82}</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>新状态</p><p>n = 68</p></div>"
                    },
                    {
                        title: "第三次计算",
                        description: "计算68各位数字的平方和：6² + 8² = 36 + 64 = 100",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>计算getNext(68):</strong></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>过程</p><p>68 % 10 = 8, sum = 0 + 8² = 64</p><p>68 ~/ 10 = 6</p><p>6 % 10 = 6, sum = 64 + 6² = 100</p><p>6 ~/ 10 = 0</p></div><div class='bg-green-100 p-3 rounded mb-2'><strong>结果:</strong> getNext(68) = 100</div>"
                    },
                    {
                        title: "接近结果",
                        description: "将68加入已见集合，更新n为100",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> seen = {19, 82, 68}</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>新状态</p><p>n = 100</p></div>"
                    },
                    {
                        title: "最后一次计算",
                        description: "计算100各位数字的平方和：1² + 0² + 0² = 1 + 0 + 0 = 1",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>计算getNext(100):</strong></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>过程</p><p>100 % 10 = 0, sum = 0 + 0² = 0</p><p>100 ~/ 10 = 10</p><p>10 % 10 = 0, sum = 0 + 0² = 0</p><p>10 ~/ 10 = 1</p><p>1 % 10 = 1, sum = 0 + 1² = 1</p><p>1 ~/ 10 = 0</p></div><div class='bg-green-100 p-3 rounded mb-2'><strong>结果:</strong> getNext(100) = 1</div>"
                    },
                    {
                        title: "返回结果",
                        description: "n等于1，返回true，19是快乐数",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: true (19是快乐数)</div>"
                    }
                ]
            }
        ]
    },
    {
        title: "阶段复盘与强化",
        description: "综合复习前面所学知识点，强化算法思维和编码能力",
        problems: [
            {
                title: "两数之和 (LeetCode 1)",
                description: "给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。",
                input: "整数数组 nums 和整数目标值 target",
                output: "返回两个整数的数组下标",
                example: "输入：nums = [2,7,11,15], target = 9\n输出：[0,1]\n解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。\n\n输入：nums = [3,2,4], target = 6\n输出：[1,2]\n\n输入：nums = [3,3], target = 6\n输出：[0,1]",
                leetCodeUrl: "https://leetcode.cn/problems/two-sum/",
                code: `class Solution { 
  List<int> twoSum(List<int> nums, int target) { 
    Map<int, int> map = {}; 
  
    for (int i = 0; i < nums.length; i++) { 
      int complement = target - nums[i]; 
      if (map.containsKey(complement)) { 
        return [map[complement]!, i]; 
      } 
      map[nums[i]] = i; 
    } 
  
    return []; // This line will never be reached if there's always one solution 
  } 
 }`,
                steps: [
                    {
                        title: "初始化哈希表",
                        description: "创建一个空的哈希表用于存储已遍历的数字及其索引",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>初始状态</p><p>map = {}</p><p>nums = [2,7,11,15]</p><p>target = 9</p></div>"
                    },
                    {
                        title: "处理第一个元素",
                        description: "遍历第一个元素2，计算补数7，检查哈希表中是否存在7",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第1次迭代 (i=0):</strong> nums[0] = 2</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>计算</p><p>complement = 9 - 2 = 7</p></div><div class='bg-gray-100 p-3 rounded mb-2'><strong>检查:</strong> map.containsKey(7) = false</div><div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> map[2] = 0</div>"
                    },
                    {
                        title: "处理第二个元素",
                        description: "遍历第二个元素7，计算补数2，检查哈希表中是否存在2",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第2次迭代 (i=1):</strong> nums[1] = 7</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>计算</p><p>complement = 9 - 7 = 2</p></div><div class='bg-gray-100 p-3 rounded mb-2'><strong>检查:</strong> map.containsKey(2) = true</div><div class='bg-green-100 p-3 rounded mb-2'><strong>返回结果:</strong> [map[2], 1] = [0, 1]</div>"
                    },
                    {
                        title: "返回结果",
                        description: "找到满足条件的两个数，返回它们的索引",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: [0, 1]</div>"
                    }
                ]
            },
            {
                title: "有效的括号 (LeetCode 20)",
                description: "给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效。有效字符串需满足：左括号必须用相同类型的右括号闭合；左括号必须以正确的顺序闭合；每个右括号都有一个对应的相同类型的左括号。",
                input: "只包含括号字符的字符串 s",
                output: "布尔值，表示字符串是否有效",
                example: "输入：s = \"()\"\n输出：true\n\n输入：s = \"()[]{}\"\n输出：true\n\n输入：s = \"(]\"\n输出：false",
                leetCodeUrl: "https://leetcode.cn/problems/valid-parentheses/",
                code: `class Solution { 
  bool isValid(String s) { 
    List<String> stack = []; 
    Map<String, String> pairs = { 
      ')': '(', 
      ']': '[', 
      '}': '{', 
    }; 
  
    for (int i = 0; i < s.length; i++) { 
      String char = s[i]; 
      if (pairs.containsKey(char)) { 
        if (stack.isEmpty || stack.last != pairs[char]) { 
          return false; 
        } 
        stack.removeLast(); 
      } else { 
        stack.add(char); 
      } 
    } 
    return stack.isEmpty; 
  } 
 }`,
                steps: [
                    {
                        title: "初始化栈和映射关系",
                        description: "创建空栈用于存储左括号，建立右括号到左括号的映射关系",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>初始状态</p><p>stack = []</p><p>pairs = {')':'(', ']':'[', '}':'{'}</p><p>s = \"()[]{}\"</p></div>"
                    },
                    {
                        title: "处理第一个字符 '('",
                        description: "遇到左括号'('，将其压入栈中",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理字符:</strong> '('</div><div class='bg-green-100 p-3 rounded mb-2'><strong>操作:</strong> stack.add('(')</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>当前状态</p><p>stack = ['(']</p></div>"
                    },
                    {
                        title: "处理第二个字符 ')'",
                        description: "遇到右括号')'，检查栈顶是否为匹配的左括号'('",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理字符:</strong> ')'</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>检查:</strong> stack.last == pairs[')']?</div><div class='bg-green-100 p-3 rounded mb-2'><strong>操作:</strong> stack.removeLast()</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>当前状态</p><p>stack = []</p></div>"
                    },
                    {
                        title: "处理第三个字符 '['",
                        description: "遇到左括号'['，将其压入栈中",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理字符:</strong> '['</div><div class='bg-green-100 p-3 rounded mb-2'><strong>操作:</strong> stack.add('[')</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>当前状态</p><p>stack = ['[']</p></div>"
                    },
                    {
                        title: "处理第四个字符 ']'",
                        description: "遇到右括号']'，检查栈顶是否为匹配的左括号'['",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理字符:</strong> ']'</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>检查:</strong> stack.last == pairs[']']?</div><div class='bg-green-100 p-3 rounded mb-2'><strong>操作:</strong> stack.removeLast()</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>当前状态</p><p>stack = []</p></div>"
                    },
                    {
                        title: "处理第五个字符 '{'",
                        description: "遇到左括号'{'，将其压入栈中",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理字符:</strong> '{'</div><div class='bg-green-100 p-3 rounded mb-2'><strong>操作:</strong> stack.add('{')</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>当前状态</p><p>stack = ['{']</p></div>"
                    },
                    {
                        title: "处理第六个字符 '}'",
                        description: "遇到右括号'}'，检查栈顶是否为匹配的左括号'{'",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理字符:</strong> '}'</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>检查:</strong> stack.last == pairs['}']?</div><div class='bg-green-100 p-3 rounded mb-2'><strong>操作:</strong> stack.removeLast()</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>当前状态</p><p>stack = []</p></div>"
                    },
                    {
                        title: "返回结果",
                        description: "遍历完成后栈为空，说明所有括号都正确匹配",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: true (栈为空)</div>"
                    }
                ]
            },
            {
                title: "x 的平方根 (LeetCode 69)",
                description: "给你一个非负整数 x ，计算并返回 x 的算术平方根。由于返回类型是整数，结果只保留整数部分，小数部分将被舍去。注意：不允许使用任何内置指数函数和算符，例如 pow(x, 0.5) 或者 x ** 0.5。",
                input: "非负整数 x",
                output: "x 的算术平方根（整数部分）",
                example: "输入：x = 4\n输出：2\n\n输入：x = 8\n输出：2\n解释：8 的算术平方根是 2.82842..., 由于返回类型是整数，小数部分将被舍去。",
                leetCodeUrl: "https://leetcode.cn/problems/sqrtx/",
                code: `class Solution { 
  int mySqrt(int x) { 
    if (x == 0) return 0; 
    int left = 1, right = x; 
    while (left <= right) { 
      int mid = left + (right - left) ~/ 2; 
      if (mid == x ~/ mid) { 
        return mid; 
      } else if (mid < x ~/ mid) { 
        left = mid + 1; 
      } else { 
        right = mid - 1; 
      } 
    } 
    return right; 
  } 
 }`,
                steps: [
                    {
                        title: "初始化边界",
                        description: "设置二分查找的左右边界，左边界为1，右边界为x",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>初始状态</p><p>left = 1</p><p>right = 8</p><p>x = 8</p></div>"
                    },
                    {
                        title: "第一次二分查找",
                        description: "计算中间值mid=4，比较mid与x/mid的大小关系",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第1次迭代:</strong> left=1, right=8</div><div class='bg-green-100 p-3 rounded mb-2'><strong>计算:</strong> mid = 1 + (8-1)/2 = 4</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> 4 vs 8/4 = 2</div><div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> right = 4 - 1 = 3</div>"
                    },
                    {
                        title: "第二次二分查找",
                        description: "计算中间值mid=2，比较mid与x/mid的大小关系",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第2次迭代:</strong> left=1, right=3</div><div class='bg-green-100 p-3 rounded mb-2'><strong>计算:</strong> mid = 1 + (3-1)/2 = 2</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> 2 vs 8/2 = 4</div><div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> left = 2 + 1 = 3</div>"
                    },
                    {
                        title: "第三次二分查找",
                        description: "计算中间值mid=3，比较mid与x/mid的大小关系",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>第3次迭代:</strong> left=3, right=3</div><div class='bg-green-100 p-3 rounded mb-2'><strong>计算:</strong> mid = 3 + (3-3)/2 = 3</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> 3 vs 8/3 = 2</div><div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> right = 3 - 1 = 2</div>"
                    },
                    {
                        title: "结束条件",
                        description: "当left>right时，循环结束，返回right作为结果",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>结束条件:</strong> left=3, right=2</div><div class='bg-green-100 p-3 rounded mb-2'><strong>判断:</strong> left > right (3 > 2)</div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: right = 2</div>"
                    }
                ]
            },
            {
                title: "合并有序数组 (LeetCode 88)",
                description: "给你两个按非递减顺序排列的整数数组 nums1 和 nums2，另有两个整数 m 和 n，分别表示 nums1 和 nums2 中的元素数目。请你合并 nums2 到 nums1 中，使合并后的数组同样按非递减顺序排列。注意：最终，合并后数组不应由函数返回，而是存储在数组 nums1 中。为了应对这种情况，nums1 的初始长度为 m + n，其中前 m 个元素表示应合并的元素，后 n 个元素为 0，应忽略。nums2 的长度为 n。",
                input: "两个有序数组 nums1 和 nums2，以及它们的元素数量 m 和 n",
                output: "无返回值，直接修改 nums1 数组",
                example: "输入：nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3\n输出：[1,2,2,3,5,6]\n解释：需要合并 [1,2,3] 和 [2,5,6] 。\n合并结果是 [1,2,2,3,5,6] ，其中斜体加粗标注的为 nums1 中的元素。\n\n输入：nums1 = [1], m = 1, nums2 = [], n = 0\n输出：[1]\n解释：需要合并 [1] 和 [] 。\n合并结果是 [1] 。",
                leetCodeUrl: "https://leetcode.cn/problems/merge-sorted-array/",
                code: `class Solution { 
  void merge(List<int> nums1, int m, List<int> nums2, int n) { 
    int i = m - 1; // nums1的末尾有效元素索引 
    int j = n - 1; // nums2的末尾元素索引 
    int k = m + n - 1; // 合并后数组的末尾索引 
  
    // 从后向前比较两个数组的元素，将较大者放到nums1的末尾 
    while (i >= 0 && j >= 0) { 
      if (nums1[i] > nums2[j]) { 
        nums1[k--] = nums1[i--]; 
      } else { 
        nums1[k--] = nums2[j--]; 
      } 
    } 
  
    // 如果nums2还有剩余元素，复制到nums1 
    while (j >= 0) { 
      nums1[k--] = nums2[j--]; 
    } 
  } 
 }`,
                steps: [
                    {
                        title: "初始化指针",
                        description: "设置三个指针：i指向nums1有效元素末尾，j指向nums2末尾，k指向合并后数组末尾",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>初始状态</p><p>nums1 = [1,2,3,0,0,0], m = 3</p><p>nums2 = [2,5,6], n = 3</p><p>i = 2, j = 2, k = 5</p></div>"
                    },
                    {
                        title: "第一次比较",
                        description: "比较nums1[2]=3和nums2[2]=6，将较大者6放入nums1[5]",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> nums1[2]=3 vs nums2[2]=6</div><div class='bg-green-100 p-3 rounded mb-2'><strong>操作:</strong> nums1[5] = 6</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>nums1 = [1,2,3,0,0,6]</p><p>i = 2, j = 1, k = 4</p></div>"
                    },
                    {
                        title: "第二次比较",
                        description: "比较nums1[2]=3和nums2[1]=5，将较大者5放入nums1[4]",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> nums1[2]=3 vs nums2[1]=5</div><div class='bg-green-100 p-3 rounded mb-2'><strong>操作:</strong> nums1[4] = 5</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>nums1 = [1,2,3,0,5,6]</p><p>i = 2, j = 0, k = 3</p></div>"
                    },
                    {
                        title: "第三次比较",
                        description: "比较nums1[2]=3和nums2[0]=2，将较大者3放入nums1[3]",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> nums1[2]=3 vs nums2[0]=2</div><div class='bg-green-100 p-3 rounded mb-2'><strong>操作:</strong> nums1[3] = 3</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>nums1 = [1,2,3,3,5,6]</p><p>i = 1, j = 0, k = 2</p></div>"
                    },
                    {
                        title: "第四次比较",
                        description: "比较nums1[1]=2和nums2[0]=2，将较大者2放入nums1[2]",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>比较:</strong> nums1[1]=2 vs nums2[0]=2</div><div class='bg-green-100 p-3 rounded mb-2'><strong>操作:</strong> nums1[2] = 2</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>nums1 = [1,2,2,3,5,6]</p><p>i = 1, j = -1, k = 1</p></div>"
                    },
                    {
                        title: "处理剩余元素",
                        description: "nums2已全部处理完(j<0)，合并完成",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>检查:</strong> j >= 0 ?</div><div class='bg-green-100 p-3 rounded mb-2'><strong>结果:</strong> j = -1 (不需要处理剩余元素)</div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>最终结果: [1,2,2,3,5,6]</div>"
                    }
                ]
            },
            {
                title: "验证回文串 (LeetCode 125)",
                description: "如果在将所有大写字符转换为小写字符、并移除所有非字母数字字符之后，短语正着读和反着读都一样，则可以认为该短语是一个回文串。字母和数字都属于字母数字字符。给你一个字符串 s，如果它是回文串，返回 true；否则，返回 false。",
                input: "字符串 s",
                output: "布尔值，表示字符串是否为回文串",
                example: "输入: s = \"A man, a plan, a canal: Panama\"\n输出：true\n解释:\"amanaplanacanalpanama\" 是回文串。\n\n输入: s = \"race a car\"\n输出：false\n解释:\"raceacar\" 不是回文串。\n\n输入: s = \" \"\n输出：true\n解释：在移除非字母数字字符之后，s 是一个空字符串 \"\" 。由于空字符串正着反着读都一样，所以是回文串。",
                leetCodeUrl: "https://leetcode.cn/problems/valid-palindrome/",
                code: `class Solution { 
  bool isPalindrome(String s) { 
    // 将字符串转换为小写 
    s = s.toLowerCase(); 
    int left = 0; 
    int right = s.length - 1; 
  
    while (left < right) { 
      // 跳过左边的非字母数字字符 
      while (left < right && !isAlphanumeric(s[left])) { 
        left++; 
      } 
      // 跳过右边的非字母数字字符 
      while (left < right && !isAlphanumeric(s[right])) { 
        right--; 
      } 
      // 比较字符 
      if (s[left] != s[right]) { 
        return false; 
      } 
      left++; 
      right--; 
    } 
    return true; 
  } 
  
  bool isAlphanumeric(String char) { 
    return (char.compareTo('a') >= 0 && char.compareTo('z') <= 0) || 
           (char.compareTo('0') >= 0 && char.compareTo('9') <= 0); 
  } 
 }`,
                steps: [
                    {
                        title: "初始化和预处理",
                        description: "将字符串转换为小写，设置左右双指针",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>初始状态</p><p>s = \"A man, a plan, a canal: Panama\"</p><p>转换后 = \"a man, a plan, a canal: panama\"</p><p>left = 0, right = 29</p></div>"
                    },
                    {
                        title: "第一次比较准备",
                        description: "跳过左边的非字母数字字符'a'，跳过右边的非字母数字字符'a'",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理左边:</strong> s[0]='a' (字母)</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>处理右边:</strong> s[29]='a' (字母)</div><div class='bg-green-100 p-3 rounded mb-2'><strong>比较:</strong> s[0] == s[29] ? ('a' == 'a')</div>"
                    },
                    {
                        title: "第一次比较结果",
                        description: "左右字符相等，移动指针继续比较",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>结果:</strong> 相等</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>left = 1, right = 28</p></div>"
                    },
                    {
                        title: "跳过非字母数字字符",
                        description: "跳过左边的空格和非字母数字字符，跳过右边的冒号和非字母数字字符",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理左边:</strong> 跳过' ', 'm', 'a', 'n', ',', ' ', 'a'</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>处理右边:</strong> 跳过'm', 'a', 'n', 'a', 'p', ' ', 'a', ':'</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>left = 8, right = 20</p></div>"
                    },
                    {
                        title: "后续比较",
                        description: "继续比较对应位置的字符，直到指针相遇",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>比较过程:</strong> 继续比较'n'vs'n', 'a'vs'a', ' ', 'c'vs'c', 'a'vs'a', 'n'vs'n', 'a'vs'a', 'l'vs'l', 'a'vs'a', ' ', 'p'vs'p'</div><div class='bg-green-100 p-3 rounded mb-2'><strong>结果:</strong> 所有对应字符均相等</div>"
                    },
                    {
                        title: "返回结果",
                        description: "所有对应字符都相等，字符串是回文串",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: true (是回文串)</div>"
                    }
                ]
            },
            {
                title: "只出现一次的数字 (LeetCode 136)",
                description: "给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。你必须设计并实现线性时间复杂度的算法来解决此问题，且该算法只使用常量额外空间。",
                input: "非空整数数组 nums",
                output: "只出现一次的整数",
                example: "输入：nums = [2,2,1]\n输出：1\n\n输入：nums = [4,1,2,1,2]\n输出：4\n\n输入：nums = [1]\n输出：1",
                leetCodeUrl: "https://leetcode.cn/problems/single-number/",
                code: `class Solution { 
  int singleNumber(List<int> nums) { 
    int result = 0; 
    for (int num in nums) { 
      result ^= num; // 异或运算 
    } 
    return result; 
  } 
 }`,
                steps: [
                    {
                        title: "初始化结果变量",
                        description: "将结果变量初始化为0，为异或运算做准备",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>初始状态</p><p>result = 0</p><p>nums = [4,1,2,1,2]</p></div>"
                    },
                    {
                        title: "第一次异或运算",
                        description: "将result与第一个元素4进行异或运算",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>计算:</strong> result = 0 ^ 4 = 4</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>result = 4</p></div>"
                    },
                    {
                        title: "第二次异或运算",
                        description: "将result与第二个元素1进行异或运算",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>计算:</strong> result = 4 ^ 1 = 5</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>result = 5</p></div>"
                    },
                    {
                        title: "第三次异或运算",
                        description: "将result与第三个元素2进行异或运算",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>计算:</strong> result = 5 ^ 2 = 7</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>result = 7</p></div>"
                    },
                    {
                        title: "第四次异或运算",
                        description: "将result与第四个元素1进行异或运算",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>计算:</strong> result = 7 ^ 1 = 6</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>result = 6</p></div>"
                    },
                    {
                        title: "第五次异或运算",
                        description: "将result与第五个元素2进行异或运算",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>计算:</strong> result = 6 ^ 2 = 4</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>result = 4</p></div>"
                    },
                    {
                        title: "返回结果",
                        description: "经过所有异或运算后，result即为只出现一次的数字",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: 4 (只出现一次的数字)</div>"
                    }
                ]
            },
            {
                title: "移动零 (LeetCode 283)",
                description: "给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。请注意，必须在不复制数组的情况下原地对数组进行操作。",
                input: "整数数组 nums",
                output: "无返回值，直接修改原数组",
                example: "输入: nums = [0,1,0,3,12]\n输出: [1,3,12,0,0]\n\n输入: nums = [0]\n输出: [0]",
                leetCodeUrl: "https://leetcode.cn/problems/move-zeroes/",
                code: `class Solution { 
  void moveZeroes(List<int> nums) { 
    int left = 0; // 左指针指向下一个非零元素应该放置的位置 
  
    // 右指针遍历数组 
    for (int right = 0; right < nums.length; right++) { 
      if (nums[right] != 0) { 
        // 将非零元素移到左侧 
        nums[left] = nums[right]; 
        left++; 
      } 
    } 
  
    // 将剩余位置填充为0 
    while (left < nums.length) { 
      nums[left] = 0; 
      left++; 
    } 
  } 
 }`,
                steps: [
                    {
                        title: "初始化指针",
                        description: "设置左指针指向下一个非零元素应放置的位置，右指针用于遍历数组",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>初始状态</p><p>nums = [0,1,0,3,12]</p><p>left = 0, right = 0</p></div>"
                    },
                    {
                        title: "处理第一个元素",
                        description: "右指针指向第一个元素0，不是非零元素，不移动左指针",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理:</strong> nums[0] = 0</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>检查:</strong> nums[0] != 0 ? (0 != 0 为假)</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>状态不变</p><p>left = 0, right = 0</p></div>"
                    },
                    {
                        title: "处理第二个元素",
                        description: "右指针指向第二个元素1，是非零元素，将其移到左侧",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理:</strong> nums[1] = 1</div><div class='bg-green-100 p-3 rounded mb-2'><strong>操作:</strong> nums[0] = 1, left++</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>nums = [1,1,0,3,12]</p><p>left = 1, right = 1</p></div>"
                    },
                    {
                        title: "处理第三个元素",
                        description: "右指针指向第三个元素0，不是非零元素，不移动左指针",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理:</strong> nums[2] = 0</div><div class='bg-gray-100 p-3 rounded mb-2'><strong>检查:</strong> nums[2] != 0 ? (0 != 0 为假)</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>状态不变</p><p>left = 1, right = 2</p></div>"
                    },
                    {
                        title: "处理第四个元素",
                        description: "右指针指向第四个元素3，是非零元素，将其移到左侧",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理:</strong> nums[3] = 3</div><div class='bg-green-100 p-3 rounded mb-2'><strong>操作:</strong> nums[1] = 3, left++</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>nums = [1,3,0,3,12]</p><p>left = 2, right = 3</p></div>"
                    },
                    {
                        title: "处理第五个元素",
                        description: "右指针指向第五个元素12，是非零元素，将其移到左侧",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>处理:</strong> nums[4] = 12</div><div class='bg-green-100 p-3 rounded mb-2'><strong>操作:</strong> nums[2] = 12, left++</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新后状态</p><p>nums = [1,3,12,3,12]</p><p>left = 3, right = 4</p></div>"
                    },
                    {
                        title: "填充零元素",
                        description: "遍历完成后，将剩余位置填充为0",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>填充:</strong> 将nums[3]和nums[4]设为0</div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>最终结果: [1,3,12,0,0]</div>"
                    }
                ]
            },
            {
                title: "快乐数 (LeetCode 202)",
                description: "编写一个算法来判断一个数 n 是不是快乐数。快乐数定义如下：对于一个正整数，每一次将该数替换为它每个位置上的数字的平方和，然后重复这个过程直到这个数变为 1，也可能是无限循环但始终变不到 1。如果这个过程结果为 1，那么这个数就是快乐数。",
                input: "正整数 n",
                output: "布尔值，表示 n 是否为快乐数",
                example: "输入: n = 19\n输出: true\n解释:\n1² + 9² = 82\n8² + 2² = 68\n6² + 8² = 100\n1² + 0² + 0² = 1\n\n输入: n = 2\n输出: false",
                leetCodeUrl: "https://leetcode.cn/problems/happy-number/",
                code: `class Solution { 
  bool isHappy(int n) { 
    Set<int> seen = {}; 
  
    int getNext(int x) { 
      int sum = 0; 
      while (x > 0) { 
        int d = x % 10; 
        sum += d * d; 
        x ~/= 10; 
      } 
      return sum; 
    } 
  
    while (n != 1 && !seen.contains(n)) { 
      seen.add(n); 
      n = getNext(n); 
    } 
    return n == 1; 
  } 
 }`,
                steps: [
                    {
                        title: "初始化集合",
                        description: "创建一个空集合用于存储已经出现过的数字，检测循环",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>初始状态</p><p>seen = {}</p><p>n = 19</p></div>"
                    },
                    {
                        title: "第一次计算",
                        description: "计算19各位数字的平方和：1² + 9² = 1 + 81 = 82",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>计算getNext(19):</strong></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>过程</p><p>19 % 10 = 9, sum = 0 + 9² = 81</p><p>19 ~/ 10 = 1</p><p>1 % 10 = 1, sum = 81 + 1² = 82</p><p>1 ~/ 10 = 0</p></div><div class='bg-green-100 p-3 rounded mb-2'><strong>结果:</strong> getNext(19) = 82</div>"
                    },
                    {
                        title: "更新状态",
                        description: "将19加入已见集合，更新n为82",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> seen = {19}</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>新状态</p><p>n = 82</p></div>"
                    },
                    {
                        title: "第二次计算",
                        description: "计算82各位数字的平方和：8² + 2² = 64 + 4 = 68",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>计算getNext(82):</strong></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>过程</p><p>82 % 10 = 2, sum = 0 + 2² = 4</p><p>82 ~/ 10 = 8</p><p>8 % 10 = 8, sum = 4 + 8² = 68</p><p>8 ~/ 10 = 0</p></div><div class='bg-green-100 p-3 rounded mb-2'><strong>结果:</strong> getNext(82) = 68</div>"
                    },
                    {
                        title: "继续更新",
                        description: "将82加入已见集合，更新n为68",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> seen = {19, 82}</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>新状态</p><p>n = 68</p></div>"
                    },
                    {
                        title: "第三次计算",
                        description: "计算68各位数字的平方和：6² + 8² = 36 + 64 = 100",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>计算getNext(68):</strong></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>过程</p><p>68 % 10 = 8, sum = 0 + 8² = 64</p><p>68 ~/ 10 = 6</p><p>6 % 10 = 6, sum = 64 + 6² = 100</p><p>6 ~/ 10 = 0</p></div><div class='bg-green-100 p-3 rounded mb-2'><strong>结果:</strong> getNext(68) = 100</div>"
                    },
                    {
                        title: "接近结果",
                        description: "将68加入已见集合，更新n为100",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>更新:</strong> seen = {19, 82, 68}</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>新状态</p><p>n = 100</p></div>"
                    },
                    {
                        title: "最后一次计算",
                        description: "计算100各位数字的平方和：1² + 0² + 0² = 1 + 0 + 0 = 1",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>计算getNext(100):</strong></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>过程</p><p>100 % 10 = 0, sum = 0 + 0² = 0</p><p>100 ~/ 10 = 10</p><p>10 % 10 = 0, sum = 0 + 0² = 0</p><p>10 ~/ 10 = 1</p><p>1 % 10 = 1, sum = 0 + 1² = 1</p><p>1 ~/ 10 = 0</p></div><div class='bg-green-100 p-3 rounded mb-2'><strong>结果:</strong> getNext(100) = 1</div>"
                    },
                    {
                        title: "返回结果",
                        description: "n等于1，返回true，19是快乐数",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>结果: true (19是快乐数)</div>"
                    }
                ]
            },
            {
                title: "反转字符串 (LeetCode 344)",
                description: "编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 s 的形式给出。不要给另外的数组分配额外的空间，你必须原地修改输入数组，使用 O(1) 的额外空间解决这一问题。",
                input: "字符数组 s",
                output: "无返回值，直接修改输入数组",
                example: "输入: s = [\"h\",\"e\",\"l\",\"l\",\"o\"]\n输出: [\"o\",\"l\",\"l\",\"e\",\"h\"]\n\n输入: s = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]\n输出: [\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]",
                leetCodeUrl: "https://leetcode.cn/problems/reverse-string/",
                code: `class Solution {
  void reverseString(List<String> s) {
    int left = 0;
    int right = s.length - 1;
    
    while (left < right) {
      String temp = s[left];
      s[left] = s[right];
      s[right] = temp;
      left++;
      right--;
    }
  }
}`,
                steps: [
                    {
                        title: "初始化指针",
                        description: "设置左指针指向数组开始，右指针指向数组末尾",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>初始状态</p><p>left = 0</p><p>right = 4</p><p>s = ['h','e','l','l','o']</p></div>"
                    },
                    {
                        title: "第一次交换",
                        description: "交换s[0]和s[4]，即'h'和'o'",
                        visualization: "<div class='flex justify-center space-x-2 mb-4'><div class='bg-red-100 border border-red-300 w-10 h-10 flex items-center justify-center font-mono'>h</div><div class='bg-gray-100 border border-gray-300 w-10 h-10 flex items-center justify-center font-mono'>e</div><div class='bg-gray-100 border border-gray-300 w-10 h-10 flex items-center justify-center font-mono'>l</div><div class='bg-gray-100 border border-gray-300 w-10 h-10 flex items-center justify-center font-mono'>l</div><div class='bg-red-100 border border-red-300 w-10 h-10 flex items-center justify-center font-mono'>o</div></div><div class='bg-green-100 p-3 rounded mb-2'><strong>交换后:</strong> s = ['o','e','l','l','h']</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新指针</p><p>left = 1</p><p>right = 3</p></div>"
                    },
                    {
                        title: "第二次交换",
                        description: "交换s[1]和s[3]，即'e'和'l'",
                        visualization: "<div class='flex justify-center space-x-2 mb-4'><div class='bg-gray-100 border border-gray-300 w-10 h-10 flex items-center justify-center font-mono'>o</div><div class='bg-red-100 border border-red-300 w-10 h-10 flex items-center justify-center font-mono'>e</div><div class='bg-gray-100 border border-gray-300 w-10 h-10 flex items-center justify-center font-mono'>l</div><div class='bg-red-100 border border-red-300 w-10 h-10 flex items-center justify-center font-mono'>l</div><div class='bg-gray-100 border border-gray-300 w-10 h-10 flex items-center justify-center font-mono'>h</div></div><div class='bg-green-100 p-3 rounded mb-2'><strong>交换后:</strong> s = ['o','l','l','e','h']</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>更新指针</p><p>left = 2</p><p>right = 2</p></div>"
                    },
                    {
                        title: "结束条件",
                        description: "当left >= right时停止循环，完成反转",
                        visualization: "<div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>最终结果: s = ['o','l','l','e','h']</div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>结束条件</p><p>left (2) >= right (2)</p></div>"
                    }
                ]
            }
        ]
    }
];

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = algorithms;
}