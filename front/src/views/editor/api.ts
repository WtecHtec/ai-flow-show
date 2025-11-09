import http from '@/utils/http';

// 保存 data（返回 { json_id, temp_id }）
export function apiSaveTemp(data: any) {
  return http.post('/save_temp', { data }) as Promise<{ temp_id: string }>;
}

// 根据 json_id 获取完整 JSON
export function apiGetByJsonId(json_id: string) {
  return http.get(`/json/${json_id}`) as Promise<{ json_id: string; temp_id: string; data: any }>;
}

// 根据 json_id 获取 temp_id
export function apiGetTempByJsonId(json_id: string) {
  return http.get(`/api/instances/template/${json_id}`) as Promise<{ temp_id: string }>;
}

// 根据 temp_id 获取完整 JSON
export function apiGetByTempId(temp_id: string) {
  return http.get(`/by-temp/${temp_id}`) as Promise<{ json_id: string; temp_id: string; data: any }>;
}

// ========== 模板相关 API ==========

// 获取模板详情
export function apiGetTemplate(temp_id: string) {
  return http.get(`/api/templates/${temp_id}`) as Promise<{ template: any }>;
}

// 更新模板
export function apiUpdateTemplate(temp_id: string, data: { name?: string; description?: string; schema_data: any }) {
  return http.put(`/api/templates/${temp_id}`, data) as Promise<{ message: string }>;
}

// 创建模板
export function apiCreateTemplate(data: { name: string; description?: string; schema_data: any }) {
  return http.post('/api/templates', data) as Promise<{ message: string; temp_id: string }>;
}