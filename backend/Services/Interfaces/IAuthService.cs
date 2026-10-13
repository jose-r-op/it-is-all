using ItIsAll.Api.DTOs.Auth;

namespace ItIsAll.Api.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> GetProfileAsync(int userId);
}
