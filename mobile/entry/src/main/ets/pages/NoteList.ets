// entry/src/main/ets/pages/NoteList.ets

import router from '@ohos.router';
import { promptAction } from '@kit.ArkUI';
import { Note, CreateNoteRequest, UpdateNoteRequest, NoteOperationResponse } from '../type/NoteTypes';
import { NoteController } from '../controller/NoteController';

// 定义按钮接口
interface DialogButton {
  text: string;
  color: string;
}

@Entry
@Component
struct NoteList {
  // 路由参数
  @State courseId: number = 0;
  @State courseTitle: string = '';

  // 控制器
  private noteController: NoteController = new NoteController('');

  // 状态变量
  @State noteList: Note[] = [];
  @State isLoading: boolean = false;
  @State error: string = '';

  // 笔记表单状态
  @State isNoteFormVisible: boolean = false;
  @State editingNote: Note | null = null;
  @State noteForm: CreateNoteRequest = {
    title: '',
    content: ''
  };
  @State isSubmitting: boolean = false;

  // 选中查看的笔记
  @State selectedNote: Note | null = null;

  // 用户角色状态
  @StorageLink('userRole') userRole: string = 'USER';
  @StorageLink('userId') userId: number = 0;

  aboutToAppear() {
    // 1. 获取 Token
    const token = AppStorage.get<string>('userToken') || '';
    this.noteController.setToken(token);

    // 2. 获取路由参数
    const params = router.getParams() as Record<string, Object>;
    if (params) {
      this.courseId = params.courseId as number;
      this.courseTitle = params.courseTitle as string;

      // 3. 加载数据
      this.loadNotes();
    }
  }

  build() {
    Stack() {
      // 底层页面内容
      Column() {
        // 1. 顶部导航栏
        this.buildNavBar()

        if (this.isLoading) {
          this.buildLoading()
        } else {
          Column({ space: 16 }) {
            // 2. 错误提示
            if (this.error) {
              this.buildError()
            }

            // 3. 笔记列表
            this.buildNotesList()
          }
          .padding(16)
          .width('100%')
          .layoutWeight(1)
        }
      }
      .width('100%')
      .height('100%')
      .backgroundColor('#f5f5f5')

      // 上层弹窗：添加/编辑笔记
      if (this.isNoteFormVisible) {
        this.buildNoteFormDialog()
      }

      // 上层弹窗：查看笔记详情
      if (this.selectedNote) {
        this.buildNoteDetailDialog()
      }
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

      Text(`${this.courseTitle} - 笔记`)
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .layoutWeight(1)
        .margin({ left: 10 })
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })

