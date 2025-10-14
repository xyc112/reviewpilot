import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  List,
  Button,
  Input,
  Typography,
  Tag,
  Modal,
  Upload,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileTextOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { css } from "@emotion/react";
import { useAppStore } from "@/stores/appStore";
import { Note, KnowledgePoint } from "@/types/api";
// import { notesAPI } from "@/services/api";
import LoadingSpinner from "@/components/LoadingSpinner.tsx";
import EmptyState from "@/components/EmptyState.tsx";
import { formatDate } from "@/utils/helpers";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

const notesStyles = {
  container: css`
    padding: 24px;
  `,
  section: css`
    margin-bottom: 24px;
  `,
  card: css`
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `,
  noteItem: css`
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    &:last-child {
      border-bottom: none;
    }
  `,
  editor: css`
    .ant-card-body {
      padding: 0;
    }
  `,
  textArea: css`
    border: none;
    border-radius: 0;
    resize: none;
    min-height: 300px;
    padding: 16px;
    &:focus {
      box-shadow: none;
    }
  `,
  attachmentList: css`
    margin-top: 16px;
    .ant-list-item {
      padding: 8px 0;
    }
  `,
};

const NotesManagement: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<KnowledgePoint | null>(
    null,
  );
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(true);
  const { currentCourse } = useAppStore();

  useEffect(() => {
    fetchNotesData();
  }, [currentCourse]);

  const fetchNotesData = async () => {
    setLoading(true);
    try {
      // 模拟数据
      const mockKnowledgePoints: KnowledgePoint[] = [
        {
          id: "1",
          name: "面向对象编程",
          type: "knowledgePoint",
          description: "面向对象的基本概念和原则",
          masteryLevel: "medium",
          masteryScore: 65,
          questionCount: 15,
          difficulty: "MEDIUM",
          estimatedStudyTime: 120,
        },
        {
          id: "2",
          name: "设计模式",
          type: "knowledgePoint",
          description: "常见设计模式的应用",
          masteryLevel: "weak",
          masteryScore: 45,
          questionCount: 10,
          difficulty: "HARD",
          estimatedStudyTime: 180,
        },
      ];

      const mockNotes: Note[] = [
        {
          noteId: 1,
          pointId: 1,
          content:
            "面向对象编程的四大特性：封装、继承、多态、抽象。封装可以隐藏实现细节，提高代码安全性。",
          attachments: [
            {
              fileId: 1,
              fileName: "oop_concepts.pdf",
              fileUrl: "/files/1.pdf",
              fileSize: 1024000,
              mimeType: "application/pdf",
            },
          ],
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        },
      ];

      setKnowledgePoints(mockKnowledgePoints);
      setNotes(mockNotes);
      setSelectedPoint(mockKnowledgePoints[0]);
    } catch (error) {
      console.error("获取笔记数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPoint = (point: KnowledgePoint) => {
    setSelectedPoint(point);
    const existingNote = notes.find(
      (note) => note.pointId === parseInt(point.id),
    );
    if (existingNote) {
      setEditingNote(existingNote);
      setNoteContent(existingNote.content);
    } else {
      setEditingNote(null);
      setNoteContent("");
    }
  };

  const handleSaveNote = async () => {
    if (!selectedPoint) return;

    try {
      if (editingNote) {
        // 更新笔记
        const updatedNote = { ...editingNote, content: noteContent };
        setNotes(
          notes.map((note) =>
            note.noteId === editingNote.noteId ? updatedNote : note,
          ),
        );
        message.success("笔记更新成功");
      } else {
        // 创建新笔记
        const newNote: Note = {
          noteId: Date.now(),
          pointId: parseInt(selectedPoint.id),
          content: noteContent,
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setNotes([...notes, newNote]);
        setEditingNote(newNote);
        message.success("笔记创建成功");
      }
    } catch (error) {
      message.error("保存笔记失败");
    }
  };

  const handleDeleteNote = (note: Note) => {
    confirm({
      title: "确认删除",
      content: "确定要删除这条笔记吗？",
      onOk: () => {
        setNotes(notes.filter((n) => n.noteId !== note.noteId));
        if (editingNote?.noteId === note.noteId) {
          setEditingNote(null);
          setNoteContent("");
        }
        message.success("笔记删除成功");
      },
    });
  };

  const handleFileUpload = (info: any) => {
    if (info.file.status === "done") {
      message.success("文件上传成功");
      // 这里处理文件上传成功后的逻辑
    }
  };

  if (loading) {
    return <LoadingSpinner tip="加载笔记数据..." />;
  }

  return (
    <div css={notesStyles.container}>
      <Title level={2}>笔记管理</Title>

      <Row gutter={[16, 16]}>
        {/* 知识点列表 */}
        <Col xs={24} lg={8}>
          <Card
            title="知识点列表"
            css={notesStyles.card}
            extra={
              <Button type="primary" icon={<PlusOutlined />} size="small">
                新建
              </Button>
            }
          >
            <List
              dataSource={knowledgePoints}
              renderItem={(point) => (
                <List.Item
                  css={notesStyles.noteItem}
                  style={{
                    background:
                      selectedPoint?.id === point.id
                        ? "#f0f8ff"
                        : "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSelectPoint(point)}
                >
                  <List.Item.Meta
                    avatar={<FileTextOutlined />}
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text strong>{point.name}</Text>
                        <Tag
                          color={
                            point.masteryLevel === "strong"
                              ? "green"
                              : point.masteryLevel === "medium"
                                ? "orange"
                                : "red"
                          }
                        >
                          {point.masteryLevel === "strong"
                            ? "掌握"
                            : point.masteryLevel === "medium"
                              ? "一般"
                              : "薄弱"}
                        </Tag>
                      </div>
                    }
                    description={
                      <Text type="secondary" ellipsis>
                        {point.description}
                      </Text>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: "暂无知识点" }}
            />
          </Card>
        </Col>

        {/* 笔记编辑器 */}
        <Col xs={24} lg={16}>
          <Card
            title={
              selectedPoint
                ? `笔记编辑 - ${selectedPoint.name}`
                : "选择知识点开始编辑"
            }
            css={notesStyles.card}
            extra={
              selectedPoint && (
                <Button
                  type="primary"
                  onClick={handleSaveNote}
                  disabled={!noteContent.trim()}
                >
                  保存笔记
                </Button>
              )
            }
          >
            {selectedPoint ? (
              <div css={notesStyles.editor}>
                <TextArea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="开始记录你的学习笔记..."
                  css={notesStyles.textArea}
                  autoSize={{ minRows: 15 }}
                />

                {/* 附件管理 */}
                <div
                  style={{ padding: "16px", borderTop: "1px solid #f0f0f0" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Text strong>
                      <PaperClipOutlined /> 附件
                    </Text>
                    <Upload
                      action="/api/files/upload"
                      onChange={handleFileUpload}
                      showUploadList={false}
                    >
                      <Button size="small" icon={<PlusOutlined />}>
                        添加附件
                      </Button>
                    </Upload>
                  </div>

                  {editingNote?.attachments &&
                    editingNote.attachments.length > 0 && (
                      <List
                        size="small"
                        dataSource={editingNote.attachments}
                        css={notesStyles.attachmentList}
                        renderItem={(attachment) => (
                          <List.Item
                            actions={[
                              <Button
                                type="link"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                              >
                                删除
                              </Button>,
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<PaperClipOutlined />}
                              title={
                                <a
                                  href={attachment.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {attachment.fileName}
                                </a>
                              }
                              description={`${(attachment.fileSize / 1024 / 1024).toFixed(2)} MB`}
                            />
                          </List.Item>
                        )}
                      />
                    )}
                </div>
              </div>
            ) : (
              <EmptyState
                title="选择知识点"
                description="请从左侧选择一个知识点开始编辑笔记"
              />
            )}
          </Card>

          {/* 历史笔记 */}
          {notes.filter(
            (note) => note.pointId === parseInt(selectedPoint?.id || "0"),
          ).length > 0 && (
            <Card
              title="历史笔记"
              css={notesStyles.card}
              style={{ marginTop: 16 }}
            >
              <List
                dataSource={notes.filter(
                  (note) => note.pointId === parseInt(selectedPoint?.id || "0"),
                )}
                renderItem={(note) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingNote(note);
                          setNoteContent(note.content);
                        }}
                      >
                        编辑
                      </Button>,
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteNote(note)}
                      >
                        删除
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={`笔记版本 ${formatDate(note.updatedAt, "MM-DD HH:mm")}`}
                      description={
                        <div>
                          <Text>{note.content}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            最后更新: {formatDate(note.updatedAt)}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default NotesManagement;
