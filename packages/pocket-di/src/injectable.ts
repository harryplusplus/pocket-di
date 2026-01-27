/**
 * @file Injectable type defines types that can be used in the container
 * undefined and null values cannot be used as injectable types
 */

export type Injectable = NonNullable<unknown>
