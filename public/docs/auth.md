## AUTH MODULE

<br>

### Entities

| Entity      | Properties / Description                                                                                                   | Methods                                      |
|-------------|----------------------------------------------------------------------------------------------------------------------------|----------------------------------------------|
| **User**    | `Username`, `Password`, `UserRoles`<br>Extend for your app (e.g. `LocalUser`)                                              | `UpdateUsername`, `UpdatePassword`, `AddUserRole`, `RemoveUserRole` |
| **Role**    | `Name`<br>Name length 3–30 characters                                                                                      | `UpdateName`, `AddUserRole`, `RemoveUserRole`|
| **UserRole**| Many-to-many between `User` and `Role`<br>`UserId`, `RoleId`, navigation properties                                        | —                                            |

<br>

### AuthDbContext

Pre-configured context with `DbSet<User>`, `DbSet<Role>`, `DbSet<UserRole>` and Valet’s entity configurations. Override `OnModelCreating`, call `base.OnModelCreating`, and apply your own configurations.

<br>

### Repositories

| Repository            | Methods & Description                                                                                 | Extends                |
|-----------------------|------------------------------------------------------------------------------------------------------|------------------------|
| **IUserRepository**   | `UserExistsAsync(string username)`<br>`UserExistsAsync(Guid identifier)`<br>`GetUserWithRolesAsync(string username)` (user with roles loaded) | `IRepository<User>`    |
| **IRoleRepository**   | `RoleExistsAsync(string name)`<br>`EnsureRoleExistsAsync(string name)` (get or create; tracked)        | `IRepository<Role>`    |
| **IUserRoleRepository** | Standard CRUD                                                                                        | `IRepository<UserRole>`|

<br>

### IPasswordHasher

| Method                | Description                        |
|-----------------------|------------------------------------|
| `HashPassword(string)`| Hashes a plain password (BCrypt)   |
| `VerifyPassword(string input, string hash)` | Verifies input password against stored hash |


```csharp
string hash = _hasher.HashPassword("plainPassword");
bool valid = _hasher.VerifyPassword("inputPassword", storedHash);
```

<br>

### ITokenGenerator and ITokenValidator

| Interface         | Method & Description                                                                                 |
|-------------------|-----------------------------------------------------------------------------------------------------|
| **ITokenGenerator** | `GenerateToken(User user)` — Builds a JWT with user id and role claims (from `User.UserRoles`), signed and with configurable expiration. |
| **ITokenValidator** | `ValidateAndGetUserIdentifier(string token)` — Validates the token and returns the user identifier from claims. |

<br>

Login example:

```csharp
signature.Validate();
        
var user = await _userRepository.GetAsync(q => q.Where(x => x.Username == signature.Email));

if (user == null || !_hasher.VerifyPassword(signature.Password, user.Password))
    throw new UnauthorizedException("Invalid credentials.");

var token = _tokenGenerator.GenerateToken(user);
return new LoginResponse(token);
```

<br>

Registering example:

```csharp
signature.Validate();
        
var user = new LocalUser(signature.FirstName, signature.LastName, signature.Email, signature.Password);
        
user.UpdatePassword(_hasher.HashPassword(signature.Password));

var role = await _roleRepository.EnsureRoleExistsAsync("user");
        
await _unitOfWork.BeginTransactionAsync();

user.AddUserRole(new UserRole(user, role));
await _userRepository.CreateAsync(user);
        
await _unitOfWork.CommitAsync();
```

<br>

### ValidateUserAttribute

Use on controllers or actions to require a valid JWT and optionally specific roles:

```csharp
[ValidateUser]                    // Any authenticated user
[ValidateUser("admin")]            // User must have role "admin"
[ValidateUser("admin,manager")]   // Comma-separated roles
```

The filter validates the Bearer token, ensures the user exists, and optionally checks that the user has one of the given roles. On expired token it returns 401 with an `ErrorResponse` where `TokenIsExpired` can be set. For `BaseException` it uses `GetStatusCode()` and `GetErrorMessages()` for the response.
