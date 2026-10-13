using System.ComponentModel.DataAnnotations;
using ItIsAll.Api.Models.Enums;
using Microsoft.AspNetCore.Http;

namespace ItIsAll.Api.DTOs.Products;

public class CreateProductDto
{
    [Required(ErrorMessage = "El nombre del producto es obligatorio")]
    [StringLength(200, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "La descripción es obligatoria")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "El precio es obligatorio")]
    [Range(0.01, 100000000, ErrorMessage = "El precio debe ser mayor a 0")]
    public decimal Price { get; set; }

    public decimal? CompareAtPrice { get; set; }

    [Range(0, 10000)]
    public int Stock { get; set; } = 1;

    [Required(ErrorMessage = "La categoría es obligatoria")]
    public int CategoryId { get; set; }

    public ProductOrigin Origin { get; set; } = ProductOrigin.ItIsAll;
    public ProductCondition Condition { get; set; } = ProductCondition.NewWithTags;
    public string Brand { get; set; } = "It Is All";

    public string Sizes { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public bool IsFeatured { get; set; } = false;

    // Puede recibir imágenes directamente como URLs o como archivos subidos
    public List<string>? ImageUrls { get; set; }
    public List<IFormFile>? Files { get; set; }
}
