using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ItIsAll.Api.Data;
using ItIsAll.Api.DTOs.Auth;
using ItIsAll.Api.Models.Entities;
using ItIsAll.Api.Models.Enums;
using ItIsAll.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ItIsAll.Api.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Credenciales incorrectas (correo o contraseña inválidos).");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Esta cuenta se encuentra inactiva.");
        }

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var emailExists = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());

        if (emailExists)
        {
            throw new InvalidOperationException("El correo electrónico ya se encuentra registrado.");
        }

        var newUser = new User
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            PhoneNumber = dto.PhoneNumber,
            Role = UserRole.Customer, // Por defecto rol cliente
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(newUser);
        await _context.SaveChangesAsync();

        return GenerateAuthResponse(newUser);
    }

    public async Task<AuthResponseDto> GetProfileAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("Usuario no encontrado.");
        }

        return GenerateAuthResponse(user);
    }

    private AuthResponseDto GenerateAuthResponse(User user)
    {
        var jwtSecret = _config["Jwt:Key"] ?? "ItIsAll_Super_Secret_Key_For_Jwt_Token_Generation_2026!";
        var issuer = _config["Jwt:Issuer"] ?? "ItIsAll.Api";
        var audience = _config["Jwt:Audience"] ?? "ItIsAll.Client";
        var expiresDays = int.TryParse(_config["Jwt:ExpiresInDays"], out var days) ? days : 7;
        var expiresAt = DateTime.UtcNow.AddDays(expiresDays);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return new AuthResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            Token = tokenHandler.WriteToken(token),
            ExpiresAt = expiresAt
        };
    }
}
