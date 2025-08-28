// === 全局类型声明文件 ===

// Google Analytics 全局对象
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// 确保这个文件被视为模块
export {}
