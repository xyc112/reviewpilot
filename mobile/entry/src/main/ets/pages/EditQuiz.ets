import router from '@ohos.router';
import { promptAction } from '@kit.ArkUI';
import { QuizController } from '../controller/QuizController';
import { Quiz, BackendQuizRequest, BackendQuestion, QuestionType, QuestionOption } from '../type/QuizTypes';

// 问题数据结构
interface QuestionData {
  id?: string;
  type: 'single' | 'multiple';
  question: string;
  options: string[];
  answer: number[];
}

@Entry
@Component
struct EditQuiz {
  @StorageLink('userRole') userRole: string = 'USER';
  @StorageLink('userId') userId: number = 0;
  @StorageLink('isLoggedIn') isLoggedIn: boolean = false;
  
  private quizController: QuizController = new QuizController('');
  
  // 路由参数
  @State courseId: number = 0;
  @State quizId: string = '';
  @State courseTitle: string = '';
  
  // 原始测验数据
  @State originalQuiz: Quiz | null = null;
  
  // 表单数据
  @State title: string = '';
  @State @Watch('onQuestionsChange') questions: QuestionData[] = [];
  
  // 状态
  @State isLoading: boolean = true;
  @State isSaving: boolean = false;
  @State errorMessage: string = '';
  @State successMessage: string = '';

  // 监听questions变化
  onQuestionsChange(): void {
    console.log('questions数组发生变化，题目数量:', this.questions.length);
    for (let i = 0; i < this.questions.length; i++) {
      console.log(`题目${i + 1}选项数量:`, this.questions[i].options.length);
    }
  }

  aboutToAppear(): void {
    // 获取路由参数
    const params = router.getParams() as Record<string, Object>;
    if (params) {
      this.courseId = (params.courseId as number) || 0;
      this.quizId = (params.quizId as string) || '';
      this.courseTitle = (params.courseTitle as string) || '';
    }
    
    // 检查权限
    if (this.userRole !== 'ADMIN') {
      promptAction.showToast({ message: '无权限访问此页面' });
      router.back();
      return;
    }
    
    // 获取token并设置
    const token: string = AppStorage.get<string>('userToken') || '';
    this.quizController.setToken(token);
    
    // 加载测验数据
    if (this.courseId > 0 && this.quizId) {
      this.loadQuiz();
    } else {
      this.errorMessage = '参数错误';
      this.isLoading = false;
    }
  }

  build() {
    Column() {
      // 顶部导航栏
      this.buildHeader()
      
      // 加载状态
      if (this.isLoading) {
        this.buildLoadingIndicator()
      } else {
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

            // 权限检查
            if (!this.canEdit()) {
              this.buildPermissionDenied()
            } else {
              // 基本信息
              this.buildBasicInfo()
              
              // 题目设置
              this.buildQuestionsSection()
              
              // 操作按钮
              this.buildActions()
            }
          }
          .padding(20)
          .width('100%')
        }
        .layoutWeight(1)
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#f5f5f5')
  }

