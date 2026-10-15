const encoder = new TextEncoder()

const summaryFields = [
  ['period', 'Period'],
  ['transaction_count', 'Transactions'],
  ['paid_diamonds', 'Paid Diamonds'],
  ['net_paid_diamonds', 'Net Paid Diamonds'],
  ['author_earned_diamonds', 'Author Diamonds'],
  ['platform_earned_diamonds', 'Platform Diamonds'],
  ['author_earnings_usd', 'Author Earned USD'],
  ['platform_income_usd', 'Platform Earned USD'],
  ['author_net_payout_usd', 'Author Net Payout USD'],
  ['pending_payout_usd', 'Pending Payout USD'],
  ['withholding_amount_usd', 'Withholding USD'],
]

const detailFields = [
  ['created_at', 'Date'],
  ['reader_name', 'Reader'],
  ['reader_username', 'Reader Username'],
  ['reader_email', 'Reader Email'],
  ['story_title', 'Story'],
  ['episode_number', 'Episode'],
  ['paid_diamonds', 'Paid Diamonds'],
  ['net_paid_diamonds', 'Net Paid Diamonds'],
  ['author_share_percent', 'Author Share %'],
  ['author_earned_diamonds', 'Author Diamonds'],
  ['platform_earned_diamonds', 'Platform Diamonds'],
  ['author_earnings_usd', 'Author Earned USD'],
  ['platform_income_usd', 'Platform Earned USD'],
  ['author_net_payout_usd', 'Author Net Payout USD'],
  ['earning_status', 'Status'],
  ['share_source', 'Share Source'],
  ['transaction_reference', 'Transaction Ref'],
]

const summaryPrintFields = ['period', 'transaction_count', 'paid_diamonds', 'author_earned_diamonds', 'platform_earned_diamonds', 'author_earnings_usd', 'author_net_payout_usd']
const detailPrintFields = ['created_at', 'story_title', 'reader_name', 'paid_diamonds', 'author_earned_diamonds', 'platform_earned_diamonds', 'author_net_payout_usd']

