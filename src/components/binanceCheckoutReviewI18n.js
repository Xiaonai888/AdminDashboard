const languages = {
  en: {
    title: 'Binance Checkout Review', subtitle: 'Verify each incoming transfer and the intended reader before approving wallet credit.',
    pending: 'Pending', approved: 'Approved', rejected: 'Rejected', all: 'All', refresh: 'Refresh', loading: 'Loading orders…',
    empty: 'No orders found.', details: 'Details', back: 'Previous', next: 'Next', page: 'Page', status: 'Status',
    reader: 'Reader', account: 'Account', transaction: 'Transaction ID', amount: 'Amount', package: 'Package',
    diamonds: 'Diamonds', vouchers: 'Vouchers', order: 'Order ID', submitted: 'Submitted', review: 'Review',
    receiver: 'Receiver', receipt: 'Recorded transfer', evidence: 'Evidence checks', selected: 'Select an order to review.',
    pendingCheck: 'Manual identity confirmation required', noReceipt: 'No matching official transfer in the recorded history.',
    amountMatch: 'USDT amount matches', currencyMatch: 'USDT currency matches', recordMatch: 'Transfer recorded',
    state: 'Review state', caution: 'A matching transaction ID and amount do not prove who paid or who should receive Diamonds. Verify the transfer directly in Binance and independently confirm the Shadow reader.',
    approve: 'Approve and credit', reject: 'Reject', decision: 'Admin decision', reason: 'Decision reason (12–500 characters)',
    passkey: 'Six-digit Admin Passkey', checkOfficial: 'I verified the incoming transfer directly in my official Binance account.',
    checkReader: 'I independently verified the intended Shadow reader account.',
    checkReceiver: 'I confirmed this transfer went to the correct Binance receiver.',
    processing: 'Processing…', successApprove: 'Payment approved and wallet credited.', successReject: 'Payment report rejected.',
    onlyPending: 'This order is no longer pending review.', notReady: 'Approval is blocked until basic receipt checks pass.',
    notice: 'Approval changes wallet balances. Never approve from a screenshot or the reader’s claim alone.',
    close: 'Close', loadFailed: 'Unable to load Binance checkout reviews.', reload: 'Reload', language: 'Language',
  },
  km: {
    title: 'ពិនិត្យ Binance Checkout', subtitle: 'ផ្ទៀងផ្ទាត់ប្រាក់ចូល និងអ្នកអានដែលត្រូវទទួល Diamonds មុនអនុម័ត។',
    pending: 'រង់ចាំពិនិត្យ', approved: 'អនុម័តរួច', rejected: 'បដិសេធ', all: 'ទាំងអស់', refresh: 'ផ្ទុកឡើងវិញ', loading: 'កំពុងទាញ Order…',
    empty: 'មិនមាន Order ទេ។', details: 'ព័ត៌មានលម្អិត', back: 'មុន', next: 'បន្ទាប់', page: 'ទំព័រ', status: 'ស្ថានភាព',
    reader: 'អ្នកអាន', account: 'គណនី', transaction: 'លេខប្រតិបត្តិការ', amount: 'ទឹកប្រាក់', package: 'កញ្ចប់',
    diamonds: 'ពេជ្រ', vouchers: 'វ៉ោឆឺរ', order: 'លេខ Order', submitted: 'បានបញ្ជូន', review: 'ពិនិត្យ',
    receiver: 'អ្នកទទួលប្រាក់', receipt: 'កំណត់ត្រាប្រាក់ចូល', evidence: 'ការផ្ទៀងផ្ទាត់ភស្តុតាង', selected: 'ជ្រើស Order ដើម្បីពិនិត្យ។',
    pendingCheck: 'ត្រូវផ្ទៀងផ្ទាត់អត្តសញ្ញាណដោយដៃ', noReceipt: 'មិនមានប្រតិបត្តិការផ្គូផ្គងក្នុងប្រវត្តិប្រាក់ចូល។',
    amountMatch: 'ចំនួន USDT ត្រូវគ្នា', currencyMatch: 'រូបិយប័ណ្ណ USDT ត្រូវគ្នា', recordMatch: 'បានកត់ត្រាប្រាក់ចូល',
    state: 'ស្ថានភាពពិនិត្យ', caution: 'Transaction ID និងទឹកប្រាក់ដូចគ្នាមិនបញ្ជាក់ថានរណាជាអ្នកបង់ទេ។ ត្រូវពិនិត្យក្នុង Binance ផ្ទាល់ និងបញ្ជាក់គណនីអ្នកអានឱ្យច្បាស់។',
    approve: 'អនុម័ត និងបញ្ចូលពេជ្រ', reject: 'បដិសេធ', decision: 'សេចក្ដីសម្រេច Admin', reason: 'មូលហេតុ (១២–៥០០ តួអក្សរ)',
    passkey: 'Admin Passkey ៦ ខ្ទង់', checkOfficial: 'ខ្ញុំបានផ្ទៀងផ្ទាត់ប្រាក់ចូលផ្ទាល់ក្នុងគណនី Binance ផ្លូវការ។',
    checkReader: 'ខ្ញុំបានផ្ទៀងផ្ទាត់គណនីអ្នកអានដែលត្រូវទទួលពេជ្រ។',
    checkReceiver: 'ខ្ញុំបានបញ្ជាក់ថាប្រាក់ចូលទៅកាន់គណនី Binance ត្រឹមត្រូវ។',
    processing: 'កំពុងដំណើរការ…', successApprove: 'បានអនុម័ត និងបញ្ចូលពេជ្ររួច។', successReject: 'បានបដិសេធការជូនដំណឹងទូទាត់។',
    onlyPending: 'Order នេះលែងរង់ចាំពិនិត្យហើយ។', notReady: 'មិនអាចអនុម័តបានទេ ប្រសិនបើភស្តុតាងមូលដ្ឋានមិនត្រូវ។',
    notice: 'ការអនុម័តប្តូរចំនួនពេជ្រក្នុង Wallet។ កុំអនុម័តផ្អែកតែលើ Screenshot ឬការអះអាងរបស់អ្នកអាន។',
    close: 'បិទ', loadFailed: 'មិនអាចទាញ Binance Checkout បាន។', reload: 'ទាញម្ដងទៀត', language: 'ភាសា',
  },
  zh: {
    title: 'Binance 订单审核', subtitle: '批准钱包入账前，请确认真实收款和对应的读者。', pending: '待审核', approved: '已批准', rejected: '已拒绝', all: '全部', refresh: '刷新', loading: '正在加载订单…', empty: '没有订单。', details: '详情', back: '上一页', next: '下一页', page: '页', status: '状态', reader: '读者', account: '账户', transaction: '交易编号', amount: '金额', package: '套餐', diamonds: '钻石', vouchers: '代金券', order: '订单编号', submitted: '提交时间', review: '审核', receiver: '收款人', receipt: '收款记录', evidence: '证据检查', selected: '请选择要审核的订单。', pendingCheck: '必须人工核实身份', noReceipt: '没有找到匹配的收款记录。', amountMatch: 'USDT 金额匹配', currencyMatch: 'USDT 币种匹配', recordMatch: '有收款记录', state: '审核状态', caution: '交易编号和金额相同并不能证明付款人或钻石接收人。请在 Binance 官方账户核实并确认 Shadow 读者身份。', approve: '批准并入账', reject: '拒绝', decision: '管理员决定', reason: '原因（12–500 字符）', passkey: '六位管理员密码', checkOfficial: '我已在官方 Binance 账户核实真实入账。', checkReader: '我已独立核实 Shadow 收款读者。', checkReceiver: '我已确认转账收款账户正确。', processing: '处理中…', successApprove: '已批准并入账。', successReject: '已拒绝付款申报。', onlyPending: '此订单不再待审核。', notReady: '基础收款证据未通过，无法批准。', notice: '批准会改变钱包余额。切勿仅凭截图或读者声明批准。', close: '关闭', loadFailed: '无法加载 Binance 订单。', reload: '重试', language: '语言',
  },
  ja: {
    title: 'Binance 決済審査', subtitle: 'ウォレットへの付与前に着金と対象読者を確認してください。', pending: '審査待ち', approved: '承認済み', rejected: '却下', all: 'すべて', refresh: '更新', loading: '注文を読み込み中…', empty: '注文がありません。', details: '詳細', back: '前へ', next: '次へ', page: 'ページ', status: '状態', reader: '読者', account: 'アカウント', transaction: '取引ID', amount: '金額', package: 'プラン', diamonds: 'ダイヤ', vouchers: 'バウチャー', order: '注文ID', submitted: '申請日時', review: '審査', receiver: '受取人', receipt: '入金記録', evidence: '証拠確認', selected: '審査する注文を選択してください。', pendingCheck: '本人確認が必要', noReceipt: '該当する入金記録がありません。', amountMatch: 'USDT金額が一致', currencyMatch: 'USDT通貨が一致', recordMatch: '入金記録あり', state: '審査状況', caution: '取引IDと金額の一致だけでは送金者や読者を特定できません。公式Binance口座とShadow読者を別途確認してください。', approve: '承認して付与', reject: '却下', decision: '管理者の判断', reason: '理由（12～500文字）', passkey: '6桁の管理者パスキー', checkOfficial: '公式Binance口座で着金を確認しました。', checkReader: '対象のShadow読者を確認しました。', checkReceiver: '正しい受取Binance口座への送金を確認しました。', processing: '処理中…', successApprove: '承認し、付与しました。', successReject: '申請を却下しました。', onlyPending: 'この注文は審査待ちではありません。', notReady: '入金証拠が一致しないため承認できません。', notice: '承認すると残高が変わります。スクリーンショットや申告だけで承認しないでください。', close: '閉じる', loadFailed: '注文を読み込めません。', reload: '再試行', language: '言語',
  },
  ko: {
    title: 'Binance 결제 검토', subtitle: '지갑 충전 승인 전 실제 입금과 대상 독자를 확인하세요.', pending: '검토 대기', approved: '승인', rejected: '거절', all: '전체', refresh: '새로고침', loading: '주문 불러오는 중…', empty: '주문이 없습니다.', details: '상세', back: '이전', next: '다음', page: '페이지', status: '상태', reader: '독자', account: '계정', transaction: '거래 ID', amount: '금액', package: '패키지', diamonds: '다이아몬드', vouchers: '바우처', order: '주문 ID', submitted: '제출 시간', review: '검토', receiver: '수취인', receipt: '입금 기록', evidence: '증거 확인', selected: '검토할 주문을 선택하세요.', pendingCheck: '수동 신원 확인 필요', noReceipt: '일치하는 입금 기록이 없습니다.', amountMatch: 'USDT 금액 일치', currencyMatch: 'USDT 통화 일치', recordMatch: '입금 기록 있음', state: '검토 상태', caution: '거래 ID와 금액이 같아도 송금자나 다이아몬드 수령자가 증명되지는 않습니다. Binance 공식 계정과 Shadow 독자를 직접 확인하세요.', approve: '승인 및 충전', reject: '거절', decision: '관리자 결정', reason: '사유 (12–500자)', passkey: '관리자 비밀번호 6자리', checkOfficial: '공식 Binance 계정에서 실제 입금을 확인했습니다.', checkReader: '해당 Shadow 독자를 별도로 확인했습니다.', checkReceiver: '올바른 Binance 계정으로 입금된 것을 확인했습니다.', processing: '처리 중…', successApprove: '승인되어 충전되었습니다.', successReject: '결제 신고가 거절되었습니다.', onlyPending: '이 주문은 더 이상 검토 대기가 아닙니다.', notReady: '기본 입금 증거가 일치하지 않아 승인할 수 없습니다.', notice: '승인 시 지갑 잔액이 변경됩니다. 스크린샷이나 신고만으로 승인하지 마세요.', close: '닫기', loadFailed: '주문을 불러오지 못했습니다.', reload: '다시 시도', language: '언어',
  },
}

export const BINANCE_REVIEW_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'km', label: 'ខ្មែរ' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
]

export function binanceReviewText(language, key) {
  return languages[language]?.[key] || languages.en[key] || key
}
