import {Request} from 'express';

export type TypedRequest<T> = Request<object, object, T>;