  @Builder
  buildHeader() {
    Row() {
      Button('返回')
        .fontSize(16)
        .backgroundColor('#007dff')
        .onClick(() => {
          router.back();
        })
      
      Text('编辑测验')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .layoutWeight(1)
        .textAlign(TextAlign.Center)
        .margin({ left: 10 })
      
      Blank()
    }
    .width('100%')
    .height(56)
    .padding({ left: 16, right: 16 })
    .backgroundColor(Color.White)
    .shadow({ radius: 2, color: '#1a000000', offsetX: 0, offsetY: 1 })
  }

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
    .layoutWeight(1)
  }

  @Builder
  buildErrorMessage() {
    Text(this.errorMessage)
      .fontSize(14)
      .fontColor(Color.Red)
      .backgroundColor('#ffeeee')
      .padding(12)
      .borderRadius(8)
      .width('100%')
      .margin({ bottom: 16 })
      .onClick(() => {
        this.errorMessage = '';
      })
  }

  @Builder
  buildSuccessMessage() {
    Text(this.successMessage)
      .fontSize(14)
      .fontColor(Color.Green)
      .backgroundColor('#eeffee')
      .padding(12)
      .borderRadius(8)
      .width('100%')
      .margin({ bottom: 16 })
      .onClick(() => {
        this.successMessage = '';
      })
  }

  @Builder
  buildPermissionDenied() {
    Column() {
      Text('⚠️')
        .fontSize(48)
        .margin({ bottom: 16 })
      
      Text('无权限编辑此测验')
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .margin({ bottom: 8 })
      
      Text('只有测验创建者或管理员可以编辑测验')
        .fontSize(14)
        .fontColor('#666')
        .textAlign(TextAlign.Center)
    }
    .justifyContent(FlexAlign.Center)
    .width('100%')
    .layoutWeight(1)
  }

  @Builder
  buildBasicInfo() {
    Column({ space: 16 }) {
      Text('基本信息')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor('#333')
        .width('100%')
      
      // 测验标题
      Column({ space: 8 }) {
        Text('测验标题 *')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333')
        
        TextInput({ placeholder: '请输入测验标题', text: this.title })
          .width('100%')
          .height(44)
          .fontSize(14)
          .backgroundColor(Color.White)
          .borderRadius(8)
          .padding({ left: 12, right: 12 })
          .border({ width: 1, color: '#d9d9d9' })
          .onChange((value: string) => {
            this.title = value;
          })
      }
      .width('100%')
    }
    .width('100%')
    .padding(20)
    .backgroundColor(Color.White)
    .borderRadius(12)
    .shadow({ radius: 2, color: '#1a000000', offsetX: 0, offsetY: 1 })
  }

  @Builder
  buildQuestionsSection() {
    Column({ space: 16 }) {
      Row() {
        Text('题目设置')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333')
          .layoutWeight(1)
        
        Button('+ 添加题目')
          .fontSize(14)
          .backgroundColor('#52c41a')
          .onClick(() => {
            this.addQuestion();
          })
      }
      .width('100%')

      ForEach(this.questions, (question: QuestionData, qIndex: number) => {
        this.buildQuestionForm(question, qIndex)
      }, (question: QuestionData, qIndex: number) => `${qIndex}_${question.options.length}_${question.question.length}`)
    }
    .width('100%')
  }

  @Builder
  buildQuestionForm(question: QuestionData, qIndex: number) {
    Column({ space: 16 }) {
      // 题目标题栏
      Row() {
        Text(`题目 ${qIndex + 1}`)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333')
          .layoutWeight(1)
        
        if (this.questions.length > 1) {
          Button('删除题目')
            .fontSize(12)
            .backgroundColor('#ff4d4f')
            .onClick(() => {
              this.removeQuestion(qIndex);
            })
        }
      }
      .width('100%')

      // 题目类型
      Column({ space: 8 }) {
        Text('题目类型')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333')
        
        Row({ space: 16 }) {
          Row({ space: 8 }) {
            Radio({ value: 'single', group: 'questionType_' + qIndex })
              .checked(question.type === 'single')
              .onChange((isChecked: boolean) => {
                if (isChecked) {
                  this.updateQuestionType(qIndex, 'single');
                }
              })
            Text('单选题')
              .fontSize(14)
              .fontColor('#333')
          }
          
          Row({ space: 8 }) {
            Radio({ value: 'multiple', group: 'questionType_' + qIndex })
              .checked(question.type === 'multiple')
              .onChange((isChecked: boolean) => {
                if (isChecked) {
                  this.updateQuestionType(qIndex, 'multiple');
                }
              })
            Text('多选题')
              .fontSize(14)
              .fontColor('#333')
          }
        }
      }
      .width('100%')

      // 问题内容
      Column({ space: 8 }) {
        Text('问题内容 *')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333')
        
        TextArea({ 
          placeholder: '请输入问题内容',
          text: question.question
        })
          .width('100%')
          .height(80)
          .fontSize(14)
          .backgroundColor(Color.White)
          .borderRadius(8)
          .padding(12)
          .border({ width: 1, color: '#d9d9d9' })
          .onChange((value: string) => {
            this.updateQuestionText(qIndex, value);
          })
      }
      .width('100%')

      // 选项
      Column({ space: 12 }) {
        Row() {
          Text('选项 *')
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor('#333')
            .layoutWeight(1)
          
          Button('+ 添加选项')
            .fontSize(12)
            .backgroundColor('#1890ff')
            .onClick(() => {
              this.addOption(qIndex);
            })
        }
        .width('100%')

        ForEach(question.options || [], (option: string, oIndex: number) => {
          this.buildOptionInput(question, qIndex, oIndex)
        }, (option: string, oIndex: number) => `${qIndex}_${oIndex}_${option?.length || 0}`)
      }
      .width('100%')
    }
    .width('100%')
    .padding(20)
    .backgroundColor(Color.White)
    .borderRadius(12)
    .shadow({ radius: 2, color: '#1a000000', offsetX: 0, offsetY: 1 })
    .margin({ bottom: 16 })
  }

  @Builder
  buildOptionInput(question: QuestionData, qIndex: number, oIndex: number) {
    Row({ space: 12 }) {
      // 选项字母
      Text(String.fromCharCode(65 + oIndex))
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
        .fontColor('#666')
        .width(24)
        .textAlign(TextAlign.Center)
      
      // 选项输入框
      TextInput({ 
        placeholder: `选项 ${String.fromCharCode(65 + oIndex)}`,
        text: question.options?.[oIndex] || ''
      })
        .layoutWeight(1)
        .height(40)
        .fontSize(14)
        .backgroundColor(Color.White)
        .borderRadius(6)
        .padding({ left: 10, right: 10 })
        .border({ width: 1, color: '#d9d9d9' })
        .onChange((value: string) => {
          this.updateOptionText(qIndex, oIndex, value);
        })
      
      // 正确答案选择
      if (question.type === 'single') {
        Radio({ value: oIndex.toString(), group: 'answer_' + qIndex })
          .checked(question.answer.includes(oIndex))
          .onChange((isChecked: boolean) => {
            if (isChecked) {
              this.updateAnswer(qIndex, oIndex);
            }
          })
      } else {
        Checkbox({ name: 'answer_' + qIndex + '_' + oIndex })
          .select(question.answer.includes(oIndex))
          .onChange((isChecked: boolean) => {
            this.updateAnswer(qIndex, oIndex, isChecked);
          })
      }
      
      // 删除选项按钮
      if ((question.options?.length || 0) > 2) {
        Button('删除')
          .fontSize(12)
          .backgroundColor('#ff7875')
          .width(50)
          .height(40)
          .onClick(() => {
            this.removeOption(qIndex, oIndex);
          })
      }
    }
    .width('100%')
    .alignItems(VerticalAlign.Center)
  }

  @Builder
  buildActions() {
    Row({ space: 16 }) {
      Button('取消')
        .fontSize(16)
        .backgroundColor('#f5f5f5')
        .fontColor('#666')
        .layoutWeight(1)
        .height(44)
        .onClick(() => {
          router.back();
        })
      
      Button(this.isSaving ? '保存中...' : '保存更改')
        .fontSize(16)
        .backgroundColor('#007dff')
        .fontColor(Color.White)
        .layoutWeight(1)
        .height(44)
        .enabled(!this.isSaving)
        .onClick(() => {
          this.handleSubmit();
        })
    }
    .width('100%')
    .margin({ top: 20 })
  }

  // --- 逻辑方法 ---

  // 加载测验数据
  private async loadQuiz(): Promise<void> {
    try {
      console.log('开始加载测验数据，课程ID:', this.courseId, '测验ID:', this.quizId);
      const result = await this.quizController.getQuiz(this.courseId, this.quizId);

      if (result.success && result.data) {
        this.originalQuiz = result.data;
        this.title = result.data.title;
        
        // 转换问题数据格式
        this.questions = result.data.questions.map((q): QuestionData => {
          // 转换QuestionType到字符串
          let typeString: 'single' | 'multiple';
          if (q.type === QuestionType.SINGLE_CHOICE) {
            typeString = 'single';
          } else if (q.type === QuestionType.MULTIPLE_CHOICE) {
            typeString = 'multiple';
          } else {
            typeString = 'single'; // 默认为单选题
          }
          
          // 转换QuestionOption[]到string[]
          const optionsArray: string[] = q.options 
            ? q.options.map((opt: QuestionOption) => opt.text)
            : [];
          
          // 解析正确答案
          let answerArray: number[] = [];
          if (q.correctAnswer) {
            try {
              answerArray = JSON.parse(q.correctAnswer) as number[];
            } catch (e) {
              answerArray = [];
            }
          }
          
          return {
            id: q.id,
            type: typeString,
            question: q.question,
            options: optionsArray,
            answer: answerArray
          };
        });
        
        console.log('测验数据加载成功，题目数量:', this.questions.length);
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

  // 检查编辑权限
  private canEdit(): boolean {
    if (!this.originalQuiz) return false;
    
    // 管理员始终可以编辑
    if (this.userRole === 'ADMIN') return true;
    
    // 检查是否是测验创建者
    // 注意：这里需要根据实际的authorId字段类型进行比较
    return this.userId === this.originalQuiz.courseId; // 临时使用courseId，实际应该是authorId
  }

  // 添加题目
  private addQuestion(): void {
    const newQuestions: QuestionData[] = [...this.questions];
    newQuestions.push({
      type: 'single',
      question: '',
      options: ['', ''],
      answer: []
    });
    this.questions = newQuestions;
  }

  // 删除题目
  private removeQuestion(index: number): void {
    if (this.questions.length <= 1) return;
    const newQuestions: QuestionData[] = [...this.questions];
    newQuestions.splice(index, 1);
    this.questions = newQuestions;
  }

  // 更新题目类型
  private updateQuestionType(index: number, type: 'single' | 'multiple'): void {
    const newQuestions: QuestionData[] = [...this.questions];
    newQuestions[index].type = type;
    newQuestions[index].answer = []; // 清空答案
    this.questions = newQuestions;
  }

  // 更新问题文本
  private updateQuestionText(index: number, text: string): void {
    const newQuestions: QuestionData[] = [...this.questions];
    newQuestions[index].question = text;
    this.questions = newQuestions;
  }

  // 添加选项
  private addOption(qIndex: number): void {
    const newQuestions: QuestionData[] = [...this.questions];
    if (!newQuestions[qIndex].options) {
      newQuestions[qIndex].options = [];
    }
    newQuestions[qIndex].options.push('');
    this.questions = newQuestions;
  }

  // 删除选项
  private removeOption(qIndex: number, oIndex: number): void {
    if (!this.questions[qIndex]?.options || this.questions[qIndex].options.length <= 2) return;
    
    const newQuestions: QuestionData[] = [...this.questions];
    const question = newQuestions[qIndex];
    question.options.splice(oIndex, 1);
    
    // 更新答案索引
    question.answer = question.answer
      .filter(index => index !== oIndex)
      .map(index => index > oIndex ? index - 1 : index);
    
    this.questions = newQuestions;
  }

  // 更新选项文本
  private updateOptionText(qIndex: number, oIndex: number, text: string): void {
    const newQuestions: QuestionData[] = [...this.questions];
    if (!newQuestions[qIndex].options) {
      newQuestions[qIndex].options = [];
    }
    newQuestions[qIndex].options[oIndex] = text;
    this.questions = newQuestions;
  }

  // 更新答案
  private updateAnswer(qIndex: number, oIndex: number, isChecked?: boolean): void {
    const newQuestions: QuestionData[] = [...this.questions];
    const question = newQuestions[qIndex];
    
    if (!question.answer) {
      question.answer = [];
    }
    
    if (question.type === 'single') {
      // 单选题，只保留一个答案
      question.answer = [oIndex];
    } else {
      // 多选题，可以有多个答案
      if (isChecked !== undefined) {
        if (isChecked) {
          if (!question.answer.includes(oIndex)) {
            question.answer.push(oIndex);
            question.answer.sort();
          }
        } else {
          question.answer = question.answer.filter(i => i !== oIndex);
        }
      } else {
        // 切换选择状态
        if (question.answer.includes(oIndex)) {
          question.answer = question.answer.filter(i => i !== oIndex);
        } else {
          question.answer.push(oIndex);
          question.answer.sort();
        }
      }
    }
    
    this.questions = newQuestions;
  }

  // 提交表单
  private async handleSubmit(): Promise<void> {
    // 验证表单
    if (!this.title.trim()) {
      this.errorMessage = '请输入测验标题';
      return;
    }

    for (let i = 0; i < this.questions.length; i++) {
      const q = this.questions[i];
      if (!q.question.trim()) {
        this.errorMessage = `第${i + 1}题的问题内容不能为空`;
        return;
      }

      if (q.options.some(opt => !opt.trim())) {
        this.errorMessage = `第${i + 1}题的选项不能为空`;
        return;
      }

      if (q.answer.length === 0) {
        this.errorMessage = `第${i + 1}题必须选择正确答案`;
        return;
      }
    }

    this.isSaving = true;
    this.errorMessage = '';

    try {
      // 转换数据格式，匹配后端Quiz实体
      const questions: BackendQuestion[] = this.questions.map((q, qIndex): BackendQuestion => {
        return {
          id: q.id || `question_${qIndex}_${Date.now()}`, // 保留原有ID或生成唯一临时ID
          type: q.type, // single|multiple
          question: q.question.trim(),
          options: q.options.map(opt => opt.trim()), // 直接使用字符串数组
          answer: q.answer // 正确答案索引数组
        };
      });

      // 根据后端Quiz实体构造请求数据
      const quizData: BackendQuizRequest = {
        id: this.quizId, // 包含测验ID用于更新
        courseId: this.courseId, // 必须提供课程ID
        title: this.title.trim(),
        questions: questions
      };

      // 打印请求数据用于调试
      console.log('=== 更新测验调试信息 ===');
      console.log('courseId:', this.courseId, '类型:', typeof this.courseId);
      console.log('quizId:', this.quizId, '类型:', typeof this.quizId);
      console.log('更新测验请求数据:', JSON.stringify(quizData, null, 2));
      console.log('========================');

      const result = await this.quizController.updateQuiz(this.courseId, this.quizId, quizData);
      
      if (result.success) {
        this.successMessage = '测验更新成功';
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        this.errorMessage = result.message || '更新测验失败';
        console.error('更新测验失败:', result);
      }
    } catch (error) {
      this.errorMessage = '更新测验时发生异常: ' + (error as Error).message;
      console.error('更新测验异常:', error);
    } finally {
      this.isSaving = false;
    }
  }
}