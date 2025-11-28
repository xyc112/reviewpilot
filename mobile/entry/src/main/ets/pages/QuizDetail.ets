import { Quiz, QuizAttempt, Question, AttemptResult, SubmitAttemptRequest, AnswerRequestItem, QuizAnswer, QuestionOption } from '../type/QuizTypes';
import { QuizController } from '../controller/QuizController';
import { PromptAction, promptAction } from '@kit.ArkUI';
import router from '@ohos.router';

@Entry
@Component
struct QuizDetail {
  @StorageLink('username') username: string = '未登录';
  @StorageLink('userRole') userRole: string = 'USER';
  @StorageLink('isLoggedIn') isLoggedIn: boolean = false;
  
  private quizController: QuizController = new QuizController('');
  @State quiz: Quiz | null = null;
  @State isLoading: boolean = false;
  @State errorMessage: string = '';
  @State answers: Map<string, number[]> = new Map();
  @State submitting: boolean = false;
  @State attempt: AttemptResult | null = null;
  
  private courseId: number = 0;
  private quizId: string = '';

  aboutToAppear(): void {
    // 从路由参数获取课程ID和测验ID
    const params = router.getParams() as Record<string, Object>;
    if (params) {
      this.courseId = (params.courseId as number) || 0;
      this.quizId = (params.quizId as string) || '';
    }
    
    // 获取token并设置
    const token: string = AppStorage.get<string>('userToken') || '';
    console.log('QuizDetail页面加载，课程ID:', this.courseId, '测验ID:', this.quizId, 'token:', token ? '有效' : '无效');
    this.quizController.setToken(token);
    
    if (this.courseId > 0 && this.quizId) {
      this.fetchQuiz();
    } else {
      this.errorMessage = '课程ID或测验ID无效';
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

      // 测验内容
      if (this.quiz && !this.attempt) {
        this.buildQuizContent()
      }

      // 结果显示
      if (this.attempt && this.quiz) {
        this.buildQuizResult()
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
        Text(this.quiz?.title || '测验详情')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
        
        if (this.quiz) {
          Text(`共 ${this.quiz.questions.length} 题`)
            .fontSize(14)
            .fontColor('#666')
            .margin({ top: 4 })
        }
      }
      .layoutWeight(1)
      .alignItems(HorizontalAlign.Center)
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

  // 构建测验内容
  @Builder
  buildQuizContent() {
    Scroll() {
      Column() {
        ForEach(this.quiz!.questions, (question: Question, index: number) => {
          this.buildQuestionCard(question, index)
        }, (question: Question) => question.id)

        // 提交按钮区域
        this.buildSubmitButtons()
      }
      .width('100%')
    }
    .layoutWeight(1)
    .width('100%')
  }

  // 构建问题卡片
  @Builder
  buildQuestionCard(question: Question, index: number) {
    Column() {
      Row() {
        Text(`题目 ${index + 1}: ${question.question}`)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .layoutWeight(1)
        
        if (question.type === 'MULTIPLE_CHOICE') {
          Text('[多选]')
            .fontSize(12)
            .fontColor('#ff6600')
            .backgroundColor('#fff2e8')
            .padding({ left: 6, right: 6, top: 2, bottom: 2 })
            .borderRadius(4)
        }
      }
      .width('100%')
      .margin({ bottom: 12 })

      // 选项列表
      Column() {
        ForEach(this.getQuestionOptions(question), (option: string, optIndex: number) => {
          this.buildOptionItem(question, option, optIndex)
        }, (option: string, index: number) => `${question.id}_${index}`)
      }
      .width('100%')
    }
    .padding(16)
    .backgroundColor(Color.White)
    .borderRadius(12)
    .shadow({ radius: 2, color: '#1a000000', offsetX: 0, offsetY: 1 })
    .margin({ bottom: 16 })
  }

  // 构建选项项
  @Builder
  buildOptionItem(question: Question, option: string, optIndex: number) {
    Row() {
      // 选项指示器
      Stack() {
        Circle({ width: 20, height: 20 })
          .stroke(this.isOptionSelected(question.id, optIndex) ? '#007dff' : '#ccc')
          .fill(Color.White)
          .strokeWidth(2)
        
        if (this.isOptionSelected(question.id, optIndex)) {
          Circle({ width: 10, height: 10 })
            .fill('#007dff')
        }
      }
      .width(20)
      .height(20)

      // 选项标签
      Text(`${String.fromCharCode(65 + optIndex)}.`)
        .fontSize(14)
        .fontColor('#666')
        .margin({ left: 8 })

      // 选项内容
      Text(option)
        .fontSize(14)
        .fontColor('#333')
        .layoutWeight(1)
        .margin({ left: 4 })
    }
    .width('100%')
    .padding(12)
    .backgroundColor(this.isOptionSelected(question.id, optIndex) ? '#e6f7ff' : Color.White)
    .borderRadius(8)
    .border({
      width: 1,
      color: this.isOptionSelected(question.id, optIndex) ? '#007dff' : '#e8e8e8'
    })
    .margin({ bottom: 8 })
    .onClick(() => {
      this.handleOptionSelect(question.id, optIndex, question.type);
    })
  }

  // 构建提交按钮区域
  @Builder
  buildSubmitButtons() {
    Column() {
      Button(this.submitting ? '提交中...' : '提交答案')
        .width('100%')
        .height(44)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .backgroundColor(this.submitting || this.answers.size === 0 ? '#ccc' : '#52c41a')
        .fontColor(Color.White)
        .borderRadius(8)
        .margin({ bottom: 12 })
        .enabled(!this.submitting && this.answers.size > 0)
        .onClick(() => {
          this.handleSubmit();
        })

      Button('返回测验列表')
        .width('100%')
        .height(44)
        .fontSize(16)
        .backgroundColor('#f0f0f0')
        .fontColor('#666')
        .borderRadius(8)
        .onClick(() => {
          router.pushUrl({ url: 'pages/QuizList', params: { courseId: this.courseId } });
        })
    }
    .width('100%')
    .padding({ top: 20, bottom: 20 })
  }

  // 构建测验结果
  @Builder
  buildQuizResult() {
    Scroll() {
      Column() {
        // 结果摘要
        this.buildResultSummary()

        // 只有当有详细答案信息时才显示题目详情
        if (this.attempt && this.attempt.answers && this.attempt.answers.length > 0) {
          this.buildResultDetails()
        }

        // 操作按钮
        this.buildResultButtons()
      }
      .width('100%')
    }
    .layoutWeight(1)
    .width('100%')
  }

  // 构建结果摘要
  @Builder
  buildResultSummary() {
    Column() {
      Text('测验结果')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 16 })

      Row() {
        Text(this.attempt!.score.toString())
          .fontSize(36)
          .fontWeight(FontWeight.Bold)
          .fontColor('#52c41a')
        
        Text(` / ${this.attempt!.totalPoints}`)
          .fontSize(24)
          .fontColor('#666')
          .margin({ left: 4 })
      }
      .justifyContent(FlexAlign.Center)
      .margin({ bottom: 12 })

      Text(`得分率: ${Math.round((this.attempt!.score / this.attempt!.totalPoints) * 100)}%`)
        .fontSize(16)
        .fontColor('#666')
    }
    .padding(20)
    .backgroundColor(Color.White)
    .borderRadius(12)
    .shadow({ radius: 2, color: '#1a000000', offsetX: 0, offsetY: 1 })
    .margin({ bottom: 20 })
  }

