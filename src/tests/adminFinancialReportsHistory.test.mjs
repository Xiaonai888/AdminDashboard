import test from 'node:test'
import assert from 'node:assert/strict'
import { getAdminFinancialHistoryProgress, listAdminFinancialHistoryMonths } from '../utils/adminFinancialReportsHistory.js'

test('plans all months between first recorded financial activity and today', () => {
  assert.deepEqual(listAdminFinancialHistoryMonths('2026-05', '2026-11'), [
    '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11',
  ])
})

test('rolls across the year and includes both boundaries', () => {
  assert.deepEqual(listAdminFinancialHistoryMonths('2025-12', '2026-02'), ['2025-12', '2026-01', '2026-02'])
})

test('rejects invalid, reversed and huge periods', () => {
  assert.throws(() => listAdminFinancialHistoryMonths('2026-13', '2026-11'), /YYYY-MM/)
  assert.throws(() => listAdminFinancialHistoryMonths('2026-11', '2026-01'), /after/)
  assert.throws(() => listAdminFinancialHistoryMonths('1990-01', '2026-11'), /240 months/)
})

test('progress never exceeds total and percentage stays bounded', () => {
  assert.deepEqual(getAdminFinancialHistoryProgress(2, 7), { completed: 2, total: 7, percent: 29 })
  assert.deepEqual(getAdminFinancialHistoryProgress(15, 5), { completed: 5, total: 5, percent: 100 })
})
