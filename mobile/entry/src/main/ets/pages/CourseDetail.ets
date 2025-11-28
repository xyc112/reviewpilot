// entry/src/main/ets/pages/CourseDetail.ets

import router from '@ohos.router';
import { promptAction } from '@kit.ArkUI';
import { Course, CourseDetail } from '../type/CourseTypes';
import { CourseController } from '../controller/CourseController';

@Entry
@Component
struct courseDetail {
  // 路由参数
  @State courseId: number = 0;
  @State courseTitle: string = '';

  // 控制器
  private courseController: CourseController = new CourseController('');

  // 状态变量
  @State courseDetail: CourseDetail | null = null;
  @State isLoading: boolean = false;



  // 用户角色状态
  @StorageLink('userRole') userRole: string = 'USER';
  @StorageLink('userId') userId: number = 0;
  @StorageLink('isLoggedIn') isLoggedIn: boolean = false;

  aboutToAppear() {
    // 1. 获取 Token
    const token = AppStorage.get<string>('userToken') || '';
    this.courseController.setToken(token);

    // 2. 获取路由参数
    const params = router.getParams() as Record<string, Object>;
    if (params) {
      this.courseId = params['courseId'] as number;
      this.courseTitle = params['courseTitle'] as string;

      // 3. 加载数据
      this.loadCourseDetail();
    }
  }

  build() {
    Stack() {
      // 底层页面内容
      Column() {
        // 1. 顶部导航栏
        this.buildNavBar()

        if (this.isLoading && !this.courseDetail) {
          this.buildLoading()
        } else {
          Scroll() {
            Column({ space: 20 }) {
              // 2. 课程详情卡片
              if (this.courseDetail) {
                this.buildCourseInfoCard()
              }

              // 3. 课程导航区域
              this.buildCourseNavigation()
            }
            .padding(16)
            .width('100%')
          }
          .layoutWeight(1)
        }
      }
      .width('100%')
      .height('100%')
      .backgroundColor('#f5f5f5')


    }
  }

  // --- UI 构建方法 ---

  @Builder
  buildNavBar() {
    Row() {
      Button({ type: ButtonType.Normal }) {
        Text('<')
      }
      .width(40)
      .height(40)
      .backgroundColor(Color.Transparent)
      .onClick(() => {
        router.back();
      })

      Text(this.courseTitle)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .layoutWeight(1)
        .margin({ left: 10 })
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
    }
    .width('100%')
    .height(56)
    .padding({ left: 10, right: 10 })
    .backgroundColor(Color.White)
  }

  @Builder
  buildLoading() {
    Column() {
      LoadingProgress().width(50).height(50)
      Text('加载中...').margin({ top: 10 }).fontColor('#999')
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }

  @Builder
  buildCourseInfoCard() {
    Column({ space: 10 }) {
      Row() {
        Text(this.courseDetail?.title)
          .fontSize(22)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)

        Text(this.courseDetail?.level)
          .fontSize(12)
          .fontColor(Color.White)
          .backgroundColor('#007dff')
          .padding({ left: 8, right: 8, top: 4, bottom: 4 })
          .borderRadius(10)
      }

      // 课程描述
      Column({ space: 8 }) {
        Text('课程描述')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333')
          .width('100%')

        Text(this.courseDetail?.description || '暂无描述')
          .fontSize(14)
          .fontColor('#666')
          .lineHeight(20)
      }
      .width('100%')
      .margin({ top: 10 })

      // 课程标签
      if (this.courseDetail?.tags && this.courseDetail.tags.length > 0) {
        Column({ space: 8 }) {
          Text('课程标签')
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333')
            .width('100%')

          Flex({ wrap: FlexWrap.Wrap }) {
            ForEach(this.courseDetail.tags, (tag: string) => {
              Text(tag)
                .fontSize(12)
                .fontColor('#666')
                .backgroundColor('#f0f0f0')
                .padding({ left: 8, right: 8, top: 4, bottom: 4 })
                .borderRadius(4)
                .margin({ right: 8, bottom: 8 })
            })
          }
        }
        .width('100%')
        .margin({ top: 10 })
      }

      Text(`创建时间: ${this.formatDate(this.courseDetail?.createdAt)}`)
        .fontSize(12)
        .fontColor('#999')
        .margin({ top: 5 })

      // 管理员操作按钮
      if (this.userRole === 'ADMIN' || (this.courseDetail && this.userId === this.courseDetail.authorId)) {
        Row({ space: 10 }) {
          Button('编辑课程')
            .backgroundColor('#1890ff')
            .fontColor(Color.White)
            .layoutWeight(1)
            .onClick(() => {
              this.editCourse();
            })

          Button('删除课程')
            .backgroundColor('#ff4d4f')
            .fontColor(Color.White)
            .layoutWeight(1)
            .onClick(() => {
              this.deleteCourse();
            })
        }
        .width('100%')
        .margin({ top: 15 })
      }
    }
    .width('100%')
    .padding(20)
    .backgroundColor(Color.White)
    .borderRadius(16)
    .shadow({ radius: 5, color: '#1a000000' })
  }

