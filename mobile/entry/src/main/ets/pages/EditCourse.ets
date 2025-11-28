// EditCourse.ets
import { Course, CourseLevel, UpdateCourseRequest } from '../type/CourseTypes';
import { CourseController } from '../controller/CourseController';
import { PromptAction, promptAction } from '@kit.ArkUI';
import router from '@ohos.router';

@Entry
@Component
struct EditCourse {
  @StorageLink('userRole') userRole: string = 'USER';
  @StorageLink('userId') userId: number = 0;
  @StorageLink('isLoggedIn') isLoggedIn: boolean = false;
  private courseController: CourseController = new CourseController('');
  
  // 从路由参数获取课程ID
  @State courseId: number = 0;
  @State course: Course | null = null;
  
  @State formData: UpdateCourseRequest = {
    title: '',
    description: '',
    tags: [],
    level: CourseLevel.BEGINNER
  };
  @State tagsInput: string = '';
  @State isLoading: boolean = false;
  @State isSaving: boolean = false;
  @State errorMessage: string = '';
  @State successMessage: string = '';

  aboutToAppear(): void {
    const token: string = this.getStoredToken();
    this.courseController.setToken(token);
    
    // 获取路由参数中的课程ID
    const params = router.getParams() as Record<string, number | string>;
    if (params && params.courseId) {
      this.courseId = params.courseId as number;
      this.fetchCourseDetail();
    } else {
      this.errorMessage = '缺少课程ID参数';
    }
    
    console.log('EditCourse页面加载，当前用户角色:', this.userRole, '用户ID:', this.userId);
  }

