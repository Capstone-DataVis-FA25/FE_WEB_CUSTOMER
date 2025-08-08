export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Tên: chỉ chữ cái (có thể có dấu, khoảng trắng), tối thiểu 2 ký tự
export const NAME_REGEX = /^[A-Za-zÀ-ỹ\s]{2,}$/;

// Mật khẩu: tối thiểu 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