  // 构建结果详情
  @Builder
  buildResultDetails() {
    Column() {
      Text('题目详情')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 16 })

      ForEach(this.quiz!.questions, (question: Question, index: number) => {
        this.buildQuestionResult(question, index)
      }, (question: Question) => question.id)
    }
    .width('100%')
  }

  // 构建问题结果
  @Builder
  buildQuestionResult(question: Question, index: number) {
    Column() {
      Row() {
        Text(`题目 ${index + 1}: ${question.question}`)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .layoutWeight(1)
        
        Text(this.isQuestionCorrect(question.id) ? '✓ 正确' : '✗ 错误')
          .fontSize(12)
          .fontColor(this.isQuestionCorrect(question.id) ? '#52c41a' : '#ff4d4f')
          .backgroundColor(this.isQuestionCorrect(question.id) ? '#f6ffed' : '#fff2f0')
          .padding({ left: 8, right: 8, top: 2, bottom: 2 })
          .borderRadius(10)
      }
      .width('100%')
      .margin({ bottom: 12 })

      // 选项显示
      Column() {
        ForEach(this.getQuestionOptions(question), (option: string, optIndex: number) => {
          this.buildResultOptionItem(question, option, optIndex)
        }, (option: string, index: number) => `${question.id}_${index}`)
      }
      .width('100%')
      .margin({ bottom: 12 })

      if (this.getQuestionAnswer(question.id)) {
        Row() {
          Text(this.isQuestionCorrect(question.id) ? '✓ 正确' : '✗ 错误')
            .fontSize(14)
            .fontColor(this.isQuestionCorrect(question.id) ? '#52c41a' : '#ff4d4f')
          
          Text(`得分: ${this.getQuestionAnswer(question.id)?.points || 0}`)
            .fontSize(14)
            .fontColor('#666')
            .margin({ left: 16 })
        }
        .width('100%')
      }
    }
    .padding(16)
    .backgroundColor(Color.White)
    .borderRadius(12)
    .shadow({ radius: 2, color: '#1a000000', offsetX: 0, offsetY: 1 })
    .margin({ bottom: 16 })
  }

  // 构建结果选项项
  @Builder
  buildResultOptionItem(question: Question, option: string, optIndex: number) {
    Row() {
      Text(`${String.fromCharCode(65 + optIndex)}.`)
        .fontSize(14)
        .fontColor('#666')

      Text(option)
        .fontSize(14)
        .fontColor(this.getResultOptionTextColor(question.id, optIndex))
        .layoutWeight(1)
        .margin({ left: 4 })

      if (this.getResultOptionStatusText(question.id, optIndex)) {
        Text(this.getResultOptionStatusText(question.id, optIndex))
          .fontSize(12)
          .fontColor(this.getResultOptionTextColor(question.id, optIndex))
      }
    }
    .width('100%')
    .padding(12)
    .backgroundColor(this.getResultOptionBgColor(question.id, optIndex))
    .borderRadius(8)
    .border({
      width: 1,
      color: this.getResultOptionBorderColor(question.id, optIndex)
    })
    .margin({ bottom: 8 })
  }

  // 构建结果按钮
  @Builder
  buildResultButtons() {
    Column() {
      Button('重新答题')
        .width('100%')
        .height(44)
        .fontSize(16)
        .backgroundColor('#1890ff')
        .fontColor(Color.White)
        .borderRadius(8)
        .margin({ bottom: 12 })
        .onClick(() => {
          this.handleReset();
        })

      Button('返回测验列表')
        .width('100%')
        .height(44)
        .fontSize(16)
        .backgroundColor('#f0f0f0')
        .fontColor('#666')
        .borderRadius(8)
        .onClick(() => {
          router.pushUrl({ url: 'pages/QuizList', params: { courseId: this.courseId } });
        })
    }
    .width('100%')
    .padding({ top: 20, bottom: 20 })
  }

  // 获取测验详情
  private async fetchQuiz(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('开始获取测验详情，课程ID:', this.courseId, '测验ID:', this.quizId);
      const result = await this.quizController.getQuiz(this.courseId, this.quizId);

      if (result.success && result.data) {
        this.quiz = result.data;
        console.log('测验详情获取成功，题目数量:', result.data.questions.length);
      } else {
        this.errorMessage = result.message || '获取测验失败';
        console.error('测验详情获取失败:', result.message);
      }
    } catch (error) {
      this.errorMessage = '获取测验时发生异常: ' + (error as Error).message;
      console.error('测验详情获取异常:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // 处理选项选择
  private handleOptionSelect(questionId: string, optionIndex: number, questionType: string): void {
    const currentAnswers = this.answers.get(questionId) || [];

    if (questionType === 'SINGLE_CHOICE') {
      // 单选题，直接替换答案
      this.answers.set(questionId, [optionIndex]);
    } else {
      // 多选题，切换选项的选中状态
      let newAnswers: number[];
      if (currentAnswers.includes(optionIndex)) {
        // 如果已经选中，则取消选中
        newAnswers = currentAnswers.filter(idx => idx !== optionIndex);
      } else {
        // 否则添加到选中项中
        newAnswers = [...currentAnswers, optionIndex].sort((a, b) => a - b);
      }

      this.answers.set(questionId, newAnswers);
    }

    // 触发UI更新
    this.answers = new Map(this.answers);
  }

  // 处理提交
  private async handleSubmit(): Promise<void> {
    if (!this.quiz) return;

    this.submitting = true;

    try {
      // 构造提交数据
      const answerEntries: Array<[string, number[]]> = Array.from(this.answers.entries());
      const answerItems: AnswerRequestItem[] = answerEntries.map((entry: [string, number[]]) => {
        const questionId: string = entry[0];
        const answer: number[] = entry[1];
        const answerStrings: string[] = answer.map(idx => idx.toString());
        const answerItem: AnswerRequestItem = {
          questionId: questionId,
          answer: answerStrings
        };
        return answerItem;
      });
      const submitData: SubmitAttemptRequest = {
        answers: answerItems
      };

      console.log('提交测验数据:', JSON.stringify(submitData));
      const response = await this.quizController.submitAttempt(this.courseId, this.quiz.id, submitData);
      
      if (response.success && response.data) {
        this.attempt = response.data;
        console.log('测验提交成功，得分:', response.data.score);
        console.log('attempt对象结构:', JSON.stringify(this.attempt));
        console.log('answers字段:', this.attempt.answers);
      } else {
        this.errorMessage = '提交测验失败: ' + (response.message || '未知错误');
        console.error('测验提交失败:', response.message);
      }
    } catch (error) {
      this.errorMessage = '提交测验时发生异常: ' + (error as Error).message;
      console.error('测验提交异常:', error);
    } finally {
      this.submitting = false;
    }
  }

  // 处理重置
  private handleReset(): void {
    this.answers.clear();
    this.attempt = null;
    this.answers = new Map(this.answers);
  }

  // 检查选项是否被选中
  private isOptionSelected(questionId: string, optIndex: number): boolean {
    const questionAnswers = this.answers.get(questionId) || [];
    return questionAnswers.includes(optIndex);
  }

  // 获取问题答案
  private getQuestionAnswer(questionId: string): QuizAnswer | null {
    if (!this.attempt) {
      console.log('getQuestionAnswer: attempt为空');
      return null;
    }
    if (!this.attempt.answers) {
      console.log('getQuestionAnswer: attempt.answers为空, attempt:', JSON.stringify(this.attempt));
      return null;
    }
    console.log('getQuestionAnswer: 查找问题ID', questionId, '在answers中');
    const answer = this.attempt.answers.find(a => a.questionId === questionId) || null;
    console.log('getQuestionAnswer: 找到的答案:', answer);
    return answer;
  }

  // 检查问题是否正确
  private isQuestionCorrect(questionId: string): boolean {
    const answer = this.getQuestionAnswer(questionId);
    return answer?.isCorrect || false;
  }

  // 获取结果选项背景色
  private getResultOptionBgColor(questionId: string, optIndex: number): string {
    const userAnswer = this.answers.get(questionId) || [];
    const isSelected = userAnswer.includes(optIndex);
    const isCorrect = this.isQuestionCorrect(questionId);
    const correctAnswer = this.getCorrectAnswerIndices(questionId);
    const isCorrectOption = correctAnswer.includes(optIndex);

    if (isSelected && isCorrectOption) {
      return '#f6ffed';
    } else if (isSelected && !isCorrectOption) {
      return '#fff2f0';
    } else if (!isSelected && isCorrectOption) {
      return '#f6ffed';
    }
    return Color.White.toString();
  }

  // 获取结果选项文本颜色
  private getResultOptionTextColor(questionId: string, optIndex: number): string {
    const userAnswer = this.answers.get(questionId) || [];
    const isSelected = userAnswer.includes(optIndex);
    const correctAnswer = this.getCorrectAnswerIndices(questionId);
    const isCorrectOption = correctAnswer.includes(optIndex);

    if (isSelected && isCorrectOption) {
      return '#52c41a';
    } else if (isSelected && !isCorrectOption) {
      return '#ff4d4f';
    } else if (!isSelected && isCorrectOption) {
      return '#52c41a';
    }
    return '#333';
  }

  // 获取结果选项边框颜色
  private getResultOptionBorderColor(questionId: string, optIndex: number): string {
    const userAnswer = this.answers.get(questionId) || [];
    const isSelected = userAnswer.includes(optIndex);
    const correctAnswer = this.getCorrectAnswerIndices(questionId);
    const isCorrectOption = correctAnswer.includes(optIndex);

    if (isSelected && isCorrectOption) {
      return '#52c41a';
    } else if (isSelected && !isCorrectOption) {
      return '#ff4d4f';
    } else if (!isSelected && isCorrectOption) {
      return '#52c41a';
    }
    return '#e8e8e8';
  }

  // 获取结果选项状态文本
  private getResultOptionStatusText(questionId: string, optIndex: number): string {
    const userAnswer = this.answers.get(questionId) || [];
    const isSelected = userAnswer.includes(optIndex);
    const correctAnswer = this.getCorrectAnswerIndices(questionId);
    const isCorrectOption = correctAnswer.includes(optIndex);

    if (isSelected && isCorrectOption) {
      return '(正确答案)';
    } else if (isSelected && !isCorrectOption) {
      return '(你的答案)';
    } else if (!isSelected && isCorrectOption) {
      return '(正确答案)';
    }
    return '';
  }

  // 获取问题选项文本数组
  private getQuestionOptions(question: Question): string[] {
    if (!question.options) {
      return [];
    }

    // 检查是否是字符串数组（BackendQuestion类型）
    if (this.isStringArray(question.options)) {
      const stringArray = question.options as Object[];
      return stringArray.map(item => item as string);
    }

    // 如果是QuestionOption[]类型，提取text字段
    if (this.isQuestionOptionArray(question.options)) {
      const optionArray = question.options as Object[];
      return optionArray.map((opt: Object) => {
        const optionObj = opt as QuestionOption;
        return optionObj.text || '';
      });
    }

    return [];
  }

  // 检查是否是字符串数组
  private isStringArray(options: Object): boolean {
    if (!Array.isArray(options) || options.length === 0) {
      return false;
    }
    const firstItem = (options as string[])[0];
    return typeof firstItem === 'string';
  }

  // 检查是否是QuestionOption数组
  private isQuestionOptionArray(options: Object): boolean {
    if (!Array.isArray(options) || options.length === 0) {
      return false;
    }
    const firstItem = (options as Object[])[0];
    return typeof firstItem === 'object' && firstItem !== null;
  }

  // 获取正确答案索引
  private getCorrectAnswerIndices(questionId: string): number[] {
    if (!this.quiz) return [];
    const question = this.quiz.questions.find(q => q.id === questionId);
    
    if (!question) {
      return [];
    }

    // 定义扩展接口以支持answer字段
    interface QuestionWithAnswer extends Question {
      answer?: number[];
    }

    // 如果是BackendQuestion类型，直接返回answer字段
    const questionWithAnswer = question as QuestionWithAnswer;
    if (questionWithAnswer.answer && Array.isArray(questionWithAnswer.answer)) {
      return questionWithAnswer.answer.map((item: number) => Number(item));
    }
    
    // 如果是Question类型，需要从correctAnswer解析
    if (question.correctAnswer) {
      try {
        // 如果correctAnswer是字符串形式的数字数组，如"[0,2]"
        if (typeof question.correctAnswer === 'string') {
          const parsed: Object = JSON.parse(question.correctAnswer);
          if (Array.isArray(parsed)) {
            const parsedArray = parsed as Object[];
            return parsedArray.map(item => Number(item));
          }
        }
        // 如果correctAnswer已经是数组
        if (Array.isArray(question.correctAnswer)) {
          const correctAnswerArray = question.correctAnswer as Object[];
          return correctAnswerArray.map(item => Number(item));
        }
      } catch (e) {
        console.error('解析正确答案失败:', e);
      }
    }
    
    return [];
  }
}