  build() {
    Column() {
      // 顶部导航栏
      this.buildHeader()

      if (this.isLoading) {
        this.buildLoadingView()
      } else if (this.errorMessage && !this.course) {
        this.buildErrorView()
      } else if (!this.course) {
        this.buildCourseNotFoundView()
      } else if (!this.canEdit()) {
        this.buildPermissionDeniedView()
      } else {
        // 表单内容
        Scroll() {
          Column({ space: 20 }) {
            // 错误信息显示
            if (this.errorMessage) {
              this.buildErrorMessage()
            }

            // 成功信息显示
            if (this.successMessage) {
              this.buildSuccessMessage()
            }

            // 课程标题
            this.buildTitleInput()

            // 课程描述
            this.buildDescriptionInput()

            // 标签输入
            this.buildTagsInput()

            // 难度等级选择
            this.buildLevelSelect()

            // 操作按钮
            this.buildActionButtons()
          }
          .padding(20)
        }
        .layoutWeight(1)
        .width('100%')
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#f5f5f5')
  }

  // 构建顶部导航栏
  @Builder
  buildHeader() {
    Row() {
      Button('返回')
        .fontSize(16)
        .fontColor('#007dff')
        .backgroundColor(Color.Transparent)
        .onClick(() => {
          router.back();
        })

      Text('编辑课程')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .layoutWeight(1)
        .textAlign(TextAlign.Center)

      // 占位符保持居中
      Text('')
        .width(60)
    }
    .width('100%')
    .height(56)
    .backgroundColor(Color.White)
    .padding({ left: 16, right: 16 })
    .justifyContent(FlexAlign.SpaceBetween)
    .alignItems(VerticalAlign.Center)
    .shadow({ radius: 2, color: '#1a000000', offsetX: 0, offsetY: 1 })
  }

  // 构建加载视图
  @Builder
  buildLoadingView() {
    Column() {
      Text('加载中...')
        .fontSize(16)
        .fontColor('#666')
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }

  // 构建错误视图
  @Builder
  buildErrorView() {
    Column() {
      Text(this.errorMessage)
        .fontSize(16)
        .fontColor(Color.Red)
        .textAlign(TextAlign.Center)
        .margin({ bottom: 20 })

      Button('重试')
        .fontSize(14)
        .fontColor(Color.White)
        .backgroundColor('#007dff')
        .onClick(() => {
          this.errorMessage = '';
          this.fetchCourseDetail();
        })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }

  // 构建课程不存在视图
  @Builder
  buildCourseNotFoundView() {
    Column() {
      Text('课程不存在')
        .fontSize(16)
        .fontColor('#666')
        .textAlign(TextAlign.Center)
        .margin({ bottom: 20 })

      Button('返回')
        .fontSize(14)
        .fontColor(Color.White)
        .backgroundColor('#007dff')
        .onClick(() => {
          router.back();
        })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }

  // 构建权限拒绝视图
  @Builder
  buildPermissionDeniedView() {
    Column() {
      Text('无权限编辑此课程')
        .fontSize(16)
        .fontColor('#666')
        .textAlign(TextAlign.Center)
        .margin({ bottom: 20 })

      Button('返回')
        .fontSize(14)
        .fontColor(Color.White)
        .backgroundColor('#007dff')
        .onClick(() => {
          router.back();
        })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }

  // 构建错误信息
  @Builder
  buildErrorMessage() {
    Text(this.errorMessage)
      .fontSize(14)
      .fontColor(Color.Red)
      .backgroundColor('#ffeeee')
      .padding(12)
      .borderRadius(8)
      .width('100%')
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
      .padding(12)
      .borderRadius(8)
      .width('100%')
      .onClick(() => {
        this.successMessage = '';
      })
  }

  // 构建标题输入框
  @Builder
  buildTitleInput() {
    Column({ space: 8 }) {
      Text('课程标题 *')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333')

      TextInput({ placeholder: '请输入课程标题', text: this.formData.title })
        .width('100%')
        .height(48)
        .backgroundColor(Color.White)
        .borderRadius(8)
        .padding(12)
        .fontSize(16)
        .maxLength(100)
        .onChange((value: string) => {
          this.formData.title = value;
        })
    }
    .width('100%')
    .alignItems(HorizontalAlign.Start)
  }

  // 构建描述输入框
  @Builder
  buildDescriptionInput() {
    Column({ space: 8 }) {
      Text('课程描述')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333')

      TextArea({ placeholder: '请输入课程描述...', text: this.formData.description })
        .width('100%')
        .height(120)
        .backgroundColor(Color.White)
        .borderRadius(8)
        .padding(12)
        .fontSize(16)
        .maxLength(500)
        .onChange((value: string) => {
          this.formData.description = value;
        })
    }
    .width('100%')
    .alignItems(HorizontalAlign.Start)
  }

  // 构建标签输入框
  @Builder
  buildTagsInput() {
    Column({ space: 8 }) {
      Text('标签 (用逗号分隔)')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333')

      TextInput({ placeholder: '例如: 数学, 基础, 入门', text: this.tagsInput })
        .width('100%')
        .height(48)
        .backgroundColor(Color.White)
        .borderRadius(8)
        .padding(12)
        .fontSize(16)
        .onChange((value: string) => {
          this.tagsInput = value;
          // 实时更新标签数组
          this.formData.tags = value.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        })

      // 显示当前标签
      if (this.formData.tags.length > 0) {
        Flex({ wrap: FlexWrap.Wrap }) {
          ForEach(this.formData.tags, (tag: string) => {
            Text(tag)
              .fontSize(12)
              .fontColor('#666')
              .backgroundColor('#eeeeee')
              .padding({ left: 8, right: 8, top: 4, bottom: 4 })
              .borderRadius(4)
              .margin({ right: 6, bottom: 6 })
          })
        }
        .width('100%')
        .margin({ top: 8 })
      }
    }
    .width('100%')
    .alignItems(HorizontalAlign.Start)
  }

  // 构建难度等级选择
  @Builder
  buildLevelSelect() {
    Column({ space: 8 }) {
      Text('难度等级')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333')

      Column({ space: 8 }) {
        Row() {
          Radio({ value: CourseLevel.BEGINNER, group: 'level' })
            .checked(this.formData.level === CourseLevel.BEGINNER)
            .onChange(() => {
              this.formData.level = CourseLevel.BEGINNER;
            })
          Text('初级')
            .fontSize(14)
            .margin({ left: 8 })
        }

        Row() {
          Radio({ value: CourseLevel.INTERMEDIATE, group: 'level' })
            .checked(this.formData.level === CourseLevel.INTERMEDIATE)
            .onChange(() => {
              this.formData.level = CourseLevel.INTERMEDIATE;
            })
          Text('中级')
            .fontSize(14)
            .margin({ left: 8 })
        }

        Row() {
          Radio({ value: CourseLevel.ADVANCED, group: 'level' })
            .checked(this.formData.level === CourseLevel.ADVANCED)
            .onChange(() => {
              this.formData.level = CourseLevel.ADVANCED;
            })
          Text('高级')
            .fontSize(14)
            .margin({ left: 8 })
        }
      }
      .width('100%')
      .padding(16)
      .backgroundColor(Color.White)
      .borderRadius(8)
      .alignItems(HorizontalAlign.Start)
    }
    .width('100%')
    .alignItems(HorizontalAlign.Start)
  }

  // 构建操作按钮
  @Builder
  buildActionButtons() {
    Row({ space: 12 }) {
      Button('取消')
        .width('48%')
        .height(48)
        .fontSize(16)
        .fontColor('#666')
        .backgroundColor(Color.White)
        .borderRadius(8)
        .onClick(() => {
          this.showCancelDialog();
        })

      Button(this.isSaving ? '保存中...' : '保存更改')
        .width('48%')
        .height(48)
        .fontSize(16)
        .fontColor(Color.White)
        .backgroundColor('#007dff')
        .borderRadius(8)
        .enabled(!this.isSaving)
        .onClick(() => {
          this.handleSubmit();
        })
    }
    .width('100%')
    .margin({ top: 20 })
  }

  // 获取课程详情
  private async fetchCourseDetail(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.courseController.getCourseDetail(this.courseId);

      if (result.success && result.data) {
        this.course = result.data;
        this.initializeFormData();
      } else {
        this.errorMessage = result.message || '获取课程详情失败';
      }
    } catch (error) {
      this.errorMessage = '获取课程详情时发生异常: ' + (error as Error).message;
    } finally {
      this.isLoading = false;
    }
  }

  // 初始化表单数据
  private initializeFormData(): void {
    if (!this.course) return;

    this.formData = {
      title: this.course.title,
      description: this.course.description,
      tags: this.course.tags,
      level: this.course.level
    };

    this.tagsInput = this.course.tags.join(', ');
  }

  // 检查编辑权限
  private canEdit(): boolean {
    if (!this.course) return false;
    
    // 管理员或课程作者可以编辑
    return this.userRole === 'ADMIN' || this.userId === this.course.authorId;
  }

  // 处理表单提交
  private async handleSubmit(): Promise<void> {
    if (!this.course) return;

    // 表单验证
    const validationResult: string | null = this.validateForm();
    if (validationResult) {
      this.errorMessage = validationResult;
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const result = await this.courseController.updateCourse(this.course.id, this.formData);

      if (result.success) {
        this.successMessage = '课程更新成功！';
        // 延迟跳转到课程详情页
        setTimeout(() => {
          if (this.course) {
            router.pushUrl({
              url: 'pages/CourseDetail',
              params: { courseId: this.course.id }
            });
          }
        }, 1500);
      } else {
        this.errorMessage = result.message || '更新课程失败';
      }
    } catch (error) {
      this.errorMessage = '更新课程时发生异常: ' + (error as Error).message;
    } finally {
      this.isSaving = false;
    }
  }

  // 表单验证
  private validateForm(): string | null {
    if (!this.formData.title || this.formData.title.trim().length === 0) {
      return '课程标题不能为空';
    }

    if (this.formData.title.trim().length < 2) {
      return '课程标题至少需要2个字符';
    }

    if (this.formData.title.trim().length > 100) {
      return '课程标题不能超过100个字符';
    }

    if (this.formData.description && this.formData.description.length > 500) {
      return '课程描述不能超过500个字符';
    }

    if (!this.formData.level) {
      return '请选择课程难度等级';
    }

    return null;
  }

  // 显示取消确认对话框
  private showCancelDialog(): void {
    promptAction.showDialog({
      title: '确认取消',
      message: '确定要取消编辑课程吗？未保存的更改将丢失。',
      buttons: [
        { text: '继续编辑', color: '#666' },
        { text: '确定取消', color: '#ff4d4f' }
      ]
    }).then((result: promptAction.ShowDialogSuccessResponse) => {
      if (result.index === 1) {
        router.back();
      }
    });
  }

  // 获取存储的token
  private getStoredToken(): string {
    return AppStorage.get<string>('userToken') || '';
  }
}