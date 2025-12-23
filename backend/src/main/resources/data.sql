-- =========================================
-- ReviewPilot 初始化数据
-- H2 数据库 MySQL 模式
-- =========================================

-- 插入初始用户
-- 密码都是 "123456"，使用 BCrypt 加密
-- BCrypt hash for "123456": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO account (id, username, password, role) VALUES
(1, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'),
(2, '胡久鸣', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'),
(3, '蔡烨培', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'),
(4, '吴迪', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'),
(5, '居远谋', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'),
(6, '钟定博', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'),
(7, '杨舒文', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'),
(8, '谢宇成', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER');

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
-- 每门课程至少两份测试，每份测试围绕一个主题

-- 课程1: Java 编程基础
INSERT INTO quiz (id, course_id, title, questions, author_id, created_at, updated_at) VALUES
('quiz1', 1, 'Java 数据类型与变量', 
'[{"id":"quiz1-q1","type":"single","question":"Java中哪个基本数据类型占用4个字节？","options":["byte","short","int","long"],"answer":[2]},{"id":"quiz1-q2","type":"multiple","question":"以下哪些是Java的基本数据类型？","options":["String","int","boolean","Object"],"answer":[1,2]},{"id":"quiz1-q3","type":"single","question":"Java中char类型占用几个字节？","options":["1","2","4","8"],"answer":[1]},{"id":"quiz1-q4","type":"truefalse","question":"Java中boolean类型只有true和false两个值","options":["正确","错误"],"answer":[0]},{"id":"quiz1-q5","type":"single","question":"Java中浮点数默认类型是什么？","options":["float","double","BigDecimal","不确定"],"answer":[1]}]',
1, '2024-01-18 10:00:00', '2024-01-18 10:00:00'),
('quiz1-2', 1, 'Java 面向对象编程',
'[{"id":"quiz1-2-q1","type":"single","question":"Java中哪个关键字用于实现继承？","options":["extends","implements","super","this"],"answer":[0]},{"id":"quiz1-2-q2","type":"truefalse","question":"Java支持多重继承","options":["正确","错误"],"answer":[1]},{"id":"quiz1-2-q3","type":"multiple","question":"面向对象编程的三大特性包括哪些？","options":["封装","继承","多态","抽象"],"answer":[0,1,2]},{"id":"quiz1-2-q4","type":"single","question":"Java中哪个关键字用于调用父类的方法？","options":["this","super","extends","implements"],"answer":[1]},{"id":"quiz1-2-q5","type":"truefalse","question":"Java是一种纯面向对象的编程语言","options":["正确","错误"],"answer":[1]}]',
1, '2024-01-19 14:00:00', '2024-01-19 14:00:00'),

-- 课程2: Spring Boot 实战
('quiz2', 2, 'Spring Boot 基础配置',
'[{"id":"quiz2-q1","type":"single","question":"Spring Boot的默认端口是多少？","options":["8080","3000","5000","7000"],"answer":[0]},{"id":"quiz2-q2","type":"truefalse","question":"Spring Boot可以自动配置应用程序","options":["正确","错误"],"answer":[0]},{"id":"quiz2-q3","type":"single","question":"Spring Boot中哪个注解用于启动类？","options":["@SpringBootApplication","@EnableAutoConfiguration","@ComponentScan","@Configuration"],"answer":[0]},{"id":"quiz2-q4","type":"multiple","question":"Spring Boot的配置文件格式包括哪些？","options":["application.properties","application.yml","application.json","application.xml"],"answer":[0,1]}]',
1, '2024-01-22 15:00:00', '2024-01-22 15:00:00'),
('quiz2-2', 2, 'Spring Boot RESTful API',
'[{"id":"quiz2-2-q1","type":"single","question":"RESTful API中，GET请求通常用于什么操作？","options":["创建资源","查询资源","更新资源","删除资源"],"answer":[1]},{"id":"quiz2-2-q2","type":"single","question":"Spring Boot中哪个注解用于定义REST控制器？","options":["@Controller","@RestController","@Service","@Repository"],"answer":[1]},{"id":"quiz2-2-q3","type":"multiple","question":"HTTP状态码2xx表示什么？","options":["成功","重定向","客户端错误","服务器错误"],"answer":[0]},{"id":"quiz2-2-q4","type":"truefalse","question":"RESTful API应该使用名词而不是动词来命名资源","options":["正确","错误"],"answer":[0]}]',
1, '2024-01-23 10:00:00', '2024-01-23 10:00:00'),

-- 课程3: 数据结构与算法
('quiz3', 3, '线性数据结构',
'[{"id":"quiz3-q1","type":"single","question":"栈的数据结构特点是什么？","options":["先进先出","后进先出","随机存取","双向存取"],"answer":[1]},{"id":"quiz3-q2","type":"single","question":"队列的数据结构特点是什么？","options":["先进先出","后进先出","随机存取","双向存取"],"answer":[0]},{"id":"quiz3-q3","type":"multiple","question":"以下哪些是线性数据结构？","options":["数组","链表","栈","树"],"answer":[0,1,2]},{"id":"quiz3-q4","type":"truefalse","question":"链表在内存中必须是连续存储的","options":["正确","错误"],"answer":[1]}]',
1, '2024-02-05 10:00:00', '2024-02-05 10:00:00'),
('quiz4', 3, '排序与查找算法',
'[{"id":"quiz4-q1","type":"single","question":"二分查找算法的时间复杂度是多少？","options":["O(1)","O(n)","O(logn)","O(n²)"],"answer":[2]},{"id":"quiz4-q2","type":"single","question":"下列哪种排序算法的时间复杂度是O(nlogn)？","options":["冒泡排序","选择排序","快速排序","插入排序"],"answer":[2]},{"id":"quiz4-q3","type":"multiple","question":"以下哪些算法的时间复杂度是O(n²)？","options":["冒泡排序","快速排序（最坏情况）","归并排序","选择排序"],"answer":[0,1,3]},{"id":"quiz4-q4","type":"single","question":"哈希表查找的平均时间复杂度是多少？","options":["O(1)","O(n)","O(logn)","O(n²)"],"answer":[0]},{"id":"quiz4-q5","type":"truefalse","question":"快速排序是稳定的排序算法","options":["正确","错误"],"answer":[1]}]',
1, '2024-02-06 14:00:00', '2024-02-06 14:00:00'),

-- 课程4: React 前端开发
('quiz4-1', 4, 'React 基础概念',
'[{"id":"quiz4-1-q1","type":"single","question":"React中用于创建组件的函数是什么？","options":["createComponent","React.createElement","JSX","render"],"answer":[1]},{"id":"quiz4-1-q2","type":"truefalse","question":"React组件名称必须以大写字母开头","options":["正确","错误"],"answer":[0]},{"id":"quiz4-1-q3","type":"multiple","question":"React的核心概念包括哪些？","options":["组件","状态","属性","生命周期"],"answer":[0,1,2,3]},{"id":"quiz4-1-q4","type":"single","question":"React中用于更新组件状态的Hook是什么？","options":["useState","useEffect","useContext","useReducer"],"answer":[0]}]',
1, '2024-02-11 09:00:00', '2024-02-11 09:00:00'),
('quiz4-2', 4, 'React Hooks 与状态管理',
'[{"id":"quiz4-2-q1","type":"single","question":"useEffect Hook在什么时候执行？","options":["组件挂载时","组件更新时","组件卸载时","以上都是"],"answer":[3]},{"id":"quiz4-2-q2","type":"multiple","question":"React Hooks的规则包括哪些？","options":["只能在函数组件中使用","只能在顶层调用","可以在条件语句中使用","可以嵌套调用"],"answer":[0,1]},{"id":"quiz4-2-q3","type":"truefalse","question":"useState可以返回多个状态值","options":["正确","错误"],"answer":[0]}]',
1, '2024-02-12 14:00:00', '2024-02-12 14:00:00'),

-- 课程5: 数据库设计与优化
('quiz5', 5, 'SQL 基础语法',
'[{"id":"quiz5-q1","type":"single","question":"SQL中用于查询的关键字是什么？","options":["SELECT","FROM","WHERE","JOIN"],"answer":[0]},{"id":"quiz5-q2","type":"multiple","question":"以下哪些是SQL事务的ACID特性？","options":["原子性","一致性","隔离性","持久性"],"answer":[0,1,2,3]},{"id":"quiz5-q3","type":"truefalse","question":"主键约束可以包含NULL值","options":["正确","错误"],"answer":[1]},{"id":"quiz5-q4","type":"single","question":"SQL中哪个关键字用于删除表中的数据？","options":["DELETE","DROP","TRUNCATE","REMOVE"],"answer":[0]}]',
1, '2024-02-18 09:00:00', '2024-02-18 09:00:00'),
('quiz5-2', 5, '数据库索引与优化',
'[{"id":"quiz5-2-q1","type":"single","question":"数据库索引的主要作用是什么？","options":["加快查询速度","减少存储空间","提高数据完整性","简化SQL语句"],"answer":[0]},{"id":"quiz5-2-q2","type":"multiple","question":"以下哪些情况适合创建索引？","options":["经常用于WHERE子句的列","经常用于JOIN的列","经常更新的列","小表中的所有列"],"answer":[0,1]},{"id":"quiz5-2-q3","type":"truefalse","question":"索引越多，查询性能越好","options":["正确","错误"],"answer":[1]},{"id":"quiz5-2-q4","type":"single","question":"B+树索引最适用于什么类型的查询？","options":["等值查询","范围查询","模糊查询","全表扫描"],"answer":[1]}]',
1, '2024-02-19 10:00:00', '2024-02-19 10:00:00'),

-- 课程6: 操作系统原理
('quiz6', 6, '进程与线程管理',
'[{"id":"quiz6-q1","type":"single","question":"进程和线程的主要区别是什么？","options":["进程是资源分配单位，线程是CPU调度单位","进程是CPU调度单位，线程是资源分配单位","没有区别","进程比线程更轻量"],"answer":[0]},{"id":"quiz6-q2","type":"multiple","question":"死锁产生的必要条件包括哪些？","options":["互斥条件","请求与保持","不可剥夺","循环等待"],"answer":[0,1,2,3]},{"id":"quiz6-q3","type":"truefalse","question":"虚拟内存技术允许程序使用超过物理内存大小的地址空间","options":["正确","错误"],"answer":[0]},{"id":"quiz6-q4","type":"single","question":"页面置换算法中，哪个算法会产生Belady异常？","options":["FIFO","LRU","OPT","CLOCK"],"answer":[0]}]',
1, '2024-02-23 10:00:00', '2024-02-23 10:00:00'),
('quiz6-2', 6, '内存管理与文件系统',
'[{"id":"quiz6-2-q1","type":"single","question":"分页存储管理的主要优点是什么？","options":["实现简单","内存利用率高","支持虚拟内存","以上都是"],"answer":[3]},{"id":"quiz6-2-q2","type":"multiple","question":"文件系统的功能包括哪些？","options":["文件存储","文件访问","文件保护","文件共享"],"answer":[0,1,2,3]},{"id":"quiz6-2-q3","type":"truefalse","question":"FAT32文件系统支持大于4GB的单个文件","options":["正确","错误"],"answer":[1]}]',
1, '2024-02-24 14:00:00', '2024-02-24 14:00:00'),

-- 课程7: 计算机网络
('quiz7', 7, 'TCP/IP 协议栈',
'[{"id":"quiz7-q1","type":"single","question":"TCP协议的特点是什么？","options":["无连接、不可靠","面向连接、可靠","无连接、可靠","面向连接、不可靠"],"answer":[1]},{"id":"quiz7-q2","type":"multiple","question":"以下哪些是应用层协议？","options":["HTTP","TCP","FTP","SMTP"],"answer":[0,2,3]},{"id":"quiz7-q3","type":"truefalse","question":"UDP协议提供可靠的数据传输","options":["正确","错误"],"answer":[1]},{"id":"quiz7-q4","type":"single","question":"HTTP协议默认使用的端口号是多少？","options":["80","443","8080","21"],"answer":[0]},{"id":"quiz7-q5","type":"single","question":"IP地址192.168.1.1属于哪个地址类别？","options":["A类","B类","C类","D类"],"answer":[2]}]',
1, '2024-02-28 14:00:00', '2024-02-28 14:00:00'),
('quiz7-2', 7, 'HTTP 与网络安全',
'[{"id":"quiz7-2-q1","type":"single","question":"HTTPS协议使用的默认端口是多少？","options":["80","443","8080","8443"],"answer":[1]},{"id":"quiz7-2-q2","type":"multiple","question":"HTTP状态码4xx表示什么？","options":["成功","重定向","客户端错误","服务器错误"],"answer":[2]},{"id":"quiz7-2-q3","type":"truefalse","question":"HTTPS = HTTP + SSL/TLS","options":["正确","错误"],"answer":[0]},{"id":"quiz7-2-q4","type":"single","question":"三次握手的目的是什么？","options":["建立连接","断开连接","数据传输","错误恢复"],"answer":[0]}]',
1, '2024-02-29 10:00:00', '2024-02-29 10:00:00'),

-- 课程8: 计算机组成原理
('quiz8', 8, 'CPU 与指令系统',
'[{"id":"quiz8-q1","type":"single","question":"CPU的三级缓存中，哪个缓存速度最快？","options":["L1缓存","L2缓存","L3缓存","主存"],"answer":[0]},{"id":"quiz8-q2","type":"truefalse","question":"多核CPU需要维护缓存一致性","options":["正确","错误"],"answer":[0]},{"id":"quiz8-q3","type":"multiple","question":"以下哪些是CPU的组成部分？","options":["ALU（算术逻辑单元）","控制单元","寄存器","缓存"],"answer":[0,1,2,3]},{"id":"quiz8-q4","type":"single","question":"指令周期包括哪些阶段？","options":["取指、译码、执行","取指、执行、写回","取指、译码、执行、写回","译码、执行、写回"],"answer":[2]}]',
1, '2024-03-03 09:00:00', '2024-03-03 09:00:00'),
('quiz8-2', 8, '存储系统与总线',
'[{"id":"quiz8-2-q1","type":"single","question":"RAM和ROM的主要区别是什么？","options":["RAM可读写，ROM只读","RAM只读，ROM可读写","没有区别","RAM速度更快"],"answer":[0]},{"id":"quiz8-2-q2","type":"multiple","question":"存储器的层次结构包括哪些？","options":["寄存器","缓存","主存","外存"],"answer":[0,1,2,3]},{"id":"quiz8-2-q3","type":"truefalse","question":"总线是计算机各部件之间传输信息的公共通道","options":["正确","错误"],"answer":[0]}]',
1, '2024-03-04 14:00:00', '2024-03-04 14:00:00');

-- 注意：Question实体会在应用启动时通过QuizService自动创建
-- 以下数据假设Question已经存在（通过Quiz自动创建）
-- 如果Question不存在，这些WrongQuestion数据将无法插入
-- 建议：先启动应用创建Quiz，然后手动添加WrongQuestion数据，或者通过API添加

-- 插入示例错题（需要确保对应的Question实体已存在）
-- 这些数据仅作为示例，实际使用时需要通过API动态添加
-- INSERT INTO wrong_question (user_id, course_id, question_id, quiz_id, user_answer, mastered, added_at, last_practiced_at, practice_count) VALUES
-- (2, 1, 1, 'quiz1', '[0]', false, '2024-01-19 10:00:00', '2024-01-19 10:00:00', 1),
-- (2, 1, 2, 'quiz1', '[1]', false, '2024-01-19 10:00:00', NULL, 0),
-- (3, 3, 5, 'quiz3', '[0,1]', false, '2024-02-07 11:00:00', '2024-02-07 11:30:00', 2);

-- 插入示例帖子
INSERT INTO post (id, course_id, author_id, title, content, created_at, updated_at) VALUES
(1, 1, 2, 'Java中如何理解多态？', '最近在学习Java的面向对象编程，对多态这个概念有些困惑。\n\n多态是指同一个接口可以有不同的实现方式，但我还是不太理解在实际编程中如何应用。\n\n有没有同学能分享一下具体的例子？', '2024-01-19 10:30:00', '2024-01-19 10:30:00'),
(2, 1, 3, 'Java异常处理的最佳实践', '想和大家讨论一下Java异常处理的最佳实践。\n\n1. 什么时候应该抛出异常？\n2. 什么时候应该捕获异常？\n3. 如何设计自定义异常？\n\n欢迎大家分享经验！', '2024-01-20 14:20:00', '2024-01-20 14:20:00'),
(3, 2, 2, 'Spring Boot自动配置原理', 'Spring Boot的自动配置功能很强大，但我想深入了解它的工作原理。\n\n有谁能解释一下@EnableAutoConfiguration注解是如何工作的？以及Spring Boot是如何根据classpath中的jar包自动配置Bean的？', '2024-01-23 09:15:00', '2024-01-23 09:15:00'),
(4, 3, 2, '快速排序和归并排序哪个更好？', '在学习排序算法时，发现快速排序和归并排序的时间复杂度都是O(nlogn)，但实际应用中应该选择哪一个？\n\n它们各自的优缺点是什么？在什么场景下应该使用哪个？', '2024-02-07 11:00:00', '2024-02-07 11:00:00'),
(5, 3, 3, '动态规划问题求解思路', '动态规划一直是我比较薄弱的部分，想请教一下大家：\n\n1. 如何识别一个问题可以用动态规划解决？\n2. 动态规划的状态转移方程如何设计？\n3. 有没有推荐的练习题？', '2024-02-08 15:30:00', '2024-02-08 15:30:00'),
(6, 5, 2, '数据库索引优化问题', '最近在优化数据库查询性能，遇到了一些关于索引的问题：\n\n1. 什么时候应该创建索引？\n2. 复合索引的顺序如何影响查询性能？\n3. 索引是不是越多越好？', '2024-02-19 10:00:00', '2024-02-19 10:00:00'),
(7, 6, 2, '进程和线程的区别', '操作系统中的进程和线程有什么区别？\n\n我理解进程是资源分配的单位，线程是CPU调度的单位，但具体在实际应用中，什么时候应该使用多进程，什么时候应该使用多线程？', '2024-02-24 09:00:00', '2024-02-24 09:00:00'),
(8, 7, 3, 'TCP三次握手和四次挥手', '在学习TCP协议时，对三次握手和四次挥手的过程有些疑惑。\n\n为什么需要三次握手而不是两次？为什么需要四次挥手而不是三次？\n\n希望有同学能详细解释一下。', '2024-02-29 14:00:00', '2024-02-29 14:00:00'),
(9, 7, 2, 'HTTP和HTTPS的区别', 'HTTP和HTTPS的主要区别是什么？\n\nHTTPS是如何保证数据安全的？SSL/TLS协议的工作原理是什么？\n\n在实际开发中，什么时候必须使用HTTPS？', '2024-03-01 10:30:00', '2024-03-01 10:30:00'),
(10, 8, 2, 'CPU缓存一致性协议', '多核CPU如何保证缓存一致性？\n\nMESI协议是如何工作的？在什么情况下会发生缓存失效？\n\n这个问题对理解多线程编程很重要，希望大家能讨论一下。', '2024-03-04 11:00:00', '2024-03-04 11:00:00');

-- 插入示例评论
INSERT INTO comment (id, post_id, author_id, content, parent_id, created_at, updated_at) VALUES
(1, 1, 3, '多态的一个经典例子是：Animal animal = new Dog(); animal.makeSound(); 这里animal变量可以指向不同的子类对象，调用时会执行对应子类的方法。', NULL, '2024-01-19 11:00:00', '2024-01-19 11:00:00'),
(2, 1, 2, '谢谢！这个例子很清晰。那如果我想调用Dog特有的方法，应该怎么做？', NULL, '2024-01-19 11:30:00', '2024-01-19 11:30:00'),
(3, 1, 3, '可以使用类型转换：Dog dog = (Dog) animal; 或者使用instanceof检查后再转换。', 2, '2024-01-19 12:00:00', '2024-01-19 12:00:00'),
(4, 2, 3, '异常处理的原则：\n1. 能处理的异常就捕获处理\n2. 不能处理的异常就向上抛出\n3. 不要捕获异常后什么都不做\n4. 使用具体的异常类型，而不是通用的Exception', NULL, '2024-01-20 15:00:00', '2024-01-20 15:00:00'),
(5, 3, 3, 'Spring Boot的自动配置是通过@EnableAutoConfiguration注解实现的，它会扫描classpath下的META-INF/spring.factories文件，加载自动配置类。', NULL, '2024-01-23 10:00:00', '2024-01-23 10:00:00'),
(6, 4, 2, '快速排序平均情况下性能更好，但最坏情况是O(n²)。归并排序最坏情况也是O(nlogn)，但需要额外的O(n)空间。', NULL, '2024-02-07 12:00:00', '2024-02-07 12:00:00'),
(7, 4, 3, '补充一下：快速排序是原地排序，空间复杂度O(logn)。归并排序是稳定的，快速排序不稳定。', 6, '2024-02-07 12:30:00', '2024-02-07 12:30:00'),
(8, 5, 2, '动态规划的关键是找到最优子结构和重叠子问题。推荐练习：斐波那契数列、背包问题、最长公共子序列等。', NULL, '2024-02-08 16:00:00', '2024-02-08 16:00:00'),
(9, 6, 3, '索引不是越多越好！过多的索引会影响写入性能，因为每次INSERT/UPDATE/DELETE都需要维护索引。', NULL, '2024-02-19 11:00:00', '2024-02-19 11:00:00'),
(10, 7, 3, '多进程适合需要隔离的场景，多线程适合需要共享数据的场景。Python由于GIL的存在，多线程对CPU密集型任务效果不好。', NULL, '2024-02-24 10:00:00', '2024-02-24 10:00:00'),
(11, 8, 2, '三次握手是为了确认双方的发送和接收能力都正常。两次握手无法确认服务端的接收能力。', NULL, '2024-02-29 15:00:00', '2024-02-29 15:00:00'),
(12, 8, 3, '四次挥手是因为TCP是全双工的，需要分别关闭两个方向的连接。客户端发送FIN后，服务端可能还有数据要发送，所以先回复ACK，等数据发送完再发送FIN。', 11, '2024-02-29 15:30:00', '2024-02-29 15:30:00'),
(13, 9, 3, 'HTTPS = HTTP + SSL/TLS。SSL/TLS通过加密和证书验证来保证数据安全。现在大部分网站都应该使用HTTPS。', NULL, '2024-03-01 11:00:00', '2024-03-01 11:00:00'),
(14, 10, 3, 'MESI协议有四种状态：Modified（已修改）、Exclusive（独占）、Shared（共享）、Invalid（无效）。当某个核心修改了缓存中的数据时，其他核心的缓存会被标记为Invalid。', NULL, '2024-03-04 12:00:00', '2024-03-04 12:00:00');

-- 插入更多社区帖子（使用新添加的用户）
INSERT INTO post (id, course_id, author_id, title, content, created_at, updated_at) VALUES
(11, 1, 4, 'Java集合框架的选择', '在开发中经常需要选择不同的集合类，比如ArrayList、LinkedList、HashMap等。\n\n想请教一下大家，在什么场景下应该选择哪种集合？有没有一些选择的原则？', '2024-03-05 09:00:00', '2024-03-05 09:00:00'),
(12, 2, 2, 'Spring Boot中的依赖注入', '刚开始学习Spring Boot，对依赖注入的概念还不太理解。\n\n@Autowired注解是如何工作的？什么时候应该使用构造函数注入，什么时候使用字段注入？', '2024-03-06 10:30:00', '2024-03-06 10:30:00'),
(13, 3, 3, '二分查找的实现细节', '在实现二分查找时，总是容易出错，特别是边界条件的处理。\n\n想问问大家，二分查找的left和right边界应该如何处理？mid的计算方式有什么讲究？', '2024-03-07 14:00:00', '2024-03-07 14:00:00'),
(14, 4, 4, 'React组件通信方式', '在React中，父子组件、兄弟组件之间的通信有哪些方式？\n\nProps、Context、Redux等，它们各自的适用场景是什么？', '2024-03-08 11:00:00', '2024-03-08 11:00:00'),
(15, 5, 4, '数据库事务隔离级别', '数据库的四种隔离级别：READ UNCOMMITTED、READ COMMITTED、REPEATABLE READ、SERIALIZABLE。\n\n它们分别解决了什么问题？在实际项目中应该如何选择？', '2024-03-09 15:30:00', '2024-03-09 15:30:00'),
(16, 6, 2, '虚拟内存的作用', '虚拟内存是操作系统中的重要概念，但我不太理解它的具体作用。\n\n虚拟内存是如何实现的？它解决了什么问题？', '2024-03-10 09:30:00', '2024-03-10 09:30:00'),
(17, 7, 3, 'HTTP/2相比HTTP/1.1的改进', 'HTTP/2相比HTTP/1.1有哪些主要改进？\n\n多路复用、头部压缩、服务器推送等特性是如何提升性能的？', '2024-03-11 13:00:00', '2024-03-11 13:00:00'),
(18, 8, 4, 'CPU流水线技术', 'CPU流水线技术是如何提高处理效率的？\n\n流水线中的冒险（hazard）有哪些类型？如何解决这些冒险？', '2024-03-12 10:00:00', '2024-03-12 10:00:00');

-- 插入更多社区评论（使用新添加的用户）
INSERT INTO comment (id, post_id, author_id, content, parent_id, created_at, updated_at) VALUES
(15, 11, 2, 'ArrayList适合随机访问，LinkedList适合频繁插入删除。HashMap适合键值对存储，需要快速查找的场景。', NULL, '2024-03-05 10:00:00', '2024-03-05 10:00:00'),
(16, 11, 3, '补充：HashSet适合去重，TreeSet适合需要有序的场景。选择集合时主要考虑：是否需要有序、是否需要去重、访问模式等。', NULL, '2024-03-05 10:30:00', '2024-03-05 10:30:00'),
(17, 11, 4, '还要注意线程安全，如果多线程环境，可以使用ConcurrentHashMap、CopyOnWriteArrayList等。', 15, '2024-03-05 11:00:00', '2024-03-05 11:00:00'),
(18, 12, 4, '依赖注入的核心思想是控制反转（IoC）。@Autowired会从Spring容器中查找匹配的Bean并注入。', NULL, '2024-03-06 11:00:00', '2024-03-06 11:00:00'),
(19, 12, 3, '推荐使用构造函数注入，因为：1. 强制依赖，避免空指针；2. 便于测试；3. 不可变对象。字段注入不推荐，因为难以测试。', NULL, '2024-03-06 11:30:00', '2024-03-06 11:30:00'),
(20, 12, 4, 'Spring官方也推荐构造函数注入，这是最佳实践。', 19, '2024-03-06 12:00:00', '2024-03-06 12:00:00'),
(21, 13, 4, '二分查找的关键是保持循环不变式：搜索区间[left, right]始终包含目标元素（如果存在）。', NULL, '2024-03-07 15:00:00', '2024-03-07 15:00:00'),
(22, 13, 2, 'mid的计算：mid = left + (right - left) / 2 可以避免溢出。边界处理：left = mid + 1 和 right = mid - 1 要一致。', NULL, '2024-03-07 15:30:00', '2024-03-07 15:30:00'),
(23, 13, 4, '推荐使用左闭右开区间 [left, right)，这样边界处理更统一，不容易出错。', 22, '2024-03-07 16:00:00', '2024-03-07 16:00:00'),
(24, 14, 4, 'React组件通信方式：\n1. Props：父子组件\n2. Context：跨层级组件\n3. Redux/Zustand：全局状态管理\n4. 事件总线：兄弟组件', NULL, '2024-03-08 12:00:00', '2024-03-08 12:00:00'),
(25, 14, 2, '简单场景用Props，复杂场景用Context或状态管理库。Redux适合大型应用，Zustand更轻量。', NULL, '2024-03-08 12:30:00', '2024-03-08 12:30:00'),
(26, 15, 3, '隔离级别从低到高：\n- READ UNCOMMITTED：可能脏读\n- READ COMMITTED：避免脏读，可能不可重复读\n- REPEATABLE READ：避免不可重复读，可能幻读\n- SERIALIZABLE：最高隔离，避免所有问题', NULL, '2024-03-09 16:00:00', '2024-03-09 16:00:00'),
(27, 15, 4, 'MySQL默认是REPEATABLE READ，PostgreSQL默认是READ COMMITTED。选择时要平衡一致性和性能。', NULL, '2024-03-09 16:30:00', '2024-03-09 16:30:00'),
(28, 16, 4, '虚拟内存将物理内存和磁盘存储结合起来，为每个进程提供独立的地址空间。通过页表实现地址转换。', NULL, '2024-03-10 10:30:00', '2024-03-10 10:30:00'),
(29, 16, 3, '虚拟内存解决了：1. 内存保护；2. 内存共享；3. 更大的地址空间；4. 简化内存管理。', NULL, '2024-03-10 11:00:00', '2024-03-10 11:00:00'),
(30, 17, 4, 'HTTP/2的主要改进：\n1. 多路复用：一个连接处理多个请求\n2. 头部压缩：HPACK算法\n3. 服务器推送：主动推送资源\n4. 二进制分帧：提高解析效率', NULL, '2024-03-11 14:00:00', '2024-03-11 14:00:00'),
(31, 17, 2, 'HTTP/2解决了HTTP/1.1的队头阻塞问题，大幅提升了性能，特别是在高延迟网络环境下。', NULL, '2024-03-11 14:30:00', '2024-03-11 14:30:00'),
(32, 18, 4, 'CPU流水线将指令执行分为多个阶段（取指、译码、执行、访存、写回），多个指令可以同时在不同阶段执行。', NULL, '2024-03-12 11:00:00', '2024-03-12 11:00:00'),
(33, 18, 2, '流水线冒险包括：\n1. 数据冒险：数据依赖\n2. 控制冒险：分支跳转\n3. 结构冒险：资源冲突\n\n解决方法：数据前推、分支预测、延迟槽等。', NULL, '2024-03-12 11:30:00', '2024-03-12 11:30:00'),
(34, 18, 3, '现代CPU还使用乱序执行、超标量等技术进一步提升性能。', 33, '2024-03-12 12:00:00', '2024-03-12 12:00:00');

