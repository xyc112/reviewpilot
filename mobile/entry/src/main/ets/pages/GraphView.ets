// GraphView.ets
import router from '@ohos.router';
import { promptAction } from '@kit.ArkUI';
import { Node, Relation, NodeType, RelationType, CreateNodeRequest, CreateRelationRequest, ApiCreateRelationRequest } from '../type/GraphTypes';
import { GraphController } from '../controller/GraphController';

interface GeneratedTypeLiteralInterface_1 {
  title: string;
  type: NodeType;
  content: string;
}

interface GeneratedTypeLiteralInterface_2 {
  fromNodeId: string;
  toNodeId: string;
  type: RelationType;
  label: string;
  weight: number;
}

@Entry
@Component
struct GraphView {
  // 路由参数
  @State courseId: number = 0;
  @State courseTitle: string = '';

  // 控制器
  private graphController: GraphController = new GraphController();

  // 状态变量
  @State nodes: Node[] = [];
  @State relations: Relation[] = [];
  @State isLoading: boolean = false;
  @State errorMessage: string = '';
  @State selectedNode: Node | null = null;
  @State showNodeForm: boolean = false;
  @State showRelationForm: boolean = false;
  @State showGroupPanel: boolean = false;
  @State showFromNodePicker: boolean = false;
  @State showToNodePicker: boolean = false;
  @State showRelationTypePicker: boolean = false;

  // 关系类型选项
  private readonly relationTypes: RelationType[] = [RelationType.RELATED, RelationType.PREREQUISITE, RelationType.DEPENDS_ON];

  // 表单数据
  @State nodeForm: GeneratedTypeLiteralInterface_1 = {
    title: '',
    type: NodeType.CONCEPT,
    content: ''
  };

  @State relationForm: GeneratedTypeLiteralInterface_2 = {
    fromNodeId: '',
    toNodeId: '',
    type: RelationType.RELATED,
    label: '',
    weight: 0.5
  };

  // 用户角色
  @StorageLink('userRole') userRole: string = 'USER';

  aboutToAppear() {
    // 获取 Token
    const token = AppStorage.get<string>('userToken') || '';
    this.graphController.setToken(token);

    // 获取路由参数
    const params = router.getParams() as Record<string, Object>;
    if (params) {
      this.courseId = params['courseId'] as number;
      this.courseTitle = params['courseTitle'] as string;
      
      // 加载数据
      this.fetchGraphData();
    }
  }

  build() {
    Stack() {
      Column() {
        // 顶部导航栏
        this.buildNavBar();

        if (this.isLoading) {
          this.buildLoading();
        } else if (this.errorMessage) {
          this.buildError();
        } else {
          // 主要内容区域
          this.buildMainContent();
        }
      }
      .width('100%')
      .height('100%')
      .backgroundColor('#f5f5f5')

      // 节点创建表单弹窗
      if (this.showNodeForm) {
        this.buildNodeFormModal();
      }

      // 关系创建表单弹窗
      if (this.showRelationForm) {
        this.buildRelationFormModal();
      }
    }
  }

  @Builder
  buildNavBar() {
    Column() {
      // 第一行：返回按钮和标题
      Row() {
        Button({ type: ButtonType.Normal }) {
          Text('< 返回')
        }
        .width(80)
        .height(40)
        .backgroundColor(Color.Transparent)
        .fontColor('#007dff')
        .onClick(() => {
          router.back();
        })

        Text('知识图谱')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)
          .margin({ left: 10 })

        Button({ type: ButtonType.Normal }) {
          Text(this.showGroupPanel ? '隐藏分组' : '📦 分组')
        }
        .width(100)
        .height(40)
        .backgroundColor('#666')
        .fontColor(Color.White)
        .onClick(() => {
          this.showGroupPanel = !this.showGroupPanel;
        })
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor(Color.White)
      .shadow({ radius: 2, color: '#1a000000' })

      // 第二行：管理员操作按钮
      if (this.userRole === 'ADMIN') {
        Row() {
          Blank()
          Row({ space: 12 }) {
            Button('添加节点')
              .backgroundColor('#52c41a')
              .fontColor(Color.White)
              .height(36)
              .padding({ left: 16, right: 16 })
              .onClick(() => {
                this.showNodeForm = true;
              })

            Button('创建新关系')
              .backgroundColor('#1890ff')
              .fontColor(Color.White)
              .height(36)
              .padding({ left: 16, right: 16 })
              .onClick(() => {
                this.initializeRelationForm();
                this.showRelationForm = true;
              })
          }
          .margin({ right: 16 })
        }
        .width('100%')
        .height(50)
        .backgroundColor('#fafafa')
        .border({ width: { bottom: 1 }, color: '#e8e8e8' })
      }
    }
  }

