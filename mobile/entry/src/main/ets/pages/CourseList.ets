// CourseManagement.ets
import { Course, CourseLevel, CreateCourseRequest } from '../type/CourseTypes';
import { CourseController } from '../controller/CourseController';
import { PromptAction, promptAction } from '@kit.ArkUI';
import router from '@ohos.router';
@Entry
@Component
struct CourseManagement {

  @StorageLink('username') username: string = '未登录';
  @StorageLink('userRole') userRole: string = 'USER';
  @StorageLink('isLoggedIn') isLoggedIn: boolean = false;
  private courseController: CourseController = new CourseController(''); // 需要在aboutToAppear中设置token
  @State courseList: Course[] = [];
  @State isLoading: boolean = false;
  @State errorMessage: string = '';
  @State successMessage: string = '';
  @State filterText: string = '';

  aboutToAppear(): void {
    // 从本地存储获取token并设置
    const token: string = this.getStoredToken();
    console.log('Dashboard页面加载，获取到的token:', token ? '有效' : '无效或为空');
    console.log('Dashboard页面加载，当前用户角色:', this.userRole);
    console.log('Dashboard页面加载，登录状态:', this.isLoggedIn);
    
    this.courseController.setToken(token);
    this.loadCourses();
  }

  build() {
    Column() {
      this.buildUserInfoHeader()
      // 顶部标题和过滤区域
      this.buildHeader()

      // 加载状态
      if (this.isLoading) {
        this.buildLoadingIndicator()
      }

      // 错误信息显示
      if (this.errorMessage) {
        this.buildErrorMessage()
      }

      // 成功信息显示
      if (this.successMessage) {
        this.buildSuccessMessage()
      }

      // 课程列表
      List({ space: 10 }) {
        ForEach(this.courseList, (course: Course) => {
          ListItem() {
            this.buildCourseItem(course)
          }
        }, (course: Course) => course.id.toString())
      }
      .layoutWeight(1)
      .width('100%')

      // 添加课程按钮 - 仅管理员可见
      if (this.userRole === 'ADMIN') {
        this.buildAddButton()
      }
    }
    .padding(20)
    .width('100%')
    .height('100%')
    .backgroundColor('#f5f5f5')
  }

  // 构建顶部区域
  @Builder
  buildHeader() {
    Row() {
      Column() {
        Text('课程管理')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
        
        Text(`当前角色: ${this.userRole}`)
          .fontSize(12)
          .fontColor('#666')
          .margin({ top: 4 })
      }
      .layoutWeight(1)

      Button('刷新')
        .onClick(() => {
          this.loadCourses();
        })
      
      Button('调试信息')
        .margin({ left: 10 })
        .onClick(() => {
          this.showDebugInfo();
        })
    }
    .width('100%')
    .margin({ bottom: 20 })

    // 搜索过滤
    TextInput({ placeholder: '搜索课程标题、描述或标签...' })
      .width('100%')
      .height(40)
      .backgroundColor(Color.White)
      .borderRadius(8)
      .padding(10)
      .onChange((value: string) => {
        this.filterText = value;
      })
      .onSubmit(() => {
        this.loadCourses(this.filterText);
      })
  }

  // 构建加载指示器
  @Builder
  buildLoadingIndicator() {
    Row() {
      LoadingProgress()
        .width(30)
        .height(30)
      Text('加载中...')
        .fontSize(16)
        .margin({ left: 10 })
    }
    .justifyContent(FlexAlign.Center)
    .width('100%')
    .padding(20)
  }

  // 构建错误信息
  @Builder
  buildErrorMessage() {
    Text(this.errorMessage)
      .fontSize(14)
      .fontColor(Color.Red)
      .backgroundColor('#ffeeee')
      .padding(10)
      .borderRadius(8)
      .width('100%')
      .margin({ bottom: 10 })
      .onClick(() => {
        this.errorMessage = '';
      })
  }

  // 构建成功信息
  @Builder
  buildSuccessMessage() {
    Text(this.successMessage)
      .fontSize(14)
      .fontColor(Color.Green)
      .backgroundColor('#eeffee')
      .padding(10)
      .borderRadius(8)
      .width('100%')
      .margin({ bottom: 10 })
      .onClick(() => {
        this.successMessage = '';
      })
  }

