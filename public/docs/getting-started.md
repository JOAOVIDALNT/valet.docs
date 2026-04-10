# VALET

<br>

Valet is a lightweight .NET library that streamlines setup and configuration for typical line-of-business applications. Instead of wiring repositories, unit of work, authentication, and auditing from scratch in each project, you enable only the features you need through a single registration point and get consistent, testable infrastructure that follows common .NET patterns.

<br>

The library is built around Entity Framework Core: your DbContext inherits from Valet’s auth-aware context, and you get a generic repository plus a unit of work that never auto-commits, so you keep full control over transaction boundaries. For authentication, Valet provides user/role entities, BCrypt password hashing, JWT generation and validation, and an attribute to protect controllers or actions by user and role. Optional auditing fills `CreatedAt` and `UpdatedAt` on your entities; optional use-case support lets you register Commands and Queries by assembly. Exceptions and error responses are structured so you can map them cleanly to HTTP status codes and API error payloads.

<br>

Whether you are starting a new API or refactoring an existing one, Valet reduces boilerplate, enforces clear separation of concerns, and stays out of the way when you extend or replace its pieces.

<br>

---

<br>

## Architecture overview

<br>

#### Valet is organized into modules:

<br>

- **Config** — Registration and options (`AddValet`, `ValetOptions`).
- **Core** — Generic repository, unit of work, base entity, exceptions, signature/use-case patterns, auditing.
- **Auth** — User/Role/UserRole entities, `AuthDbContext`, auth repositories, password hashing, JWT generation/validation, and the `[ValidateUser]` attribute.

