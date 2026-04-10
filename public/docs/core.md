## CORE MODULE
<br>

### BaseEntity
Base type for entities with a unique identifier:

```csharp
public class Wallet : BaseEntity
{
    public decimal Balance { get; set; }
    ...
}
```

- **`Id`** — `Guid`, set automatically (e.g. `Guid.NewGuid()`). No `CreatedAt`/`UpdatedAt` here; use `IAuditable` with auditing if you need them.

<br>

### IAuditable and auditing

For creation and update timestamps, implement `IAuditable`:

```csharp
public class Wallet : BaseEntity, IAuditable
{
    public decimal Balance { get; set; }
    ...
}
```

When `UseAuditing()` is enabled and the context uses `EnableAuditing(serviceProvider)`, `AuditInterceptor` sets `CreatedAt` and `UpdatedAt` on add/update. Time is provided by `ISystemClock` (default: `SystemClock`).

<br>

### BaseException and ErrorResponse

<br>

**BaseException** is the abstract base for domain exceptions. It now provides:

- Multiple constructors: accept a single message, a list of messages, and/or an inner exception for error chaining.
- Error messages are stored as an `IReadOnlyList<string>` and exposed via `GetErrorMessages()`.
- Subclasses must implement:
  - `GetStatusCode()` — HTTP status code for the response.
  - Optionally override `GetErrorMessages()` if custom logic is needed.

<br>

**Constructors:**

- `BaseException(string message)`
- `BaseException(string message, Exception innerException)`
- `BaseException(IEnumerable<string> messages)`
- `BaseException(IEnumerable<string> messages, Exception innerException)`

<br>

**Built-in types:**

- `UnauthorizedException` — 401.
- `ForbiddenException` — 403.
- `ValidationException` — 400, accepts a list of validation messages.

<br>

**Example:**

```csharp
public class InsufficientFundsException : BaseException
{
    public InsufficientFundsException() : base("Insufficient funds for this operation.") { }

    public override HttpStatusCode GetStatusCode() => HttpStatusCode.Forbidden;
}

// For multiple messages:
public class CustomValidationException : BaseException
{
    public CustomValidationException(IEnumerable<string> errors) : base(errors) { }
    public override HttpStatusCode GetStatusCode() => HttpStatusCode.BadRequest;
}
```

<br>

**ErrorResponse** is the standard body for error responses:

- Constructors: `ErrorResponse(IEnumerable<string>)`, `ErrorResponse(string)`, `ErrorResponse(Exception)`.
- Properties: `ErrorMessages` (read-only list), `TokenIsExpired` (optional; set to `true` for expired JWT responses).

Use it in exception handling middleware or filters:

```csharp
if (context.Exception is BaseException baseEx)
{
    context.HttpContext.Response.StatusCode = (int)baseEx.GetStatusCode();
    context.Result = new ObjectResult(new ErrorResponse(baseEx.GetErrorMessages()));
}
```

For expired tokens you can set `TokenIsExpired = true` on the `ErrorResponse` so clients can handle re-login.

<br>

### IRepository&lt;T&gt;

Generic interface for data access:

| Method | Description |
|--------|-------------|
| `GetAllAsync(query?, pageSize, pageNumber, tracked)` | List of entities. Optional `query` to filter/include/order. `pageSize = 0` disables pagination. |
| `GetAsync(query?, tracked)` | Single entity or `null`. |
| `CreateAsync(entity)` | Adds the entity. |
| `Update(entity)` | Marks the entity as modified. |
| `Delete(entity)` | Marks the entity for deletion. |

`query` is a `Func<IQueryable<T>, IQueryable<T>>`. Avoid client-side evaluation and early materialization (e.g. `ToList()`) inside it so the query runs on the server.
<br>
Example:

```csharp
public interface IWalletRepository : IRepository<Wallet>
{
    Task<bool> WalletBelongsToUser(Guid walletId, Guid userId);
}

public class WalletRepository(AppDbContext db) : Repository<Wallet>(db), IWalletRepository
{
    public async Task<bool> WalletBelongsToUser(Guid walletId, Guid userId) => ...
}
```

<br>

### IUnitOfWork

Groups changes and persists them in one place. Valet repositories do not call `SaveChanges`; you commit via `IUnitOfWork`.

| Method | Description |
|--------|-------------|
| `BeginTransactionAsync(cancellationToken)` | Starts a transaction (scope until commit/rollback). |
| `CommitAsync(cancellationToken)` | Commits the current transaction (or context default if no explicit transaction). |
| `RollbackAsync(cancellationToken)` | Rolls back the current transaction. |
| `SaveChangesAsync(cancellationToken)` | Saves changes without managing a transaction (delegates to the context). |

Example:

```csharp
// Simple example (withouth transaction managment)
user.AddUserRole(new UserRole(user, role));
await _userRepository.CreateAsync(user);
        
await _unitOfWork.SaveChangesAsync();
```

```csharp
// Example with transaction managment
await unitOfWork.BeginTransactionAsync();

try
{
  user.AddUserRole(new UserRole(user, role));
  await _userRepository.CreateAsync(user);
  // ... other operations

  await _unitOfWork.CommitAsync();
}
catch
{
  await _unitOfWork.RollbackAsync();
  throw;
}        
```



<br>

## Patterns

<br>

### ISignature

Marker interface for request/signature DTOs used with the signature pattern and use cases. No members.

<br>

### Signature&lt;TSignature, TValidator&gt;

Base type for validated request objects using FluentValidation:

- `TSignature` — The DTO type (self-referencing generic).
- `TValidator` — An `AbstractValidator<TSignature>`.

Call `Validate()` on the instance; it runs the validator and throws `ValidationException` with the validator’s error messages on failure.

<br>
Example:

```csharp
public class CreateWalletSignature : Signature<CreateWalletSignature, CreateWalletValidator>
{
    public decimal InitialBalance { get; set; }
    public Guid UserId { get; set; }
}

public class CreateWalletValidator : AbstractValidator<CreateWalletSignature>
{
    public CreateWalletRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.InitialBalance).GreaterThanOrEqualTo(0);
    }
}
```

<br>

### Use cases (Command and Query)

<br>

| Use Case Type                | Request Type             | Return Type      | Description                        |
|------------------------------|-------------------------|------------------|-------------------------------------|
| `Command<TRequest, TResponse>` | Implements `ISignature` | `TResponse`      | State-changing operation            |
| `Command<TRequest>`            | Implements `ISignature` | None             | State-changing, no return value     |
| `Query<TResponse>`             | None                    | `TResponse`      | Read-only, no request               |
| `Query<TRequest, TResponse>`   | Implements `ISignature` | `TResponse`      | Read-only with request              |

Implement Execute/Execute(TRequest) and register any use case with AddUseCasesFrom<T>(), so Valet discovers and registers all others in the same assembly in DI.

<br>

**Examples:**

```csharp
// Command example
public class CreateWalletUseCase : Command<CreateWalletSignature, Guid>
{
    public override async Task<Guid> Execute(CreateWalletSignature signature)
    {
        signature.Validate();
        var wallet = new Wallet { UserId = signature.UserId, Balance = signature.InitialBalance };
        await _repo.CreateAsync(wallet);
        await _uow.SaveChangesAsync();
        return wallet.Id;
    }
}
```

```csharp
// Query example
public class GetWalletByIdUseCase : Query<Guid, Wallet?>
{
    public override async Task<Wallet?> Execute(Guid walletId) => await _repo.GetAsync(q => q.Where(w => w.Id == walletId));
}
```
