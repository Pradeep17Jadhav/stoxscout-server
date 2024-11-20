declare global {
    interface JwtPayload {
        username: string;
    }

    namespace Express {
        interface Request {
            user?: string;
        }
    }
}

declare namespace NodeJS {
    interface ProcessEnv {
        JWT_SECRET: string;
        [key: string]: string | undefined;
    }
}

export {};
