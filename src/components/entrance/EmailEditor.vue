<script setup lang="ts">
import { ref } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import InputPrompt from './InputPrompt.vue'

const emit = defineEmits<{
    (e: 'close'): void
}>()

const email_subject = ref('')
const attachments = ref<File[]>([])

// 提示弹窗状态
const prompt_state = ref<{
    show: boolean
    title: string
    placeholder: string
    callback: ((value: string) => void) | null
}>({
    show: false,
    title: '',
    placeholder: '',
    callback: null
})

// 图片选择菜单状态
const show_image_menu = ref(false)

// TipTap 编辑器
const editor = useEditor({
    extensions: [
        StarterKit,
        Link.configure({ openOnClick: false }),
        Image,
        Underline,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({ placeholder: '请输入邮件内容...' })
    ],
    editorProps: {
        attributes: {
            class: 'w-full min-h-[120px] max-h-[200px] px-4 py-2 text-base rounded-lg border border-gray-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:outline-none transition-all overflow-y-auto bg-white max-w-none'
        }
    }
})

// 工具栏按钮状态
function is_active(type: string): boolean {
    if (!editor.value) return false
    return editor.value.isActive(type)
}

function is_text_align(align: string): boolean {
    if (!editor.value) return false
    // 检查是否有设置任何对齐方式
    const has_center = editor.value.isActive({ textAlign: 'center' })
    const has_right = editor.value.isActive({ textAlign: 'right' })
    const has_justify = editor.value.isActive({ textAlign: 'justify' })

    // 左对齐是默认状态：当没有其他对齐方式时，左对齐激活
    if (align === 'left') {
        return !has_center && !has_right && !has_justify
    }

    return editor.value.isActive({ textAlign: align })
}

// 显示提示弹窗
function show_prompt(title: string, placeholder: string, callback: (value: string) => void) {
    prompt_state.value = { show: true, title, placeholder, callback }
}

function handle_prompt_confirm(value: string) {
    if (prompt_state.value.callback && value) {
        prompt_state.value.callback(value)
    }
    prompt_state.value.show = false
}

function handle_prompt_cancel() {
    prompt_state.value.show = false
}

function insert_link() {
    const previous_url = editor.value?.getAttributes('link').href as string | undefined
    show_prompt('插入链接', previous_url || '请输入链接地址', (url) => {
        editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    })
}

function toggle_image_menu() {
    show_image_menu.value = !show_image_menu.value
}

function upload_local_image() {
    show_image_menu.value = false
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return
        handle_image_file(file)
    }
    input.click()
}

function input_image_url() {
    show_image_menu.value = false
    show_prompt('插入图片', '请输入图片地址', (url) => {
        editor.value?.chain().focus().setImage({ src: url }).run()
    })
}

function handle_image_file(file: File) {
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
        const base64 = e.target?.result as string
        editor.value?.chain().focus().setImage({ src: base64 }).run()
    }
    reader.readAsDataURL(file)
}

function handle_attach(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.files) {
        attachments.value = [...attachments.value, ...Array.from(target.files)]
    }
}

function remove_attachment(index: number) {
    attachments.value.splice(index, 1)
}

function handle_send() {
    const content = editor.value?.getHTML() || ''
    // TODO: 实现发送邮件逻辑
    const _email_data = {
        subject: email_subject.value,
        content,
        attachments: attachments.value
    }
    emit('close')
}
</script>

