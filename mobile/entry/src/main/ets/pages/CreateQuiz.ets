import router from '@ohos.router';
import { promptAction } from '@kit.ArkUI';
import { QuizController } from '../controller/QuizController';
import { Question, CreateQuizRequest, QuestionType, QuestionOption, BackendQuizRequest, BackendQuestion } from '../type/QuizTypes';

// 问题数据结构
interface QuestionData {
  type: 'single' | 'multiple';
  question: string;
  options: string[];
  answer: number[];
}

@Entry
@Component
struct CreateQuiz {
  @StorageLink('userRole') userRole: string = 'USER';
  @StorageLink('isLoggedIn') isLoggedIn: boolean = false;
  
  private quizController: QuizController = new QuizController('');
  
  // 路由参数
  @State courseId: number = 0;
  @State courseTitle: string = '';
  
  // 表单数据
  @State title: string = '';
  @State description: string = '';
  @State @Watch('onQuestionsChange') questions: QuestionData[] = [
    {
      type: 'single',
      question: '',
      options: ['选项A', '选项B'],
      answer: []
    }
  ];
  
  // 状态
  @State isLoading: boolean = false;
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
  }

  build() {
    Column() {
      // 顶部导航栏
      this.buildHeader()
      
      // 错误信息显示
      if (this.errorMessage) {
        this.buildErrorMessage()
      }

      // 成功信息显示
      if (this.successMessage) {
        this.buildSuccessMessage()
      }

      Scroll() {
        Column({ space: 20 }) {
          // 基本信息
          this.buildBasicInfo()
          
          // 题目设置
          this.buildQuestionsSection()
          
          // 操作按钮
          this.buildActions()
        }
        .padding(20)
        .width('100%')
      }
      .layoutWeight(1)
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
      
      Text('创建新测验')
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
        
        TextInput({ placeholder: '请输入测验标题' })
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
      
      // 测验描述
      Column({ space: 8 }) {
        Text('测验描述')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333')
        
        TextArea({ placeholder: '请输入测验描述（可选）' })
          .width('100%')
          .height(80)
          .fontSize(14)
          .backgroundColor(Color.White)
          .borderRadius(8)
          .padding(12)
          .border({ width: 1, color: '#d9d9d9' })
          .onChange((value: string) => {
            this.description = value;
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

        ForEach(question.options, (option: string, oIndex: number) => {
          this.buildOptionInput(question, qIndex, oIndex)
        }, (option: string, oIndex: number) => `${qIndex}_${oIndex}_${option.length}`)
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
        text: question.options[oIndex]
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
      if (question.options.length > 2) {
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
      
      Button(this.isLoading ? '创建中...' : '创建测验')
        .fontSize(16)
        .backgroundColor('#007dff')
        .fontColor(Color.White)
        .layoutWeight(1)
        .height(44)
        .enabled(!this.isLoading)
        .onClick(() => {
          this.handleSubmit();
        })
    }
    .width('100%')
    .margin({ top: 20 })
  }

  // --- 逻辑方法 ---

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
    console.log('添加选项前，题目索引:', qIndex, '选项数量:', this.questions[qIndex].options.length);
    const newQuestions: QuestionData[] = [...this.questions];
    newQuestions[qIndex].options.push('');
    this.questions = newQuestions;
    console.log('添加选项后，题目数量:', this.questions.length, '选项数量:', this.questions[qIndex].options.length);
  }

  // 删除选项
  private removeOption(qIndex: number, oIndex: number): void {
    if (this.questions[qIndex].options.length <= 2) return;
    
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
    newQuestions[qIndex].options[oIndex] = text;
    this.questions = newQuestions;
  }

  // 更新答案
  private updateAnswer(qIndex: number, oIndex: number, isChecked?: boolean): void {
    const newQuestions: QuestionData[] = [...this.questions];
    const question = newQuestions[qIndex];
    
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

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // 转换数据格式，匹配后端Quiz实体
      const questions: BackendQuestion[] = this.questions.map((q, qIndex): BackendQuestion => {
        return {
          id: `question_${qIndex}`, // 临时ID，后端会生成
          type: q.type, // single|multiple
          question: q.question.trim(),
          options: q.options.map(opt => opt.trim()), // 直接使用字符串数组
          answer: q.answer // 正确答案索引数组
        };
      });

      // 根据后端Quiz实体构造请求数据
      const quizData: BackendQuizRequest = {
        courseId: this.courseId, // 必须提供课程ID
        title: this.title.trim(),
        questions: questions
      };

      // 验证基本数据
      console.log('=== 数据验证 ===');
      console.log('标题长度:', this.title.trim().length);
      console.log('问题数量:', questions.length);
      console.log('courseId:', this.courseId);
      
      // 检查是否有空的问题或选项
      let hasEmptyQuestion = false;
      let hasEmptyOption = false;
      let hasNoCorrectAnswer = false;
      
      questions.forEach((q, qIndex) => {
        if (!q.question || q.question.trim().length === 0) {
          hasEmptyQuestion = true;
          console.log(`问题${qIndex + 1}内容为空`);
        }
        
        if (!q.options || q.options.length < 2) {
          hasEmptyOption = true;
          console.log(`问题${qIndex + 1}选项不足`);
        } else {
          // 检查选项内容
          q.options.forEach((opt, oIndex) => {
            if (!opt || opt.trim().length === 0) {
              hasEmptyOption = true;
              console.log(`问题${qIndex + 1}选项${oIndex + 1}内容为空`);
            }
          });
          
          // 检查是否有正确答案
          if (!q.answer || q.answer.length === 0) {
            hasNoCorrectAnswer = true;
            console.log(`问题${qIndex + 1}没有正确答案`);
          }
        }
      });
      
      if (hasEmptyQuestion || hasEmptyOption || hasNoCorrectAnswer) {
        this.errorMessage = hasEmptyQuestion ? '问题内容不能为空' : 
                           hasEmptyOption ? '选项内容不能为空' : 
                           '每个问题必须选择正确答案';
        this.isLoading = false;
        return;
      }
      console.log('================');

      // 打印请求数据用于调试
      console.log('创建测验请求数据:', JSON.stringify(quizData, null, 2));
      console.log('courseId:', this.courseId);

      const result = await this.quizController.createQuiz(this.courseId, quizData);
      
      if (result.success) {
        this.successMessage = '测验创建成功';
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        this.errorMessage = result.message || '创建测验失败';
        console.error('创建测验失败:', result);
      }
    } catch (error) {
      this.errorMessage = '创建测验时发生异常: ' + (error as Error).message;
      console.error('创建测验异常:', error);
    } finally {
      this.isLoading = false;
    }
  }
}