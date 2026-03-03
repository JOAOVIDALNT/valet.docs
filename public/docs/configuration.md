## Configuration

### Registering Valet

Configure Valet in your application startup (e.g. `Program.cs`):

```csharp
builder.Services.AddValet<AppDbContext>(builder.Configuration, options =>
{
    options.UseAuth();           // Auth repositories, password hasher, JWT
    options.UseSwaggerGen();     // Swagger with JWT Bearer support
    options.UseAuditing();       // CreatedAt/UpdatedAt via AuditInterceptor
    options.AddUseCasesFrom<SomeUseCase>();  // Register use cases from an assembly
});
```

- **`AddValet<TContext>`** — Registers Valet services. `TContext` must inherit from `AuthDbContext`.
- **`configuration`** — Required when `UseAuth()` is enabled (for JWT settings). Can be `null` otherwise.
- **`configure`** — Optional delegate to enable features via `ValetOptions`. Only enabled features are registered.

### ValetOptions

| Method | Description |
|--------|-------------|
| `UseAuth()` | Enables authentication: user/role/user-role repositories, password hasher, JWT services. Requires `IConfiguration` when used. |
| `UseSwaggerGen()` | Enables Swagger with JWT Bearer security definition. |
| `UseAuditing()` | Registers the default `AuditInterceptor` for `IAuditable` entities. |
| `AddUseCasesFrom<T>()` | Scans the assembly containing `T` for Command/Query use cases and registers them in DI. |

Omitted options mean the corresponding feature is not registered.

### DbContext setup

Your context must inherit from `AuthDbContext`:

```csharp
public class AppDbContext(DbContextOptions options) : AuthDbContext(options)
{
    public DbSet<Wallet> Wallets { get; set; }
    public DbSet<Transaction> Transactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
```

Calling `base.OnModelCreating` applies Valet’s entity configurations. Add your own configurations or use `ApplyConfigurationsFromAssembly` for your assembly.

### Enabling auditing on DbContext

When using `UseAuditing()`, add the Valet auditing interceptor to your context options:

```csharp
// e.g. when building options with AddDbContext
builder.Services.AddDbContext<AppDbContext>((serviceProvider, options) =>
{
    options.UseSqlServer(connectionString)
           .EnableAuditing(serviceProvider);
});
```

`EnableAuditing` applies all registered `IValetAuditInterceptor` instances (including the default `AuditInterceptor` when `UseAuditing()` is used).

### Extending the User entity

You can extend `User` for your application:

```csharp
public class LocalUser : User
{
    public string Email { get; set; }
    public int Age { get; set; }
}

// In your DbContext
public DbSet<LocalUser> LocalUsers { get; set; }
```

---
