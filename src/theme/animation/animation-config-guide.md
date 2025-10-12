| **Tên**                 | **Loại**                | **Công dụng**                                                                   | **Cách sử dụng**                                                                             |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `transitions`           | Object các `Transition` | Các config chuẩn cho chuyển động (`smooth`, `spring`, `bouncy`, `slow`, `fast`) | `transition: transitions.smooth`                                                             |
| `fadeVariants`          | Variants                | Hiệu ứng mờ dần (fade in/out)                                                   | `<motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" />`      |
| `slideVariants`         | Object nhiều Variants   | Hiệu ứng trượt từ trái/phải/trên/dưới + fade                                    | `variants={slideVariants.slideInLeft}`                                                       |
| `scaleVariants`         | Variants                | Phóng to/thu nhỏ + hover/tap scale                                              | `<motion.button variants={scaleVariants} whileHover="hover" whileTap="tap" />`               |
| `rotateVariants`        | Variants                | Xoay + fade in/out                                                              | `variants={rotateVariants}`                                                                  |
| `containerVariants`     | Variants                | Container có hiệu ứng `staggerChildren` (lần lượt animate từng child)           | `<motion.ul variants={containerVariants} initial="hidden" animate="visible">...</motion.ul>` |
| `listItemVariants`      | Variants                | Item trong list xuất hiện từ dưới lên                                           | `<motion.li variants={listItemVariants} />`                                                  |
| `modalVariants`         | Variants                | Mở popup với scale + fade + slide nhẹ                                           | `<motion.div variants={modalVariants} />`                                                    |
| `backdropVariants`      | Variants                | Làm tối nền khi mở modal                                                        | `<motion.div variants={backdropVariants} />`                                                 |
| `buttonVariants`        | Variants                | Hover + tap cho button (scale + shadow)                                         | `<motion.button variants={buttonVariants} whileHover="hover" whileTap="tap" />`              |
| `cardVariants`          | Variants                | Card xuất hiện + hover nổi lên                                                  | `<motion.div variants={cardVariants} whileHover="hover" />`                                  |
| `spinnerVariants`       | Variants                | Loading spinner xoay vô hạn                                                     | `<motion.div variants={spinnerVariants} animate="spin" />`                                   |
| `progressVariants`      | Variants (dynamic)      | Thanh progress tăng width theo %                                                | `<motion.div variants={progressVariants} animate="animate" custom={progress} />`             |
| `toastVariants`         | Variants                | Notification/toast trượt từ bên phải vào                                        | `<motion.div variants={toastVariants} />`                                                    |
| `pageVariants`          | Variants                | Transition khi đổi page (fade + slide)                                          | `<motion.div variants={pageVariants} initial="initial" animate="in" exit="out" />`           |
| `createDelayedVariants` | Function                | Tạo lại 1 bộ variants với delay thêm                                            | `const delayedFade = createDelayedVariants(fadeVariants, 0.5)`                               |
| `animationPresets`      | Object tổng hợp         | Gom nhanh các preset vào 1 object tiện dùng                                     | `variants={animationPresets.fade}`                                                           |


# 🎬 Animation System - Complete Guide

## 📋 What We Fixed & Improved

### ✅ **Before (Issues Fixed):**
- ❌ Animations only ran once on page load
- ❌ Missing `useState` import causing errors
- ❌ No scroll-triggered animations
- ❌ Limited animation variety
- ❌ TypeScript type errors

### ✅ **After (Current State):**
- ✅ **Repeatable animations** - trigger every time you scroll to them
- ✅ **Scroll-triggered** - elements animate when they enter viewport
- ✅ **Dynamic variety** - slide from left, right, bottom, bounce, elastic
- ✅ **TypeScript safe** - proper type definitions
- ✅ **Smooth performance** - optimized spring physics

---

## 🎯 Animation Behavior

### **Current Setting: `once: false`**
```typescript
viewport={{ once: false, amount: 0.3 }}
```

**What this means:**
- ✨ **Repeatable**: Animations trigger **every time** an element enters viewport
- 🎯 **Trigger Point**: When 30% of element is visible
- 🔄 **Re-trigger**: Scroll away and back = animation plays again

### **Alternative Settings:**
```typescript
// One-time only (original behavior)
viewport={{ once: true, amount: 0.3 }}

// Early trigger (10% visible)  
viewport={{ once: false, amount: 0.1 }}

// Late trigger (50% visible)
viewport={{ once: false, amount: 0.5 }}
```

---

## 🎨 Animation Types Used

