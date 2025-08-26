---
title: "TypeScript 开发实用技巧"
description: "分享一些在日常 TypeScript 开发中非常实用的技巧和最佳实践，帮助你写出更好的类型安全代码。"
date: "2024-01-03"
tags: ["TypeScript", "JavaScript", "开发技巧", "类型安全"]
author: "作者"
---

# TypeScript 开发实用技巧

TypeScript 已经成为现代前端开发的标准选择。在这篇文章中，我将分享一些在日常开发中非常实用的 TypeScript 技巧。

## 1. 实用工具类型

### 提取对象键的类型

```typescript
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

type UserKeys = keyof User // 'id' | 'name' | 'email' | 'role'

// 创建一个函数，只接受 User 对象的键
function getUserField<K extends keyof User>(
  user: User,
  key: K
): User[K] {
  return user[key]
}
```

### 条件类型的强大用法

```typescript
// 检查类型是否为数组
type IsArray<T> = T extends (infer U)[] ? true : false

type Test1 = IsArray<string[]> // true
type Test2 = IsArray<string>   // false

// 提取 Promise 的返回类型
type Awaited<T> = T extends Promise<infer U> ? U : T

type ApiResponse = Awaited<Promise<{ data: string }>> // { data: string }
```

## 2. 高级类型操作

### 递归类型定义

```typescript
// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object 
    ? DeepReadonly<T[P]> 
    : T[P]
}

interface Config {
  database: {
    host: string
    port: number
    credentials: {
      username: string
      password: string
    }
  }
}

type ReadonlyConfig = DeepReadonly<Config>
// 所有属性都变成了 readonly
```

### 模板字面量类型

```typescript
// 创建 CSS 属性类型
type CSSProperty = 
  | 'margin' 
  | 'padding' 
  | 'border'

type Directions = 'top' | 'right' | 'bottom' | 'left'

type CSSPropertyWithDirection = `${CSSProperty}-${Directions}`
// 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left' | ...

// 事件处理函数命名
type EventNames = 'click' | 'focus' | 'blur'
type EventHandlers = {
  [K in EventNames as `on${Capitalize<K>}`]: (event: Event) => void
}
// { onClick: (event: Event) => void; onFocus: ...; onBlur: ... }
```

## 3. 类型守卫和断言

### 自定义类型守卫

```typescript
interface Fish {
  swim(): void
}

interface Bird {
  fly(): void
}

// 类型守卫函数
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined
}

function moveAnimal(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim() // TypeScript 知道这里 pet 是 Fish
  } else {
    pet.fly()  // TypeScript 知道这里 pet 是 Bird
  }
}
```

### 断言函数

```typescript
function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== 'number') {
    throw new Error('Expected number')
  }
}

function processValue(input: unknown) {
  assertIsNumber(input)
  // 这里 TypeScript 知道 input 是 number 类型
  console.log(input.toFixed(2))
}
```

## 4. 泛型的高级用法

### 映射类型

```typescript
// 创建可选版本
type Partial<T> = {
  [P in keyof T]?: T[P]
}

// 创建必需版本
type Required<T> = {
  [P in keyof T]-?: T[P]
}

// 选择特定属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

// 示例使用
interface User {
  id: number
  name: string
  email: string
  password: string
}

type UserProfile = Pick<User, 'id' | 'name' | 'email'>
// { id: number; name: string; email: string }

type CreateUserRequest = Omit<User, 'id'>
// { name: string; email: string; password: string }
```

### 分发条件类型

```typescript
type ToArray<T> = T extends any ? T[] : never

type StringOrNumberArray = ToArray<string | number>
// string[] | number[] (不是 (string | number)[])

// 过滤类型
type NonNullable<T> = T extends null | undefined ? never : T

type CleanType = NonNullable<string | null | undefined | number>
// string | number
```

## 5. 实际项目中的应用

### API 响应类型

```typescript
// 通用 API 响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 具体的 API 函数
async function fetchUser(id: number): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

// 使用时有完整的类型提示
const userResponse = await fetchUser(1)
if (userResponse.success && userResponse.data) {
  console.log(userResponse.data.name) // 完全类型安全
}
```

### React 组件类型

```typescript
// 通用组件属性类型
interface BaseProps {
  className?: string
  children?: React.ReactNode
}

// 按钮组件属性
interface ButtonProps extends BaseProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  onClick?: () => void
}

// 泛型组件
interface ListProps<T> extends BaseProps {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string | number
}

function List<T>({ items, renderItem, keyExtractor, ...props }: ListProps<T>) {
  return (
    <div {...props}>
      {items.map((item, index) => (
        <div key={keyExtractor(item)}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}
```

## 6. 配置和最佳实践

### tsconfig.json 配置

```json
{
  "compilerOptions": {
    "strict": true,                    // 启用所有严格检查
    "noUncheckedIndexedAccess": true, // 索引访问时包含 undefined
    "exactOptionalPropertyTypes": true, // 精确可选属性类型
    "noImplicitReturns": true,        // 函数必须有明确返回
    "noFallthroughCasesInSwitch": true, // switch 必须有 break
    "noImplicitOverride": true,       // 覆盖方法需要 override 关键字
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 代码组织建议

```typescript
// types/index.ts - 集中管理类型定义
export interface User {
  id: number
  name: string
  email: string
}

export interface Post {
  id: number
  title: string
  content: string
  authorId: number
  author?: User
}

// utils/type-guards.ts - 类型守卫工具
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNotNull<T>(value: T | null): value is T {
  return value !== null
}

// hooks/useTypedSelector.ts - 类型化的 Redux selector
import { TypedUseSelectorHook, useSelector } from 'react-redux'
import type { RootState } from '../store'

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector
```

## 7. 调试 TypeScript 类型

### 类型调试工具

```typescript
// 显示类型的实际结构
type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type Complex = Prettify<Pick<User, 'name' | 'email'> & { age: number }>
// 鼠标悬停会显示: { name: string; email: string; age: number }

// 检查两个类型是否相等
type Equals<X, Y> = 
  (<T>() => T extends X ? 1 : 2) extends 
  (<T>() => T extends Y ? 1 : 2) ? true : false

type Test = Equals<string, string> // true
type Test2 = Equals<string, number> // false
```

### 常见错误处理

```typescript
// 处理可能为 undefined 的值
function processUser(user: User | undefined) {
  // 使用可选链
  console.log(user?.name)
  
  // 使用空值合并
  const name = user?.name ?? 'Anonymous'
  
  // 使用类型断言（确定不为空时）
  const definitelyUser = user!
  
  // 使用类型守卫
  if (user) {
    console.log(user.name) // 这里 user 不为 undefined
  }
}
```

## 结论

TypeScript 的类型系统非常强大，掌握这些技巧可以让你：

1. **写出更安全的代码** - 编译时捕获错误
2. **提高开发效率** - 更好的 IDE 支持和自动完成
3. **改善代码可维护性** - 清晰的类型契约
4. **增强团队协作** - 类型作为文档

记住，类型系统的目标是帮助开发，而不是阻碍开发。在复杂度和实用性之间找到平衡是关键。

---

*继续学习 TypeScript，让类型系统成为你的好朋友！* 🎯