// RegisterPage.ets
import { LoginController } from '../controller/LoginController'
import router from '@ohos.router';

// 定义路由参数接口
interface RegisterPageParams {
  preFillUsername?: string;
}
interface routeParams{
  username:string;
  role:string;
  token:string;
}

@Entry
@Component
struct RegisterPage {
  @State username: string = ''
  @State password: string = ''
  @State confirmPassword: string = ''
  @State isPasswordHidden: boolean = true
  @State isConfirmPasswordHidden: boolean = true
  @State isLoading: boolean = false
  @State errorMessage: string = ''
  @State selectedRole: string = 'USER'

  private controller: LoginController = new LoginController()

  aboutToAppear() {
    // 获取路由参数并预填充用户名
    const params: RegisterPageParams = router.getParams() as RegisterPageParams;
    if (params && params.preFillUsername) {
      this.username = params.preFillUsername;
    }
  }

  build() {
    Column() {
      // 顶部标题
      Text('用户注册')
        .fontSize(36)
        .fontWeight(FontWeight.Bold)
        .fontColor('#0A59F7')
        .margin({ top: 60, bottom: 40 })

      // 用户名输入框
      TextInput({ text: this.username, placeholder: '请输入用户名' })
        .width('90%')
        .height(56)
        .backgroundColor('#FFFFFF')
        .padding({ left: 16, right: 16 })
        .borderRadius(12)
        .border({ width: 1, color: '#E4E6EB' })
        .margin({ bottom: 20 })
        .onChange((value: string) => {
          this.username = value
          this.clearError()
        })

      // 密码输入框
      Row() {
        TextInput({ text: this.password, placeholder: '请输入密码' })
          .width('85%')
          .height(56)
          .type(this.isPasswordHidden ? InputType.Password : InputType.Normal)
          .backgroundColor('#FFFFFF')
          .padding({ left: 16 })
          .onChange((value: string) => {
            this.password = value
            this.clearError()
          })

        // 显示/隐藏密码按钮
        Button(this.isPasswordHidden ? '显示' : '隐藏')
          .width(60)
          .height(32)
          .fontSize(14)
          .backgroundColor('#F5F5F5')
          .onClick(() => {
            this.isPasswordHidden = !this.isPasswordHidden
          })
      }
      .width('90%')
      .height(56)
      .backgroundColor('#FFFFFF')
      .borderRadius(12)
      .border({ width: 1, color: '#E4E6EB' })
      .margin({ bottom: 20 })

      // 确认密码输入框
      Row() {
        TextInput({ text: this.confirmPassword, placeholder: '请确认密码' })
          .width('85%')
          .height(56)
          .type(this.isConfirmPasswordHidden ? InputType.Password : InputType.Normal)
          .backgroundColor('#FFFFFF')
          .padding({ left: 16 })
          .onChange((value: string) => {
            this.confirmPassword = value
            this.clearError()
          })

        // 显示/隐藏确认密码按钮
        Button(this.isConfirmPasswordHidden ? '显示' : '隐藏')
          .width(60)
          .height(32)
          .fontSize(14)
          .backgroundColor('#F5F5F5')
          .onClick(() => {
            this.isConfirmPasswordHidden = !this.isConfirmPasswordHidden
          })
      }
      .width('90%')
      .height(56)
      .backgroundColor('#FFFFFF')
      .borderRadius(12)
      .border({ width: 1, color: '#E4E6EB' })
      .margin({ bottom: 30 })

      // 角色选择区域
      Text('选择角色')
        .fontSize(16)
        .fontColor('#333333')
        .width('90%')
        .textAlign(TextAlign.Start)
        .margin({ bottom: 10 })

      // 角色选择按钮组
      Row() {
        // USER 角色选项
        Button('普通用户 (USER)')
          .width('45%')
          .height(45)
          .fontSize(16)
          .backgroundColor(this.selectedRole === 'USER' ? '#0A59F7' : '#F5F5F5')
          .fontColor(this.selectedRole === 'USER' ? '#FFFFFF' : '#333333')
          .border({ width: this.selectedRole === 'USER' ? 0 : 1, color: '#E4E6EB' })
          .onClick(() => {
            this.selectedRole = 'USER'
          })

        // ADMIN 角色选项
        Button('管理员 (ADMIN)')
          .width('45%')
          .height(45)
          .fontSize(16)
          .backgroundColor(this.selectedRole === 'ADMIN' ? '#0A59F7' : '#F5F5F5')
          .fontColor(this.selectedRole === 'ADMIN' ? '#FFFFFF' : '#333333')
          .border({ width: this.selectedRole === 'ADMIN' ? 0 : 1, color: '#E4E6EB' })
          .margin({ left: 10 })
          .onClick(() => {
            this.selectedRole = 'ADMIN'
          })
      }
      .width('90%')
      .justifyContent(FlexAlign.SpaceBetween)
      .margin({ bottom: 30 })

      // 错误信息显示
      if (this.errorMessage !== '') {
        Text(this.errorMessage)
          .fontSize(14)
          .fontColor('#FF4757')
          .width('90%')
          .textAlign(TextAlign.Start)
          .margin({ bottom: 20 })
      }

      // 注册按钮
      Button(this.isLoading ? '注册中...' : '注册')
        .width('90%')
        .height(50)
        .fontSize(18)
        .fontColor('#FFFFFF')
        .backgroundColor(this.isFormValid() && !this.isLoading ? '#0A59F7' : '#A0A0A0')
        .borderRadius(25)
        .enabled(this.isFormValid() && !this.isLoading)
        .onClick(() => {
          this.handleRegister()
        })
        .margin({ bottom: 20 })

      // 返回登录链接
      Row() {
        Text('已有账号？')
          .fontSize(14)
          .fontColor('#666666')

        Text('立即登录')
          .fontSize(14)
          .fontColor('#0A59F7')
          .fontWeight(FontWeight.Medium)
          .onClick(() => {
            // 返回登录页面
            router.back()
          })
      }
      .margin({ top: 20 })

    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8F9FA')
    .alignItems(HorizontalAlign.Center)
  }

  // 清除错误信息
  private clearError() {
    if (this.errorMessage !== '') {
      this.errorMessage = ''
    }
  }

  // 表单验证
  private isFormValid(): boolean {
    // 用户名至少3个字符
    if (this.username.trim().length < 3) {
      return false
    }

    // 密码至少6个字符
    if (this.password.length < 6) {
      return false
    }

    // 确认密码必须匹配
    if (this.password !== this.confirmPassword) {
      return false
    }

    return true
  }

  // 处理注册
  private async handleRegister() {
    if (!this.isFormValid() || this.isLoading) {
      return
    }

    this.isLoading = true
    this.clearError()

    try {
      // 调用控制器的注册方法
      const result = await this.controller.register(this.username, this.password, this.selectedRole)

      if (result.success && result.data) {
        console.log('注册成功，用户信息:', result.data)

        // 注册成功后跳转到对应页面
        const routeParams :routeParams= {
          username: result.data.username,
          role: result.data.role,
          token: result.data.token
        }

        if (result.data.role === 'ADMIN') {
          // 管理员跳转到管理页面
          router.replaceUrl({
            url: 'pages/CourseList',
            params: routeParams
          })
        } else {
          // 普通用户跳转到用户主页
          router.replaceUrl({
            url: 'pages/CourseList',
            params: routeParams
          })
        }
      } else {
        this.errorMessage = result.message || '注册失败'
      }
    } catch (error) {
      console.error('注册过程异常:', error)
      this.errorMessage = '注册过程出现异常，请重试'
    } finally {
      this.isLoading = false
    }
  }
}