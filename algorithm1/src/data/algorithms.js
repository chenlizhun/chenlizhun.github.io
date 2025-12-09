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
                code: `List<int> twoSum(List<int> nums, int target) {
    Map<int, int> map = {};
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return [map[complement]!, i];
        }
        map[nums[i]] = i;
    }
    return [];
}`,
                steps: [
                    {
                        title: "初始化哈希表",
                        description: "创建一个空的哈希表来存储已遍历过的元素及其索引",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>哈希表</p><p>当前为空</p></div>"
                    },
                    {
                        title: "处理第一个元素 (2)",
                        description: "计算补数: 9 - 2 = 7，检查哈希表中是否存在7",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>数组:</strong> [2, 7, 11, 15] <span class='text-blue-600'>(当前元素: 2)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>哈希表</p><p>2: 0</p></div>"
                    },
                    {
                        title: "处理第二个元素 (7)",
                        description: "计算补数: 9 - 7 = 2，检查哈希表中是否存在2",
                        visualization: "<div class='bg-green-100 p-3 rounded mb-2'><strong>比较:</strong> 2 == 2 <span class='text-green-600'>✓</span></div><div class='bg-green-100 text-green-800 px-4 py-2 rounded mt-2'>找到匹配对！索引为0和1</div>"
                    },
                    {
                        title: "返回结果",
                        description: "返回找到的两个元素的索引",
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
    int p1 = m - 1;
    int p2 = n - 1;
    int p = m + n - 1;
    
    while (p1 >= 0 && p2 >= 0) {
        if (nums1[p1] > nums2[p2]) {
            nums1[p] = nums1[p1];
            p1--;
        } else {
            nums1[p] = nums2[p2];
            p2--;
        }
        p--;
    }
    
    while (p2 >= 0) {
        nums1[p] = nums2[p2];
        p2--;
        p--;
    }
}`,
                steps: [
                    {
                        title: "初始化指针",
                        description: "p1指向nums1的最后一个有效元素，p2指向nums2的最后一个元素，p指向nums1的最后一个位置",
                        visualization: "<div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-2'><p class='font-bold'>指针状态</p><p>p1: 2, p2: 2, p: 5</p></div>"
                    },
                    {
                        title: "第一次比较",
                        description: "nums1[p1]=3 < nums2[p2]=6，将6放到nums1[p]位置",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>nums1:</strong> [1, 2, 3, 0, 0, <span class='text-green-600'>6</span>] <span class='text-blue-600'>(p1: 2, p2: 2, p: 5)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>p1: 2, p2: 1, p: 4</p></div>"
                    },
                    {
                        title: "第二次比较",
                        description: "nums1[p1]=3 < nums2[p2]=5，将5放到nums1[p]位置",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>nums1:</strong> [1, 2, 3, 0, <span class='text-green-600'>5</span>, 6] <span class='text-blue-600'>(p1: 2, p2: 1, p: 4)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>p1: 2, p2: 0, p: 3</p></div>"
                    },
                    {
                        title: "第三次比较",
                        description: "nums1[p1]=3 > nums2[p2]=2，将3放到nums1[p]位置",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>nums1:</strong> [1, 2, 3, <span class='text-green-600'>3</span>, 5, 6] <span class='text-blue-600'>(p1: 2, p2: 0, p: 3)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>p1: 1, p2: 0, p: 2</p></div>"
                    },
                    {
                        title: "第四次比较",
                        description: "nums1[p1]=2 == nums2[p2]=2，将2放到nums1[p]位置",
                        visualization: "<div class='bg-gray-100 p-3 rounded mb-2'><strong>nums1:</strong> [1, 2, <span class='text-green-600'>2</span>, 3, 5, 6] <span class='text-blue-600'>(p1: 1, p2: 0, p: 2)</span></div><div class='bg-blue-50 border-l-4 border-blue-500 p-4 mt-2'><p class='font-bold'>指针状态</p><p>p1: 1, p2: -1, p: 1</p></div>"
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
    }
];

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = algorithms;
}