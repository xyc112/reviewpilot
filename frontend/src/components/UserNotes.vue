<template>
  <el-dialog
      v-model="showDialog"
      :title="`学习笔记 - ${props.point?.name}`"
      width="800px"
      @close="handleClose"
  >
    <div class="user-notes">
      <div class="notes-editor">
        <el-input
            v-model="noteContent"
            type="textarea"
            :rows="8"
            placeholder="记录你的学习笔记..."
            resize="none"
        />
      </div>

      <div class="attachments mt-20">
        <h4>附件列表</h4>
        <div v-if="attachments.length > 0" class="attachment-list">
          <div
              v-for="file in attachments"
              :key="file.id"
              class="attachment-item"
          >
            <el-icon><Document /></el-icon>
            <span class="file-name">{{ file.fileName }}</span>
            <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
            <el-button type="danger" link @click="removeAttachment(file.id)">
              删除
            </el-button>
          </div>
        </div>
        <el-empty v-else description="暂无附件" :image-size="60" />
      </div>

      <div class="notes-actions mt-20">
        <el-button type="primary" @click="saveNote">
          保存笔记
        </el-button>
        <el-button @click="handleClose">
          取消
        </el-button>
        <el-upload
            action="#"
            :show-file-list="false"
            :before-upload="beforeUpload"
            class="upload-btn"
        >
          <el-button type="success">
            <el-icon><Upload /></el-icon>
            上传附件
          </el-button>
        </el-upload>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppStore } from '../stores/app'
import { Document, Upload } from '@element-plus/icons-vue'
import type { UserNote } from '../types'

interface Props {
  point: any
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false
})

const emit = defineEmits<{
  close: []
}>()

const store = useAppStore()
const noteContent = ref('')
const attachments = ref<Array<{ id: number; fileName: string; fileSize: number }>>([])

const showDialog = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) {
      handleClose()
    }
  }
})

// 加载现有笔记
watch(() => props.point, (point) => {
  if (point) {
    const existingNote = store.userNotes.find(note =>
        note.content.includes(point.name)
    )
    noteContent.value = existingNote?.content || ''
    attachments.value = existingNote?.attachments || []
  }
}, { immediate: true })

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const beforeUpload = (file: File) => {
  attachments.value.push({
    id: Date.now(),
    fileName: file.name,
    fileSize: file.size
  })
  ElMessage.success(`文件 ${file.name} 已添加`)
  return false // 阻止自动上传
}

const removeAttachment = (fileId: number) => {
  attachments.value = attachments.value.filter(file => file.id !== fileId)
}

const saveNote = () => {
  if (!props.point) return

  // const newNote: UserNote = {
  //   noteId: Date.now(),
  //   content: noteContent.value,
  //   attachments: attachments.value,
  //   lastModified: new Date().toISOString()
  // }

  // 这里应该调用API保存笔记
  ElMessage.success('笔记保存成功')
  handleClose()
}

const handleClose = () => {
  noteContent.value = ''
  attachments.value = []
  emit('close')
}
</script>

<style scoped>
.attachment-list {
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  padding: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin: 5px 0;
  background: #f5f7fa;
  border-radius: 4px;
}

.attachment-item .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.file-name {
  flex: 1;
  margin-right: 10px;
}

.file-size {
  margin-right: 10px;
  color: #909399;
  font-size: 12px;
}

.notes-actions {
  display: flex;
  gap: 10px;
}

.upload-btn {
  margin-left: auto;
}

.mt-20 {
  margin-top: 20px;
}
</style>