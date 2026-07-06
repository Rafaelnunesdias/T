export const getDateRange = (period, start, end) => {
  const now = new Date()
  let from = new Date(0)
  let to = now
  if (period === 'today') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  } else if (period === '7d') {
    from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (period === '30d') {
    from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  } else if (period === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1)
    to = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  } else if (period === 'custom') {
    if (start) from = new Date(start)
    if (end) to = new Date(end)
  }
  return { from: from.toISOString(), to: to.toISOString() }
}

export const aggregate = (rows, key, aggFn) => {
  const map = {}
  rows.forEach(r => {
    const k = r[key]
    if (!map[k]) map[k] = []
    map[k].push(r)
  })
  return Object.entries(map).map(([k, items]) => ({ key: k, ...aggFn(items) }))
}
