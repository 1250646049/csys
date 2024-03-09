// 计算两个时间的差值
export function calculateTimeDifference(startTime, endTime) {
  // 将时间字符串转换为 Date 对象
  var endDateTime = new Date()
  if (!endTime) {
    endDateTime = new Date(endTime)
  }
  const startDateTime = new Date(startTime)

  // 计算时间差（毫秒）
  const timeDifferenceMs = endDateTime - startDateTime

  // 计算时、分、秒
  const seconds = Math.floor((timeDifferenceMs / 1000) % 60)
  const minutes = Math.floor((timeDifferenceMs / (1000 * 60)) % 60)
  const hours = Math.floor((timeDifferenceMs / (1000 * 60 * 60)) % 24)
  const days = Math.floor(timeDifferenceMs / (1000 * 60 * 60 * 24))

  // 返回一个包含时、分、秒的对象
  return {
    days,
    hours,
    minutes,
    seconds
  }
}
