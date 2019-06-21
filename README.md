<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://docs.nestjs.com/assets/logo_text.svg" alt="NestJS Logo" />   </a>
</p>

<p align="center">Rate Limiter Module for NestJS</p>

<p align="center">
<a href="https://www.npmjs.com/package/nestjs-rate-limiter"><img src="https://img.shields.io/npm/v/nestjs-rate-limiter.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/nestjs-rate-limiter"><img src="https://img.shields.io/npm/l/nestjs-rate-limiter.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/nestjs-rate-limiter"><img src="https://img.shields.io/npm/dm/nestjs-rate-limiter.svg" alt="NPM Downloads" /></a>
</p>

## Description

nestjs-rate-limiter is a module which adds in configurable rate limiting for
[NestJS](https://github.com/nestjs/nest) applications.

Under the hood it uses
[rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible).

## Installation

```bash
npm i --save nestjs-rate-limiter
```

Or if you use Yarn:

```bash
yarn add nestjs-rate-limiter
```

### Requirements

nestjs-rate-limiter is built to work with NestJS 6.x versions.

## Usage

### Include Module

First you need to import this module into your main application module:

> app.module.ts

```ts
import { RateLimiterModule } from 'nestjs-rate-limiter';

@Module({
    imports: [RateLimiterModule],
})
export class ApplicationModule {}
```

### Using Interceptor

Now you need to register the interceptor. You can do this only on some routes:

> app.controller.ts

```ts
import { RateLimiterInterceptor } from 'nestjs-rate-limiter';

@UseInterceptors(new RateLimiterInterceptor())
@Get('/login')
public async login() {
    console.log('hello');
}
```

Or you can choose to register the interceptor globally:

> app.module.ts

```ts
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RateLimiterModule, RateLimiterInterceptor } from 'nestjs-rate-limiter';

@Module({
    imports: [RateLimiterModule],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useValue: new RateLimiterInterceptor(),
        },
    ],
})
export class ApplicationModule {}
```

### Decorator

You can use the `@RateLimit` decorator to specify the points and duration for rate limiting on a per
controller or per route basis:

> app.controller.ts

```ts
import { RateLimit } from 'nestjs-rate-limiter';

@RateLimit({ points: 1, duration: 60 })
@Get('/signup')
public async signUp() {
    console.log('hello');
}
```

The above example would rate limit the `/signup` route to 1 request every 60 seconds.

Note that when passing in options via the decorator, it will combine the options for the module
(defined via `RateLimiterModule.register` or the default ones) along with the decorator options.

Also note that if the `keyPrefix` is already in use, it will not update any options, only reuse the
existing rate limiter object when it was last instantiated. This should be fine with the decorators,
unless you manually specify a duplicate `keyPrefix` or reuse the same class and method names with
the decorator.

## Configuration

By default, the rate limiter will limit requests to 4 requests per 1 second window, using an
in memory cache.

To change the settings for `nestjs-rate-limiter`, you can define a `RateLimiterModuleOptions` object
when registering the module:

> app.module.ts

```ts
@Module({
    imports: [
        RateLimiterModule.register({
            points: 100,
            duration: 60,
            keyPrefix: 'global',
        }),
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: RateLimiterInterceptor,
        },
    ],
})
export class ApplicationModule {}
```

The above example would rate limit the `/login` route to 1 request every 1 second using an im memory
cache.

When defining your options, you can pass through any options supported by `rate-limiter-flexible` in order to setup any
config needed. For a full list see <https://github.com/animir/node-rate-limiter-flexible/wiki/Options>.

The main important options (and the ones used solely by this library) are below.

### type: string

This is the type of rate limiter that the underlying `rate-limiter-flexible` library will use to
keep track of the requests made by users.

Valid values for this library are:

-   [Memory](https://github.com/animir/node-rate-limiter-flexible/wiki/Memory)
-   [Redis](https://github.com/animir/node-rate-limiter-flexible/wiki/Redis)
-   [Memcached](https://github.com/animir/node-rate-limiter-flexible/wiki/Memcached)
-   [Postgres](https://github.com/animir/node-rate-limiter-flexible/wiki/Postgres)
-   [MySQL](https://github.com/animir/node-rate-limiter-flexible/wiki/MySQL)

There are option options that the `rate-limiter-flexible` library supports, but aren't implemented
within this library yet. Feel free to submit a PR adding support for those.

### points: number

This is the number of 'points' the user will be given per period. You can think of points as simply
the number of requests that a user can make in a set period.

The underlying library allows consuming a set amount of points per action, for instance maybe some
actions a user can take, might be more resource intensive, and therefor take up more 'points'.

By default we assume all requests consume 1 point. But this can be set using the `pointsConsumed`
configuration option or via the `@RateLimit` decorator.

### pointsConsumed: number

As mentioned above, you can consume more than 1 point per invocation of the rate limiter.

By default this library is set to consume 1 point.

For instance if you have a limit of 100 points per 60 seconds, and `pointsConsumed` is set to 10,
the user will effectively be able to make 10 requests per 60 seconds.

### duration: number

This is the duration that the rate limiter will enforce the limit of `points` for.

This is defined in seconds, so a value of 60 will be 60 seconds.

### keyPrefix: string

This defines the prefix used for all storage methods listed in the `type` option.

This can be used to define different rate limiting rules to different routes/controllers.

When setting up `nestjs-rate-limiter`, you should make sure that any `keyPrefix` values are unique.
If they are not unique, then they will share the same rate limit.

By default, if you don't set this up, the underlying library will use a `keyPrefix` of `rlflx`.
When using the `@RateLimit` decorator, the controller name and route name will be used.

For instance if you have the decorator on a controller, the `keyPrefix` will be the controllers
name. If used on a route, it will be a combination of the controllers name and the route functions
name.
