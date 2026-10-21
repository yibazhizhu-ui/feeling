export const SNAP_ZONE = 5;
export function snapMood(value) {
  const n = Math.max(-100, Math.min(100, Math.round(Number(value) || 0)));
  return Math.abs(n) <= SNAP_ZONE ? 0 : n;
}
export function moodDetails(value) {
  if (value < -65) return { name: '失落', description: '没关系，低落的日子也值得被温柔对待', color: '#919eaf' };
  if (value < -25) return { name: '有些低落', description: '允许自己，暂时做一朵小小的阴云', color: '#a7b0b4' };
  if (value < 0) return { name: '有一点阴天', description: '不用急着放晴，慢慢来就好', color: '#b9bcb0' };
  if (value === 0) return { name: '平静', description: '不偏不倚，也是一种很好的状态', color: '#cec18b' };
  if (value <= 25) return { name: '有一点晴朗', description: '有一点小小的光，落在心上', color: '#d7c58b' };
  if (value <= 65) return { name: '有些开心', description: '把这一点暖意，轻轻收进口袋', color: '#ddbc78' };
  return { name: '喜悦', description: '今天的心里，有一片明亮的阳光', color: '#e0ac63' };
}
export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
