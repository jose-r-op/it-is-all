using System.ComponentModel.DataAnnotations;

namespace ItIsAll.Api.DTOs.Auth;

public class RegisterDto
{
    [Required(ErrorMessage = "El nombre completo es obligatorio")]
    [StringLength(100, MinimumLength = 3)]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es obligatorio")]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener mínimo 6 caracteres")]
    public string Password { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }
}
