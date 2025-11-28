// QuizList.ets
import { Quiz } from '../type/QuizTypes';
import { QuizController } from '../controller/QuizController';
import { PromptAction, promptAction } from '@kit.ArkUI';
import router from '@ohos.router';

@Entry
@Component
struct QuizList {
  @StorageLink('username') username: string = '未登录';
  @StorageLink('userRole') userRole: string = 'USER';
  @StorageLink('isLoggedIn') isLoggedIn: boolean = false;
  
  private quizController: QuizController = new QuizController('');
  @State quizzes: Quiz[] = [];
  @State isLoading: boolean = false;
  @State errorMessage: string = '';
  @State successMessage: string = '';
  private courseId: number = 0;
  private courseTitle: string = '';

  aboutToAppear(): void {
    // 从路由参数获取课程ID
    const params = router.getParams() as Record<string, Object>;
    if (params) {
      this.courseId = (params.courseId as number) || 0;
      this.courseTitle = (params.courseTitle as string) || '未知课程';
    }
    
    // 获取token并设置
    const token: string = AppStorage.get<string>('userToken') || '';
    console.log('QuizList页面加载，课程ID:', this.courseId, 'token:', token ? '有效' : '无效');
    this.quizController.setToken(token);
    
    if (this.courseId > 0) {
      this.loadQuizzes();
    } else {
      this.errorMessage = '课程ID无效';
    }
  }

