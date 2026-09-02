import json

vi_translations = {
  "header": {
    "guide": "Hướng dẫn",
    "github": "GitHub",
    "editor": "Vào trình chỉnh sửa",
    "donate": "Ủng hộ",
    "login": "Đăng nhập",
    "logout": "Đăng xuất",
    "loggingOut": "Đang đăng xuất...",
    "menu": "Menu",
    "screen": "Ghi màn hình",
    "close": "Đóng"
  },
  "footer": {
    "description": "Ứng dụng hiện đại để <recording>ghi màn hình</recording> và <editing>chỉnh sửa video</editing>. Thiết kế cho nền tảng web. Không cần cài đặt, không cần chờ đợi, chạy trực tiếp trên trình duyệt của bạn.",
    "recording": "ghi màn hình",
    "editing": "chỉnh sửa video",
    "product": "Sản phẩm",
    "contact": "Liên hệ",
    "legal": "Pháp lý",
    "privacy": "Chính sách bảo mật",
    "terms": "Điều khoản sử dụng",
    "rights": "Bảo lưu mọi quyền.",
    "guide": "Hướng dẫn",
    "editor": "Vào trình chỉnh sửa",
    "donate": "Ủng hộ",
    "github": "GitHub",
    "email": "Email"
  },
  "privacy": {
    "backToHome": "Quay lại trang chủ",
    "title": "Chính sách bảo mật",
    "lastUpdated": "Cập nhật lần cuối: {date}",
    "intro": {
      "title": "Giới thiệu",
      "content": "Tại openvid, chúng tôi tôn trọng quyền riêng tư của bạn và cam kết bảo vệ thông tin cá nhân của bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu khi bạn sử dụng nền tảng của chúng tôi."
    },
    "collection": {
      "title": "Thông tin chúng tôi thu thập",
      "content": "Chúng tôi thu thập các thông tin sau khi bạn sử dụng openvid:",
      "items": [
        "Thông tin tài khoản (email, tên) nếu bạn đăng ký qua Google",
        "Dữ liệu sử dụng và phân tích để cải thiện trải nghiệm",
        "Thông tin kỹ thuật như loại trình duyệt và hệ điều hành",
        "Video và nội dung bạn xử lý (chỉ xử lý tạm thời, không bao giờ lưu trữ trên máy chủ)"
      ]
    },
    "usage": {
      "title": "Cách chúng tôi sử dụng thông tin",
      "content": "Chúng tôi sử dụng thông tin của bạn để:",
      "items": [
        "Cung cấp và duy trì dịch vụ",
        "Cải thiện trải nghiệm người dùng",
        "Gửi các cập nhật dịch vụ quan trọng",
        "Phân tích việc sử dụng nền tảng",
        "Bảo vệ chống lại các hoạt động gian lận"
      ]
    },
    "processing": {
      "title": "Xử lý Video",
      "badge": "Mọi quá trình xử lý video diễn ra hoàn toàn trong trình duyệt của bạn bằng các công nghệ web hiện đại (WebAssembly, FFmpeg.wasm). Video của bạn không bao giờ được tải lên máy chủ của chúng tôi. Toàn bộ quy trình là cục bộ và riêng tư."
    },
    "cookies": {
      "title": "Cookie và công nghệ tương tự",
      "content": "Chúng tôi sử dụng cookie và các công nghệ tương tự để:",
      "items": [
        "Duy trì phiên đăng nhập của bạn",
        "Ghi nhớ tùy chọn cài đặt của bạn",
        "Phân tích hiệu suất trang web",
        "Nâng cao tính bảo mật"
      ],
      "note": "Bạn có thể định cấu hình trình duyệt để từ chối cookie, nhưng điều này có thể ảnh hưởng đến một số tính năng của ứng dụng."
    },
    "sharing": {
      "title": "Chia sẻ thông tin",
      "content": "Chúng tôi không bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba, ngoại trừ các trường hợp sau:",
      "items": [
        "Có sự đồng ý rõ ràng của bạn",
        "Tuân thủ các nghĩa vụ pháp lý",
        "Bảo vệ quyền và sự an toàn của chúng tôi"
      ]
    },
    "security": {
      "title": "Bảo mật",
      "content": "Chúng tôi thực hiện các biện pháp bảo mật kỹ thuật và tổ chức để bảo vệ thông tin của bạn:",
      "items": [
        "Mã hóa dữ liệu trong quá trình truyền (HTTPS)",
        "Xác thực an toàn thông qua các nhà cung cấp đáng tin cậy",
        "Hạn chế quyền truy cập vào thông tin cá nhân",
        "Kiểm toán bảo mật định kỳ"
      ]
    },
    "rights": {
      "title": "Quyền của bạn",
      "content": "Bạn có quyền:",
      "items": [
        "Truy cập thông tin cá nhân của bạn",
        "Sửa chữa dữ liệu không chính xác",
        "Yêu cầu xóa tài khoản của bạn",
        "Phản đối việc xử lý dữ liệu",
        "Yêu cầu xuất dữ liệu của bạn"
      ]
    },
    "contact": {
      "title": "Liên hệ",
      "content": "Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, bạn có thể liên hệ với chúng tôi qua:"
    }
  },
  "terms": {
    "backToHome": "Quay lại trang chủ",
    "title": "Điều khoản dịch vụ",
    "lastUpdated": "Cập nhật lần cuối: {date}",
    "acceptance": {
      "title": "1. Chấp nhận điều khoản",
      "content": "Bằng cách truy cập và sử dụng openvid, bạn đồng ý tuân thủ các Điều khoản dịch vụ này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, bạn không được phép sử dụng dịch vụ."
    },
    "description": {
      "title": "2. Mô tả dịch vụ",
      "content": "openvid là một trình chỉnh sửa video trực tuyến cho phép người dùng ghi màn hình, áp dụng hiệu ứng thu phóng (zoom), sử dụng mockup 3D và xuất video chất lượng cao mà không có hình mờ (watermark)."
    },
    "usage": {
      "title": "3. Sử dụng dịch vụ hợp lệ",
      "content": "Bạn đồng ý chỉ sử dụng dịch vụ cho các mục đích hợp pháp và theo các điều khoản này. Bạn không được:",
      "items": [
        "Sử dụng dịch vụ theo bất kỳ cách nào vi phạm pháp luật hiện hành",
        "Cố gắng truy cập trái phép vào bất kỳ phần nào của dịch vụ",
        "Can thiệp hoặc làm gián đoạn tính toàn vẹn hoặc hiệu suất của dịch vụ",
        "Tải lên hoặc xử lý nội dung vi phạm quyền sở hữu trí tuệ của người khác"
      ]
    },
    "privacyNotice": {
      "title": "4. Quyền riêng tư & Xử lý cục bộ",
      "content": "Tất cả các tệp đa phương tiện của bạn được xử lý cục bộ trên thiết bị của bạn. Chúng tôi không lưu trữ các video đã quay hoặc các tệp đã chỉnh sửa của bạn trên máy chủ của chúng tôi."
    },
    "intellectualProperty": {
      "title": "5. Sở hữu trí tuệ",
      "content": "Dịch vụ và nội dung gốc, các tính năng và chức năng của nó là tài sản của openvid và được bảo vệ bởi luật bản quyền, nhãn hiệu và các luật sở hữu trí tuệ khác."
    },
    "limitation": {
      "title": "6. Giới hạn trách nhiệm",
      "content": "Trong mọi trường hợp, openvid hoặc các nhà phát triển của nó sẽ không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt hoặc do hậu quả nào phát sinh từ việc bạn sử dụng dịch vụ."
    },
    "changes": {
      "title": "7. Thay đổi điều khoản",
      "content": "Chúng tôi bảo lưu quyền sửa đổi hoặc thay thế các điều khoản này bất kỳ lúc nào. Việc tiếp tục sử dụng dịch vụ sau các thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới."
    },
    "contact": {
      "title": "8. Liên hệ",
      "content": "Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi."
    }
  },
  "hero": {
    "badge": "Trình chỉnh sửa Video & Ghi màn hình trên Web",
    "title": "Tạo video demo chuyên nghiệp trong vài giây",
    "titleHighlight": "hoàn toàn miễn phí",
    "description": "Ghi màn hình, tự động zoom thông minh, mockup thiết bị 3D và xuất video 4K sắc nét. Mọi thứ xử lý trực tiếp trên trình duyệt, không gắn watermark.",
    "cta": "Mở trình chỉnh sửa",
    "recordCta": "Bắt đầu ghi hình",
    "features": {
      "noWatermark": "Không có watermark",
      "noInstall": "Không cần cài đặt",
      "privacy": "Bảo mật 100% cục bộ"
    }
  },
  "recording": {
    "start": "Bắt đầu ghi",
    "stop": "Dừng ghi",
    "pause": "Tạm dừng",
    "resume": "Tiếp tục",
    "cancel": "Hủy bỏ",
    "permissionDenied": "Quyền truy cập màn hình bị từ chối.",
    "recordingInProgress": "Đang ghi màn hình...",
    "step1": {
      "title": "Chọn màn hình",
      "description": "Chọn cửa sổ hoặc toàn màn hình bạn muốn quay."
    },
    "step2": {
      "title": "Bật micro",
      "description": "Tùy chọn thu âm giọng nói cùng với âm thanh hệ thống."
    },
    "step3": {
      "title": "Bắt đầu ghi",
      "description": "Nhấp vào nút ghi và thực hiện thao tác trình diễn."
    },
    "step4": {
      "title": "Chỉnh sửa ngay lập tức",
      "description": "Video sẽ tự động mở trong trình chỉnh sửa sau khi dừng quay.",
      "visual": {
        "stop": "Dừng ghi"
      }
    }
  },
  "login": {
    "title": "Đăng nhập",
    "subtitle": "Đăng nhập vào tài khoản của bạn để quản lý dự án",
    "google": "Tiếp tục với Google",
    "github": "Tiếp tục với GitHub",
    "email": "Địa chỉ Email",
    "password": "Mật khẩu",
    "submit": "Đăng nhập",
    "noAccount": "Chưa có tài khoản?",
    "signUp": "Đăng ký",
    "terms": "Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi."
  },
  "placeholder": {
    "loading": "Đang tải...",
    "noData": "Không có dữ liệu",
    "dropHere": "Kéo thả tệp video hoặc ảnh vào đây",
    "browse": "Chọn tệp từ máy tính",
    "supportFormats": "Hỗ trợ MP4, WebM, MOV, PNG, JPG, GIF"
  },
  "notFound": {
    "title": "404 - Không tìm thấy trang",
    "description": "Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.",
    "backHome": "Về trang chủ"
  },
  "userMenu": {
    "myProjects": "Dự án của tôi",
    "accountSettings": "Cài đặt tài khoản",
    "theme": "Giao diện",
    "language": "Ngôn ngữ",
    "logout": "Đăng xuất"
  },
  "donation": {
    "title": "Ủng hộ dự án openvid",
    "description": "openvid là dự án mã nguồn mở hoàn toàn miễn phí. Sự ủng hộ của bạn giúp duy trì và phát triển thêm nhiều tính năng mới.",
    "page": {
      "title": "Ủng hộ dự án",
      "description": "Hỗ trợ phát triển openvid",
      "yape": {
        "tagline": "Chuyển khoản nhanh",
        "detail": "Quét mã QR hoặc chuyển khoản qua số điện thoại"
      },
      "visa": {
        "tagline": "Thẻ tín dụng / Ghi nợ",
        "detail": "Chuyển khoản ngân hàng trực tiếp"
      },
      "paypal": {
        "tagline": "Ủng hộ qua PayPal",
        "detail": "Thanh toán an toàn toàn cầu"
      }
    }
  },
  "demo": {
    "title": "Xem bản trình diễn",
    "play": "Phát video",
    "pause": "Tạm dừng",
    "feature1": "Thu phóng chuyển động mượt mà",
    "feature2": "Khung thiết bị mockup 3D chân thực",
    "feature3": "Âm thanh click chuột chuẩn xác"
  },
  "recordingSetup": {
    "title": "Cài đặt ghi màn hình",
    "screenSource": "Nguồn màn hình",
    "audioSource": "Nguồn âm thanh",
    "includeMic": "Kèm Micro",
    "includeSystemAudio": "Kèm âm thanh hệ thống",
    "quality": "Chất lượng video",
    "fps": "Khung hình / giây (FPS)",
    "startRecording": "Bắt đầu ghi",
    "countdown": "Đếm ngược"
  },
  "controlPanel": {
    "title": "Bảng điều khiển",
    "background": "Hình nền",
    "mockup": "Khung Mockup",
    "zoom": "Thu phóng (Zoom)",
    "motion": "Chuyển động",
    "camera": "Camera",
    "elements": "Yếu tố (Text/Icon)",
    "audio": "Âm thanh",
    "history": "Lịch sử",
    "aspectRatio": "Tỷ lệ khung hình",
    "padding": "Khoảng đệm",
    "roundedCorners": "Bo góc",
    "shadow": "Đổ bóng",
    "blur": "Độ mờ hậu cảnh"
  },
  "toolsSidebar": {
    "background": "Nền",
    "mockup": "Mockup",
    "zoom": "Zoom",
    "camera": "Camera",
    "elements": "Yếu tố",
    "audio": "Âm thanh",
    "motion": "Chuyển động",
    "aspectRatio": "Tỷ lệ",
    "export": "Xuất video",
    "settings": "Cài đặt"
  },
  "historyMenu": {
    "title": "Lịch sử chỉnh sửa",
    "undo": "Hoàn tác (Undo)",
    "redo": "Làm lại (Redo)",
    "clear": "Xóa lịch sử",
    "empty": "Chưa có thao tác nào"
  },
  "wallpapers": {
    "title": "Hình nền & Màu sắc",
    "gradient": "Chuyển sắc (Gradient)",
    "solid": "Màu đơn (Solid)",
    "mesh": "Hiệu ứng Mesh",
    "custom": "Tùy chỉnh",
    "image": "Hình ảnh nền",
    "uploadImage": "Tải ảnh nền lên",
    "blur": "Độ mờ hậu cảnh"
  },
  "colorEditor": {
    "title": "Bộ chọn màu",
    "hex": "Mã HEX",
    "presets": "Màu mẫu có sẵn",
    "angle": "Góc xoay Gradient",
    "opacity": "Độ mờ đục"
  },
  "imageRecentGrid": {
    "title": "Ảnh gần đây",
    "empty": "Chưa có ảnh nào được tải lên"
  },
  "mockupMenu": {
    "title": "Khung thiết bị Mockup",
    "browser": "Trình duyệt (Browser)",
    "laptop": "MacBook / Laptop",
    "phone": "iPhone / Smartphone",
    "tablet": "iPad / Tablet",
    "monitor": "Màn hình Studio",
    "none": "Không dùng khung",
    "style": "Kiểu dáng",
    "darkMode": "Giao diện tối",
    "lightMode": "Giao diện sáng",
    "glass": "Hiệu ứng kính mờ"
  },
  "videosMenu": {
    "title": "Quản lý Video",
    "library": "Thư viện video",
    "uploadNew": "Tải video mới lên",
    "recorded": "Video vừa quay",
    "delete": "Xóa video",
    "duration": "Thời lượng"
  },
  "elementsMenu": {
    "title": "Thêm yếu tố đồ họa",
    "text": "Văn bản (Text)",
    "addText": "Thêm chữ",
    "shapes": "Hình khối & Mũi tên",
    "icons": "Biểu tượng (Icon)",
    "stickers": "Nhãn dán (Stickers)",
    "color": "Màu sắc",
    "fontSize": "Cỡ chữ",
    "fontFamily": "Phông chữ",
    "alignment": "Căn lề"
  },
  "zoomFragmentEditor": {
    "title": "Chỉnh sửa đoạn Zoom",
    "zoomLevel": "Mức độ thu phóng",
    "position": "Vị trí tâm điểm",
    "startTime": "Thời điểm bắt đầu",
    "endTime": "Thời điểm kết thúc",
    "duration": "Thời lượng",
    "speed": "Tốc độ mượt mà",
    "delete": "Xóa đoạn Zoom",
    "duplicate": "Nhân bản",
    "focusCenter": "Trọng tâm Zoom"
  },
  "zoomGlobalConfig": {
    "title": "Cấu hình Zoom",
    "addFragment": "Thêm đoạn Zoom mới",
    "autoZoom": "✨ Tự động Zoom theo Click chuột",
    "autoZoomDesc": "Tự động phát hiện chuột & tạo Keyframe Zoom cho toàn bộ video",
    "clickSound": "Âm thanh Click chuột",
    "analyzing": "Đang phân tích video...",
    "generating": "Đang tự động tạo Keyframe Zoom...",
    "success": "Đã tạo thành công các đoạn Zoom!",
    "empty": "Chưa có đoạn Zoom nào trên dòng thời gian"
  },
  "cameraMenu": {
    "title": "Khung Camera Webcam",
    "shape": "Hình dạng camera",
    "circle": "Tròn",
    "rounded": "Vuông bo góc",
    "rect": "Hình chữ nhật",
    "size": "Kích thước",
    "position": "Vị trí",
    "border": "Viền camera",
    "shadow": "Đổ bóng",
    "flip": "Lật ngang camera"
  },
  "editor": {
    "title": "Trình chỉnh sửa Openvid",
    "play": "Phát",
    "pause": "Tạm dừng",
    "split": "Cắt đoạn (Split)",
    "delete": "Xóa",
    "mute": "Tắt tiếng gốc",
    "unmute": "Bật tiếng gốc",
    "export": "Xuất Video",
    "exporting": "Đang xuất...",
    "saving": "Đang lưu...",
    "saved": "Đã lưu",
    "untitled": "Dự án chưa đặt tên"
  },
  "playerControls": {
    "play": "Phát (Space)",
    "pause": "Tạm dừng (Space)",
    "backward": "Lùi 5s (←)",
    "forward": "Tiến 5s (→)",
    "mute": "Tắt âm thanh",
    "unmute": "Bật âm thanh",
    "volume": "Âm lượng",
    "speed": "Tốc độ phát",
    "loop": "Lặp lại",
    "fullscreen": "Toàn màn hình"
  },
  "aspectRatioSelect": {
    "title": "Tỷ lệ khung hình",
    "original": "Gốc",
    "landscape": "16:9 (Ngang - YouTube / TV)",
    "portrait": "9:16 (Dọc - TikTok / Shorts / Reels)",
    "square": "1:1 (Vuông - Instagram / Facebook)",
    "post": "4:5 (Dọc bài viết)",
    "cinema": "21:9 (Điện ảnh siêu rộng)"
  },
  "videoCropper": {
    "title": "Cắt xén khung hình Video",
    "apply": "Áp dụng cắt",
    "cancel": "Hủy bỏ",
    "reset": "Đặt lại gốc",
    "custom": "Tự do"
  },
  "timeline": {
    "title": "Dòng thời gian (Timeline)",
    "videoTrack": "Track Video",
    "zoomTrack": "Track Zoom",
    "audioTrack": "Track Âm thanh",
    "elementsTrack": "Track Yếu tố",
    "motionTrack": "Track Chuyển động",
    "cameraTrack": "Track Camera",
    "addTrack": "Thêm track",
    "zoomIn": "Phóng to timeline",
    "zoomOut": "Thu nhỏ timeline",
    "fit": "Vừa khung nhìn",
    "snapping": "Bắt dính điểm (Snap)",
    "timeFormat": "{minutes}:{seconds}"
  },
  "audioMenu": {
    "title": "Quản lý Âm thanh",
    "uploadAudio": "Tải tệp âm thanh lên (MP3, WAV, AAC)",
    "soundEffects": "Hiệu ứng âm thanh (SFX)",
    "timelineTracks": "Tracks âm thanh ({count})",
    "volume": "Âm lượng",
    "originalAudio": "Âm thanh gốc của Video",
    "muteOriginal": "Tắt âm thanh video gốc",
    "loop": "Lặp lại âm thanh",
    "trim": "Cắt đoạn âm thanh",
    "delete": "Xóa track",
    "clickSound": "Âm thanh Click chuột",
    "popSound": "Âm thanh Pop",
    "switchSound": "Âm thanh Phím cơ"
  },
  "exportOverlay": {
    "title": "Đang xuất Video của bạn...",
    "preparing": "Đang chuẩn bị khung hình...",
    "rendering": "Đang kết xuất và tổng hợp video...",
    "encoding": "Đang mã hóa MP4 / WebM...",
    "audioMixing": "Đang hòa trộn âm thanh...",
    "progress": "Tiến độ: {percent}%",
    "pleaseWait": "Vui lòng giữ tab này mở cho đến khi xuất xong.",
    "cancel": "Hủy xuất"
  },
  "photoPicker": {
    "title": "Chọn hình ảnh",
    "upload": "Tải ảnh mới",
    "fromUrl": "Từ đường link",
    "recent": "Ảnh gần đây"
  },
  "featuresShowcase": {
    "title": "Bộ tính năng chỉnh sửa mạnh mẽ",
    "subtitle": "Tất cả công cụ bạn cần để tạo video demo đỉnh cao",
    "feature1": {
      "title": "✨ AI Auto-Zoom thông minh",
      "description": "Tự động nhận diện thao tác chuột và áp dụng thu phóng mượt mà bám sát từng cú nhấp."
    },
    "feature2": {
      "title": "🖥️ Mockup thiết bị 3D",
      "description": "Kho khung hình MacBook, iPhone, Safari hiện đại giúp video trở nên bắt mắt và chuyên nghiệp."
    },
    "feature3": {
      "title": "🔊 Đồng bộ hiệu ứng âm thanh Click",
      "description": "Âm thanh nhấp chuột chuẩn phòng thu được thêm tự động theo từng nhịp thao tác."
    },
    "feature4": {
      "title": "⚡ Xuất 4K siêu nét không watermark",
      "description": "Xử lý hoàn toàn trong trình duyệt với công nghệ WebAssembly tốc độ cao, miễn phí 100%."
    }
  },
  "featuresGrid": {
    "title": "Vì sao các nhà sáng tạo chọn openvid?",
    "speed": {
      "title": "Tốc độ tức thì",
      "description": "Không cần chờ đợi tải video lên máy chủ, mọi xử lý diễn ra trực tiếp trên trình duyệt của bạn."
    },
    "privacy": {
      "title": "Bảo mật tuyệt đối",
      "description": "Dữ liệu và video cá nhân của bạn không bao giờ rời khỏi thiết bị."
    },
    "free": {
      "title": "Miễn phí & Không Watermark",
      "description": "Xuất video chất lượng cao mà không bị gắn logo hay đóng dấu bản quyền."
    }
  },
  "socialReactions": {
    "title": "Được tin dùng bởi hàng ngàn nhà phát triển & sáng tạo nội dung",
    "subtitle": "Xem cộng đồng nói gì về openvid"
  },
  "dropMedia": {
    "title": "Thả tệp vào đây để mở ngay",
    "subtitle": "Hỗ trợ tệp Video (.mp4, .webm, .mov) và Hình ảnh (.png, .jpg, .webp)"
  },
  "audioTrimModal": {
    "title": "Cắt đoạn âm thanh",
    "start": "Bắt đầu: {time}s",
    "end": "Kết thúc: {time}s",
    "duration": "Thời lượng: {duration}s",
    "apply": "Áp dụng",
    "cancel": "Hủy"
  },
  "motionMenu": {
    "title": "Hiệu ứng Chuyển động Mockup",
    "presets": "Mẫu chuyển động có sẵn",
    "subtle": "Chuyển động nhẹ nhàng",
    "float": "Hiệu ứng trôi bồng bềnh",
    "pan": "Lướt ngang / dọc",
    "tilt3D": "Nghiêng 3D điện ảnh",
    "intensity": "Cường độ chuyển động",
    "speed": "Tốc độ"
  },
  "MobileTools": {
    "title": "Công cụ chỉnh sửa",
    "close": "Đóng thanh công cụ"
  },
  "feedback": {
    "button": "Góp ý & Báo lỗi",
    "title": "Gửi ý kiến đóng góp",
    "placeholder": "Hãy cho chúng tôi biết bạn cần cải thiện điều gì hoặc gặp lỗi nào...",
    "emailPlaceholder": "Email của bạn (tùy chọn)",
    "send": "Gửi phản hồi",
    "sending": "Đang gửi...",
    "success": "Cảm ơn bạn! Phản hồi đã được gửi thành công.",
    "error": "Không thể gửi phản hồi. Vui lòng thử lại sau."
  },
  "tour": {
    "welcome": "Chào mừng đến với openvid!",
    "next": "Tiếp theo",
    "prev": "Quay lại",
    "finish": "Bắt đầu sử dụng",
    "step1": "Đây là thanh công cụ chính để điều chỉnh nền, mockup, zoom và âm thanh.",
    "step2": "Dòng thời gian giúp bạn quản lý các đoạn video, zoom keyframe và âm thanh dễ dàng.",
    "step3": "Bấm Xuất Video khi bạn đã hoàn thiện sản phẩm."
  },
  "labelSidebar": {
    "background": "Nền",
    "mockup": "Mockup",
    "zoom": "Zoom",
    "camera": "Camera",
    "elements": "Yếu tố",
    "audio": "Âm thanh",
    "motion": "Chuyển động",
    "crop": "Cắt khung",
    "export": "Xuất"
  },
  "heroPreview": {
    "play": "Phát bản xem thử",
    "pause": "Dừng bản xem thử"
  },
  "exportSuccess": {
    "title": "Xuất Video thành công!",
    "subtitle": "Video của bạn đã sẵn sàng để tải về và chia sẻ.",
    "download": "Tải video về máy",
    "downloading": "Đang tải xuống...",
    "openFolder": "Mở tệp",
    "close": "Đóng",
    "aiSocial": "✨ Tạo nội dung bài đăng mạng xã hội bằng AI",
    "aiSocialDesc": "Tự động soạn bài viết giới thiệu video cho X (Twitter), LinkedIn, Threads",
    "generatePosts": "Tạo bài viết AI",
    "generating": "Đang tạo nội dung...",
    "copy": "Sao chép",
    "copied": "Đã chép!",
    "starGithub": "Tặng sao cho dự án trên GitHub",
    "supportCoffee": "Ủng hộ dự án"
  }
}

with open('/home/data/openvid/messages/vi.json', 'w', encoding='utf-8') as f:
    json.dump(vi_translations, f, ensure_ascii=False, indent=2)

print("Created /home/data/openvid/messages/vi.json successfully!")