  @Builder
  buildLoading() {
    Column() {
      LoadingProgress().width(50).height(50)
      Text('加载知识图谱中...').margin({ top: 10 }).fontColor('#999')
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }

  @Builder
  buildError() {
    Column() {
      Text('⚠️')
        .fontSize(48)
        .fontColor('#ff4d4f')
        .margin({ bottom: 16 })
      
      Text(this.errorMessage)
        .fontSize(16)
        .fontColor('#666')
        .textAlign(TextAlign.Center)
        .margin({ bottom: 20 })
      
      Button('重试')
        .backgroundColor('#007dff')
        .fontColor(Color.White)
        .onClick(() => {
          this.fetchGraphData();
        })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .padding(20)
  }

  @Builder
  buildMainContent() {
    Row() {
      // 左侧分组面板
      if (this.showGroupPanel) {
        this.buildGroupPanel()
      }

      // 主要内容区域
      Column() {
        this.buildGraphVisualization()
        
        if (this.selectedNode) {
          this.buildNodeDetails()
        }
      }
      .layoutWeight(1)
      .margin({ left: 8, right: 8 })
    }
    .width('100%')
    .layoutWeight(1)
    .padding(16)
  }

  @Builder
  buildGroupPanel() {
    Column() {
      Text('分组管理')
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 16 })
      
      Text('分组功能开发中...')
        .fontSize(14)
        .fontColor('#666')
    }
    .width(200)
    .height('100%')
    .padding(16)
    .backgroundColor(Color.White)
    .borderRadius(8)
    .shadow({ radius: 4, color: '#1a000000' })
    .margin({ right: 8 })
  }

