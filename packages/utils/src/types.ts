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

export type PartialDeep<T> = T extends object
  ? {
      [P in keyof T]?: PartialDeep<T[P]>
    }
  : T

export type Status = "error" | "idle" | "pending" | "success"

/**
 * Allows creating a union type by combining primitive types and literal types without sacrificing auto-completion in IDEs for the literal type part of the union.
 *
 * @see https://github.com/Microsoft/TypeScript/issues/29729
 *
 * @example
  ```
  // Before
  type Pet = 'dog' | 'cat' | string;

  // After
  type Pet2 = LiteralUnion<'dog' | 'cat', string>;
  ```
 */
export type LiteralUnion<LiteralType, BaseType extends Primitive> =
  | LiteralType
  | (BaseType & Record<never, never>)