<template>
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-[100]" @click.self="emit('close'); show_image_menu = false">
        <div class="flex flex-col gap-4 p-6 rounded-2xl backdrop-blur-md bg-white/95 border border-white/30 w-[480px] max-w-[90vw] max-h-[85vh] overflow-hidden">
            <!-- 标题 -->
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-800">邮件编辑器</h3>
                <button @click="emit('close')" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
                    <div class="i-lucide-x w-6 h-6 text-gray-600" />
                </button>
            </div>

            <!-- 主题 -->
            <input
                v-model="email_subject"
                type="text"
                placeholder="邮件主题"
                class="w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all"
            />

            <!-- 富文本工具栏 -->
            <div class="flex items-center gap-1 p-2 rounded-lg bg-gray-100 border border-gray-200">
                <button
                    @click="editor?.chain().focus().toggleBold().run()"
                    class="w-9 h-9 flex items-center justify-center rounded transition-colors"
                    :class="is_active('bold') ? 'bg-[var(--c-primary-bg)] text-[var(--c-primary)]' : 'hover:bg-gray-200 text-gray-700'"
                    title="加粗"
                >
                    <div class="i-lucide-bold w-5 h-5" />
                </button>
                <button
                    @click="editor?.chain().focus().toggleItalic().run()"
                    class="w-9 h-9 flex items-center justify-center rounded transition-colors"
                    :class="is_active('italic') ? 'bg-[var(--c-primary-bg)] text-[var(--c-primary)]' : 'hover:bg-gray-200 text-gray-700'"
                    title="斜体"
                >
                    <div class="i-lucide-italic w-5 h-5" />
                </button>
                <button
                    @click="editor?.chain().focus().toggleUnderline().run()"
                    class="w-9 h-9 flex items-center justify-center rounded transition-colors"
                    :class="is_active('underline') ? 'bg-[var(--c-primary-bg)] text-[var(--c-primary)]' : 'hover:bg-gray-200 text-gray-700'"
                    title="下划线"
                >
                    <div class="i-lucide-underline w-5 h-5" />
                </button>
                <button
                    @click="editor?.chain().focus().toggleStrike().run()"
                    class="w-9 h-9 flex items-center justify-center rounded transition-colors"
                    :class="is_active('strike') ? 'bg-[var(--c-primary-bg)] text-[var(--c-primary)]' : 'hover:bg-gray-200 text-gray-700'"
                    title="删除线"
                >
                    <div class="i-lucide-strikethrough w-5 h-5" />
                </button>
                <div class="w-px h-6 bg-gray-300 mx-1" />
                <button
                    @click="insert_link"
                    class="w-9 h-9 flex items-center justify-center rounded hover:bg-gray-200 transition-colors text-gray-700"
                    :class="is_active('link') ? 'bg-[var(--c-primary-bg)] text-[var(--c-primary)]' : ''"
                    title="插入链接"
                >
                    <div class="i-lucide-link w-5 h-5" />
                </button>
                <div class="relative">
                    <button
                        @click="toggle_image_menu"
                        class="w-9 h-9 flex items-center justify-center rounded hover:bg-gray-200 transition-colors text-gray-700"
                        title="插入图片"
                    >
                        <div class="i-lucide-image w-5 h-5" />
                    </button>
                    <!-- 图片选择菜单 -->
                    <div v-if="show_image_menu" class="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-32" @click.stop>
                        <button @click="upload_local_image" class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                            <div class="i-lucide-upload w-4 h-4" />
                            本地图片
                        </button>
                        <button @click="input_image_url" class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                            <div class="i-lucide-link w-4 h-4" />
                            图片地址
                        </button>
                    </div>
                </div>
                <div class="w-px h-6 bg-gray-300 mx-1" />
                <button
                    @click="editor?.chain().focus().setTextAlign('left').run()"
                    class="w-9 h-9 flex items-center justify-center rounded transition-colors"
                    :class="is_text_align('left') ? 'bg-[var(--c-primary-bg)] text-[var(--c-primary)]' : 'hover:bg-gray-200 text-gray-700'"
                    title="左对齐"
                >
                    <div class="i-lucide-align-left w-5 h-5" />
                </button>
                <button
                    @click="editor?.chain().focus().setTextAlign('center').run()"
                    class="w-9 h-9 flex items-center justify-center rounded transition-colors"
                    :class="is_text_align('center') ? 'bg-[var(--c-primary-bg)] text-[var(--c-primary)]' : 'hover:bg-gray-200 text-gray-700'"
                    title="居中"
                >
                    <div class="i-lucide-align-center w-5 h-5" />
                </button>
                <button
                    @click="editor?.chain().focus().setTextAlign('right').run()"
                    class="w-9 h-9 flex items-center justify-center rounded transition-colors"
                    :class="is_text_align('right') ? 'bg-[var(--c-primary-bg)] text-[var(--c-primary)]' : 'hover:bg-gray-200 text-gray-700'"
                    title="右对齐"
                >
                    <div class="i-lucide-align-right w-5 h-5" />
                </button>
                <div class="w-px h-6 bg-gray-300 mx-1" />
                <button
                    @click="editor?.chain().focus().toggleBulletList().run()"
                    class="w-9 h-9 flex items-center justify-center rounded transition-colors"
                    :class="is_active('bulletList') ? 'bg-[var(--c-primary-bg)] text-[var(--c-primary)]' : 'hover:bg-gray-200 text-gray-700'"
                    title="无序列表"
                >
                    <div class="i-lucide-list w-5 h-5" />
                </button>
                <button
                    @click="editor?.chain().focus().toggleOrderedList().run()"
                    class="w-9 h-9 flex items-center justify-center rounded transition-colors"
                    :class="is_active('orderedList') ? 'bg-[var(--c-primary-bg)] text-[var(--c-primary)]' : 'hover:bg-gray-200 text-gray-700'"
                    title="有序列表"
                >
                    <div class="i-lucide-list-ordered w-5 h-5" />
                </button>
            </div>

            <!-- 富文本编辑区 -->
            <div @click="show_image_menu = false">
                <EditorContent :editor="editor" />
            </div>

            <!-- 附件列表 -->
            <div v-if="attachments.length > 0" class="flex flex-col gap-2 max-h-24 overflow-y-auto">
                <div v-for="(file, index) in attachments" :key="file.name + index" class="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100">
                    <div class="flex items-center gap-2">
                        <div class="i-lucide-file w-4 h-4 text-gray-500" />
                        <span class="text-sm text-gray-600 truncate max-w-[200px]">{{ file.name }}</span>
                        <span class="text-xs text-gray-400">{{ (file.size / 1024).toFixed(1) }}KB</span>
                    </div>
                    <button @click="remove_attachment(index)" class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200">
                        <div class="i-lucide-x w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-3 pt-2">
                <label class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                    <div class="i-lucide-paperclip w-5 h-5 text-gray-600" />
                    <span class="text-sm text-gray-600">添加附件</span>
                    <input type="file" multiple class="hidden" @change="handle_attach" />
                </label>
                <button @click="handle_send" class="flex-1 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[var(--c-primary)] to-[var(--c-secondary)] text-white font-medium transition-all hover:shadow-lg hover:shadow-[var(--c-primary)]/20">
                    发送邮件
                </button>
            </div>
        </div>

        <!-- 提示弹窗 -->
        <input-prompt
            v-if="prompt_state.show"
            :title="prompt_state.title"
            :placeholder="prompt_state.placeholder"
            @confirm="handle_prompt_confirm"
            @cancel="handle_prompt_cancel"
        />
    </div>
</template>

<style>
.tiptap {
    line-height: 1.5;
}

.tiptap p {
    margin: 0;
    line-height: 1.5;
}

.tiptap p.is-editor-empty:first-child::before {
    color: #9ca3af;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
}

.tiptap ul,
.tiptap ol {
    padding-left: 1.5rem;
    margin: 0;
}

.tiptap ul {
    list-style-type: disc;
}

.tiptap ol {
    list-style-type: decimal;
}
</style>