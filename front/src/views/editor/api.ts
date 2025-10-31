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
  return http.get(`/temp/${json_id}`) as Promise<{ temp_id: string }>;
}

// 根据 temp_id 获取完整 JSON
export function apiGetByTempId(temp_id: string) {
  return http.get(`/by-temp/${temp_id}`) as Promise<{ json_id: string; temp_id: string; data: any }>;
}