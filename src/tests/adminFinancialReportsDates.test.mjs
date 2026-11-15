import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getAdminFinancialCurrentMonth,
  validateAdminFinancialMonth,
  formatAdminFinancialTime,
  getSafeAdminFinancialSheetUrl,
} from '../utils/adminFinancialReportsDates.js'

test('Cambodia month uses GMT+7 rather than UTC date', () => {
  assert.equal(getAdminFinancialCurrentMonth(new Date('2026-10-31T18:00:00Z')), '2026-11')
  assert.equal(getAdminFinancialCurrentMonth(new Date('2026-11-30T18:00:00Z')), '2026-12')
})

test('current and historical months are accepted', () => {
  const now = new Date('2026-11-15T12:00:00Z')
  assert.equal(validateAdminFinancialMonth('2026-11', now), '2026-11')
  assert.equal(validateAdminFinancialMonth('2026-10', now), '2026-10')
})

test('future months and invalid months are rejected', () => {
  const now = new Date('2026-11-15T12:00:00Z')
  assert.throws(() => validateAdminFinancialMonth('2026-12', now), /Future/)
  assert.throws(() => validateAdminFinancialMonth('2026-13', now), /valid month/)
  assert.throws(() => validateAdminFinancialMonth('2026-1', now), /valid month/)
})

test('dates display in Cambodia local time', () => {
  assert.match(formatAdminFinancialTime('2026-11-15T13:00:00.000Z'), /20:00/)
  assert.equal(formatAdminFinancialTime(''), 'Not yet')
})

test('sheet link only allows Google Sheets document URLs', () => {
  assert.equal(getSafeAdminFinancialSheetUrl('https://evil.example/spreadsheets/d/x'), '')
  assert.equal(getSafeAdminFinancialSheetUrl('javascript:alert(1)'), '')
  assert.equal(getSafeAdminFinancialSheetUrl('https://docs.google.com/evil'), '')
  assert.equal(getSafeAdminFinancialSheetUrl('https://docs.google.com/spreadsheets/d/abc123/edit'), 'https://docs.google.com/spreadsheets/d/abc123/edit')
})
