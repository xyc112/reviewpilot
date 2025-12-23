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
(5, '数据库设计与优化', '学习数据库设计原则和性能优化技巧', 'ADVANCED', 1, '2024-02-15 16:00:00');

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
(5, '性能优化');

-- 插入知识图谱节点（示例课程1：Java 编程基础）
INSERT INTO graph (course_id, nodes, relations) VALUES
(1, 
'[{"id":"n1","label":"Java基础","type":"concept","description":"Java语言的基本概念"},{"id":"n2","label":"变量与数据类型","type":"topic","description":"学习Java中的变量声明和基本数据类型"},{"id":"n3","label":"控制结构","type":"topic","description":"if-else、循环等控制语句"},{"id":"n4","label":"面向对象","type":"concept","description":"类、对象、继承、多态等概念"},{"id":"n5","label":"异常处理","type":"topic","description":"try-catch、异常类型"}]',
'[{"id":"r1","from":"n1","to":"n2","type":"part_of","directed":true,"weight":0.8},{"id":"r2","from":"n1","to":"n3","type":"part_of","directed":true,"weight":0.8},{"id":"r3","from":"n1","to":"n4","type":"prerequisite","directed":true,"weight":0.9},{"id":"r4","from":"n2","to":"n3","type":"related","directed":false,"weight":0.6},{"id":"r5","from":"n4","to":"n5","type":"related","directed":false,"weight":0.7}]'
);

-- 插入示例笔记
INSERT INTO note (id, course_id, title, content, summary, author_id, visibility, created_at, updated_at) VALUES
('note1', 1, 'Java 变量类型总结', 'Java中有8种基本数据类型：\n- byte: 8位\n- short: 16位\n- int: 32位\n- long: 64位\n- float: 32位浮点\n- double: 64位浮点\n- char: 16位字符\n- boolean: 布尔值', 'Java基本数据类型包括8种：byte、short、int、long、float、double、char、boolean，每种类型都有不同的位数和取值范围。', 2, 'public', '2024-01-16 10:00:00', '2024-01-16 10:00:00'),
('note2', 1, '面向对象三大特性', '1. 封装：隐藏实现细节\n2. 继承：代码复用\n3. 多态：同一接口不同实现', '面向对象编程的三大核心特性：封装、继承和多态，是Java编程的基础概念。', 2, 'public', '2024-01-17 14:00:00', '2024-01-17 14:00:00'),
('note3', 2, 'Spring Boot 配置要点', 'application.yml 配置说明...', 'Spring Boot配置文件的使用方法和常见配置项说明。', 2, 'private', '2024-01-21 09:00:00', '2024-01-21 09:00:00');

-- 插入示例测验
-- 注意：JSON 字符串需要正确转义，每个题目需要唯一的 id
-- 题目类型：single(单选题), multiple(多选题), truefalse(判断题)
INSERT INTO quiz (id, course_id, title, questions, author_id, created_at, updated_at) VALUES
('quiz1', 1, 'Java 基础测验', 
'[{"id":"quiz1-q1","type":"multiple","question":"Java中哪些数据类型占用8个字节？","options":["int","long","double","float"],"answer":[1,2]},{"id":"quiz1-q2","type":"multiple","question":"以下哪些是Java的基本数据类型？","options":["String","int","boolean","Object"],"answer":[1,2]},{"id":"quiz1-q3","type":"truefalse","question":"Java是一种面向对象的编程语言","options":["正确","错误"],"answer":[0]}]',
1, '2024-01-18 10:00:00', '2024-01-18 10:00:00'),
('quiz2', 2, 'Spring Boot 入门测验',
'[{"id":"quiz2-q1","type":"single","question":"Spring Boot的默认端口是多少？","options":["8080","3000","5000","7000"],"answer":[0]},{"id":"quiz2-q2","type":"truefalse","question":"Spring Boot可以自动配置应用程序","options":["正确","错误"],"answer":[0]}]',
1, '2024-01-22 15:00:00', '2024-01-22 15:00:00');