  // 构建课程项
  @Builder
  buildCourseItem(course: Course) {
    Column() {
      Row() {
        Text(course.title)
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .layoutWeight(1)

        Text(course.level)
          .fontSize(12)
          .fontColor(this.getLevelColor(course.level))
          .backgroundColor(this.getLevelBackgroundColor(course.level))
          .padding({ left: 8, right: 8, top: 2, bottom: 2 })
          .borderRadius(10)
      }
      .width('100%')
      .margin({ bottom: 8 })

      Text(course.description || '暂无描述')
        .fontSize(14)
        .fontColor('#666')
        .maxLines(2)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
        .width('100%')
        .margin({ bottom: 8 })

      // 标签显示
      if (course.tags && course.tags.length > 0) {
        Flex({ wrap: FlexWrap.Wrap }) {
          ForEach(course.tags, (tag: string) => {
            Text(tag)
              .fontSize(10)
              .fontColor('#666')
              .backgroundColor('#eeeeee')
              .padding({ left: 6, right: 6, top: 2, bottom: 2 })
              .borderRadius(4)
              .margin({ right: 5, bottom: 5 })
          })
        }
        .width('100%')

      }

      Row() {
        Text(`创建时间: ${this.formatDate(course.createdAt)}`)
          .fontSize(10)
          .fontColor('#999')
          .layoutWeight(1)

        // 所有用户都显示查看详情按钮
        Button('查看详情')
          .fontSize(12)
          .padding({ left: 12, right: 12, top: 4, bottom: 4 })
          .backgroundColor('#4CAF50')
          .onClick(() => {
            this.viewCourseDetail(course.id);
          })
      }
      .width('100%')
    }
    .padding(16)
    .backgroundColor(Color.White)
    .borderRadius(12)
    .shadow({ radius: 2, color: '#1a000000', offsetX: 0, offsetY: 1 })
  }

  // 构建添加按钮
  @Builder
  buildAddButton() {
    Button('添加新课程')
      .width('100%')
      .height(44)
      .fontSize(16)
      .fontWeight(FontWeight.Medium)
      .backgroundColor('#007dff')
      .fontColor(Color.White)
      .borderRadius(8)
      .margin({ top: 20 })
      .onClick(() => {
        console.log('点击添加新课程按钮，当前用户角色:', this.userRole);
        try {
          router.pushUrl({ url: 'pages/CreateCourse' });
        } catch (error) {
          console.error('路由跳转失败:', error);
          this.errorMessage = '页面跳转失败: ' + (error as Error).message;
        }
      })
  }
  @Builder
  buildUserInfoHeader() {
    Column() {
      Row() {

        Column({ space: 4 }) {
          // 用户名显示 - 直接绑定到 @StorageLink 变量
          Row() {
            Text('用户名:')
              .fontSize(14)
              .fontColor('#666')
              .width(60)
            Text(this.username) // 响应式显示用户名
              .fontSize(16)
              .fontColor('#333')
              .fontWeight(FontWeight.Medium)
              .layoutWeight(1)
          }

          // 用户角色显示
          Row() {
            Text('角色:')
              .fontSize(14)
              .fontColor('#666')
              .width(60)
            Text(this.userRole)
              .fontSize(14)

              .padding({ left: 8, right: 8, top: 2, bottom: 2 })
              .borderRadius(4)
              .fontWeight(FontWeight.Medium)
          }
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Start)

        // 退出登录按钮
        if (this.isLoggedIn) {
          Button('退出')
            .fontSize(12)
            .padding({ left: 12, right: 12, top: 6, bottom: 6 })
            .backgroundColor('#ff4d4f')
            .fontColor(Color.White)
            .borderRadius(6)
            .onClick(() => {
              this.logout();
            })
        }
      }
      .width('100%')
      .padding(16)
      .backgroundColor(Color.White)
      .borderRadius(12)
      .shadow({ radius: 2, color: '#1a000000', offsetX: 0, offsetY: 1 })
      .margin({ bottom: 20 })
    }
  }

