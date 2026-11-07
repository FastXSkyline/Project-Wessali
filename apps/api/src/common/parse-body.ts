import { BadRequestException } from '@nestjs/common';

type ValidationIssue = { path: PropertyKey[]; message: string };
type SafeParseSchema<T> = {
  safeParse(input: unknown):
    | { success: true; data: T }
    | { success: false; error: { issues: ValidationIssue[] } };
};

export function parseBody<T>(schema: SafeParseSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
      .join('; ');
    throw new BadRequestException(message);
  }
  return result.data;
}
