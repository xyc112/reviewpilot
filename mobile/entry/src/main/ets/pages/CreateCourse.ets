// CreateCourse.ets
import { CourseLevel, CreateCourseRequest } from '../type/CourseTypes';
import { CourseController } from '../controller/CourseController';
import { PromptAction, promptAction } from '@kit.ArkUI';
import router from '@ohos.router';

@Entry
@Component
struct CreateCourse {
  @StorageLink('userRole') userRole: string = 'USER';
  @StorageLink('isLoggedIn') isLoggedIn: boolean = false;
  private courseController: CourseController = new CourseController('');
  
  @State formData: CreateCourseRequest = {
    title: '',
    description: '',
    tags: [],
    level: CourseLevel.BEGINNER
  };
  @State tagsInput: string = '';
  @State isLoading: boolean = false;
  @State errorMessage: string = '';
  @State successMessage: string = '';

  aboutToAppear(): void {
    const token: string = this.getStoredToken();
    this.courseController.setToken(token);
    
    console.log('CreateCourse页面加载，当前用户角色:', this.userRole);
    
    // 权限检查 - 只有管理员才能创建课程
    if (this.userRole !== 'ADMIN') {
      console.log('权限检查失败，用户不是管理员');
      promptAction.showToast({
        message: '无权限访问此页面',
        duration: 2000
      });
      setTimeout(() => {
        router.back();
      }, 1000);
    } else {
      console.log('权限检查通过，用户是管理员');
    }
  }

  build() {
    Column() {
      // 顶部导航栏
      this.buildHeader()

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

      Text('创建新课程')
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

      TextInput({ placeholder: '请输入课程标题' })
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

      TextArea({ placeholder: '请输入课程描述...' })
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

      TextInput({ placeholder: '例如: 数学, 基础, 入门' })
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
        Radio({ value: CourseLevel.BEGINNER, group: 'level' })
          .checked(this.formData.level === CourseLevel.BEGINNER)
          .onChange(() => {
            this.formData.level = CourseLevel.BEGINNER;
          })
        Text('初级')
          .fontSize(14)
          .margin({ left: 8 })

        Radio({ value: CourseLevel.INTERMEDIATE, group: 'level' })
          .checked(this.formData.level === CourseLevel.INTERMEDIATE)
          .onChange(() => {
            this.formData.level = CourseLevel.INTERMEDIATE;
          })
        Text('中级')
          .fontSize(14)
          .margin({ left: 8 })

        Radio({ value: CourseLevel.ADVANCED, group: 'level' })
          .checked(this.formData.level === CourseLevel.ADVANCED)
          .onChange(() => {
            this.formData.level = CourseLevel.ADVANCED;
          })
        Text('高级')
          .fontSize(14)
          .margin({ left: 8 })
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

      Button(this.isLoading ? '创建中...' : '创建课程')
        .width('48%')
        .height(48)
        .fontSize(16)
        .fontColor(Color.White)
        .backgroundColor('#007dff')
        .borderRadius(8)
        .enabled(!this.isLoading)
        .onClick(() => {
          this.handleSubmit();
        })
    }
    .width('100%')
    .margin({ top: 20 })
  }

  // 处理表单提交
  private async handleSubmit(): Promise<void> {
    // 表单验证
    const validationResult: string | null = this.validateForm();
    if (validationResult) {
      this.errorMessage = validationResult;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const result = await this.courseController.createCourse(this.formData);

      if (result.success) {
        this.successMessage = '课程创建成功！';
        // 延迟跳转回课程列表
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        this.errorMessage = result.message || '创建课程失败';
      }
    } catch (error) {
      this.errorMessage = '创建课程时发生异常: ' + (error as Error).message;
    } finally {
      this.isLoading = false;
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
      message: '确定要取消创建课程吗？未保存的内容将丢失。',
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