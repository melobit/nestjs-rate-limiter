import { Provider } from '@nestjs/common';
import { IRateLimiterOptions } from 'rate-limiter-flexible';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface RateLimiterModuleOptions extends IRateLimiterOptions {
    type?: string;
    pointsConsumed?: number;
}

export interface RateLimiterOptionsFactory {
    createRateLimiterOptions(): Promise<RateLimiterModuleOptions> | RateLimiterModuleOptions;
}

export interface RateLimiterModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<RateLimiterOptionsFactory>;
    useClass?: Type<RateLimiterOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<RateLimiterModuleOptions> | RateLimiterModuleOptions;
    inject?: any[];
    extraProviders?: Provider[];
}