function escapeXml(input) {
  return String(input ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function dateTime(input) {
  if (!input) return ''
  const date = new Date(input)
  if (!Number.isFinite(date.getTime())) return String(input)
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Phnom_Penh', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date)
}

function dataOf(report) {
  const summary = report.mode === 'summary'
  const fields = summary ? summaryFields : detailFields
  const records = summary && Array.isArray(report.monthly_rows)
    ? [...(report.rows || []).map(row => ({ ...row, period: `Year ${row.period}` })),
       ...report.monthly_rows.map(row => ({ ...row, period: `Month ${row.period}` }))]
    : report.rows || []
  const values = records.map(row => fields.map(([key]) => {
    const source = key === 'earning_status' ? row.status : row[key]
    return key === 'created_at' ? dateTime(source) : source ?? ''
  }))
  const printable = (summary ? summaryPrintFields : detailPrintFields).map(key => fields.find(field => field[0] === key))
  const printIndices = printable.map(field => fields.indexOf(field))
  return { fields, values, printFields: printable, printRows: values.map(row => printIndices.map(index => row[index])) }
}

function reportMetadata(report) {
  const totals = report.totals || {}
  const range = report.range || {}
  return [
    ['Author', report.author?.name || report.author?.username || report.author?.id || ''],
    ['Username', report.author?.username ? `@${report.author.username}` : ''],
    ['Period', range.period || ''],
    ['From', dateTime(range.from) || 'All Time'],
    ['To (exclusive)', dateTime(range.to) || 'Present'],
    ['Report Mode', report.mode === 'summary' ? 'Summary' : 'Detailed Transactions'],
    ['Transaction Count', Number(totals.transaction_count || 0)],
    ['Paid Diamonds', Number(totals.paid_diamonds || 0)],
    ['Author Diamonds', Number(totals.author_earned_diamonds || 0)],
    ['Platform Diamonds', Number(totals.platform_earned_diamonds || 0)],
    ['Author Earned USD', Number(totals.author_earnings_usd || 0)],
    ['Platform Earned USD', Number(totals.platform_income_usd || 0)],
    ['Author Net Payout USD', Number(totals.author_net_payout_usd || 0)],
    ['Pending Payout USD', Number(totals.pending_payout_usd || 0)],
  ]
}

function crc32(bytes) {
  let crc = 0xFFFFFFFF
  for (const byte of bytes) {
    crc ^= byte
    for (let i = 0; i < 8; i += 1) crc = crc & 1 ? (crc >>> 1) ^ 0xEDB88320 : crc >>> 1
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function zipFiles(entries) {
  const files = []
  const directories = []
  let offset = 0
  for (const [name, content] of entries) {
    const filename = encoder.encode(name)
    const bytes = typeof content === 'string' ? encoder.encode(content) : content
    const hash = crc32(bytes)
    const local = new Uint8Array(30)
    const loc = new DataView(local.buffer)
    loc.setUint32(0, 0x04034B50, true)
    loc.setUint16(4, 20, true)
    loc.setUint16(6, 0x0800, true)
    loc.setUint32(14, hash, true)
    loc.setUint32(18, bytes.length, true)
    loc.setUint32(22, bytes.length, true)
    loc.setUint16(26, filename.length, true)
    const central = new Uint8Array(46)
    const dir = new DataView(central.buffer)
    dir.setUint32(0, 0x02014B50, true)
    dir.setUint16(4, 20, true)
    dir.setUint16(6, 20, true)
    dir.setUint16(8, 0x0800, true)
    dir.setUint32(16, hash, true)
    dir.setUint32(20, bytes.length, true)
    dir.setUint32(24, bytes.length, true)
    dir.setUint16(28, filename.length, true)
    dir.setUint32(42, offset, true)
    files.push(local, filename, bytes)
    directories.push(central, filename)
    offset += local.length + filename.length + bytes.length
  }
  const centralSize = directories.reduce((sum, entry) => sum + entry.length, 0)
  const ending = new Uint8Array(22)
  const end = new DataView(ending.buffer)
  end.setUint32(0, 0x06054B50, true)
  end.setUint16(8, entries.length, true)
  end.setUint16(10, entries.length, true)
  end.setUint32(12, centralSize, true)
  end.setUint32(16, offset, true)
  return new Blob([...files, ...directories, ending], { type: 'application/zip' })
}

function excelCell(value, column, row, header = false) {
  let x = column + 1
  let address = ''
  while (x) {
    x -= 1
    address = String.fromCharCode(65 + x % 26) + address
    x = Math.floor(x / 26)
  }
  const id = `${address}${row}`
  const style = header ? ' s="1"' : ''
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${id}"${style}><v>${value}</v></c>`
  }
  return `<c r="${id}" t="inlineStr"${style}><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`
}

function excelRow(values, n, header = false) {
  return `<row r="${n}">${values.map((value, index) => excelCell(value, index, n, header)).join('')}</row>`
}

export function makeExcelReport(report) {
  const { fields, values } = dataOf(report)
  const meta = reportMetadata(report)
  const lines = [excelRow(['SHADOW AUTHOR INCOME REPORT'], 1, true)]
  meta.forEach((row, index) => lines.push(excelRow(row, index + 2)))
  const headingRow = meta.length + 4
  lines.push(excelRow(fields.map(field => field[1]), headingRow, true))
  values.forEach((row, index) => lines.push(excelRow(row, headingRow + index + 1)))
  const columns = fields.map((field, index) => `<col min="${index + 1}" max="${index + 1}" width="${Math.min(52, Math.max(17, field[1].length + 7))}" customWidth="1"/>`).join('')
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${columns}</cols><sheetData>${lines.join('')}</sheetData><autoFilter ref="A${headingRow}:${excelColumn(fields.length)}${headingRow + values.length}"/></worksheet>`
  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Author Income" sheetId="1" r:id="rId1"/></sheets></workbook>`
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF334155"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`
  const blob = zipFiles([
    ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
    ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ['xl/workbook.xml', workbook],
    ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ['xl/styles.xml', styles],
    ['xl/worksheets/sheet1.xml', sheet],
  ])
  return new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

function excelColumn(count) {
  let s = ''
  while (count) {
    count -= 1
    s = String.fromCharCode(65 + count % 26) + s
    count = Math.floor(count / 26)
  }
  return s
}

function wordText(value, strong = false) {
  const text = escapeXml(value)
  const format = strong ? '<w:b/>' : ''
  return `<w:p><w:r><w:rPr><w:rFonts w:ascii="Noto Sans Khmer" w:hAnsi="Noto Sans Khmer" w:eastAsia="Noto Sans Khmer" w:cs="Noto Sans Khmer"/>${format}<w:sz w:val="17"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`
}

export function makeWordReport(report) {
  const { printFields, printRows } = dataOf(report)
  const metadata = reportMetadata(report)
  const title = wordText('SHADOW AUTHOR INCOME REPORT', true)
  const intro = metadata.map(([name, value]) => wordText(`${name}: ${value}`, true)).join('')
  const tableRow = (cells, heading) => `<w:tr>${cells.map(cell => `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/><w:shd w:fill="${heading ? 'E2E8F0' : 'FFFFFF'}"/></w:tcPr>${wordText(cell, heading)}</w:tc>`).join('')}</w:tr>`
  const body = `${title}${intro}<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:bottom w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="3"/></w:tblBorders></w:tblPr>${tableRow(printFields.map(field => field[1]), true)}${printRows.map(row => tableRow(row, false)).join('')}</w:tbl><w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="720" w:right="550" w:bottom="720" w:left="550"/></w:sectPr>`
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`
  const blob = zipFiles([
    ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`],
    ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`],
    ['word/document.xml', document],
  ])
  return new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}

function cutLines(context, value, width, maxLines = 2) {
  const text = String(value ?? '')
  const units = typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter('km', { granularity: 'grapheme' }).segment(text), item => item.segment)
    : Array.from(text)
  const lines = ['']
  for (const unit of units) {
    const index = lines.length - 1
    if (context.measureText(lines[index] + unit).width <= width) {
      lines[index] += unit
    } else if (lines.length < maxLines) {
      lines.push(unit)
    } else {
      while (context.measureText(lines[index] + '…').width > width && lines[index].length) lines[index] = lines[index].slice(0, -1)
      lines[index] += '…'
      break
    }
  }
  return lines
}

function pageImage(context, report, table, start, end, index, count) {
  const canvas = context.canvas
  const width = canvas.width
  context.fillStyle = '#FFFFFF'
  context.fillRect(0, 0, width, canvas.height)
  context.fillStyle = '#0F172A'
  context.font = 'bold 21px "Noto Sans Khmer", Arial, sans-serif'
  context.fillText('SHADOW AUTHOR INCOME REPORT', 35, 43)
  context.font = '13px "Noto Sans Khmer", Arial, sans-serif'
  const author = report.author?.name || report.author?.username || report.author?.id || ''
  context.fillText(`Author: ${author}`, 35, 68)
  context.fillText(`Period: ${report.range?.period || ''}    Mode: ${report.mode}`, 35, 87)
  const totals = report.totals || {}
  context.fillText(`Transactions: ${totals.transaction_count || 0}    Paid: ${totals.paid_diamonds || 0} D    Author: ${totals.author_earned_diamonds || 0} D    Platform: ${totals.platform_earned_diamonds || 0} D`, 35, 110)
  context.fillText(`Author Net Payout: $${Number(totals.author_net_payout_usd || 0).toFixed(2)}    Pending Payout: $${Number(totals.pending_payout_usd || 0).toFixed(2)}`, 35, 131)
  const cols = report.mode === 'summary' ? [145, 125, 140, 140, 145, 150, 195] : [143, 282, 190, 95, 105, 105, 120]
  const labels = report.mode === 'summary'
    ? ['Period', 'Count', 'Paid D', 'Author D', 'Platform D', 'Author USD', 'Net Payout']
    : ['Date', 'Story', 'Reader', 'Paid D', 'Author D', 'Platform D', 'Net Payout']
  let x = 36
  context.fillStyle = '#334155'
  context.fillRect(35, 150, 1052, 36)
  context.fillStyle = '#FFFFFF'
  context.font = 'bold 12px "Noto Sans Khmer", Arial, sans-serif'
  for (let i = 0; i < labels.length; i += 1) {
    context.fillText(labels[i], x + 5, 173)
    x += cols[i]
  }
  const rowHeight = 43
  for (let i = start; i < end; i += 1) {
    const y = 187 + (i - start) * rowHeight
    context.fillStyle = (i - start) % 2 ? '#FFFFFF' : '#F1F5F9'
    context.fillRect(35, y, 1052, rowHeight)
    context.fillStyle = '#0F172A'
    context.font = '12px "Noto Sans Khmer", Arial, sans-serif'
    let cellX = 36
    for (let j = 0; j < cols.length; j += 1) {
      const value = table.printRows[i]?.[j] ?? ''
      const lines = cutLines(context, value, cols[j] - 12)
      lines.forEach((text, indexLine) => context.fillText(text, cellX + 5, y + 16 + 17 * indexLine))
      cellX += cols[j]
    }
  }
  context.fillStyle = '#64748B'
  context.font = '11px Arial, sans-serif'
  context.fillText(`Page ${index + 1} / ${count}`, 985, 776)
  const binary = atob(canvas.toDataURL('image/jpeg', 0.78).split(',')[1])
  const bytes = new Uint8Array(binary.length)
  for (let k = 0; k < binary.length; k += 1) bytes[k] = binary.charCodeAt(k)
  return bytes
}

function pdfDocument(images, imageWidth, imageHeight) {
  const chunks = []
  const offsets = new Array(images.length * 3 + 3).fill(0)
  let length = 0
  const add = part => {
    const bytes = typeof part === 'string' ? encoder.encode(part) : part
    chunks.push(bytes)
    length += bytes.length
  }
  const begin = id => { offsets[id] = length; add(`${id} 0 obj\n`) }
  add('%PDF-1.4\n')
  begin(1)
  add('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
  begin(2)
  add(`<< /Type /Pages /Kids [${images.map((_, index) => `${3 + index * 3} 0 R`).join(' ')}] /Count ${images.length} >>\nendobj\n`)
  images.forEach((image, index) => {
    const page = 3 + index * 3
    const content = page + 1
    const picture = page + 2
    begin(page)
    add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /XObject << /Im0 ${picture} 0 R >> >> /Contents ${content} 0 R >>\nendobj\n`)
    const commands = 'q 841.89 0 0 595.28 0 0 cm /Im0 Do Q\n'
    begin(content)
    add(`<< /Length ${encoder.encode(commands).length} >>\nstream\n${commands}endstream\nendobj\n`)
    begin(picture)
    add(`<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`)
    add(image)
    add('\nendstream\nendobj\n')
  })
  const startXref = length
  add(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`)
  for (let i = 1; i < offsets.length; i += 1) add(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`)
  add(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`)
  return new Blob(chunks, { type: 'application/pdf' })
}

export async function makePdfReport(report) {
  const table = dataOf(report)
  const canvas = document.createElement('canvas')
  canvas.width = 1122
  canvas.height = 794
  const context = canvas.getContext('2d')
  if (!context) throw new Error('PDF renderer is unavailable')
  if (document.fonts?.ready) await document.fonts.ready
  const perPage = 13
  const count = Math.max(1, Math.ceil(table.printRows.length / perPage))
  const images = []
  for (let i = 0; i < count; i += 1) {
    images.push(pageImage(context, report, table, i * perPage, Math.min(table.printRows.length, (i + 1) * perPage), i, count))
    if (i % 3 === 2) await new Promise(resolve => setTimeout(resolve, 0))
  }
  const result = pdfDocument(images, canvas.width, canvas.height)
  canvas.width = 0
  canvas.height = 0
  return result
}

export function saveIncomeReport(blob, report, extension) {
  const author = String(report.author?.username || report.author?.name || 'author')
    .replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40)
  const range = String(report.range?.period || 'report').replace(/[^a-z]/g, '')
  const fileName = `author-income-${author}-${range}-${new Date().toISOString().slice(0, 10)}.${extension}`
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
