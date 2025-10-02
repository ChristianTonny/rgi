export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) {
    console.warn('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        return stringValue.includes(',') || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue
      })
      .join(',')
  )

  const csvContent = [headers.join(','), ...rows].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportToJSON(data: unknown[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}


