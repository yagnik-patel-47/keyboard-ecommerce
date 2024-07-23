import { customAlphabet } from 'nanoid';

export function createId(length = 16) {
	return customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', length)();
}