  build() {
    Column() {
      // 顶部导航栏
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

      // 测验列表
      if (this.quizzes.length === 0 && !this.isLoading && !this.errorMessage) {
        this.buildEmptyState()
      } else {
        this.buildQuizList()
      }

      // 添加测验按钮 - 仅管理员可见
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
      Button('返回')
        .fontSize(16)
        .backgroundColor('#007dff')
        .onClick(() => {
          router.back();
        })
      
      Column() {
        Text('课程测验')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
        
        Text(this.courseTitle)
          .fontSize(14)
          .fontColor('#666')
          .margin({ top: 4 })
      }
      .layoutWeight(1)
      .alignItems(HorizontalAlign.Center)

      Button('刷新')
        .fontSize(14)
        .backgroundColor('#52c41a')
        .onClick(() => {
          this.loadQuizzes();
        })
    }
    .width('100%')
    .margin({ bottom: 20 })
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

  // 构建空状态
  @Builder
  buildEmptyState() {
    Column() {
      Text('🧩')
        .fontSize(48)
        .margin({ bottom: 16 })
      
      Text('暂无测验')
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .margin({ bottom: 8 })
      
      Text(this.userRole === 'ADMIN' ? '立即创建第一个测验吧！' : '请等待管理员创建测验。')
        .fontSize(14)
        .fontColor('#666')
        .margin({ bottom: 20 })
        .textAlign(TextAlign.Center)
      
      if (this.userRole === 'ADMIN') {
        Button('创建新测验')
          .fontSize(16)
          .backgroundColor('#007dff')
          .padding({ left: 20, right: 20, top: 8, bottom: 8 })
          .onClick(() => {
            this.createQuiz();
          })
      }
    }
    .justifyContent(FlexAlign.Center)
    .width('100%')
    .layoutWeight(1)
  }

  // 构建测验列表
  @Builder
  buildQuizList() {
    List({ space: 12 }) {
      ForEach(this.quizzes, (quiz: Quiz) => {
        ListItem() {
          this.buildQuizItem(quiz)
        }
      }, (quiz: Quiz) => quiz.id)
    }
    .layoutWeight(1)
    .width('100%')
  }

  // 构建测验项
  @Builder
  buildQuizItem(quiz: Quiz) {
    Column() {
      Row() {
        Text(quiz.title)
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .layoutWeight(1)
        
        if (quiz.isPublished) {
          Text('已发布')
            .fontSize(12)
            .fontColor('#52c41a')
            .backgroundColor('#f6ffed')
            .padding({ left: 8, right: 8, top: 2, bottom: 2 })
            .borderRadius(10)
        } else {
          Text('草稿')
            .fontSize(12)
            .fontColor('#666')
            .backgroundColor('#f5f5f5')
            .padding({ left: 8, right: 8, top: 2, bottom: 2 })
            .borderRadius(10)
        }
      }
      .width('100%')
      .margin({ bottom: 8 })

      if (quiz.description) {
        Text(quiz.description)
          .fontSize(14)
          .fontColor('#666')
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .width('100%')
          .margin({ bottom: 8 })
      }

      Row() {
        Text(`题目数量: ${quiz.questions.length}`)
          .fontSize(12)
          .fontColor('#666')
        
        if (quiz.timeLimit) {
          Text(`时长: ${quiz.timeLimit}分钟`)
            .fontSize(12)
            .fontColor('#666')
            .margin({ left: 16 })
        }
        
        Text(`及格分: ${quiz.passingScore}`)
          .fontSize(12)
          .fontColor('#666')
          .margin({ left: 16 })
      }
      .width('100%')
      .margin({ bottom: 12 })

      Row() {
        Button('开始测验')
          .fontSize(12)
          .backgroundColor('#52c41a')
          .onClick(() => {
            this.startQuiz(quiz.id);
          })
        
        if (this.userRole === 'ADMIN') {
          Button('编辑')
            .fontSize(12)
            .backgroundColor('#1890ff')
            .margin({ left: 8 })
            .onClick(() => {
              this.editQuiz(quiz.id);
            })
          
          Button('删除')
            .fontSize(12)
            .backgroundColor('#ff4d4f')
            .margin({ left: 8 })
            .onClick(() => {
              this.deleteQuiz(quiz.id);
            })
        }
      }
      .width('100%')
      .justifyContent(FlexAlign.End)
    }
    .padding(16)
    .backgroundColor(Color.White)
    .borderRadius(12)
    .shadow({ radius: 2, color: '#1a000000', offsetX: 0, offsetY: 1 })
  }

  // 构建添加按钮
  @Builder
  buildAddButton() {
    Button('创建新测验')
      .width('100%')
      .height(44)
      .fontSize(16)
      .fontWeight(FontWeight.Medium)
      .backgroundColor('#007dff')
      .fontColor(Color.White)
      .borderRadius(8)
      .margin({ top: 20 })
      .onClick(() => {
        this.createQuiz();
      })
  }

  // 加载测验列表
  private async loadQuizzes(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('开始加载测验列表，课程ID:', this.courseId);
      const result = await this.quizController.listQuizzes(this.courseId);

      if (result.success && result.data) {
        this.quizzes = result.data;
        this.successMessage = `共加载 ${result.total} 个测验`;
        console.log('测验加载成功，测验数量:', result.data.length);
      } else {
        this.errorMessage = result.message || '加载测验失败';
        console.error('测验加载失败:', result.message);
      }
    } catch (error) {
      this.errorMessage = '加载测验时发生异常: ' + (error as Error).message;
      console.error('测验加载异常:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // 开始测验
  private startQuiz(quizId: string): void {
    try {
      console.log('开始测验，测验ID:', quizId);
      router.pushUrl({ 
        url: 'pages/QuizDetail',
        params: { 
          courseId: this.courseId,
          quizId: quizId 
        }
      });
    } catch (error) {
      console.error('跳转到测验页面失败:', error);
      this.errorMessage = '页面跳转失败: ' + (error as Error).message;
    }
  }

  // 创建测验
  private createQuiz(): void {
    try {
      console.log('创建新测验');
      router.pushUrl({ 
        url: 'pages/CreateQuiz',
        params: { 
          courseId: this.courseId,
          courseTitle: this.courseTitle
        }
      });
    } catch (error) {
      console.error('跳转到创建测验页面失败:', error);
      this.errorMessage = '页面跳转失败: ' + (error as Error).message;
    }
  }

  // 编辑测验
  private editQuiz(quizId: string): void {
    try {
      console.log('编辑测验，测验ID:', quizId);
      router.pushUrl({ 
        url: 'pages/EditQuiz',
        params: { 
          courseId: this.courseId,
          quizId: quizId 
        }
      });
    } catch (error) {
      console.error('跳转到编辑测验页面失败:', error);
      this.errorMessage = '页面跳转失败: ' + (error as Error).message;
    }
  }

  // 删除测验
  private async deleteQuiz(quizId: string): Promise<void> {
    try {
      promptAction.showDialog({
        title: '确认删除',
        message: '确定要删除这个测验吗？此操作不可恢复。',
        buttons: [
          { text: '取消', color: '#666' },
          { text: '删除', color: '#ff4d4f' }
        ]
      }).then(async (result: promptAction.ShowDialogSuccessResponse) => {
        if (result.index === 1) {
          console.log('确认删除测验，测验ID:', quizId);
          const deleteResult = await this.quizController.deleteQuiz(this.courseId, quizId);
          
          if (deleteResult.success) {
            this.successMessage = '测验删除成功';
            this.loadQuizzes(); // 重新加载列表
          } else {
            this.errorMessage = deleteResult.message || '删除测验失败';
          }
        }
      });
    } catch (error) {
      console.error('删除测验失败:', error);
      this.errorMessage = '删除测验时发生异常: ' + (error as Error).message;
    }
  }
}