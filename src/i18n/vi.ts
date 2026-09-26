// Vietnamese UI copy. Sentence case: capitalize only the first word and proper nouns.
// en.ts must provide the same keys (enforced by the Messages type).

const WEEKDAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const WEEKDAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function dayParts(dayKey: string) {
  const [, month, day] = dayKey.split('-').map(Number)
  return { weekday: new Date(`${dayKey}T00:00:00Z`).getUTCDay(), month, day }
}

/** 2.5 → "2,5" */
const decimal = (n: number) => (Math.round(n * 10) / 10).toString().replace('.', ',')

export const vi = {
  common: {
    loading: 'Đang tải…',
    cancel: 'Hủy',
    save: 'Lưu',
    close: 'Đóng',
    backToOverview: 'Về trang tổng quan',
    wordBook: 'Sổ từ vựng',
    speak: (word: string) => `Phát âm ${word}`,
  },

  nav: {
    mainMenu: 'Menu chính',
    overview: 'Tổng quan',
    study: 'Học thẻ',
    quiz: 'Kiểm tra',
    words: 'Sổ từ vựng',
    wordsShort: 'Sổ từ',
    stats: 'Thống kê',
    settings: 'Cài đặt',
  },

  date: {
    long: (dayKey: string) => {
      const { weekday, month, day } = dayParts(dayKey)
      return `${WEEKDAYS[weekday]}, ${day} tháng ${month}`
    },
    weekdayShort: (dayKey: string) => WEEKDAYS_SHORT[dayParts(dayKey).weekday],
  },

  interval: {
    lessThanMinute: '< 1 phút',
    minutes: (n: number) => `${n} phút`,
    hours: (n: number) => `${n} giờ`,
    days: (n: number) => `${n} ngày`,
    months: (n: number) => `${decimal(n)} tháng`,
    years: (n: number) => `${decimal(n)} năm`,
  },

  status: {
    new: 'Mới',
    learning: 'Đang học',
    mastered: 'Đã thuộc',
  },

  ratings: {
    1: 'Quên',
    2: 'Khó',
    3: 'Nhớ',
    4: 'Dễ',
  },

  config: {
    title: 'Chưa cấu hình Supabase',
    body: 'Tạo file .env.local từ .env.example, điền hai biến dưới đây (lấy trong Supabase > Project Settings > API), rồi chạy lại npm run dev.',
  },

  streak: {
    days: (n: number) => `Chuỗi ${n} ngày`,
    loading: 'Chuỗi …',
    failedTitle: 'Chuỗi —',
    failed: 'Không tải được chuỗi ngày.',
    studiedToday: 'Bạn đã học hôm nay. Giữ vững nhé!',
    notYet: 'Ôn ít nhất 1 thẻ để giữ chuỗi hôm nay.',
  },

  celebration: {
    title: (n: number) => `Chuỗi ${n} ngày!`,
    sub: (n: number) => `Bạn đã học ${n} ngày liên tiếp. Giữ vững nhé!`,
    startTitle: 'Bắt đầu chuỗi mới!',
    startSub: 'Ngày thứ nhất đã xong. Hẹn bạn ngày mai để giữ lửa nhé.',
    notYetToday: 'Ôn ít nhất 1 thẻ hôm nay để giữ chuỗi nhé!',
    noStreakTitle: 'Chưa có chuỗi ngày',
    noStreakSub: 'Ôn ít nhất 1 thẻ hôm nay để bắt đầu chuỗi mới.',
    open: (n: number) => `Xem chuỗi ${n} ngày`,
    daysLeft: (left: number, milestone: number) => `Còn ${left} ngày tới mốc ${milestone} ngày`,
    nextMilestone: (milestone: number) => `Mốc tiếp theo: ${milestone} ngày`,
    hintTouch: 'Chạm bất kỳ đâu để học tiếp',
    hintMouse: 'Bấm bất kỳ đâu hoặc nhấn Esc để học tiếp',
    live: (n: number) => `Chuỗi ${n} ngày`,
    liveStart: 'Bắt đầu chuỗi mới. Chuỗi 1 ngày',
    /** [badge, subtitle] for 7, 30, 100 days and full years. */
    milestone: (days: number): [string, string] => {
      if (days === 7) return ['Tròn 1 tuần', 'Một tuần không bỏ buổi nào. Thói quen đang thành hình!']
      if (days === 30) return ['Tròn 1 tháng', '30 ngày liên tiếp. Bạn thật bền bỉ!']
      if (days === 100) return ['Cột mốc 100 ngày', 'Ba chữ số! Rất ít người đi được tới đây.']
      const years = Math.round(days / 365)
      return [`Tròn ${years} năm`, `${years === 1 ? 'Một' : years} năm học mỗi ngày. Quá đỉnh!`]
    },
  },

  language: {
    label: 'Ngôn ngữ hiển thị',
    change: (current: string) => `Đổi ngôn ngữ hiển thị (đang dùng: ${current})`,
    vi: 'Tiếng Việt',
    en: 'English',
  },

  login: {
    signInTitle: 'Đăng nhập',
    signUpTitle: 'Tạo tài khoản',
    subtitle: 'Đồng bộ từ vựng giữa máy tính và điện thoại của bạn.',
    username: 'Tên đăng nhập',
    usernamePlaceholder: 'ví dụ: thanh.nguyen',
    usernameHint: (min: number, max: number) => `${min}–${max} ký tự: chữ thường không dấu, số, dấu . _ -`,
    password: 'Mật khẩu',
    confirmPassword: 'Nhập lại mật khẩu',
    passwordHint: (min: number) => `Ít nhất ${min} ký tự.`,
    showPassword: 'Hiện mật khẩu',
    hidePassword: 'Ẩn mật khẩu',
    signIn: 'Đăng nhập',
    signUp: 'Tạo tài khoản',
    noAccount: 'Chưa có tài khoản?',
    haveAccount: 'Đã có tài khoản?',
    toSignUp: 'Tạo tài khoản mới',
    toSignIn: 'Đăng nhập',
    mismatch: 'Mật khẩu nhập lại không khớp.',
    usernameProblems: {
      tooShort: (min: number) => `Tên đăng nhập cần ít nhất ${min} ký tự.`,
      tooLong: (max: number) => `Tên đăng nhập tối đa ${max} ký tự.`,
      invalidChars: 'Tên đăng nhập chỉ gồm chữ thường không dấu, số và dấu . _ -',
    },
    passwordTooShort: (min: number) => `Mật khẩu cần ít nhất ${min} ký tự.`,
    errors: {
      invalidCredentials: 'Sai tên đăng nhập hoặc mật khẩu.',
      usernameTaken: 'Tên đăng nhập này đã có người dùng.',
      weakPassword: 'Mật khẩu quá yếu, hãy chọn mật khẩu dài hơn.',
      confirmEmailOn: 'Cần tắt "Confirm email" trong Supabase (Authentication > Sign In / Providers > Email) để dùng tên đăng nhập.',
      signupDisabled: 'Supabase đang tắt đăng ký tài khoản mới.',
      rateLimited: 'Thử quá nhiều lần, hãy đợi một lát rồi thử lại.',
      unknown: (message: string) => `Có lỗi: ${message}`,
    },
  },

  dashboard: {
    greeting: {
      morning: 'Chào buổi sáng!',
      noon: 'Chào buổi trưa!',
      afternoon: 'Chào buổi chiều!',
      evening: 'Chào buổi tối!',
    },
    question: 'Hôm nay học gì nhỉ?',
    account: (name: string) => `Tài khoản của ${name} và cài đặt`,
    loadError: (message: string) => `Không tải được trang tổng quan: ${message}`,
    stats: {
      streak: 'Ngày học liên tiếp',
      mastered: 'Từ đã thuộc',
      due: 'Từ cần ôn hôm nay',
      accuracy: 'Độ chính xác 7 ngày',
    },
    review: {
      eyebrow: 'Ôn tập hôm nay',
      waiting: (n: number) => `${n} từ đang chờ bạn ôn lại`,
      estimate: (minutes: number) =>
        `Khoảng ${minutes} phút. Hệ thống lặp lại ngắt quãng sẽ nhắc đúng lúc bạn sắp quên.`,
      allDone: 'Bạn đã ôn hết thẻ đến hạn',
      learnMoreHint: 'Học thêm vài từ mới để giữ nhịp nhé.',
      seeYouTomorrow: 'Hẹn gặp lại bạn vào ngày mai.',
      start: 'Bắt đầu ôn',
      learnNew: (n: number) => `Học ${n} từ mới`,
      takeQuiz: 'Làm bài kiểm tra',
    },
    wordOfDay: {
      title: 'Từ của ngày',
      empty: 'Thêm từ vào sổ để nhận từ của ngày.',
    },
    decks: {
      title: 'Bộ từ vựng của bạn',
      seeAll: 'Xem tất cả',
      empty: 'Chưa có bộ từ nào.',
      words: (n: number) => `${n} từ`,
      masteredAria: (percent: number, name: string) => `Đã thuộc ${percent}% bộ ${name}`,
    },
    week: {
      title: 'Tuần này',
      reviews: (n: number) => `${n} lượt ôn`,
      up: (percent: number) => ` · tăng ${percent}% so với tuần trước`,
      down: (percent: number) => ` · giảm ${percent}% so với tuần trước`,
      tooltip: (n: number) => `${n} lượt`,
      caption: 'Số lượt ôn 7 ngày gần nhất',
      day: 'Ngày',
      count: 'Lượt ôn',
      today: ' (hôm nay)',
    },
  },

  words: {
    title: 'Sổ từ vựng',
    summary: (total: number, mastered: number) => `${total} từ đã lưu · ${mastered} đã thuộc`,
    add: 'Thêm từ mới',
    searchLabel: 'Tìm trong sổ từ',
    searchPlaceholder: 'Tìm trong sổ từ…',
    filterLabel: 'Lọc theo trạng thái',
    all: 'Tất cả',
    empty: 'Không tìm thấy từ nào.',
    loading: 'Đang tải sổ từ…',
    loadError: (message: string) => `Không tải được sổ từ: ${message}`,
    columns: {
      word: 'Từ',
      meaning: 'Nghĩa',
      level: 'Cấp độ',
      status: 'Trạng thái',
      nextReview: 'Ôn lần tới',
    },
    nextReview: (days: number | null) =>
      days === null ? '—' : days <= 0 ? 'Hôm nay' : days === 1 ? 'Ngày mai' : `${days} ngày nữa`,
    detail: {
      aria: (word: string) => `Chi tiết từ ${word}`,
      close: 'Đóng chi tiết',
      deck: (name: string) => `Bộ: ${name}`,
      meaning: 'Nghĩa',
      examples: 'Ví dụ',
      synonyms: 'Từ đồng nghĩa',
      memory: 'Mức độ ghi nhớ',
      reviewThis: 'Ôn từ này',
      edit: 'Sửa',
    },
    form: {
      addTitle: 'Thêm từ mới',
      editTitle: 'Sửa từ',
      word: 'Từ tiếng Anh',
      wordPlaceholder: 'ví dụ: resilient',
      autofill: 'Tự điền',
      duplicate: 'Từ này đã có trong sổ.',
      duplicateNamed: (word: string) => `Từ "${word}" đã có trong sổ.`,
      notFound: 'Không tìm thấy từ này trong từ điển.',
      dictionaryDown: (status: number) => `Từ điển đang lỗi (mã ${status}).`,
      lookupFailed: 'Không tra được từ.',
      typeManually: 'Bạn có thể tự nhập.',
      filled: (source: string) => `Đã tự điền từ ${source}.`,
      meaning: 'Nghĩa tiếng Việt',
      meaningPlaceholder: 'ví dụ: kiên cường, mau phục hồi',
      ipa: 'Phiên âm (IPA)',
      partOfSpeech: 'Từ loại',
      partOfSpeechPlaceholder: 'noun, verb, adjective…',
      deck: 'Bộ từ',
      noDeck: '(Không thuộc bộ nào)',
      level: 'Cấp độ',
      noLevel: '(Chưa chọn)',
      definition: 'Định nghĩa tiếng Anh',
      examples: 'Câu ví dụ',
      exampleEn: 'Câu tiếng Anh',
      exampleVi: 'Dịch tiếng Việt',
      exampleEnAria: (i: number) => `Ví dụ ${i} (tiếng Anh)`,
      exampleViAria: (i: number) => `Ví dụ ${i} (dịch)`,
      removeExample: (i: number) => `Xóa ví dụ ${i}`,
      addExample: 'Thêm ví dụ',
      synonyms: 'Từ đồng nghĩa (cách nhau bằng dấu phẩy)',
      delete: 'Xóa từ',
      confirmDelete: (word: string) => `Xóa từ "${word}" khỏi sổ?`,
      create: 'Thêm từ',
    },
  },

  study: {
    allDecks: 'Tất cả bộ từ',
    progress: 'Tiến độ',
    exit: 'Thoát',
    hint: 'Nhấn vào thẻ hoặc phím Space để xem nghĩa',
    flip: 'Lật thẻ',
    shortcuts: 'Phím tắt',
    remembered: (n: number) => `Đã nhớ ${n}`,
    again: (n: number) => `Cần ôn lại ${n}`,
    remaining: (n: number) => `Còn lại ${n}`,
    loading: 'Đang tải thẻ…',
    loadError: (message: string) => `Không tải được thẻ: ${message}`,
    saveError: (message: string) => `Không lưu được kết quả: ${message}`,
    emptyTitle: 'Chưa có thẻ nào cần học',
    emptyText:
      'Bạn đã ôn hết thẻ đến hạn và học đủ số từ mới hôm nay. Thêm từ mới vào sổ hoặc quay lại sau nhé.',
    doneTitle: 'Hoàn thành!',
    doneText: (cards: number, ratings: number) =>
      `Bạn đã ôn ${cards} thẻ với ${ratings} lượt đánh giá. Hệ thống sẽ nhắc bạn đúng lúc sắp quên.`,
  },

  quiz: {
    eyebrow: 'Kiểm tra nhanh',
    question: (n: number, total: number) => `Câu ${n} / ${total}`,
    progress: 'Tiến độ',
    segment: (n: number, state: 'correct' | 'wrong' | 'current' | 'todo') =>
      `Câu ${n}: ${{ correct: 'đúng', wrong: 'sai', current: 'đang làm', todo: 'chưa làm' }[state]}`,
    exit: 'Thoát bài kiểm tra',
    soundOn: 'Tắt âm thanh',
    soundOff: 'Bật âm thanh',
    prompt: 'Chọn nghĩa đúng của từ',
    correctAria: 'Đáp án đúng',
    wrongAria: 'Bạn chọn sai',
    correctTitle: (xp: number) => `Chính xác! +${xp} XP`,
    wrongTitle: 'Chưa đúng — từ này sẽ được đưa về ôn ngay',
    synonyms: (list: string) => ` Đồng nghĩa: ${list}.`,
    next: 'Tiếp tục',
    seeResults: 'Xem kết quả',
    result: 'Kết quả',
    perfect: 'Hoàn hảo!',
    good: 'Làm tốt lắm!',
    keepGoing: 'Cố lên, ôn thêm chút nữa nhé!',
    wrongList: 'Các từ trả lời sai đã được đưa về hàng ôn tập:',
    newQuiz: 'Làm bài mới',
    reviewNow: 'Ôn ngay',
    notEnoughTitle: 'Chưa đủ từ để kiểm tra',
    notEnoughText: 'Cần ít nhất 4 từ có nghĩa khác nhau trong sổ.',
    addWords: 'Thêm từ vào sổ',
    loading: 'Đang tạo bài kiểm tra…',
    loadError: (message: string) => `Không tải được bài kiểm tra: ${message}`,
    saveError: (message: string) => `Không lưu được kết quả: ${message}`,
  },

  stats: {
    placeholder: 'Tính năng thống kê chi tiết đang được phát triển.',
  },

  settings: {
    title: 'Cài đặt',
    loading: 'Đang tải cài đặt…',
    loadError: (message: string) => `Không tải được cài đặt: ${message}`,
    language: {
      title: 'Ngôn ngữ hiển thị',
      description: 'Chỉ đổi ngôn ngữ giao diện. Nghĩa của từ và câu dịch vẫn là tiếng Việt.',
    },
    account: {
      title: 'Tài khoản',
      signedInAs: (name: string) => `Đang đăng nhập với tài khoản ${name}`,
      displayName: 'Tên hiển thị',
      saveName: 'Lưu tên',
      saved: 'Đã lưu tên hiển thị.',
      signOut: 'Đăng xuất',
      changePassword: 'Đổi mật khẩu',
      newPassword: 'Mật khẩu mới',
      savePassword: 'Lưu mật khẩu',
      passwordSaved: 'Đã đổi mật khẩu.',
    },
    study: {
      title: 'Học tập',
      description: 'Số từ mới tối đa được thêm vào phiên học thẻ mỗi ngày. Các thẻ đến hạn luôn được ôn hết.',
      newPerDay: 'Số từ mới mỗi ngày',
      saved: 'Đã lưu. Áp dụng từ phiên học tiếp theo.',
    },
    reminders: {
      title: 'Nhắc học mỗi ngày',
      description:
        'Nếu đến giờ bạn chọn (giờ Việt Nam) mà hôm nay bạn chưa ôn thẻ nào, Hosi gửi thông báo tới thiết bị này, kể cả khi app đang đóng.',
      hour: 'Giờ nhắc',
      hourOption: (hour: number) => `${String(hour).padStart(2, '0')}:00`,
      hourSaved: (hour: number) => `Đã đổi giờ nhắc thành ${hour}h.`,
      enable: 'Bật nhắc học',
      disable: 'Tắt nhắc học',
      test: 'Gửi thử',
      on: (hour: number) => `Đang bật trên thiết bị này, nhắc lúc ${hour}h.`,
      enabled: 'Đã bật nhắc học trên thiết bị này.',
      disabled: 'Đã tắt nhắc học trên thiết bị này.',
      testSent: 'Đã gửi thông báo thử. Nếu chưa thấy, kiểm tra cài đặt thông báo của máy.',
      checking: 'Đang kiểm tra…',
      notConfigured: 'Chức năng nhắc học chưa được cấu hình trên máy chủ.',
      unsupported: 'Trình duyệt này chưa hỗ trợ thông báo đẩy. Hãy dùng Chrome, Edge, hoặc Safari trên iPhone (iOS 16.4 trở lên).',
      iosNeedsInstall:
        'Trên iPhone, hãy thêm Hosi vào màn hình chính (Safari → Chia sẻ → Thêm vào MH chính), rồi mở Hosi từ màn hình chính để bật nhắc học.',
      denied: 'Thông báo đang bị chặn. Hãy cho phép thông báo cho Hosi trong cài đặt của trình duyệt hoặc điện thoại, rồi thử lại.',
      error: (message: string) => `Có lỗi: ${message}`,
    },
    backup: {
      title: 'Sao lưu',
      description: 'Tải về máy các bộ từ, từ vựng, lịch sử ôn tập và cài đặt dưới dạng file JSON.',
      export: 'Xuất dữ liệu (JSON)',
      fileName: 'hosi-sao-luu',
      done: (words: number, reviews: number) => `Đã xuất ${words} từ và ${reviews} lượt ôn.`,
    },
    decks: {
      title: 'Bộ từ vựng',
      description: 'Xóa bộ từ sẽ không xóa các từ bên trong.',
      empty: 'Chưa có bộ từ nào.',
      words: (n: number) => `${n} từ`,
      edit: (name: string) => `Sửa bộ ${name}`,
      delete: (name: string) => `Xóa bộ ${name}`,
      confirmDelete: (name: string, words: number) =>
        `Xóa bộ "${name}"?${words ? ` ${words} từ trong bộ vẫn được giữ lại trong sổ.` : ''}`,
      deleteError: (message: string) => `Không xóa được: ${message}`,
      add: 'Thêm bộ từ',
      addTitle: 'Thêm bộ từ',
      editTitle: 'Sửa bộ từ',
      name: 'Tên bộ từ',
      namePlaceholder: 'ví dụ: Du lịch',
      color: 'Màu',
      descriptionLabel: 'Mô tả (không bắt buộc)',
      colors: {
        terracotta: 'Cam đất',
        green: 'Xanh lá',
        blue: 'Xanh dương',
        bronze: 'Vàng đồng',
        purple: 'Tím',
        pink: 'Hồng đậm',
        teal: 'Xanh ngọc',
        gray: 'Xám',
      },
    },
    csv: {
      title: 'Nhập từ file CSV',
      description: (columns: string) => `Dòng đầu là tên cột: ${columns}.`,
      deck: 'Thêm vào bộ',
      choose: 'Chọn file .csv',
      hint: 'Xuất từ Excel/Google Sheets ở dạng CSV (UTF-8)',
      valid: (n: number) => `${n} từ hợp lệ`,
      duplicates: (n: number) => ` · ${n} từ đã có trong sổ sẽ bỏ qua`,
      moreErrors: (n: number) => `… và ${n} lỗi khác`,
      import: (n: number) => `Nhập ${n} từ`,
      done: (added: number, skipped: number) =>
        `Đã thêm ${added} từ${skipped ? `, bỏ qua ${skipped} từ đã có trong sổ` : ''}.`,
      errors: {
        empty: 'File trống.',
        missingColumns: (columns: string) => `Thiếu cột bắt buộc: ${columns}.`,
        missingFields: (line: number) => `Dòng ${line}: thiếu từ hoặc nghĩa tiếng Việt.`,
        duplicate: (line: number, word: string) => `Dòng ${line}: "${word}" bị lặp trong file.`,
        badLevel: (line: number, level: string) => `Dòng ${line}: cấp độ "${level}" không hợp lệ, đã bỏ trống.`,
      },
    },
  },
}

export type Messages = typeof vi
