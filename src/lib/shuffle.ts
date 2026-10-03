/**
 * Перемешивание по алгоритму Фишера–Йетса (без статистического смещения).
 * Возвращает новый массив — исходный не мутируется.
 */
export const shuffleArray = <T>(list: T[]): T[] => {
  const result = list.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