  @Builder
  buildCourseNavigation() {
    Column({ space: 16 }) {
      Text('课程功能')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor('#333')
        .width('100%')
        .margin({ top: 10 })

      Row({ space: 12 }) {
        // 知识图谱
        Column({ space: 8 }) {
          Text('📊')
            .fontSize(24)
            .margin({ bottom: 4 })
          
          Text('知识图谱')
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor('#333')
          
          Text('可视化课程知识点关系')
            .fontSize(12)
            .fontColor('#666')
            .maxLines(2)
            .textAlign(TextAlign.Center)
        }
        .width('30%')
        .padding(16)
        .backgroundColor(Color.White)
        .borderRadius(12)
        .shadow({ radius: 4, color: '#1a000000' })
        .onClick(() => {
          router.pushUrl({
            url: 'pages/GraphView',
            params: { 
              courseId: this.courseId,
              courseTitle: this.courseTitle 
            }
          }).catch((error: Error) => {
            console.error('跳转到知识图谱失败:', error);
            promptAction.showToast({ message: '页面跳转失败' });
          });
        })

        // 课程笔记
        Column({ space: 8 }) {
          Text('📝')
            .fontSize(24)
            .margin({ bottom: 4 })
          
          Text('课程笔记')
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor('#333')
          
          Text('查看和创建学习笔记')
            .fontSize(12)
            .fontColor('#666')
            .maxLines(2)
            .textAlign(TextAlign.Center)
        }
        .width('30%')
        .padding(16)
        .backgroundColor(Color.White)
        .borderRadius(12)
        .shadow({ radius: 4, color: '#1a000000' })
        .onClick(() => {
          router.pushUrl({
            url: 'pages/NoteList',
            params: { 
              courseId: this.courseId,
              courseTitle: this.courseTitle 
            }
          }).catch((error: Error) => {
            console.error('跳转到笔记列表失败:', error);
            promptAction.showToast({ message: '页面跳转失败' });
          });
        })

        // 课程测验
        Column({ space: 8 }) {
          Text('🧩')
            .fontSize(24)
            .margin({ bottom: 4 })
          
          Text('课程测验')
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor('#333')
          
          Text('测试学习成果')
            .fontSize(12)
            .fontColor('#666')
            .maxLines(2)
            .textAlign(TextAlign.Center)
        }
        .width('30%')
        .padding(16)
        .backgroundColor(Color.White)
        .borderRadius(12)
        .shadow({ radius: 4, color: '#1a000000' })
        .onClick(() => {
          router.pushUrl({
            url: 'pages/QuizList',
            params: { 
              courseId: this.courseId,
              courseTitle: this.courseTitle 
            }
          }).catch((error: Error) => {
            console.error('跳转到课程测验失败:', error);
            promptAction.showToast({ message: '页面跳转失败' });
          });
        })
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceBetween)
    }
    .width('100%')
  }



  // --- 逻辑方法 ---

  // 加载课程详情
  async loadCourseDetail() {
    this.isLoading = true;
    const result = await this.courseController.getCourseDetail(this.courseId);
    if (result.success && result.data) {
      this.courseDetail = result.data;
    } else {
      promptAction.showToast({ message: result.message || '加载详情失败' });
    }
    this.isLoading = false;
  }



  // 编辑课程
  private editCourse(): void {
    // 跳转到编辑页面，传递课程ID
    try {
      router.pushUrl({ 
        url: 'pages/EditCourse',
        params: { 
          courseId: this.courseId
        }
      });
    } catch (error) {
      console.error('跳转到编辑页面失败:', error);
      promptAction.showToast({ message: '页面跳转失败' });
    }
  }

  // 删除课程
  private async deleteCourse(): Promise<void> {
    try {
      // 显示确认对话框
      const result = await promptAction.showDialog({
        title: '删除课程',
        message: `确定要删除课程"${this.courseDetail?.title}"吗？此操作不可恢复。`,
        buttons: [
          { text: '取消', color: '#666' },
          { text: '删除', color: '#ff0000' }
        ]
      });

      if (result.index === 1) {
        // 用户确认删除
        const deleteResult = await this.courseController.deleteCourse(this.courseId);
        
        if (deleteResult.success) {
          promptAction.showToast({ message: '课程删除成功' });
          // 返回上一页
          router.back();
        } else {
          promptAction.showToast({ message: deleteResult.message || '删除失败' });
        }
      }
    } catch (error) {
      console.error('删除课程失败:', error);
      promptAction.showToast({ message: '删除课程时发生异常' });
    }
  }

  // 工具：格式化日期
  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    } catch (e) {
      return dateStr;
    }
  }
}