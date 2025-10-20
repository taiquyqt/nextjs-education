export const steps = [
  {
    selector: '[data-tour="exam-info"]',
    content: (
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-green-700 flex items-center gap-2">
          📝 Bước 1: Nhập thông tin đề thi
        </h3>
        <p className="text-sm leading-relaxed">
          Hãy điền đầy đủ thông tin về đề thi của bạn: tiêu đề, khối lớp, môn
          học, thời gian và mô tả. Những thông tin này sẽ giúp AI tạo ra đề thi
          phù hợp nhất!
        </p>
        <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
          <p className="text-xs text-green-700">
            💡 <strong>Mẹo:</strong> Hãy mô tả chi tiết về nội dung và độ khó
            mong muốn trong phần "Mô tả đề"
          </p>
        </div>
      </div>
    ),
  },
  {
    selector: '[data-tour="file-upload"]',
    content: (
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-blue-700 flex items-center gap-2">
          📁 Bước 2: Tải tài liệu lên
        </h3>
        <p className="text-sm leading-relaxed">
          Kéo thả hoặc chọn file tài liệu của bạn. Hệ thống hỗ trợ nhiều định
          dạng: PDF, DOCX, TXT, MD...
        </p>
        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
          <p className="text-xs text-blue-700">
            💡 <strong>Gợi ý file tốt:</strong> Tài liệu có cấu trúc rõ ràng,
            nội dung đầy đủ, không quá nhiều hình ảnh
          </p>
        </div>
      </div>
    ),
  },
  {
    selector: '[data-tour="ai-config"]',
    content: (
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-purple-700 flex items-center gap-2">
          ⚙️ Bước 3: Cấu hình AI
        </h3>
        <p className="text-sm leading-relaxed">
          Chọn cách thức AI xử lý tài liệu và tạo câu hỏi. Hãy thử click vào
          dropdown để xem các tùy chọn!
        </p>
        <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
          <p className="text-xs text-purple-700">
            💡 <strong>Lựa chọn:</strong> "EXTRACT" nếu tài liệu đã có sẵn câu
            hỏi, "GENERATE" để AI tự tạo mới
          </p>
        </div>
      </div>
    ),
  },
  {
    selector: '[data-tour="generate-action"]',
    content: (
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-orange-700 flex items-center gap-2">
          🚀 Bước 4: Tạo đề thi
        </h3>
        <p className="text-sm leading-relaxed">
          Khi đã hoàn thành các bước trên, nhấn nút này để AI bắt đầu tạo đề thi
          cho bạn. Quá trình có thể mất vài phút tùy thuộc vào độ phức tạp!
        </p>
        <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400">
          <p className="text-xs text-orange-700">
            🎉 <strong>Hoàn thành:</strong> Bạn đã sẵn sàng tạo đề thi AI đầu
            tiên của mình!
          </p>
        </div>
      </div>
    ),
  },
];
