## API REFERENCE (main types)

| Type | Description |
|------|-------------|
| **Config** | |
| `ValetConfig` | Extension methods: `AddValet<TContext>`, `EnableAuditing`. |
| `ValetOptions` | Fluent options: `UseAuth`, `UseSwaggerGen`, `UseAuditing`, `AddUseCasesFrom<T>`. |
| **Core – Domain** | |
| `BaseEntity` | Base entity with `Id` (Guid). |
| `IRepository<T>` | Generic repository: GetAllAsync, GetAsync, CreateAsync, Update, Delete. |
| `IUnitOfWork` | BeginTransactionAsync, CommitAsync, RollbackAsync, SaveChangesAsync. |
| `IAuditable` | CreatedAt, UpdatedAt. |
| `ISignature` | Marker for request DTOs. |
| `ISystemClock` | UtcNow, Now. |
| **Core – Exception** | |
| `BaseException` | Base for domain exceptions; GetErrorMessages, GetStatusCode. |
| `ErrorResponse` | ErrorMessages, TokenIsExpired; constructors from messages or Exception. |
| `UnauthorizedException`, `ForbiddenException`, `ValidationException` | Built-in exceptions. |
| **Core – Patterns** | |
| `Signature<TSignature, TValidator>` | Validatable request with FluentValidation; Validate(). |
| `Command<TRequest, TResponse>`, `Command<TRequest>` | Command use cases. |
| `Query<TResponse>`, `Query<TRequest, TResponse>` | Query use cases. |
| **Auth** | |
| `User`, `Role`, `UserRole` | Auth entities. |
| `AuthDbContext` | EF Core context for auth entities. |
| `IUserRepository`, `IRoleRepository`, `IUserRoleRepository` | Auth repositories. |
| `IPasswordHasher` | HashPassword, VerifyPassword. |
| `ITokenGenerator` | GenerateToken(User). |
| `ITokenValidator` | ValidateAndGetUserIdentifier(token). |
| `ValidateUserAttribute` | Attribute for JWT + optional role validation. |