  // 加载课程列表
  private async loadCourses(filter?: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('开始加载课程列表，过滤条件:', filter || '无');
      const result = await this.courseController.listCourses(filter);

      if (result.success && result.data) {
        this.courseList = result.data;
        this.successMessage = `共加载 ${result.total} 门课程`;
        console.log('课程加载成功，课程数量:', result.data.length);
      } else {
        this.errorMessage = result.message || '加载课程失败';
        console.error('课程加载失败:', result.message);
      }
    } catch (error) {
      this.errorMessage = '加载课程时发生异常: ' + error.message;
      console.error('课程加载异常:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // 查看课程详情
  private viewCourseDetail(courseId: number): void {
    try {
      console.log('跳转到课程详情页面，课程ID:', courseId);
      router.pushUrl({ 
        url: 'pages/CourseDetail',
        params: { courseId: courseId }
      });
    } catch (error) {
      console.error('跳转到课程详情页面失败:', error);
      this.errorMessage = '页面跳转失败: ' + (error as Error).message;
    }
  }



  // 显示创建课程对话框
  private showCreateDialog(): void {
    // 实现创建课程对话框
    promptAction.showDialog({
      title: '创建新课程',
      message: '创建功能待实现',
      buttons: [{ text: '确定',
        color:'#000000'
      }]
    });
  }

  // 工具方法：获取级别颜色
  private getLevelColor(level: CourseLevel): ResourceColor {
    switch (level) {
      case CourseLevel.BEGINNER: return '#52c41a';
      case CourseLevel.INTERMEDIATE: return '#1890ff';
      case CourseLevel.ADVANCED: return '#f5222d';
      default: return '#666';
    }
  }

  // 工具方法：获取级别背景色
  private getLevelBackgroundColor(level: CourseLevel): ResourceColor {
    switch (level) {
      case CourseLevel.BEGINNER: return '#f6ffed';
      case CourseLevel.INTERMEDIATE: return '#f0faff';
      case CourseLevel.ADVANCED: return '#fff2f0';
      default: return '#f5f5f5';
    }
  }

  // 工具方法：格式化日期
  private formatDate(dateString: string): string {
    try {
      const date: Date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    } catch {
      return dateString;
    }
  }

  // 工具方法：获取存储的token
  private getStoredToken(): string {
    return AppStorage.get<string>('userToken') || '';
  }


  private getAvatarText(): string {
    if (this.username === '未登录') {
      return '未';
    }
    return this.username.charAt(0).toUpperCase();
  }

  // 显示调试信息
  private showDebugInfo(): void {
    const token = this.getStoredToken();
    const debugInfo = `
调试信息:
- 用户名: ${this.username}
- 用户角色: ${this.userRole}
- 登录状态: ${this.isLoggedIn}
- Token长度: ${token.length}
- Token前10位: ${token.substring(0, 10)}...
- 课程数量: ${this.courseList.length}
    `;
    
    console.log(debugInfo);
    
    promptAction.showDialog({
      title: '调试信息',
      message: debugInfo.trim(),
      buttons: [{ text: '确定', color: '#000000' }]
    });
  }

  // 退出登录
  private async logout(): Promise<void> {
    try {
      promptAction.showDialog({
        title: '确认退出',
        message: `确定要退出登录吗？当前用户：${this.username}`,
        buttons: [
          { text: '取消', color: '#666' },
          { text: '确定退出', color: '#ff4d4f' }
        ]
      }).then(async (result: promptAction.ShowDialogSuccessResponse) => {
        if (result.index === 1) {
          // 执行退出逻辑
          AppStorage.delete('userToken');
          AppStorage.delete('username');
          AppStorage.delete('userRole');
          AppStorage.setOrCreate('isLoggedIn', false);

          // 显示退出成功提示
          promptAction.showToast({
            message: '已安全退出',
            duration: 1500
          });

          // 跳转回登录页面
          setTimeout(() => {
            router.replaceUrl({ url: 'pages/Login' });
          }, 1000);
        }
      });
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  }
}
