/**
 * 宠物品种数据配置
 * 根据宠物类型提供对应的品种列表
 */

/** 宠物类型 */
export type PetSpecies = 'cat' | 'dog' | 'bird' | 'other';

/** 品种配置接口 */
interface BreedConfig {
  label: string;
  popular?: boolean; // 是否为热门品种
}

/**
 * 猫咪品种列表
 */
export const CAT_BREEDS: BreedConfig[] = [
  { label: '英国短毛猫', popular: true },
  { label: '美国短毛猫', popular: true },
  { label: '布偶猫', popular: true },
  { label: '暹罗猫', popular: true },
  { label: '波斯猫', popular: true },
  { label: '缅因猫', popular: true },
  { label: '苏格兰折耳猫' },
  { label: '加菲猫（异国短毛猫）' },
  { label: '金渐层' },
  { label: '银渐层' },
  { label: '橘猫' },
  { label: '狸花猫' },
  { label: '三花猫' },
  { label: '奶牛猫' },
  { label: '俄罗斯蓝猫' },
  { label: '孟加拉豹猫' },
  { label: '无毛猫（斯芬克斯）' },
  { label: '挪威森林猫' },
  { label: '土耳其安哥拉猫' },
  { label: '其他' },
];

/**
 * 狗狗品种列表
 */
export const DOG_BREEDS: BreedConfig[] = [
  { label: '金毛寻回犬', popular: true },
  { label: '拉布拉多', popular: true },
  { label: '哈士奇', popular: true },
  { label: '柯基', popular: true },
  { label: '泰迪（贵宾犬）', popular: true },
  { label: '萨摩耶', popular: true },
  { label: '边境牧羊犬' },
  { label: '德国牧羊犬' },
  { label: '柴犬' },
  { label: '秋田犬' },
  { label: '比熊' },
  { label: '博美' },
  { label: '吉娃娃' },
  { label: '雪纳瑞' },
  { label: '法国斗牛犬' },
  { label: '英国斗牛犬' },
  { label: '阿拉斯加' },
  { label: '松狮' },
  { label: '巴哥' },
  { label: '约克夏' },
  { label: '杜宾犬' },
  { label: '罗威纳' },
  { label: '中华田园犬' },
  { label: '其他' },
];

/**
 * 鸟类品种列表
 */
export const BIRD_BREEDS: BreedConfig[] = [
  { label: '虎皮鹦鹉', popular: true },
  { label: '玄凤鹦鹉', popular: true },
  { label: '牡丹鹦鹉', popular: true },
  { label: '文鸟' },
  { label: '金丝雀' },
  { label: '八哥' },
  { label: '画眉' },
  { label: '相思鸟' },
  { label: '珍珠鸟' },
  { label: '其他' },
];

/**
 * 其他宠物品种列表
 */
export const OTHER_BREEDS: BreedConfig[] = [
  { label: '仓鼠' },
  { label: '兔子' },
  { label: '龙猫' },
  { label: '荷兰猪（豚鼠）' },
  { label: '刺猬' },
  { label: '乌龟' },
  { label: '金鱼' },
  { label: '热带鱼' },
  { label: '其他' },
];

/**
 * 根据宠物类型获取品种列表
 * @param species 宠物类型
 * @returns 品种列表
 */
export function getBreedsBySpecies(species: PetSpecies): BreedConfig[] {
  switch (species) {
    case 'cat':
      return CAT_BREEDS;
    case 'dog':
      return DOG_BREEDS;
    case 'bird':
      return BIRD_BREEDS;
    case 'other':
      return OTHER_BREEDS;
    default:
      return [];
  }
}

/**
 * 获取热门品种列表
 * @param species 宠物类型
 * @returns 热门品种列表
 */
export function getPopularBreeds(species: PetSpecies): string[] {
  const breeds = getBreedsBySpecies(species);
  return breeds.filter((b) => b.popular).map((b) => b.label);
}
