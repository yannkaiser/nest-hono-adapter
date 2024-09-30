<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

**This package is WIP, and some features may be missing.**

A [Hono](https://honojs.com) adapter for the [Nest](https://nestjs.com) framework.

## Currently tested features

- [x] CORS
- [x] Text body parsing
- [x] JSON body parsing
- [ ] ArrayBuffer body parsing
- [ ] Blob body parsing
- [ ] FormData body parsing / use `parseBody`
- [x] Guards
- [ ] Interceptors
- [ ] Request body validation
- [x] Exception handling
- [ ] Middleware factory
- [ ] Versioning
- [ ] Static assets
- [ ] View engine (this exists in the AbstractHttpAdapter, but there is no notion of view engine in Hono. Instead, it would need to be tested using `hono/html`)
- [ ] Host filtering
- [ ] Redirection
- [ ] Parser middleware (partially implemented)
- [ ] Hono Presets

*This list may not be up-to-date. Some features may work but it is not considered "done" unless tests verify that feature explicitly.*

## Installation

```bash
$ pnpm install
```

## Test

```bash
# unit tests
$ pnpm run test

# test coverage
$ pnpm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - Yann KAISER
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

This package is [MIT licensed](LICENSE).
