using ItIsAll.Api.Models.Enums;

namespace ItIsAll.Api.Models.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Customer;
    public string? AvatarUrl { get; set; }
    public string? PhoneNumber { get; set; }

    public bool IsAdmin => Role == UserRole.Admin;
}
