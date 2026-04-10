## FAQs

<br>

**Why isn’t my token being generated?**  
Ensure JWT is configured under `Settings:Jwt:Secret` and `Settings:Jwt:ExpirationMinutes` in your configuration, and that `UseAuth()` is called when registering Valet.

<br>

**Can I override the User entity?**  
Yes. Create a class that inherits from `User`, add your properties, and expose it in your DbContext (e.g. `DbSet<LocalUser>`).

<br>

**Can I use Valet without Entity Framework?**  
The built-in repository and unit of work are EF-based. You can implement your own `IRepository<T>` and `IUnitOfWork` against another storage if needed.

<br>

**What if I forget to call CommitAsync / SaveChangesAsync?**  
Changes will not be persisted. Always call `CommitAsync()` or `SaveChangesAsync()` on `IUnitOfWork` after modifying data through repositories.

<br>

**How are use cases registered?**  
Call `options.AddUseCasesFrom<T>()` with any type in the assembly that contains your Command/Query classes. Valet will discover and register those use cases in DI.

<br>

**How do I enable auditing?**  
Call `options.UseAuditing()` in `AddValet` and use `optionsBuilder.EnableAuditing(serviceProvider)` when building your `DbContext` options so the audit interceptor is applied.
