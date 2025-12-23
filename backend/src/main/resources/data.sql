-- =========================================
-- ReviewPilot 初始化数据
-- H2 数据库 MySQL 模式
-- =========================================

-- 插入初始用户
-- 密码都是 "123456"，使用 BCrypt 加密
-- BCrypt hash for "123456": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO account (id, username, password, role) VALUES
(1, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'),
(2, 'user1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'),
(3, 'student', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER');

-- 插入示例课程
INSERT INTO course (id, title, description, level, author_id, created_at) VALUES
(1, 'Java 编程基础', '学习 Java 语言的基础语法、面向对象编程和常用 API', 'BEGINNER', 1, '2024-01-15 10:00:00'),
(2, 'Spring Boot 实战', '深入理解 Spring Boot 框架，学习构建 RESTful API 和微服务', 'INTERMEDIATE', 1, '2024-01-20 14:30:00'),
(3, '数据结构与算法', '掌握常见数据结构和算法，提升编程能力', 'INTERMEDIATE', 1, '2024-02-01 09:00:00'),
(4, 'React 前端开发', '学习 React 框架，构建现代化的单页应用', 'INTERMEDIATE', 1, '2024-02-10 11:00:00'),
(5, '数据库设计与优化', '学习数据库设计原则和性能优化技巧', 'ADVANCED', 1, '2024-02-15 16:00:00'),
(6, '操作系统原理', '深入理解操作系统的基本概念、进程管理、内存管理和文件系统', 'ADVANCED', 1, '2024-02-20 10:00:00'),
(7, '计算机网络', '学习TCP/IP协议栈、HTTP协议、网络安全等核心知识', 'INTERMEDIATE', 1, '2024-02-25 14:00:00'),
(8, '计算机组成原理', '理解计算机硬件系统、CPU结构、存储系统和指令系统', 'ADVANCED', 1, '2024-03-01 09:00:00');

-- 插入课程标签
INSERT INTO course_tags (course_id, tag) VALUES
(1, 'Java'),
(1, '编程基础'),
(1, '面向对象'),
(2, 'Spring Boot'),
(2, '后端开发'),
(2, 'RESTful API'),
(3, '算法'),
(3, '数据结构'),
(3, '编程'),
(4, 'React'),
(4, '前端开发'),
(4, 'JavaScript'),
(5, '数据库'),
(5, 'MySQL'),
(5, '性能优化'),
(6, '操作系统'),
(6, '进程管理'),
(6, '内存管理'),
(7, '计算机网络'),
(7, 'TCP/IP'),
(7, 'HTTP'),
(8, '计算机组成'),
(8, 'CPU'),
(8, '存储系统');

-- 插入知识图谱节点（示例课程1：Java 编程基础）
INSERT INTO graph (course_id, nodes, relations) VALUES
(1, 
'[{"id":"n1","label":"Java基础","type":"concept","description":"Java语言的基本概念"},{"id":"n2","label":"变量与数据类型","type":"topic","description":"学习Java中的变量声明和基本数据类型"},{"id":"n3","label":"控制结构","type":"topic","description":"if-else、循环等控制语句"},{"id":"n4","label":"面向对象","type":"concept","description":"类、对象、继承、多态等概念"},{"id":"n5","label":"异常处理","type":"topic","description":"try-catch、异常类型"}]',
'[{"id":"r1","from":"n1","to":"n2","type":"part_of","directed":true,"weight":0.8},{"id":"r2","from":"n1","to":"n3","type":"part_of","directed":true,"weight":0.8},{"id":"r3","from":"n1","to":"n4","type":"prerequisite","directed":true,"weight":0.9},{"id":"r4","from":"n2","to":"n3","type":"related","directed":false,"weight":0.6},{"id":"r5","from":"n4","to":"n5","type":"related","directed":false,"weight":0.7}]'
);

-- 插入示例笔记
INSERT INTO note (id, course_id, title, content, summary, author_id, visibility, created_at, updated_at) VALUES
('note1', 1, 'Java 变量类型总结', 'Java中有8种基本数据类型：\n- byte: 8位，范围 -128 到 127\n- short: 16位，范围 -32768 到 32767\n- int: 32位，范围 -2^31 到 2^31-1\n- long: 64位，范围 -2^63 到 2^63-1\n- float: 32位浮点，单精度\n- double: 64位浮点，双精度\n- char: 16位Unicode字符\n- boolean: 布尔值，true或false', 'Java基本数据类型包括8种：byte、short、int、long、float、double、char、boolean，每种类型都有不同的位数和取值范围。', 2, 'public', '2024-01-16 10:00:00', '2024-01-16 10:00:00'),
('note2', 1, '面向对象三大特性', '1. **封装**：隐藏实现细节，通过访问修饰符控制可见性\n2. **继承**：代码复用，子类继承父类的属性和方法\n3. **多态**：同一接口不同实现，包括方法重载和重写', '面向对象编程的三大核心特性：封装、继承和多态，是Java编程的基础概念。', 2, 'public', '2024-01-17 14:00:00', '2024-01-17 14:00:00'),
('note3', 2, 'Spring Boot 配置要点', '## 配置文件优先级\n1. application.properties\n2. application.yml\n3. 环境变量\n4. 命令行参数\n\n## 常用配置\n- server.port: 服务器端口\n- spring.datasource.url: 数据库连接\n- logging.level: 日志级别', 'Spring Boot配置文件的使用方法和常见配置项说明，包括配置文件优先级和常用配置项。', 2, 'private', '2024-01-21 09:00:00', '2024-01-21 09:00:00'),
('note4', 3, '栈和队列的区别', '## 栈（Stack）\n- 后进先出（LIFO）\n- 只能在栈顶进行插入和删除操作\n- 主要操作：push（入栈）、pop（出栈）\n- 应用：表达式求值、函数调用、括号匹配\n\n## 队列（Queue）\n- 先进先出（FIFO）\n- 在队尾插入，队头删除\n- 主要操作：enqueue（入队）、dequeue（出队）\n- 应用：任务调度、消息队列', '栈和队列是两种重要的线性数据结构，栈遵循LIFO原则，队列遵循FIFO原则，各有不同的应用场景。', 2, 'public', '2024-02-02 10:00:00', '2024-02-02 10:00:00'),
('note5', 3, '常见排序算法复杂度', '## 时间复杂度\n- **冒泡排序**：O(n²)\n- **选择排序**：O(n²)\n- **插入排序**：O(n²)\n- **快速排序**：平均O(nlogn)，最坏O(n²)\n- **归并排序**：O(nlogn)\n- **堆排序**：O(nlogn)\n\n## 空间复杂度\n- 快速排序：O(logn)\n- 归并排序：O(n)\n- 其他：O(1)', '常见排序算法的时间复杂度和空间复杂度对比，快速排序和归并排序是效率较高的排序算法。', 2, 'public', '2024-02-03 14:00:00', '2024-02-03 14:00:00'),
('note6', 3, '二叉树遍历方法', '## 三种遍历方式\n1. **前序遍历**：根-左-右\n2. **中序遍历**：左-根-右（对BST得到有序序列）\n3. **后序遍历**：左-右-根\n\n## 实现方式\n- 递归实现：代码简洁，但可能栈溢出\n- 迭代实现：使用栈模拟递归过程', '二叉树的三种遍历方式：前序、中序、后序，可以通过递归或迭代方式实现。', 2, 'public', '2024-02-04 11:00:00', '2024-02-04 11:00:00'),
('note7', 5, 'SQL事务ACID特性', '## ACID特性\n- **原子性（Atomicity）**：事务要么全部执行，要么全部不执行\n- **一致性（Consistency）**：事务执行前后数据库保持一致状态\n- **隔离性（Isolation）**：并发事务之间相互隔离\n- **持久性（Durability）**：事务提交后数据永久保存\n\n## 隔离级别\n- READ UNCOMMITTED\n- READ COMMITTED\n- REPEATABLE READ\n- SERIALIZABLE', 'SQL事务的ACID特性是数据库事务管理的基础，确保数据的一致性和可靠性。', 2, 'public', '2024-02-16 09:00:00', '2024-02-16 09:00:00'),
('note8', 5, '数据库索引优化', '## 索引类型\n- **B+树索引**：最常用，适合范围查询\n- **哈希索引**：等值查询快，不支持范围查询\n- **全文索引**：用于文本搜索\n\n## 索引优化原则\n1. 为经常查询的列创建索引\n2. 避免在小表上创建过多索引\n3. 复合索引遵循最左前缀原则\n4. 定期分析索引使用情况', '数据库索引是提高查询性能的重要手段，需要根据查询模式合理设计索引。', 2, 'public', '2024-02-17 15:00:00', '2024-02-17 15:00:00'),
('note9', 6, '进程与线程的区别', '## 进程（Process）\n- 资源分配的基本单位\n- 拥有独立的地址空间\n- 进程间通信需要特殊机制（IPC）\n- 创建和切换开销大\n\n## 线程（Thread）\n- CPU调度的基本单位\n- 共享进程的地址空间\n- 线程间通信简单（共享内存）\n- 创建和切换开销小\n\n## 关系\n- 一个进程可以包含多个线程\n- 线程是轻量级的进程', '进程和线程是操作系统中的重要概念，进程是资源分配单位，线程是CPU调度单位，各有特点。', 2, 'public', '2024-02-21 10:00:00', '2024-02-21 10:00:00'),
('note10', 6, '死锁产生的条件', '## 死锁产生的四个必要条件\n1. **互斥条件**：资源不能被多个进程同时使用\n2. **请求与保持**：进程持有资源的同时请求新资源\n3. **不可剥夺**：已分配的资源不能被强制释放\n4. **循环等待**：存在进程资源的循环等待链\n\n## 死锁预防\n- 破坏四个必要条件之一\n- 使用银行家算法避免死锁', '死锁是操作系统中的经典问题，需要理解死锁产生的四个必要条件以及预防方法。', 2, 'public', '2024-02-22 14:00:00', '2024-02-22 14:00:00'),
('note11', 7, 'TCP与UDP的区别', '## TCP（传输控制协议）\n- 面向连接，需要三次握手\n- 可靠传输，保证数据顺序\n- 流量控制和拥塞控制\n- 开销大，速度相对慢\n- 适用于：HTTP、FTP、SMTP\n\n## UDP（用户数据报协议）\n- 无连接，直接发送\n- 不可靠传输，不保证顺序\n- 无流量控制\n- 开销小，速度快\n- 适用于：DNS、视频流、在线游戏', 'TCP和UDP是传输层的两种主要协议，TCP可靠但开销大，UDP快速但不可靠，各有适用场景。', 2, 'public', '2024-02-26 09:00:00', '2024-02-26 09:00:00'),
('note12', 7, 'HTTP状态码总结', '## 2xx 成功\n- 200 OK：请求成功\n- 201 Created：资源创建成功\n- 204 No Content：无内容返回\n\n## 3xx 重定向\n- 301 Moved Permanently：永久重定向\n- 302 Found：临时重定向\n- 304 Not Modified：资源未修改\n\n## 4xx 客户端错误\n- 400 Bad Request：请求错误\n- 401 Unauthorized：未授权\n- 403 Forbidden：禁止访问\n- 404 Not Found：资源不存在\n\n## 5xx 服务器错误\n- 500 Internal Server Error：服务器内部错误\n- 502 Bad Gateway：网关错误\n- 503 Service Unavailable：服务不可用', 'HTTP状态码用于表示请求的处理结果，分为成功、重定向、客户端错误和服务器错误四大类。', 2, 'public', '2024-02-27 11:00:00', '2024-02-27 11:00:00'),
('note13', 8, 'CPU缓存层次结构', '## 三级缓存\n- **L1缓存**：最快，容量最小（KB级），分为指令缓存和数据缓存\n- **L2缓存**：速度中等，容量中等（MB级）\n- **L3缓存**：速度较慢，容量较大（MB到GB级）\n\n## 缓存一致性\n- 多核CPU需要保证缓存一致性\n- 使用MESI协议维护缓存一致性\n- 写回和写直达两种策略', 'CPU缓存采用多级层次结构，L1最快最小，L3最慢最大，多核系统需要维护缓存一致性。', 2, 'public', '2024-03-02 10:00:00', '2024-03-02 10:00:00');

-- 插入示例测验
-- 注意：JSON 字符串需要正确转义，每个题目需要唯一的 id
-- 题目类型：single(单选题), multiple(多选题), truefalse(判断题)
INSERT INTO quiz (id, course_id, title, questions, author_id, created_at, updated_at) VALUES
('quiz1', 1, 'Java 基础测验', 
'[{"id":"quiz1-q1","type":"multiple","question":"Java中哪些数据类型占用8个字节？","options":["int","long","double","float"],"answer":[1,2]},{"id":"quiz1-q2","type":"multiple","question":"以下哪些是Java的基本数据类型？","options":["String","int","boolean","Object"],"answer":[1,2]},{"id":"quiz1-q3","type":"truefalse","question":"Java是一种面向对象的编程语言","options":["正确","错误"],"answer":[0]},{"id":"quiz1-q4","type":"single","question":"Java中哪个关键字用于实现继承？","options":["extends","implements","super","this"],"answer":[0]},{"id":"quiz1-q5","type":"truefalse","question":"Java支持多重继承","options":["正确","错误"],"answer":[1]}]',
1, '2024-01-18 10:00:00', '2024-01-18 10:00:00'),
('quiz2', 2, 'Spring Boot 入门测验',
'[{"id":"quiz2-q1","type":"single","question":"Spring Boot的默认端口是多少？","options":["8080","3000","5000","7000"],"answer":[0]},{"id":"quiz2-q2","type":"truefalse","question":"Spring Boot可以自动配置应用程序","options":["正确","错误"],"answer":[0]},{"id":"quiz2-q3","type":"single","question":"Spring Boot中哪个注解用于启动类？","options":["@SpringBootApplication","@EnableAutoConfiguration","@ComponentScan","@Configuration"],"answer":[0]}]',
1, '2024-01-22 15:00:00', '2024-01-22 15:00:00'),
('quiz3', 3, '数据结构基础测验',
'[{"id":"quiz3-q1","type":"single","question":"栈的数据结构特点是什么？","options":["先进先出","后进先出","随机存取","双向存取"],"answer":[1]},{"id":"quiz3-q2","type":"single","question":"下列哪种排序算法的时间复杂度是O(nlogn)？","options":["冒泡排序","选择排序","快速排序","插入排序"],"answer":[2]},{"id":"quiz3-q3","type":"multiple","question":"以下哪些是线性数据结构？","options":["数组","链表","栈","树"],"answer":[0,1,2]},{"id":"quiz3-q4","type":"truefalse","question":"二叉搜索树的中序遍历可以得到有序序列","options":["正确","错误"],"answer":[0]},{"id":"quiz3-q5","type":"single","question":"哈希表查找的平均时间复杂度是多少？","options":["O(1)","O(n)","O(logn)","O(n²)"],"answer":[0]}]',
1, '2024-02-05 10:00:00', '2024-02-05 10:00:00'),
('quiz4', 3, '算法复杂度分析',
'[{"id":"quiz4-q1","type":"single","question":"二分查找算法的时间复杂度是多少？","options":["O(1)","O(n)","O(logn)","O(n²)"],"answer":[2]},{"id":"quiz4-q2","type":"truefalse","question":"动态规划算法通常用于解决最优化问题","options":["正确","错误"],"answer":[0]},{"id":"quiz4-q3","type":"multiple","question":"以下哪些算法的时间复杂度是O(n²)？","options":["冒泡排序","快速排序（最坏情况）","归并排序","选择排序"],"answer":[0,1,3]}]',
1, '2024-02-06 14:00:00', '2024-02-06 14:00:00'),
('quiz5', 5, '数据库基础测验',
'[{"id":"quiz5-q1","type":"single","question":"SQL中用于查询的关键字是什么？","options":["SELECT","FROM","WHERE","JOIN"],"answer":[0]},{"id":"quiz5-q2","type":"multiple","question":"以下哪些是SQL事务的ACID特性？","options":["原子性","一致性","隔离性","持久性"],"answer":[0,1,2,3]},{"id":"quiz5-q3","type":"truefalse","question":"主键约束可以包含NULL值","options":["正确","错误"],"answer":[1]},{"id":"quiz5-q4","type":"single","question":"SQL中哪个关键字用于删除表中的数据？","options":["DELETE","DROP","TRUNCATE","REMOVE"],"answer":[0]}]',
1, '2024-02-18 09:00:00', '2024-02-18 09:00:00'),
('quiz6', 6, '操作系统基础测验',
'[{"id":"quiz6-q1","type":"single","question":"进程和线程的主要区别是什么？","options":["进程是资源分配单位，线程是CPU调度单位","进程是CPU调度单位，线程是资源分配单位","没有区别","进程比线程更轻量"],"answer":[0]},{"id":"quiz6-q2","type":"multiple","question":"死锁产生的必要条件包括哪些？","options":["互斥条件","请求与保持","不可剥夺","循环等待"],"answer":[0,1,2,3]},{"id":"quiz6-q3","type":"truefalse","question":"虚拟内存技术允许程序使用超过物理内存大小的地址空间","options":["正确","错误"],"answer":[0]},{"id":"quiz6-q4","type":"single","question":"页面置换算法中，哪个算法会产生Belady异常？","options":["FIFO","LRU","OPT","CLOCK"],"answer":[0]}]',
1, '2024-02-23 10:00:00', '2024-02-23 10:00:00'),
('quiz7', 7, '计算机网络基础',
'[{"id":"quiz7-q1","type":"single","question":"TCP协议的特点是什么？","options":["无连接、不可靠","面向连接、可靠","无连接、可靠","面向连接、不可靠"],"answer":[1]},{"id":"quiz7-q2","type":"multiple","question":"以下哪些是应用层协议？","options":["HTTP","TCP","FTP","SMTP"],"answer":[0,2,3]},{"id":"quiz7-q3","type":"truefalse","question":"UDP协议提供可靠的数据传输","options":["正确","错误"],"answer":[1]},{"id":"quiz7-q4","type":"single","question":"HTTP协议默认使用的端口号是多少？","options":["80","443","8080","21"],"answer":[0]},{"id":"quiz7-q5","type":"single","question":"IP地址192.168.1.1属于哪个地址类别？","options":["A类","B类","C类","D类"],"answer":[2]}]',
1, '2024-02-28 14:00:00', '2024-02-28 14:00:00'),
('quiz8', 8, '计算机组成原理测验',
'[{"id":"quiz8-q1","type":"single","question":"CPU的三级缓存中，哪个缓存速度最快？","options":["L1缓存","L2缓存","L3缓存","主存"],"answer":[0]},{"id":"quiz8-q2","type":"truefalse","question":"多核CPU需要维护缓存一致性","options":["正确","错误"],"answer":[0]},{"id":"quiz8-q3","type":"multiple","question":"以下哪些是CPU的组成部分？","options":["ALU（算术逻辑单元）","控制单元","寄存器","缓存"],"answer":[0,1,2,3]},{"id":"quiz8-q4","type":"single","question":"指令周期包括哪些阶段？","options":["取指、译码、执行","取指、执行、写回","取指、译码、执行、写回","译码、执行、写回"],"answer":[2]}]',
1, '2024-03-03 09:00:00', '2024-03-03 09:00:00');

