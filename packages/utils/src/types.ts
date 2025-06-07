/**
 * Matches any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).
 */
export type Primitive = null | undefined | string | number | boolean | bigint

export type Satisfies<U, T extends U> = T

export type OmitStrict<T, K extends keyof T> = Omit<T, K>

export type OverrideStrict<
  Type,
  NewType extends {
    [Key in keyof Type]?: unknown
  },
> = Omit<Type, keyof NewType> & NewType

export type Status = "error" | "idle" | "pending" | "success"
