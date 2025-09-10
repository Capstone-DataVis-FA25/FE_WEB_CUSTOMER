# Framer Motion: Tất Cả Thuộc Tính của Prop `animate`

Dưới đây là bảng liệt kê các thuộc tính phổ biến dùng trong prop `animate` của Framer Motion, kèm ý nghĩa và công dụng thực tế.

| **Thuộc tính**              | **Ý nghĩa**                                                | **Công dụng**                                                          |
| --------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| **CSS Properties**          |                                                            |                                                                        |
| `opacity`                   | Độ trong suốt (0: ẩn, 1: hiện). Giá trị: number (0-1).     | Fade in/out cho hero section, modal, hoặc loading spinner.             |
| `backgroundColor`           | Màu nền (hex, rgb, rgba, color name).                      | Chuyển màu nền mượt khi hover (card, button), hoặc theme toggle.       |
| `color`                     | Màu chữ (hex, rgb, rgba).                                  | Animate text color cho heading, link hover, hoặc dark mode transition. |
| `width`                     | Chiều rộng (px, %, vw, rem, em).                           | Resize container (menu expand), hoặc progress bar theo data.           |
| `height`                    | Chiều cao (px, %, vh, rem, em).                            | Animate modal height, hoặc accordion expand/collapse.                  |
| `borderRadius`              | Bo góc (px, %, rem).                                       | Smooth transition cho button corner khi hover, hoặc card shape morph.  |
| `boxShadow`                 | Đổ bóng (CSS shadow syntax).                               | Tạo elevation effect (card lift khi hover), hoặc glowing button.       |
| `filter`                    | Hiệu ứng filter (blur(px), brightness(%), grayscale).      | Blur background khi modal mở, hoặc desaturate image khi scroll.        |
| **Transform Properties**    |                                                            |                                                                        |
| `x`                         | Dịch chuyển ngang (px, %, vw). Âm: trái, dương: phải.      | Slide menu từ cạnh, hoặc stagger items trong list.                     |
| `y`                         | Dịch chuyển dọc (px, %, vh). Âm: lên, dương: xuống.        | Parallax effect cho hero image, hoặc scroll-triggered text reveal.     |
| `scale`                     | Phóng to/thu nhỏ (number, 1: nguyên bản, >1: to, <1: nhỏ). | Zoom button khi hover, hoặc scale card khi click.                      |
| `scaleX`                    | Phóng ngang (number).                                      | Stretch progress bar, hoặc deform element cho animation creative.      |
| `scaleY`                    | Phóng dọc (number).                                        | Expand accordion, hoặc vertical pulse cho loading indicator.           |
| `rotate`                    | Xoay (độ, number). Dương: kim giờ, âm: ngược.              | Rotate icon (hamburger menu), hoặc spin loader.                        |
| `skewX`                     | Nghiêng ngang (độ, number).                                | Tilt card khi hover, hoặc tạo hiệu ứng "động" cho gallery.             |
| `skewY`                     | Nghiêng dọc (độ, number).                                  | Skew text cho stylized title, hoặc dynamic shape morphing.             |
| **3D Transform Properties** |                                                            |                                                                        |
| `rotateX`                   | Xoay quanh trục X (độ, number). Yêu cầu `perspective`.     | 3D card flip (như lật sách), hoặc tilt section khi scroll.             |
| `rotateY`                   | Xoay quanh trục Y (độ, number).                            | 3D product viewer (xoay mô hình), hoặc hover card effect.              |
| `rotateZ`                   | Xoay quanh trục Z (độ, tương tự rotate).                   | Spin logo, hoặc 3D rotation cho interactive widget.                    |
| `z`                         | Độ sâu (px, number). Yêu cầu `perspective`.                | Push/pull element trong không gian 3D, dùng cho layered UI.            |
| `perspective`               | Độ sâu trường nhìn (px, number).                           | Tăng tính chân thực cho 3D animations (card stack, depth effect).      |
| `scaleZ`                    | Phóng sâu (number).                                        | 3D zoom cho elements trong không gian, dùng cho AR-like previews.      |
| **SVG-Specific Properties** |                                                            |                                                                        |
| `pathLength`                | Độ dài nét vẽ của SVG path (0-1).                          | Stroke draw animation cho icon, logo, hoặc progress circle.            |
| `pathOffset`                | Dịch chuyển điểm bắt đầu của path (0-1).                   | Animate path "chạy" (như loading ring), hoặc text outline effect.      |
| `pathSpacing`               | Khoảng cách giữa các đoạn path (0-1).                      | Dash animation cho dotted lines, hoặc stylized SVG effects.            |
| `fill`                      | Màu tô SVG (hex, rgb, rgba).                               | Fill color transition cho charts, hoặc icon hover effects.             |
| `stroke`                    | Màu viền SVG (hex, rgb, rgba).                             | Animate stroke color cho data viz, hoặc outline emphasis.              |
| `strokeWidth`               | Độ dày viền SVG (px, number).                              | Thicken stroke khi hover, hoặc animate line growth.                    |
| **Custom & Advanced**       |                                                            |                                                                        |
| `originX`                   | Điểm gốc X cho transform (0: trái, 1: phải, 0.5: giữa).    | Điều chỉnh pivot cho rotate/scale (xoay quanh góc trái/phải).          |
| `originY`                   | Điểm gốc Y cho transform (0: trên, 1: dưới, 0.5: giữa).    | Custom pivot cho flip animations, hoặc non-center scaling.             |
| `transform`                 | Chuỗi transform CSS (scale(1) translateX(10px)).           | Kết hợp nhiều transform thủ công, dùng khi cần override phức tạp.      |
| `clipPath`                  | Cắt hình theo path (CSS clip-path syntax).                 | Reveal effect (circle expand), hoặc shape morphing cho creative UI.    |
| `mixBlendMode`              | Chế độ hòa trộn (overlay, multiply, v.v.).                 | Artistic effects cho images (blend với background), hoặc hover glow.   |
