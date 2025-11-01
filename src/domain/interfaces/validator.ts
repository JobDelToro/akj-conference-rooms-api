export interface IValidationResult<T> {
  errors?: string[]
  value: T
}

export default interface IValidator<T> {
  validate(body: Partial<T>): IValidationResult<T>
}