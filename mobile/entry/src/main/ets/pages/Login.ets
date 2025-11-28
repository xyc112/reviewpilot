// LoginPage.ets
import { LoginController } from '../controller/LoginController'
import router from '@ohos.router';


@Entry
@Component
struct LoginPage {
  @State username: string = ''
  @State password: string = ''
  @State isPasswordHidden: boolean = true
  @State isLoading: boolean = false
  @State errorMessage: string = ''

  private controller: LoginController = new LoginController()

  build() {
    Column() {
      // 顶部标题
      Text('用户登录')
        .fontSize(36)
        .fontWeight(FontWeight.Bold)
        .fontColor('#0A59F7')
        .margin({ top: 80, bottom: 60 })

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

      // 登录按钮
      Button(this.isLoading ? '登录中...' : '登录')
        .width('90%')
        .height(50)
        .backgroundColor(this.isFormValid() && !this.isLoading ? '#0A59F7' : '#A0A0A0')
        .borderRadius(25)
        .enabled(this.isFormValid() && !this.isLoading)
        .onClick(() => {
          this.handleLogin()
        })
        .margin({ bottom: 20 })

      // 注册链接
      Row() {
        Text('还没有账号？')
          .fontSize(14)
          .fontColor('#666666')

        Text('立即注册')
          .fontSize(14)
          .fontColor('#0A59F7')
          .fontWeight(FontWeight.Medium)
          .onClick(() => {
            // 跳转到注册页面
            router.pushUrl({
              url: 'pages/Register',
              params: {
                preFillUsername: this.username // 预填充用户名
              }
            })
          })
      }
      .margin({ top: 20 })

      // 忘记密码
      Text('忘记密码？')
        .fontSize(14)
        .fontColor('#0A59F7')
        .margin({ top: 16 })
        .onClick(() => {
          // 处理忘记密码逻辑
          console.log('忘记密码功能待实现')
        })

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
    return this.username.trim().length >= 3 && this.password.length >= 6
  }

  // 处理登录
  private async handleLogin() {
    if (!this.isFormValid() || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.clearError();

    try {
      const result = await this.controller.login(this.username, this.password);

      if (result.success && result.data) {
        console.log('登录成功，用户信息:', result.data);
        AppStorage.setOrCreate<string>('userToken', result.data.token);
        AppStorage.setOrCreate<string>('username', result.data.username);
        AppStorage.setOrCreate<string>('userRole', result.data.role);
        AppStorage.setOrCreate<boolean>('isLoggedIn', true);

        // 根据用户角色跳转到不同页面
        if (result.data.role === 'ADMIN') {
          // 管理员跳转到课程管理页面
          router.replaceUrl({
            url: 'pages/CourseList',
            params: {
              username: result.data.username,
              role: result.data.role
            }
          });
        } else {
          // 普通用户跳转到课程列表页面
          router.replaceUrl({
            url: 'pages/CourseList',
            params: {
              username: result.data.username,
              role: result.data.role,
              token: result.data.token
            }
          });
        }
      } else {
        this.errorMessage = result.message || '登录失败';
      }
    } catch (error) {
      console.error('登录过程异常:', error);
      this.errorMessage = '登录过程出现异常，请重试';
    } finally {
      this.isLoading = false;
    }
  }
}