  @Builder
  buildGraphVisualization() {
    Column() {
      Row() {
        Text(`知识图谱 (${this.nodes.length} 节点, ${this.relations.length} 关系)`)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)
      }
      .width('100%')
      .margin({ bottom: 12 })

      // 图谱可视化区域
      Scroll() {
        Column({ space: 12 }) {
          // 先显示所有关系连接
          ForEach(this.relations, (relation: Relation) => {
            this.buildRelationConnection(relation)
          })

          // 再显示所有节点
          ForEach(this.nodes, (node: Node) => {
            this.buildGraphNode(node)
          })
        }
        .width('100%')
        .padding(16)
      }
      .width('100%')
      .layoutWeight(1)
      .backgroundColor(Color.White)
      .borderRadius(8)
      .shadow({ radius: 4, color: '#1a000000' })
    }
    .width('100%')
    .height('60%')
  }

  @Builder
  buildRelationConnection(relation: Relation) {
    Row() {
      // 起始节点
      Text(this.nodes.find(n => n.id === relation.fromNodeId)?.title || relation.fromNodeId)
        .fontSize(14)
        .fontColor('#333')
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
        .layoutWeight(1)
        .padding(8)
        .backgroundColor('#e6f7ff')
        .borderRadius(6)
        .border({ width: 1, color: '#1890ff' })

      // 关系箭头和标签
      Column({ space: 2 }) {
        Text('→')
          .fontSize(16)
          .fontColor('#1890ff')
        Text(this.getRelationTypeLabel(relation.type))
          .fontSize(10)
          .fontColor('#666')
          .backgroundColor('#f0f0f0')
          .padding({ left: 4, right: 4, top: 1, bottom: 1 })
          .borderRadius(3)
      }
      .width(60)
      .justifyContent(FlexAlign.Center)

      // 目标节点
      Text(this.nodes.find(n => n.id === relation.toNodeId)?.title || relation.toNodeId)
        .fontSize(14)
        .fontColor('#333')
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
        .layoutWeight(1)
        .padding(8)
        .backgroundColor('#f6ffed')
        .borderRadius(6)
        .border({ width: 1, color: '#52c41a' })

      // 删除按钮（管理员）
      if (this.userRole === 'ADMIN') {
        Button('×')
          .width(24)
          .height(24)
          .fontSize(14)
          .backgroundColor('#ff4d4f')
          .fontColor(Color.White)
          .margin({ left: 8 })
          .onClick(() => {
            this.handleDeleteRelation(relation.id);
          })
      }
    }
    .width('100%')
    .alignItems(VerticalAlign.Center)
    .padding({ left: 8, right: 8 })
  }

  @Builder
  buildGraphNode(node: Node) {
    Row() {
      // 节点图标
      Column() {
        Text('●')
          .fontSize(24)
          .fontColor(this.getNodeColor(node.type))
      }
      .width(40)
      .justifyContent(FlexAlign.Center)

      // 节点信息
      Column({ space: 4 }) {
        Text(node.title)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333')
        
        Row({ space: 8 }) {
          Text(node.type)
            .fontSize(12)
            .fontColor('#666')
            .backgroundColor('#f0f0f0')
            .padding({ left: 6, right: 6, top: 2, bottom: 2 })
            .borderRadius(4)
          
          Text(`ID: ${node.id}`)
            .fontSize(12)
            .fontColor('#999')
          
          Text(`入度: ${this.getIncomingRelations(node.id).length} | 出度: ${this.getOutgoingRelations(node.id).length}`)
            .fontSize(12)
            .fontColor('#666')
        }
      }
      .layoutWeight(1)
      .alignItems(HorizontalAlign.Start)

      // 操作按钮
      Column({ space: 4 }) {
        Button('查看')
          .width(60)
          .height(32)
          .fontSize(12)
          .backgroundColor('#007dff')
          .fontColor(Color.White)
          .onClick(() => {
            this.selectedNode = node;
          })

        if (this.userRole === 'ADMIN') {
          Button('删除')
            .width(60)
            .height(32)
            .fontSize(12)
            .backgroundColor('#ff4d4f')
            .fontColor(Color.White)
            .onClick(() => {
              this.handleDeleteNode(node.id);
            })
        }
      }
    }
    .width('100%')
    .padding(12)
    .backgroundColor(this.selectedNode?.id === node.id ? '#e6f7ff' : Color.White)
    .borderRadius(8)
    .border({ width: 1, color: this.selectedNode?.id === node.id ? '#007dff' : '#f0f0f0' })
    .shadow({ radius: 2, color: '#1a000000' })
    .onClick(() => {
      this.selectedNode = node;
    })
  }

  // 获取节点颜色
  getNodeColor(type: NodeType): string {
    switch (type) {
      case NodeType.CONCEPT:
        return '#1890ff';
      case NodeType.EXAMPLE:
        return '#52c41a';
      case NodeType.EXERCISE:
        return '#fa8c16';
      case NodeType.RESOURCE:
        return '#722ed1';
      default:
        return '#666';
    }
  }

  @Builder
  buildNodeItem(node: Node) {
    Row() {
      Column({ space: 4 }) {
        Text(node.title)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333')
        
        Row({ space: 8 }) {
          Text(node.type)
            .fontSize(12)
            .fontColor('#666')
            .backgroundColor('#f0f0f0')
            .padding({ left: 6, right: 6, top: 2, bottom: 2 })
            .borderRadius(4)
          
          Text(`ID: ${node.id}`)
            .fontSize(12)
            .fontColor('#999')
        }
      }
      .layoutWeight(1)
      .alignItems(HorizontalAlign.Start)

      Column({ space: 4 }) {
        Text(`入度: ${this.getIncomingRelations(node.id).length}`)
          .fontSize(12)
          .fontColor('#666')
        
        Text(`出度: ${this.getOutgoingRelations(node.id).length}`)
          .fontSize(12)
          .fontColor('#666')
      }

      Column({ space: 4 }) {
        Button('查看')
          .width(60)
          .height(32)
          .fontSize(12)
          .backgroundColor('#007dff')
          .fontColor(Color.White)
          .onClick(() => {
            this.selectedNode = node;
          })

        if (this.userRole === 'ADMIN') {
          Button('删除')
            .width(60)
            .height(32)
            .fontSize(12)
            .backgroundColor('#ff4d4f')
            .fontColor(Color.White)
            .onClick(() => {
              this.handleDeleteNode(node.id);
            })
        }
      }
    }
    .width('100%')
    .padding(12)
    .backgroundColor(this.selectedNode?.id === node.id ? '#e6f7ff' : Color.White)
    .borderRadius(6)
    .border({ width: 1, color: this.selectedNode?.id === node.id ? '#007dff' : '#f0f0f0' })
    .onClick(() => {
      this.selectedNode = node;
    })
  }

  @Builder
  buildNodeDetails() {
    Column() {
      Row() {
        Text('节点详情')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)

        Button('关闭')
          .width(60)
          .height(32)
          .fontSize(12)
          .backgroundColor('#666')
          .fontColor(Color.White)
          .onClick(() => {
            this.selectedNode = null;
          })
      }
      .width('100%')
      .margin({ bottom: 16 })

      Scroll() {
        Column({ space: 12 }) {
          // 基本信息
          Column({ space: 8 }) {
            Text('基本信息')
              .fontSize(14)
              .fontWeight(FontWeight.Bold)
              .fontColor('#333')

            Row() {
              Text('标题:')
                .fontSize(14)
                .fontColor('#666')
                .width(60)
              Text(this.selectedNode?.title || '')
                .fontSize(14)
                .fontColor('#333')
                .layoutWeight(1)
            }

            Row() {
              Text('类型:')
                .fontSize(14)
                .fontColor('#666')
                .width(60)
              Text(this.selectedNode?.type || '')
                .fontSize(14)
                .fontColor('#333')
                .layoutWeight(1)
            }

            Row() {
              Text('ID:')
                .fontSize(14)
                .fontColor('#666')
                .width(60)
              Text(this.selectedNode?.id || '')
                .fontSize(14)
                .fontColor('#333')
                .layoutWeight(1)
            }

            if (this.selectedNode?.content) {
              Row() {
                Text('内容:')
                  .fontSize(14)
                  .fontColor('#666')
                  .width(60)
                Text(this.selectedNode.content)
                  .fontSize(14)
                  .fontColor('#333')
                  .layoutWeight(1)
                  .maxLines(3)
              }
            }
          }
          .width('100%')
          .padding(12)
          .backgroundColor('#fafafa')
          .borderRadius(6)

          // 相关关系
          this.buildNodeRelations()
        }
        .width('100%')
      }
      .width('100%')
      .layoutWeight(1)
    }
    .width('100%')
    .height('50%')
    .padding(16)
    .backgroundColor(Color.White)
    .borderRadius(8)
    .shadow({ radius: 4, color: '#1a000000' })
    .margin({ top: 8 })
  }

  @Builder
  buildNodeRelations() {
    Column({ space: 12 }) {
      Text('相关关系')
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
        .fontColor('#333')

      if (this.getOutgoingRelations(this.selectedNode?.id || '').length > 0) {
        Column({ space: 8 }) {
          Text(`出边 (${this.getOutgoingRelations(this.selectedNode?.id || '').length}):`)
            .fontSize(14)
            .fontColor('#666')

          ForEach(this.getOutgoingRelations(this.selectedNode?.id || ''), (relation: Relation) => {
            Row() {
              Text('→')
                .fontSize(14)
                .fontColor('#52c41a')
                .margin({ right: 8 })
              Text(this.nodes.find(n => n.id === relation.toNodeId)?.title || relation.toNodeId)
                .fontSize(14)
                .fontColor('#333')
                .layoutWeight(1)
              Text(this.getRelationTypeLabel(relation.type))
                .fontSize(12)
                .fontColor('#666')
                .backgroundColor('#f0f0f0')
                .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                .borderRadius(4)
            }
            .width('100%')
            .padding(8)
            .backgroundColor('#f9f9f9')
            .borderRadius(4)
          })
        }
      }

      if (this.getIncomingRelations(this.selectedNode?.id || '').length > 0) {
        Column({ space: 8 }) {
          Text(`入边 (${this.getIncomingRelations(this.selectedNode?.id || '').length}):`)
            .fontSize(14)
            .fontColor('#666')

          ForEach(this.getIncomingRelations(this.selectedNode?.id || ''), (relation: Relation) => {
            Row() {
              Text('←')
                .fontSize(14)
                .fontColor('#1890ff')
                .margin({ right: 8 })
              Text(this.nodes.find(n => n.id === relation.fromNodeId)?.title || relation.fromNodeId)
                .fontSize(14)
                .fontColor('#333')
                .layoutWeight(1)
              Text(this.getRelationTypeLabel(relation.type))
                .fontSize(12)
                .fontColor('#666')
                .backgroundColor('#f0f0f0')
                .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                .borderRadius(4)
            }
            .width('100%')
            .padding(8)
            .backgroundColor('#f9f9f9')
            .borderRadius(4)
          })
        }
      }

      if (this.getIncomingRelations(this.selectedNode?.id || '').length === 0 && 
          this.getOutgoingRelations(this.selectedNode?.id || '').length === 0) {
        Text('此节点暂无关联关系')
          .fontSize(14)
          .fontColor('#999')
          .textAlign(TextAlign.Center)
          .width('100%')
          .padding(20)
      }
    }
    .width('100%')
    .padding(12)
    .backgroundColor('#fafafa')
    .borderRadius(6)
  }



  @Builder
  buildRelationItem(relation: Relation) {
    Column({ space: 8 }) {
      Row() {
        Text(this.nodes.find(n => n.id === relation.fromNodeId)?.title || relation.fromNodeId)
          .fontSize(14)
          .fontColor('#333')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .layoutWeight(1)

        Text('→')
          .fontSize(14)
          .fontColor('#1890ff')
          .margin({ left: 4, right: 4 })

        Text(this.nodes.find(n => n.id === relation.toNodeId)?.title || relation.toNodeId)
          .fontSize(14)
          .fontColor('#333')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .layoutWeight(1)
      }
      .width('100%')

      Row() {
        Text(this.getRelationTypeLabel(relation.type))
          .fontSize(12)
          .fontColor('#666')
          .backgroundColor('#f0f0f0')
          .padding({ left: 6, right: 6, top: 2, bottom: 2 })
          .borderRadius(4)
          .layoutWeight(1)

        if (relation.weight !== undefined) {
          Text(`权重: ${relation.weight.toFixed(2)}`)
            .fontSize(12)
            .fontColor('#999')
        }
      }
      .width('100%')

      if (this.userRole === 'ADMIN') {
        Button('删除关系')
          .width('100%')
          .height(32)
          .fontSize(12)
          .backgroundColor('#ff4d4f')
          .fontColor(Color.White)
          .onClick(() => {
            this.handleDeleteRelation(relation.id);
          })
      }
    }
    .width('100%')
    .padding(12)
    .backgroundColor('#fafafa')
    .borderRadius(6)
    .border({ width: 1, color: '#f0f0f0' })
  }

  @Builder
  buildNodeFormModal() {
    Stack() {
      // 半透明遮罩
      Column()
        .width('100%')
        .height('100%')
        .backgroundColor('rgba(0, 0, 0, 0.5)')
        .onClick(() => {
          this.showNodeForm = false;
        })

      // 表单内容
      Column() {
        Text('创建新节点')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin({ bottom: 20 })

        Scroll() {
          Column({ space: 16 }) {
            // 节点标题
            Column({ space: 8 }) {
              Text('节点标题:')
                .fontSize(14)
                .fontColor('#333')
              
              TextInput({ placeholder: '输入节点名称' })
                .width('100%')
                .height(40)
                .fontSize(14)
                .backgroundColor('#f5f5f5')
                .borderRadius(6)
                .onChange((value: string) => {
                  this.nodeForm.title = value;
                })
            }

            // 节点类型
            Column({ space: 8 }) {
              Text('节点类型:')
                .fontSize(14)
                .fontColor('#333')
              
              Row({ space: 8 }) {
                ForEach(Object.values(NodeType), (type: NodeType) => {
                  Button(type)
                    .width(80)
                    .height(32)
                    .fontSize(12)
                    .backgroundColor(this.nodeForm.type === type ? '#007dff' : '#f0f0f0')
                    .fontColor(this.nodeForm.type === type ? Color.White : '#666')
                    .onClick(() => {
                      this.nodeForm.type = type;
                    })
                })
              }
            }

            // 节点内容
            Column({ space: 8 }) {
              Text('描述:')
                .fontSize(14)
                .fontColor('#333')
              
              TextArea({ placeholder: '输入节点描述（可选）' })
                .width('100%')
                .height(80)
                .fontSize(14)
                .backgroundColor('#f5f5f5')
                .borderRadius(6)
                .onChange((value: string) => {
                  this.nodeForm.content = value;
                })
            }
          }
          .width('100%')
        }
        .width('100%')
        .layoutWeight(1)
        .margin({ bottom: 20 })

        // 操作按钮
        Row({ space: 12 }) {
          Button('取消')
            .width(100)
            .height(40)
            .backgroundColor('#f0f0f0')
            .fontColor('#666')
            .onClick(() => {
              this.showNodeForm = false;
              this.resetNodeForm();
            })

          Button('创建')
            .width(100)
            .height(40)
            .backgroundColor('#007dff')
            .fontColor(Color.White)
            .onClick(() => {
              this.handleCreateNode();
            })
        }
      }
      .width('90%')
      .height('80%')
      .padding(20)
      .backgroundColor(Color.White)
      .borderRadius(12)
      .shadow({ radius: 10, color: '#1a000000' })
      .align(Alignment.Center)
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  buildRelationFormModal() {
    Stack() {
      // 半透明遮罩
      Column()
        .width('100%')
        .height('100%')
        .backgroundColor('rgba(0, 0, 0, 0.5)')
        .onClick(() => {
          this.showRelationForm = false;
        })

      // 表单内容
      Column() {
        Text('创建新关系')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin({ bottom: 20 })

        Scroll() {
          Column({ space: 16 }) {
            // 起始节点
            Column({ space: 8 }) {
              Text('起始节点:')
                .fontSize(14)
                .fontColor('#333')
              
              if (this.nodes.length === 0) {
                Text('暂无可用节点，请先创建节点')
                  .width('100%')
                  .height(40)
                  .fontSize(14)
                  .fontColor('#999')
                  .backgroundColor('#f5f5f5')
                  .borderRadius(6)
                  .padding(10)
                  .textAlign(TextAlign.Center)
              } else {
                Column() {
                  // 显示当前选中的节点
                  Row() {
                    Text(this.nodes.find(n => n.id === this.relationForm.fromNodeId)?.title || '选择起始节点')
                      .fontSize(14)
                      .fontColor(this.relationForm.fromNodeId ? '#333' : '#999')
                      .layoutWeight(1)
                      .padding(10)
                    
                    Button('▼')
                      .fontSize(12)
                      .width(40)
                      .height(40)
                      .backgroundColor('#e8e8e8')
                      .fontColor('#666')
                      .onClick(() => {
                        this.showFromNodePicker = !this.showFromNodePicker;
                        this.showToNodePicker = false;
                        this.showRelationTypePicker = false;
                      })
                  }
                  .width('100%')
                  .height(40)
                  .backgroundColor('#f5f5f5')
                  .borderRadius(6)
                  .onClick(() => {
                    this.showFromNodePicker = !this.showFromNodePicker;
                    this.showToNodePicker = false;
                    this.showRelationTypePicker = false;
                  })

                  // 节点选择器
                  if (this.showFromNodePicker) {
                    Column() {
                      ForEach(this.nodes, (node: Node, index?: number) => {
                        Row() {
                          Text(node.title)
                            .fontSize(14)
                            .fontColor('#333')
                            .layoutWeight(1)
                            .padding(12)
                          
                          if (node.id === this.relationForm.fromNodeId) {
                            Text('✓')
                              .fontSize(14)
                              .fontColor('#52c41a')
                              .margin({ right: 12 })
                          }
                        }
                        .width('100%')
                        .backgroundColor(node.id === this.relationForm.fromNodeId ? '#f0f9ff' : Color.White)
                        .border({ width: { bottom: 1 }, color: '#f0f0f0' })
                        .onClick(() => {
                          this.relationForm = {
                            fromNodeId: node.id,
                            toNodeId: this.relationForm.toNodeId,
                            type: this.relationForm.type,
                            label: this.relationForm.label,
                            weight: this.relationForm.weight
                          };
                          this.showFromNodePicker = false;
                        })
                      })
                    }
                    .width('100%')
                    .height(200)
                    .backgroundColor(Color.White)
                    .borderRadius(6)
                    .border({ width: 1, color: '#d9d9d9' })
                    .shadow({ radius: 4, color: '#1a000000' })
                    .margin({ top: 4 })
                    .zIndex(10)
                  }
                }
              }
            }

            // 目标节点
            Column({ space: 8 }) {
              Text('目标节点:')
                .fontSize(14)
                .fontColor('#333')
              
              if (this.nodes.length === 0) {
                Text('暂无可用节点，请先创建节点')
                  .width('100%')
                  .height(40)
                  .fontSize(14)
                  .fontColor('#999')
                  .backgroundColor('#f5f5f5')
                  .borderRadius(6)
                  .padding(10)
                  .textAlign(TextAlign.Center)
              } else {
                Column() {
                  // 显示当前选中的节点
                  Row() {
                    Text(this.nodes.find(n => n.id === this.relationForm.toNodeId)?.title || '选择目标节点')
                      .fontSize(14)
                      .fontColor(this.relationForm.toNodeId ? '#333' : '#999')
                      .layoutWeight(1)
                      .padding(10)
                    
                    Button('▼')
                      .fontSize(12)
                      .width(40)
                      .height(40)
                      .backgroundColor('#e8e8e8')
                      .fontColor('#666')
                      .onClick(() => {
                        this.showToNodePicker = !this.showToNodePicker;
                        this.showFromNodePicker = false;
                        this.showRelationTypePicker = false;
                      })
                  }
                  .width('100%')
                  .height(40)
                  .backgroundColor('#f5f5f5')
                  .borderRadius(6)
                  .onClick(() => {
                    this.showToNodePicker = !this.showToNodePicker;
                    this.showFromNodePicker = false;
                    this.showRelationTypePicker = false;
                  })

                  // 节点选择器
                  if (this.showToNodePicker) {
                    Column() {
                      ForEach(this.nodes, (node: Node, index?: number) => {
                        Row() {
                          Text(node.title)
                            .fontSize(14)
                            .fontColor('#333')
                            .layoutWeight(1)
                            .padding(12)
                          
                          if (node.id === this.relationForm.toNodeId) {
                            Text('✓')
                              .fontSize(14)
                              .fontColor('#52c41a')
                              .margin({ right: 12 })
                          }
                        }
                        .width('100%')
                        .backgroundColor(node.id === this.relationForm.toNodeId ? '#f0f9ff' : Color.White)
                        .border({ width: { bottom: 1 }, color: '#f0f0f0' })
                        .onClick(() => {
                          this.relationForm = {
                            fromNodeId: this.relationForm.fromNodeId,
                            toNodeId: node.id,
                            type: this.relationForm.type,
                            label: this.relationForm.label,
                            weight: this.relationForm.weight
                          };
                          this.showToNodePicker = false;
                        })
                      })
                    }
                    .width('100%')
                    .height(200)
                    .backgroundColor(Color.White)
                    .borderRadius(6)
                    .border({ width: 1, color: '#d9d9d9' })
                    .shadow({ radius: 4, color: '#1a000000' })
                    .margin({ top: 4 })
                    .zIndex(10)
                  }
                }
              }
            }

            // 关系类型
            Column({ space: 8 }) {
              Text('关系类型:')
                .fontSize(14)
                .fontColor('#333')
              
              Column() {
                // 显示当前选中的关系类型
                Row() {
                  Text(this.getRelationTypeLabel(this.relationForm.type))
                    .fontSize(14)
                    .fontColor('#333')
                    .layoutWeight(1)
                    .padding(10)
                  
                  Button('▼')
                    .fontSize(12)
                    .width(40)
                    .height(40)
                    .backgroundColor('#e8e8e8')
                    .fontColor('#666')
                    .onClick(() => {
                      this.showRelationTypePicker = !this.showRelationTypePicker;
                      this.showFromNodePicker = false;
                      this.showToNodePicker = false;
                    })
                }
                .width('100%')
                .height(40)
                .backgroundColor('#f5f5f5')
                .borderRadius(6)
                .onClick(() => {
                  this.showRelationTypePicker = !this.showRelationTypePicker;
                  this.showFromNodePicker = false;
                  this.showToNodePicker = false;
                })

                // 关系类型选择器
                if (this.showRelationTypePicker) {
                  Column() {
                    ForEach(this.relationTypes, (type: RelationType, index?: number) => {
                      Row() {
                        Text(this.getRelationTypeLabel(type))
                          .fontSize(14)
                          .fontColor('#333')
                          .layoutWeight(1)
                          .padding(12)
                        
                        if (type === this.relationForm.type) {
                          Text('✓')
                            .fontSize(14)
                            .fontColor('#52c41a')
                            .margin({ right: 12 })
                        }
                      }
                      .width('100%')
                      .backgroundColor(type === this.relationForm.type ? '#f0f9ff' : Color.White)
                      .border({ width: { bottom: 1 }, color: '#f0f0f0' })
                      .onClick(() => {
                        this.relationForm = {
                          fromNodeId: this.relationForm.fromNodeId,
                          toNodeId: this.relationForm.toNodeId,
                          type: type,
                          label: this.relationForm.label,
                          weight: this.relationForm.weight
                        };
                        this.showRelationTypePicker = false;
                      })
                    })
                  }
                  .width('100%')
                  .backgroundColor(Color.White)
                  .borderRadius(6)
                  .border({ width: 1, color: '#d9d9d9' })
                  .shadow({ radius: 4, color: '#1a000000' })
                  .margin({ top: 4 })
                  .zIndex(10)
                }
              }
            }

            // 权重
            Column({ space: 8 }) {
              Text('权重 (0-1):')
                .fontSize(14)
                .fontColor('#333')
              
              TextInput({ placeholder: '0.5' })
                .width('100%')
                .height(40)
                .fontSize(14)
                .backgroundColor('#f5f5f5')
                .borderRadius(6)
                .type(InputType.Number)
                .onChange((value: string) => {
                  let weight = parseFloat(value);
                  if (!isNaN(weight) && weight >= 0 && weight <= 1) {
                    this.relationForm.weight = weight;
                  }
                })
            }
          }
          .width('100%')
        }
        .width('100%')
        .layoutWeight(1)
        .margin({ bottom: 20 })

        // 操作按钮
        Row({ space: 12 }) {
          Button('取消')
            .width(100)
            .height(40)
            .backgroundColor('#f0f0f0')
            .fontColor('#666')
            .onClick(() => {
              this.showRelationForm = false;
              this.resetRelationForm();
            })

          Button('创建')
            .width(100)
            .height(40)
            .backgroundColor('#007dff')
            .fontColor(Color.White)
            .onClick(() => {
              this.handleCreateRelation();
            })
        }
      }
      .width('90%')
      .height('80%')
      .padding(20)
      .backgroundColor(Color.White)
      .borderRadius(12)
      .shadow({ radius: 10, color: '#1a000000' })
      .align(Alignment.Center)
    }
    .width('100%')
    .height('100%')
  }

  // --- 逻辑方法 ---

  // 获取图谱数据
  async fetchGraphData() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const responses = await Promise.all([
        this.graphController.listNodes(this.courseId),
        this.graphController.listRelations(this.courseId)
      ]);
      
      const nodesResponse = responses[0];
      const relationsResponse = responses[1];

      if (nodesResponse.success && nodesResponse.data) {
        this.nodes = nodesResponse.data;
      } else {
        this.errorMessage = nodesResponse.message || '获取节点失败';
        return;
      }

      if (relationsResponse.success && relationsResponse.data) {
        this.relations = relationsResponse.data;
      } else {
        this.errorMessage = relationsResponse.message || '获取关系失败';
        return;
      }
    } catch (error) {
      this.errorMessage = '获取知识图谱数据失败: ' + (error as Error).message;
      console.error('Error fetching graph data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // 创建节点
  async handleCreateNode() {
    console.log('开始创建节点，表单数据:', this.nodeForm);
    console.log('课程ID:', this.courseId);
    
    if (!this.nodeForm.title.trim()) {
      console.log('节点标题为空');
      promptAction.showToast({ message: '请输入节点标题' });
      return;
    }

    try {
      const nodeData: CreateNodeRequest = {
        title: this.nodeForm.title,
        label: this.nodeForm.title, // 使用标题作为标签
        type: this.nodeForm.type,
        content: this.nodeForm.content || undefined,
        position: { x: Math.random() * 800, y: Math.random() * 600 }
      };

      console.log('准备发送的节点数据:', nodeData);
      const result = await this.graphController.createNode(this.courseId, nodeData);
      console.log('创建节点结果:', result);
      
      if (result.success) {
        promptAction.showToast({ message: '节点创建成功' });
        this.showNodeForm = false;
        this.resetNodeForm();
        this.fetchGraphData();
      } else {
        console.log('创建节点失败:', result.message);
        promptAction.showToast({ message: result.message || '创建节点失败' });
      }
    } catch (error) {
      console.error('创建节点异常:', error);
      promptAction.showToast({ message: '创建节点时发生异常' });
    }
  }

  // 创建关系
  async handleCreateRelation() {
    if (!this.relationForm.fromNodeId || !this.relationForm.toNodeId) {
      promptAction.showToast({ message: '请选择起始和目标节点' });
      return;
    }

    if (this.relationForm.fromNodeId === this.relationForm.toNodeId) {
      promptAction.showToast({ message: '起始节点和目标节点不能相同' });
      return;
    }

    try {
      // 后端API期望的字段名是 from, to, type
      const relationData: ApiCreateRelationRequest = {
        from: this.relationForm.fromNodeId,
        to: this.relationForm.toNodeId,
        type: this.relationForm.type,
        label: this.relationForm.label || undefined,
        weight: this.relationForm.weight
      };

      const result = await this.graphController.createRelation(this.courseId, relationData);
      
      if (result.success) {
        promptAction.showToast({ message: '关系创建成功' });
        this.showRelationForm = false;
        this.resetRelationForm();
        this.fetchGraphData();
      } else {
        promptAction.showToast({ message: result.message || '创建关系失败' });
      }
    } catch (error) {
      promptAction.showToast({ message: '创建关系时发生异常' });
      console.error('Error creating relation:', error);
    }
  }

  // 删除节点
  async handleDeleteNode(nodeId: string) {
    try {
      const result = await promptAction.showDialog({
        title: '删除节点',
        message: '确定要删除这个节点吗？这可能会影响相关的关系。',
        buttons: [
          { text: '取消', color: '#666' },
          { text: '删除', color: '#ff0000' }
        ]
      });

      if (result.index === 1) {
        const deleteResult = await this.graphController.deleteNode(this.courseId, nodeId);
        
        if (deleteResult.success) {
          promptAction.showToast({ message: '节点删除成功' });
          if (this.selectedNode?.id === nodeId) {
            this.selectedNode = null;
          }
          this.fetchGraphData();
        } else {
          promptAction.showToast({ message: deleteResult.message || '删除节点失败' });
        }
      }
    } catch (error) {
      promptAction.showToast({ message: '删除节点时发生异常' });
      console.error('Error deleting node:', error);
    }
  }

  // 删除关系
  async handleDeleteRelation(relationId: string) {
    try {
      const result = await promptAction.showDialog({
        title: '删除关系',
        message: '确定要删除这个关系吗？',
        buttons: [
          { text: '取消', color: '#666' },
          { text: '删除', color: '#ff0000' }
        ]
      });

      if (result.index === 1) {
        const deleteResult = await this.graphController.deleteRelation(this.courseId, relationId);
        
        if (deleteResult.success) {
          promptAction.showToast({ message: '关系删除成功' });
          this.fetchGraphData();
        } else {
          promptAction.showToast({ message: deleteResult.message || '删除关系失败' });
        }
      }
    } catch (error) {
      promptAction.showToast({ message: '删除关系时发生异常' });
      console.error('Error deleting relation:', error);
    }
  }

  // 获取节点的入边关系
  getIncomingRelations(nodeId: string): Relation[] {
    return this.relations.filter(r => r.toNodeId === nodeId);
  }

  // 获取节点的出边关系
  getOutgoingRelations(nodeId: string): Relation[] {
    return this.relations.filter(r => r.fromNodeId === nodeId);
  }

  // 获取关系类型标签
  getRelationTypeLabel(type: RelationType): string {
    switch (type) {
      case RelationType.PREREQUISITE:
        return '前置知识';
      case RelationType.RELATED:
        return '相关概念';
      case RelationType.CONTAINS:
        return '包含关系';
      case RelationType.EXAMPLES:
        return '示例关系';
      default:
        return type;
    }
  }

  // 重置节点表单
  resetNodeForm() {
    this.nodeForm = {
      title: '',
      type: NodeType.CONCEPT,
      content: ''
    };
  }

  // 初始化关系表单
  initializeRelationForm() {
    console.log('initializeRelationForm - 节点数量:', this.nodes.length);
    console.log('initializeRelationForm - 节点数据:', this.nodes);
    
    // 直接创建新的表单对象，包含默认的节点选择
    if (this.nodes.length > 0) {
      const fromNodeId = this.nodes[0].id;
      const toNodeId = this.nodes.length > 1 ? this.nodes[1].id : this.nodes[0].id;
      
      console.log('设置默认节点 - from:', fromNodeId, 'to:', toNodeId);
      
      this.relationForm = {
        fromNodeId: fromNodeId,
        toNodeId: toNodeId,
        type: RelationType.RELATED,
        label: '',
        weight: 0.5
      };
      this.showFromNodePicker = false;
      this.showToNodePicker = false;
      this.showRelationTypePicker = false;
      
      console.log('表单初始化完成:', this.relationForm);
    } else {
      console.log('没有可用节点，重置表单');
      // 如果没有节点，重置为空表单
      this.relationForm = {
        fromNodeId: '',
        toNodeId: '',
        type: RelationType.RELATED,
        label: '',
        weight: 0.5
      };
      this.showFromNodePicker = false;
      this.showToNodePicker = false;
      this.showRelationTypePicker = false;
    }
  }

  // 重置关系表单
  resetRelationForm() {
    this.relationForm = {
      fromNodeId: '',
      toNodeId: '',
      type: RelationType.RELATED,
      label: '',
      weight: 0.5
    };
    this.showFromNodePicker = false;
    this.showToNodePicker = false;
    this.showRelationTypePicker = false;
  }
}