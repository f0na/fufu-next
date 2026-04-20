import type { BangumiRecord, BangumiStatus } from './types/bangumi'

const STORAGE_KEY = 'bangumi_records'

// 抽象存储接口，便于后续切换到后端 API
export interface BangumiRecordStorage {
  get_all(): Promise<BangumiRecord[]>
  get_by_id(id: string): Promise<BangumiRecord | null>
  get_by_subject_id(subject_id: number): Promise<BangumiRecord | null>
  add(record: BangumiRecord): Promise<void>
  update(id: string, updates: Partial<BangumiRecord>): Promise<void>
  delete(id: string): Promise<void>
  get_by_status(status: BangumiStatus): Promise<BangumiRecord[]>
}

// localStorage 实现
export class LocalStorageImpl implements BangumiRecordStorage {
  private get_records(): BangumiRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  private save_records(records: BangumiRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }

  async get_all(): Promise<BangumiRecord[]> {
    return this.get_records()
  }

  async get_by_id(id: string): Promise<BangumiRecord | null> {
    const records = this.get_records()
    return records.find(r => r.id === id) ?? null
  }

  async get_by_subject_id(subject_id: number): Promise<BangumiRecord | null> {
    const records = this.get_records()
    return records.find(r => r.subject_id === subject_id) ?? null
  }

  async add(record: BangumiRecord): Promise<void> {
    const records = this.get_records()
    // 检查是否已存在
    const existing = records.find(r => r.subject_id === record.subject_id)
    if (existing) {
      // 更新现有记录
      Object.assign(existing, record)
    } else {
      records.push(record)
    }
    this.save_records(records)
  }

  async update(id: string, updates: Partial<BangumiRecord>): Promise<void> {
    const records = this.get_records()
    const index = records.findIndex(r => r.id === id)
    if (index !== -1) {
      records[index] = { ...records[index], ...updates }
      this.save_records(records)
    }
  }

  async delete(id: string): Promise<void> {
    const records = this.get_records()
    const filtered = records.filter(r => r.id !== id)
    this.save_records(filtered)
  }

  async get_by_status(status: BangumiStatus): Promise<BangumiRecord[]> {
    const records = this.get_records()
    return records.filter(r => r.status === status)
  }
}

// 默认使用 localStorage
let storage_instance: BangumiRecordStorage = new LocalStorageImpl()

// 获取存储实例
export function get_storage(): BangumiRecordStorage {
  return storage_instance
}

// 设置存储实例（用于切换到后端 API）
export function set_storage(storage: BangumiRecordStorage): void {
  storage_instance = storage
}

// 生成唯一 ID
export function generate_id(): string {
  return `bangumi_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}