      Button('+')
        .width(40)
        .height(40)
        .backgroundColor('#007dff')
        .fontColor(Color.White)
        .onClick(() => {
          this.showCreateNoteForm();
        })
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
      Text('加载笔记列表中...').margin({ top: 10 }).fontColor('#999')
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }

  @Builder
  buildError() {
    Row() {
      Text(this.error)
        .fontSize(14)
        .fontColor(Color.Red)
        .layoutWeight(1)

      Button('重试')
        .fontSize(12)
        .height(28)
        .onClick(() => {
          this.error = '';
          this.loadNotes();
        })
    }
    .width('100%')
    .padding(12)
    .backgroundColor('#ffebee')
    .borderRadius(8)
  }

  @Builder
  buildNotesList() {
    if (this.noteList.length === 0) {
      Column() {
        Text('📝')
          .fontSize(48)
          .margin({ bottom: 16 })

        Text('暂无笔记')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#666')
          .margin({ bottom: 8 })

        Text('点击右上角的 + 按钮创建第一条笔记')
          .fontSize(14)
          .fontColor('#999')
          .textAlign(TextAlign.Center)
      }
      .width('100%')
      .height(300)
      .justifyContent(FlexAlign.Center)
    } else {
      List({ space: 12 }) {
        ForEach(this.noteList, (note: Note) => {
          ListItem() {
            this.buildNoteCard(note)
          }
        }, (note: Note) => `${note.id}`)
      }
      .width('100%')
    }
  }

  @Builder
  buildNoteCard(note: Note) {
    Column({ space: 12 }) {
      // 笔记头部
      Row() {
        Text(note.title)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333')
          .layoutWeight(1)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })

        // 作者信息（如果不是当前用户）
        if (note.authorId !== this.userId) {
          Text(`作者ID: ${note.authorId}`)
            .fontSize(12)
            .fontColor('#999')
        }
      }
      .width('100%')

      // 笔记内容预览
      Text(note.content)
        .fontSize(14)
        .fontColor('#666')
        .maxLines(3)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
        .lineHeight(20)
        .width('100%')

      // 笔记底部信息
      Row() {
        Text(this.formatDate(note.createdAt))
          .fontSize(12)
          .fontColor('#999')

        if (note.updatedAt && note.updatedAt !== note.createdAt) {
          Text(`更新于 ${this.formatDate(note.updatedAt)}`)
            .fontSize(12)
            .fontColor('#999')
            .margin({ left: 8 })
        }

        Blank()

        // 操作按钮
        Row({ space: 8 }) {
          // 查看按钮
          Button('查看')
            .fontSize(12)
            .height(28)
            .backgroundColor('#e3f2fd')
            .fontColor('#1976d2')
            .onClick(() => {
              this.viewNote(note);
            })

          // 编辑按钮（仅作者和管理员可见）
          if (this.canEditNote(note)) {
            Button('编辑')
              .fontSize(12)
              .height(28)
              .backgroundColor('#e8f5e8')
              .fontColor('#388e3c')
              .onClick(() => {
                this.showEditNoteForm(note);
              })
          }

          // 删除按钮（仅作者和管理员可见）
          if (this.canEditNote(note)) {
            Button('删除')
              .fontSize(12)
              .height(28)
              .backgroundColor('#ffebee')
              .fontColor('#d32f2f')
              .onClick(() => {
                this.deleteNote(note.id);
              })
          }
        }
      }
      .width('100%')
    }
    .width('100%')
    .padding(16)
    .backgroundColor(Color.White)
    .borderRadius(12)
    .shadow({ radius: 4, color: '#1a000000' })
    .onClick(() => {
      this.viewNote(note);
    })
  }

  @Builder
  buildNoteFormDialog() {
    Stack() {
      // 蒙层
      Column()
        .width('100%')
        .height('100%')
        .backgroundColor('rgba(0,0,0,0.5)')
        .onClick(() => {
          if (!this.isSubmitting) this.hideNoteForm();
        })

      // 对话框内容
      Column({ space: 16 }) {
        Text(this.editingNote ? '编辑笔记' : '创建新笔记')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        TextInput({ placeholder: '请输入笔记标题', text: this.noteForm.title })
          .onChange((val) => {
            this.noteForm.title = val;
          })
          .backgroundColor('#f9f9f9')
          .borderRadius(8)

        TextArea({ 
          placeholder: '请输入笔记内容...', 
          text: this.noteForm.content 
        })
          .height(120)
          .onChange((val) => {
            this.noteForm.content = val;
          })
          .backgroundColor('#f9f9f9')
          .borderRadius(8)

        Row({ space: 12 }) {
          Button('取消')
            .backgroundColor('#f0f0f0')
            .fontColor('#666')
            .layoutWeight(1)
            .onClick(() => this.hideNoteForm())

          Button(this.isSubmitting ? '提交中...' : '保存')
            .backgroundColor('#007dff')
            .fontColor(Color.White)
            .layoutWeight(1)
            .enabled(!this.isSubmitting)
            .onClick(() => this.submitNote())
        }
        .width('100%')
      }
      .width('90%')
      .padding(20)
      .backgroundColor(Color.White)
      .borderRadius(16)
    }
    .width('100%')
    .height('100%')
    .zIndex(999)
  }

  @Builder
  buildNoteDetailDialog() {
    Stack() {
      // 蒙层
      Column()
        .width('100%')
        .height('100%')
        .backgroundColor('rgba(0,0,0,0.5)')
        .onClick(() => {
          this.selectedNote = null;
        })

      // 对话框内容
      Column({ space: 16 }) {
        // 标题栏
        Row() {
          Text(this.selectedNote?.title || '')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .layoutWeight(1)

          Button('关闭')
            .fontSize(14)
            .height(32)
            .backgroundColor('#f0f0f0')
            .fontColor('#666')
            .onClick(() => {
              this.selectedNote = null;
            })
        }
        .width('100%')

        // 笔记信息
        Row() {
          Text(`创建时间: ${this.formatDate(this.selectedNote?.createdAt)}`)
            .fontSize(12)
            .fontColor('#999')

          if (this.selectedNote?.updatedAt && this.selectedNote.updatedAt !== this.selectedNote.createdAt) {
            Text(`更新时间: ${this.formatDate(this.selectedNote.updatedAt)}`)
              .fontSize(12)
              .fontColor('#999')
              .margin({ left: 12 })
          }
        }
        .width('100%')

        Divider().color('#f0f0f0')

        // 笔记内容
        Scroll() {
          Text(this.selectedNote?.content || '')
            .fontSize(14)
            .fontColor('#333')
            .lineHeight(22)
            .width('100%')
        }
        .layoutWeight(1)
        .width('100%')

        // 操作按钮
        if (this.selectedNote && this.canEditNote(this.selectedNote)) {
          Row({ space: 12 }) {
            Button('编辑')
              .backgroundColor('#007dff')
              .fontColor(Color.White)
              .layoutWeight(1)
              .onClick(() => {
                this.showEditNoteForm(this.selectedNote!);
                this.selectedNote = null;
              })

            Button('删除')
              .backgroundColor('#ff4d4f')
              .fontColor(Color.White)
              .layoutWeight(1)
              .onClick(() => {
                this.deleteNote(this.selectedNote!.id);
                this.selectedNote = null;
              })
          }
          .width('100%')
        }
      }
      .width('90%')
      .height('80%')
      .padding(20)
      .backgroundColor(Color.White)
      .borderRadius(16)
    }
    .width('100%')
    .height('100%')
    .zIndex(998)
  }

  // --- 逻辑方法 ---

  // 加载笔记列表
  async loadNotes() {
    this.isLoading = true;
    const result = await this.noteController.listNotes(this.courseId);
    if (result.success && result.data) {
      this.noteList = result.data;
      this.error = '';
    } else {
      this.error = result.message || '加载笔记失败';
    }
    this.isLoading = false;
  }

  // 显示创建笔记表单
  showCreateNoteForm() {
    this.editingNote = null;
    this.noteForm = { title: '', content: '' };
    this.isNoteFormVisible = true;
  }

  // 显示编辑笔记表单
  showEditNoteForm(note: Note) {
    this.editingNote = note;
    this.noteForm = {
      title: note.title,
      content: note.content
    };
    this.isNoteFormVisible = true;
  }

  // 隐藏笔记表单
  hideNoteForm() {
    this.isNoteFormVisible = false;
    this.editingNote = null;
    this.noteForm = { title: '', content: '' };
  }

  // 提交笔记
  async submitNote() {
    if (!this.noteForm.title.trim() || !this.noteForm.content.trim()) {
      promptAction.showToast({ message: '请填写完整的标题和内容' });
      return;
    }

    this.isSubmitting = true;

    let result: NoteOperationResponse;
    if (this.editingNote) {
      // 更新笔记
      const updateData: UpdateNoteRequest = {
        title: this.noteForm.title,
        content: this.noteForm.content
      };
      result = await this.noteController.updateNote(this.courseId, this.editingNote.id, updateData);
    } else {
      // 创建笔记
      result = await this.noteController.createNote(this.courseId, this.noteForm);
    }

    if (result.success) {
      promptAction.showToast({ 
        message: this.editingNote ? '笔记更新成功' : '笔记创建成功' 
      });
      this.hideNoteForm();
      this.loadNotes(); // 刷新列表
    } else {
      promptAction.showToast({ message: result.message || '操作失败' });
    }

    this.isSubmitting = false;
  }

  // 查看笔记详情
  viewNote(note: Note) {
    this.selectedNote = note;
  }

  // 删除笔记
  async deleteNote(noteId: string) {
    const button1: DialogButton = { text: '取消', color: '#666' };
    const button2: DialogButton = { text: '删除', color: '#ff0000' };
    
    promptAction.showDialog({
      title: '删除笔记',
      message: '确定要删除这条笔记吗？此操作不可恢复。',
      buttons: [button1, button2]
    }).then(async (resp: promptAction.ShowDialogSuccessResponse) => {
      if (resp.index === 1) {
        const result = await this.noteController.deleteNote(this.courseId, noteId);
        if (result.success) {
          promptAction.showToast({ message: '删除成功' });
          this.loadNotes(); // 刷新列表
        } else {
          promptAction.showToast({ message: result.message || '删除失败' });
        }
      }
    });
  }

  // 检查是否可以编辑笔记
  canEditNote(note: Note): boolean {
    return this.userRole === 'ADMIN' || note.authorId === this.userId;
  }

  // 格式化日期
  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return dateStr;
    }
  }
}