### **1. Hero Section**
```typescript
// Left content slides from left with delays
variants={slideVariants.slideInLeft}
transition={{ delay: 0.2 }}  // Title
transition={{ delay: 0.4 }}  // Subtitle  
transition={{ delay: 0.6 }}  // Buttons

// Right content slides from right with scale
variants={slideVariants.slideInRight}
variants={scaleVariants}  // Lottie animation
```

### **2. Section Headers**
```typescript
// Bounces in with elastic scale
variants={repeatableVariants.bounceIn}
viewport={viewportConfigs.repeat}
```

### **3. Chart Section**
```typescript
// Left grid slides from left
variants={repeatableVariants.slideRepeatLeft}

// Right preview slides from right  
variants={repeatableVariants.slideRepeatRight}
```

### **4. Features Grid**
```typescript
// Header with elastic fade
variants={repeatableVariants.fadeElastic}

// Cards slide up from bottom with stagger
variants={repeatableVariants.slideRepeatBottom}
transition={{ delay: index * 0.1 }}  // Staggered timing
```

### **5. Help Section Cards**
```typescript
// Left card from left
variants={slideVariants.slideInLeft}

// Right card from right
variants={slideVariants.slideInRight}
```

---

## 🛠️ Animation Configuration

### **New Repeatable Variants:**
```typescript
export const repeatableVariants = {
  slideRepeatLeft: {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: springConfig }
  },
  slideRepeatRight: {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: springConfig }
  },
  slideRepeatBottom: {
    hidden: { y: 80, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: springConfig }
  },
  fadeElastic: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: elasticConfig }
  },
  bounceIn: {
    hidden: { opacity: 0, scale: 0.3, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: bounceConfig }
  }
}
```

### **Viewport Configurations:**
```typescript
export const viewportConfigs = {
  standard: { once: true, amount: 0.3 },   // One-time, 30%
  repeat: { once: false, amount: 0.3 },    // Repeatable, 30%
  early: { once: true, amount: 0.1 },      // One-time, 10%
  repeatEarly: { once: false, amount: 0.1 }, // Repeatable, 10%
  late: { once: true, amount: 0.5 },       // One-time, 50%
  repeatLate: { once: false, amount: 0.5 }  // Repeatable, 50%
}
```

---

## 🚀 How to Test

### **1. Start Development Server:**
```bash
cd FE_WEB_CUSTOMER
npm run dev
```

### **2. Test Animation Demo:**
Open the demo file to see different animation types:
- `src/pages/animation-repeat-demo.html` - Interactive demo
- `src/pages/animation-test.html` - Basic preview

### **3. Test Your Homepage:**
1. Navigate to your homepage
2. **Scroll slowly** through each section
3. **Scroll back up** - animations should replay!
4. Notice different animation styles per section

---

## 🎭 Animation Sequence

### **Scroll Experience:**
1. **Hero**: Text slides from left, Lottie from right
2. **Chart Types**: Header bounces, grid from left, preview from right  
3. **Features**: Header elastic fade, cards slide up with stagger
4. **Videos**: Content slides from opposite sides
5. **Stories**: Header bounces, cards use container stagger
6. **Help**: Header bounces, cards from left/right
7. **CTA**: Content slides up from bottom

### **Timing Details:**
- **Spring Physics**: Smooth, natural movement
- **Stagger Delays**: 0.1s between grouped elements
- **Viewport Trigger**: 30% visibility threshold
- **Re-trigger**: Every scroll cycle

---

## 🔧 Customization Options

### **To Change Trigger Behavior:**
```typescript
// Make animations run only once
viewport={{ once: true, amount: 0.3 }}

// Make them more sensitive (trigger earlier)
viewport={{ once: false, amount: 0.1 }}

// Make them less sensitive (trigger later)  
viewport={{ once: false, amount: 0.7 }}
```

### **To Change Animation Style:**
```typescript
// Replace any animation with:
variants={slideVariants.slideInLeft}     // Original slide
variants={repeatableVariants.bounceIn}   // New bounce effect
variants={repeatableVariants.fadeElastic} // New elastic fade
```

---

## 📊 Performance Notes

- ✅ **Optimized**: Uses CSS transforms (GPU accelerated)
- ✅ **Smooth**: Spring physics with proper damping
- ✅ **Efficient**: IntersectionObserver for scroll detection
- ✅ **Responsive**: Works on all screen sizes
- ✅ **Accessible**: Respects user motion preferences

---

## 🎉 Result

Your homepage now has **dynamic, repeatable animations** that create an engaging scroll experience! Each section has its own animation personality while maintaining smooth performance and professional feel.

**Key Benefits:**
- 🔄 **Re-engaging**: Animations replay on each visit to section
- 🎨 **Varied**: Different animation styles prevent monotony  
- ⚡ **Smooth**: Spring physics feel natural and responsive
- 📱 **Universal**: Works across all devices and browsers