/**
 * 邮件相关 API
 * 基于后端 API 接口文档 v1
 *
 * 注意：邮件发送需要管理员权限，用于防止滥用
 */
import { post } from './request'
import type { EmailData } from './types'

// 发送邮件（需要管理员权限）
export function send_email(data: EmailData): Promise<void> {
    return post('/admin/email', data)
}